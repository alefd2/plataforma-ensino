import path from "path"
import fs from "fs/promises"

export interface User {
  id: string
  email: string
  name: string
  watchedLessons: {
    courseId: string
    lessonId: string
  }[]
}

const MOCK_USERS: User[] = [
  {
    id: "1",
    email: "alefolivfeira@gmail.com",
    name: "Alef Oliveira",
    watchedLessons: [],
  },
  {
    id: "2",
    email: "rebecca.ceg@gmail.com",
    name: "Rebecca",
    watchedLessons: [],
  },
]

// Função para salvar os usuários em um arquivo JSON
export async function saveUsers(users = MOCK_USERS) {
  try {
    const dataDir = path.join(process.cwd(), "data")

    // Criar diretório se não existir
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    await fs.writeFile(path.join(dataDir, "users.json"), JSON.stringify(users, null, 2))

    console.log("Usuários salvos com sucesso!")
    return users
  } catch (error) {
    console.error("Erro ao salvar usuários:", error)
    throw error
  }
}

// Função para carregar os usuários do arquivo JSON
export async function loadUsers(): Promise<User[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "users.json")
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erro ao carregar usuários:", error)
    // Se o arquivo não existir, criar com os usuários mock
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return await saveUsers()
    }
    return MOCK_USERS // Retornar os usuários mock em caso de erro
  }
}

// Função para marcar uma aula como assistida
export async function markLessonAsWatched(userId: string, courseId: string, lessonId: string) {
  try {
    const users = await loadUsers()
    const userIndex = users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      throw new Error("Usuário não encontrado")
    }

    // Verificar se a aula já está marcada como assistida
    const alreadyWatched = users[userIndex].watchedLessons.some(
      (lesson) => lesson.courseId === courseId && lesson.lessonId === lessonId,
    )

    if (!alreadyWatched) {
      users[userIndex].watchedLessons.push({ courseId, lessonId })
      await saveUsers(users)
    }

    return users[userIndex]
  } catch (error) {
    console.error("Erro ao marcar aula como assistida:", error)
    throw error
  }
}

// Função para desmarcar uma aula como assistida
export async function markLessonAsUnwatched(userId: string, courseId: string, lessonId: string) {
  try {
    const users = await loadUsers()
    const userIndex = users.findIndex((user) => user.id === userId)

    if (userIndex === -1) {
      throw new Error("Usuário não encontrado")
    }

    users[userIndex].watchedLessons = users[userIndex].watchedLessons.filter(
      (lesson) => !(lesson.courseId === courseId && lesson.lessonId === lessonId),
    )

    await saveUsers(users)
    return users[userIndex]
  } catch (error) {
    console.error("Erro ao desmarcar aula como assistida:", error)
    throw error
  }
}

// Função para verificar se uma aula foi assistida
export async function isLessonWatched(userId: string, courseId: string, lessonId: string) {
  try {
    const users = await loadUsers()
    const user = users.find((user) => user.id === userId)

    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    return user.watchedLessons.some((lesson) => lesson.courseId === courseId && lesson.lessonId === lessonId)
  } catch (error) {
    console.error("Erro ao verificar se aula foi assistida:", error)
    return false
  }
}

// Função para autenticar um usuário
export async function authenticateUser(email: string): Promise<User | null> {
  try {
    // Primeiro, tentar carregar usuários do arquivo
    let users: User[] = []

    try {
      users = await loadUsers()
    } catch (error) {
      console.error("Erro ao carregar usuários, usando mock:", error)
      users = MOCK_USERS
    }

    // Verificar se o email existe nos usuários
    const user = users.find((user) => user.email.toLowerCase() === email.toLowerCase())

    // Se não encontrar o usuário nos dados carregados, verificar nos usuários mock
    if (!user && !users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
      // Verificar se o email está nos usuários mock
      const mockUser = MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase())

      if (mockUser) {
        // Se encontrar nos usuários mock mas não nos carregados, salvar os usuários mock
        await saveUsers()
        return mockUser
      }
    }

    return user || null
  } catch (error) {
    console.error("Erro ao autenticar usuário:", error)

    // Em caso de erro, verificar diretamente nos usuários mock
    const mockUser = MOCK_USERS.find((user) => user.email.toLowerCase() === email.toLowerCase())
    return mockUser || null
  }
}
