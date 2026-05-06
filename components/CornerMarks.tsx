"use client"

interface CornerMarksProps {
  size?: number
  color?: string
  thickness?: number
}

export default function CornerMarks({
  size = 10,
  color = "#333",
  thickness = 1,
}: CornerMarksProps) {
  const style = (pos: {
    top?: number | string
    bottom?: number | string
    left?: number | string
    right?: number | string
    borderTop?: string
    borderBottom?: string
    borderLeft?: string
    borderRight?: string
  }) => ({
    position: "absolute" as const,
    width: size,
    height: size,
    ...pos,
  })

  const border = `${thickness}px solid ${color}`

  return (
    <>
      {/* Top-left */}
      <span style={style({ top: 0, left: 0, borderTop: border, borderLeft: border })} />
      {/* Top-right */}
      <span style={style({ top: 0, right: 0, borderTop: border, borderRight: border })} />
      {/* Bottom-left */}
      <span style={style({ bottom: 0, left: 0, borderBottom: border, borderLeft: border })} />
      {/* Bottom-right */}
      <span style={style({ bottom: 0, right: 0, borderBottom: border, borderRight: border })} />
    </>
  )
}
