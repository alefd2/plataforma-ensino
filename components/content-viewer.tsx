"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ContentViewerProps {
  fileId: string
  onComplete?: () => void
}

interface FileData {
  url: string
  type: string
  mimeType: string
}

export function ContentViewer({ fileId, onComplete }: ContentViewerProps) {
  const [fileData, setFileData] = useState<FileData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchFileData() {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/file/${fileId}`)

        if (!response.ok) {
          throw new Error(`Erro ao carregar arquivo: ${response.statusText}`)
        }

        const data = await response.json()
        setFileData(data)
      } catch (error) {
        console.error("Erro ao carregar dados do arquivo:", error)
        setError("Não foi possível carregar o arquivo. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    if (fileId) {
      fetchFileData()
    }
  }, [fileId])

  // Função para marcar como concluído após um tempo
  useEffect(() => {
    if (fileData && onComplete) {
      // Definir um temporizador para marcar como concluído após 10 segundos
      const timer = setTimeout(() => {
        onComplete()
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [fileData, onComplete])

  if (loading) {
    return (
      <div className="flex items-center justify-center aspect-video bg-black/5 rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center aspect-video bg-black/5 rounded-lg">
        <div className="text-center p-4">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (!fileData) {
    return (
      <div className="flex items-center justify-center aspect-video bg-black/5 rounded-lg">
        <div className="text-center p-4">
          <p>Arquivo não encontrado</p>
        </div>
      </div>
    )
  }

  // Renderizar com base no tipo de arquivo
  switch (fileData.type) {
    case "video":
      return (
        <div className="aspect-video bg-black rounded-lg overflow-hidden">
          <iframe
            src={fileData.url}
            width="100%"
            height="100%"
            allow="autoplay"
            allowFullScreen
            className="border-0"
            title="Video Player"
          ></iframe>
        </div>
      )

    case "iframe":
    case "pdf":
      return (
        <div className="aspect-video bg-white rounded-lg overflow-hidden">
          <iframe src={fileData.url} width="100%" height="100%" className="border-0" title="Document Viewer" />
        </div>
      )

    case "image":
      return (
        <div className="flex justify-center bg-white rounded-lg overflow-hidden p-4">
          <img
            src={fileData.url || "/placeholder.svg"}
            alt="Imagem do conteúdo"
            className="max-h-[70vh] object-contain"
            onLoad={onComplete}
          />
        </div>
      )

    default:
      return (
        <div className="flex items-center justify-center aspect-video bg-black/5 rounded-lg">
          <div className="text-center p-4">
            <p>Este tipo de arquivo não pode ser visualizado diretamente.</p>
            <a
              href={`https://drive.google.com/file/d/${fileId}/view`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline mt-2 inline-block"
            >
              Abrir no Google Drive
            </a>
          </div>
        </div>
      )
  }
}
