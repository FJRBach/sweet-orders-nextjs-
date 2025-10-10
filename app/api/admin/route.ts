import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// GET /api/admin/pedidos - Obtener todos los pedidos (solo admin)
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    if (decoded.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const pedidos = await executeQuery(
      `SELECT 
        p.id,
        p.perfil_usuario_id AS usuario_id,
        pu.nombre AS cliente_nombre,
        pu.telefono AS cliente_telefono,
        p.fecha_pedido,
        p.fecha_entrega,
        p.estado,
        p.total,
        pr.tipo AS tipo_producto
       FROM pedidos p
       JOIN perfiles_usuario pu ON p.perfil_usuario_id = pu.id
       LEFT JOIN detalles_pedido dp ON p.id = dp.pedido_id
       LEFT JOIN productos pr ON dp.producto_id = pr.id
       ORDER BY p.fecha_pedido DESC`
    );

    // Obtener email de cada usuario (si está disponible en neon_auth)
    const pedidosConEmail = await Promise.all(
      pedidos.map(async (pedido) => {
        const userInfo = await executeQuery(
          `SELECT neon_auth_user_id FROM perfiles_usuario WHERE id = $1`,
          [pedido.usuario_id]
        );

        let email = "";
        if (userInfo.length > 0) {
          // Aquí podrías consultar neon_auth.users_sync si lo necesitas
          // Por ahora usaremos un placeholder
          email = `usuario${pedido.usuario_id}@email.com`;
        }

        return {
          ...pedido,
          cliente_email: email,
        };
      })
    );

    return NextResponse.json({ pedidos: pedidosConEmail });
  } catch (error: any) {
    console.error("Error obteniendo pedidos (admin):", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}