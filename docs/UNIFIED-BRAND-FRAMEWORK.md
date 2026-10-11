# The Lingo ⭐️ Legacy — Unified Brand & Identity Framework

## Vision
Every platform, world, game, and sub-app maintains its own **visual identity, UI theme, and audio signature** while staying connected to the central **Lingo ⭐️ Legacy** mothership via:
- **Visual anchors** (logo, star mark, color accent)
- **Domain integration** (Cloudflare, DNS, routing)
- **Navigation spine** (header/footer with back-to-home)
- **Audio branding** (consistent startup chime, asset library)
- **CI/CD & deployment** (unified GitHub/Vercel infrastructure)

---

## Platform Inventory

### Tier 1: Core Games & Commerce
- **That's My Lingo** (Casino Floor) — Purple/Gold arcade
- **LINGOarcade** — Retro arcade with neon trim
- **Auto Racing Universe** — Chrome/steel race world
- **Multiplayer Rap Arena** — Hip-hop street culture
- **Live Casino Studio** — Regulated gaming shell

### Tier 2: Story & Learning
- **KottonsCode** — Warm, story-world, child-friendly
- **Living Universe** — Connected map of all worlds
- **Loyalty Lane** — Commerce/apparel shop world

### Tier 3: Admin & Control
- **Admin Command Center** — Dark operator surface
- **Studio Production** — Creative OS, asset management
- **Trust & Compliance** — Safety-first policy hub

### Tier 4: Experience Layers
- **Loading/Star Gate** — Boot & onboarding sequence
- **Studio Assets** — Shared visual library
- **Master Interface** — System-wide HUD

---

## Identity Framework Per Platform

### Template: Platform Identity Record

Each platform gets its own config file: `/identity/[PLATFORM_ID].json`

```json
{
  "id": "platform_id",
  "name": "Platform Display Name",
  "tagline": "Short description",
  "logo": {
    "svg": "/assets/logos/platform_logo.svg",
    "favicon": "/assets/favicons/platform_favicon.svg"
  },
  "colors": {
    "primary": "#HEX",
    "accent": "#HEX",
    "background": "#HEX",
    "text": "#HEX"
  },
  "typography": {
    "family": "Inter, sans-serif",
    "headingWeight": "1000",
    "bodyWeight": "400"
  },
  "audio": {
    "startup": "/assets/audio/platform_startup.mp3",
    "click": "/assets/audio/platform_click.mp3",
    "success": "/assets/audio/platform_success.mp3"
  },
  "css": "/assets/styles/platform_branded.css",
  "header": {
    "showLingoBrand": true,
    "brandPosition": "left",
    "links": ["home", "store", "profile", "support"]
  },
  "footer": {
    "showLingoBrand": true,
    "copyrightHolder": "The Lingo Legacy",
    "links": ["privacy", "terms", "contact", "trust"]
  },
  "routing": {
    "domain": "thelingolegacy.com",
    "path": "/platform-id/",
    "cloudflareZone": "thelingolegacy.com"
  }
}
```

---

## Branding Rules

### 1. **Logo & Mark Placement**
- ✅ All pages MUST display the **Lingo ⭐️ Legacy mark** somewhere visible
  - Header (top-left or center)
  - Footer (bottom)
  - Floating badge (corner)
  - Loading screens (center)
- ✅ Platform-specific logo appears adjacent to (not replacing) Lingo mark

### 2. **Color Palette Strategy**
Each platform gets **one primary + one accent** color while keeping:
- **White/off-white** text for readability
- **Dark background** (noir/charcoal) for consistency
- **Gold/amber accents** for Lingo Legacy connection
- **Neon highlights** (cyan, magenta, green) for platform identity

**Example:**
- **That's My Lingo**: Purple primary, Gold accent
- **KottonsCode**: Warm orange primary, Teal accent
- **Auto Racing**: Steel gray primary, Neon green accent
- **Loyalty Lane**: Rose pink primary, Gold accent

### 3. **Navigation Spine**
Every app must have:

**Header (visible on all pages):**
```html
<header class="lingo-top">
  <nav class="wrap">
    <!-- Left: Lingo mark + home link -->
    <a href="/" class="lingo-brand">
      <img src="/assets/thats-my-lingo-mark.svg" alt="Lingo Legacy">
      <span>Lingo Legacy</span>
    </a>
    
    <!-- Center/Right: Platform nav + global nav -->
    <div class="nav-links">
      <a href="/platform-id/">Game/App Name</a>
      <a href="/">Home</a>
      <a href="/trust-compliance/">Safety</a>
      <a href="/contact/">Support</a>
    </div>
  </nav>
</header>
```

