import React, { ReactNode } from "react";
import "./globals.css";
import { TooltipProvider } from '@/components/ui/tooltip';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>
        <TooltipProvider>
          {children}
        </TooltipProvider>
      </body>
    </html>
  );
}