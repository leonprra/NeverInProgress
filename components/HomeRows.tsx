"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import type { Project as NotionProject } from "@/lib/projects"
import { navigateWithDither } from "@/lib/dither-transition"

// ── Bayer matrices ────────────────────────────────────────────────
const B_TEXT = [
  [0,32,8,40,2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44,4,36,14,46,6,38],
  [60,28,52,20,62,30,54,22],
  [3,35,11,43,1,33,9,41],
  [51,19,59,27,49,17,57,25],
  [15,47,7,39,13,45,5,37],
  [63,31,55,23,61,29,53,21],
]

const B_IMG = B_TEXT.map((row, r) =>
  row.map((_, c) => B_TEXT[(r + 3) % 8][(c + 3) % 8])
)

const TPX      = 8
const PX_COARSE = 16
const PX_FINE   = 3
const DUR       = 400

function ease(t: number) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t }
function thrT(r: number, c: number) { return B_TEXT[r % 8][c % 8] / 64 }
function thrI(r: number, c: number) { return B_IMG[r % 8][c % 8] / 64 }

// ── Pixel cache ───────────────────────────────────────────────────
type PixCache = { data: Uint8ClampedArray; W: number; H: number }

function sampleRegion(
  cache: PixCache,
  x: number, y: number, px: number
): { r: number; g: number; b: number; lum: number } | null {
  const { data, W, H } = cache
  const x1 = Math.min(x + px, W)
  const y1 = Math.min(y + px, H)
  const w = x1 - x, h = y1 - y
  if (w <= 0 || h <= 0) return null
  let r = 0, g = 0, b = 0, lum = 0
  const n = w * h
  for (let dy = 0; dy < h; dy++) {
    for (let dx = 0; dx < w; dx++) {
      const i = ((y + dy) * W + (x + dx)) * 4
      r += data[i]; g += data[i + 1]; b += data[i + 2]
      lum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
    }
  }
  return {
    r: Math.round(r / n),
    g: Math.round(g / n),
    b: Math.round(b / n),
    lum: lum / n / 255,
  }
}

// ── Project data ──────────────────────────────────────────────────
type Project = {
  number: string
  tag: string
  year: string
  title: string
  problem: string
  insight: string
  slug: string
  heroImage: string
}

function toRowProject(p: NotionProject): Project {
  return {
    number:    p.n,
    tag:       p.filter,
    year:      p.year,
    title:     p.title,
    problem:   p.problem  ?? "",
    insight:   p.tagline  ?? "",
    slug:      p.url ?? `/portfolio/${p.slug}`,
    heroImage: p.thumb    ?? "",
  }
}

