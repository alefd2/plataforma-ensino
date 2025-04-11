import { type NextRequest, NextResponse } from "next/server"
import {
  loadUsers,
  markLessonAsWatched,
  markLessonAsUnwatched,
} from "@/lib/users"
import { cookies } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        { error: "userId é obrigatório" },
        { status: 400 }
      )
    }

    const users = await loadUsers()
    const user = users.find((u) => u.id === userId)

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      watchedLessons: user.watchedLessons,
    })
  } catch (error) {
    console.error("Erro na rota de progresso:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = cookies()

    const userCookie = await cookieStore.get("user")

    if (!userCookie?.value) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = JSON.parse(userCookie.value)
    const { courseId, lessonId, watched } = await request.json()

    if (!courseId || !lessonId || watched === undefined) {
      return NextResponse.json(
        { error: "Parâmetros inválidos" },
        { status: 400 }
      )
    }

    if (watched) {
      await markLessonAsWatched(user.id, courseId, lessonId)
    } else {
      await markLessonAsUnwatched(user.id, courseId, lessonId)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro na rota de progresso:", error)
    return NextResponse.json(
      { error: "Erro interno no servidor" },
      { status: 500 }
    )
  }
}
