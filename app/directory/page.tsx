import PROJECTS from "@/lib/projects"
import { DirectoryList } from "@/components/DirectoryList"

export default function Directory() {
  const projects = PROJECTS.filter(p => p.url)
  return <DirectoryList projects={projects} />
}
