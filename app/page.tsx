// app/page.tsx
import { getUserSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LandingPage from "@/components/landing";
import { cookies } from "next/headers";

export default async function HomePage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  
  console.log('🏠 LANDING PAGE - Cookies:', allCookies.map(c => ({ name: c.name, hasValue: !!c.value })));

  // 🔹 Detectar si acaba de hacer sign-in (tiene stack-access pero no token)
  const stackAccess = cookieStore.get('stack-access')?.value;
  const token = cookieStore.get('token')?.value;

  if (stackAccess && !token) {
    console.log('🎯 Sign-in detectado en landing, redirigiendo a callback...');
    const authCallbackUrl = cookieStore.get('auth-callback-url')?.value;
    const callbackUrl = authCallbackUrl ? `/api/auth/callback?callbackUrl=${authCallbackUrl}` : '/api/auth/callback';
    redirect(callbackUrl);
  }

  const user = await getUserSession();
  
  console.log('🏠 LANDING PAGE - Usuario:', user ? { id: user.id, rol: user.rol } : 'No autenticado');

  if (user?.rol === "admin") {
    console.log('➡️ Redirigiendo admin a /admin');
    redirect("/admin");
  }
  if (user?.rol === "cliente") {
    console.log('➡️ Redirigiendo cliente a /cliente');
    redirect("/cliente");
  }

  console.log('🏠 Mostrando landing page pública');
  return <LandingPage />;
}