# Lingo ⭐️ Legacy — Frontend + Backend Architecture

This repository is organized as a studio-grade, multi-surface web platform with a clear path toward Flutter app delivery, Firebase-powered backend services, and Cloudflare edge routing.

## 1. Frontend Architecture

### Core web frontends
- Homepage and product hubs: static HTML pages in the repo root and nested directories
- Shared styling layer: `/assets/lingo-os.css`, `/assets/studio-grade.css`, `/assets/unified-brand-system.css`
- Shared interaction layer: `/assets/lingo-os.js` and platform-specific runtime scripts

### Product surfaces
- Casino / brand landing pages
- Story and world pages (KottonsCode, Dice Shift Hotel)
- Commerce pages (Loyalty Lane Apparel, Loyalty Lane Cycle)
- Admin / studio command surfaces
- Trust / compliance / governance pages
- Media and social integration pages

### Frontend standards
- Mobile-first responsive layout
- Shared Lingo brand system across all sub-apps
- Platform-specific themes layered on top of the global system
- Accessible color contrast and reduced-motion support
- Asset versioning and CDN-friendly delivery

## 2. Backend / App Architecture

### Current web-first foundation
The current repository is a static web app foundation. It can be extended with:
- Firebase Authentication for account and player identity
- Firestore / Realtime Database for progress, rewards, and metadata
- Cloud Functions for server-side orchestration
- Vercel or Cloudflare edge functions for dynamic experiences

### Future Flutter layer
A Flutter app can sit on top of the same architecture:
- App shell: Flutter widgets for home, game, wallet, profile, shop
- State management: Riverpod or Bloc
- Authentication: Firebase Auth
- Data sync: Firestore / Cloud Functions
- Push notifications: Firebase Cloud Messaging
- Asset delivery: CDN-backed media pipeline

## 3. Firebase Integration Plan

### Recommended services
- Firebase Auth
- Firestore
- Cloud Functions
- Cloud Storage for media assets
- Firebase Hosting (optional alternative to Vercel)
- Cloud Messaging for live updates

### Suggested data domains
- `users` — profile, avatar, prefs
- `games` — metadata and progress
- `worlds` — story worlds and unlocks
- `commerce` — products, inventory, carts
- `media` — trailers, art, videos
- `analytics` — telemetry and engagement metrics
- `governance` — release and approval state

## 4. Cloudflare Edge Strategy

Use Cloudflare for:
- Edge routing to all product surfaces
- Global asset caching
- CDN delivery for images, media, and static pages
- Rate limiting and DDoS protection
- Worker-based routing and path-level brand application

### Example routing model
- `/` → global homepage
- `/thats-my-lingo/` → casino surface
- `/kottons-code/` → story world
- `/loyalty-lane-apparel/` → commerce
- `/admin-command-center/` → studio production surface
- `/trust-compliance/` → safety and compliance

## 5. Production Deployment Model

### Web stack
- GitHub for source control
- GitHub Actions for CI/CD
- Vercel for app deploys and previews
- Cloudflare for edge performance and routing

### Mobile / Flutter stack
- Flutter app shell packaged for iOS / Android
- Firebase for auth, data, and notification services
- CDN-backed asset delivery for brand media

## 6. Governance / Safety

- Use fail-closed deployment gates
- Keep real-money or payout logic excluded from static frontend surfaces
- Ensure all live backend activation remains gated by approval
- Keep compliance and trust layers visible across all product surfaces

## 7. Future implementation sequence

1. Finish the unified brand shell across all product pages
2. Add Firebase project config and security rules
3. Add Cloudflare Worker route layer
4. Create Flutter app skeleton
5. Connect Flutter to Firestore and Firebase Auth
6. Add media and commerce data models
7. Finalize CI/CD and deployment reviews

This architecture keeps the project coherent while allowing rapid product expansion without losing the Lingo Legacy identity.
