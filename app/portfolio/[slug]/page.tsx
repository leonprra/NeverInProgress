import { notFound } from "next/navigation"
import PROJECTS from "@/lib/projects"
import { getNotionProjects, getNotionProject } from "@/lib/notion"
import ProjectLayout from "@/components/ProjectLayout"

export const revalidate = 60

export async function generateStaticParams() {
  try {
    const projects = await getNotionProjects()
    if (projects.length > 0) return projects.map(p => ({ slug: p.slug }))
  } catch { /* fall through */ }
  return PROJECTS.map(p => ({ slug: p.slug }))
}

export default async function PortfolioPage({ params }: { params: { slug: string } }) {
  // Fetch the specific project and the full list in parallel
  let project   = null
  let allProjects = PROJECTS

  try {
    const [notionProject, notionAll] = await Promise.all([
      getNotionProject(params.slug),
      getNotionProjects(),
    ])
    if (notionProject) project     = notionProject
    if (notionAll.length > 0)      allProjects = notionAll
  } catch { /* use static fallback */ }

  // Fallback to static data if Notion returned nothing
  if (!project) project = PROJECTS.find(p => p.slug === params.slug) ?? null
  if (!project) notFound()

  return <ProjectLayout project={project} allProjects={allProjects} />
}
