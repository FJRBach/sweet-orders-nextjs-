// components/new-order-form.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, Cake, ShoppingBag } from "lucide-react"
import Link from "next/link"

interface Sabor {
  id: number
  nombre: string
  categoria: string
}

interface NewOrderFormProps {
  tipo: "pastel" | "galletas"
  saboresPan: Sabor[]
  saboresRelleno: Sabor[]
  saboresGalleta: Sabor[]
  userId: number
}

export function NewOrderForm({ tipo, saboresPan, saboresRelleno, saboresGalleta, userId }: NewOrderFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Estado para pastel
  const [kilos, setKilos] = useState("1.0")
  const [saborPan, setSaborPan] = useState("")
  const [saborRelleno, setSaborRelleno] = useState("")

  // Estado para galletas
  const [cantidad, setCantidad] = useState("12")
  const [saborGalleta, setSaborGalleta] = useState("")

  // Estado común
  const [fechaEntrega, setFechaEntrega] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Validaciones básicas
      if (!fechaEntrega) {
        setError("Por favor, selecciona una fecha de entrega.")
        setLoading(false)
        return
      }

      const orderData =
        tipo === "pastel"
          ? {
              tipo,
              userId,
              fechaEntrega,
              kilos: Number.parseFloat(kilos),
              saborPanId: Number.parseInt(saborPan),
              saborRellenoId: Number.parseInt(saborRelleno),
            }
          : {
              tipo,
              userId,
              fechaEntrega,
              cantidad: Number.parseInt(cantidad),
              saborId: Number.parseInt(saborGalleta),
            }

      const response = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderData),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Error al crear el pedido")
        setLoading(false)
        return
      }

      // Mejora: Redirigir al detalle del pedido creado
      router.push(`/cliente/pedido/${data.pedidoId}`)
      router.refresh() // Refresca el layout para actualizar listas de pedidos
    } catch (err) {
      setError("Error de conexión. Intenta de nuevo.")
      setLoading(false)
    }
  }

  const calcularPrecio = () => {
    // Nota: Este cálculo debería hacerse en el backend para mayor seguridad
    if (tipo === "pastel") {
      return Number.parseFloat(kilos) * 350
    }
    return (Number.parseInt(cantidad) / 12) * 150
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-3">
          {tipo === "pastel" ? <Cake /> : <ShoppingBag />}
          {tipo === "pastel" ? "Nuevo Pedido de Pastel" : "Nuevo Pedido de Galletas"}
        </CardTitle>
        <CardDescription>Personaliza tu pedido y selecciona la fecha de entrega</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {tipo === "pastel" ? (
            <>
              {/* Campos para Pastel */}
              <div className="space-y-2">
                <Label htmlFor="kilos">Kilos del Pastel</Label>
                <Select value={kilos} onValueChange={setKilos} required>
                  <SelectTrigger id="kilos"><SelectValue placeholder="Selecciona los kilos" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5 kg</SelectItem>
                    <SelectItem value="1.0">1.0 kg</SelectItem>
                    <SelectItem value="1.5">1.5 kg</SelectItem>
                    <SelectItem value="2.0">2.0 kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="saborPan">Sabor del Pan</Label>
                <Select value={saborPan} onValueChange={setSaborPan} required>
                  <SelectTrigger id="saborPan"><SelectValue placeholder="Selecciona el sabor del pan" /></SelectTrigger>
                  <SelectContent>
                    {saboresPan.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="saborRelleno">Sabor del Relleno</Label>
                <Select value={saborRelleno} onValueChange={setSaborRelleno} required>
                  <SelectTrigger id="saborRelleno"><SelectValue placeholder="Selecciona el sabor del relleno" /></SelectTrigger>
                  <SelectContent>
                    {saboresRelleno.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              {/* Campos para Galletas */}
              <div className="space-y-2">
                <Label htmlFor="cantidad">Cantidad de Galletas</Label>
                <Select value={cantidad} onValueChange={setCantidad} required>
                  <SelectTrigger id="cantidad"><SelectValue placeholder="Selecciona la cantidad" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 galletas</SelectItem>
                    <SelectItem value="24">24 galletas</SelectItem>
                    <SelectItem value="36">36 galletas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="saborGalleta">Sabor de las Galletas</Label>
                <Select value={saborGalleta} onValueChange={setSaborGalleta} required>
                  <SelectTrigger id="saborGalleta"><SelectValue placeholder="Selecciona el sabor" /></SelectTrigger>
                  <SelectContent>
                    {saboresGalleta.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.nombre}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {/* Campos Comunes */}
          <div className="space-y-2">
            <Label htmlFor="fechaEntrega">Fecha de Entrega</Label>
            <Input
              id="fechaEntrega" type="date" value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
              min={new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0]}
              required
            />
            <p className="text-sm text-muted-foreground">Mínimo 2 días de anticipación</p>
          </div>
          <div className="rounded-lg bg-pink-50 p-4 text-center">
            <span className="text-lg font-semibold text-gray-900">Precio Estimado: </span>
            <span className="text-2xl font-bold text-primary">${calcularPrecio().toFixed(2)}</span>
          </div>

          <div className="flex gap-4">
            <Button asChild variant="outline" className="w-1/3">
              <Link href="/cliente">Cancelar</Link>
            </Button>
            <Button type="submit" className="w-2/3" size="lg" disabled={loading}>
              {loading ? "Creando pedido..." : "Confirmar y Crear Pedido"}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  )
}