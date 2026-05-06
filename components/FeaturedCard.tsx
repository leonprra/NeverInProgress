"use client"

import Link from "next/link"
import { useState } from "react"
import CornerMarks from "./CornerMarks"

interface Project {
  n: string
  title: string
  year: string
  slug: string
  filter: string
  thumb: string
}

export default function FeaturedCard({ project }: { project: Project }) {
  const [hovered, setHovered] = useState(false)

  return (
    <Link
      href={`/portfolio/${project.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "block",
        border: "1px solid #1a1a1a",
        background: "#0d0d0d",
        textDecoration: "none",
        color: "#fff",
        transition: "border-color 0.15s ease",
        borderColor: hovered ? "#333" : "#1a1a1a",
      }}
    >
      {/* Image area */}
      <div
        style={{
          position: "relative",
          aspectRatio: "4/3",
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
            transition: "transform 0.4s ease",
            transform: hovered ? "scale(1.03)" : "scale(1)",
          }}
          crossOrigin="anonymous"
        />
        <CornerMarks size={10} color={hovered ? "#666" : "#333"} />

        {/* Work type badge */}
        <span
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            fontFamily: "var(--font-mono)",
            fontSize: 8,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#aaaaaa",
            border: "1px solid #1a1a1a",
            background: "rgba(0,0,0,0.7)",
            padding: "2px 6px",
          }}
        >
          {project.filter}
        </span>
      </div>

      {/* Card footer */}
      <div
        style={{
          padding: "12px 14px",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          borderTop: "1px solid #1a1a1a",
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "#8a8a8a",
              letterSpacing: "0.1em",
              marginBottom: 4,
            }}
          >
            {project.n} — {project.year}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 14,
              fontWeight: 700,
              color: "#fff",
            }}
          >
            {project.title}
          </div>
        </div>

        <span
          style={{
            fontSize: 16,
            color: hovered ? "#c8f064" : "#8a8a8a",
            transition: "color 0.15s ease",
            lineHeight: 1,
          }}
        >
          ↗
        </span>
      </div>
    </Link>
  )
}
