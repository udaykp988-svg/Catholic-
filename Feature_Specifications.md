# PRODUCT REQUIREMENT DOCUMENT (PRD) & FEATURE SPECIFICATION
**Application Name:** Sanctum (Tranquil Monastic Focus & Devotional Companion)  
**Author:** Senior Business Analyst & Lead UX Designer  
**Status:** Approved / Production-Ready  
**Date:** June 21, 2026

---

## 1. Executive Summary & Product Vision
Sanctum is a premium, highly tactile digital sanctuary designed to foster focus, prayer, and deep mindfulness. Merging traditional monastic practices with modern user experience principles, Sanctum provides deep ambient sounds, liturgical structure, and interactive prayer prompts. The platform targets devout practitioners, individuals seeking spiritual groundedness, and users recovering from screen fatigue or digital anxiety.

### Key Value Propositions
- **Procedural Soundscapes:** Zero-overhead Web Audio synthesizer that creates long, looping, uncompressed ambient environments natively in the browser without relying on large bandwidth audio streaming.
- **Anxiety Mitigation:** Focused tools such as Scripture overlays, contemplative timers, and interactive journaling to transition users from cognitive overload to slow, focused breathing.
- **Liturgical Real-Time Sync:** Adaptive themes and readings mapped to the local liturgical calendar and day cycle.

---

## 2. Core Functional Specifications (Epic Directory)

### Epic 1: Sanctuary Focus Mode & Ambient Chants
*The tranquility room of the application, designed for single-task focus.*

- **Functional Description:** Users toggle an immersive, full-screen canvas removing all header, footer, and navigation distractions.
- **Visual Environments:** Three options customize the mood of the deep workspace:
  - *Golden Hour (Warm Aura):* For slow, deliberate morning/daytime study.
  - *Stained Glass (Illuminated Cathedral):* High-contrast abstract geometry modeling deep prayer.
  - *Contemplative Twilight (Night Sky):* Deep, low-blue light theme for bedtime examen.
- **Procedural Cathedral Soundscape:**
  - Standard audio loops require heavy bandwidth. Sanctum compiles a real-time procedural synthesizer utilizing native `OscillatorNode`, `GainNode`, and dual feedback delay lines.
  - Generates a shifting chord structure (A2, E3, A3, C4, E4 minor third progression) modulated by a very low-frequency LFO to prevent sensory adaptation.
  - Features a custom bandpass white-noise sweep approximating gentle cathedral crosswinds.
- **Scripture Overlay (Dynamic Swell):**
  - Displays encouraging scripture verses inside the focus card.
  - Automatically transitions with a slow 1500ms fade-out and fade-in cycle every 30 seconds to reinforce meditative focus on Sacred Scripture.

---

### Epic 2: Monastic Audio Rosary & Sleep Stories
*Procedurally assisted recitation and calming sleep aids.*

- **Functional Description:** An immersive auditory interface supporting traditional Rosary cycles (Joyful, Sorrowful, Glorious, Luminous Mysteries) synchronized to the exact day of the week, with integrated voice guided counters.
- **Dynamic Counters:**
  - Interactive tactile bead board that tracks counts to prevent screen-gazing.
  - Voice cues assist in maintaining a consistent breathing rate.
- **Sleep Stories Tab:**
  - Narrative readings based on classic spiritual literature, combined with a dynamic Web Audio lowpass-sweep to ease brainwave activity into alpha/theta states.

---

### Epic 3: Confession Preparation (Examen & Journal)
*Contemplative review of conscience following centuries-old Jesuit and Monastic traditions.*

- **Functional Description:** A secure, step-by-step examination interface covering major categories of personal growth (Prudence, Justice, Temperance, Fortitude).
- **Interactive Checklist:**
  - Bulleted points representing daily examination questions.
  - Secure state management: allows users to mark specific items for personal focus in a local, self-contained container.
- **Contritio Slate (Sorrow Slate):**
  - Allows drafting a personal act of contrition or private thoughts, with a single-click "Dissolve" animation to visually representation of casting sins away.

---

### Epic 4: Saints Catalog & Liturgical Compendium
*The educational and historically rich layer of the application.*

- **Functional Description:** Fully searchable grid detailing historical facts, patronages, and feast days of classic church saints.
- **Feast-Day Alerts:** Adaptive visual borders highlight saints whose feast matches the current local calendar date automatically.

