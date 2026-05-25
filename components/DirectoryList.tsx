"use client"

import * as React from "react"
import { navigateWithDither } from "@/lib/dither-transition"

// ── Bayer matrices ─────────────────────────────────────────────────
const BAYER4: number[][] = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]
const BAYER8: number[][] = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
]

const NOISE_W = 25
const NOISE_H = Math.floor(NOISE_W * (16 / 9))

// ── Project type ───────────────────────────────────────────────────
type Project = {
  title: string
  filter: string
  year: string
  slug: string
  thumb: string
  thumbnail?: string
  url?: string
}

// ── Canvas helpers ─────────────────────────────────────────────────
function makeNoise(w: number, h: number): ImageData {
  const data = new ImageData(w, h)
  for (let i = 0; i < data.data.length; i += 4) {
    const v = Math.random() < 0.03 ? 255 : 0
    data.data[i] = data.data[i + 1] = data.data[i + 2] = v
    data.data[i + 3] = 255
  }
  return data
}

function ditherPassColour(
  imgEl: HTMLImageElement,
  w: number,
  h: number,
  px: number,
  mat: number[][]
): ImageData {
  const matSize = mat.length
  const tmp = document.createElement("canvas")
  tmp.width = w; tmp.height = h
  const tctx = tmp.getContext("2d")!
  const imgAspect = imgEl.naturalWidth / imgEl.naturalHeight
  const canvasAspect = w / h
  let sx = 0, sy = 0, sw = imgEl.naturalWidth, sh = imgEl.naturalHeight
  if (imgAspect > canvasAspect) {
    sw = Math.floor(imgEl.naturalHeight * canvasAspect)
    sx = Math.floor((imgEl.naturalWidth - sw) / 2)
  } else {
    sh = Math.floor(imgEl.naturalWidth / canvasAspect)
    sy = Math.floor((imgEl.naturalHeight - sh) / 2)
  }
  tctx.drawImage(imgEl, sx, sy, sw, sh, 0, 0, w, h)
  const src = tctx.getImageData(0, 0, w, h)

  const dst = new ImageData(w, h)
  for (let i = 0; i < dst.data.length; i += 4) {
    dst.data[i] = 10; dst.data[i + 1] = 10; dst.data[i + 2] = 10; dst.data[i + 3] = 255
  }

  const CC = Math.ceil(w / px), RR = Math.ceil(h / px)
  for (let row = 0; row < RR; row++) {
    for (let col = 0; col < CC; col++) {
      const x0 = col * px, y0 = row * px
      const x1 = Math.min(x0 + px, w), y1 = Math.min(y0 + px, h)
      const cw = x1 - x0, ch = y1 - y0
      const n = cw * ch
      let rSum = 0, gSum = 0, bSum = 0, lumSum = 0
      for (let dy = 0; dy < ch; dy++) {
        for (let dx = 0; dx < cw; dx++) {
          const idx = ((y0 + dy) * w + (x0 + dx)) * 4
          rSum += src.data[idx]; gSum += src.data[idx + 1]; bSum += src.data[idx + 2]
          lumSum += 0.299 * src.data[idx] + 0.587 * src.data[idx + 1] + 0.114 * src.data[idx + 2]
        }
      }
      const brightness = lumSum / n / 255
      const threshold = mat[row % matSize][col % matSize] / (matSize * matSize)
      if (brightness > threshold) {
        const rAvg = Math.round(rSum / n)
        const gAvg = Math.round(gSum / n)
        const bAvg = Math.round(bSum / n)
        for (let dy = 0; dy < ch; dy++) {
          for (let dx = 0; dx < cw; dx++) {
            const idx = ((y0 + dy) * w + (x0 + dx)) * 4
            dst.data[idx] = rAvg; dst.data[idx + 1] = gAvg; dst.data[idx + 2] = bAvg; dst.data[idx + 3] = 255
          }
        }
      }
    }
  }
  return dst
}

