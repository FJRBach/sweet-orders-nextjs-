// app/api/auth/login/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import * as jose from 'jose';
import { executeQuery } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { token: neonAuthToken } = await request.json();

    // Verifica el token de Neon Auth con JWKS
    const JWKS = jose.createRemoteJWKSet(new URL(process.env.NEON_AUTH_JWKS_URL!));
    const { payload } = await jose.jwtVerify(neonAuthToken, JWKS);
    const neonAuthUserId = payload.sub;

    // Consulta en tu base local
    const userProfileResult = await executeQuery(
      'SELECT id, rol, apellidos FROM perfiles_usuario WHERE neon_auth_user_id = $1 AND activo = TRUE',
      [neonAuthUserId]
    );

    if (userProfileResult.length === 0) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    const userProfile = userProfileResult[0];
    const perfilCompleto = !!userProfile.apellidos;

    // 🔑 Crea el token local de SweetOrders
    const sessionClaims = {
      id: userProfile.id,
      rol: userProfile.rol,
      perfilCompleto,
    };
    const sessionToken = jwt.sign(sessionClaims, process.env.JWT_SECRET!, { expiresIn: '30d' });

    // 🔄 Crea la respuesta con Set-Cookie
    const res = NextResponse.json({
      success: true,
      redirectTo: perfilCompleto
        ? (userProfile.rol === 'admin' ? '/admin' : '/cliente')
        : '/cliente/completar-perfil',
    });

    // 🔐 Define la cookie "token"
    res.cookies.set('token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: '/',
    });

    // ❌ Limpia cookies conflictivas de Stack Auth
    res.cookies.set('stack-access', '', { maxAge: 0, path: '/' });
    res.cookies.set('stack-refresh', '', { maxAge: 0, path: '/' });
    res.cookies.set('stack-is-https', '', { maxAge: 0, path: '/' });

    return res;
  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
