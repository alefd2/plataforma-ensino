import { Navbar } from "@/components/navbar";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  FileText,
  Video,
  ImageIcon,
  File,
  LucideBugPlay,
  LucideCirclePlay,
} from "lucide-react";
import { DebugInfo } from "@/components/debug-info";
import { Course, Module, SubModule } from "@/types/course";

export default async function CoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/${params.courseId}`
    );

    if (!res.ok) {
      notFound();
    }

    const course: Course = await res.json();

    //console.log("Course data:", course.levels);

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
              {course.levels.map((level: any) => (
                <Accordion
                  type="multiple"
                  className="w-full"
                  defaultValue={course.levels.map((level: any) => level.id)}
                >
                  <AccordionItem key={level.id} value={level.id}>
                    <AccordionTrigger className="text-lg font-medium">
                      <div className="flex items-start gap-2 flex-col">
                        <span className="font-light text-muted-foreground text-sm truncate">
                          {level.title.split("-")[0]}
                        </span>
                        {level.title.includes("-") && (
                          <span className="truncate">
                            {level.title.split("-")[1]}
                          </span>
                        )}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="pl-0 space-y-4">
                        {level.modules.map((module: Module) => (
                          <div
                            key={module.id}
                            className="border rounded-lg p-4"
                          >
                            <div className="pl-0 md:pl-4 space-y-2">
                              <Link
                                href={`/course/${course.id}/level/${level.id}/${module.id}`}
                              >
                                <div className="flex items-center space-x-4">
                                  <div className="rounded-full bg-primary/10 p-2">
                                    <LucideCirclePlay className="h-5 w-5 text-primary" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="text-sm text-muted-foreground">
                                      Módulo
                                    </p>
                                    <h3 className="font-medium">
                                      {module.title}
                                    </h3>
                                  </div>
                                </div>
                              </Link>
                            </div>
                          </div>
                        )) ?? "Sem dados"}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ))}
            </CardContent>
          </Card>

          <DebugInfo data={course} title="Detalhes do Curso" />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar página do curso:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar o curso</h1>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro ao carregar os detalhes do curso.
        </p>
        <Link href="/">
          <Button>Voltar para a página inicial</Button>
        </Link>
      </div>
    );
  }
}
