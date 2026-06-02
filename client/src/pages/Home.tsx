/*
 * PROJECT SKYHARVEST — Home Page
 * Design: "Declassified Cold War Dossier"
 * Sections: Nav → Hero → Dossier → Experience Pillars → Briefing → Final CTA → Footer
 *
 * NEW FEATURES:
 *   1. "Official Story vs. The Truth" narrative modal (triggered from Dossier section)
 *   2. Live countdown timer in Final CTA section
 *   3. Typewriter click sound on redaction bar hover (Web Audio API — no external file needed)
 */

import React, { useCallback, useEffect, useRef, useState } from "react";

// ─── Asset URLs ────────────────────────────────────────────────────────────────
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-hero-Sn78RWLe8qXSodc5wcjgHN.webp";
const DOSSIER_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-dossier-CCiv2bUPjaK2mLVRVpRqUv.webp";
const ORGANISM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-organism-HQ87xyxTM6v2cXNQhJxeht.webp";
const FIELD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-field-fWpY6q4rabeYE6Hw8EWk4T.webp";

const BOOKING_URL = "https://offthecouch.io/book/STALK";

// ─── Gallery image URLs ────────────────────────────────────────────────────────
const GALLERY_ITEMS = [
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/gallery-1-hatchery-3ndtY4znRBvqWhSLTBmHZ2.webp",
    label: "HATCHERY B-103",
    caption: "Specimen extraction laboratory — Level 5 clearance required",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/gallery-2-corridor-aeWJHdXfU5C54JdcRdY8Wm.webp",
    label: "RESTRICTED CORRIDOR",
    caption: "Underground access tunnel — photography prohibited",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/gallery-3-console-GJE8r3WT4uWW3z2XosNnvY.webp",
    label: "MONITORING STATION",
    caption: "Signal intercept console — last active October 14, 1994",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/gallery-4-outdoor-MgYuSCQitdvrTnjrXSUS2w.webp",
    label: "INCIDENT SITE",
    caption: "Peterborough County — restricted perimeter, active containment",
  },
  {
    src: "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/gallery-5-specimen-CREKyBuW9cbdyutN3DhodL.webp",
    label: "HARVESTER-7",
    caption: "Organism specimen — do not expose to open air",
  },
];

// ─── Event window: October 2 – 31, 2026 ─────────────────────────────────────
const EVENT_START = new Date("2026-10-02T19:00:00");

function getNextBookingDate(): Date {
  return EVENT_START;
}

// ─── Web Audio typewriter click synthesiser ───────────────────────────────────
let audioCtx: AudioContext | null = null;

function playTypewriterClick() {
  try {
    if (!audioCtx) audioCtx = new AudioContext();
    const ctx = audioCtx;
    // Short burst of clicks — mechanical typewriter key feel
    const clickCount = 4;
    for (let i = 0; i < clickCount; i++) {
      const t = ctx.currentTime + i * 0.045;
      // Noise burst
      const bufferSize = ctx.sampleRate * 0.02;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let j = 0; j < bufferSize; j++) {
        data[j] = (Math.random() * 2 - 1) * Math.exp(-j / (bufferSize * 0.3));
      }
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      // High-pass filter to make it crisp/clicky
      const filter = ctx.createBiquadFilter();
      filter.type = "highpass";
      filter.frequency.value = 2200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.018);
      source.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      source.start(t);
      source.stop(t + 0.02);
    }
  } catch {
    // Silently fail if audio not available
  }
}

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, visible };
}

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 55, startDelay = 400) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    let i = 0;
    const timeout = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);
  return { displayed, done };
}

