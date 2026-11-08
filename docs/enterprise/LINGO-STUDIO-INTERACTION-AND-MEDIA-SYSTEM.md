# LINGO Studio Interaction & Media System

**Version:** 1.0.0 · **Date:** 2026-10-31 · **Status:** Design and QA standard.

## 1. Design system

- Global visual language: Industrial Noir / Crimson Shadow for LINGO Studio.
- Product identities may have distinct visual systems; KottonsCode stays bright, warm and age-appropriate.
- Define semantic color tokens, typography scale, spacing, radius, elevation, focus, motion and sound tokens.
- Maintain approved logos, icons, illustration, photography, fonts, audio and animation in a licensed asset registry with owner, source, license, version and permitted surfaces.
- Never substitute unlicensed music, fonts, stock assets or third-party marks.

## 2. Component inventory

Build reusable responsive components:
- App shell, top bar, side/bottom navigation, breadcrumbs and global search.
- Cards, lists, filters, tabs, accordions, tables and pagination.
- Primary/secondary/tertiary/destructive buttons.
- Forms, validation, date/time pickers, uploaders and consent controls.
- Dialogs, drawers, toasts, banners, tooltips and confirmation prompts.
- Audio player, video player, gallery, animation canvas and game HUD.
- Data charts, status chips, activity feed and audit timeline.
- Print/export controls and downloadable asset cards.

Every interactive component must specify default, hover, focus, pressed, loading, disabled, success and error states.

## 3. Interaction rules

- Buttons must perform the named action; no dead-end visual controls.
- Prevent duplicate submissions and show progress for long-running actions.
- Confirm destructive or irreversible operations with clear impact and an undo/rollback path where possible.
- Preserve unsaved work and warn before navigation when data could be lost.
- Pop-ups must be dismissible, keyboard accessible, screen-reader announced and non-blocking unless an urgent safety notice is required.
- Avoid notification spam, false urgency and deceptive consent.
- Support touch targets of at least 44×44 CSS pixels as a design target.
- Provide offline, slow-network, empty, loading, denied, not-found and server-error states.

## 4. Audio and motion

- Background music and ambient sound are opt-in and off by default.
- Persistent mute/volume control; remember preference; no autoplay with sound.
- Provide captions/transcripts for meaningful audio/video content.
- Respect `prefers-reduced-motion`; provide static alternatives and avoid flashing.
- Keep motion purposeful: state transition, feedback, storytelling, or spatial orientation.
- Do not make sound, color or animation the only carrier of important information.

## 5. Print and export

Provide clean print templates for forms, invoices, schedules, campaign rules, receipts, event run sheets, retail proposals and operational checklists.
- Print CSS removes app navigation, interactive controls, ads and background clutter.
- Preserve document title, version, timestamp, organization, page numbers and required legal text.
- Use semantic HTML and accessible PDF generation; test pagination, long tables, page breaks and monochrome output.
- Downloads must be explicitly requested, clearly named, versioned and checked for sensitive data before release.

## 6. Quality gates

- Responsive test widths: 360, 390, 768, 1024 and 1440 CSS px.
- Keyboard-only and screen-reader checks.
- WCAG 2.2 AA target; automated scans plus manual review.
- Reduced-motion, muted audio, high zoom and high contrast checks.
- Functional test for every visible control.
- Visual regression on core screens.
- Cross-browser/device checks for supported targets.
- Verify no console errors, broken assets, inaccessible dialogs or unhandled network failures.
