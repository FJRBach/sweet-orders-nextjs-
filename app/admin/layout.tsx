// app/admin/layout.tsx
"use client";
import AdminLayoutProvider from "./layout-provider";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@stackframe/stack';
import { NavLink } from '../../components/NavLink';
import { LayoutDashboard, Package, Users, LogOut, Cake } from 'lucide-react';

// Componente interno para el contenido del layout
function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const user = useUser();

  // La lógica para cerrar sesión es la misma
  const handleLogout = async () => {
    if (user) {
      await user.signOut();
    }
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/handler/sign-in');
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
        {/* Encabezado de la marca */}
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-brand-100 p-2 rounded-lg">
            <Cake size={32} className="text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">SweetOrders Admin</h1>
        </div>

        {/* Navegación específica para el Administrador */}
        <nav className="flex flex-col gap-2 flex-1">
          <NavLink href="/admin">
            <Package size={18} />
            <span>Gestionar Pedidos</span>
          </NavLink>
          <NavLink href="/admin/clientes">
            <Users size={18} />
            <span>Clientes</span>
          </NavLink>
        </nav>
        
        {/* Botón para cerrar sesión */}
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

// Componente principal que exportas
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminLayoutProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </AdminLayoutProvider>
  );
}