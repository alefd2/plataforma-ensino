import { saveCourseStructure } from "../lib/google-drive"

async function updateCourses() {
  try {
    console.log("Iniciando atualização da estrutura de cursos...")
    await saveCourseStructure()
    console.log("Estrutura de cursos atualizada com sucesso!")
  } catch (error) {
    console.error("Erro ao atualizar estrutura de cursos:", error)
  }
}

// Executar a atualização a cada 1 hora
const INTERVAL = 60 * 60 * 1000 // 1 hora em milissegundos

console.log("Iniciando script de atualização de cursos...")
updateCourses() // Executar imediatamente na primeira vez
setInterval(updateCourses, INTERVAL)
