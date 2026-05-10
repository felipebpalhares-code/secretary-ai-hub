import { NextRequest, NextResponse } from "next/server"

/**
 * Sprint H — protege rotas de UI redirecionando não autenticados pra /login.
 *
 * Validação aqui é apenas presença do cookie httpOnly `access_token`.
 * Validação real (assinatura JWT, expiração, user ativo) acontece no backend
 * a cada request — middleware é só pra UX, não pra segurança.
 */
const PUBLIC_PATHS = ["/login"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const hasToken = Boolean(req.cookies.get("access_token")?.value)

  const isPublic = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  )

  if (!hasToken && !isPublic) {
    const url = req.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  if (hasToken && pathname === "/login") {
    const url = req.nextUrl.clone()
    url.pathname = "/"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  // Roda em todas as rotas exceto assets estáticos e _next/.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
}
