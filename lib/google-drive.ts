import { google } from "googleapis"
import path from "path"
import fs from "fs/promises"

// Configuração da autenticação com o Google Drive
const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
})

const drive = google.drive({ version: "v3", auth })

// Função para listar o conteúdo de uma pasta
export async function listFolderContents(folderId: string) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
      orderBy: "name",
    })

    return response.data.files || []
  } catch (error) {
    console.error("Erro ao listar conteúdo da pasta:", error)
    throw error
  }
}

// Atualizar a função getFileViewUrl para usar URLs de incorporação do Google Drive
export async function getFileViewUrl(fileId: string) {
  try {
    // Obter informações do arquivo
    const file = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,webContentLink,webViewLink",
    })

    const mimeType = file.data.mimeType || ""

    // Para documentos do Google, retornar o link de visualização
    if (mimeType.includes("application/vnd.google-apps.document")) {
      return {
        url: `https://docs.google.com/document/d/${fileId}/edit?usp=sharing&embedded=true`,
        type: "iframe",
        mimeType,
      }
    }

    if (mimeType.includes("application/vnd.google-apps.spreadsheet")) {
      return {
        url: `https://docs.google.com/spreadsheets/d/${fileId}/edit?usp=sharing&embedded=true`,
        type: "iframe",
        mimeType,
      }
    }

    if (mimeType.includes("application/vnd.google-apps.presentation")) {
      return {
        url: `https://docs.google.com/presentation/d/${fileId}/edit?usp=sharing&embedded=true`,
        type: "iframe",
        mimeType,
      }
    }

    // Para PDFs, retornar o link de visualização
    if (mimeType === "application/pdf") {
      return {
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        type: "iframe",
        mimeType,
      }
    }

    // Para imagens, retornar o link direto
    if (mimeType.startsWith("image/")) {
      const accessToken = await auth.getAccessToken()
      return {
        url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken.token}`,
        type: "image",
        mimeType,
      }
    }

    // Para vídeos, retornar o link de incorporação
    if (
      mimeType.startsWith("video/") ||
      mimeType === "application/vnd.google-apps.video"
    ) {
      return {
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        type: "video",
        mimeType,
      }
    }

    // Para outros tipos de arquivo, retornar o link de visualização
    return {
      url: `https://drive.google.com/file/d/${fileId}/preview`,
      type: "other",
      mimeType,
    }
  } catch (error) {
    console.error("Erro ao obter URL do arquivo:", error)
    throw error
  }
}

// Função para verificar se um arquivo é um vídeo
export function isVideoFile(mimeType: string) {
  return (
    mimeType.startsWith("video/") ||
    mimeType === "application/vnd.google-apps.video"
  )
}

