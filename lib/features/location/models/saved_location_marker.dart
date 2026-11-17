import 'package:cloud_firestore/cloud_firestore.dart';

/// A user-owned saved pin. The owning UID is represented by the Firestore path:
/// users/{uid}/saved_locations/{markerId}.
class SavedLocationMarker {
  const SavedLocationMarker({
    required this.id,
    required this.name,
    required this.latitude,
    required this.longitude,
    required this.category,
    this.createdAt,
    this.updatedAt,
  });

  final String id;
  final String name;
  final double latitude;
  final double longitude;
  final String category;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  void validate() {
    if (name.trim().isEmpty || name.trim().length > 80) {
      throw ArgumentError('Marker name must contain 1–80 characters.');
    }
    if (!latitude.isFinite ||
        !longitude.isFinite ||
        latitude < -90 ||
        latitude > 90 ||
        longitude < -180 ||
        longitude > 180) {
      throw ArgumentError('Latitude or longitude is outside the valid range.');
    }
    if (category.trim().isEmpty || category.trim().length > 40) {
      throw ArgumentError('Marker category must contain 1–40 characters.');
    }
  }

  Map<String, Object> toFirestoreCreate() {
    validate();
    return {
      'name': name.trim(),
      'latitude': latitude,
      'longitude': longitude,
      'category': category.trim(),
      'visibility': 'private',
      'createdAt': FieldValue.serverTimestamp(),
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  Map<String, Object> toFirestoreUpdate() {
    validate();
    return {
      'name': name.trim(),
      'latitude': latitude,
      'longitude': longitude,
      'category': category.trim(),
      'visibility': 'private',
      'updatedAt': FieldValue.serverTimestamp(),
    };
  }

  factory SavedLocationMarker.fromFirestore(
    QueryDocumentSnapshot<Map<String, dynamic>> document,
  ) {
    final data = document.data();
    final latitude = data['latitude'];
    final longitude = data['longitude'];
    if (latitude is! num || longitude is! num) {
      throw FormatException('Saved marker has invalid coordinates.');
    }

    DateTime? dateFrom(Object? value) =>
        value is Timestamp ? value.toDate() : null;

    final marker = SavedLocationMarker(
      id: document.id,
      name: data['name'] is String ? data['name'] as String : '',
      latitude: latitude.toDouble(),
      longitude: longitude.toDouble(),
      category: data['category'] is String ? data['category'] as String : 'pin',
      createdAt: dateFrom(data['createdAt']),
      updatedAt: dateFrom(data['updatedAt']),
    );
    marker.validate();
    return marker;
  }
}
