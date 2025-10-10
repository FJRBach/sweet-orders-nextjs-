// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from 'jose'; // Alternativa moderna y segura a jsonwebtoken en el Edge

// Define qué rutas son públicas y no necesitan autenticación
const publicRoutes = [
  '/',
  '/handler/sign-in',
  '/handler/sign-up',
  '/api/auth/callback',
  // Añade aquí otras rutas públicas si las tienes (ej. /acerca-de)
];

// Función para verificar el token usando 'jose' que es compatible con el Edge Runtime
async function verifyToken(token: string) {
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // 1. Permitir acceso a rutas públicas
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // 2. Si no hay token y la ruta es protegida, redirigir a login
  if (!token) {
    const signInUrl = new URL('/handler/sign-in', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname); // Guardar la ruta a la que se intentaba acceder
    return NextResponse.redirect(signInUrl);
  }

  // 3. Si hay token, verificarlo y gestionar roles
  const payload = await verifyToken(token);

  // Si el token es inválido o expiró
  if (!payload) {
    const signInUrl = new URL('/handler/sign-in', req.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    const response = NextResponse.redirect(signInUrl);
    response.cookies.delete('token'); // Limpiar la cookie inválida
    return response;
  }

  const userRole = payload.rol as 'admin' | 'cliente';

  // 4. Aplicar reglas de enrutamiento por rol
  // Si un admin intenta acceder a rutas de cliente...
  if (pathname.startsWith('/cliente') && userRole === 'admin') {
    return NextResponse.redirect(new URL('/admin', req.url));
  }

  // Si un cliente intenta acceder a rutas de admin...
  if (pathname.startsWith('/admin') && userRole === 'cliente') {
    return NextResponse.redirect(new URL('/cliente', req.url));
  }
  
  // Si un cliente intenta acceder a APIs de admin...
  if (pathname.startsWith('/api/admin') && userRole === 'cliente') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Si un admin intenta acceder a APIs de cliente (que no sean de lectura)...
  if (pathname.startsWith('/api/pedidos') && req.method !== 'GET' && userRole === 'admin') {
     return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }


  // Si pasa todas las validaciones, permitir el acceso
  return NextResponse.next();
}

export const config = {
  // El matcher asegura que el middleware se ejecute en estas rutas
  matcher: [
    '/',
    '/handler/:path*',
    '/cliente/:path*',
    '/admin/:path*',
    '/api/pedidos/:path*',
    '/api/admin/:path*',
  ],
};