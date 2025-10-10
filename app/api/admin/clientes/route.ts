// app/api/admin/clientes/route.ts

import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // 1. Verificar la sesión y el rol del usuario
    const user = await getUserSession();
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    // 2. Consultar la lista de clientes usando la vista
    // Excluimos al administrador actual si solo queremos ver clientes
    const clientes = await executeQuery(
      `SELECT 
        perfil_id as id,
        email,
        nombre,
        apellidos,
        telefono,
        rol,
        activo,
        fecha_registro
      FROM vista_usuarios_completos
      WHERE rol = 'cliente' 
      ORDER BY fecha_registro DESC`,
      []
    );

    // 3. Devolver los datos
    return NextResponse.json({ clientes });

  } catch (error) {
    console.error('Error al obtener la lista de clientes:', error);
    return NextResponse.json({ error: 'Error interno del servidor al consultar clientes' }, { status: 500 });
  }
}