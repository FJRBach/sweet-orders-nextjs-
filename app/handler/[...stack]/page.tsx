// app/handler/[...stack]/page.tsx
import "server-only";
import { StackHandler, StackProvider } from "@stackframe/stack";
import { stackServerApp } from "@/stack/server";
import { TooltipProvider } from "@/components/ui/tooltip";

export default function StackHandlerPage(props: any) {
  return (
    <TooltipProvider>
      <StackProvider app={stackServerApp} lang="es-ES">
        <StackHandler 
          fullPage 
          app={stackServerApp} 
          routeProps={props}
        />
      </StackProvider>
    </TooltipProvider>
  );
}