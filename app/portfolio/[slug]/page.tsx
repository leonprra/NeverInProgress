import Link from "next/link"
import PROJECTS from "@/lib/projects"
import CornerMarks from "@/components/CornerMarks"
import { notFound } from "next/navigation"

export function generateStaticParams() {
  return PROJECTS.map((p) => ({ slug: p.slug }))
}

export default function PortfolioPage({ params }: { params: { slug: string } }) {
  const project = PROJECTS.find((p) => p.slug === params.slug)
  if (!project) notFound()

  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh" }}>

      {/* Top bar */}
      <div
        style={{
          padding: "24px 48px",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        className="portfolio-topbar"
      >
        <Link
          href="/directory"
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#444",
            textDecoration: "none",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            transition: "color 0.15s ease",
          }}
        >
          ← DIRECTORY
        </Link>
        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            color: "#222",
            letterSpacing: "0.1em",
          }}
        >
          {project.n}
        </span>
      </div>

      {/* Title section */}
      <div style={{ padding: "40px 48px 32px" }} className="portfolio-header">
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 10,
            color: "#444",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          {project.filter}
        </div>
        <h1
          style={{
            fontFamily: "var(--font-sans)",
            fontSize: 56,
            fontWeight: 700,
            lineHeight: 1,
            letterSpacing: "-0.03em",
          }}
          className="portfolio-title"
        >
          {project.title}
        </h1>
      </div>

      {/* Hero image */}
      <div style={{ padding: "0 48px" }} className="portfolio-hero-wrap">
        <div
          style={{
            position: "relative",
            aspectRatio: "16/9",
            background: "#161616",
            overflow: "hidden",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.thumb}
            alt={project.title}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            crossOrigin="anonymous"
          />
          <CornerMarks size={12} color="#333" />
        </div>
      </div>

      {/* Content below hero */}
      <div
        style={{
          padding: "48px 48px 80px",
          display: "grid",
          gridTemplateColumns: "1fr 280px",
          gap: 48,
          borderTop: "1px solid #1a1a1a",
          marginTop: 0,
        }}
        className="portfolio-content"
      >
        {/* Left: main text */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "#333",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            — Overview
          </div>
          <p
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              color: "#666",
              lineHeight: 1.7,
            }}
          >
            Project overview coming soon.
          </p>
        </div>

        {/* Right: spec block */}
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "#333",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 20,
            }}
          >
            — Details
          </div>
          {[
            { key: "TYPE", value: project.filter },
            { key: "YEAR", value: project.year },
          ].map((row) => (
            <div
              key={row.key}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr",
                borderBottom: "1px solid #111",
                padding: "12px 0",
              }}
            >
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 10,
                  color: "#444",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                }}
              >
                {row.key}
              </span>
              <span
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: 11,
                  color: "#888",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
