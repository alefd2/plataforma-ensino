import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { BookOpen, GraduationCap } from "lucide-react"

interface CourseCardProps {
  course: {
    id: string
    title: string
    description: string
    type: string
    tags: string[]
    levels: any[]
  }
}

export function CourseCard({ course }: CourseCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl">{course.title}</CardTitle>
          <Badge variant={course.type === "training" ? "default" : "secondary"}>
            {course.type === "training" ? "Formação" : "Curso"}
          </Badge>
        </div>
        <CardDescription>{course.description}</CardDescription>
      </CardHeader>

      <CardContent className="flex-grow">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {course.type === "training" ? <GraduationCap className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
          <span>
            {course.levels.length} {course.type === "training" ? "níveis" : "módulos"}
          </span>
        </div>

        <div className="flex flex-wrap gap-2 mt-4">
          {course.tags.map((tag: string) => (
            <Badge key={tag} variant="outline">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter>
        <Link href={`/course/${course.id}`} className="w-full">
          <Button className="w-full">Ver Curso</Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