// ── ProjectRow ────────────────────────────────────────────────────
function ProjectRow({ project, isFirst, isLast }: { project: Project; isFirst: boolean; isLast: boolean }) {
  const [hov, setHov] = useState(false)

  const rowRef     = useRef<HTMLDivElement>(null)
  const supportRef = useRef<HTMLDivElement>(null)
  const imgColRef  = useRef<HTMLDivElement>(null)
  const tcvRef     = useRef<HTMLCanvasElement>(null)
  const icvRef     = useRef<HTMLCanvasElement>(null)
  const taRef      = useRef<HTMLDivElement>(null)
  const tbRef      = useRef<HTMLDivElement>(null)
  const rafRef     = useRef<number | null>(null)
  const cacheRef   = useRef<PixCache | null>(null)
  const imgRef     = useRef<HTMLImageElement | null>(null)
  const targetRef  = useRef<"A" | "B">("A")

  // ── Canvas sizing ─────────────────────────────────────────────────
  const sizeAll = useCallback(() => {
    const support = supportRef.current
    const imgCol  = imgColRef.current
    const tcv     = tcvRef.current
    const icv     = icvRef.current
    if (support && tcv) {
      const r = support.getBoundingClientRect()
      tcv.width  = Math.round(r.width)
      tcv.height = Math.round(r.height)
    }
    if (imgCol && icv) {
      const r = imgCol.getBoundingClientRect()
      const W = Math.round(r.width)
      const H = Math.round(r.height)
      if (icv.width !== W || icv.height !== H) {
        icv.width  = W
        icv.height = H
        cacheRef.current = null
      }
    }
  }, [])

  // ── Build pixel cache ─────────────────────────────────────────────
  const buildCache = useCallback(() => {
    const icv = icvRef.current
    const img = imgRef.current
    if (!icv || !img || !icv.width || !icv.height) return
    if (
      cacheRef.current &&
      cacheRef.current.W === icv.width &&
      cacheRef.current.H === icv.height
    ) return
    const W = icv.width, H = icv.height
    const tmp = document.createElement("canvas")
    tmp.width = W; tmp.height = H
    const ctx = tmp.getContext("2d")!
    const imgAspect    = img.naturalWidth / img.naturalHeight
    const canvasAspect = W / H
    let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight
    if (imgAspect > canvasAspect) {
      sw = Math.floor(img.naturalHeight * canvasAspect)
      sx = Math.floor((img.naturalWidth - sw) / 2)
    } else {
      sh = Math.floor(img.naturalWidth / canvasAspect)
      sy = Math.floor((img.naturalHeight - sh) / 2)
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, W, H)
    try {
      const id = ctx.getImageData(0, 0, W, H)
      cacheRef.current = { data: id.data, W, H }
    } catch { /* CORS — silent fail */ }
  }, [])

  // ── drawTextMask ──────────────────────────────────────────────────
  const drawTextMask = useCallback((t: number, toB: boolean) => {
    const cv = tcvRef.current
    if (!cv) return
    const W = cv.width, H = cv.height
    if (!W || !H) return
    const ctx = cv.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, W, H)
    const C = Math.ceil(W / TPX), R = Math.ceil(H / TPX)
    ctx.fillStyle = "#000"
    if (toB) {
      for (let r = 0; r < R; r++)
        for (let c = 0; c < C; c++)
          if (t > thrT(r, c))
            ctx.fillRect(c * TPX, r * TPX, TPX, TPX)
    } else {
      for (let r = 0; r < R; r++)
        for (let c = 0; c < C; c++)
          if (t <= thrT(r, c))
            ctx.fillRect(c * TPX, r * TPX, TPX, TPX)
    }
  }, [])

  // ── drawImage ─────────────────────────────────────────────────────
  const drawImage = useCallback((t: number) => {
    const cv    = icvRef.current
    const cache = cacheRef.current
    if (!cv) return
    const W = cv.width, H = cv.height
    const ctx = cv.getContext("2d")
    if (!ctx || !W || !H) return
    ctx.clearRect(0, 0, W, H)
    if (!cache) return

    // Pass 1 — coarse blocks not yet crossed
    const CC = Math.ceil(W / PX_COARSE), CR = Math.ceil(H / PX_COARSE)
    for (let row = 0; row < CR; row++) {
      for (let col = 0; col < CC; col++) {
        if (t > thrI(row, col)) continue
        const x = col * PX_COARSE, y = row * PX_COARSE
        const s = sampleRegion(cache, x, y, PX_COARSE)
        if (!s) continue
        if (s.lum > thrI(row, col)) {
          ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`
          ctx.fillRect(x, y, Math.min(PX_COARSE, W - x), Math.min(PX_COARSE, H - y))
        }
      }
    }

    // Pass 2 — fine cells that have crossed
    const FC = Math.ceil(W / PX_FINE), FR = Math.ceil(H / PX_FINE)
    for (let frow = 0; frow < FR; frow++) {
      for (let fcol = 0; fcol < FC; fcol++) {
        const cx = fcol * PX_FINE, cy = frow * PX_FINE
        const cR = Math.floor(cy / PX_COARSE), cC = Math.floor(cx / PX_COARSE)
        if (!(t > thrI(cR, cC))) continue
        const s = sampleRegion(cache, cx, cy, PX_FINE)
        if (!s) continue
        if (s.lum > thrI(frow, fcol)) {
          ctx.fillStyle = `rgb(${s.r},${s.g},${s.b})`
          ctx.fillRect(cx, cy, Math.min(PX_FINE, W - cx), Math.min(PX_FINE, H - cy))
        }
      }
    }
  }, [])

  // ── Animation runner ──────────────────────────────────────────────
  const stop = useCallback(() => {
    if (rafRef.current !== null) {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = null
    }
  }, [])

  const run = useCallback((
    dur: number,
    fn: (t: number) => void,
    done: () => void
  ) => {
    let t0: number | null = null
    function frame(ts: number) {
      if (t0 === null) t0 = ts
      const p = Math.min((ts - t0) / dur, 1)
      fn(ease(p))
      if (p < 1) {
        rafRef.current = requestAnimationFrame(frame)
      } else {
        rafRef.current = null
        fn(1)
        done()
      }
    }
    rafRef.current = requestAnimationFrame(frame)
  }, [])

  // ── goToB ─────────────────────────────────────────────────────────
  const goToB = useCallback(() => {
    stop()
    targetRef.current = "B"
    sizeAll()
    buildCache()
    const ta = taRef.current, tb = tbRef.current, tcv = tcvRef.current
    if (!ta || !tb || !tcv) return
    ta.style.opacity = "1"; tb.style.opacity = "0"
    tcv.getContext("2d")?.clearRect(0, 0, tcv.width, tcv.height)
    drawImage(0)
    run(DUR, t => {
      drawImage(t)
      if (t < 0.5) {
        drawTextMask(t * 2, true)
      } else {
        ta.style.opacity = "0"; tb.style.opacity = "1"
        drawTextMask((t - 0.5) * 2, false)
      }
    }, () => {
      ta.style.opacity = "0"; tb.style.opacity = "1"
      tcv.getContext("2d")?.clearRect(0, 0, tcv.width, tcv.height)
      drawImage(1)
    })
  }, [stop, sizeAll, buildCache, drawImage, drawTextMask, run])

  // ── goToA ─────────────────────────────────────────────────────────
  const goToA = useCallback(() => {
    stop()
    targetRef.current = "A"
    sizeAll()
    buildCache()
    const ta = taRef.current, tb = tbRef.current, tcv = tcvRef.current
    if (!ta || !tb || !tcv) return
    tb.style.opacity = "1"; ta.style.opacity = "0"
    tcv.getContext("2d")?.clearRect(0, 0, tcv.width, tcv.height)
    drawImage(1)
    run(DUR, t => {
      drawImage(1 - t)
      if (t < 0.5) {
        drawTextMask(t * 2, true)
      } else {
        tb.style.opacity = "0"; ta.style.opacity = "1"
        drawTextMask((t - 0.5) * 2, false)
      }
    }, () => {
      tb.style.opacity = "0"; ta.style.opacity = "1"
      tcv.getContext("2d")?.clearRect(0, 0, tcv.width, tcv.height)
      drawImage(0)
    })
  }, [stop, sizeAll, buildCache, drawImage, drawTextMask, run])

  // ── Init + events ─────────────────────────────────────────────────
  useEffect(() => {
    const row = rowRef.current
    if (!row) return

    const initTimer = setTimeout(() => {
      sizeAll()
      if (project.heroImage) {
        const img = new Image()
        img.crossOrigin = "anonymous"
        img.onload = () => {
          imgRef.current = img
          sizeAll()
          buildCache()
          drawImage(0)
        }
        img.src = project.heroImage
      }
    }, 50)

    const onResize = () => {
      cacheRef.current = null
      sizeAll()
      buildCache()
      drawImage(targetRef.current === "B" ? 1 : 0)
    }
    window.addEventListener("resize", onResize)

    const isHover = window.matchMedia("(hover: hover)").matches

    if (isHover) {
      const onEnter = () => { setHov(true); goToB() }
      const onLeave = () => { setHov(false); goToA() }
      row.addEventListener("mouseenter", onEnter)
      row.addEventListener("mouseleave", onLeave)
      return () => {
        clearTimeout(initTimer)
        row.removeEventListener("mouseenter", onEnter)
        row.removeEventListener("mouseleave", onLeave)
        window.removeEventListener("resize", onResize)
        stop()
      }
    } else {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(e => {
            if (e.isIntersecting) { setHov(true); goToB() }
            else { setHov(false); goToA() }
          })
        },
        { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      )
      observer.observe(row)
      return () => {
        clearTimeout(initTimer)
        observer.disconnect()
        window.removeEventListener("resize", onResize)
        stop()
      }
    }
  }, [sizeAll, buildCache, drawImage, goToB, goToA, stop, project.heroImage])

  // ── Render ────────────────────────────────────────────────────────
  return (
    <div
      ref={rowRef}
      onClick={() => navigateWithDither(project.slug)}
      style={{
        display: "flex",
        minHeight: 400,
        marginBottom: isLast ? 0 : 40,
        padding: "0 44px",
        borderTop: isFirst ? "1px solid #111" : "none",
        borderBottom: hov ? "1px solid #3a3a3a" : "1px solid #111",
        cursor: "pointer",
        background: hov ? "#0b0b0b" : "transparent",
        transition: "background 0.2s ease, border-color 0.2s ease",
      }}
    >
      {/* ── Left column ── */}
      <div
        style={{
          width: "55%",
          padding: "40px 44px",
          borderRight: hov ? "1px solid #3a3a3a" : "1px solid #1a1a1a",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          transition: "border-color 0.2s ease",
        }}
      >
        {/* Row top — static, never animates */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 10,
            color: "#333", letterSpacing: "0.08em",
          }}>
            {project.number}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 8,
            color: "#333", letterSpacing: "0.1em",
            textTransform: "uppercase",
            border: "1px solid #1e1e1e", padding: "2px 6px",
          }}>
            {project.tag}
          </span>
          <span style={{
            fontFamily: "var(--font-mono)", fontSize: 9,
            color: "#2a2a2a", marginLeft: "auto",
          }}>
            {project.year}
          </span>
        </div>

        {/* Project title — static, never animates */}
        <div style={{
          fontFamily: "var(--font-sans)",
          fontSize: 32, fontWeight: 700,
          color: "#e8e8e2",
          letterSpacing: "-0.03em", lineHeight: 1.05,
          marginBottom: 24,
        }}>
          {project.title}
        </div>

        {/* Support zone — dither swap happens here */}
        <div
          ref={supportRef}
          style={{ position: "relative", minHeight: 52, flex: 1, padding: "0 44px" }}
        >
          {/* State A — problem text */}
          <div
            ref={taRef}
            style={{ position: "absolute", inset: 0, zIndex: 1, display: "flex", alignItems: "flex-start" }}
          >
            <p style={{
              fontFamily: "var(--font-sans)",
              fontSize: 20, fontWeight: 400,
              color: "#3a3a3a", lineHeight: 1.7, maxWidth: 340,
            }}>
              {project.problem}
            </p>
          </div>

          {/* Text canvas — z-index 2, over both states */}
          <canvas
            ref={tcvRef}
            style={{
              position: "absolute", inset: 0, zIndex: 2,
              imageRendering: "pixelated", pointerEvents: "none",
            }}
          />

          {/* State B — insight text */}
          <div
            ref={tbRef}
            style={{
              position: "absolute", inset: 0, zIndex: 1,
              display: "flex", flexDirection: "column", justifyContent: "space-between",
              opacity: 0, pointerEvents: "none",
            }}
          >
            <div>
              <div style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "#c8f064", textTransform: "uppercase",
                letterSpacing: "0.12em", marginBottom: 8,
              }}>
                // insight
              </div>
              <p style={{
                fontFamily: "var(--font-sans)",
                fontSize: 20, fontWeight: 400,
                color: "#e8e8e2", lineHeight: 1.7, maxWidth: 340,
              }}>
                {project.insight}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 16 }}>
              <span style={{
                fontFamily: "var(--font-mono)", fontSize: 10,
                color: "#8c8c8c", textTransform: "uppercase", letterSpacing: "0.1em",
              }}>
                View case study
              </span>
              <span style={{ fontSize: 14, color: "#c8f064" }}>↗</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column — image canvas fills absolutely ── */}
      <div
        ref={imgColRef}
        style={{
          width: "45%",
          position: "relative",
          overflow: "hidden",
          background: "#0a0a0a",
        }}
      >
        <canvas
          ref={icvRef}
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            imageRendering: "pixelated", display: "block",
          }}
        />
      </div>
    </div>
  )
}

// ── Exported component ────────────────────────────────────────────
export default function HomeRows({ projects }: { projects: NotionProject[] }) {
  const rows = projects.map(toRowProject)
  return (
    <div>
      {rows.map((p, i) => (
        <ProjectRow key={p.slug} project={p} isFirst={i === 0} isLast={i === rows.length - 1} />
      ))}
    </div>
  )
}
