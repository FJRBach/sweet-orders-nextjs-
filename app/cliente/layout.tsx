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
        <div className="flex items-center gap-2 mb-8">
          <div className="bg-brand-100 p-2 rounded-lg">
            <Cake size={32} className="text-brand-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-800">SweetOrders</h1>
        </div>

        <nav className="flex flex-col gap-2 flex-1">
          <NavLink href="/cliente" end>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </NavLink>
          <NavLink href="/cliente/nuevo-pedido">
            <ShoppingBag size={18} />
            <span>Realizar pedido</span>
          </NavLink>
          <NavLink href="/cliente/mis-pedidos">
            <Package size={18} />
            <span>Mis pedidos</span>
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