import { type NextRequest, NextResponse } from "next/server"
import { saveCourseStructure } from "@/lib/google-drive"

export async function GET(request: NextRequest) {
  try {
    const courses = await saveCourseStructure()
    return NextResponse.json({ success: true, courses })
  } catch (error) {
    console.error("Erro ao atualizar cursos:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
