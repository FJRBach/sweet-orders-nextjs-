// app/api/user/update-profile/route.ts
import { NextResponse } from 'next/server';
import { executeQuery } from '@/lib/db';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      id: number;
      rol: string;
    };

    // 2️ Leer datos del cuerpo
    const { apellidos, telefono } = await request.json();

    // 3 Actualizar en base de datos
    await executeQuery(
      'UPDATE perfiles_usuario SET apellidos = $1, telefono = $2 WHERE id = $3',
      [apellidos, telefono, decoded.id]
    );

    // 4 Generar nuevo token con perfil completo
    const newSessionToken = jwt.sign(
      { id: decoded.id, rol: decoded.rol, perfilCompleto: true },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    );

    // 5️ Crear la respuesta JSON
    const res = NextResponse.json({
      success: true,
      message: 'Perfil actualizado correctamente.',
    });

    // 6️ Adjuntar cookie ACTUALIZADA en la respuesta
    res.cookies.set('token', newSessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // <-- cámbialo a lax (evita que se bloquee la cookie en POST)
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    });

    return res;
  } catch (error) {
    console.error('Error al actualizar el perfil:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
