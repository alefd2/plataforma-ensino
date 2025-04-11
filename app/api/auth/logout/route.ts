import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export const dynamic = "force-static"

export async function POST(request: NextRequest) {
  try {
    ;(await cookies()).delete("user")

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro na rota de logout:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
