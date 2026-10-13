# Lingo ⭐️ Legacy — Flutter + Firebase + Cloudflare Roadmap

## Goal
Create a connected ecosystem where:
- the web frontends remain the public studio shell
- a Flutter app powers mobile experiences
- Firebase manages auth and data
- Cloudflare secures and routes the full delivery layer

## 1. Flutter App Skeleton

Recommended folders:

```text
/lib
  /core
    constants.dart
    theme.dart
    routes.dart
  /features
    /home
    /game
    /profile
    /worlds
    /commerce
    /studio
  /services
    auth_service.dart
    firestore_service.dart
    media_service.dart
    analytics_service.dart
  /widgets
    shared_header.dart
    product_card.dart
    world_map.dart
```

### Flutter base principles
- Shared theme matching the Lingo Legacy gold / noir / cyan language
- Mobile-first navigation with product hubs and world map
- Offline-safe shell for static product content
- Full Firebase integration for identity + persistence

## 2. Firebase Setup

### Use these Firebase products
- Authentication
- Cloud Firestore
- Firebase Storage
- Cloud Functions
- Cloud Messaging
- Analytics

### Config file
```dart
import 'package:firebase_core/firebase_core.dart';

Future<void> initializeFirebase() async {
  await Firebase.initializeApp();
}
```

### Security model
- Only signed-in users can access private profiles
- Admin-only access for studio and release controls
- Public reads for non-sensitive product metadata
- Restricted writes for payouts, payouts/commerce flows, and studio operations

## 3. Cloudflare Edge Setup

### Responsibilities
- Edge caching for images and static media
- Route-based site delivery for product surfaces
- DDoS and rate limiting protections
- Worker-based logic for path and hub routing

### Example route behavior
```javascript
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/' || path === '/index.html') {
    return fetch('https://thelingolegacy.com');
  }

  if (path.startsWith('/kottons-code')) {
    return fetch('https://thelingolegacy.com/kottons-code/');
  }

  if (path.startsWith('/loyalty-lane')) {
    return fetch('https://thelingolegacy.com/loyalty-lane-apparel/');
  }

  return fetch(request);
}
```

## 4. Suggested product domains

- `thelingolegacy.com` — ecosystem homepage
- `app.thelingolegacy.com` — mobile web / Flutter web shell
- `studio.thelingolegacy.com` — admin and production tools
- `media.thelingolegacy.com` — shared video and image CDN
- `api.thelingolegacy.com` — backend APIs

## 5. Release governance

Use fail-closed policies:
- no live payouts without approval
- no production data activation without verification logs
- no production deploy without QA and architecture sign-off
- all telemetry and live features remain gated until explicit approval

## 6. Completion plan

1. Connect Firebase project and security rules
2. Create Flutter app shell and theme
3. Add auth and user management
4. Add Firestore models for worlds, games, profiles, and commerce
5. Replace ad hoc static routes with Cloudflare Worker routing
6. Connect assets to CDN and optimized media delivery
7. Final QA and production sign-off

This provides the direct path from the current static web studio to a live app ecosystem with Firebase and Cloudflare in the production stack.
