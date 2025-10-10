//  
"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Cake, LogOut, Package, Clock, CheckCircle, XCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import { AdminOrderCard } from "@/components/admin-order-card"
import { Spinner } from "@/components/ui/spinner"

interface AdminDashboardProps {
  user: User
}

interface OrderWithDetails {
 id: number
  perfil_usuario_id: number 
  cliente_nombre: string
  cliente_email: string
  fecha_pedido: string
  fecha_entrega: string
  estado: string
  total: number
  tipo_producto: string 
}

export function AdminDashboard({ user }: AdminDashboardProps) {
  const router = useRouter()
  const [orders, setOrders] = useState<OrderWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("todos")

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const response = await fetch("/api/admin/pedidos")
      const data = await response.json()
      
      const ordersWithNumericTotal = (data.pedidos || []).map((order: OrderWithDetails) => ({
        ...order,
        total: parseFloat(order.total as any),
      }))
      setOrders(ordersWithNumericTotal)
    } catch (error) {
      console.error("[v0] Error fetching orders:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/pedidos/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newStatus }),
      })

      if (response.ok) {
        fetchOrders()
      }
    } catch (error) {
      console.error("[v0] Error updating order status:", error)
    }
  }

  const filterOrders = (estado?: string) => {
    if (!estado || estado === "todos") return orders
    return orders.filter((order) => order.estado === estado)
  }

  const getOrderStats = () => {
    return {
      total: orders.length,
      pendientes: orders.filter((o) => o.estado === "pendiente").length,
      enProceso: orders.filter((o) => o.estado === "en_proceso").length,
      completados: orders.filter((o) => o.estado === "completado").length,
    }
  }

  const stats = getOrderStats()
  const filteredOrders = filterOrders(activeTab === "todos" ? undefined : activeTab)

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b border-pink-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Cake className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">SweetOrders</h1>
              <p className="text-xs text-gray-600">Panel de Administración</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{user.nombre}</span> (Admin)
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Dashboard de Administración</h2>
          <p className="text-gray-600">Gestiona todos los pedidos de la repostería</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card className="border-pink-100">
            <CardHeader className="pb-3">
              <CardDescription>Total de Pedidos</CardDescription>
              <CardTitle className="text-3xl text-primary">{stats.total}</CardTitle>
            </CardHeader>
            <CardContent>
              <Package className="h-8 w-8 text-pink-200" />
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardHeader className="pb-3">
              <CardDescription>Pendientes</CardDescription>
              <CardTitle className="text-3xl text-yellow-600">{stats.pendientes}</CardTitle>
            </CardHeader>
            <CardContent>
              <Clock className="h-8 w-8 text-yellow-200" />
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardHeader className="pb-3">
              <CardDescription>En Proceso</CardDescription>
              <CardTitle className="text-3xl text-blue-600">{stats.enProceso}</CardTitle>
            </CardHeader>
            <CardContent>
              <Package className="h-8 w-8 text-blue-200" />
            </CardContent>
          </Card>

          <Card className="border-pink-100">
            <CardHeader className="pb-3">
              <CardDescription>Completados</CardDescription>
              <CardTitle className="text-3xl text-green-600">{stats.completados}</CardTitle>
            </CardHeader>
            <CardContent>
              <CheckCircle className="h-8 w-8 text-green-200" />
            </CardContent>
          </Card>
        </div>

        {/* Orders List with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Gestión de Pedidos</CardTitle>
            <CardDescription>Filtra y gestiona los pedidos por estado</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="todos">Todos</TabsTrigger>
                <TabsTrigger value="pendiente">Pendientes</TabsTrigger>
                <TabsTrigger value="en_proceso">En Proceso</TabsTrigger>
                <TabsTrigger value="completado">Completados</TabsTrigger>
                <TabsTrigger value="entregado">Entregados</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab} className="mt-6">
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Spinner className="h-8 w-8 text-primary" />
                  </div>
                ) : filteredOrders.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <XCircle className="mb-4 h-16 w-16 text-gray-300" />
                    <p className="text-gray-600">No hay pedidos en esta categoría</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <AdminOrderCard key={order.id} order={order} onStatusUpdate={handleStatusUpdate} />
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}