**Footer (visible on all pages):**
```html
<footer class="lingo-footer">
  <div class="wrap">
    <div>
      <strong>The Lingo Legacy</strong>
      <p>Platform Name | © 2026 The Lingo Legacy</p>
    </div>
    <div class="footer-links">
      <a href="/privacy/">Privacy</a>
      <a href="/terms/">Terms</a>
      <a href="/contact/">Contact</a>
      <a href="/trust-compliance/">Safety</a>
    </div>
  </div>
</footer>
```

### 4. **Audio Branding**
- **Startup chime** (universal across all platforms)
- **Platform-specific click tone** (plays on button press)
- **Success/reward motif** (platform-themed)
- **All sounds optional/mutable** (accessibility)

**Shared audio library:** `/assets/audio/`
```
├── startup.mp3 (universal Lingo jingle)
├── platforms/
│   ├── casino_click.mp3
│   ├── arcade_click.mp3
│   ├── racing_click.mp3
│   ├── kottons_click.mp3
│   └── [platform_click.mp3]
└── effects/
    ├── reward_burst.mp3
    ├── level_up.mp3
    └── error_tone.mp3
```

### 5. **CSS & Theming**
Base styles in `/assets/lingo-os.css` (universal):
- Typography scales
- Button patterns
- Layout grid
- Accessibility defaults

Platform overrides in `/assets/styles/[platform]_branded.css`:
- Primary color application
- Accent highlights
- Custom backgrounds
- Platform-specific animations

**Implementation:**
```html
<!-- All pages load base -->
<link rel="stylesheet" href="/assets/lingo-os.css">

<!-- Platform loads its theme -->
<link rel="stylesheet" href="/assets/styles/casino_branded.css">

<!-- Platform-specific runtime -->
<script defer src="/assets/js/casino_runtime.js"></script>
```

### 6. **Domain & Routing** (Cloudflare)
All platforms served from single domain with path-based routing:

```
thelingolegacy.com/
├── / (homepage)
├── /thats-my-lingo/ (casino)
├── /lingoarcade/ (arcade)
├── /kottons-code/ (story)
├── /auto-racing-universe/ (racing)
├── /loyalty-lane/ (commerce)
├── /trust-compliance/ (safety hub)
├── /admin-command-center/ (ops)
└── /[platform]/ (future platforms)
```

**Cloudflare Workers** route based on path:
```javascript
// Route to correct asset bundle + branding
if (pathname.startsWith('/thats-my-lingo/')) {
  return applyCasinoBranding(response);
} else if (pathname.startsWith('/auto-racing-universe/')) {
  return applyRacingBranding(response);
}
// etc.
```

---

## Asset Architecture

### File Structure
```
/assets/
├── lingo-os.css (universal base styles)
├── lingo-os.js (universal interactions)
├── thats-my-lingo-mark.svg ⭐️ (core Lingo logo)
├── premium-studio-refresh.css
├── studio-grade.css
│
├── logos/
│   ├── lingo_mark.svg ⭐️
│   ├── casino_logo.svg
│   ├── arcade_logo.svg
│   ├── racing_logo.svg
│   └── [platform_logo.svg]
│
├── styles/
│   ├── casino_branded.css
│   ├── arcade_branded.css
│   ├── racing_branded.css
│   ├── kottons_branded.css
│   └── [platform_branded.css]
│
├── audio/
│   ├── startup.mp3 (universal)
│   ├── platforms/
│   │   ├── casino_click.mp3
│   │   ├── arcade_click.mp3
│   │   ├── racing_click.mp3
│   │   └── [platform_click.mp3]
│   └── effects/
│       ├── reward_burst.mp3
│       ├── level_up.mp3
│       └── error_tone.mp3
│
├── animations/
│   ├── shared_transitions.css
│   ├── platform_specific.css
│   └── reduced_motion.css
│
├── icons/
│   ├── star.svg (Lingo mark variant)
│   ├── home.svg
│   ├── menu.svg
│   ├── profile.svg
│   ├── [icon].svg
│   └── platform_icons/
│       ├── casino_777.svg
│       ├── arcade_joystick.svg
│       └── [platform_icon.svg]
│
└── favicons/
    ├── favicon.ico (Lingo default)
    ├── casino_favicon.svg
    ├── racing_favicon.svg
    └── [platform_favicon.svg]
```

---

## Implementation Checklist

### Phase 1: Foundation (Week 1-2)
- [ ] Create `/identity/` folder with platform config files
- [ ] Audit all existing platforms for asset gaps
- [ ] Create unified `lingo-os.css` base
- [ ] Add Lingo mark to all 30+ page footers/headers
- [ ] Set up `/assets/audio/` library
- [ ] Document color palette per platform

### Phase 2: Visual Unification (Week 3-4)
- [ ] Create `[platform]_branded.css` for each major platform
- [ ] Update header/footer on all pages to show Lingo mark
- [ ] Add favicon support per platform
- [ ] Create `/assets/logos/` folder with all logos
- [ ] Apply consistent button styling
- [ ] Add loading spinners with platform branding

