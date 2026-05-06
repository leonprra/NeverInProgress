"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import CornerMarks from "@/components/CornerMarks"

const EASE = [0.16, 1, 0.3, 1] as const

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
}

const itemVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: EASE },
  },
}

const GAME_CARDS = [
  {
    n: "EXP_001",
    title: "Sand Game",
    type: "Simulation",
    description: "Cellular automata sandbox. Click to place particles and watch them interact.",
    src: "#",
  },
  {
    n: "EXP_002",
    title: "Ollie the Lightning Cloud",
    type: "Interactive",
    description: "Guide a sentient storm cloud through a series of puzzles.",
    src: "#",
  },
  {
    n: "EXP_003",
    title: "Noise Field",
    type: "Generative",
    description: "Perlin noise flow field. Move your cursor to disturb the field.",
    src: "#",
  },
]

function GameCard({ card }: { card: typeof GAME_CARDS[0] }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: "1px solid #1a1a1a",
        background: "#0d0d0d",
        transition: "border-color 0.15s ease",
        borderColor: hovered ? "#333" : "#1a1a1a",
      }}
    >
      {/* Embed area */}
      <div
        style={{
          position: "relative",
          aspectRatio: "3/4",
          background: "#0a0a0a",
          overflow: "hidden",
        }}
      >
        {card.src !== "#" ? (
          <iframe
            src={card.src}
            style={{ width: "100%", height: "100%", border: "none" }}
            title={card.title}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 9,
                color: "#8a8a8a",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
              }}
            >
              &#47;&#47; coming soon
            </span>
          </div>
        )}
        <CornerMarks size={10} color={hovered ? "#555" : "#222"} />
      </div>

      {/* Card info */}
      <div
        style={{
          padding: "14px 16px",
          borderTop: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 9,
              color: "#8a8a8a",
              letterSpacing: "0.1em",
              marginBottom: 6,
              display: "flex",
              gap: 8,
              alignItems: "center",
            }}
          >
            <span>{card.n}</span>
            <span
              style={{
                border: "1px solid #1a1a1a",
                padding: "1px 6px",
                fontSize: 8,
                color: "#8a8a8a",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {card.type}
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 15,
              fontWeight: 700,
              color: "#fff",
              marginBottom: 6,
            }}
          >
            {card.title}
          </div>
          <div
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: 11,
              color: "#aaaaaa",
              lineHeight: 1.5,
              maxWidth: 260,
            }}
          >
            {card.description}
          </div>
        </div>

        <span
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 9,
            letterSpacing: "0.1em",
            color: hovered ? "#c8f064" : "#333",
            transition: "color 0.15s ease",
            whiteSpace: "nowrap",
            flexShrink: 0,
          }}
        >
          PLAY →
        </span>
      </div>
    </div>
  )
}

export default function Games() {
  return (
    <div style={{ background: "#000", color: "#fff", minHeight: "100vh", padding: "48px" }} className="games-page">
      {/* Header */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{ marginBottom: 40, borderBottom: "1px solid #1a1a1a", paddingBottom: 24 }}
      >
        <motion.div
          variants={itemVariants}
          style={{ fontFamily: "var(--font-mono)", fontSize: 9, color: "#333", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 8 }}
        >
          — {GAME_CARDS.length} experiments
        </motion.div>
        <motion.h1
          variants={itemVariants}
          style={{ fontFamily: "var(--font-sans)", fontSize: 40, fontWeight: 700, lineHeight: 1.1, letterSpacing: "-0.02em" }}
        >
          Games &amp; Experiments
        </motion.h1>
      </motion.div>

      {/* Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "1px",
          background: "#1a1a1a",
        }}
        className="games-grid"
      >
        {GAME_CARDS.map((card) => (
          <motion.div key={card.n} variants={itemVariants} style={{ background: "#000" }}>
            <GameCard card={card} />
          </motion.div>
        ))}
      </motion.div>

    </div>
  )
}
