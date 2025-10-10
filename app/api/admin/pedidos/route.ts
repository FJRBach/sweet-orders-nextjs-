// app/api/admin/pedidos/route.ts
import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

export async function GET() {
  try {
    // 1. Verificar la sesión y el rol del usuario (Asumimos que esto funciona)
    const user = await getUserSession();
    if (!user || user.rol !== 'admin') {
      return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
    }

    // 2. Consulta de todos los pedidos (USANDO JOINS COMPLETOS)
    // Nos unimos a todas las tablas necesarias para obtener el perfil y el tipo de producto.
    const pedidos = await executeQuery(
      `SELECT 
        p.id as id,
        p.perfil_usuario_id,
        perfil.nombre as cliente_nombre,
        u.email as cliente_email,
        p.fecha_pedido,
        p.fecha_entrega,
        p.estado,
        p.total,
        prod.tipo as tipo_producto
      FROM pedidos p
      JOIN perfiles_usuario perfil ON p.perfil_usuario_id = perfil.id
      JOIN neon_auth.users_sync u ON perfil.neon_auth_user_id = u.id
      JOIN detalles_pedido dp ON p.id = dp.pedido_id
      JOIN productos prod ON dp.producto_id = prod.id
      ORDER BY p.fecha_pedido DESC`,
      []
    );

    // 3. Devolver los datos en el formato esperado
    return NextResponse.json({ pedidos });

  } catch (error) {
    console.error('Error al obtener los pedidos de admin:', error);
    // Devolvemos 500 genérico como buena práctica de seguridad.
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}