const BAYER8 = [
  [0,32,8,40,2,34,10,42],
  [48,16,56,24,50,18,58,26],
  [12,44,4,36,14,46,6,38],
  [60,28,52,20,62,30,54,22],
  [3,35,11,43,1,33,9,41],
  [51,19,59,27,49,17,57,25],
  [15,47,7,39,13,45,5,37],
  [63,31,55,23,61,29,53,21],
]

const PX  = 10   // block size in px
const DUR = 380  // ms

export function navigateWithDither(href: string) {
  const W  = window.innerWidth
  const H  = window.innerHeight
  const cW = Math.ceil(W / PX)
  const cH = Math.ceil(H / PX)

  const canvas = document.createElement("canvas")
  canvas.width  = cW
  canvas.height = cH
  Object.assign(canvas.style, {
    position: "fixed", inset: "0", zIndex: "9999",
    width: "100%", height: "100%",
    imageRendering: "pixelated", pointerEvents: "none",
  })
  document.body.appendChild(canvas)

  const ctx = canvas.getContext("2d")!
  ctx.fillStyle = "#0b0b0b"

  function draw(t: number) {
    ctx.clearRect(0, 0, cW, cH)
    for (let r = 0; r < cH; r++) {
      for (let c = 0; c < cW; c++) {
        if (t > BAYER8[r % 8][c % 8] / 64) {
          ctx.fillRect(c, r, 1, 1)
        }
      }
    }
  }

  let start: number | null = null
  function frame(ts: number) {
    if (!start) start = ts
    const t = Math.min((ts - start) / DUR, 1)
    draw(t)
    if (t < 1) {
      requestAnimationFrame(frame)
    } else {
      window.location.href = href
    }
  }

  requestAnimationFrame(frame)
}
