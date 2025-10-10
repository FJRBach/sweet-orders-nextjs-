// app/cliente/page.tsx
import { getUserSession } from "@/lib/auth";
import { ClientDashboard } from "@/components/client-dashboard";
import { notFound } from "next/navigation";

export default async function ClientePage() {
  // El middleware ya garantizó que el usuario es un cliente.
  const user = await getUserSession();

  if (!user) {
    notFound();
  }
  
  return <ClientDashboard user={user} />;
}