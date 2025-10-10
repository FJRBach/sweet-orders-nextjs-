// components/order-details-view.tsx
"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, User, Phone, Mail, Cake, Cookie, Package, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { Button } from "./ui/button"

// Tipos de datos que la página del servidor nos pasará
export interface PedidoCompleto {
    id: number;
    perfil_usuario_id: number; // <-- CORRECCIÓN: Añadido para la validación de seguridad
    fecha_pedido: string;
    fecha_entrega: string;
    estado: string;
    total: number;
    cliente_nombre: string;
    cliente_email: string;
    cliente_telefono?: string;
    detalles: Detalle[];
}

interface Detalle {
    id: number;
    producto_nombre: string;
    tipo_producto: 'pastel' | 'galletas';
    cantidad: number;
    subtotal: number;
    kilos?: number;
    sabor_pan?: string;
    sabor_relleno?: string;
    sabor_galleta?: string;
}

interface OrderDetailsViewProps {
    pedido: PedidoCompleto;
    userRole: "cliente" | "admin";
}

// CORRECCIÓN: Se cambió "success" por "default" y se manejará el color con clases
const estadoConfig = {
    pendiente: { label: "Pendiente", variant: "secondary" as const, className: "" },
    en_proceso: { label: "En Proceso", variant: "default" as const, className: "bg-blue-100 text-blue-800" },
    completado: { label: "Completado", variant: "default" as const, className: "bg-green-100 text-green-800" },
    entregado: { label: "Entregado", variant: "default" as const, className: "bg-green-100 text-green-800" },
    cancelado: { label: "Cancelado", variant: "destructive" as const, className: "" },
};


export function OrderDetailsView({ pedido, userRole }: OrderDetailsViewProps) {
    const backUrl = userRole === "admin" ? "/admin" : "/cliente";
    const configEstado = estadoConfig[pedido.estado as keyof typeof estadoConfig] || { label: pedido.estado, variant: "outline", className: "" };

    return (
        <div className="mx-auto max-w-4xl">
            <div className="mb-4">
                <Button asChild variant="outline" size="sm">
                    <Link href={backUrl}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Volver al Dashboard
                    </Link>
                </Button>
            </div>

            <div className="mb-6">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-3xl font-bold text-gray-900">Pedido #{pedido.id}</h2>
                    {/* CORRECCIÓN: Se añade la clase para el color de "éxito" */}
                    <Badge variant={configEstado.variant} className={`text-base capitalize ${configEstado.className}`}>
                        {configEstado.label}
                    </Badge>
                </div>
                <p className="text-gray-600">Realizado el {new Date(pedido.fecha_pedido).toLocaleDateString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            {/* ... el resto de tu JSX no necesita cambios ... */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Calendar className="h-5 w-5 text-primary" /> Información del Pedido</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="text-muted-foreground">Fecha de Entrega</p>
                            <p className="font-semibold">{new Date(pedido.fecha_entrega).toLocaleDateString("es-MX", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
                        </div>
                        <Separator />
                        <div>
                            <p className="text-muted-foreground">Estado</p>
                            <p className="font-semibold capitalize">{configEstado.label}</p>
                        </div>
                    </CardContent>
                </Card>

                {userRole === "admin" && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-primary" /> Información del Cliente</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm">
                            <div>
                                <p className="text-muted-foreground">Nombre</p>
                                <p className="font-semibold">{pedido.cliente_nombre}</p>
                            </div>
                            <Separator />
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <p>{pedido.cliente_email}</p>
                            </div>
                            {pedido.cliente_telefono && (
                                <div className="flex items-center gap-2">
                                    <Phone className="h-4 w-4 text-muted-foreground" />
                                    <p>{pedido.cliente_telefono}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>

            <Card className="mt-6">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Resumen del Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {pedido.detalles.map((detalle) => (
                            <div key={detalle.id} className="flex items-start gap-4 rounded-lg bg-gray-50 p-4">
                                <div className="rounded-full bg-primary/10 p-3">
                                    {detalle.tipo_producto === "pastel" ? <Cake className="h-6 w-6 text-primary" /> : <Cookie className="h-6 w-6 text-primary" />}
                                </div>
                                <div className="flex-1 space-y-2 text-sm">
                                    <h4 className="font-bold">{detalle.producto_nombre}</h4>
                                    {detalle.tipo_producto === "pastel" && (
                                        <>
                                            <p><span className="font-semibold text-muted-foreground">Peso:</span> {detalle.kilos} kg</p>
                                            <p><span className="font-semibold text-muted-foreground">Pan:</span> {detalle.sabor_pan}</p>
                                            <p><span className="font-semibold text-muted-foreground">Relleno:</span> {detalle.sabor_relleno}</p>
                                        </>
                                    )}
                                    {detalle.tipo_producto === "galletas" && (
                                        <>
                                            <p><span className="font-semibold text-muted-foreground">Cantidad:</span> {detalle.cantidad} uds.</p>
                                            <p><span className="font-semibold text-muted-foreground">Sabor:</span> {detalle.sabor_galleta}</p>
                                        </>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-lg">${Number(detalle.subtotal).toFixed(2)}</p>
                                    <p className="text-xs text-muted-foreground">({detalle.cantidad} x ${(Number(detalle.subtotal) / detalle.cantidad).toFixed(2)})</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <Separator className="my-4" />
                    <div className="flex items-center justify-end gap-4 text-right">
                        <span className="text-xl font-bold">Total del Pedido</span>
                        <span className="text-3xl font-bold text-primary">${Number(pedido.total).toFixed(2)}</span>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}