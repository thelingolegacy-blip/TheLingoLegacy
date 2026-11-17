import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/features/location/models/saved_location_marker.dart';

void main() {
  group('SavedLocationMarker', () {
    test('validates and serializes a private saved pin', () {
      const marker = SavedLocationMarker(
        id: 'marker-1',
        name: 'City Hall',
        latitude: 39.9526,
        longitude: -75.1636,
        category: 'landmark',
      );

      expect(marker.validate, returnsNormally);
      final data = marker.toFirestoreCreate();
      expect(data['name'], 'City Hall');
      expect(data['latitude'], 39.9526);
      expect(data['longitude'], -75.1636);
      expect(data['category'], 'landmark');
      expect(data['visibility'], 'private');
      expect(data.containsKey('createdAt'), isTrue);
      expect(data.containsKey('updatedAt'), isTrue);
    });

    test('rejects invalid coordinates and empty names', () {
      const invalidCoordinates = SavedLocationMarker(
        id: 'bad-coordinate',
        name: 'Invalid',
        latitude: 91,
        longitude: 0,
        category: 'pin',
      );
      const invalidName = SavedLocationMarker(
        id: 'bad-name',
        name: ' ',
        latitude: 0,
        longitude: 0,
        category: 'pin',
      );

      expect(invalidCoordinates.validate, throwsArgumentError);
      expect(invalidName.validate, throwsArgumentError);
    });
  });
}
