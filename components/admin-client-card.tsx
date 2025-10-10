// components/admin-client-card.tsx
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Mail, Phone, Calendar, UserCheck, UserX } from "lucide-react"

// Interfaz que coincide con la query de la API
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

interface AdminClientCardProps {
  client: Client
}

export function AdminClientCard({ client }: AdminClientCardProps) {
  const nombreCompleto = `${client.nombre} ${client.apellidos || ''}`.trim();

  return (
    <Card className="border-pink-100 transition-shadow hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl text-gray-900">{nombreCompleto || client.email}</CardTitle>
          <Badge 
            variant={client.activo ? "default" : "destructive"} 
            className={`flex items-center gap-1 ${client.activo ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
          >
            {client.activo ? <UserCheck className="h-4 w-4" /> : <UserX className="h-4 w-4" />}
            {client.activo ? "Activo" : "Inactivo"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-gray-600">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <span>{client.email}</span>
        </div>
        {client.telefono && (
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            <span>{client.telefono}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          <span>Registrado: {new Date(client.fecha_registro).toLocaleDateString("es-MX")}</span>
        </div>
        <div className="pt-2">
          <Badge variant="secondary" className="bg-pink-100 text-pink-700">
            Rol: {client.rol.charAt(0).toUpperCase() + client.rol.slice(1)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}