"use client"

import { useEffect, useRef, useCallback } from "react"
import { usePathname, useRouter } from "next/navigation"

// ── Bayer 8×8 matrix — more gradations = smoother fill ────────────
const BAYER8 = [
    [  0, 32,  8, 40,  2, 34, 10, 42],
    [ 48, 16, 56, 24, 50, 18, 58, 26],
    [ 12, 44,  4, 36, 14, 46,  6, 38],
    [ 60, 28, 52, 20, 62, 30, 54, 22],
    [  3, 35, 11, 43,  1, 33,  9, 41],
    [ 51, 19, 59, 27, 49, 17, 57, 25],
    [ 15, 47,  7, 39, 13, 45,  5, 37],
    [ 63, 31, 55, 23, 61, 29, 53, 21],
]
const BAYER_SIZE = 8
const BAYER_MAX = 64 // BAYER_SIZE * BAYER_SIZE

// Each logical "pixel" in the dither pattern — 8px = chunky but smooth
const CELL = 8

// Timing in ms
const OUT_DURATION = 650  // fill to black
const HOLD_DURATION = 200  // hold at black before new page shows
const IN_DURATION  = 700  // dissolve from black

// Easing — smoothstep feels closest to the Tympanus demo
function smoothstep(t: number): number {
    const c = Math.max(0, Math.min(1, t))
    return c * c * (3 - 2 * c)
}

// ── Core draw — redraws ALL cells every frame ──────────────────────
// threshold 0 = all clear, threshold 1 = all black
// This is the key: not a sweep, but a global threshold comparison
function drawDither(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    threshold: number   // 0.0 → 1.0
) {
    ctx.clearRect(0, 0, width, height)
    if (threshold <= 0) return

    const cols = Math.ceil(width  / CELL)
    const rows = Math.ceil(height / CELL)

    ctx.fillStyle = "#000000"

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            // Normalised Bayer value for this cell: 0.0 → ~1.0
            const bayer = BAYER8[row % BAYER_SIZE][col % BAYER_SIZE] / BAYER_MAX
            // Cell is black if the current threshold exceeds its Bayer value
            if (threshold > bayer) {
                ctx.fillRect(col * CELL, row * CELL, CELL, CELL)
            }
        }
    }
}

// ── Hook — intercepts <a> clicks and plays the transition ──────────
export function usePageTransition() {
    const router   = useRouter()
    const pathname = usePathname()
    const canvasRef    = useRef<HTMLCanvasElement | null>(null)
    const rafRef       = useRef<number | null>(null)
    const isAnimating  = useRef(false)

    // Ensure canvas covers the full viewport
    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width  = window.innerWidth
        canvas.height = window.innerHeight
    }, [])

    useEffect(() => {
        // Create the canvas once and attach to body
        const canvas = document.createElement("canvas")
        canvas.style.cssText = `
            position: fixed;
            inset: 0;
            z-index: 9999;
            pointer-events: none;
            display: block;
        `
        document.body.appendChild(canvas)
        canvasRef.current = canvas

        resizeCanvas()
        window.addEventListener("resize", resizeCanvas)

        return () => {
            window.removeEventListener("resize", resizeCanvas)
            canvas.remove()
            if (rafRef.current) cancelAnimationFrame(rafRef.current)
        }
    }, [resizeCanvas])

    // IN phase — dissolve from black to clear after navigation lands
    const playIn = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")!
        const start = performance.now()

        function frame(now: number) {
            const raw = (now - start) / IN_DURATION
            const t   = smoothstep(Math.min(raw, 1))
            // threshold goes 1 → 0 (dissolving black away)
            drawDither(ctx, canvas!.width, canvas!.height, 1 - t)

            if (raw < 1) {
                rafRef.current = requestAnimationFrame(frame)
            } else {
                // Fully clear — done
                ctx.clearRect(0, 0, canvas!.width, canvas!.height)
                canvas!.style.pointerEvents = "none"
                isAnimating.current = false
                rafRef.current = null
            }
        }
        rafRef.current = requestAnimationFrame(frame)
    }, [])

    // OUT phase — fill to black, then navigate, then play IN
    const playOut = useCallback((href: string) => {
        if (isAnimating.current) return
        isAnimating.current = true

        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")!
        canvas.style.pointerEvents = "all"

        const start = performance.now()

        function frame(now: number) {
            const raw = (now - start) / OUT_DURATION
            const t   = smoothstep(Math.min(raw, 1))
            // threshold goes 0 → 1 (filling with black)
            drawDither(ctx, canvas!.width, canvas!.height, t)

            if (raw < 1) {
                rafRef.current = requestAnimationFrame(frame)
            } else {
                // Fully black — hold briefly then navigate
                drawDither(ctx, canvas!.width, canvas!.height, 1)
                rafRef.current = null

                setTimeout(() => {
                    router.push(href)
                    // IN phase starts after a short delay to let
                    // the new page mount under the black canvas
                    setTimeout(playIn, 180)
                }, HOLD_DURATION)
            }
        }
        rafRef.current = requestAnimationFrame(frame)
    }, [router, playIn])

    // Intercept all internal link clicks
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            const target = (e.target as HTMLElement).closest("a")
            if (!target) return

            const href = target.getAttribute("href")
            if (!href) return

            // Only intercept internal links
            const isInternal =
                href.startsWith("/") &&
                !href.startsWith("//") &&
                !target.hasAttribute("target")

            if (!isInternal) return
            if (href === pathname) return  // same page, skip
            if (isAnimating.current) return

            e.preventDefault()
            playOut(href)
        }

        document.addEventListener("click", handleClick)
        return () => document.removeEventListener("click", handleClick)
    }, [pathname, playOut])

    // Play IN on first page load
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        // Small delay to let the page paint first
        const t = setTimeout(() => {
            drawDither(canvas.getContext("2d")!, canvas.width, canvas.height, 1)
            playIn()
        }, 50)
        return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []) // intentionally only on mount

    return null
}

// ── Component — drop this anywhere in your layout ─────────────────
export default function PageTransition() {
    usePageTransition()
    return null
}