// Função para verificar se um arquivo é um documento
export function isDocFile(mimeType: string) {
  return (
    mimeType === "application/pdf" ||
    mimeType === "application/vnd.google-apps.document" ||
    mimeType === "application/vnd.google-apps.spreadsheet" ||
    mimeType === "application/vnd.google-apps.presentation" ||
    mimeType === "text/plain" ||
    mimeType === "application/msword" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/vnd.ms-excel" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-powerpoint" ||
    mimeType ===
      "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  )
}

// Função para extrair a estrutura completa de cursos
export async function extractCourseStructure(
  rootFolderId = process.env.GOOGLE_FOLDER_ID
) {
  if (!rootFolderId) {
    throw new Error("ID da pasta raiz não fornecido")
  }

  const coursesFolder = await listFolderContents(rootFolderId)
  const courses = []

  for (const course of coursesFolder) {
    if (course.mimeType === "application/vnd.google-apps.folder") {
      const courseData = {
        id: course.id,
        title: course.name,
        tags: extractTags(course.name),
        description: `Descrição para ${course.name}`,
        levels: [],
        type: course.name.toLowerCase().includes("formação")
          ? "training"
          : "course",
      }

      // Se for uma formação, buscar níveis
      if (courseData.type === "training") {
        const levels = await listFolderContents(course.id)

        for (const [levelIndex, level] of levels.entries()) {
          if (level.mimeType === "application/vnd.google-apps.folder") {
            const levelData = {
              id: level.id,
              title: level.name,
              level: levelIndex + 1,
              modules: [],
            }

            // Buscar módulos dentro do nível
            const modules = await listFolderContents(level.id)

            for (const [moduleIndex, module] of modules.entries()) {
              if (module.mimeType === "application/vnd.google-apps.folder") {
                const moduleData = {
                  id: module.id,
                  title: module.name,
                  sort: moduleIndex + 1,
                  "lessons-submodules": [],
                }

                // Buscar submódulos ou aulas diretas
                const subItems = await listFolderContents(module.id)

                for (const [subIndex, subItem] of subItems.entries()) {
                  if (
                    subItem.mimeType === "application/vnd.google-apps.folder"
                  ) {
                    // É um submódulo
                    const submoduleData = {
                      id: subItem.id, // Usar o ID original do submódulo
                      sort: subIndex + 1,
                      title: subItem.name,
                      lessons: [],
                    }

                    // Buscar aulas dentro do submódulo
                    const lessons = await listFolderContents(subItem.id)

                    for (const lesson of lessons) {
                      if (
                        lesson.mimeType !== "application/vnd.google-apps.folder"
                      ) {
                        const lessonType = isVideoFile(lesson.mimeType)
                          ? "video"
                          : isDocFile(lesson.mimeType)
                          ? "docs"
                          : "other"

                        submoduleData.lessons.push({
                          id: lesson.id,
                          title: lesson.name,
                          type: lessonType,
                          videoUrl: lesson.id, // Armazenamos apenas o ID, a URL será gerada sob demanda
                          completed: false,
                        })
                      }
                    }

                    moduleData["lessons-submodules"].push(submoduleData)
                  } else {
                    // É uma aula direta no módulo
                    const lessonType = isVideoFile(subItem.mimeType)
                      ? "video"
                      : isDocFile(subItem.mimeType)
                      ? "docs"
                      : "other"

                    // Criamos um submódulo padrão se não existir
                    if (moduleData["lessons-submodules"].length === 0) {
                      moduleData["lessons-submodules"].push({
                        id: module.id, // Usar o ID do módulo para o submódulo padrão
                        sort: 1,
                        title: "Aulas",
                        lessons: [],
                      })
                    }

                    moduleData["lessons-submodules"][0].lessons.push({
                      id: subItem.id,
                      title: subItem.name,
                      type: lessonType,
                      videoUrl: subItem.id,
                      completed: false,
                    })
                  }
                }

                levelData.modules.push(moduleData)
              }
            }

            courseData.levels.push(levelData)
          }
        }
      } else {
        // Se for um curso simples, tratar como um único nível
        const levelData = {
          id: course.id, // Usar o ID do curso para o nível padrão
          title: "Conteúdo do Curso",
          level: 1,
          modules: [],
        }

        // Buscar módulos diretamente
        const modules = await listFolderContents(course.id)

        for (const [moduleIndex, module] of modules.entries()) {
          if (module.mimeType === "application/vnd.google-apps.folder") {
            const moduleData = {
              id: module.id,
              title: module.name,
              sort: moduleIndex + 1,
              "lessons-submodules": [],
            }

            // Buscar aulas dentro do módulo
            const lessons = await listFolderContents(module.id)

            moduleData["lessons-submodules"].push({
              id: module.id, // Usar o ID do módulo para o submódulo
              sort: 1,
              title: "Aulas",
              lessons: lessons
                .filter(
                  (lesson) =>
                    lesson.mimeType !== "application/vnd.google-apps.folder"
                )
                .map((lesson) => ({
                  id: lesson.id,
                  title: lesson.name,
                  type: isVideoFile(lesson.mimeType)
                    ? "video"
                    : isDocFile(lesson.mimeType)
                    ? "docs"
                    : "other",
                  videoUrl: lesson.id,
                  completed: false,
                })),
            })

            levelData.modules.push(moduleData)
          }
        }

        courseData.levels.push(levelData)
      }

      courses.push(courseData)
    }
  }

  return courses
}

// Função auxiliar para extrair tags do nome do curso
function extractTags(courseName: string): string[] {
  // Exemplo simples: dividir o nome por espaços e usar como tags
  return courseName
    .toLowerCase()
    .split(" ")
    .filter((tag) => tag.length > 2)
}

// Função para salvar a estrutura de cursos em um arquivo JSON
export async function saveCourseStructure() {
  try {
    const courses = await extractCourseStructure()
    const dataDir = path.join(process.cwd(), "data")

    // Criar diretório se não existir
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    await fs.writeFile(
      path.join(dataDir, "courses.json"),
      JSON.stringify(courses, null, 2)
    )

    console.log("Estrutura de cursos salva com sucesso!")
    return courses
  } catch (error) {
    console.error("Erro ao salvar estrutura de cursos:", error)
    throw error
  }
}

// Função para carregar a estrutura de cursos do arquivo JSON
export async function loadCourseStructure() {
  try {
    const filePath = path.join(process.cwd(), "data", "courses.json")
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    console.error("Erro ao carregar estrutura de cursos:", error)
    // Se o arquivo não existir, criar a estrutura
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return await saveCourseStructure()
    }
    throw error
  }
}
