import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';

/// Produces only tenant/product/resource-scoped references.
/// Firestore rules remain default-deny until server-reviewed policies are deployed.
/// This class intentionally exposes no wallet or balance mutation methods.
class TenantScopedFirestore {
  TenantScopedFirestore({
    FirebaseFirestore? firestore,
    FirebaseAuth? auth,
  }) : _firestore = firestore ?? FirebaseFirestore.instance,
       _auth = auth ?? FirebaseAuth.instance;

  final FirebaseFirestore _firestore;
  final FirebaseAuth _auth;

  CollectionReference<Map<String, dynamic>> resourceCollection({
    required String tenantId,
    required String productId,
    required String resourceType,
  }) {
    final user = _auth.currentUser;
    if (user == null) {
      throw StateError('A signed-in Firebase Authentication session is required.');
    }
    _validateSegment(tenantId, 'tenantId');
    _validateSegment(productId, 'productId');
    _validateSegment(resourceType, 'resourceType');

    return _firestore
        .collection('tenants')
        .doc(tenantId)
        .collection('products')
        .doc(productId)
        .collection(resourceType);
  }

  void _validateSegment(String value, String name) {
    if (value.trim().isEmpty || value.contains('/')) {
      throw ArgumentError.value(value, name, 'Must be a non-empty path segment.');
    }
  }
}
