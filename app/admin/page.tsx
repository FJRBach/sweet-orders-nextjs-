// app/admin/page.tsx
import { getUserSession } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin-dashboard";
import { notFound } from "next/navigation";

export default async function AdminDashboardPage() {
  // El middleware ya garantizó que el usuario es un admin.
  // Solo llamamos a getUserSession para obtener los datos frescos del usuario.
  const user = await getUserSession();

  // Si por alguna razón extrema el usuario no se encuentra en la BD, mostramos 404.
  if (!user) {
    notFound();
  }

  return <AdminDashboard user={user} />;
}