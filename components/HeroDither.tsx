"use client"

import { useEffect, useRef } from "react"

// ── Tunable constants ──────────────────────────────────────────────
const SPEED               = 0.001
const GRAIN_PX            = 3       // dither cell size (CSS px)
const BLOCK_PX            = 9       // letterform pixelation block size (CSS px)
const DENSITY             = 0.3
const INK                 = "#e8e8e2"
const RIPPLE_SPEED        = 520     // CSS px / s
const RIPPLE_DECAY        = 0.7
const RIPPLE_WIDTH        = 44      // CSS px (Gaussian half-width)
const RIPPLE_AMP          = 0.95
const CRYSTALLISE_ON_LOAD = true
const LOAD_RESOLVE_MS     = 1000

// ── Bayer 8×8 ordered-dither matrix ───────────────────────────────
const BAYER8 = [
  [ 0,32, 8,40, 2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44, 4,36,14,46, 6,38],
  [60,28,52,20,62,30,54,22],
  [ 3,35,11,43, 1,33, 9,41],
  [51,19,59,27,49,17,57,25],
  [15,47, 7,39,13,45, 5,37],
  [63,31,55,23,61,29,53,21],
] as const

const INK_R = parseInt(INK.slice(1, 3), 16)
const INK_G = parseInt(INK.slice(3, 5), 16)
const INK_B = parseInt(INK.slice(5, 7), 16)

type Ripple = { x: number; y: number; t0: number }

export default function HeroDither() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const elOrNull = canvasRef.current
    if (!elOrNull) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    // Rebind as a non-nullable const so nested closures see HTMLCanvasElement
    const el: HTMLCanvasElement = elOrNull
    const ctx = el.getContext("2d")!
    let raf = 0
    let t = 0
    const ripples: Ripple[] = []
    let loadT0 = -1  // set after setup() so timer starts when mask is ready

    let offscreen: HTMLCanvasElement | null = null
    let offCtx: CanvasRenderingContext2D | null = null
    let imgData: ImageData | null = null
    let maskCanvas: HTMLCanvasElement | null = null
    let cols = 0, rows = 0
    let cssW = 0, cssH = 0, phyW = 0, phyH = 0

    function setup() {
      const rect = el.getBoundingClientRect()
      cssW = rect.width
      cssH = rect.height
      if (cssW === 0 || cssH === 0) return
      const dpr = window.devicePixelRatio || 1
      phyW = Math.round(cssW * dpr)
      phyH = Math.round(cssH * dpr)
      el.width = phyW
      el.height = phyH

      cols = Math.ceil(cssW / GRAIN_PX)
      rows = Math.ceil(cssH / GRAIN_PX)

      offscreen = document.createElement("canvas")
      offscreen.width = cols
      offscreen.height = rows
      offCtx = offscreen.getContext("2d")!
      imgData = offCtx.createImageData(cols, rows)

      // ── Text mask: render at BLOCK_PX resolution, scale up nearest-neighbour
      const loW = Math.ceil(cssW / BLOCK_PX)
      const loH = Math.ceil(cssH / BLOCK_PX)
      const lo = document.createElement("canvas")
      lo.width = loW
      lo.height = loH
      const lctx = lo.getContext("2d")!

      let fs = loH * 0.85
      lctx.font = `900 ${fs}px Arial Black, Arial, sans-serif`
      const tw = lctx.measureText("LEON PEREIRA").width
      const targetW = loW * 0.92
      fs = Math.min(fs * (targetW / tw), loH * 0.98)
      lctx.font = `900 ${Math.max(1, Math.floor(fs))}px Arial Black, Arial, sans-serif`
      lctx.fillStyle = "#fff"
      lctx.textBaseline = "middle"
      lctx.textAlign = "center"
      lctx.fillText("LEON PEREIRA", loW / 2, loH / 2)

      maskCanvas = document.createElement("canvas")
      maskCanvas.width = phyW
      maskCanvas.height = phyH
      const mctx = maskCanvas.getContext("2d")!
      mctx.imageSmoothingEnabled = false
      mctx.drawImage(lo, 0, 0, phyW, phyH)
    }

    function render() {
      if (!offCtx || !imgData || !maskCanvas || !offscreen) return
      const now = performance.now()
      t += 0.006 + SPEED * 0.05

      let effDensity = DENSITY
      if (loadT0 > 0) {
        const p = Math.min(1, (now - loadT0) / LOAD_RESOLVE_MS)
        effDensity = 0.95 + (DENSITY - 0.95) * p
        if (p >= 1) loadT0 = -1
      }

      for (let i = ripples.length - 1; i >= 0; i--) {
        if ((now - ripples[i].t0) / 1000 > 1.6) ripples.splice(i, 1)
      }

      const d = imgData.data
      const rl = ripples.length

      for (let cy = 0; cy < rows; cy++) {
        for (let cx = 0; cx < cols; cx++) {
          const x = cx * GRAIN_PX
          const y = cy * GRAIN_PX

          const v = Math.sin(x * 0.013 + t) * Math.cos(y * 0.016 - t * 0.8)
                  + 0.5 * Math.sin((x + y) * 0.011 + t * 1.3)
          let b = effDensity + 0.30 * v

          for (let ri = 0; ri < rl; ri++) {
            const rp = ripples[ri]
            const elapsed = (now - rp.t0) / 1000
            const front = elapsed * RIPPLE_SPEED
            const dx = x - rp.x, dy = y - rp.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            const dd = (dist - front) / RIPPLE_WIDTH
            b += RIPPLE_AMP * Math.exp(-elapsed / RIPPLE_DECAY) * Math.exp(-dd * dd)
          }

          const thr = (BAYER8[cy & 7][cx & 7] + 0.5) / 64
          const i4 = (cy * cols + cx) * 4
          if (b > thr) {
            d[i4] = INK_R; d[i4 + 1] = INK_G; d[i4 + 2] = INK_B; d[i4 + 3] = 255
          } else {
            d[i4] = 0; d[i4 + 1] = 0; d[i4 + 2] = 0; d[i4 + 3] = 0
          }
        }
      }

      offCtx.putImageData(imgData, 0, 0)

      ctx.clearRect(0, 0, phyW, phyH)
      ctx.save()
      ctx.imageSmoothingEnabled = false
      ctx.drawImage(offscreen, 0, 0, phyW, phyH)
      ctx.globalCompositeOperation = "destination-in"
      ctx.drawImage(maskCanvas, 0, 0, phyW, phyH)
      ctx.restore()
    }

    let paused = false
    const obs = new IntersectionObserver(
      ([entry]) => { paused = !entry.isIntersecting },
      { threshold: 0 }
    )
    obs.observe(el)

    function loop() {
      if (!paused) render()
      raf = requestAnimationFrame(loop)
    }

    function onClick(e: MouseEvent) {
      const rect = el.getBoundingClientRect()
      if (ripples.length >= 3) ripples.shift()
      ripples.push({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        t0: performance.now(),
      })
    }

    let resizeTimer = 0
    function onResize() {
      clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(setup, 120)
    }

    el.addEventListener("click", onClick)
    window.addEventListener("resize", onResize)

    setup()
    if (CRYSTALLISE_ON_LOAD) loadT0 = performance.now()
    loop()

    return () => {
      cancelAnimationFrame(raf)
      el.removeEventListener("click", onClick)
      window.removeEventListener("resize", onResize)
      clearTimeout(resizeTimer)
      obs.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        cursor: "pointer",
      }}
    />
  )
}
