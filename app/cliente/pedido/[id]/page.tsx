// app/cliente/pedido/[id]/page.tsx
import { getUserSession } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { OrderDetailsView, PedidoCompleto } from "@/components/order-details-view";

// Esta función ahora retorna un tipo que coincide con la interfaz corregida
async function getOrderDetails(orderId: number): Promise<PedidoCompleto | null> {
  // Query principal para obtener el pedido y la información del cliente
  const orderQuery = `
    SELECT 
      p.id, p.fecha_pedido, p.fecha_entrega, p.estado, p.total, p.perfil_usuario_id,
      pu.nombre as cliente_nombre, pu.apellidos as cliente_apellidos, pu.telefono as cliente_telefono,
      u.email as cliente_email
    FROM pedidos p
    JOIN perfiles_usuario pu ON p.perfil_usuario_id = pu.id
    JOIN neon_auth.users_sync u ON pu.neon_auth_user_id = u.id
    WHERE p.id = $1
  `;
  const orderResult = await executeQuery(orderQuery, [orderId]);
  if (orderResult.length === 0) return null;

  // Query para obtener los detalles de los productos en el pedido
  const detailsQuery = `
    SELECT 
      dp.id, pr.nombre as producto_nombre, pr.tipo as tipo_producto,
      dp.cantidad, dp.subtotal,
      dpa.kilos, 
      s_pan.nombre as sabor_pan, 
      s_relleno.nombre as sabor_relleno,
      s_galleta.nombre as sabor_galleta
    FROM detalles_pedido dp
    JOIN productos pr ON dp.producto_id = pr.id
    LEFT JOIN detalles_pastel dpa ON dp.id = dpa.detalle_pedido_id
    LEFT JOIN sabores s_pan ON dpa.sabor_pan_id = s_pan.id
    LEFT JOIN sabores s_relleno ON dpa.sabor_relleno_id = s_relleno.id
    LEFT JOIN detalles_galleta dga ON dp.id = dga.detalle_pedido_id
    LEFT JOIN sabores s_galleta ON dga.sabor_id = s_galleta.id
    WHERE dp.pedido_id = $1
  `;
  const detailsResult = await executeQuery(detailsQuery, [orderId]);

  return {
    ...orderResult[0],
    cliente_nombre: `${orderResult[0].cliente_nombre} ${orderResult[0].cliente_apellidos || ''}`.trim(),
    detalles: detailsResult,
  };
}

export default async function ClientOrderDetailsPage({ params: { id } }: { params: { id: string } }) {
  const user = await getUserSession();
  if (!user) {
    redirect("/handler/sign-in");
  }

const orderId = Number(id); 
  if (isNaN(orderId)) {
    notFound();
  }

  const pedido = await getOrderDetails(orderId);

  // ¡VERIFICACIÓN DE SEGURIDAD CRÍTICA!
  // Esta línea ya no dará error porque `PedidoCompleto` ahora tiene `perfil_usuario_id`.
  if (!pedido || pedido.perfil_usuario_id !== user.id) {
    notFound();
  }

  return <OrderDetailsView pedido={pedido} userRole="cliente" />;
}