### Phase 3: Audio & Motion (Week 5-6)
- [ ] Record/source platform-specific click tones
- [ ] Add opt-in audio control to header
- [ ] Implement reduced-motion media queries
- [ ] Test animation performance on mobile
- [ ] Document sound strategy in Wiki

### Phase 4: Domain & CI/CD (Week 7-8)
- [ ] Configure Cloudflare routing rules
- [ ] Set up build pipeline to include branding per path
- [ ] Create GitHub Actions workflow for asset versioning
- [ ] Test domain routing (gaming.thelingolegacy.com, etc.)
- [ ] Set up analytics to track platform usage

### Phase 5: Launch Readiness (Week 9-10)
- [ ] QA all platforms for Lingo mark visibility
- [ ] Test audio on iOS/Android
- [ ] Validate accessibility (WCAG 2.1 AA)
- [ ] Create platform-specific release notes
- [ ] Prepare launch announcement

---

## Code Examples

### Embedding Lingo Mark (SVG)
```html
<!-- In header -->
<a href="/" class="lingo-brand" title="Return to Lingo Legacy home">
  <img 
    src="/assets/thats-my-lingo-mark.svg" 
    alt="Lingo Legacy ⭐️" 
    width="32" 
    height="32"
  >
  <span class="sr-only">The Lingo Legacy</span>
</a>

<!-- In footer -->
<div class="footer-brand">
  <img 
    src="/assets/thats-my-lingo-mark.svg" 
    alt="Lingo Legacy" 
    width="24" 
    height="24"
  >
  <span>© 2026 The Lingo Legacy</span>
</div>
```

### CSS for Platform Branding
```css
/* /assets/styles/casino_branded.css */
:root {
  --lingo-primary: #7c3aed; /* Purple */
  --lingo-accent: #f7ca4c;  /* Gold */
  --lingo-bg: #050507;      /* Noir */
  --lingo-text: #fff7dc;    /* Off-white */
}

body {
  background: var(--lingo-bg);
  color: var(--lingo-text);
  font-family: Inter, sans-serif;
}

.button {
  background: var(--lingo-primary);
  border: 1px solid var(--lingo-accent);
  color: var(--lingo-text);
  border-radius: 999px;
  padding: 12px 18px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.button:hover {
  background: var(--lingo-accent);
  color: #170900;
}

/* Lingo mark stays visible */
.lingo-brand {
  display: flex;
  align-items: center;
  gap: 8px;
  text-decoration: none;
  color: var(--lingo-accent);
  font-weight: 900;
}
```

### JavaScript for Platform Audio
```javascript
// /assets/js/platform_audio.js
class PlatformAudio {
  constructor(platformId) {
    this.platformId = platformId;
    this.enabled = localStorage.getItem(`audio-${platformId}`) !== 'off';
    this.loadSounds();
  }

  loadSounds() {
    this.sounds = {
      startup: new Audio(`/assets/audio/startup.mp3`),
      click: new Audio(`/assets/audio/platforms/${this.platformId}_click.mp3`),
      success: new Audio(`/assets/audio/effects/reward_burst.mp3`)
    };
  }

  play(soundName) {
    if (!this.enabled || !this.sounds[soundName]) return;
    this.sounds[soundName].currentTime = 0;
    this.sounds[soundName].play().catch(e => console.log('Audio blocked:', e));
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(`audio-${this.platformId}`, this.enabled ? 'on' : 'off');
  }
}

// Usage
const audio = new PlatformAudio('casino');
audio.play('startup');
```

---

## Guidelines for Designers & Developers

### DO ✅
- Include Lingo mark on every page
- Use consistent button styles from `lingo-os.css`
- Test animations with `prefers-reduced-motion`
- Include audio controls in settings
- Document platform-specific colors in code comments
- Use semantic HTML for accessibility
- Test on mobile, tablet, and desktop

### DON'T ❌
- Replace Lingo mark with platform logo alone
- Use inconsistent button styling
- Autoplay audio without user consent
- Ignore accessibility standards
- Create new CSS files without inheriting from base
- Hard-code colors (use CSS variables)
- Deploy without testing on Vercel preview

---

## Success Metrics

After implementation, measure:
- ✅ 100% of pages display Lingo mark
- ✅ All platforms use same header/footer pattern
- ✅ Audio plays on 95%+ of devices (tracked via analytics)
- ✅ Lighthouse score ≥ 90 across all platforms
- ✅ WCAG 2.1 AA accessibility on all pages
- ✅ Load time < 2s on 4G networks
- ✅ Platform branding survey: 80%+ can identify each world's theme

---

## Questions?

Tag `@thelingolegacy-blip` or open an issue in `/docs/BRAND-FRAMEWORK-ISSUES/`

**The Lingo ⭐️ Legacy Studio**  
One brand. Many worlds. Connected everywhere.
