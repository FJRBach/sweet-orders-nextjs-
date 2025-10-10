// app/components/orders-list.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Eye, Package } from "lucide-react"
import Link from "next/link"
import { Spinner } from "@/components/ui/spinner"

interface Order {
  id: number
  fecha_pedido: string
  fecha_entrega: string
  estado: string
  total: number
}

interface OrdersListProps {
  userId: number
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

export function OrdersList({ userId }: OrdersListProps) {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch(`/api/pedidos?userId=${userId}`)
        const data = await response.json()
        
        const ordersWithNumericTotal = data.pedidos.map((order: Order) => ({
          ...order,
          total: parseFloat(order.total as any),
        }))
        setOrders(ordersWithNumericTotal || [])
      } catch (error) {
        console.error("[v0] Error fetching orders:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [userId])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner className="h-8 w-8 text-primary" />
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Package className="mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-2 text-xl font-semibold text-gray-900">No tienes pedidos aún</h3>
          <p className="mb-4 text-gray-600">Crea tu primer pedido para comenzar</p>
          <Button asChild>
            <Link href="/cliente/pedido/nuevo?tipo=pastel">Hacer un Pedido</Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-gray-900">Mis Pedidos</h3>
      {orders.map((order) => (
        <Card key={order.id} className="border-pink-100">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                <CardDescription className="mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Entrega: {new Date(order.fecha_entrega).toLocaleDateString("es-MX")}
                </CardDescription>
              </div>
              <Badge variant={estadoColors[order.estado] || "default"}>{estadoLabels[order.estado]}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total</p>
                <p className="text-2xl font-bold text-primary">${order.total.toFixed(2)}</p>
              </div>
              <Button asChild variant="outline">
                <Link href={`/cliente/pedido/${order.id}`}>
                  <Eye className="mr-2 h-4 w-4" />
                  Ver Detalles
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}