function scaleImageData(src: ImageData, toW: number, toH: number): ImageData {
  const dst = new ImageData(toW, toH)
  const sx = src.width / toW
  const sy = src.height / toH
  for (let y = 0; y < toH; y++) {
    for (let x = 0; x < toW; x++) {
      const ox = Math.min(Math.floor(x * sx), src.width - 1)
      const oy = Math.min(Math.floor(y * sy), src.height - 1)
      const si = (oy * src.width + ox) * 4
      const di = (y * toW + x) * 4
      dst.data[di]     = src.data[si]
      dst.data[di + 1] = src.data[si + 1]
      dst.data[di + 2] = src.data[si + 2]
      dst.data[di + 3] = 255
    }
  }
  return dst
}

function blitPixelated(ctx: CanvasRenderingContext2D, data: ImageData, dispW: number, dispH: number) {
  const tmp = document.createElement("canvas")
  tmp.width = data.width
  tmp.height = data.height
  ;(tmp.getContext("2d") as CanvasRenderingContext2D).putImageData(data, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, dispW, dispH)
  ctx.drawImage(tmp, 0, 0, dispW, dispH)
}

// ── Breakpoint hook ────────────────────────────────────────────────
function useBreakpoint() {
  const get = () => {
    if (typeof window === "undefined") return "desktop"
    if (window.innerWidth < 768) return "mobile"
    return "desktop"
  }
  const [bp, setBp] = React.useState(get)
  React.useEffect(() => {
    const fn = () => setBp(get())
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])
  return bp
}

