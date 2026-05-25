import { Client, isFullPage } from "@notionhq/client"
import type { Project } from "./projects"

const notion = new Client({ auth: process.env.NOTION_TOKEN })
const DB_ID  = process.env.NOTION_PROJECTS_DB_ID!

// ── Property extractors ───────────────────────────────────────────

function getText(prop: any): string {
  if (!prop) return ""
  if (prop.type === "title")     return prop.title.map((t: any)     => t.plain_text).join("")
  if (prop.type === "rich_text") return prop.rich_text.map((t: any) => t.plain_text).join("")
  return ""
}

function getSelect(prop: any): string {
  return prop?.select?.name ?? ""
}

function getDate(prop: any): string {
  const start = prop?.date?.start
  return start ? start.slice(0, 4) : ""
}

function getFile(prop: any): string {
  const files: any[] = prop?.files ?? []
  if (!files.length) return ""
  const f = files[0]
  return f.type === "external" ? (f.external?.url ?? "") : (f.file?.url ?? "")
}

function getNumber(prop: any): string {
  const n = prop?.number
  if (n == null) return ""
  return String(n).padStart(3, "0")
}

function getBoolean(prop: any): boolean {
  return prop?.checkbox === true
}

function getGalleryImages(prop: any): string[] {
  const text = getText(prop)
  if (!text) return []
  return text.split("\n").map((s: string) => s.trim()).filter(Boolean)
}

function parseCredits(text: string): { k: string; lines: string[] }[] {
  const sections = text.split(/\n\n+/).map(s => s.trim()).filter(Boolean)
  if (!sections.length) return []
  if (sections.length === 1) {
    return [{ k: "Credits", lines: sections[0].split("\n").filter(Boolean) }]
  }
  return sections.map((s, i) => ({
    k:     String(i + 1).padStart(2, "0"),
    lines: s.split("\n").filter(Boolean),
  }))
}

// ── Page → Project mapper ─────────────────────────────────────────

const CARD_LABELS = ["overview", "process", "outcome"] as const

function mapPage(page: any): Project | null {
  if (!isFullPage(page)) return null
  const p = page.properties

  const title  = getText(p["Title"])
  const slug   = getText(p["Slug"])
  const filter = getSelect(p["Filter"]) || "Industrial"
  const year   = getDate(p["Date"])     || "2024"
  const n      = getNumber(p["Count"])

  if (!title || !slug) return null

  const tagline     = getText(p["Insight"]) || undefined
  const problem     = getText(p["Problem"]) || undefined
  const creditsText = getText(p["Credits"])

  // Thumb (hero): Hero Image → Thumbnail → first URL from Gallery 1 → Gallery
  const thumb     = getFile(p["Hero Image"])
    || getFile(p["Thumbnail"])
    || getGalleryImages(p["Gallery 1"])[0]
    || getGalleryImages(p["Gallery"])[0]
    || ""
  const thumbnail = getFile(p["Thumbnail"]) || undefined

  const project: Project = { n, title, year, slug, filter, thumb, thumbnail, tagline, problem }

  // Build up to 3 cards from Description 1/2/3 + Gallery 1/2/3
  // Card 1 falls back to legacy "Description" / "Gallery" fields
  const cards: NonNullable<Project["cards"]> = []
  for (let i = 1; i <= 3; i++) {
    const descText = getText(p[`Description ${i}`]) || (i === 1 ? getText(p["Description"]) : "")
    if (!descText) continue

    const galleryProp = p[`Gallery ${i}`] ?? (i === 1 ? p["Gallery"] : null)
    const images      = getGalleryImages(galleryProp)

    cards.push({
      label:      `0${i} · ${CARD_LABELS[i - 1]}`,
      heading:    (i === 1 ? tagline : undefined) || title,
      paragraphs: [descText],
      kvs:        [],
      figRef:     `fig. 0${i}`,
      figCaption: `fig. 0${i} — ${title}, ${filter}, ${year}`,
      images,
    })
  }

  if (cards.length > 0) project.cards = cards
  if (creditsText)      project.credits = parseCredits(creditsText)

  return project
}

// ── Public API ────────────────────────────────────────────────────

export async function getNotionProjects(): Promise<Project[]> {
  const res = await notion.dataSources.query({
    data_source_id: DB_ID,
    sorts: [{ property: "Count", direction: "descending" }],
    filter: {
      and: [
        { property: "Slug",   rich_text: { is_not_empty: true } },
        { property: "Status", status:    { equals: "Live" }     },
      ],
    },
  })

  return res.results
    .map(mapPage)
    .filter((p): p is Project => p !== null)
}

export async function getNotionProject(slug: string): Promise<Project | null> {
  const res = await notion.dataSources.query({
    data_source_id: DB_ID,
    filter: { property: "Slug", rich_text: { equals: slug } },
  })

  const page = res.results[0]
  if (!page) return null
  return mapPage(page)
}

export async function getFeaturedNotionProjects(): Promise<Project[]> {
  const res = await notion.dataSources.query({
    data_source_id: DB_ID,
    sorts: [{ property: "Count", direction: "descending" }],
    filter: {
      and: [
        { property: "Slug",     rich_text: { is_not_empty: true } },
        { property: "Status",   status:    { equals: "Live" }     },
        { property: "Featured", checkbox:  { equals: true }       },
      ],
    },
  })

  return res.results
    .map(mapPage)
    .filter((p): p is Project => p !== null)
}

export async function getNotionSlugs(): Promise<string[]> {
  const projects = await getNotionProjects()
  return projects.map(p => p.slug)
}
