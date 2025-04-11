export const dynamic = "force-static"

import { type NextRequest, NextResponse } from "next/server"
import { loadCourseStructure } from "@/lib/google-drive"

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string; lessonsId: string } }
) {
  try {
    const { courseId } = params
    const courses = await loadCourseStructure()
    const course = courses.find((c) => c.id === courseId)

    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(course.levels)
  } catch (error) {
    console.error("Erro ao carregar cursos:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
