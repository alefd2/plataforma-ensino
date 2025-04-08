import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, GraduationCap, ArrowRight } from "lucide-react"

interface CourseCardAltProps {
  course: {
    id: string
    title: string
    description: string
    type: string
    tags: string[]
    levels: any[]
  }
}

export function CourseCardAlt({ course }: CourseCardAltProps) {
  return (
    <Link href={`/course/${course.id}`} className="block h-full no-underline">
      <Card className="overflow-hidden h-full flex flex-col transition-all duration-200 hover:shadow-md hover:border-primary/50">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="text-lg md:text-xl">{course.title}</CardTitle>
            <Badge variant={course.type === "training" ? "default" : "secondary"} className="flex-shrink-0">
              {course.type === "training" ? "Formação" : "Curso"}
            </Badge>
          </div>
          <CardDescription className="line-clamp-2">{course.description}</CardDescription>
        </CardHeader>

        <CardContent className="flex-grow">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {course.type === "training" ? (
              <GraduationCap className="h-4 w-4 flex-shrink-0" />
            ) : (
              <BookOpen className="h-4 w-4 flex-shrink-0" />
            )}
            <span>
              {course.levels.length} {course.type === "training" ? "níveis" : "módulos"}
            </span>
          </div>

          <div className="flex flex-wrap gap-2 mt-4">
            {course.tags.slice(0, 3).map((tag: string) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {course.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{course.tags.length - 3}
              </Badge>
            )}
          </div>

          <div className="mt-4 flex justify-end">
            <span className="text-sm font-medium text-primary flex items-center">
              Ver detalhes <ArrowRight className="ml-1 h-4 w-4" />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
