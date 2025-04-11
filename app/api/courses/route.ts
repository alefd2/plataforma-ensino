// /api/courses/${params.courseId}

import { type NextRequest, NextResponse } from "next/server"
import { loadCourseStructure } from "@/lib/google-drive"

export async function GET(request: NextRequest) {
  try {
    const courses = await loadCourseStructure()

    return NextResponse.json(courses)
  } catch (error) {
    console.error("Erro ao carregar cursos:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
