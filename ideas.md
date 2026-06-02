# Project SkyHarvest — Design Brainstorm

## Design Concepts

<response>
<text>
### Idea A: "Declassified Cold War Dossier"
**Design Movement:** Cold War Brutalist / Government Document Aesthetic
**Core Principles:**
1. Monochrome base with amber/yellow-green accent — the color of old cathode-ray monitors and stamped government ink
2. Distressed textures: paper grain, ink bleed, scan lines overlaid on dark backgrounds
3. Asymmetric layouts that mimic actual document pages — left-aligned, stamped, annotated
4. Typewriter and stencil fonts for headers; mono-spaced body text

**Color Philosophy:** Near-black (#0a0a08) background with amber (#c8a84b) and blood-red (#8b1a1a) accents. The amber evokes old CRT screens, classified stamps, and aged paper — creating unease without resorting to cliché horror purple.

**Layout Paradigm:** Document-page layout — content blocks appear as "filed pages" with torn edges, redaction bars, and margin annotations. No centered hero; instead the hero is a full-bleed atmospheric image with a stamped classification overlay.

**Signature Elements:**
- Black redaction bars that animate to reveal text on hover
- Rubber-stamp style badges ("CLASSIFIED", "REDACTED", "CASE FILE")
- Scan-line overlay on the entire page (CSS pseudo-element)

**Interaction Philosophy:** Reveal-based interactions — information is hidden by default and uncovered through user engagement, mirroring the act of investigating a classified file.

**Animation:** Typewriter text effect for the headline; flicker effect on the hero image; redaction bars slide away on hover with a 200ms ease-out.

**Typography System:**
- Headers: "Special Elite" (Google Fonts) — typewriter aesthetic
- Body: "Courier Prime" — monospaced, document-like
- Accent labels: "Oswald" condensed — stencil/stamp feel
</text>
<probability>0.08</probability>
</response>

<response>
<text>
### Idea B: "Signal Lost — Glitch Transmission"
**Design Movement:** Cyberpunk Signal Decay / VHS Glitch
**Core Principles:**
1. Deep navy-black base with neon cyan and static-white accents
2. Glitch animations — text displacement, RGB channel splits, scanline flicker
3. Fragmented grid layout: sections appear as corrupted data transmissions
4. Heavy use of noise textures and vignette effects

**Color Philosophy:** #050a12 background, #00e5ff cyan, #ff003c red-alert. Evokes a corrupted broadcast signal — the truth bleeding through government interference.

**Layout Paradigm:** Broken-grid with intentional misalignment — elements appear slightly off-register as if the page itself is glitching. Wide asymmetric columns.

**Signature Elements:**
- RGB channel-split text effect on hover
- Corrupted/pixelated section dividers
- "Signal strength" progress bars as decorative elements

**Interaction Philosophy:** Every interaction feels like tuning a broken radio — partial reveals, static transitions, corrupted data becoming clear.

**Animation:** Glitch keyframes on section entry; text flicker on CTAs; scanline sweep on scroll.

**Typography System:**
- Headers: "Share Tech Mono" — terminal/broadcast feel
- Body: "IBM Plex Mono" — technical, precise
- Labels: "Rajdhani" — futuristic condensed
</text>
<probability>0.07</probability>
</response>

<response>
<text>
### Idea C: "The Hatchery Files — Atmospheric Dread"
**Design Movement:** Analog Horror / Found Footage Document Aesthetic
**Core Principles:**
1. Extreme darkness — near-black backgrounds with very low-luminosity accents
2. Organic, handwritten annotations layered over typed text
3. Vertical scroll as narrative descent — the further you scroll, the more disturbing the content
4. Aged paper textures for content cards; raw concrete/soil textures for section backgrounds

**Color Philosophy:** #080806 background, #d4c89a parchment, #6b8c3e sickly olive-green accent. The palette evokes rotting files, bioluminescent organisms, and military field reports — deeply unsettling without being theatrical.

**Layout Paradigm:** Narrative scroll — each section is a "page" in a field report, with full-width atmospheric imagery and left-aligned document-style text blocks. No symmetry.

**Signature Elements:**
- Handwritten annotation overlays (SVG paths)
- Vignette darkening at section edges
- Organism/spore motif as a recurring graphic element

**Interaction Philosophy:** Passive dread — the site reveals its horror slowly through scroll-triggered animations, not user-initiated interactions.

**Animation:** Fade-in with slight upward drift on scroll; subtle pulse on the CTA button (like a heartbeat); hero image breathes with a slow scale oscillation.

**Typography System:**
- Headers: "Special Elite" — typewriter
- Body: "Lora" — elegant serif, creates contrast with the horror context
- Annotations: "Caveat" — handwritten, unsettling personal touch
</text>
<probability>0.06</probability>
</response>

## Selected Design: **Idea A — "Declassified Cold War Dossier"**

This approach most directly serves the "Grounded Authenticity" pillar of the production bible. The government-document aesthetic immediately establishes credibility and narrative immersion, while the amber-on-near-black palette creates psychological unease without relying on generic horror tropes. The reveal-based interactions mirror the investigative experience itself.
