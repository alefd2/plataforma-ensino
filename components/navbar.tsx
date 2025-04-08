"use client"

import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, User, Menu } from "lucide-react"
import { useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export function Navbar() {
  const { user, logout } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto max-w-6xl flex h-16 items-center justify-between px-4">
        <Link href="/" className="font-bold text-xl">
          Plataforma de Ensino
        </Link>

        {/* Versão mobile */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              {user && (
                <div className="flex flex-col gap-4 py-4">
                  <div className="flex items-center gap-2 py-2">
                    <User className="h-4 w-4" />
                    <span>{user.name}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      logout()
                      setIsOpen(false)
                    }}
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </div>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Versão desktop */}
        {user && (
          <div className="hidden md:flex items-center gap-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>{user.name}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-4 w-4" />
              <span className="sr-only">Sair</span>
            </Button>
          </div>
        )}
      </div>
    </header>
  )
}
