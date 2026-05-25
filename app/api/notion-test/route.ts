import { NextResponse } from "next/server"
import { getNotionProjects } from "@/lib/notion"

export async function GET() {
  try {
    const projects = await getNotionProjects()
    return NextResponse.json({ ok: true, count: projects.length, projects })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json({ ok: false, error: msg }, { status: 500 })
  }
}
