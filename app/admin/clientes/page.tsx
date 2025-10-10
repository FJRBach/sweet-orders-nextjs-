// app/admin/clientes/page.tsx
import { redirect } from 'next/navigation';
import { getAdminUser } from '@/lib/auth';
import { AdminClientsDashboard } from '@/components/admin-clients-dashboard'; 
import { Cake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Componente principal de la página (Server Component)
export default async function AdminClientsPage() {
  // Asegúrate de que esta función verifica la sesión y el rol 'admin'
  const user = await getAdminUser(); 

  if (!user) {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-white">
      {/* Header */}
      <header className="border-b border-pink-100 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <Cake className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-2xl font-bold text-primary">SweetOrders</h1>
              <p className="text-xs text-gray-600">Gestión de Clientes</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              <span className="font-semibold text-gray-900">{user.nombre}</span> (Admin)
            </span>
            <Button asChild variant="outline" size="sm">
                <Link href="/admin">
                    Volver al Dashboard
                </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">Directorio de Clientes</h2>
          <p className="text-gray-600">Visualiza y gestiona los perfiles de los clientes registrados.</p>
        </div>

        {/* Dashboard de Clientes (Client Component) */}
        <AdminClientsDashboard user={user} />
      </div>
    </div>
  );
}