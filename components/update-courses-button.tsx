"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useRouter } from "next/navigation"

export function UpdateCoursesButton() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/force-update")

      if (response.ok) {
        // Recarregar a página para mostrar os dados atualizados
        router.refresh()
        alert("Estrutura de cursos atualizada com sucesso!")
      } else {
        const data = await response.json()
        alert(`Erro ao atualizar: ${data.error || "Erro desconhecido"}`)
      }
    } catch (error) {
      console.error("Erro ao atualizar cursos:", error)
      alert("Erro ao atualizar cursos. Verifique o console para mais detalhes.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleUpdate} disabled={loading}>
      {loading ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Atualizando...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar Cursos
        </>
      )}
    </Button>
  )
}
