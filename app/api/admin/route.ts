// app/api/admin/pedidos/route.ts

import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// 🔑 NUEVA INTERFAZ: Refleja los campos devueltos por la consulta SQL
interface PedidoBase {
  id: number;
  usuario_id: number; // p.perfil_usuario_id AS usuario_id
  cliente_nombre: string;
  cliente_telefono: string | null;
  fecha_pedido: string;
  fecha_entrega: string;
  estado: string;
  total: number;
  tipo_producto: string;
}

// Interfaz para la carga útil del JWT (buena práctica, asumiendo que ya instalaste los @types)
interface JwtPayload {
  id: number;
  rol: "cliente" | "admin";
}

// GET /api/admin/pedidos - Obtener todos los pedidos (solo admin)
export async function GET(req: NextRequest) {
  try {
    // ... (Código de autenticación y autorización) ...
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    // Usamos la tipificación para JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;

    if (decoded.rol !== "admin") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // 🔑 USAMOS EL TIPADO AQUÍ
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
    ) as PedidoBase[]; // Forzamos el tipado a un array de PedidoBase

    // Obtener email de cada usuario (si está disponible en neon_auth)
    const pedidosConEmail = await Promise.all(
      pedidos.map(async (pedido: PedidoBase) => { //  PARÁMETRO 'pedido'
        const userInfo = await executeQuery(
          `SELECT neon_auth_user_id FROM perfiles_usuario WHERE id = $1`,
          [pedido.usuario_id]
        );

        let email = "";
        if (userInfo.length > 0) {
          // ... (Lógica de placeholder de email)
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