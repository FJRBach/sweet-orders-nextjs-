import { NextRequest, NextResponse } from "next/server";
import { executeQuery } from "@/lib/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

// GET /api/pedidos?userId=X - Obtener pedidos de un usuario
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const url = new URL(req.url);
    const userId = url.searchParams.get("userId");

    // Verificar que el usuario solo pueda ver sus propios pedidos (o sea admin)
    if (decoded.rol !== "admin" && decoded.id !== Number(userId)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const pedidos = await executeQuery(
      `SELECT 
        p.id,
        p.fecha_pedido,
        p.fecha_entrega,
        p.estado,
        p.total
       FROM pedidos p
       WHERE p.perfil_usuario_id = $1
       ORDER BY p.fecha_pedido DESC`,
      [userId]
    );

    return NextResponse.json({ pedidos });
  } catch (error: any) {
    console.error("Error obteniendo pedidos:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}

// POST /api/pedidos - Crear nuevo pedido
export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const body = await req.json();

    const { tipo, userId, fechaEntrega, kilos, saborPanId, saborRellenoId, cantidad, saborId } = body;

    // Verificar que el usuario solo pueda crear pedidos para sí mismo
    if (decoded.id !== userId) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    // Obtener el producto según el tipo
    const productos = await executeQuery(
      "SELECT id, precio_base FROM productos WHERE tipo = $1 AND disponible = true LIMIT 1",
      [tipo]
    );

    if (productos.length === 0) {
      return NextResponse.json({ error: "Producto no disponible" }, { status: 400 });
    }

    const producto = productos[0];

    // Calcular precio
    let total = 0;
    let cantidadProducto = 1;

    if (tipo === "pastel") {
      total = kilos * producto.precio_base;
    } else if (tipo === "galletas") {
      cantidadProducto = cantidad;
      total = (cantidad / 12) * producto.precio_base;
    }

    // Crear el pedido
    const pedidoResult = await executeQuery(
      `INSERT INTO pedidos (perfil_usuario_id, fecha_entrega, total, estado)
       VALUES ($1, $2, $3, 'pendiente')
       RETURNING id`,
      [userId, fechaEntrega, total]
    );

    const pedidoId = pedidoResult[0].id;

    // Crear detalle del pedido
    const detalleResult = await executeQuery(
      `INSERT INTO detalles_pedido (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [pedidoId, producto.id, cantidadProducto, producto.precio_base, total]
    );

    const detalleId = detalleResult[0].id;

    // Crear detalles específicos según el tipo
    if (tipo === "pastel") {
      await executeQuery(
        `INSERT INTO detalles_pastel (detalle_pedido_id, kilos, sabor_pan_id, sabor_relleno_id)
         VALUES ($1, $2, $3, $4)`,
        [detalleId, kilos, saborPanId, saborRellenoId]
      );
    } else if (tipo === "galletas") {
      await executeQuery(
        `INSERT INTO detalles_galleta (detalle_pedido_id, sabor_id)
         VALUES ($1, $2)`,
        [detalleId, saborId]
      );
    }

    return NextResponse.json({
      success: true,
      pedidoId,
      message: "Pedido creado exitosamente",
    });
  } catch (error: any) {
    console.error("Error creando pedido:", error);
    return NextResponse.json({ error: "Error al crear pedido" }, { status: 500 });
  }
}