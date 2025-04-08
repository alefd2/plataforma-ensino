import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const userCookie = request.cookies.get("user")
  const isAuthenticated = !!userCookie?.value
  const isLoginPage = request.nextUrl.pathname === "/login"

  // Se não estiver autenticado e não estiver na página de login, redirecionar para login
  if (!isAuthenticated && !isLoginPage) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se estiver autenticado e estiver na página de login, redirecionar para home
  if (isAuthenticated && isLoginPage) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
