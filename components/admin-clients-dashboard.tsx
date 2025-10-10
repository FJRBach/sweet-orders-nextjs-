// components/admin-clients-dashboard.tsx
"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XCircle, Users } from "lucide-react"
import type { User } from "@/lib/auth"
import { Spinner } from "@/components/ui/spinner"
import { AdminClientCard } from "@/components/admin-client-card"

// Interfaz que coincide con la query de la API en /api/admin/clientes/route.ts
interface Client {
  id: number
  email: string
  nombre: string
  apellidos: string | null
  telefono: string | null
  rol: 'cliente' | 'admin'
  activo: boolean
  fecha_registro: string
}

interface AdminClientsDashboardProps {
  user: User
}

export function AdminClientsDashboard({ user }: AdminClientsDashboardProps) { // 🔑 Nombre del componente modificado
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      const response = await fetch("/api/admin/clientes")
      
      if (!response.ok) {
        console.error("Error fetching clients:", response.status, response.statusText);
        setClients([]) 
        return;
      }
      
      const data = await response.json()
      setClients(data.clientes || [])
    } catch (error) {
      console.error("[v0] Error fetching clients:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <div>
                <CardTitle>Directorio de Clientes</CardTitle>
                <CardDescription>Usuarios registrados con rol de cliente ({clients.length})</CardDescription>
            </div>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="h-8 w-8 text-primary" />
          </div>
        ) : clients.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <XCircle className="mb-4 h-16 w-16 text-gray-300" />
            <p className="text-gray-600">No se encontraron clientes o no hay datos disponibles.</p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clients.map((client) => (
              <AdminClientCard key={client.id} client={client} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}