// ─── Gallery section ──────────────────────────────────────────────────────────
function GallerySection() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const dragStartX = useRef(0);
  const scrollStartX = useRef(0);
  const { ref: sectionRef, visible } = useScrollReveal();

  // Update active index based on scroll position
  const handleScroll = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / GALLERY_ITEMS.length;
    const idx = Math.round(el.scrollLeft / cardW);
    setActiveIdx(Math.min(idx, GALLERY_ITEMS.length - 1));
  }, []);

  // Mouse drag-to-scroll
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartX.current = e.clientX;
    scrollStartX.current = trackRef.current?.scrollLeft ?? 0;
  }, []);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !trackRef.current) return;
    const delta = dragStartX.current - e.clientX;
    trackRef.current.scrollLeft = scrollStartX.current + delta;
  }, [isDragging]);

  const onMouseUp = useCallback(() => setIsDragging(false), []);

  // Scroll to card
  const scrollTo = useCallback((idx: number) => {
    const el = trackRef.current;
    if (!el) return;
    const cardW = el.scrollWidth / GALLERY_ITEMS.length;
    el.scrollTo({ left: cardW * idx, behavior: "smooth" });
    setActiveIdx(idx);
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 relative overflow-hidden"
      style={{
        background: "#080806",
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {/* Section header */}
      <div className="container mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span
              className="stamp-badge text-xs"
              style={{ color: "#c8a84b", borderColor: "#c8a84b" }}
            >
              EVIDENCE FILE
            </span>
            <h2
              className="text-sm font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Oswald', sans-serif", color: "#d4c89a" }}
            >
              Recovered Documentation
            </h2>
          </div>
          <p
            className="hidden sm:block text-xs tracking-widest opacity-40"
            style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
          >
            ← DRAG TO SCROLL →
          </p>
        </div>
      </div>

      {/* Horizontal scroll track */}
      <div
        ref={trackRef}
        className="gallery-track flex gap-4 overflow-x-auto pb-4 px-4 sm:px-8"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          cursor: isDragging ? "grabbing" : "grab",
          userSelect: "none",
          WebkitOverflowScrolling: "touch",
          scrollSnapType: "x mandatory",
        }}
        onScroll={handleScroll}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Left padding spacer aligned to container */}
        <div className="shrink-0" style={{ width: "max(1rem, calc((100vw - 1280px) / 2))" }} />

        {GALLERY_ITEMS.map((item, i) => (
          <div
            key={i}
            className="shrink-0 relative overflow-hidden group"
            style={{
              width: "clamp(260px, 38vw, 520px)",
              scrollSnapAlign: "start",
              border: "1px solid rgba(200,168,75,0.18)",
              transition: "border-color 0.3s ease",
              borderColor: activeIdx === i ? "rgba(200,168,75,0.5)" : "rgba(200,168,75,0.18)",
            }}
            onClick={() => scrollTo(i)}
          >
            {/* Image */}
            <div className="relative overflow-hidden" style={{ aspectRatio: "3/2" }}>
              <img
                src={item.src}
                alt={item.label}
                draggable={false}
                className="w-full h-full object-cover transition-transform duration-700"
                style={{
                  filter: "brightness(0.75) contrast(1.1) sepia(0.15)",
                  transform: activeIdx === i ? "scale(1.04)" : "scale(1)",
                }}
              />
              {/* Scan-line overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)",
                }}
              />
              {/* Hover gradient */}
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(to top, rgba(10,10,8,0.9) 0%, rgba(10,10,8,0.2) 50%, transparent 100%)",
                  opacity: activeIdx === i ? 1 : 0.6,
                }}
              />
              {/* File number badge */}
              <div
                className="absolute top-3 left-3"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  fontSize: "0.6rem",
                  color: "rgba(200,168,75,0.5)",
                  letterSpacing: "0.15em",
                }}
              >
                IMG-{String(i + 1).padStart(3, "0")} / NRC-1995
              </div>
            </div>

            {/* Caption bar */}
            <div
              className="px-4 py-3"
              style={{ background: "rgba(10,10,8,0.95)" }}
            >
              <p
                className="text-xs font-bold tracking-widest uppercase mb-1"
                style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
              >
                {item.label}
              </p>
              <p
                className="text-xs leading-relaxed opacity-60"
                style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}
              >
                {item.caption}
              </p>
            </div>
          </div>
        ))}

        {/* Right padding spacer */}
        <div className="shrink-0" style={{ width: "max(1rem, calc((100vw - 1280px) / 2))" }} />
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {GALLERY_ITEMS.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Go to image ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width: activeIdx === i ? "1.5rem" : "0.4rem",
              height: "0.4rem",
              background: activeIdx === i ? "#c8a84b" : "rgba(200,168,75,0.25)",
              border: "none",
              borderRadius: "2px",
            }}
          />
        ))}
      </div>


    </section>
  );
}

// ─── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(target: Date) {
  const calc = () => {
    const diff = Math.max(0, target.getTime() - Date.now());
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff % 86400000) / 3600000),
      minutes: Math.floor((diff % 3600000) / 60000),
      seconds: Math.floor((diff % 60000) / 1000),
    };
  };
  const [time, setTime] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setTime(calc()), 1000);
    return () => clearInterval(id);
  });
  return time;
}

// ─── Redaction bar with sound ──────────────────────────────────────────────────
function RedactBar({ text }: { text: string }) {
  const [hovered, setHovered] = useState(false);
  const handleEnter = useCallback(() => {
    setHovered(true);
    playTypewriterClick();
  }, []);
  const handleLeave = useCallback(() => setHovered(false), []);

  return (
    <span
      className="redact-bar inline-block w-full my-1"
      title="Hover to reveal"
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      tabIndex={0}
      role="button"
      aria-label={`Classified: ${text}`}
      style={{ outline: "none" }}
    >
      <span className="revealed-text" style={{ opacity: hovered ? 1 : 0, transition: "opacity 0.3s ease-out 0.1s" }}>
        {text}
      </span>
    </span>
  );
}

