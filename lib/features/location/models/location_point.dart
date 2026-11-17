/// A single foreground location sample. This model is not a location-history record.
class LocationPoint {
  const LocationPoint({
    required this.latitude,
    required this.longitude,
    required this.capturedAt,
    this.accuracyMeters,
  });

  final double latitude;
  final double longitude;
  final DateTime capturedAt;
  final double? accuracyMeters;

  bool get hasValidCoordinates =>
      latitude.isFinite &&
      longitude.isFinite &&
      latitude >= -90 &&
      latitude <= 90 &&
      longitude >= -180 &&
      longitude <= 180;

  bool get hasValidAccuracy =>
      accuracyMeters == null ||
      (accuracyMeters!.isFinite && accuracyMeters! >= 0);

  void validate() {
    if (!hasValidCoordinates) {
      throw ArgumentError('Latitude or longitude is outside the valid range.');
    }
    if (!hasValidAccuracy) {
      throw ArgumentError('Accuracy must be a finite, non-negative value.');
    }
  }
}
