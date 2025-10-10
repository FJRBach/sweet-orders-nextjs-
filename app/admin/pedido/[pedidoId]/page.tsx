// app/admin/pedido/[pedidoId]/page.tsx

import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getAdminUser } from '@/lib/auth';
import { OrderDetailsView, PedidoCompleto } from '@/components/order-details-view';
import Link from 'next/link';

interface PedidoDetallado extends PedidoCompleto {}

interface Props {
    params: {
        pedidoId: string;
    }
}

// ✅ PASO 1: La función ahora acepta las cookies como un argumento de tipo string.
// Ya no llama a la función cookies() directamente.
async function getPedidoDetails(id: string, cookieHeader: string): Promise<PedidoDetallado | null> {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    try {
        const response = await fetch(`${baseUrl}/api/admin/pedidos/${id}`, {
            cache: 'no-store',
            headers: {
                // Usa el string de cookies que se le pasó como argumento.
                'Cookie': cookieHeader,
            },
        });

        if (!response.ok) {
            console.error(`Error fetching order ${id}: ${response.status} ${response.statusText}`);
            return null;
        }

        const data = await response.json();

        if (!data.pedido) {
            return null;
        }

        return data.pedido as PedidoDetallado;

    } catch (error) {
        console.error(`Failed to fetch or parse order details for ID ${id}:`, error);
        return null;
    }
}


// --- Componente principal de la página ---
export default async function PedidoDetallePage({ params }: Props) {
    const user = await getAdminUser(); 

    if (!user) {
        redirect('/login');
    }
    
    // ✅ PASO 2: Leer tanto params como cookies aquí, en el nivel superior de la página.
    const pedidoId = params.pedidoId;
    const cookieHeader = cookies().toString(); // Leemos las cookies aquí.

    // Pasamos ambos valores como argumentos a la función.
    const pedido = await getPedidoDetails(pedidoId, cookieHeader);

    if (!pedido) {
        return (
            <div className="container mx-auto py-10 text-center">
                <h1 className="text-3xl font-bold text-red-600">Pedido No Encontrado</h1>
                <p className="text-gray-600 mt-2">El pedido con ID: {pedidoId} no existe o no se pudo cargar.</p>
                <Link href="/admin" className="mt-4 text-primary underline">
                    Volver al Dashboard
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white pt-8">
            <div className="container mx-auto px-4">
                <h2 className="mb-6 text-3xl font-bold text-gray-900">Detalle del Pedido #{pedidoId}</h2>
                <OrderDetailsView pedido={pedido} userRole="admin" /> 
            </div>
        </div>
    );
}