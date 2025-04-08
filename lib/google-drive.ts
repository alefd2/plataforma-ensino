import { google } from "googleapis"
import path from "path"
import fs from "fs/promises"
import { Course, Level, Module, SubModule, Lesson } from "../types/course"

const auth = new google.auth.GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  },
  scopes: ["https://www.googleapis.com/auth/drive"],
})

const drive = google.drive({ version: "v3", auth })

async function getMetadata(folderId: string) {
  try {
    const files = await listFolderContents(folderId)
    const metadataFile = files.find((f) => f.name === "metadata.md")

    if (!metadataFile || !metadataFile.id) return null

    const file = await drive.files.get({
      fileId: metadataFile.id,
      alt: "media",
    })

    const content = file.data as string

    return {
      description: content.match(/@descrição\s*([\s\S]*?)(?=@|$)/)?.[1]?.trim(),
      challengeUrl: content.match(/@link desafio:\s*(.*?)(?=@|$)/)?.[1]?.trim(),
    }
  } catch (error) {
    console.error("Error reading metadata:", error)
    return null
  }
}

async function listFolderContents(folderId: string) {
  try {
    const response = await drive.files.list({
      q: `'${folderId}' in parents and trashed = false`,
      fields: "files(id, name, mimeType)",
      orderBy: "name",
    })
    return response.data.files || []
  } catch (error) {
    console.error("Error listing folder contents:", error)
    throw error
  }
}

async function processLessons(files: any[]): Promise<Lesson[]> {
  return files
    .filter((file) => file.mimeType !== "application/vnd.google-apps.folder")
    .map((file) => ({
      id: file.id,
      title: file.name,
      type: determineContentType(file.mimeType),
      videoUrl: file.id,
      completed: false,
    }))
}

async function processModule(module: any, index: number): Promise<Module> {
  const metadata = await getMetadata(module.id)
  const subItems = await listFolderContents(module.id)

  console.log(
    "---------------------------------------------------------------------------",
    metadata
  )

  const subModules: SubModule[] = []

  for (const subItem of subItems) {
    if (
      subItem.mimeType === "application/vnd.google-apps.folder" &&
      subItem.id
    ) {
      const lessons = await listFolderContents(subItem.id)
      subModules.push({
        id: subItem.id,
        sort: subModules.length + 1,
        title: subItem.name ?? "",
        lessons: await processLessons(lessons),
      })
    }
  }

  // If no submodules found, create default one
  if (subModules.length === 0) {
    subModules.push({
      id: module.id,
      sort: 1,
      title: "Aulas",
      lessons: await processLessons(subItems),
    })
  }

  return {
    id: module.id,
    title: module.name,
    sort: index + 1,
    metadata: metadata || undefined,
    "lessons-submodules": subModules,
  }
}

export async function extractCourseStructure(
  rootFolderId = process.env.GOOGLE_FOLDER_ID
): Promise<Course[]> {
  if (!rootFolderId) throw new Error("Root folder ID not provided")

  const coursesFolder = await listFolderContents(rootFolderId)
  const courses: Course[] = []

  for (const course of coursesFolder) {
    if (course.mimeType === "application/vnd.google-apps.folder") {
      const levels = await listFolderContents(course.id!)
      const courseData: Course = {
        id: course.id ?? "",
        title: course.name ?? "",
        tags: extractTags(course.name ?? ""),
        description: `Description for ${course.name}`,
        levels: [],
        type: course.name?.toLowerCase().includes("formação")
          ? "training"
          : "course",
      }

      for (const [levelIndex, level] of levels.entries()) {
        if (level.mimeType === "application/vnd.google-apps.folder") {
          const modules = await listFolderContents(level.id!)
          const levelData: Level = {
            id: level.id ?? "",
            title: level.name ?? "Course Content",
            level: levelIndex + 1,
            modules: [],
          }

          for (const [moduleIndex, module] of modules.entries()) {
            if (module.mimeType === "application/vnd.google-apps.folder") {
              levelData.modules.push(await processModule(module, moduleIndex))
            }
          }

          courseData.levels.push(levelData)
        }
      }

      courses.push(courseData)
    }
  }

  return courses
}

