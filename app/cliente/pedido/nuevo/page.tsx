// app/cliente/pedido/nuevo/page.tsx
import { getUserSession } from "@/lib/auth";
import { executeQuery } from "@/lib/db";
import { redirect } from "next/navigation";
import { NewOrderForm } from "@/components/new-order-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cake, Cookie } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";


interface Sabor {
  id: number;
  nombre: string;
  categoria: 'pan' | 'relleno' | 'galleta' | 'general';
}

// Componente para la pantalla de selección
function ProductSelection() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear Nuevo Pedido</CardTitle>
        <CardDescription>Selecciona el tipo de producto que deseas ordenar:</CardDescription>
      </CardHeader>
      <div className="p-6 pt-0 grid gap-4 md:grid-cols-2">
        <Button asChild size="lg" className="h-auto flex-col gap-2 py-6">
          <Link href="/cliente/pedido/nuevo?tipo=pastel">
            <Cake className="h-8 w-8" />
            <span className="text-lg">Pastel Personalizado</span>
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="h-auto flex-col gap-2 py-6 bg-transparent">
          <Link href="/cliente/pedido/nuevo?tipo=galletas">
            <Cookie className="h-8 w-8" />
            <span className="text-lg">Galletas Artesanales</span>
          </Link>
        </Button>
      </div>
    </Card>
  );
}

export default async function NewOrderPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const user = await getUserSession();
  if (!user) {
    redirect("/handler/sign-in");
  }

  const tipo = searchParams.tipo;

  // Si no se ha seleccionado un tipo, mostramos la pantalla de selección
  if (tipo !== "pastel" && tipo !== "galletas") {
    return (
        <div className="mx-auto max-w-2xl">
            <ProductSelection />
        </div>
    );
  }

  // Si ya se seleccionó un tipo, cargamos los datos y mostramos el formulario
  const sabores = await executeQuery("SELECT id, nombre, categoria FROM sabores WHERE disponible = TRUE", []) as Sabor[];
  const saboresPan = sabores.filter(s => s.categoria === 'pan');
  const saboresRelleno = sabores.filter(s => s.categoria === 'relleno');
  const saboresGalleta = sabores.filter(s => s.categoria === 'galleta');

  return (
    <div className="mx-auto max-w-2xl">
      <NewOrderForm
        tipo={tipo}
        userId={user.id}
        saboresPan={saboresPan}
        saboresRelleno={saboresRelleno}
        saboresGalleta={saboresGalleta}
      />
    </div>
  );
}