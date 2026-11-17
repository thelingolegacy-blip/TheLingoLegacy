import '../models/location_point.dart';

enum LocationPermissionState {
  unknown,
  granted,
  denied,
  permanentlyDenied,
  serviceDisabled,
}

/// Adapter boundary for HERE LocationEngine. Implementations must request
/// foreground permission only when the user opens the location feature.
abstract interface class ForegroundLocationProvider {
  Future<LocationPermissionState> checkPermission();

  Future<LocationPermissionState> requestPermission();

  Future<LocationPoint?> getCurrentPosition();

  Stream<LocationPoint> get positionStream;

  /// Starts foreground updates only. Background tracking is not part of release one.
  Future<void> startForegroundUpdates();

  Future<void> stopForegroundUpdates();
}
