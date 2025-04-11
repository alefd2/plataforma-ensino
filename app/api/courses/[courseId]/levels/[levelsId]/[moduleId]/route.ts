export const dynamic = "force-static"
import { type NextRequest, NextResponse } from "next/server"
import { loadCourseStructure } from "@/lib/google-drive"
export async function GET(
  _request: NextRequest,
  {
    params: rawParams,
  }: {
    params: Promise<{ courseId: string; levelsId: string; moduleId: string }>
  }
) {
  try {
    const { courseId, levelsId, moduleId } = await rawParams // Aguarda os parâmetros serem resolvidos

    const courses = await loadCourseStructure()
    const course = courses.find((c) => c.id === courseId)
    const level = course?.levels.find((l) => l.id === levelsId)
    const module = level?.modules.find((m) => m.id === moduleId)

    if (!module) {
      return NextResponse.json(
        { error: "Módulo não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(module)
  } catch (error) {
    console.error("Erro ao carregar módulo:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
