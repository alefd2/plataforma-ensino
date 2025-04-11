import { type NextRequest, NextResponse } from "next/server"
import { loadCourseStructure } from "@/lib/google-drive"

export async function GET(
  _request: NextRequest,
  { params: rawParams }: { params: Promise<{ courseId: string }> }
) {
  try {
    const { courseId } = await rawParams
    const courses = await loadCourseStructure()
    const course = courses.find((c) => c.id === courseId)

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error("Erro ao carregar curso:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
