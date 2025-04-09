"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
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
  Eye,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { ContentViewer } from "@/components/content-viewer";
import { Skeleton } from "@/components/ui/skeleton";
import { Lesson, Module, SubModule } from "@/types/course";

export default function LessonPage() {
  const { courseId, levelsId, moduleId } = useParams() as {
    courseId: string;
    levelsId: string;
    moduleId: string;
  };
  const [modules, setModules] = useState<Module | null>(null);
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [watchedLessons, setWatchedLessons] = useState<string[]>([]);
  const [showSidebar, setShowSidebar] = useState(true); // State to toggle sidebar visibility
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    async function fetchCourseData() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/courses/${courseId}/levels/${levelsId}/${moduleId}`,
          { cache: "no-store" }
        );

        if (!response.ok) throw new Error("Falha ao carregar cursos");

        const modules = await response.json();

        if (modules) {
          setModules(modules);
        } else {
          setError("Curso não encontrado");
        }
      } catch (error) {
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
  }, [courseId, user]);

  const handleLessonComplete = async (
    lessonId: string,
    isCompleted: boolean
  ) => {
    if (!user) return;

    try {
      const response = await fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courseId,
          lessonId,
          watched: isCompleted,
        }),
      });

      if (response.ok) {
        setWatchedLessons((prev) =>
          isCompleted
            ? [...prev, lessonId]
            : prev.filter((id) => id !== lessonId)
        );
      }
    } catch (error) {
      console.error("Erro ao atualizar progresso:", error);
    }
  };

  const isLessonWatched = (lessonId: string) =>
    watchedLessons.includes(lessonId);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Erro</h1>
            <p className="text-muted-foreground mb-6">{error}</p>
            <Button onClick={() => router.push(`/course/${courseId}`)}>
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
        <div className="flex justify-between items-center mb-4">
          <Button
            variant="ghost"
            onClick={() => router.push(`/course/${courseId}`)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para o curso
          </Button>

          <Button
            variant="ghost"
            onClick={() => setShowSidebar((prev) => !prev)}
          >
            {showSidebar ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Esconder Barra
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Mostrar Barra
              </>
            )}
          </Button>
        </div>

        <div
          className={`grid grid-cols-1 ${
            showSidebar ? "lg:grid-cols-3" : "lg:grid-cols-1"
          } gap-8`}
        >
          <div className={`${showSidebar ? "lg:col-span-2" : "col-span-1"}`}>
            {currentLesson && (
              <ContentViewer
                fileId={currentLesson.id}
                onComplete={() => handleLessonComplete(currentLesson.id, true)}
              />
            )}

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

          {showSidebar && (
            <div className="lg:col-span-1">
              <div className="border rounded-lg">
                <div className="p-4 border-b">
                  <h2 className="font-medium">Conteúdo do Curso</h2>
                </div>

                {loading ? (
                  <div className="p-4 space-y-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-24 w-full" />
                  </div>
                ) : modules ? (
                  <div>
                    {modules["lessons-submodules"].map(
                      (submodule: SubModule) => (
                        <Accordion type="multiple" className="w-full">
                          <div key={module.id} className="mb-4">
                            <div key={module.id} className="mb-4">
                              <div key={submodule.id} className="mb-4">
                                <AccordionItem
                                  key={submodule.id}
                                  value={submodule.id}
                                >
                                  <AccordionTrigger className="px-4">
                                    <div className="flex items-start w-full gap-2">
                                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                                        <span className="text-sm font-medium">
                                          {submodule.title.match(/^\d+/)?.[0] ||
                                            ""}
                                        </span>
                                      </div>
                                      <div className="flex flex-col text-start">
                                        <span className="font-medium">
                                          {submodule.title.replace(
                                            /^\d+\.\s*/,
                                            ""
                                          )}
                                        </span>
                                        <span className="text-xs text-muted-foreground">
                                          {submodule.lessons?.length || 0} aulas
                                        </span>
                                      </div>
                                    </div>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ul className="space-y-2">
                                      {(submodule.lessons ?? []).map(
                                        (lesson) => (
                                          <li
                                            key={lesson.id}
                                            className={`flex px-8 items-center justify-between rounded-md ${
                                              lesson.id === currentLesson?.id
                                                ? "bg-muted"
                                                : ""
                                            }`}
                                          >
                                            <div className="flex items-center min-w-0">
                                              {isLessonWatched(lesson.id) ? (
                                                <Check className="h-4 w-4 mr-2 text-green-500" />
                                              ) : (
                                                <Circle className="h-4 w-4 mr-2" />
                                              )}
                                              {lesson.type === "video" ? (
                                                <Video className="h-4 w-4 mr-2 text-blue-500" />
                                              ) : lesson.type === "docs" ? (
                                                <FileText className="h-4 w-4 mr-2 text-orange-500" />
                                              ) : lesson.type === "image" ? (
                                                <ImageIcon className="h-4 w-4 mr-2 text-purple-500" />
                                              ) : (
                                                <File className="h-4 w-4 mr-2" />
                                              )}
                                              <span className="text-sm truncate">
                                                {lesson.title}
                                              </span>
                                            </div>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() =>
                                                setCurrentLesson(lesson)
                                              }
                                            >
                                              {lesson.id === currentLesson?.id
                                                ? "Atual"
                                                : "Ver"}
                                            </Button>
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            </div>
                          </div>
                        </Accordion>
                      )
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
