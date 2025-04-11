export const dynamic = "force-static"
import { type NextRequest, NextResponse } from "next/server"
import { loadCourseStructure } from "@/lib/google-drive"
export async function GET(
  _request: NextRequest,
  { params }: { params: { courseId: string; levelsId: string } }
) {
  try {
    const { courseId, levelsId } = params

    const courses = await loadCourseStructure()

    const course = courses.find((course) => course.id === courseId)
    if (!course) {
      return NextResponse.json(
        { error: "Curso não encontrado" },
        { status: 404 }
      )
    }

    const level = course.levels.find((level) => level.id === levelsId)
    if (!level) {
      return NextResponse.json(
        { error: "Nível não encontrado" },
        { status: 404 }
      )
    }

    console.debug(level)

    return NextResponse.json(level.modules)
  } catch (error) {
    console.error("Erro ao carregar módulos:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
