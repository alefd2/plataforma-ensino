import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser } from "@/lib/users"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get("email")

    if (!email) {
      return NextResponse.json(
        { error: "E-mail é obrigatório" },
        { status: 400 }
      )
    }

    const user = await authenticateUser(email)

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    // Definir cookie de autenticação
    ;(
      await // Definir cookie de autenticação
      cookies()
    ).set({
      name: "user",
      value: JSON.stringify({
        id: user.id,
        email: user.email,
        name: user.name,
      }),
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 semana
      sameSite: "strict",
    })

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    })
  } catch (error) {
    console.error("Erro na rota de login:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
