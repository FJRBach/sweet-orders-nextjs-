// app/api/admin/pedidos/[pedidoid]/route.ts

import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { executeQuery } from '@/lib/db';

// Tipo de resultado esperado para las operaciones UPDATE/DELETE/INSERT
interface MutationResult {
    rowCount: number;
}

// Interfaz para definir el cuerpo del request PATCH
interface PatchBody {
    estado: string;
}

// 🔑 NUEVO HANDLER: GET (Obtener detalles de un pedido específico)
export async function GET(
    request: Request, 
    { params }: { params: { pedidoId: string } } 
) {
    try {
        const user = await getUserSession();
        if (!user || user.rol !== 'admin') {
            return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
        }

        const idPedido = parseInt(params.pedidoId); 
        if (isNaN(idPedido)) {
            return NextResponse.json({ error: 'ID de pedido inválido' }, { status: 400 });
        }

        const pedidoResult = await executeQuery(
            `SELECT 
                p.id,
                p.perfil_usuario_id,
                pu.nombre AS cliente_nombre,
                u.email AS cliente_email,
                pu.telefono AS cliente_telefono,
                p.fecha_pedido,
                p.fecha_entrega,
                p.estado,
                p.total
             FROM pedidos p
             JOIN perfiles_usuario pu ON p.perfil_usuario_id = pu.id
             JOIN neon_auth.users_sync u ON pu.neon_auth_user_id = u.id
             WHERE p.id = $1`,
            [idPedido]
        );

        if (pedidoResult.length === 0) {
            return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
        }
        
        // ✨ INICIO DE LA CORRECCIÓN ✨

        // 1. OBTENER LOS DETALLES DEL PEDIDO
        const detallesResult = await executeQuery(
            `SELECT
                dp.id,
                pr.nombre AS producto_nombre,
                pr.tipo AS tipo_producto,
                dp.cantidad,
                dp.subtotal,
                dpa.kilos,
                sp.nombre AS sabor_pan,
                sr.nombre AS sabor_relleno,
                sg.nombre AS sabor_galleta
            FROM detalles_pedido dp
            JOIN productos pr ON dp.producto_id = pr.id
            LEFT JOIN detalles_pastel dpa ON dp.id = dpa.detalle_pedido_id
            LEFT JOIN sabores sp ON dpa.sabor_pan_id = sp.id
            LEFT JOIN sabores sr ON dpa.sabor_relleno_id = sr.id
            LEFT JOIN detalles_galleta dga ON dp.id = dga.detalle_pedido_id
            LEFT JOIN sabores sg ON dga.sabor_id = sg.id
            WHERE dp.pedido_id = $1`,
            [idPedido]
        );

        // 2. CONVERTIR VALORES DE STRING A NÚMERO
         const pedidoData = pedidoResult[0];
        pedidoData.total = parseFloat(pedidoData.total);
        const detallesData = detallesResult.map((detalle: any) => ({
            ...detalle,
            subtotal: parseFloat(detalle.subtotal),
            cantidad: parseInt(detalle.cantidad, 10),
            kilos: detalle.kilos ? parseFloat(detalle.kilos) : undefined,
        }));
        const pedidoCompleto = {
            ...pedidoData,
            detalles: detallesData,
        };

        // 4. RESPUESTA EXITOSA CON DATOS CORREGIDOS Y COMPLETOS
        return NextResponse.json({ pedido: pedidoCompleto });

        // ✨ FIN DE LA CORRECCIÓN ✨

    } catch (error) {
        console.error(`Error al obtener el pedido ${params.pedidoId}:`, error);
        return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
    }
}


// ----------------------------------------------------------------------
// HANDLER EXISTENTE: PATCH (Actualizar estado)
// ----------------------------------------------------------------------

export async function PATCH(
    request: Request, 
    { params }: { params: { pedidoId: string } } 
) {
    try {
        const user = await getUserSession();
        if (!user || user.rol !== 'admin') {
            return NextResponse.json({ error: 'Acceso no autorizado' }, { status: 403 });
        }

        const idPedido = parseInt(params.pedidoId);
        if (isNaN(idPedido)) {
            return NextResponse.json({ error: 'ID de pedido inválido' }, { status: 400 });
        }
        
        const body: PatchBody = await request.json();
        const nuevoEstado = body.estado;

        const estadosValidos = ['pendiente', 'en_proceso', 'completado', 'entregado', 'cancelado'];
        if (!estadosValidos.includes(nuevoEstado)) {
            return NextResponse.json({ error: 'Estado de pedido inválido' }, { status: 400 });
        }

        const result = await executeQuery(
            `UPDATE pedidos 
             SET estado = $1, fecha_actualizacion = NOW()
             WHERE id = $2`,
            [nuevoEstado, idPedido]
        );
        
      const mutationResult = result as unknown as MutationResult;

        if (mutationResult.rowCount === 0) {
             return NextResponse.json({ error: 'Pedido no encontrado o sin cambios' }, { status: 404 });
        }

        return NextResponse.json({ message: `Estado del pedido ${idPedido} actualizado a ${nuevoEstado}` });

    } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        return NextResponse.json({ error: 'Error interno del servidor al actualizar el pedido' }, { status: 500 });
    }
}