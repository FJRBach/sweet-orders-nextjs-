// app/cliente/layout.tsx
"use client";
import ClienteLayoutProvider from "./layout-provider";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { NavLink } from '../../components/NavLink';
import { LayoutDashboard, ShoppingBag, Package, LogOut, Cake } from 'lucide-react';


function ClientLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUser();

  const handleLogout = async () => {
    try {
      // Si usas una librería de cliente como stackframe, primero cierra su sesión
      if (user) {
        await user.signOut();
      }
      
      // Llama a nuestra API para limpiar la cookie del servidor
      await fetch('/api/auth/logout', { method: 'POST' });

    } catch (error) {
      console.error("Failed to logout:", error);
    } finally {
      // La redirección y el refresh ocurren siempre, incluso si el fetch falla
      // para asegurar que el usuario salga de la vista protegida.
      router.push('/handler/sign-in');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-brand-100 p-2 rounded-lg">
            <Cake size={32} className="text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">SweetOrders</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavLink href="/cliente">
            <Package size={18} />
            <span>Mis pedidos</span>
          </NavLink>
          <NavLink href="/cliente/pedido/nuevo">
            <ShoppingBag size={18} />
            <span>Realizar pedido</span>
          </NavLink>
        </nav>
        
        <div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2 rounded-md text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>
      
      <main className="flex-1 p-6">
        {children}
      </main>
    </div>
  );
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClienteLayoutProvider>
      <ClientLayoutContent>{children}</ClientLayoutContent>
    </ClienteLayoutProvider>
  );
}