// app/api/auth/registro/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { nombre, email } = await request.json();

    // Llamada a la API de Neon Auth para crear el usuario
    const neonApiResponse = await fetch('https://console.neon.tech/api/v2/projects/auth/user', {
      method: 'POST',
      headers: {
        // Usando tus variables exactas del .env.local
        'Authorization': `Bearer ${process.env.NEON_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        // Usando tus variables exactas del .env.local
        project_id: process.env.NEON_PROJECT_ID,
        auth_provider: 'stack',
        email: email,
        name: nombre,
      }),
    });

    const neonData = await neonApiResponse.json();

    if (!neonApiResponse.ok) {
      console.error('Error desde Neon API:', neonData);
      return NextResponse.json(
        { error: neonData.message || 'Error al crear el usuario en Neon' },
        { status: neonApiResponse.status }
      );
    }
    
    return NextResponse.json({
      success: true,
      redirectTo: '/login',
    });

  } catch (error) {
    console.error('Error en el endpoint de registro:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}