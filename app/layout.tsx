// app/layout.tsx
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

export default function RootLayout({ children }: { children: ReactNode }) {
  // Idealmente, puedes obtener el usuario inicial desde SSR para hidratar el contexto
  // Pero si solo usas cliente, lo puedes dejar así
  return (
    <html lang="es">
      <body>
        <TooltipProvider>
          <AuthProvider initialUser={null}>
            {children}
            
          </AuthProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}