---

### Epic 5: Bible Flashcards & Cognitive Retention
*Active learning tool for ancient scriptures and theological vocabulary.*

- **Functional Description:** Tactical double-sided flashcard deck using CSS 3D transforms for elegant cards that flip instantly on touch or click.
- **Spaced Repetition Framework:** Marks cards as "Mastered" or "Under Study" to optimize Bible memory pipelines.

---

## 3. Figma Design Blueprint & UX Specs

```
┌────────────────────────────────────────────────────────────────────────┐
│                              SANCTUM APP                               │
├────────────────────────────────────────────────────────────────────────┤
│  [LOGOSHORTCUT]   DAILY FEAST: St. Aloysius Gonzaga (June 21)   [USER]│
├────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                        MAIN DEVOTIONAL ZONE                      │  │
│  │                                                                  │  │
│  │   [ ROSARY PLAYER ] [ EXAMEN STEPS ] [ FLASHCARDS ] [ SAINTS ]   │  │
│  │                                                                  │  │
│  │   ┌──────────────────────────────────────────────────────────┐   │  │
│  │   │          Interactive Bead Tracker / Examen Slate         │   │  │
│  │   │                                                          │   │  │
│  │   │                 (Tactile Click / Sound)                  │   │  │
│  │   └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────────┤
│                       FOCUS CONTROL BAR (FOOTER)                       │
│  [ GOLDEN ] [ STAINED ] [ TWILIGHT ]  | [ CHANTS: ON ] [ SCRIPTURE: ON ]│
└────────────────────────────────────────────────────────────────────────┘
```

### Aesthetic Blueprint
- **Colors:** Dominant Warm Off-White (`#f9f7f3`) for light mode, deep Velvet-Charcoal (`#0a0712`) with Amber Highlights (`#d4af37`) for Focus/Night themes.
- **Typography Pairing:**
  - *Display Headings:* Space Grotesk / Georgia (Classic Editorial feeling).
  - *Data & Counters:* JetBrains Mono (High legibility, raw monastic script charm).
- **Physical Feedback Model:** Active elements utilize `active:scale-[0.98]` transitions to simulate physical wood, stone, and heavy bead textures.

---

## 4. User Journeys & Target Personas

### Persona A: Sarah (The Burned-out Software Engineer)
- **Goal:** Unclutter her mental workspace and sleep without scrolling social media.
- **Journey:** Matches focus mode "Twilight" environment, turns on "Cathedral Chants" procedural drone, activates "Scripture Overlay", and sets an automated 30-minute sleep داستان. Eases anxiety without loading a heavy browser engine.

### Persona B: Father Thomas (The Devout Companion)
- **Goal:** Recite the daily Liturgical hours and Rosary on-the-go without lugging printed breviaries.
- **Journey:** Launches Rosary tab; the app automatically detects it is June 21st (Sunday - Glorious Mysteries), sets the bead tracker, and provides high-contrast text legible under direct sunlight.

---

## 5. Technical Architecture Overview
```
┌────────────────────────────────────────────────────────────────┐
│                          React Client                          │
│                                                                │
│  ┌───────────────────────┐             ┌────────────────────┐  │
│  │      UI Components    ├────────────>│  Visual State Eng. │  │
│  │  (Framer Motion/Tailw)│             │ (Local Storage)   │  │
│  └──────────┬────────────┘             └─────────┬──────────┘  │
│             │                                    │             │
│             v                                    v             │
│  ┌───────────────────────┐             ┌────────────────────┐  │
│  │  Web Audio Synth      │             │  Liturgical Engine  │  │
│  │  (Procedural Drone)   │             │  (Calendar Sync)   │  │
│  └───────────────────────┘             └────────────────────┘  │
└────────────────────────────────────────────────────────────────┘
```
1. **Procedural Chants Synthesizer:** Realized inside `CathedralSoundscape.ts`. Completely custom Audio Nodes compiled cleanly to bypass slow MP3 asset streaming.
2. **Animation Engine:** Framer Motion for clean exit/entrances on heavy screens.
3. **Data Core:** Pure static type structures in `liturgy.ts` preventing database cold-starts.

---
*End of Feature Document.*
