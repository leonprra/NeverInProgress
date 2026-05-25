"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { Project } from "@/lib/projects"
import styles from "./ProjectLayout.module.css"

const DEFAULT_CARD = {
  label: "01 · overview",
  heading: "Full case study coming soon.",
  paragraphs: [
    "Process documentation, research notes, and final outcomes will be published here.",
    "Check back soon for the complete write-up.",
  ],
  kvs: [] as { k: string; v: string; on?: string }[],
  figRef: "fig. 01",
  figCaption: "fig. 01 — overview",
  images: [] as string[],
}

export default function ProjectLayout({
  project,
  allProjects,
}: {
  project: Project
  allProjects: Project[]
}) {
  const currentIndex = allProjects.findIndex(p => p.slug === project.slug)
  const nextProject  = allProjects[(currentIndex + 1) % allProjects.length]
  const total        = allProjects.length

  const cards   = project.cards   ?? [DEFAULT_CARD]
  const specs   = project.specs   ?? [
    { k: "Discipline", v: project.filter },
    { k: "Year",       v: project.year   },
    { k: "Status",     v: "Coming soon"  },
  ]
  const credits = project.credits ?? [
    { k: "Project", lines: ["Full case study coming soon."] },
    { k: "Type",    lines: ["Set in Space Grotesk & Space Mono."] },
  ]

  const tagline  = project.tagline          ?? "Full case study coming soon."
  const heroCapL = project.heroCaption      ?? `Fig. 01 — ${project.title}, ${project.filter}, ${project.year}`
  const heroCapR = project.heroCaptionRight ?? `${project.year} · 1 / 1`

  const [activeImages, setActiveImages] = useState<number[]>(() => cards.map(() => 0))

  const cardRefs        = useRef<(HTMLElement | null)[]>([])
  const outerRefs       = useRef<(HTMLDivElement | null)[]>([])
  const activeImagesRef = useRef<number[]>(cards.map(() => 0))

  useEffect(() => {
    cardRefs.current  = cardRefs.current.slice(0, cards.length)
    outerRefs.current = outerRefs.current.slice(0, cards.length)

    const outerEls = outerRefs.current.filter(Boolean) as HTMLDivElement[]
    const cardEls  = cardRefs.current.filter(Boolean) as HTMLElement[]

    // ── Card reveal ────────────────────────────────────────────────
    const revealIO = new IntersectionObserver(
      entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const idx = outerEls.indexOf(e.target as HTMLDivElement)
            if (idx >= 0 && cardEls[idx]) cardEls[idx].classList.add(styles.isVisible)
          }
        })
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    )
    outerEls.forEach(z => revealIO.observe(z))

    // ── Scroll → image index ───────────────────────────────────────
    const handleScroll = () => {
      const updated = [...activeImagesRef.current]
      let changed = false

      for (let ci = 0; ci < cards.length; ci++) {
        const imgs = cards[ci].images ?? []
        if (imgs.length === 0) continue
        const outer = outerRefs.current[ci]
        if (!outer) continue

        const rect     = outer.getBoundingClientRect()
        const total    = rect.height - window.innerHeight
        const scrolled = Math.max(0, -rect.top)
        const progress = total > 0 ? Math.min(scrolled / total, 1) : 0
        const idx      = Math.min(Math.floor(progress * imgs.length), imgs.length - 1)

        if (idx !== updated[ci]) { updated[ci] = idx; changed = true }
      }

      if (changed) {
        activeImagesRef.current = updated
        setActiveImages([...updated])
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      revealIO.disconnect()
      window.removeEventListener("scroll", handleScroll)
    }
  }, [cards])

  return (
    <div className={styles.page}>

      {/* ── Topbar ── */}
      <nav className={styles.topbar}>
        <Link href="/directory" className={styles.back}>← Directory</Link>
        <div className={styles.crumbs}>
          <span>Index</span>
          <span className={styles.crumbSep}>/</span>
          <span>{project.filter}</span>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbActive}>{project.title}</span>
        </div>
        <div className={styles.topbarIdx}>
          {String(currentIndex + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(total).padStart(2, "0")}
        </div>
      </nav>

      {/* ── Hero ── */}
      <figure className={styles.hero}>
        {project.thumb ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={project.thumb} alt={project.title} className={styles.heroImg} crossOrigin="anonymous" />
        ) : (
          <div className={styles.heroPlaceholder}><div className={styles.heroObj} /></div>
        )}
        <div className={styles.heroFloor} />
        <div className={styles.brackets}>
          <span className={styles.tl} /><span className={styles.tr} />
          <span className={styles.bl} /><span className={styles.br} />
        </div>
        <figcaption className={styles.heroCaption}>{heroCapL}</figcaption>
        <div className={styles.heroCaptionRight}>{heroCapR}</div>
      </figure>

      {/* ── Title block ── */}
      <section className={`${styles.padX} ${styles.titleBlock}`}>
        <div>
          <div className={styles.catLabel}>{project.filter}</div>
          <h1 className={styles.title}>{project.title}<span className={styles.titleSlash}>.</span></h1>
          <p className={styles.tagline}>{tagline}</p>
        </div>
        <aside>
          <div className={styles.specRevLabel}>Specification&nbsp;·&nbsp;rev.&nbsp;01</div>
          <div className={styles.titleMeta}>
            {specs.map((spec, i) => (
              <div key={i}>
                <span className={styles.specK}>{spec.k}</span>
                <span className={styles.specV}>{spec.v}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      {/* ── Theater ── */}
      <section className={`${styles.padX} ${styles.theater}`}>
        <div className={styles.streamLabel}>
          The Work&nbsp;·&nbsp;{String(cards.length).padStart(2, "0")} beat{cards.length !== 1 ? "s" : ""}
        </div>

        {cards.map((card, i) => {
          const imgs      = card.images ?? []
          const hasImages = imgs.length > 0
          const isEven    = i % 2 === 0
          const isLast    = i === cards.length - 1
          const activeImg = activeImages[i] ?? 0

          const article = (
            <article
              ref={el => { cardRefs.current[i] = el }}
              data-frame={i}
              className={[
                styles.card,
                isEven ? styles.cardEven : styles.cardOdd,
                isLast && !hasImages ? styles.cardLast : "",
              ].join(" ")}
            >
              <div className={styles.cardNum}>
                {String(i + 1).padStart(2, "0")}
                <span className={styles.slashes}>&nbsp;///</span>
              </div>
              {card.paragraphs.map((p, pi) => <p key={pi}>{p}</p>)}
              {card.kvs.length > 0 && (
                <div className={styles.kvRow}>
                  {card.kvs.map((kv, ki) => (
                    <div key={ki}>
                      <span className={styles.kvK}>{kv.k}</span>
                      <span className={styles.kvV}>
                        {kv.on && <span className={styles.kvOn}>{kv.on}</span>}
                        {kv.on && kv.v && " "}{kv.v}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </article>
          )

          if (!hasImages) {
            return (
              <div
                key={i}
                ref={el => { outerRefs.current[i] = el }}
                className={styles.cardZone}
              >
                {article}
              </div>
            )
          }

          return (
            <div
              key={i}
              ref={el => { outerRefs.current[i] = el }}
              className={styles.galleryOuter}
              style={{ height: `${imgs.length * 100}vh` }}
            >
              <div className={styles.gallerySticky}>
                <div className={styles.cardRow}>
                  {article}
                  <div className={`${styles.cardWell} ${isLast ? styles.cardWellLast : ""}`}>
                    <div className={styles.wellInner}>
                      {imgs.map((src, imgIdx) => (
                        <div
                          key={imgIdx}
                          className={[
                            styles.frame,
                            activeImg === imgIdx ? styles.isActive : "",
                          ].join(" ")}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={src}
                            alt={`${project.title} — ${card.label} ${imgIdx + 1}`}
                            className={styles.frameImg}
                            crossOrigin="anonymous"
                          />
                        </div>
                      ))}
                    </div>
                    <div className={styles.wellDots}>
                      {imgs.map((_, imgIdx) => (
                        <span
                          key={imgIdx}
                          className={`${styles.dot} ${activeImg === imgIdx ? styles.dotOn : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      {/* ── Credits ── */}
      <section className={`${styles.padX} ${styles.credits}`}>
        <div className={styles.creditsLabel}>Credits + context</div>
        <div className={styles.creditsGrid}>
          {credits.map((cred, i) => (
            <div key={i} className={styles.credCard}>
              <span className={styles.credLabel}>{cred.k}</span>
              {cred.lines.map((line, li) => <p key={li}>{line}</p>)}
            </div>
          ))}
        </div>
      </section>

      {/* ── Next project ── */}
      <Link href={`/portfolio/${nextProject.slug}`} className={styles.nextProject} aria-label={`Next project: ${nextProject.title}`}>
        <div>
          <span className={styles.nextLabel}>
            Next project&nbsp;&nbsp;·&nbsp;&nbsp;
            {String((currentIndex + 2) > total ? 1 : currentIndex + 2).padStart(2, "0")}
            &nbsp;/&nbsp;{String(total).padStart(2, "0")}
          </span>
          <span className={styles.nextBig}>
            <span className={styles.nextNum}>{nextProject.n}&nbsp;//</span>
            {nextProject.title}
          </span>
          <span className={styles.nextCount}>
            {nextProject.filter}&nbsp;&nbsp;·&nbsp;&nbsp;{nextProject.year}
          </span>
        </div>
        <div className={styles.nextArrow} aria-hidden="true">↗</div>
      </Link>

      {/* ── Colophon ── */}
      <div className={styles.colophon}>
        <span>
          © {project.n} — {project.title}
          <span className={styles.colophonDot}>·</span>
          Set in Space Grotesk &amp; Space Mono
        </span>
        <span>Ref. {project.n}-{project.year}</span>
      </div>

    </div>
  )
}
