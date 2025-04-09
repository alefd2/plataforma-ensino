export interface Lesson {
  id: string
  title: string
  type: "video" | "docs" | "other" | "image"
  videoUrl: string
  completed: boolean
  description?: string
}

export interface SubModule {
  id: string
  sort: number
  title: string
  lessons: Lesson[]
  description?: string
}

export interface Module {
  id: string
  title: string
  sort: number
  description?: string
  metadata?: {
    description?: string
    challengeUrl?: string
  }
  "lessons-submodules": SubModule[]
}

export interface Level {
  id: string
  title: string
  level: number
  modules: Module[]
}

export interface Course {
  id: string
  title: string
  tags: string[]
  description: string
  levels: Level[]
  type: "course" | "training"
}
