"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  ArrowLeft,
  Check,
  CheckCircle,
  Circle,
  FileText,
  Video,
  ImageIcon,
  File,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ContentViewer } from "@/components/content-viewer";
import { Skeleton } from "@/components/ui/skeleton";

interface Course {
  id: string;
  title: string;
  levels: Level[];
}

interface Level {
  id: string;
  title: string;
  modules: Module[];
}

interface Module {
  id: string;
  title: string;
  "lessons-submodules": Submodule[];
}

interface Submodule {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface Lesson {
  id: string;
  title: string;
  type: string;
}

export default function LessonPage({
  params,
}: {
  params: { courseId: string; lessonId: string };
}) {
  const [course, setCourse] = useState<Course | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchedLessons, setWatchedLessons] = useState<string[]>([]);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("/api/courses");

        if (!response.ok) {
          throw new Error("Falha ao carregar cursos");
        }

        const courses = await response.json();
        const foundCourse = courses.find(
          (c: Course) => c.id === params.courseId
        );

        if (foundCourse) {
          setCourse(foundCourse);

          // Encontrar a aula atual
          let foundLesson: Lesson | null = null;

          for (const level of foundCourse.levels) {
            for (const module of level.modules) {
              for (const submodule of module["lessons-submodules"] || []) {
                const lesson = (submodule.lessons || []).find(
                  (l: { id: string }) => l.id === params.lessonId
                );
                if (lesson) {
                  foundLesson = lesson;
                  break;
                }
              }
            }
          }

          if (foundLesson) {
            setCurrentLesson(foundLesson);
          } else {
            setError("Aula não encontrada");
          }
        } else {
          setError("Curso não encontrado");
        }
      } catch (error) {
        console.error("Erro ao carregar dados do curso:", error);
        setError("Erro ao carregar dados do curso");
      } finally {
        setLoading(false);
      }
    }

    async function fetchWatchedLessons() {
      if (user) {
        try {
          const response = await fetch(`/api/progress?userId=${user.id}`);
          if (response.ok) {
            const data = await response.json();
            setWatchedLessons(
              data.watchedLessons.map((item: any) => item.lessonId)
            );
          }
        } catch (error) {
          console.error("Erro ao carregar aulas assistidas:", error);
        }
      }
    }

    fetchCourseData();
    fetchWatchedLessons();
  }, [params.courseId, params.lessonId, user]);

  const handleLessonComplete = async (
    lessonId: string,
    isCompleted: boolean
  ) => {
    if (!user) return;

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          courseId: params.courseId,
          lessonId,
          watched: isCompleted,
        }),
      });

      if (response.ok) {
        if (isCompleted) {
          setWatchedLessons((prev) => [...prev, lessonId]);
        } else {
          setWatchedLessons((prev) => prev.filter((id) => id !== lessonId));
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
    }
  };

  const isLessonWatched = (lessonId: string) => {
    return watchedLessons.includes(lessonId);
  };

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push(`/course/${params.courseId}`)}>
              Voltar para o curso
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 container py-8 px-4 mx-auto max-w-6xl">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => router.push(`/course/${params.courseId}`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para o curso
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ContentViewer
              fileId={params.lessonId}
              onComplete={() => {
                if (currentLesson) {
                  handleLessonComplete(currentLesson.id, true);
                }
              }}
            />

            {loading ? (
              <div className="mt-4 space-y-2">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : currentLesson ? (
              <div className="mt-4">
                <h1 className="text-xl md:text-2xl font-bold">
                  {currentLesson.title}
                </h1>
                <div className="flex items-center mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2"
                    onClick={() =>
                      handleLessonComplete(
                        currentLesson.id,
                        !isLessonWatched(currentLesson.id)
                      )
                    }
                  >
                    {isLessonWatched(currentLesson.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Marcar como não assistida
                      </>
                    ) : (
                      <>
                        <Circle className="h-4 w-4" />
                        Marcar como assistida
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-1">
            <div className="border rounded-lg">
              <div className="p-4 border-b">
                <h2 className="font-medium">Conteúdo do Curso</h2>
              </div>

              {loading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-8 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : course ? (
                <Accordion type="multiple" className="w-full">
                  {course.levels.flatMap((level) =>
                    level.modules.map((module) => (
                      <AccordionItem key={module.id} value={module.id}>
                        <AccordionTrigger className="px-4">
                          {module.title}
                        </AccordionTrigger>
                        <AccordionContent>
                          {(module["lessons-submodules"] || []).map(
                            (submodule) => (
                              <div
                                key={submodule.id}
                                className="pl-4 pr-2 py-2"
                              >
                                <h4 className="text-sm font-medium mb-2">
                                  {submodule.title}
                                </h4>

                                <ul className="space-y-2">
                                  {(submodule.lessons || []).map((lesson) => (
                                    <li
                                      key={lesson.id}
                                      className={`flex items-center justify-between p-2 rounded-md ${
                                        lesson.id === params.lessonId
                                          ? "bg-muted"
                                          : ""
                                      }`}
                                    >
                                      <div className="flex items-center min-w-0">
                                        {isLessonWatched(lesson.id) ? (
                                          <Check className="h-4 w-4 mr-2 text-green-500 flex-shrink-0" />
                                        ) : (
                                          <Circle className="h-4 w-4 mr-2 flex-shrink-0" />
                                        )}
                                        {lesson.type === "video" ? (
                                          <Video className="h-4 w-4 mr-2 text-blue-500 flex-shrink-0" />
                                        ) : lesson.type === "docs" ? (
                                          <FileText className="h-4 w-4 mr-2 text-orange-500 flex-shrink-0" />
                                        ) : lesson.type === "image" ? (
                                          <ImageIcon className="h-4 w-4 mr-2 text-purple-500 flex-shrink-0" />
                                        ) : (
                                          <File className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
                                        )}
                                        <span className="text-sm truncate">
                                          {lesson.title}
                                        </span>
                                      </div>

                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="flex-shrink-0"
                                        onClick={() =>
                                          router.push(
                                            `/course/${params.courseId}/lesson/${lesson.id}`
                                          )
                                        }
                                      >
                                        {lesson.id === params.lessonId
                                          ? "Atual"
                                          : "Ver"}
                                      </Button>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))
                  )}
                </Accordion>
              ) : null}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
