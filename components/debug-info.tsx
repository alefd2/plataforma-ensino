"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface DebugInfoProps {
  data: any
  title?: string
}

export function DebugInfo({ data, title = "Informações de Debug" }: DebugInfoProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <div className="mt-8">
      <Button variant="outline" size="sm" onClick={() => setIsVisible(!isVisible)}>
        {isVisible ? "Ocultar" : "Mostrar"} Informações de Debug
      </Button>

      {isVisible && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">{title}</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-auto max-h-[500px] text-xs">
              {JSON.stringify(data, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
