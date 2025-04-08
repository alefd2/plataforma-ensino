import { loadCourseStructure } from "@/lib/google-drive"
import { Navbar } from "@/components/navbar"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, FileText, Video, ImageIcon, File } from "lucide-react"
import { DebugInfo } from "@/components/debug-info"

export default async function CoursePage({ params }: { params: { courseId: string } }) {
  try {
    const courses = await loadCourseStructure()
    const course = courses.find((c: any) => c.id === params.courseId)

    if (!course) {
      notFound()
    }

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 container py-8 px-4 mx-auto max-w-5xl">
          <Link href="/" className="inline-flex items-center mb-6 text-sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para cursos
          </Link>

          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
              <p className="text-muted-foreground mt-2">{course.description}</p>

              <div className="flex flex-wrap gap-2 mt-4">
                {course.tags.map((tag: string) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Badge
              variant={course.type === "training" ? "default" : "secondary"}
              className="text-sm self-start md:self-auto"
            >
              {course.type === "training" ? "Formação" : "Curso"}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Conteúdo do Curso</CardTitle>
              <CardDescription>
                {course.type === "training"
                  ? "Esta formação está organizada em níveis e módulos para facilitar seu aprendizado."
                  : "Este curso está organizado em módulos para facilitar seu aprendizado."}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Accordion type="multiple" className="w-full" defaultValue={course.levels.map((level: any) => level.id)}>
                {course.levels.map((level: any) => (
                  <AccordionItem key={level.id} value={level.id}>
                    <AccordionTrigger className="text-lg font-medium">{level.title}</AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-0 md:pl-4 space-y-4">
                        {level.modules.map((module: any) => (
                          <div key={module.id} className="border rounded-lg p-4">
                            <h3 className="text-md font-medium mb-2">{module.title}</h3>

                            <div className="pl-0 md:pl-4 space-y-2">
                              {module["lessons-submodules"] &&
                                module["lessons-submodules"].map((submodule: any) => (
                                  <div key={submodule.id} className="space-y-2">
                                    <h4 className="text-sm font-medium">{submodule.title}</h4>

                                    <ul className="space-y-2">
                                      {submodule.lessons &&
                                        submodule.lessons.map((lesson: any) => (
                                          <li
                                            key={lesson.id}
                                            className="flex items-center justify-between flex-wrap gap-2"
                                          >
                                            <div className="flex items-center">
                                              {lesson.type === "video" ? (
                                                <Video className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                                              ) : lesson.type === "docs" ? (
                                                <FileText className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                                              ) : lesson.type === "image" ? (
                                                <ImageIcon className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                                              ) : (
                                                <File className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                              )}
                                              <span className="text-sm">{lesson.title}</span>
                                            </div>

                                            <Link href={`/course/${course.id}/lesson/${lesson.id}`}>
                                              <Button variant="ghost" size="sm">
                                                Assistir
                                              </Button>
                                            </Link>
                                          </li>
                                        ))}
                                    </ul>
                                  </div>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Adicionar o componente DebugInfo para mostrar o JSON do curso */}
          <DebugInfo data={course} title="Detalhes do Curso" />
        </main>
      </div>
    )
  } catch (error) {
    console.error("Erro ao carregar página do curso:", error)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar o curso</h1>
        <p className="text-muted-foreground mb-6">Ocorreu um erro ao carregar os detalhes do curso.</p>
        <Link href="/">
          <Button>Voltar para a página inicial</Button>
        </Link>
      </div>
    )
  }
}