// ── Main Component ─────────────────────────────────────────────────
export function DirectoryList({ projects }: { projects: Project[] }) {
  const [hoveredSlug, setHoveredSlug] = React.useState<string | null>(null)
  const bp       = useBreakpoint()
  const isMobile = bp === "mobile"

  const [panelW, setPanelW] = React.useState(280)
  React.useEffect(() => {
    const calc = () => {
      const w = Math.min(340, Math.max(200, Math.floor(window.innerWidth * 0.25)))
      setPanelW(w)
    }
    calc()
    window.addEventListener("resize", calc)
    return () => window.removeEventListener("resize", calc)
  }, [])

  const cvW = panelW - 32
  const cvH = Math.floor(cvW * (16 / 9))

  const canvasRef     = React.useRef<HTMLCanvasElement>(null)
  const noiseRef      = React.useRef<ImageData | null>(null)
  const displayRef    = React.useRef<ImageData | null>(null)
  const rafRef        = React.useRef<number | null>(null)
  const timersRef     = React.useRef<ReturnType<typeof setTimeout>[]>([])
  const activeSlugRef = React.useRef<string | null>(null)

  React.useEffect(() => {
    const n = makeNoise(NOISE_W, NOISE_H)
    noiseRef.current   = n
    displayRef.current = n
    const canvas = canvasRef.current
    if (!canvas) return
    blitPixelated(canvas.getContext("2d") as CanvasRenderingContext2D, n, cvW, cvH)
  }, [cvW, cvH])

  function cancelAll() {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
  }

  function animateSweep(target: ImageData, onDone?: () => void) {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx  = canvas.getContext("2d") as CanvasRenderingContext2D
    const from = displayRef.current
      ? scaleImageData(displayRef.current, target.width, target.height)
      : scaleImageData(noiseRef.current!, target.width, target.height)
    const mixed      = new ImageData(new Uint8ClampedArray(from.data), target.width, target.height)
    const rows       = target.height
    const MS_PER_ROW = 260 / rows
    let row = rows - 1
    let lastTime: number | null = null
    function step(now: number) {
      if (lastTime === null) { lastTime = now; rafRef.current = requestAnimationFrame(step); return }
      const elapsed = now - lastTime
      const steps   = Math.max(1, Math.floor(elapsed / MS_PER_ROW))
      lastTime += steps * MS_PER_ROW
      for (let s = 0; s < steps; s++) {
        if (row < 0) break
        for (let x = 0; x < target.width; x++) {
          const i = (row * target.width + x) * 4
          mixed.data[i] = target.data[i]; mixed.data[i + 1] = target.data[i + 1]
          mixed.data[i + 2] = target.data[i + 2]; mixed.data[i + 3] = 255
        }
        row--
      }
      displayRef.current = mixed
      blitPixelated(ctx, mixed, cvW, cvH)
      if (row >= 0) { rafRef.current = requestAnimationFrame(step) } else { rafRef.current = null; onDone?.() }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function animateReverse(onDone?: () => void) {
    if (rafRef.current != null) { cancelAnimationFrame(rafRef.current); rafRef.current = null }
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx   = canvas.getContext("2d") as CanvasRenderingContext2D
    const noise = noiseRef.current!
    const from  = displayRef.current
      ? scaleImageData(displayRef.current, noise.width, noise.height)
      : new ImageData(new Uint8ClampedArray(noise.data), noise.width, noise.height)
    const mixed      = new ImageData(new Uint8ClampedArray(from.data), noise.width, noise.height)
    const rows       = noise.height
    const MS_PER_ROW = 180 / rows
    let row = 0
    let lastTime: number | null = null
    function step(now: number) {
      if (lastTime === null) { lastTime = now; rafRef.current = requestAnimationFrame(step); return }
      const elapsed = now - lastTime
      const steps   = Math.max(1, Math.floor(elapsed / MS_PER_ROW))
      lastTime += steps * MS_PER_ROW
      for (let s = 0; s < steps; s++) {
        if (row >= rows) break
        for (let x = 0; x < noise.width; x++) {
          const i = (row * noise.width + x) * 4
          mixed.data[i] = noise.data[i]; mixed.data[i + 1] = noise.data[i + 1]
          mixed.data[i + 2] = noise.data[i + 2]; mixed.data[i + 3] = 255
        }
        row++
      }
      displayRef.current = mixed
      blitPixelated(ctx, mixed, cvW, cvH)
      if (row < rows) { rafRef.current = requestAnimationFrame(step) } else { rafRef.current = null; onDone?.() }
    }
    rafRef.current = requestAnimationFrame(step)
  }

  function runPasses(slug: string, imgEl: HTMLImageElement) {
    const d0 = ditherPassColour(imgEl, cvW, cvH, 20, BAYER4)
    animateSweep(d0, () => {
      if (activeSlugRef.current !== slug) return
      const t1 = setTimeout(() => {
        if (activeSlugRef.current !== slug) return
        const d1 = ditherPassColour(imgEl, cvW, cvH, 10, BAYER8)
        animateSweep(d1, () => {
          if (activeSlugRef.current !== slug) return
          const t2 = setTimeout(() => {
            if (activeSlugRef.current !== slug) return
            const d2 = ditherPassColour(imgEl, cvW, cvH, 4, BAYER8)
            animateSweep(d2)
          }, 180)
          timersRef.current.push(t2)
        })
      }, 180)
      timersRef.current.push(t1)
    })
  }

  function onRowEnter(slug: string, thumb: string) {
    cancelAll()
    activeSlugRef.current = slug
    setHoveredSlug(slug)
    if (!thumb) return
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => { if (activeSlugRef.current !== slug) return; runPasses(slug, img) }
    img.src = thumb
  }

  function onRowLeave() {
    cancelAll()
    activeSlugRef.current = null
    setHoveredSlug(null)
    animateReverse()
  }

  const hoveredTitle = hoveredSlug ? projects.find(p => p.slug === hoveredSlug)?.title : null

  const mono = { fontFamily: "var(--font-mono)" } as const
  const sans = { fontFamily: "var(--font-sans)" } as const

  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100%", background: "#000000", color: "#ffffff" }}>

      {/* ── Left: scrollable list ── */}
      <div style={{ flex: 1, minWidth: 0, marginRight: isMobile ? 0 : panelW }}>

        {/* Header */}
        <div style={{ padding: "40px 32px 28px", borderBottom: "1px solid #1a1a1a" }}>
          <div style={{ ...mono, fontSize: 9, letterSpacing: "0.12em", color: "#8a8a8a", textTransform: "uppercase", marginBottom: 8 }}>
            — {projects.length} works
          </div>
          <div style={{ ...sans, fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>
            Directory
          </div>
        </div>

        {/* Column headers — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", padding: "10px 40px", borderBottom: "1px solid #1a1a1a" }}>
            {(["TITLE", "YEAR", ""] as const).map((h, i) => (
              <div
                key={i}
                style={{
                  ...(i === 0 ? { flex: 1 } : i === 1 ? { width: 80, flexShrink: 0 } : { width: 40, flexShrink: 0 }),
                  ...mono,
                  fontSize: 9,
                  color: "#333",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {h}
              </div>
            ))}
          </div>
        )}

        {/* Rows */}
        {projects.map(proj => {
          const hov = hoveredSlug === proj.slug
          return (
            <a
              key={proj.slug}
              href={proj.url ?? `/portfolio/${proj.slug}`}
              onClick={(e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return
                e.preventDefault()
                navigateWithDither(proj.url ?? `/portfolio/${proj.slug}`)
              }}
              onMouseEnter={() => onRowEnter(proj.slug, proj.thumbnail ?? proj.thumb)}
              onMouseLeave={onRowLeave}
              style={{
                display: "flex",
                alignItems: "center",
                minHeight: 72,
                padding: isMobile ? "0 20px" : "0 40px",
                background: hov ? "#0b0b0b" : "transparent",
                borderBottom: hov ? "1px solid #3a3a3a" : "1px solid #111",
                borderLeft: `2px solid ${hov ? "#c8f064" : "transparent"}`,
                borderRight: `2px solid ${hov ? "#c8f064" : "transparent"}`,
                cursor: "pointer",
                transition: "background 0.15s ease, border-color 0.15s ease",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              {/* Title */}
              <span style={{
                flex: 1,
                ...sans,
                fontSize: isMobile ? 18 : 24,
                fontWeight: 400,
                color: "#e8e8e2",
                lineHeight: 1,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                paddingRight: 16,
              }}>
                {proj.title}
              </span>

              {/* Year — desktop only */}
              {!isMobile && (
                <span style={{
                  width: 80, flexShrink: 0,
                  ...sans,
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#8c8c8c",
                  lineHeight: 1,
                }}>
                  {proj.year}
                </span>
              )}

              {/* Arrow */}
              <span style={{
                width: 40, flexShrink: 0,
                fontSize: 20,
                color: hov ? "#c8f064" : "#555",
                transition: "color 0.15s ease",
                textAlign: "right",
              }}>
                ↗
              </span>
            </a>
          )
        })}
      </div>

      {/* ── Right: FIXED 9:16 dither preview — desktop only ── */}
      {!isMobile && (
        <div style={{
          position: "fixed", top: 0, right: 0,
          width: panelW, height: "100vh",
          background: "#000", borderLeft: "1px solid #1a1a1a",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 12, zIndex: 50,
        }}>
          <span style={{ ...mono, fontSize: 9, letterSpacing: "0.14em", color: "#8a8a8a", textTransform: "uppercase", alignSelf: "flex-start", paddingLeft: 16 }}>
            &#47;&#47; PREVIEW
          </span>
          <canvas
            ref={canvasRef}
            width={cvW}
            height={cvH}
            style={{ width: cvW, height: cvH, imageRendering: "pixelated", border: "1px solid #1a1a1a", display: "block" }}
          />
          <span style={{
            ...mono,
            fontSize: 8, letterSpacing: "0.1em",
            color: hoveredTitle ? "#8a8a8a" : "transparent",
            textTransform: "uppercase",
            maxWidth: cvW, textAlign: "center",
            transition: "color 0.2s ease",
            minHeight: 14,
          }}>
            {hoveredTitle || "—"}
          </span>
        </div>
      )}
    </div>
  )
}

export default DirectoryList
