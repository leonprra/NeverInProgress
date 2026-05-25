"use client"

import { useEffect, useRef, useCallback } from "react"

// ── Bayer 8×8 matrix ──────────────────────────────────────────────
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
const BAYER_MAX  = 64

const CELL       = 8
const IN_DURATION = 700  // ms — dissolve from black on direct page load

function smoothstep(t: number): number {
    const c = Math.max(0, Math.min(1, t))
    return c * c * (3 - 2 * c)
}

function drawDither(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    threshold: number
) {
    ctx.clearRect(0, 0, width, height)
    if (threshold <= 0) return

    const cols = Math.ceil(width  / CELL)
    const rows = Math.ceil(height / CELL)
    ctx.fillStyle = "#000000"

    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            const bayer = BAYER8[row % BAYER_SIZE][col % BAYER_SIZE] / BAYER_MAX
            if (threshold > bayer) ctx.fillRect(col * CELL, row * CELL, CELL, CELL)
        }
    }
}

export function usePageTransition() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const rafRef    = useRef<number | null>(null)

    const resizeCanvas = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        canvas.width  = window.innerWidth
        canvas.height = window.innerHeight
    }, [])

    useEffect(() => {
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

    // Dither-in — dissolve from black to clear
    const playIn = useCallback(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext("2d")!
        const start = performance.now()

        function frame(now: number) {
            const raw = (now - start) / IN_DURATION
            const t   = smoothstep(Math.min(raw, 1))
            drawDither(ctx, canvas!.width, canvas!.height, 1 - t)

            if (raw < 1) {
                rafRef.current = requestAnimationFrame(frame)
            } else {
                ctx.clearRect(0, 0, canvas!.width, canvas!.height)
                canvas!.style.pointerEvents = "none"
                rafRef.current = null
            }
        }
        rafRef.current = requestAnimationFrame(frame)
    }, [])

    // Dither-in on direct page load only (not on client-side nav)
    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const t = setTimeout(() => {
            drawDither(canvas.getContext("2d")!, canvas.width, canvas.height, 1)
            playIn()
        }, 50)
        return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return null
}

export default function PageTransition() {
    usePageTransition()
    return null
}
