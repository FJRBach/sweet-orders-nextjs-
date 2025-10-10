// lib/auth.ts
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { executeQuery } from '@/lib/db';
import { unstable_noStore as noStore } from 'next/cache';

export interface User {
  id: number;
  nombre: string;
  apellidos: string | null;
  rol: string;
}

interface UserPayload extends jwt.JwtPayload {
  id: number;
  rol: string;
}

export async function getUserSession(): Promise<User | null> {
  noStore();

  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  console.log('🔐 getUserSession - Token presente:', !!token);

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload;
    console.log('✅ Token válido, buscando usuario ID:', decoded.id);
    
    const userResult = await executeQuery(
      'SELECT id, nombre, apellidos, rol FROM perfiles_usuario WHERE id = $1 AND activo = TRUE',
      [decoded.id]
    );

    if (userResult.length === 0) {
      console.log('❌ Usuario no encontrado en BD');
      return null;
    }

    console.log('✅ Usuario encontrado:', { id: userResult[0].id, rol: userResult[0].rol });
    return userResult[0];

  } catch (error) {
    console.log('❌ Token inválido o sesión expirada:', error);
    return null;
  }
}

export async function getAdminUser(): Promise<User | null> {
  const user = await getUserSession();

  if (user && user.rol === 'admin') {
    return user;
  }
  return null;
}