function determineContentType(mimeType: string): "video" | "docs" | "other" {
  if (
    mimeType.startsWith("video/") ||
    mimeType === "application/vnd.google-apps.video"
  )
    return "video"
  if (isDocFile(mimeType)) return "docs"
  return "other"
}

function isDocFile(mimeType: string): boolean {
  return (
    mimeType === "application/vnd.google-apps.document" ||
    mimeType === "application/pdf" ||
    mimeType.includes("document") ||
    mimeType.includes("text")
  )
}

function extractTags(courseName: string): string[] {
  const tags = courseName.toLowerCase().match(/\[(.*?)\]/g) || []
  return tags.map((tag) => tag.replace(/[\[\]]/g, "").trim())
}

export async function saveCourseStructure() {
  try {
    const courses = await extractCourseStructure()
    const dataDir = path.join(process.cwd(), "data")

    await fs.mkdir(dataDir, { recursive: true })
    await fs.writeFile(
      path.join(dataDir, "courses.json"),
      JSON.stringify(courses, null, 2)
    )

    return courses
  } catch (error) {
    console.error("Error saving course structure:", error)
    throw error
  }
}

export async function loadCourseStructure(): Promise<Course[]> {
  try {
    const filePath = path.join(process.cwd(), "data", "courses.json")
    const data = await fs.readFile(filePath, "utf8")
    return JSON.parse(data)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return await saveCourseStructure()
    }
    throw error
  }
}

interface FileViewData {
  url: string
  type: "iframe" | "image" | "video" | "other"
  mimeType: string
}

// Add cache map
const urlCache = new Map<string, { data: FileViewData; timestamp: number }>()
const CACHE_DURATION = 1000 * 60 * 30 // 30 minutes

export async function getFileViewUrl(fileId: string): Promise<FileViewData> {
  try {
    // Check cache
    const cached = urlCache.get(fileId)
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data
    }

    // Validate file existence
    const file = await drive.files.get({
      fileId,
      fields: "id,name,mimeType,webContentLink,webViewLink",
    })

    const mimeType = file.data.mimeType || ""
    let viewData: FileViewData

    // Google Docs handling
    if (mimeType.includes("application/vnd.google-apps.document")) {
      viewData = {
        url: `https://docs.google.com/document/d/${fileId}/edit?usp=sharing&embedded=true`,
        type: "iframe",
        mimeType,
      }
    }
    // Spreadsheets
    else if (mimeType.includes("application/vnd.google-apps.spreadsheet")) {
      viewData = {
        url: `https://docs.google.com/spreadsheets/d/${fileId}/edit?usp=sharing&embedded=true`,
        type: "iframe",
        mimeType,
      }
    }
    // Presentations
    else if (mimeType.includes("application/vnd.google-apps.presentation")) {
      viewData = {
        url: `https://docs.google.com/presentation/d/${fileId}/edit?usp=sharing&embedded=true`,
        type: "iframe",
        mimeType,
      }
    }
    // PDFs
    else if (mimeType === "application/pdf") {
      viewData = {
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        type: "iframe",
        mimeType,
      }
    }
    // Images
    else if (mimeType.startsWith("image/")) {
      const accessToken = await auth.getAccessToken()
      viewData = {
        url: `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media&access_token=${accessToken}`,
        type: "image",
        mimeType,
      }
    }
    // Videos
    else if (
      mimeType.startsWith("video/") ||
      mimeType === "application/vnd.google-apps.video"
    ) {
      viewData = {
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        type: "video",
        mimeType,
      }
    }
    // Other files
    else {
      viewData = {
        url: `https://drive.google.com/file/d/${fileId}/preview`,
        type: "other",
        mimeType,
      }
    }

    // Update cache
    urlCache.set(fileId, { data: viewData, timestamp: Date.now() })
    return viewData
  } catch (error) {
    console.error("Error getting file view URL:", error)
    throw new Error(`Failed to get view URL for file ${fileId}`)
  }
}
