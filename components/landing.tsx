// components/landing.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Cake, Cookie, ShoppingBag } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b border-pink-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Cake className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold text-primary">SweetOrders</h1>
          </div>
          <div className="flex gap-3">
           <Button asChild variant="outline">
          <Link href="/handler/sign-in?callbackUrl=%2Fcliente">Iniciar Sesión</Link>
          </Button>
          <Button asChild>
          <Link href="/handler/sign-up?callbackUrl=/cliente">Registrarse</Link>
          </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="mb-4 text-5xl font-bold text-balance text-gray-900">Endulza tus momentos especiales</h2>
        <p className="mx-auto mb-8 max-w-2xl text-lg text-gray-600 text-pretty">
          Pasteles y galletas artesanales hechos con amor. Personaliza tu pedido y recíbelo en la fecha que necesites.
        </p>
        <div className="flex justify-center gap-4">
          <Button asChild size="lg" className="text-lg">
            <Link href="/handler/sign-up?callbackUrl=/cliente">Hacer un Pedido</Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="text-lg bg-transparent">
            <Link href="/handler/sign-in?callbackUrl=%2Fcliente">Ya tengo cuenta</Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid gap-6 md:grid-cols-3">
          <Card className="border-pink-100">
            <CardHeader>
              <Cake className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Pasteles Personalizados</CardTitle>
              <CardDescription>
                Elige el sabor del pan, relleno y el tamaño perfecto para tu celebración
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-pink-100">
            <CardHeader>
              <Cookie className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Galletas Artesanales</CardTitle>
              <CardDescription>
                Galletas frescas en diferentes sabores, perfectas para cualquier ocasión
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-pink-100">
            <CardHeader>
              <ShoppingBag className="mb-2 h-12 w-12 text-primary" />
              <CardTitle>Seguimiento de Pedidos</CardTitle>
              <CardDescription>Rastrea el estado de tus pedidos en tiempo real desde tu dashboard</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="mb-4 text-3xl font-bold">¿Eres administrador?</h3>
          <p className="mb-6 text-pink-100">Accede al panel de administración para gestionar todos los pedidos</p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/handler/sign-in">Acceso Administrador</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pink-100 bg-white py-8">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>&copy; 2025 SweetOrders. Endulzando tus momentos especiales.</p>
        </div>
      </footer>
    </div>
  )
}