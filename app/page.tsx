import { loadCourseStructure } from "@/lib/google-drive";
import { Navbar } from "@/components/navbar";
import { CourseCardAlt } from "@/components/course-card-alt";
import { UpdateCoursesButton } from "@/components/update-courses-button";
import { DebugInfo } from "@/components/debug-info";

export default async function HomePage() {
  try {
    const courses = await loadCourseStructure();

    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />

        <main className="flex-1 container py-8 px-4 mx-auto max-w-5xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold">
              Cursos Disponíveis
            </h1>
            <UpdateCoursesButton />
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">
                Nenhum curso disponível no momento.
              </p>
              <p className="text-sm">
                Clique em "Atualizar Cursos" para buscar cursos do Google Drive.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course: any) => (
                <CourseCardAlt key={course.id} course={course} />
              ))}
            </div>
          )}

          {/* Adicionar o componente DebugInfo para mostrar o JSON atualizado */}
          <DebugInfo data={courses} title="Cursos Carregados" />
        </main>
      </div>
    );
  } catch (error) {
    console.error("Erro ao carregar página inicial:", error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Erro ao carregar cursos</h1>
        <p className="text-muted-foreground mb-6">
          Ocorreu um erro ao carregar a lista de cursos.
        </p>
        <UpdateCoursesButton />
      </div>
    );
  }
}
