import { NextResponse } from "next/server"
import { getNotionProjects } from "@/lib/notion"

export async function GET() {
  try {
    const projects = await getNotionProjects()
    return NextResponse.json({ ok: true, count: projects.length, projects })
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? String(e) }, { status: 500 })
  }
}
