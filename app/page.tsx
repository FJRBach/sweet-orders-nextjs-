// app/page.tsx
import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirige directamente a la página de login
  redirect('/handler/sign-in');
  
  // No es necesario retornar nada ya que la redirección ocurre en el servidor
  return null;
}