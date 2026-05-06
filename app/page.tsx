import Link from "next/link"
import HomeRows from "@/components/HomeRows"

const SPEC = [
  { key: "BASED IN",     value: "Singapore",           accent: false },
  { key: "DISCIPLINE",   value: "Industrial Design",   accent: false },
  { key: "ALSO WORKS IN",value: "UI/UX, Communication",accent: false },
  { key: "TOOLS",        value: "Rhino, Figma, React", accent: false },
  { key: "STATUS",       value: "Available for work",  accent: true  },
]

const ABOUT_PARAGRAPHS = [
  "I am an industrial designer and creative technologist based in Singapore. My work spans physical product design, UI/UX, and communication design.",
  "Most design problems have a visible layer and a felt layer. The visible layer is what the brief describes. The felt layer is what the person actually experiences.",
  "I tend to start from the felt layer and work outwards. That usually means the solution ends up looking different from what was originally asked for.",
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
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section
        className="hero-section"
        style={{ padding: "96px 40px 80px", borderBottom: "1px solid #111" }}
      >
        <Eyebrow label="Industrial Designer, Creative Technologist" />

        <h1
          className="hero-h1-new"
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 64,
            fontWeight: 700,
            letterSpacing: "-0.035em",
            lineHeight: 1.02,
            margin: 0,
          }}
        >
          <span style={{ display: "block", color: "#e8e8e2" }}>Starting from</span>
          <span style={{ display: "block", color: "#e8e8e2" }}>what is felt.</span>
          <span style={{ display: "block", color: "#8a8a8a" }}>Arriving at</span>
          <span style={{ display: "block", color: "#e8e8e2" }}>what is formed.</span>
        </h1>

        <p style={{
          fontFamily: "var(--font-sans)",
          fontSize: 14,
          color: "#999",
          lineHeight: 1.75,
          maxWidth: 420,
          marginTop: 24,
        }}>
          Most design problems have a visible layer and a felt layer. I tend to
          start from the felt layer and work outwards.
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
          Selected works
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
      <HomeRows />

      {/* ── Directory button ─────────────────────────────────────── */}
      <div
        className="dir-section"
        style={{ padding: "36px 40px", borderBottom: "1px solid #111" }}
      >
        <Link href="/directory" className="dir-btn">
          View all works ↗
        </Link>
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
              I work from the felt layer.
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {ABOUT_PARAGRAPHS.map((text, i) => (
                <p key={i} style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 14,
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
                href="mailto:hello@yourname.com"
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 11,
                  color: "#c8f064",
                  textDecoration: "none",
                }}
              >
                hello@yourname.com
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
          © 2025 — Your Name
        </span>
        <span style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#8a8a8a" }}>
          Industrial Designer
        </span>
      </footer>

    </div>
  )
}
