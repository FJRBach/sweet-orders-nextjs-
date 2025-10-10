// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

// Cambiamos GET por POST para que coincida con la petición del cliente
export async function POST() {
  try {
    const cookieStore = cookies();
    
    // Lista de cookies a eliminar
    const cookiesToDelete = [
      'token', // Tu cookie principal de sesión JWT
      // Añade aquí otras cookies de sesión si las tienes,
      // las de stackframe/next-auth suelen manejarse automáticamente
      // pero si tienes alguna personalizada, ponla aquí.
    ];

    // Usamos el método .delete() que es más claro
    for (const name of cookiesToDelete) {
      (await cookieStore).delete(name);
    }
    
    // En lugar de redirigir desde la API, devolvemos una respuesta de éxito.
    // La redirección la debe manejar el cliente.
    return NextResponse.json({ success: true, message: 'Logout successful' }, { status: 200 });

  } catch (error) {
    console.error('Error during logout:', error);
    return NextResponse.json({ success: false, message: 'An error occurred during logout' }, { status: 500 });
  }
}