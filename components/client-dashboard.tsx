// components/client-dashboard.tsx
"use client"

import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Plus, LogOut, Cake } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { User } from "@/lib/auth"
import { OrdersList } from "@/components/orders-list"

interface ClientDashboardProps {
  user: User
}

export function ClientDashboard({ user }: ClientDashboardProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  return (
    <div>
      {/* Mantenemos el header que ya tenías */}
      <header className="border-b bg-white/80 backdrop-blur-sm mb-8">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Cake className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SweetOrders</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">
              Hola, <span className="font-semibold">{user.nombre}</span>
            </span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold">Mi Dashboard</h2>
          <p className="text-gray-600">Gestiona tus pedidos y crea nuevos</p>
        </div>

        {/* El botón de "Realizar un Pedido" ahora es un enlace directo */}
        <Link href="/cliente/pedido/nuevo">
          <Card className="mb-8 cursor-pointer border-2 transition-all hover:border-primary hover:shadow-lg">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle>Realizar un Pedido</CardTitle>
                  <CardDescription>Crea un nuevo pedido personalizado</CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        </Link>
        
        {/* La lista de pedidos se muestra siempre */}
        <OrdersList userId={user.id} />
      </div>
    </div>
  )
}