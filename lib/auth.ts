// lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

interface UserPayload extends jwt.JwtPayload {
  id: number;
  rol: string;
}

export async function getUserSession() {
  // LA CORRECCIÓN: Esta línea obliga a Next.js a ejecutar esta función
  // siempre desde cero, sin usar caché.
  noStore();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;

    // Al no haber caché, esta consulta siempre traerá los datos más frescos
    // de la base de datos, incluyendo los apellidos recién guardados.
    const userResult = await executeQuery(
      'SELECT id, nombre, apellidos, rol FROM perfiles_usuario WHERE id = $1 AND activo = TRUE',
      [decoded.id]
    );

    if (userResult.length === 0) {
      return null;
    }

    return userResult[0];

  } catch (error) {
    console.log('Token inválido o sesión expirada:', error);
    return null;
  }
}