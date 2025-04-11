import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const cookieStore = cookies() // Não precisa de await
    const userCookie = cookieStore.get("user") // Obtenha o cookie diretamente

    if (!userCookie?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const userData = JSON.parse(userCookie.value)
    return NextResponse.json(userData)
  } catch (error) {
    console.error("Error checking auth:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
