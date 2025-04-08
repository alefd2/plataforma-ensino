"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface CourseNavigationProps {
  courses: any[]
}

export function CourseNavigation({ courses }: CourseNavigationProps) {
  const router = useRouter()

  const handleCourseClick = (courseId: string) => {
    router.push(`/course/${courseId}`)
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Navegação Rápida</CardTitle>
        <CardDescription>Clique em um curso para acessá-lo diretamente</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {courses.map((course) => (
            <Button key={course.id} variant="outline" onClick={() => handleCourseClick(course.id)}>
              {course.title}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
