import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

import '../models/saved_location_marker.dart';

/// Firestore repository for private, per-user saved map pins.
/// It intentionally does not expose public or live-location sharing.
class MarkerRepository {
  MarkerRepository({
    FirebaseAuth? auth,
    FirebaseFirestore? firestore,
  })  : _auth = auth ?? FirebaseAuth.instance,
        _firestore = firestore ?? FirebaseFirestore.instance;

  final FirebaseAuth _auth;
  final FirebaseFirestore _firestore;

  String get _uid {
    final user = _auth.currentUser;
    if (user == null) {
      throw StateError('Sign in is required to access saved locations.');
    }
    return user.uid;
  }

  CollectionReference<Map<String, dynamic>> get _markers =>
      _firestore.collection('users').doc(_uid).collection('saved_locations');

  Stream<List<SavedLocationMarker>> watchSavedMarkers() {
    return _markers
        .orderBy('updatedAt', descending: true)
        .snapshots()
        .map((snapshot) => snapshot.docs
            .map(SavedLocationMarker.fromFirestore)
            .toList(growable: false));
  }

  Future<String> saveMarker(SavedLocationMarker marker) async {
    marker.validate();
    final document = _markers.doc();
    await document.set(marker.toFirestoreCreate());
    return document.id;
  }

  Future<void> updateMarker(SavedLocationMarker marker) async {
    if (marker.id.isEmpty) {
      throw ArgumentError('A marker ID is required for updates.');
    }
    marker.validate();
    await _markers.doc(marker.id).update(marker.toFirestoreUpdate());
  }

  Future<void> deleteMarker(String markerId) async {
    if (markerId.trim().isEmpty) {
      throw ArgumentError('A marker ID is required for deletion.');
    }
    await _markers.doc(markerId).delete();
  }
}
