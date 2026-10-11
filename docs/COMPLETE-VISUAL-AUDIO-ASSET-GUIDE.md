# Lingo ⭐️ Legacy — Complete Visual & Audio Asset Generation Guide

## 1. Logo & Branding Assets

### Master Lingo Mark
**File:** `/assets/logos/lingo-mark.svg`
**Usage:** Primary brand identifier across all platforms
**Specifications:**
- Color: Gold (#f7ca4c) on transparent
- Alternate: White (#fff9e8) on dark
- Size: 30px-512px (all sizes)
- SVG with 2x PNG fallback

**Design brief:**
```
A star symbol (⭐️) combined with flowing ribbon or "L" shape
representing the words "Lingo Legacy"
Moderne, clean, immediately recognizable
Works at any scale from favicon to billboard
```

### Platform Sub-Logos

#### That's My Lingo (Casino)
**File:** `/assets/logos/thats-my-lingo-mark.svg`
**Style:** Playful, slot-machine aesthetic
**Colors:** Purple (#7c3aed) + Gold (#f7ca4c)
**Icon:** Stylized "777" or spinning reels

#### KottonsCode (Story World)
**File:** `/assets/logos/kottons-code-mark.svg`
**Style:** Warm, hand-drawn, accessible
**Colors:** Orange (#d97706) + Sky Blue (#0ea5e9)
**Icon:** Book, character, or learning symbol

#### Dice Shift Hotel (Mystery)
**File:** `/assets/logos/dice-shift-mark.svg`
**Style:** Noir, retro, sophisticated
**Colors:** Plum (#5b21b6) + Copper (#b45309)
**Icon:** Dice, hotel key, or door frame

#### Loyalty Lane Apparel
**File:** `/assets/logos/loyalty-lane-apparel-mark.svg`
**Style:** Modern, fashion-forward
**Colors:** Rose Pink (#ec4899) + Gold (#f7ca4c)
**Icon:** Clothing hanger, "LL", or thread

#### Loyalty Lane Cycle
**File:** `/assets/logos/loyalty-lane-cycle-mark.svg`
**Style:** Community, circular, inclusive
**Colors:** Teal (#06b6d4) + Silver (#d1d5db)
**Icon:** Cycle/wheel, laundry, or community

---

## 2. Icon Library

### Global UI Icons (48x48px, SVG)

**Navigation:**
- `/assets/icons/home.svg` — House with star
- `/assets/icons/games.svg` — Dice/cards
- `/assets/icons/worlds.svg` — World/map
- `/assets/icons/profile.svg` — Person/avatar
- `/assets/icons/shop.svg` — Bag/cart
- `/assets/icons/studio.svg` — Gear/dashboard

**Actions:**
- `/assets/icons/play.svg` — Triangle play
- `/assets/icons/pause.svg` — Double bars
- `/assets/icons/settings.svg` — Gear
- `/assets/icons/sound-on.svg` — Speaker with waves
- `/assets/icons/sound-off.svg` — Speaker muted
- `/assets/icons/menu.svg` — Three horizontal bars

**Status:**
- `/assets/icons/loading.svg` — Spinning star
- `/assets/icons/success.svg` — Check with glow
- `/assets/icons/error.svg` — X with warning
- `/assets/icons/info.svg` — Question mark

**Commerce:**
- `/assets/icons/card.svg` — Credit card
- `/assets/icons/wallet.svg` — Wallet
- `/assets/icons/package.svg` — Box/delivery
- `/assets/icons/gift.svg` — Present

---

## 3. Visual Backgrounds & Environments

### Homepage Hero Backgrounds
**File:** `/assets/images/backgrounds/hero-lingo-world.png`
**Dimensions:** 1920x1080 (plus 2x retina)
**Style:** Cinematic gradient with floating elements
**Colors:** Dark noir (#050507) → purple (#7c3aed) → gold (#f7ca4c)
**Elements:** Floating stars, glowing orbs, subtle grid overlay

**Description:**
A sweeping cinematic background showing the Lingo Legacy universe. Large glowing orbs float across a deep space backdrop. Gold and cyan light sources create depth. Animated stars twinkle. A subtle grid pattern overlays to suggest a digital/game world. No text, pure atmosphere.

### Casino Floor Background
**File:** `/assets/images/backgrounds/casino-floor.jpg`
**Dimensions:** 2560x1440
**Style:** Deep, luxurious, neon-lit
**Colors:** Deep blacks (#050507), neon purple (#7c3aed), gold (#f7ca4c), cyan (#56efff)
**Elements:** Slot machines in background, reflective floor, chrome details, neon signs

### Story World Backgrounds

#### KottonsCode World
**File:** `/assets/images/backgrounds/kottons-code-neighborhood.png`
**Dimensions:** 1920x1080
**Style:** Warm, illustrated, homey
**Colors:** Warm earth tones, oranges (#d97706), sky blues (#0ea5e9)
**Elements:** Brownstone buildings, stoop seating, street corner, warm lighting

#### Dice Shift Hotel Lobby
**File:** `/assets/images/backgrounds/dice-shift-lobby.jpg`
**Dimensions:** 1920x1080
**Style:** Noir, retro hotel aesthetic
**Colors:** Deep burgundy, gold accents, dim lighting
**Elements:** Art deco details, vintage furniture, moody lighting

### Commerce Backgrounds

#### Loyalty Lane Apparel Shop
**File:** `/assets/images/backgrounds/loyalty-lane-shop.png`
**Dimensions:** 1920x1080
**Style:** Modern retail, clean
**Colors:** Soft whites, rose pink (#ec4899) accents
**Elements:** Clothing racks, mannequins, spotlights, sleek shelves

---

## 4. Character & Creature Art

### Lingo Legacy Mascot
**File:** `/assets/images/characters/lingo-mascot-full.png`
**Dimensions:** 512x512
**Style:** Friendly, modern, slightly abstract
**Description:** A character that embodies the Lingo ⭐️ brand. Could be:
- A stylized star with a face
- A persona with expressive eyes and warmth
- Animated and playful
- Works as both 2D illustration and 3D model

**Variants:**
- Happy expression (default)
- Thinking expression (for help/questions)
- Celebrating expression (for wins/rewards)
- Neutral expression (for loading states)

### KottonsCode Characters
**Files:** `/assets/images/characters/kottons-code/` directory
- `kotton-main.png` — Primary character
- `kotton-friend-1.png` — Supporting character 1
- `kotton-friend-2.png` — Supporting character 2
- `kotton-npc-elder.png` — Elder/guide character

Each character has multiple expressions and poses for animation.

---

## 5. Game Asset Sprites & Graphics

### Slot Machine Reels
**Directory:** `/assets/images/games/slots/`
- `reel-symbol-lingo.png` — Lingo star symbol
- `reel-symbol-gold.png` — Gold bar
- `reel-symbol-crown.png` — Crown/royalty
- `reel-symbol-diamond.png` — Diamond
- `reel-symbol-bell.png` — Bell (classic)
- `reel-animation-spin.gif` — Spinning reel animation

### Card Game Assets
**Directory:** `/assets/images/games/cards/`
- `card-back.png` — Back of card
- `card-suit-spades.svg` — Spades symbol
- `card-suit-hearts.svg` — Hearts symbol
- `card-suit-diamonds.svg` — Diamonds symbol
- `card-suit-clubs.svg` — Clubs symbol
- `card-score-display.png` — Score/points visual

---

## 6. Animations & Motion Graphics

### CSS Animations

**File:** `/assets/animations/global-transitions.css`

```css
/* Fade in reveal */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Glowing pulse for stars/buttons */
@keyframes pulseGlow {
  0% {
    box-shadow: 0 0 4px rgba(247, 200, 75, 0.4);
  }
  50% {
    box-shadow: 0 0 20px rgba(247, 200, 75, 0.8);
  }
  100% {
    box-shadow: 0 0 4px rgba(247, 200, 75, 0.4);
  }
}

/* Floating orbs */
@keyframes floatSmooth {
  0% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-20px) translateX(10px);
  }
  100% {
    transform: translateY(0px) translateX(0px);
  }
}

/* Spinning loader */
@keyframes spinStar {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Card flip */
@keyframes cardFlip {
  0% {
    transform: rotateY(0deg);
  }
  50% {
    transform: rotateY(90deg);
  }
  100% {
    transform: rotateY(0deg);
  }
}

/* Slot reel spin */
@keyframes reelSpin {
  from {
    transform: translateY(0);
  }
  to {
    transform: translateY(-480px);
  }
}
```

### Lottie Animation Files

**File:** `/assets/animations/lingo-mascot-celebrating.json`
- Lingo mascot celebrating a win
- Looping, joyful motion
- Works on web and Flutter

**File:** `/assets/animations/loading-star.json`
- Loading indicator shaped like Lingo star
- Smooth 2-3 second loop
- Used on all loading screens

**File:** `/assets/animations/coin-flip.json`
- Animated coin flip
- Used for game outcomes
- Satisfying reveal motion

---

## 7. Sound & Audio Assets

### Startup Sequence
**File:** `/assets/sounds/startup-chime.mp3`
**Duration:** 2 seconds
**Description:** 
- Bright, inviting tone
- Builds confidence in the brand
- Plays once on page load
- Volume: -8dB (not jarring)

**Audio Profile:**
- Frequencies: 440Hz (A4) primary, harmonics
- Instrumentation: Synth bell, slight reverb
- Quality: 128 kbps MP3

### UI Click Tones (Per Platform)

#### Casino Click
**File:** `/assets/sounds/casino-click.mp3`
**Duration:** 0.2 seconds
**Description:** Crisp, metallic click suggesting slot machine interaction
**Frequencies:** 1000Hz primary, slight digital processing

#### Story World Click
**File:** `/assets/sounds/story-click.mp3`
**Duration:** 0.15 seconds
**Description:** Warm, book-page-like sound
**Frequencies:** 600Hz primary, paper rustling texture

#### Commerce Click
**File:** `/assets/sounds/shop-click.mp3`
**Duration:** 0.18 seconds
**Description:** Gentle, inviting retail sound
**Frequencies:** 800Hz primary, soft attack

### Game Sounds

#### Slot Spin Start
**File:** `/assets/sounds/games/slots/spin-start.mp3`
**Duration:** 0.5 seconds
**Description:** Mechanical reel spin beginning
**Elements:** Click + low-frequency rumble

#### Slot Spin End
**File:** `/assets/sounds/games/slots/spin-end.mp3`
**Duration:** 0.8 seconds
**Description:** Satisfying stop with slight bounce
**Elements:** Impact + resonance

#### Win Sound
**File:** `/assets/sounds/games/win-fanfare.mp3`
**Duration:** 1.2 seconds
**Description:** Celebratory chime progression
**Elements:** Ascending notes, bell tones, slight reverb

#### Coin Drop
**File:** `/assets/sounds/games/coin-drop.mp3`
**Duration:** 0.4 seconds
**Description:** Satisfying metallic coin landing
**Elements:** Metal impact + sustain

### Ambient Loops

#### Casino Ambience
**File:** `/assets/sounds/ambience/casino-loop.mp3`
**Duration:** 30 seconds (loops seamlessly)
**Description:** Distant slot machines, quiet conversations, subtle music
**Volume:** -20dB (background)
**Elements:** Mechanical clicks, muffled voices, lounge jazz underneath

#### Story World Ambient
**File:** `/assets/sounds/ambience/kottons-code-loop.mp3`
**Duration:** 45 seconds (loops seamlessly)
**Description:** Neighborhood sounds - wind, distant traffic, birds
**Volume:** -18dB (background)
**Elements:** Nature sounds, urban subtlety, warm undertone

#### Hotel Ambient
**File:** `/assets/sounds/ambience/dice-shift-lobby-loop.mp3`
**Duration:** 60 seconds (loops seamlessly)
**Description:** Elevator music, footsteps, distant phone rings
**Volume:** -22dB (background)
**Elements:** Retro music, subtle mechanical sounds, vintage aesthetic

### Success/Error Feedback

#### Success Chime
**File:** `/assets/sounds/success-chime.mp3`
**Duration:** 0.6 seconds
**Description:** Uplifting, confident confirmation
**Frequencies:** Major chord progression (C-E-G)

#### Error Buzz
**File:** `/assets/sounds/error-buzz.mp3`
**Duration:** 0.3 seconds
**Description:** Gentle warning, not harsh
**Frequencies:** 300Hz base with slight dissonance

---

## 8. Video Assets

### Hero Trailer
**File:** `/assets/videos/lingo-legacy-hero-trailer.mp4`
**Duration:** 15-30 seconds
**Resolution:** 1920x1080 (plus 4K variant)
**Description:**
- Opens with Lingo mark fade-in
- Quick cuts between game worlds
- Upbeat, modern music
- Shows diversity of products
- Ends with "Enter the Legacy" call-to-action

### Product Showcase Videos

#### That's My Lingo Gameplay
**File:** `/assets/videos/games/thats-my-lingo-gameplay.mp4`
**Duration:** 30 seconds
**Content:**
- Real gameplay footage
- Reel spins, wins, animations
- UI highlights
- Excitement building

#### KottonsCode Story Teaser
**File:** `/assets/videos/worlds/kottons-code-teaser.mp4`
**Duration:** 45 seconds
**Content:**
- Character introduction
- Neighborhood exploration
- Warm, inviting atmosphere
- Story hook

---

## 9. Asset Color Palette Reference

### Global Brand Colors
```
Primary Gold:     #f7ca4c
Dark Noir:        #050507
Cyan Accent:      #56efff
Violet Secondary: #6b2dff
Muted Text:       #c9b98c
Bright Text:      #fff9e8
```

### Platform Specific
```
Casino:           Purple (#7c3aed) + Gold (#f7ca4c)
Story:            Orange (#d97706) + Sky Blue (#0ea5e9)
Hotel:            Plum (#5b21b6) + Copper (#b45309)
Apparel:          Rose (#ec4899) + Gold (#f7ca4c)
Community:        Teal (#06b6d4) + Silver (#d1d5db)
```

---

## 10. Generation & Production Tools

### Recommended Tools

**Logo & Graphic Design:**
- Figma (collaborative design)
- Adobe Illustrator (vector export)
- Adobe Photoshop (raster work)

**Animation:**
- Adobe After Effects (motion graphics)
- Blender (3D elements)
- Lottie (interactive animations)
- Framer Motion (web animations)

**Audio Production:**
- Logic Pro (music & sound design)
- Audacity (free audio editing)
- FMOD (game audio integration)

**Video Production:**
- Adobe Premiere Pro (editing)
- DaVinci Resolve (free alternative)
- FFmpeg (command-line conversion)

**Asset Optimization:**
- ImageOptim (image compression)
- TinyPNG (PNG optimization)
- FFmpeg (video encoding)
- ImageMagick (batch processing)

---

## 11. Asset Delivery Pipeline

### Image Optimization
```bash
# Convert to WebP
ffmpeg -i source.png -c:v libwebp -q:v 75 output.webp

# Generate responsive srcset
for size in 320 640 960 1280 1920; do
  convert source.png -resize ${size}x output-${size}w.webp
done
```

### Audio Optimization
```bash
# MP3 encoding (128 kbps)
ffmpeg -i source.wav -b:a 128k output.mp3

# Add metadata
mediainfo --output=JSON source.mp3 > metadata.json
```

### Video Encoding
```bash
# H.264 MP4 (streaming-friendly)
ffmpeg -i source.mov -c:v libx264 -preset medium -crf 23 -c:a aac -b:a 128k output.mp4

# WebM alternative
ffmpeg -i source.mov -c:v libvpx -crf 30 -c:a libopus -b:a 128k output.webm
```

---

## 12. Asset Checklist for Launch

### Visual Assets
- [ ] Master Lingo mark (SVG + PNG 2x)
- [ ] 5 platform sub-logos
- [ ] 20+ UI icons
- [ ] 5 hero backgrounds
- [ ] 3 character mascots
- [ ] Game sprites and graphics
- [ ] Responsive image sets (320px to 1920px)

### Audio Assets
- [ ] Startup chime
- [ ] 5 platform-specific click tones
- [ ] 4 game sound effects
- [ ] 3 ambient loops
- [ ] Success/error feedback sounds
- [ ] All files: MP3 128kbps + WebM fallback

### Animation Assets
- [ ] 8 CSS animation keyframes
- [ ] 3 Lottie JSON animations
- [ ] Sprite sheet for character animations
- [ ] Loading spinners
- [ ] Transition effects

### Video Assets
- [ ] Hero trailer (15-30s)
- [ ] 3 product showcase videos
- [ ] MP4 + WebM formats
- [ ] Subtitles/captions files

---

## 13. Implementation Schedule

### Week 1-2: Foundation
- [ ] Create master Lingo mark
- [ ] Design 5 platform logos
- [ ] Create UI icon library
- [ ] Design hero backgrounds

### Week 3-4: Character & Detail
- [ ] Illustrate mascot character
- [ ] Create story world characters
- [ ] Design game sprites
- [ ] Create card/reel graphics

### Week 5-6: Animation & Motion
- [ ] Build CSS animations
- [ ] Create Lottie animations
- [ ] Record audio effects
- [ ] Capture/create ambient loops

### Week 7-8: Video & Polish
- [ ] Shoot/edit hero trailer
- [ ] Create product videos
- [ ] Optimize all assets
- [ ] Deploy to CDN

---

## 14. Quality Standards

### Images
- Minimum 2x retina support
- WebP with PNG fallback
- Optimized under 100KB per image
- Accessible alt text for all

### Audio
- Clear, distortion-free
- Consistent loudness (-14LUFS)
- Multiple format support (MP3, WebM)
- Proper metadata tags

### Animation
- Smooth 60 FPS performance
- Reduced motion compliance
- Sub-3s load times
- Accessibility-first design

### Video
- Multiple bitrate variants
- HLS/DASH streaming support
- Captions and transcripts
- Mobile-optimized delivery

---

**The Lingo ⭐️ Legacy Studio**  
_Visual identity. Complete ecosystem. Production-ready._

Generated: October 11, 2026
Authority: Chief Architect
Status: Ready for Asset Generation Phase
