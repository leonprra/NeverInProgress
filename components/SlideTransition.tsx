"use client"

// Replaced by TransitionProvider + TransitionWrapper in TransitionContext.tsx.
// Kept as a no-op so any stale import doesn't break a build.
import type { ReactNode } from "react"
export default function SlideTransition({ children }: { children: ReactNode }) {
  return <>{children}</>
}
