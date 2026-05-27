"use client"

import {
  createContext,
  useContext,
  useRef,
  useLayoutEffect,
  useEffect,
  useCallback,
  type ReactNode,
  type MouseEvent,
  type CSSProperties,
} from "react"
import { useRouter, usePathname } from "next/navigation"

// ── Tunable ────────────────────────────────────────────────────────
const SLIDE_DURATION = 400  // ms
const SLIDE_EASE     = "cubic-bezier(0.4, 0, 0.2, 1)"
const TRANSITION     = `transform ${SLIDE_DURATION}ms ${SLIDE_EASE}`
const PAGE_ORDER: Record<string, number> = { "/": 0, "/directory": 1 }

// ── Context ────────────────────────────────────────────────────────
interface TransitionCtx {
  navigate:   (href: string) => void
  setWrapper: (el: HTMLDivElement | null) => void
}

const Ctx = createContext<TransitionCtx | null>(null)

function useTrans() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error("Missing TransitionProvider")
  return ctx
}

// ── Provider ───────────────────────────────────────────────────────
export function TransitionProvider({ children }: { children: ReactNode }) {
  const router   = useRouter()
  const pathname = usePathname()
  const wrapEl   = useRef<HTMLDivElement | null>(null)
  const busy     = useRef(false)
  const pendDir  = useRef(0)
  // Stable ref so navigate() always reads the current pathname
  const pathRef  = useRef(pathname)
  useEffect(() => { pathRef.current = pathname }, [pathname])

  const setWrapper = useCallback((el: HTMLDivElement | null) => {
    wrapEl.current = el
  }, [])

  // Prefetch both routes on mount — restores what next/link provides automatically
  useEffect(() => {
    router.prefetch("/")
    router.prefetch("/directory")
  }, [router])

  // After pathname changes during a transition: set up enter animation.
  // useLayoutEffect fires synchronously before the browser paints, so the
  // enter-side reposition happens before the user sees the new page content.
  useLayoutEffect(() => {
    if (!busy.current) return
    const el = wrapEl.current
    if (!el) return
    const dir = pendDir.current

    // Instantly place at the incoming side (no transition)
    el.style.transition = "none"
    el.style.transform  = `translateX(${dir * 100}%)`

    const raf = requestAnimationFrame(() => {
      el.style.transition = TRANSITION
      el.style.transform  = "translateX(0)"

      const done = () => {
        el.removeEventListener("transitionend", done)
        clearTimeout(guard)
        busy.current        = false
        el.style.transition = ""
        el.style.transform  = ""
      }
      const guard = setTimeout(done, SLIDE_DURATION + 100)
      el.addEventListener("transitionend", done, { once: true })
    })

    return () => cancelAnimationFrame(raf)
  }, [pathname])

  const navigate = useCallback((href: string) => {
    if (busy.current) return

    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches

    if (reduced) { router.push(href); return }

    const el = wrapEl.current
    if (!el) { router.push(href); return }

    const currIdx = PAGE_ORDER[pathRef.current] ?? -1
    const nextIdx = PAGE_ORDER[href]            ?? -1

    // Already here, or not a tracked pair — navigate without animation
    if (currIdx === nextIdx)                               return
    if (currIdx === -1 || nextIdx === -1) { router.push(href); return }

    const dir = nextIdx > currIdx ? 1 : -1
    pendDir.current = dir
    busy.current    = true

    // Slide current content out; only call router.push after exit completes
    el.style.transition = TRANSITION
    el.style.transform  = `translateX(${-dir * 100}%)`

    const done = () => {
      el.removeEventListener("transitionend", done)
      clearTimeout(guard)
      router.push(href)
    }
    const guard = setTimeout(done, SLIDE_DURATION + 100)
    el.addEventListener("transitionend", done, { once: true })
  }, [router])

  return <Ctx.Provider value={{ navigate, setWrapper }}>{children}</Ctx.Provider>
}

// ── Animated wrapper ───────────────────────────────────────────────
// Place inside <main>, NOT around <Nav>. This is what slides.
export function TransitionWrapper({ children }: { children: ReactNode }) {
  const { setWrapper } = useTrans()
  return (
    <div style={{ overflowX: "hidden" }}>
      <div ref={setWrapper}>{children}</div>
    </div>
  )
}

// ── Drop-in link that triggers the slide ──────────────────────────
interface LinkProps {
  href:       string
  children:   ReactNode
  className?: string
  style?:     CSSProperties
  onClick?:   () => void
}

export function TransitionLink({ href, children, className, style, onClick }: LinkProps) {
  const { navigate } = useTrans()

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    e.preventDefault()
    onClick?.()
    navigate(href)
  }

  return (
    <a href={href} onClick={handleClick} className={className} style={style}>
      {children}
    </a>
  )
}
