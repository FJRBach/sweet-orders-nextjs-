/// app/api/auth/callback/route.ts
import { NextResponse } from "next/server";
import * as jose from 'jose';
import { executeQuery } from "@/lib/db";
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    // 🔹 Leer cookie 'stack-access' directamente
    const cookieHeader = request.headers.get('cookie') || '';
    const stackCookie = cookieHeader
      .split(';')
      .find(c => c.trim().startsWith('stack-access='))
      ?.split('=')[1];

    if (!stackCookie) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 🔹 Verificar token con JWKS
    const JWKS = jose.createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!));
    const { payload } = await jose.jwtVerify(stackCookie, JWKS);
    const neonAuthUserId = payload.sub;

    // 🔹 Buscar usuario local
    const userProfileResult = await executeQuery(
      'SELECT id, rol, apellidos FROM perfiles_usuario WHERE neon_auth_user_id = $1 AND activo = TRUE',
      [neonAuthUserId]
    );

    if (userProfileResult.length === 0)
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });

    const user = userProfileResult[0];
    const perfilCompleto = !!user.apellidos;

    // 🔹 Generar token local
    const sessionToken = jwt.sign(
      { id: user.id, rol: user.rol, perfilCompleto },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    const res = NextResponse.json({
      success: true,
      redirectTo: perfilCompleto ? (user.rol === 'admin' ? '/admin' : '/cliente') : '/cliente/completar-perfil',
    });

    res.cookies.set('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
    });

    return res;
  } catch (err) {
    console.error('Error callback:', err);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
