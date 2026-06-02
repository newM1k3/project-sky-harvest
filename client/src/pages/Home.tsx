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

import { useCallback, useEffect, useRef, useState } from "react";

// ─── Asset URLs ────────────────────────────────────────────────────────────────
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-hero-Sn78RWLe8qXSodc5wcjgHN.webp";
const DOSSIER_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-dossier-CCiv2bUPjaK2mLVRVpRqUv.webp";
const ORGANISM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-organism-HQ87xyxTM6v2cXNQhJxeht.webp";
const FIELD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-field-fWpY6q4rabeYE6Hw8EWk4T.webp";

const BOOKING_URL = "https://offthecouxh.com";

// ─── Next booking date: first Saturday at least 7 days from now ────────────────
function getNextBookingDate(): Date {
  const now = new Date();
  const d = new Date(now);
  d.setDate(d.getDate() + 7);
  // Advance to next Saturday (day 6)
  while (d.getDay() !== 6) d.setDate(d.getDate() + 1);
  d.setHours(19, 0, 0, 0); // 7 PM
  return d;
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
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-classified text-xs shrink-0"
            onClick={onClose}
          >
            ▶ Book Your Investigation
          </a>
        </div>
      </div>
    </div>
  );
}

// ─── Main Home component ───────────────────────────────────────────────────────
export default function Home() {
  const headline = "PROJECT SKYHARVEST: THE TRUTH IS BURIED.";
  const { displayed, done } = useTypewriter(headline, 48, 600);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Countdown target — next Saturday evening
  const [bookingTarget] = useState(() => getNextBookingDate());
  const countdown = useCountdown(bookingTarget);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a08", color: "#c8a84b" }}>

      {/* ── NARRATIVE MODAL ────────────────────────────────────────────────── */}
      {modalOpen && <NarrativeModal onClose={() => setModalOpen(false)} />}

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
            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-classified text-xs py-2 px-5">
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
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-classified text-xs py-2 px-5 text-center"
                onClick={() => setMobileMenuOpen(false)}
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

          <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-classified pulse-amber inline-block text-sm">
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
                <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-classified inline-block text-xs">
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

              <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-classified inline-block text-xs self-start mt-2">
                Secure Your Spot →
              </a>
            </RevealSection>
          </div>
        </div>
        <div className="section-divider mt-16" />
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
                {bookingTarget.toLocaleDateString("en-CA", { weekday: "long", year: "numeric", month: "long", day: "numeric" })} at 7:00 PM
              </p>
            </div>

            <a href={BOOKING_URL} target="_blank" rel="noopener noreferrer" className="btn-classified pulse-amber inline-block text-sm">
              ▶ Secure Your Spot — Off The Couxh
            </a>

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
                { label: "Book Investigation", href: BOOKING_URL },
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
                { label: "Facebook", href: "#" },
                { label: "Instagram", href: "#" },
                { label: "TikTok", href: "#" },
              ].map((s) => (
                <a
                  key={s.label}
                  href={s.href}
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
