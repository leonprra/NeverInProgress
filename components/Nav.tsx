"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

const NAV_LINKS = [
  { label: "HOME", href: "/" },
  { label: "DIRECTORY", href: "/directory" },
]

export default function Nav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          height: 48,
          zIndex: 100,
          background: "#000000",
          borderBottom: "1px solid #1a1a1a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 24px",
        }}
      >
        {/* Left: Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center" }}>
          <img src="/faviconnav.svg" alt="NEVERINPROGRESS" style={{ height: 28, width: "auto", display: "block" }} />
        </Link>

        {/* Center: Nav links (hidden below 640px) */}
        <div
          style={{
            display: "flex",
            gap: 32,
            position: "absolute",
            left: "50%",
            transform: "translateX(-50%)",
          }}
          className="hidden-mobile"
        >
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 10,
                  letterSpacing: "0.1em",
                  color: active ? "#ffffff" : "#777777",
                  textDecoration: "none",
                  transition: "color 0.15s ease",
                }}
              >
                {link.label}
              </Link>
            )
          })}
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a
            href="https://www.linkedin.com/in/leon-pereira"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden-mobile"
            style={{
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: "#c8f064",
              letterSpacing: "0.05em",
              textDecoration: "none",
            }}
          >
            Connect ↗
          </a>

          {/* Hamburger (shown below 640px) */}
          <button
            onClick={() => setMenuOpen(true)}
            className="show-mobile"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
              display: "none",
              flexDirection: "column",
              gap: 5,
            }}
            aria-label="Open menu"
          >
            <span style={{ display: "block", width: 20, height: 1, background: "#ffffff" }} />
            <span style={{ display: "block", width: 20, height: 1, background: "#ffffff" }} />
            <span style={{ display: "block", width: 20, height: 1, background: "#ffffff" }} />
          </button>
        </div>
      </nav>

      {/* Mobile full-screen overlay */}
      {menuOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            background: "#000000",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 40,
          }}
        >
          <button
            onClick={() => setMenuOpen(false)}
            style={{
              position: "absolute",
              top: 16,
              right: 24,
              background: "none",
              border: "none",
              cursor: "pointer",
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: "#aaaaaa",
              letterSpacing: "0.1em",
            }}
          >
            CLOSE
          </button>

          {NAV_LINKS.map((link) => {
            const active = pathname === link.href
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 36,
                  fontWeight: 700,
                  color: active ? "#ffffff" : "#777777",
                  textDecoration: "none",
                  letterSpacing: "-0.02em",
                }}
              >
                {link.label}
              </Link>
            )
          })}

          <a
            href="https://www.linkedin.com/in/leon-pereira"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              position: "absolute",
              bottom: 32,
              fontFamily: "'Space Mono', monospace",
              fontSize: 10,
              color: "#c8f064",
              letterSpacing: "0.05em",
              textDecoration: "none",
            }}
          >
            Connect ↗
          </a>
        </div>
      )}
    </>
  )
}
