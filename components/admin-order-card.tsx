// components/admin-order-card.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, User, Eye, Cake, Cookie } from "lucide-react"
import Link from "next/link"

interface Order {
  id: number
  perfil_usuario_id: number // CORREGIDO: Coincide con AdminDashboard y API
  cliente_nombre: string
  cliente_email: string
  fecha_pedido: string
  fecha_entrega: string
  estado: string
  total: number
  tipo_producto: string
}

interface AdminOrderCardProps {
  order: Order
  onStatusUpdate: (orderId: number, newStatus: string) => void
}

const estadoColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  pendiente: "secondary",
  en_proceso: "default",
  completado: "outline",
  entregado: "outline",
  cancelado: "destructive",
}

const estadoLabels: Record<string, string> = {
  pendiente: "Pendiente",
  en_proceso: "En Proceso",
  completado: "Completado",
  entregado: "Entregado",
  cancelado: "Cancelado",
}

export function AdminOrderCard({ order, onStatusUpdate }: AdminOrderCardProps) {
  // El estado local 'selectedStatus' es necesario para la Select
  const [selectedStatus, setSelectedStatus] = useState(order.estado)

  const handleStatusChange = (newStatus: string) => {
    setSelectedStatus(newStatus)
    // Llama al handler en AdminDashboard para actualizar el estado local y enviar a la API
    onStatusUpdate(order.id, newStatus)
  }

  // Sincroniza el estado local del select con la prop 'order.estado'
  // Esto es vital para que la actualización optimista del padre se refleje en el hijo.
  useEffect(() => {
    setSelectedStatus(order.estado);
  }, [order.estado]);


  return (
    <Card className="border-pink-100">
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <div className="mb-2 flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900">Pedido #{order.id}</h3>
              {order.tipo_producto === "pastel" ? (
                <Cake className="h-5 w-5 text-primary" />
              ) : (
                <Cookie className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="space-y-1 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  {order.cliente_nombre} ({order.cliente_email})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>Entrega: {new Date(order.fecha_entrega).toLocaleDateString("es-MX")}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Badge variant={estadoColors[order.estado] || "default"} className="justify-center">
              {estadoLabels[order.estado]}
            </Badge>
            <p className="text-right text-xl font-bold text-primary">${order.total.toFixed(2)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label className="mb-2 block text-sm font-medium text-gray-700">Cambiar Estado</label>
            <Select value={selectedStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_proceso">En Proceso</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="entregado">Entregado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button asChild variant="outline">
            <Link href={`/admin/pedido/${order.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              Ver Detalles
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}