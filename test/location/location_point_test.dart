import 'package:flutter_test/flutter_test.dart';
import 'package:lingo_legacy/features/location/models/location_point.dart';

void main() {
  group('LocationPoint', () {
    test('accepts valid latitude and longitude', () {
      final point = LocationPoint(
        latitude: 39.9526,
        longitude: -75.1636,
        capturedAt: DateTime.utc(2026, 11, 6),
        accuracyMeters: 12,
      );

      expect(point.hasValidCoordinates, isTrue);
      expect(point.hasValidAccuracy, isTrue);
      expect(point.validate, returnsNormally);
    });

    test('rejects latitude outside the valid range', () {
      final point = LocationPoint(
        latitude: 91,
        longitude: 0,
        capturedAt: DateTime.utc(2026, 11, 6),
      );

      expect(point.validate, throwsArgumentError);
    });

    test('rejects non-finite coordinates and accuracy', () {
      final invalidCoordinates = LocationPoint(
        latitude: double.nan,
        longitude: 0,
        capturedAt: DateTime.utc(2026, 11, 6),
      );
      final invalidAccuracy = LocationPoint(
        latitude: 0,
        longitude: 0,
        capturedAt: DateTime.utc(2026, 11, 6),
        accuracyMeters: double.infinity,
      );

      expect(invalidCoordinates.validate, throwsArgumentError);
      expect(invalidAccuracy.validate, throwsArgumentError);
    });
  });
}
