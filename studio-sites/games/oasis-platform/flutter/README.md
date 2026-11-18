# Doughboys Oasis Flutter starter

This Flutter package is a local, non-cash-value game-client starter for the Oasis Exchange concept.

## Current behavior

- DOUGH is session-local virtual game currency only.
- Catalog purchases update in-memory state only; no real payment, deposit, or cash-out path exists.
- Location is optional and foreground-only. Coordinates remain in memory and are not sent to the game backend.
- Map tiles are loaded from OpenStreetMap and require network access; the tile provider can infer the viewed map area from requests.
- Backend, account, payment, and production release integrations remain disabled until their separate acceptance gates are met.

## Local validation

From this directory:

```sh
flutter pub get
flutter analyze lib
flutter test --reporter expanded
```

The recovery preview uses Flutter 3.50.0 and runs these checks as a separate subproject after the flagship Flutter app checks.
