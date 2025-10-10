"use client";
import { StackProvider } from "@stackframe/stack";
import { stackClientApp } from "@/stack/client";

export default function ClienteLayoutProvider({ children }: { children: React.ReactNode }) {
  return (
    <StackProvider app={stackClientApp} lang="es-ES">
      {children}
    </StackProvider>
  );
}