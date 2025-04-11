import { type NextRequest, NextResponse } from "next/server"
import { saveCourseStructure } from "@/lib/google-drive"
import fs from "fs/promises"
import path from "path"
export const dynamic = "force-static"
export async function GET(request: NextRequest) {
  try {
    // Tentar excluir o arquivo JSON existente
    try {
      const filePath = path.join(process.cwd(), "data", "courses.json")
      await fs.unlink(filePath)
      console.log("Arquivo de cursos excluído com sucesso")
    } catch (error) {
      console.log("Arquivo de cursos não encontrado ou não pôde ser excluído")
    }

    // Gerar nova estrutura de cursos
    const courses = await saveCourseStructure()

    return NextResponse.json({
      success: true,
      message: "Estrutura de cursos atualizada com sucesso",
      courses,
    })
  } catch (error) {
    console.error("Erro ao forçar atualização de cursos:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
