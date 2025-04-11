import { getFileViewUrl } from "@/lib/google-drive"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params: rawParams }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await rawParams

    if (!fileId) {
      return NextResponse.json(
        { error: "Parâmetro 'fileId' é obrigatório" },
        { status: 400 }
      )
    }

    const fileData = await getFileViewUrl(fileId)

    if (!fileData) {
      return NextResponse.json(
        { error: "Arquivo não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json(fileData)
  } catch (error) {
    console.error("Erro na rota de arquivo:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
