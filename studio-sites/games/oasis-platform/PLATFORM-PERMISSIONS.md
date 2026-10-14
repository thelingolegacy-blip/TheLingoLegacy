# Flutter platform permission and map-provider checklist

This is a permission checklist for the isolated Flutter starter; the full generated Android/iOS project is not yet created.

## Android (add to generated `android/app/src/main/AndroidManifest.xml`)
For foreground location only, add:
```xml
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
```
Do not add background-location permissions. Prefer approximate permission when the platform/user allows it. Verify that the app continues when permission is denied or permanently denied.

## iOS (add to generated `ios/Runner/Info.plist`)
Add a concise purpose string:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Use your location only when you choose to center the map on your current area. You can play without location.</string>
```
Do not add always/background location keys.

## Web
The existing HTML store and vertical slice do not call browser geolocation APIs. Flutter Web may trigger the browser permission prompt only after the player explicitly taps **Enable my location**. Test HTTPS/localhost requirements, denial, timeout, revoked permission and unsupported browsers.

## Map provider
The Flutter starter uses OpenStreetMap raster tiles and attribution. Before public launch, review the provider's current tile usage policy, attribution requirements, caching rules, traffic limits and production suitability. Tile requests reveal which map area is being viewed to the tile provider, even when coordinates are not sent to the game backend. Never claim that map usage is invisible to third parties.

## Privacy gates
- No background tracking or location-based advertising.
- Location is optional and not required for core progression, store access or account use.
- Current implementation keeps coordinates in memory only and does not submit them to the game backend.
- Provide an obvious clear-location action and a manual/fictional map fallback.
- Complete platform permission, privacy notice, data-flow and legal review before enabling location-based rewards.
