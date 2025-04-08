import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const userCookie = cookies().get("user")

    if (!userCookie?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Erro na rota de verificação de autenticação:", error)
    return NextResponse.json({ error: "Erro interno no servidor" }, { status: 500 })
  }
}