// ─── Pillar card ───────────────────────────────────────────────────────────────
interface PillarProps { icon: string; title: string; body: string; delay: number; }
function PillarCard({ icon, title, body, delay }: PillarProps) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className="doc-card p-6 flex flex-col gap-3"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s cubic-bezier(0.23,1,0.32,1) ${delay}ms`,
      }}
    >
      <div className="text-3xl mb-1">{icon}</div>
      <h3 className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "#a89060", fontFamily: "'Courier Prime', monospace" }}>
        {body}
      </p>
    </div>
  );
}

// ─── Section wrapper ───────────────────────────────────────────────────────────
function RevealSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { ref, visible } = useScrollReveal();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(32px)",
        transition: "opacity 0.7s ease-out, transform 0.7s cubic-bezier(0.23,1,0.32,1)",
      }}
    >
      {children}
    </div>
  );
}

// ─── Countdown digit block ─────────────────────────────────────────────────────
function CountdownUnit({ value, label }: { value: number; label: string }) {
  const display = String(value).padStart(2, "0");
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="relative overflow-hidden"
        style={{
          background: "rgba(200,168,75,0.06)",
          border: "1px solid rgba(200,168,75,0.25)",
          padding: "0.6rem 1rem",
          minWidth: "4.5rem",
        }}
      >
        {/* Scan-line accent */}
        <div
          className="absolute inset-x-0 top-1/2 h-px"
          style={{ background: "rgba(200,168,75,0.12)", transform: "translateY(-50%)" }}
        />
        <span
          className="block text-3xl sm:text-4xl font-bold tabular-nums digit-flip"
          key={display}
          style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b", letterSpacing: "0.05em" }}
        >
          {display}
        </span>
      </div>
      <span
        className="text-xs tracking-widest uppercase opacity-50"
        style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
      >
        {label}
      </span>
    </div>
  );
}

// ─── Official Story vs. The Truth Modal ───────────────────────────────────────
function NarrativeModal({ onClose }: { onClose: () => void }) {
  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Prevent body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const columns: { side: "official" | "truth"; label: string; stamp: string; stampColor: string; rows: { field: string; text: string }[] }[] = [
    {
      side: "official",
      label: "THE OFFICIAL STORY",
      stamp: "APPROVED",
      stampColor: "#3a6b3a",
      rows: [
        { field: "INCIDENT DATE", text: "No incident recorded. Routine agricultural survey, October 1994." },
        { field: "NRC FINDINGS", text: "4,500 catalogued sightings attributed to weather phenomena, aircraft, and mass hysteria. Files closed 1995." },
        { field: "PETERBOROUGH SITE", text: "Farmland acquired for conservation purposes. No anomalies detected. Public access restricted for ecological preservation." },
        { field: "ORGANISM STATUS", text: "No biological agent identified. Soil samples within normal parameters. No threat to public health." },
        { field: "FILE CLOSURE", text: "Project SkyHarvest officially terminated. All personnel reassigned. Records sealed under the Access to Information Act." },
      ],
    },
    {
      side: "truth",
      label: "THE TRUTH",
      stamp: "CLASSIFIED",
      stampColor: "#8b1a1a",
      rows: [
        { field: "INCIDENT DATE", text: "Object recovered October 14, 1994. Crash site contained within 6 hours. Three NRC scientists quarantined." },
        { field: "NRC FINDINGS", text: "Organism HARVESTER-7 identified. Non-terrestrial origin confirmed. Memory-consumption mechanism documented in 47 suppressed reports." },
        { field: "PETERBOROUGH SITE", text: "Hatchery structure discovered 12 metres below the surface. Organism colony still active. Containment failing as of May 2026." },
        { field: "ORGANISM STATUS", text: "HARVESTER-7 reproduces via memory transfer. Hosts retain motor function but lose identity within 72 hours. No known cure." },
        { field: "FILE CLOSURE", text: "Files not closed — reclassified UMBRA. Investigators sent to the site have not returned. The phenomenon is reawakening." },
      ],
    },
  ];

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.88)", backdropFilter: "blur(4px)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto modal-enter"
        style={{
          background: "#0e0e0c",
          border: "1px solid rgba(200,168,75,0.3)",
          boxShadow: "0 0 80px rgba(0,0,0,0.8), inset 0 0 40px rgba(0,0,0,0.4)",
        }}
      >
        {/* Modal header */}
        <div
          className="sticky top-0 z-10 flex items-center justify-between px-6 py-4"
          style={{ background: "#0e0e0c", borderBottom: "1px solid rgba(200,168,75,0.15)" }}
        >
          <div className="flex items-center gap-4">
            <span className="stamp-badge text-xs" style={{ color: "#8b1a1a", borderColor: "#8b1a1a" }}>
              TOP SECRET
            </span>
            <h2
              className="text-sm sm:text-base font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a" }}
            >
              Comparative Intelligence Assessment — Case File NRC-1995-4521
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-xs tracking-widest uppercase px-3 py-1.5 transition-colors duration-200"
            style={{
              fontFamily: "'Oswald', sans-serif",
              color: "#a89060",
              border: "1px solid rgba(200,168,75,0.2)",
            }}
            aria-label="Close modal"
          >
            ✕ CLOSE
          </button>
        </div>

        {/* Two-column comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x"
          style={{ divideColor: "rgba(200,168,75,0.15)" } as React.CSSProperties}
        >
          {columns.map((col) => (
            <div key={col.side} className="p-6 flex flex-col gap-5">
              {/* Column header */}
              <div className="flex items-center justify-between mb-2">
                <h3
                  className="text-xs font-bold tracking-widest uppercase"
                  style={{ fontFamily: "'Oswald', sans-serif", color: col.side === "official" ? "#6b8c3e" : "#8b1a1a" }}
                >
                  {col.label}
                </h3>
                <span
                  className="stamp-badge text-xs"
                  style={{ color: col.stampColor, borderColor: col.stampColor, transform: `rotate(${col.side === "official" ? "-2deg" : "3deg"})` }}
                >
                  {col.stamp}
                </span>
              </div>

              {/* Rows */}
              {col.rows.map((row) => (
                <div
                  key={row.field}
                  className="flex flex-col gap-1 pb-4"
                  style={{ borderBottom: "1px solid rgba(200,168,75,0.08)" }}
                >
                  <span
                    className="text-xs tracking-widest uppercase opacity-50"
                    style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
                  >
                    {row.field}
                  </span>
                  <p
                    className="text-sm leading-relaxed"
                    style={{
                      fontFamily: "'Courier Prime', monospace",
                      color: col.side === "official" ? "#7a8c6a" : "#c8a84b",
                      fontStyle: col.side === "official" ? "italic" : "normal",
                    }}
                  >
                    {row.text}
                  </p>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Modal footer CTA */}
        <div
          className="px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(200,168,75,0.15)", background: "rgba(139,26,26,0.06)" }}
        >
          <p
            className="text-xs leading-relaxed max-w-md"
            style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}
          >
            Now that you know what they buried — are you prepared to face it?
          </p>
          <a
            href="#book"
            className="btn-classified text-xs shrink-0"
            onClick={(e) => { e.preventDefault(); onClose(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }}
          >
            ▶ Book Your Investigation
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Booking Widget (Off The Couch iframe) ────────────────────────────────────
function BookingWidget() {
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const f = document.createElement("iframe");
    f.src = "https://offthecouch.io/book/STALK";
    f.id = "bookingIframe";
    f.width = "100%";
    f.scrolling = "no";
    f.style.border = "none";
    f.style.display = "block";
    f.style.overflow = "hidden";
    f.style.height = "auto";
    f.title = "Book Project SkyHarvest";

    let userHasInteracted = false;

    const handleMessage = (e: MessageEvent) => {
      if (e.origin !== "https://offthecouch.io") return;

      if (e.data.action === "updateHeight") {
        f.style.height = e.data.height + "px";
      }

      if (e.data.action === "scrollToTop" && userHasInteracted) {
        const scrollTop = container.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: scrollTop - 30, behavior: "smooth" });
      }

      if (e.data.eventType && e.data.eventType !== "page_view") {
        userHasInteracted = true;
      }

      (window as any).dataLayer = (window as any).dataLayer || [];
      const gtag = (...args: any[]) => { (window as any).dataLayer.push(args); };

      switch (e.data.eventType) {
        case "page_view":
          gtag("event", "page_view");
          break;
        case "add_to_cart":
          userHasInteracted = true;
          gtag("event", "add_to_cart", { currency: e.data.currency, value: e.data.eventValue });
          break;
        case "begin_checkout":
          userHasInteracted = true;
          gtag("event", "begin_checkout", { currency: e.data.currency, value: e.data.eventValue });
          break;
        case "purchase":
          gtag("event", "purchase", { currency: e.data.currency, value: e.data.eventValue });
          break;
        case "success":
          gtag("event", "success", { currency: e.data.currency, value: e.data.eventValue });
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    container.appendChild(f);

    return () => {
      window.removeEventListener("message", handleMessage);
      if (container.contains(f)) container.removeChild(f);
    };
  }, []);

  return <div ref={containerRef} id="otcContainer" />;
}

// ─── Main Home component ───────────────────────────────────────────────────────
export default function Home() {
  const headline = "PROJECT SKYHARVEST: THE TRUTH IS BURIED.";
  const { displayed, done } = useTypewriter(headline, 48, 600);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [showStickyBtn, setShowStickyBtn] = useState(false);

  // Countdown target — October 2, 2026 event start
  const [bookingTarget] = useState(() => getNextBookingDate());
  const countdown = useCountdown(bookingTarget);

  useEffect(() => {
    const handler = () => {
      setNavScrolled(window.scrollY > 60);
      // Show sticky button after scrolling ~80vh (past the hero)
      setShowStickyBtn(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a08", color: "#c8a84b" }}>

      {/* ── NARRATIVE MODAL ────────────────────────────────────────────────── */}
      {modalOpen && <NarrativeModal onClose={() => setModalOpen(false)} />}

      {/* ── STICKY MOBILE BOOK NOW BUTTON ──────────────────────────────── */}
      <div
        className="fixed bottom-5 left-1/2 z-50 sm:hidden"
        style={{
          transform: showStickyBtn ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(120px)",
          transition: "transform 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.35s ease",
          opacity: showStickyBtn ? 1 : 0,
          pointerEvents: showStickyBtn ? "auto" : "none",
        }}
      >
        <a
          href="#book"
          onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }}
          className="flex items-center gap-2 px-6 py-3 text-sm font-bold tracking-widest uppercase"
          style={{
            fontFamily: "'Oswald', sans-serif",
            background: "#c8a84b",
            color: "#0a0a08",
            boxShadow: "0 4px 24px rgba(200,168,75,0.45), 0 2px 8px rgba(0,0,0,0.6)",
            letterSpacing: "0.12em",
          }}
        >
          <span style={{ fontSize: "0.75rem" }}>►</span>
          Book Now
        </a>
      </div>

      {/* ── NAV ────────────────────────────────────────────────────────────── */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: navScrolled ? "rgba(10,10,8,0.96)" : "transparent",
          borderBottom: navScrolled ? "1px solid rgba(200,168,75,0.2)" : "none",
          backdropFilter: navScrolled ? "blur(8px)" : "none",
        }}
      >
        <div className="container flex items-center justify-between py-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <span className="stamp-badge text-xs" style={{ color: "#8b1a1a", borderColor: "#8b1a1a", transform: "rotate(-2deg)" }}>
              CLASSIFIED
            </span>
            <span className="text-sm font-bold tracking-widest uppercase" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
              Project SkyHarvest
            </span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {["The Dossier", "The Experience", "Briefing"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(/\s+/g, "-").replace("the-", "")}`}
                className="text-xs tracking-widest uppercase transition-colors duration-200 hover:text-amber-300"
                style={{ fontFamily: "'Oswald', sans-serif", color: "#a89060" }}
              >
                {item}
              </a>
            ))}
            <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-classified text-xs py-2 px-5">
              Book Now
            </a>
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden flex flex-col gap-1.5 p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Toggle menu">
            {[0, 1, 2].map((i) => (
              <span key={i} className="block w-6 h-0.5 transition-all duration-200" style={{ background: "#c8a84b" }} />
            ))}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t" style={{ background: "rgba(10,10,8,0.98)", borderColor: "rgba(200,168,75,0.2)" }}>
            <div className="container py-4 flex flex-col gap-4">
              {["The Dossier", "The Experience", "Briefing"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-").replace("the-", "")}`}
                  className="text-xs tracking-widest uppercase"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "#a89060" }}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item}
                </a>
              ))}
              <a
                href="#book"
                className="btn-classified text-xs py-2 px-5 text-center"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }}
              >
                Book Now
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col items-start justify-end overflow-hidden flicker" style={{ background: "#0a0a08" }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${HERO_IMG})`, filter: "brightness(0.55) contrast(1.1)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, #0a0a08 0%, rgba(10,10,8,0.6) 40%, rgba(10,10,8,0.2) 100%)" }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)" }} />

        <div className="relative container pb-24 pt-32 z-10">
          <div className="flex items-center gap-4 mb-6">
            <span className="stamp-badge" style={{ color: "#8b1a1a", borderColor: "#8b1a1a", fontSize: "0.7rem" }}>TOP SECRET</span>
            <span className="text-xs tracking-widest opacity-60" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
              FILE NO. NRC-1995-4521 — PETERBOROUGH INCIDENT
            </span>
          </div>

          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl"
            style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a", textShadow: "0 0 40px rgba(200,168,75,0.3)" }}
          >
            {displayed}
            {!done && (
              <span className="inline-block w-0.5 h-10 ml-1 align-middle" style={{ background: "#c8a84b", animation: "blink-cursor 0.8s step-end infinite" }} />
            )}
          </h1>

          <p className="text-base sm:text-lg md:text-xl max-w-2xl mb-10 leading-relaxed" style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}>
            In 1995, the Canadian government shuttered the files. They claimed they found nothing.{" "}
            <em style={{ color: "#c8a84b" }}>They lied.</em>
          </p>

          <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-classified pulse-amber inline-block text-sm">
            ▶ Book Your Investigation
          </a>

          <div className="mt-16 flex items-center gap-3 opacity-40">
            <div className="w-px h-8" style={{ background: "linear-gradient(to bottom, transparent, #c8a84b)" }} />
            <span className="text-xs tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>SCROLL TO INVESTIGATE</span>
          </div>
        </div>
      </section>

      {/* ── DOSSIER ────────────────────────────────────────────────────────── */}
      <section id="dossier" className="py-24 relative" style={{ background: "#0c0c0a" }}>
        <div className="section-divider mb-16" />
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: Dossier image */}
            <RevealSection>
              <div className="relative">
                <img
                  src={DOSSIER_IMG}
                  alt="Classified Government Dossier — Project SkyHarvest"
                  className="w-full object-cover"
                  style={{ filter: "sepia(0.3) contrast(1.1)", border: "1px solid rgba(200,168,75,0.3)" }}
                />
                <div
                  className="absolute top-6 right-6 stamp-badge text-lg"
                  style={{ color: "#8b1a1a", borderColor: "#8b1a1a", borderWidth: "4px", transform: "rotate(8deg)", opacity: 0.9 }}
                >
                  REDACTED
                </div>
              </div>
            </RevealSection>

            {/* Right: Narrative copy */}
            <RevealSection className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="stamp-badge text-xs" style={{ color: "#c8a84b", borderColor: "#c8a84b" }}>THE DOSSIER</span>
                <span className="text-xs opacity-40 tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>CASE FILE: BRAIN PLAGUE</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold leading-snug" style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a" }}>
                The Peterborough Incident
              </h2>

              <p className="text-sm leading-loose" style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}>
                For 45 years, the National Research Council cataloged over{" "}
                <strong style={{ color: "#c8a84b" }}>4,500 sightings</strong>. Then came the Peterborough
                incident. A crash on a local farm. A microscopic organism that{" "}
                <strong style={{ color: "#c8a84b" }}>consumes memories</strong>. The site was sealed, but
                the phenomenon is reawakening.
              </p>

              {/* Redaction bars with typewriter sound */}
              <div
                className="doc-card p-5 flex flex-col gap-2 mt-2"
                style={{ fontFamily: "'Courier Prime', monospace", fontSize: "0.8rem", color: "#a89060" }}
              >
                <p className="text-xs tracking-widest uppercase mb-3 opacity-60" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  ↓ Hover to declassify
                </p>
                <div className="flex gap-2 items-center">
                  <span className="opacity-60 shrink-0">SUBJECT:</span>
                  <RedactBar text="ORGANISM DESIGNATION: HARVESTER-7 / MEMORY CONSUMPTION CONFIRMED" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="opacity-60 shrink-0">LOCATION:</span>
                  <RedactBar text="PETERBOROUGH COUNTY FARM — COORDINATES WITHHELD" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="opacity-60 shrink-0">STATUS:</span>
                  <RedactBar text="SITE SEALED 1995 — CONTAINMENT BREACH DETECTED MAY 2026" />
                </div>
                <div className="flex gap-2 items-center">
                  <span className="opacity-60 shrink-0">DIRECTIVE:</span>
                  <RedactBar text="ALL INVESTIGATORS MUST REPORT TO THE HATCHERY IMMEDIATELY" />
                </div>
              </div>

              {/* Action row: Access Files + Official Story modal trigger */}
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-classified inline-block text-xs">
                  Access The Files →
                </a>
                <button
                  onClick={() => setModalOpen(true)}
                  className="text-xs tracking-widest uppercase transition-colors duration-200 underline underline-offset-4"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "#6b8c3e", background: "none", border: "none" }}
                >
                  Official Story vs. The Truth ↗
                </button>
              </div>
            </RevealSection>
          </div>
        </div>
        <div className="section-divider mt-16" />
      </section>

      {/* ── EXPERIENCE PILLARS ─────────────────────────────────────────────── */}
      <section id="experience" className="py-24 relative" style={{ background: "#0a0a08" }}>
        <div className="container">
          <RevealSection className="text-center mb-14">
            <span className="stamp-badge text-xs mb-4 inline-block" style={{ color: "#c8a84b", borderColor: "#c8a84b" }}>
              MISSION PARAMETERS
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-4" style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a" }}>
              Why This Is Different
            </h2>
            <p className="text-sm mt-3 max-w-xl mx-auto opacity-70" style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}>
              This is not a haunted house. This is an investigation.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PillarCard icon="🧠" title="Psychological Dread" body="Prioritizing suspense, paranoia, and immersive atmosphere over cheap jump scares. Your mind is the weapon." delay={0} />
            <PillarCard icon="📁" title="Grounded Authenticity" body="Rooted in real Canadian government UFO investigation history. The NRC files were real. The cover-up was real." delay={100} />
            <PillarCard icon="⏱" title="Collaborative Urgency" body="60 minutes. 10 haunted stations. Work together or be consumed. Every second counts." delay={200} />
            <PillarCard icon="🔦" title="Total Immersion" body="A 10-station emotional journey designed to test your sanity. Outdoor terrain. Low light. No escape from the truth." delay={300} />
          </div>
        </div>
      </section>

      {/* ── ORGANISM INTERLUDE ─────────────────────────────────────────────── */}
      <section className="relative py-0 overflow-hidden" style={{ minHeight: "40vh" }}>
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${ORGANISM_IMG})`, filter: "brightness(0.3) saturate(0.8)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to right, #0a0a08 0%, transparent 30%, transparent 70%, #0a0a08 100%)" }} />
        <div className="relative container py-20 z-10 flex flex-col items-center text-center">
          <RevealSection>
            <p
              className="text-lg sm:text-xl md:text-2xl max-w-2xl leading-relaxed italic"
              style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a", textShadow: "0 0 30px rgba(0,0,0,0.8)" }}
            >
              "The organism does not kill. It harvests. Memory by memory. Until nothing remains but the host — empty, compliant, and waiting."
            </p>
            <p className="text-xs mt-4 tracking-widest opacity-50" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
              — NRC INTERNAL MEMO, 1994 [REDACTED]
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── GALLERY ────────────────────────────────────────────────────────── */}
      <GallerySection />

      {/* ── BRIEFING / LOGISTICS ───────────────────────────────────────────── */}
      <section id="briefing" className="py-24 relative" style={{ background: "#0c0c0a" }}>
        <div className="section-divider mb-16" />
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            <RevealSection>
              <div className="relative">
                <img
                  src={FIELD_IMG}
                  alt="The Peterborough incident site — remote Canadian farm"
                  className="w-full object-cover"
                  style={{ filter: "brightness(0.8) contrast(1.1) sepia(0.15)", border: "1px solid rgba(200,168,75,0.2)" }}
                />
                <div className="absolute bottom-0 left-0 right-0 p-4" style={{ background: "linear-gradient(to top, rgba(10,10,8,0.95), transparent)" }}>
                  <p className="text-xs tracking-widest opacity-60" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
                    INCIDENT SITE — PETERBOROUGH COUNTY, 1994
                  </p>
                </div>
              </div>
            </RevealSection>

            <RevealSection className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <span className="stamp-badge text-xs" style={{ color: "#c8a84b", borderColor: "#c8a84b" }}>FIELD BRIEFING</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-bold leading-snug" style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a" }}>
                Operational Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Duration", value: "60-Minute Immersive Experience", icon: "⏱" },
                  { label: "Location", value: "Escape Maze — Peterborough, ON", icon: "📍" },
                  { label: "Difficulty", value: "Investigative / Mental Focus", icon: "🧩" },
                  { label: "Group Size", value: "Teams Welcome — Collaborate or Fail", icon: "👥" },
                ].map((item) => (
                  <div key={item.label} className="doc-card p-4 flex gap-3 items-start">
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-xs tracking-widest uppercase opacity-60 mb-1" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
                        {item.label}
                      </p>
                      <p className="text-sm" style={{ fontFamily: "'Courier Prime', monospace", color: "#d4c89a" }}>
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-l-4 mt-2" style={{ borderColor: "#8b1a1a", background: "rgba(139,26,26,0.08)", fontFamily: "'Courier Prime', monospace" }}>
                <p className="text-xs tracking-widest uppercase font-bold mb-2" style={{ fontFamily: "'Oswald', sans-serif", color: "#8b1a1a" }}>
                  ⚠ ADVISORY WARNING
                </p>
                <p className="text-xs leading-relaxed" style={{ color: "#a89060" }}>
                  This experience involves <strong style={{ color: "#c8a84b" }}>outdoor terrain</strong>,{" "}
                  <strong style={{ color: "#c8a84b" }}>low-light environments</strong>, and intense{" "}
                  <strong style={{ color: "#c8a84b" }}>psychological atmosphere</strong>. Not recommended for
                  those with severe anxiety or photosensitivity. The government cannot be held responsible for
                  what you remember — or what you forget.
                </p>
              </div>

              <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-classified inline-block text-xs self-start mt-2">
                Secure Your Spot →
              </a>
            </RevealSection>
          </div>
        </div>
        <div className="section-divider mt-16" />
      </section>


      {/* ── SURVIVORS' TESTIMONIALS ─────────────────────────────────────────── */}
      <section className="relative py-24" style={{ background: "#080806" }}>
        <div className="container">
          <RevealSection>
            <div className="text-center mb-14">
              <span className="stamp-badge text-xs mb-4 inline-block" style={{ color: "#8b1a1a", borderColor: "#8b1a1a" }}>WITNESS STATEMENTS — FILE NRC-1995-4521</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4" style={{ fontFamily: "'Special Elite', cursive", color: "#c8a84b" }}>
                Those Who Entered. Those Who Returned.
              </h2>
              <p className="text-sm mt-3 max-w-xl mx-auto opacity-60" style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}>
                The following statements were collected from pre-launch test subjects. Names have been partially redacted per NRC Protocol 7.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                quote: "I've done a dozen escape rooms. Nothing prepared me for this. The moment the lights changed in Station 4, I genuinely forgot it was a game. My hands were shaking when we finally got out.",
                name: "K. ████████",
                role: "Pre-Launch Test Subject #003",
                rating: 5,
              },
              {
                quote: "The dossier they hand you at the start — I thought it was a prop. It wasn't. The research behind this is unsettling in the best possible way. We talked about it for days after.",
                name: "D. █████████",
                role: "Pre-Launch Test Subject #007",
                rating: 5,
              },
              {
                quote: "Our team of four thought we were ready. We were not. The atmosphere is unlike anything I've experienced. It's not just an escape room — it's a psychological investigation.",
                name: "M. ███████",
                role: "Pre-Launch Test Subject #011",
                rating: 5,
              },
              {
                quote: "I kept expecting a jump scare. It never came. Instead it was this slow, creeping dread that built the entire 60 minutes. Far more effective. I'm still thinking about what we found in Station 9.",
                name: "T. ██████████",
                role: "Pre-Launch Test Subject #014",
                rating: 5,
              },
            ].map((t, i) => (
              <RevealSection key={i}>
                <div
                  className="relative p-6 flex flex-col gap-4"
                  style={{
                    background: "rgba(200,168,75,0.03)",
                    border: "1px solid rgba(200,168,75,0.12)",
                    borderLeft: "3px solid rgba(200,168,75,0.4)",
                  }}
                >
                  <div className="absolute top-3 right-3 opacity-20">
                    <span className="stamp-badge text-xs" style={{ color: "#8b1a1a", borderColor: "#8b1a1a", fontSize: "0.55rem", padding: "1px 4px" }}>REDACTED</span>
                  </div>
                  <div className="flex gap-0.5">
                    {Array.from({ length: t.rating }).map((_, s) => (
                      <span key={s} style={{ color: "#c8a84b", fontSize: "0.8rem" }}>★</span>
                    ))}
                  </div>
                  <p
                    className="text-sm leading-relaxed italic"
                    style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}
                  >
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(200,168,75,0.1)" }}>
                    <p className="text-xs font-bold" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b", letterSpacing: "0.08em" }}>{t.name}</p>
                    <p className="text-xs opacity-50 mt-0.5" style={{ fontFamily: "'Courier Prime', monospace", color: "#6b5c3a" }}>{t.role}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOOKING WIDGET ──────────────────────────────────────────────────── */}
      <section id="book" className="relative py-20" style={{ background: "#0a0a08" }}>
        <div className="container">
          <RevealSection>
            <div className="text-center mb-10">
              <span className="stamp-badge text-xs mb-4 inline-block" style={{ color: "#8b1a1a", borderColor: "#8b1a1a" }}>SECURE BOOKING PORTAL</span>
              <h2 className="text-3xl sm:text-4xl font-bold mt-4" style={{ fontFamily: "'Special Elite', cursive", color: "#c8a84b" }}>
                Reserve Your Investigation
              </h2>
              <p className="text-sm mt-3 opacity-60" style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}>
                October 2 – 31, 2026 · Nightly Investigations · Limited Slots
              </p>
            </div>
          </RevealSection>
          <div
            className="max-w-3xl mx-auto"
            style={{
              border: "1px solid rgba(200,168,75,0.15)",
              background: "rgba(200,168,75,0.02)",
              padding: "1.5rem",
            }}
          >
            <BookingWidget />
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="relative py-32 overflow-hidden" style={{ background: "#0a0a08" }}>
        <div className="absolute inset-0 bg-cover bg-center opacity-15" style={{ backgroundImage: `url(${HERO_IMG})` }} />
        <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at center, rgba(10,10,8,0.3) 0%, #0a0a08 70%)" }} />

        <div className="relative container z-10 text-center">
          <RevealSection>
            <span className="stamp-badge text-xs mb-6 inline-block" style={{ color: "#8b1a1a", borderColor: "#8b1a1a" }}>
              FINAL TRANSMISSION
            </span>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl mx-auto"
              style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a", textShadow: "0 0 40px rgba(200,168,75,0.2)" }}
            >
              The files are reopening.
              <br />
              <span style={{ color: "#c8a84b" }}>The Hatchery is waiting.</span>
            </h2>

            <p className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}>
              Are you prepared to face what they buried?
            </p>

            {/* ── COUNTDOWN TIMER ──────────────────────────────────────────── */}
            <div className="mb-10">
              <p
                className="text-xs tracking-widest uppercase mb-5 opacity-60"
                style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
              >
                Next Investigation Window Opens In
              </p>
              <div className="flex items-start justify-center gap-3 sm:gap-5">
                <CountdownUnit value={countdown.days} label="Days" />
                <span
                  className="text-3xl sm:text-4xl font-bold mt-1.5"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(200,168,75,0.4)" }}
                >
                  :
                </span>
                <CountdownUnit value={countdown.hours} label="Hours" />
                <span
                  className="text-3xl sm:text-4xl font-bold mt-1.5"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(200,168,75,0.4)" }}
                >
                  :
                </span>
                <CountdownUnit value={countdown.minutes} label="Min" />
                <span
                  className="text-3xl sm:text-4xl font-bold mt-1.5"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "rgba(200,168,75,0.4)" }}
                >
                  :
                </span>
                <CountdownUnit value={countdown.seconds} label="Sec" />
              </div>
              <p
                className="text-xs mt-4 opacity-35 tracking-wider"
                style={{ fontFamily: "'Courier Prime', monospace", color: "#c8a84b" }}
              >
                October 2 – 31, 2026 · Nightly Investigations
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4">
              <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById("book")?.scrollIntoView({ behavior: "smooth" }); }} className="btn-classified pulse-amber inline-block text-sm">
                ▶ Secure Your Spot — Book Now
              </a>
              <a
                href={`sms:?&body=${encodeURIComponent("We should do this! Project SkyHarvest — a 60-min immersive investigation experience near Peterborough. The truth is buried: https://projectskyharvest.ca")}`}
                className="inline-flex items-center gap-2 text-xs tracking-widest uppercase transition-all duration-200 hover:opacity-80 active:scale-95"
                style={{
                  fontFamily: "'Oswald', sans-serif",
                  color: "#c8a84b",
                  border: "1px solid rgba(200,168,75,0.35)",
                  padding: "0.6rem 1.2rem",
                  letterSpacing: "0.1em",
                }}
                title="Share via SMS"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                Tell a Friend
              </a>
            </div>

            <p className="text-xs mt-8 tracking-widest opacity-50" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
              LIMITED INVESTIGATION SLOTS AVAILABLE — BOOK BEFORE THEY DISAPPEAR
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="py-12 border-t" style={{ background: "#080806", borderColor: "rgba(200,168,75,0.15)" }}>
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

            <div className="flex flex-col gap-3">
              <span className="stamp-badge text-xs self-start" style={{ color: "#8b1a1a", borderColor: "#8b1a1a" }}>CLASSIFIED</span>
              <p className="text-xs leading-relaxed mt-1" style={{ fontFamily: "'Courier Prime', monospace", color: "#6b5c3a" }}>
                The government wants you to forget.
                <br />
                <strong style={{ color: "#a89060" }}>We want you to remember.</strong>
              </p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs tracking-widest uppercase mb-2 opacity-60" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
                Quick Access
              </p>
              {[
                { label: "Book Investigation", href: "#book" },
                { label: "The Dossier", href: "#dossier" },
                { label: "Experience Details", href: "#experience" },
                { label: "Field Briefing", href: "#briefing" },
                { label: "Official Story vs. The Truth", href: "#", onClick: (e: React.MouseEvent) => { e.preventDefault(); setModalOpen(true); } },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  onClick={link.onClick}
                  className="text-xs transition-colors duration-200 hover:text-amber-300"
                  style={{ fontFamily: "'Courier Prime', monospace", color: "#6b5c3a" }}
                >
                  → {link.label}
                </a>
              ))}
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-xs tracking-widest uppercase mb-2 opacity-60" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
                Underground Community
              </p>
              {[
                { label: "Instagram", href: "https://www.instagram.com/escapemaze/" },
                { label: "Facebook", href: "https://www.facebook.com/escapemazefun" },
                { label: "LinkedIn", href: "https://ca.linkedin.com/company/escape-maze" },
                { label: "TikTok", href: "https://www.tiktok.com/@escape_maze" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs transition-colors duration-200 hover:text-amber-300"
                  style={{ fontFamily: "'Courier Prime', monospace", color: "#6b5c3a" }}
                >
                  → {s.label}
                </a>
              ))}
              <p className="text-xs mt-3 opacity-40" style={{ fontFamily: "'Courier Prime', monospace", color: "#c8a84b" }}>
                #ProjectSkyHarvest
              </p>
            </div>
          </div>

          <div className="section-divider mb-6" />

          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p className="text-xs leading-relaxed max-w-xl" style={{ fontFamily: "'Courier Prime', monospace", color: "#4a3f2a" }}>
              <strong style={{ color: "#6b5c3a" }}>Disclaimer:</strong> Project SkyHarvest is a fictional,
              immersive theater experience inspired by real historical archival records. All characters,
              organisms, and incidents depicted are works of fiction.
            </p>
            <p className="text-xs opacity-30 shrink-0" style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}>
              © {new Date().getFullYear()} PROJECT SKYHARVEST
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
