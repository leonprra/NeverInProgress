import HomeRows from "@/components/HomeRows"
import { TransitionLink } from "@/components/TransitionContext"
import HomeLenis from "@/components/HomeLenis"
import HeroDither from "@/components/HeroDither"
import PROJECTS from "@/lib/projects"

const SPEC = [
  { key: "BASED IN",     value: "Singapore",           accent: false },
  { key: "DISCIPLINE",   value: "Industrial Design",   accent: false },
  { key: "ALSO WORKS IN",value: "UI/UX, Communication",accent: false },
  { key: "TOOLS",        value: "Rhino, Figma, Adobe Suite", accent: false },
  { key: "STATUS",       value: "Available for work",  accent: true  },
]

const ABOUT_PARAGRAPHS = [
  "is a concept by Leon Pereira. It comes from his habit of always talking about beginning something, yet never quite starting. ",
  "He breaks down a problem to its granular components, building solutions bit by bit. Across every project, the pattern holds, break down to build better.",
  "He has six years of design experience and is currently open to new opportunities. If you have a project in mind, reach out!",
]

function Eyebrow({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
      <div style={{ width: 20, height: 1, background: "#2a2a2a", flexShrink: 0 }} />
      <span style={{
        fontFamily: "var(--font-mono)",
        fontSize: 9,
        color: "#777",
        textTransform: "uppercase",
        letterSpacing: "0.16em",
      }}>
        {label}
      </span>
    </div>
  )
}

export default function Home() {
  const featuredProjects = PROJECTS.filter(p => p.url)
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>
      <HomeLenis />

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="hero-section"
        style={{ padding: "96px 40px 80px", borderBottom: "1px solid #111" }}
      >
        {/* Canvas overlays the h1 wrapper; h1 stays in DOM for SEO/a11y */}
        <div style={{ position: "relative" }}>
          <h1
            className="hero-h1-new hero-canvas-h1"
            style={{
              fontFamily: "var(--font-micro-5)",
              fontSize: 208,
              fontWeight: 400,
              letterSpacing: "-0.035em",
              lineHeight: 1.02,
              margin: 0,
            }}
          >
            <span style={{ display: "block", color: "#e8e8e2" }}>LEON PEREIRA</span>
          </h1>
          <HeroDither />
        </div>

        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 16,
          color: "#999",
          lineHeight: 1.75,
          maxWidth: 420,
          marginTop: 24,
          marginLeft: "4%",
        }}>
          6 years of designing things that get a 👍👍
        </p>
      </section>

      {/* ── Section header ───────────────────────────────────────── */}
      <div
        className="section-header"
        style={{
          padding: "20px 40px",
          borderBottom: "1px solid #111",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "#777",
          textTransform: "uppercase",
          letterSpacing: "0.12em",
        }}>
          Works
        </span>
        <span style={{
          fontFamily: "var(--font-mono)",
          fontSize: 9,
          color: "#777",
        }}>
          001 — 003
        </span>
      </div>

      {/* ── Project rows (client component) ──────────────────────── */}
      <HomeRows projects={featuredProjects} />

      {/* ── Directory button ─────────────────────────────────────── */}
      <div
        className="dir-section"
        style={{ padding: "36px 40px", borderBottom: "1px solid #111" }}
      >
        <TransitionLink href="/directory" className="dir-btn">
          View all works ↗
        </TransitionLink>
      </div>

      {/* ── About ────────────────────────────────────────────────── */}
      <section
        className="about-section"
        style={{ padding: "88px 40px 96px", borderBottom: "1px solid #111" }}
      >
        <div
          className="about-grid"
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}
        >
          {/* Left — copy */}
          <div>
            <Eyebrow label="About" />
            <h2 style={{
              fontFamily: "var(--font-sans)",
              fontWeight: 700,
              fontSize: 40,
              letterSpacing: "-0.025em",
              lineHeight: 1.1,
              color: "#e8e8e2",
              marginBottom: 24,
            }}>
              Never in progress
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ABOUT_PARAGRAPHS.map((text, i) => (
                <p key={i} style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 18,
                  color: "#aaaaaa",
                  lineHeight: 1.8,
                  margin: 0,
                }}>
                  {text}
                </p>
              ))}
            </div>
          </div>

          {/* Right — spec block + contact */}
          <div>
            <div>
              {SPEC.map((row) => (
                <div
                  key={row.key}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                    borderBottom: "1px solid #111",
                    padding: "16px 0",
                  }}
                >
                  <span style={{
                    fontFamily: "var(--font-mono)",
                    fontSize: 8,
                    color: "#777",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}>
                    {row.key}
                  </span>
                  <span style={{
                    fontFamily: "var(--font-sans)",
                    fontSize: 11,
                    color: row.accent ? "#c8f064" : "#999",
                  }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 32 }}>
              <div style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "#777",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: 8,
              }}>
                Say hi
              </div>
              <a
                href="mailto:2000leon@gmail.com"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "#c8f064",
                  textDecoration: "none",
                }}
              >
                2000leon@gmail.com
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────── */}
      <footer
        className="site-footer"
        style={{
          padding: "18px 40px",
          borderTop: "1px solid #111",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#8a8a8a" }}>
          2026 — Leon Pereira
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#8a8a8a" }}>
          :D
        </span>
      </footer>

    </div>
  )
}
