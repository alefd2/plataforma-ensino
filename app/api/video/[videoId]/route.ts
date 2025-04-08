import { getFileViewUrl } from "@/lib/google-drive"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest, { params }: { params: { videoId?: string } }) {
  try {
    const { videoId } = params

    if (!videoId) {
      return NextResponse.json({ error: "Parâmetro 'videoId' é obrigatório" }, { status: 400 })
    }

    const videoUrl = await getFileViewUrl(videoId)

    if (!videoUrl) {
      return NextResponse.json({ error: "Vídeo não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ url: videoUrl })
  } catch (error) {
    console.error("Erro na rota de vídeo:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
