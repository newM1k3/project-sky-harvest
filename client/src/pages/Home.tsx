/*
 * PROJECT SKYHARVEST — Home Page
 * Design: "Declassified Cold War Dossier"
 * Sections: Nav → Hero → Dossier → Experience Pillars → Briefing → Final CTA → Footer
 */

import { useEffect, useRef, useState } from "react";

// ─── Asset URLs ────────────────────────────────────────────────────────────────
const HERO_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-hero-Sn78RWLe8qXSodc5wcjgHN.webp";
const DOSSIER_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-dossier-CCiv2bUPjaK2mLVRVpRqUv.webp";
const ORGANISM_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-organism-HQ87xyxTM6v2cXNQhJxeht.webp";
const FIELD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/97632569/RwH8BvQZL4J93V8qt4eGMb/skyharvest-field-fWpY6q4rabeYE6Hw8EWk4T.webp";

const BOOKING_URL = "https://offthecouxh.com";

// ─── Scroll-reveal hook ────────────────────────────────────────────────────────
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
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
        if (i >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(timeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

// ─── Redaction bar component ───────────────────────────────────────────────────
function RedactBar({ text }: { text: string }) {
  return (
    <span className="redact-bar inline-block w-full my-1" title="Hover to reveal">
      <span className="revealed-text">{text}</span>
    </span>
  );
}

// ─── Pillar card ───────────────────────────────────────────────────────────────
interface PillarProps {
  icon: string;
  title: string;
  body: string;
  delay: number;
}

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
      <h3
        className="text-sm font-bold tracking-widest uppercase"
        style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
      >
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

// ─── Main Home component ───────────────────────────────────────────────────────
export default function Home() {
  const headline = "PROJECT SKYHARVEST: THE TRUTH IS BURIED.";
  const { displayed, done } = useTypewriter(headline, 48, 600);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen" style={{ background: "#0a0a08", color: "#c8a84b" }}>

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
            <span
              className="stamp-badge text-xs"
              style={{ color: "#8b1a1a", borderColor: "#8b1a1a", transform: "rotate(-2deg)" }}
            >
              CLASSIFIED
            </span>
            <span
              className="text-sm font-bold tracking-widest uppercase"
              style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
            >
              Project SkyHarvest
            </span>
          </div>

          {/* Desktop nav links */}
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
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-classified text-xs py-2 px-5"
            >
              Book Now
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="block w-6 h-0.5 transition-all duration-200"
                style={{ background: "#c8a84b" }}
              />
            ))}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div
            className="md:hidden border-t"
            style={{ background: "rgba(10,10,8,0.98)", borderColor: "rgba(200,168,75,0.2)" }}
          >
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
      <section
        className="relative min-h-screen flex flex-col items-start justify-end overflow-hidden flicker"
        style={{ background: "#0a0a08" }}
      >
        {/* Background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${HERO_IMG})`,
            filter: "brightness(0.55) contrast(1.1)",
          }}
        />
        {/* Gradient overlay — bottom-up darkness */}
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to top, #0a0a08 0%, rgba(10,10,8,0.6) 40%, rgba(10,10,8,0.2) 100%)",
          }}
        />
        {/* Top vignette */}
        <div
          className="absolute inset-0"
          style={{
            background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Hero content */}
        <div className="relative container pb-24 pt-32 z-10">
          {/* Classification header */}
          <div className="flex items-center gap-4 mb-6">
            <span
              className="stamp-badge"
              style={{ color: "#8b1a1a", borderColor: "#8b1a1a", fontSize: "0.7rem" }}
            >
              TOP SECRET
            </span>
            <span
              className="text-xs tracking-widest opacity-60"
              style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
            >
              FILE NO. NRC-1995-4521 — PETERBOROUGH INCIDENT
            </span>
          </div>

          {/* Typewriter headline */}
          <h1
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl"
            style={{
              fontFamily: "'Special Elite', monospace",
              color: "#d4c89a",
              textShadow: "0 0 40px rgba(200,168,75,0.3)",
            }}
          >
            {displayed}
            {!done && (
              <span
                className="inline-block w-0.5 h-10 ml-1 align-middle"
                style={{
                  background: "#c8a84b",
                  animation: "blink-cursor 0.8s step-end infinite",
                }}
              />
            )}
          </h1>

          {/* Sub-headline */}
          <p
            className="text-base sm:text-lg md:text-xl max-w-2xl mb-10 leading-relaxed"
            style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}
          >
            In 1995, the Canadian government shuttered the files. They claimed they found nothing.{" "}
            <em style={{ color: "#c8a84b" }}>They lied.</em>
          </p>

          {/* CTA */}
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-classified pulse-amber inline-block text-sm"
          >
            ▶ Book Your Investigation
          </a>

          {/* Scroll indicator */}
          <div className="mt-16 flex items-center gap-3 opacity-40">
            <div
              className="w-px h-8"
              style={{ background: "linear-gradient(to bottom, transparent, #c8a84b)" }}
            />
            <span className="text-xs tracking-widest" style={{ fontFamily: "'Oswald', sans-serif" }}>
              SCROLL TO INVESTIGATE
            </span>
          </div>
        </div>
      </section>

      {/* ── DOSSIER ────────────────────────────────────────────────────────── */}
      <section id="dossier" className="py-24 relative" style={{ background: "#0c0c0a" }}>
        <div className="section-divider mb-16" />
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">

            {/* Left: Dossier document image */}
            <RevealSection>
              <div className="relative">
                <img
                  src={DOSSIER_IMG}
                  alt="Classified Government Dossier — Project SkyHarvest"
                  className="w-full object-cover"
                  style={{
                    filter: "sepia(0.3) contrast(1.1)",
                    border: "1px solid rgba(200,168,75,0.3)",
                  }}
                />
                {/* Stamp overlay */}
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
                <span
                  className="stamp-badge text-xs"
                  style={{ color: "#c8a84b", borderColor: "#c8a84b" }}
                >
                  THE DOSSIER
                </span>
                <span className="text-xs opacity-40 tracking-wider" style={{ fontFamily: "'Oswald', sans-serif" }}>
                  CASE FILE: BRAIN PLAGUE
                </span>
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold leading-snug"
                style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a" }}
              >
                The Peterborough Incident
              </h2>

              <p
                className="text-sm leading-loose"
                style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}
              >
                For 45 years, the National Research Council cataloged over{" "}
                <strong style={{ color: "#c8a84b" }}>4,500 sightings</strong>. Then came the Peterborough
                incident. A crash on a local farm. A microscopic organism that{" "}
                <strong style={{ color: "#c8a84b" }}>consumes memories</strong>. The site was sealed, but
                the phenomenon is reawakening.
              </p>

              {/* Redaction bars — interactive reveal */}
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

              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-classified inline-block text-xs self-start mt-2"
              >
                Access The Files →
              </a>
            </RevealSection>
          </div>
        </div>
        <div className="section-divider mt-16" />
      </section>

      {/* ── EXPERIENCE PILLARS ─────────────────────────────────────────────── */}
      <section id="experience" className="py-24 relative" style={{ background: "#0a0a08" }}>
        <div className="container">
          <RevealSection className="text-center mb-14">
            <span
              className="stamp-badge text-xs mb-4 inline-block"
              style={{ color: "#c8a84b", borderColor: "#c8a84b" }}
            >
              MISSION PARAMETERS
            </span>
            <h2
              className="text-2xl sm:text-3xl font-bold mt-4"
              style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a" }}
            >
              Why This Is Different
            </h2>
            <p
              className="text-sm mt-3 max-w-xl mx-auto opacity-70"
              style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}
            >
              This is not a haunted house. This is an investigation.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <PillarCard
              icon="🧠"
              title="Psychological Dread"
              body="Prioritizing suspense, paranoia, and immersive atmosphere over cheap jump scares. Your mind is the weapon."
              delay={0}
            />
            <PillarCard
              icon="📁"
              title="Grounded Authenticity"
              body="Rooted in real Canadian government UFO investigation history. The NRC files were real. The cover-up was real."
              delay={100}
            />
            <PillarCard
              icon="⏱"
              title="Collaborative Urgency"
              body="60 minutes. 10 haunted stations. Work together or be consumed. Every second counts."
              delay={200}
            />
            <PillarCard
              icon="🔦"
              title="Total Immersion"
              body="A 10-station emotional journey designed to test your sanity. Outdoor terrain. Low light. No escape from the truth."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* ── ORGANISM INTERLUDE ─────────────────────────────────────────────── */}
      <section className="relative py-0 overflow-hidden" style={{ minHeight: "40vh" }}>
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${ORGANISM_IMG})`,
            filter: "brightness(0.3) saturate(0.8)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: "linear-gradient(to right, #0a0a08 0%, transparent 30%, transparent 70%, #0a0a08 100%)",
          }}
        />
        <div className="relative container py-20 z-10 flex flex-col items-center text-center">
          <RevealSection>
            <p
              className="text-lg sm:text-xl md:text-2xl max-w-2xl leading-relaxed italic"
              style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a", textShadow: "0 0 30px rgba(0,0,0,0.8)" }}
            >
              "The organism does not kill. It harvests. Memory by memory. Until nothing remains but the host — empty, compliant, and waiting."
            </p>
            <p
              className="text-xs mt-4 tracking-widest opacity-50"
              style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
            >
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

            {/* Left: Field image */}
            <RevealSection>
              <div className="relative">
                <img
                  src={FIELD_IMG}
                  alt="The Peterborough incident site — remote Canadian farm"
                  className="w-full object-cover"
                  style={{
                    filter: "brightness(0.8) contrast(1.1) sepia(0.15)",
                    border: "1px solid rgba(200,168,75,0.2)",
                  }}
                />
                <div
                  className="absolute bottom-0 left-0 right-0 p-4"
                  style={{ background: "linear-gradient(to top, rgba(10,10,8,0.95), transparent)" }}
                >
                  <p
                    className="text-xs tracking-widest opacity-60"
                    style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
                  >
                    INCIDENT SITE — PETERBOROUGH COUNTY, 1994
                  </p>
                </div>
              </div>
            </RevealSection>

            {/* Right: Briefing details */}
            <RevealSection className="flex flex-col gap-6">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="stamp-badge text-xs"
                  style={{ color: "#c8a84b", borderColor: "#c8a84b" }}
                >
                  FIELD BRIEFING
                </span>
              </div>

              <h2
                className="text-2xl sm:text-3xl font-bold leading-snug"
                style={{ fontFamily: "'Special Elite', monospace", color: "#d4c89a" }}
              >
                Operational Details
              </h2>

              {/* Logistics grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Duration", value: "60-Minute Immersive Experience", icon: "⏱" },
                  { label: "Location", value: "Escape Maze — Peterborough, ON", icon: "📍" },
                  { label: "Difficulty", value: "Investigative / Mental Focus", icon: "🧩" },
                  { label: "Group Size", value: "Teams Welcome — Collaborate or Fail", icon: "👥" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="doc-card p-4 flex gap-3 items-start"
                  >
                    <span className="text-xl mt-0.5">{item.icon}</span>
                    <div>
                      <p
                        className="text-xs tracking-widest uppercase opacity-60 mb-1"
                        style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
                      >
                        {item.label}
                      </p>
                      <p
                        className="text-sm"
                        style={{ fontFamily: "'Courier Prime', monospace", color: "#d4c89a" }}
                      >
                        {item.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Warning box */}
              <div
                className="p-4 border-l-4 mt-2"
                style={{
                  borderColor: "#8b1a1a",
                  background: "rgba(139,26,26,0.08)",
                  fontFamily: "'Courier Prime', monospace",
                }}
              >
                <p
                  className="text-xs tracking-widest uppercase font-bold mb-2"
                  style={{ fontFamily: "'Oswald', sans-serif", color: "#8b1a1a" }}
                >
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

              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-classified inline-block text-xs self-start mt-2"
              >
                Secure Your Spot →
              </a>
            </RevealSection>
          </div>
        </div>
        <div className="section-divider mt-16" />
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section
        className="relative py-32 overflow-hidden"
        style={{ background: "#0a0a08" }}
      >
        {/* Subtle background field image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-15"
          style={{ backgroundImage: `url(${HERO_IMG})` }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, rgba(10,10,8,0.3) 0%, #0a0a08 70%)" }}
        />

        <div className="relative container z-10 text-center">
          <RevealSection>
            <span
              className="stamp-badge text-xs mb-6 inline-block"
              style={{ color: "#8b1a1a", borderColor: "#8b1a1a" }}
            >
              FINAL TRANSMISSION
            </span>

            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-6 max-w-3xl mx-auto"
              style={{
                fontFamily: "'Special Elite', monospace",
                color: "#d4c89a",
                textShadow: "0 0 40px rgba(200,168,75,0.2)",
              }}
            >
              The files are reopening.
              <br />
              <span style={{ color: "#c8a84b" }}>The Hatchery is waiting.</span>
            </h2>

            <p
              className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed"
              style={{ fontFamily: "'Courier Prime', monospace", color: "#a89060" }}
            >
              Are you prepared to face what they buried?
            </p>

            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-classified pulse-amber inline-block text-sm"
            >
              ▶ Secure Your Spot — Off The Couxh
            </a>

            {/* Countdown urgency line */}
            <p
              className="text-xs mt-8 tracking-widest opacity-50"
              style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
            >
              LIMITED INVESTIGATION SLOTS AVAILABLE — BOOK BEFORE THEY DISAPPEAR
            </p>
          </RevealSection>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer
        className="py-12 border-t"
        style={{ background: "#080806", borderColor: "rgba(200,168,75,0.15)" }}
      >
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">

            {/* Brand */}
            <div className="flex flex-col gap-3">
              <span
                className="stamp-badge text-xs self-start"
                style={{ color: "#8b1a1a", borderColor: "#8b1a1a" }}
              >
                CLASSIFIED
              </span>
              <p
                className="text-xs leading-relaxed mt-1"
                style={{ fontFamily: "'Courier Prime', monospace", color: "#6b5c3a" }}
              >
                The government wants you to forget.
                <br />
                <strong style={{ color: "#a89060" }}>We want you to remember.</strong>
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-col gap-2">
              <p
                className="text-xs tracking-widest uppercase mb-2 opacity-60"
                style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
              >
                Quick Access
              </p>
              {[
                { label: "Book Investigation", href: BOOKING_URL },
                { label: "The Dossier", href: "#dossier" },
                { label: "Experience Details", href: "#experience" },
                { label: "Field Briefing", href: "#briefing" },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target={link.href.startsWith("http") ? "_blank" : undefined}
                  rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="text-xs transition-colors duration-200 hover:text-amber-300"
                  style={{ fontFamily: "'Courier Prime', monospace", color: "#6b5c3a" }}
                >
                  → {link.label}
                </a>
              ))}
            </div>

            {/* Social / Community */}
            <div className="flex flex-col gap-2">
              <p
                className="text-xs tracking-widest uppercase mb-2 opacity-60"
                style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
              >
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
              <p
                className="text-xs mt-3 opacity-40"
                style={{ fontFamily: "'Courier Prime', monospace", color: "#c8a84b" }}
              >
                #ProjectSkyHarvest
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="section-divider mb-6" />

          {/* Disclaimer + copyright */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <p
              className="text-xs leading-relaxed max-w-xl"
              style={{ fontFamily: "'Courier Prime', monospace", color: "#4a3f2a" }}
            >
              <strong style={{ color: "#6b5c3a" }}>Disclaimer:</strong> Project SkyHarvest is a fictional,
              immersive theater experience inspired by real historical archival records. All characters,
              organisms, and incidents depicted are works of fiction.
            </p>
            <p
              className="text-xs opacity-30 shrink-0"
              style={{ fontFamily: "'Oswald', sans-serif", color: "#c8a84b" }}
            >
              © {new Date().getFullYear()} PROJECT SKYHARVEST
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
