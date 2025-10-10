import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  // Verifica la cookie real de StackFrame para sesión
  const stackAccess = req.cookies.get('stack-access')?.value;

  // Usuario autenticado quiere ir a login o sign-in: redirige a /cliente
  if (
    (url.pathname === '/login' || url.pathname === '/handler/sign-in') &&
    stackAccess
  ) {
    url.pathname = '/cliente';
    return NextResponse.redirect(url);
  }

  // Usuario no autenticado quiere ir a rutas privadas: redirige a /handler/login
  if (
    url.pathname.startsWith('/cliente') &&
    !stackAccess
  ) {
    url.pathname = '/handler/login';
    return NextResponse.redirect(url);
  }

  // Si todo está bien, responde normal
  return NextResponse.next();
}

// Solo protege las rutas importantes
export const config = {
  matcher: [
    '/login',
    '/handler/sign-in',
    '/cliente/:path*',
  ],
};