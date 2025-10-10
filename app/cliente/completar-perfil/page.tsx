"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle } from "lucide-react";

export default function CompletarPerfilPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ apellidos: "", telefono: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch('/api/user/update-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "No se pudo actualizar el perfil.");
      }

      // LA CORRECCIÓN:
      // Reemplazamos router.push por window.location.href para forzar
      // una recarga completa de la página y evitar problemas de caché.
      window.location.href = '/cliente';

    } catch (err: any) {
      setError(err.message);
      // Nos aseguramos de detener la carga si hay un error.
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Completa tu Perfil</CardTitle>
          <CardDescription>Necesitamos unos datos más para terminar de configurar tu cuenta.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            <div className="space-y-2">
              <Label htmlFor="apellidos">Apellidos</Label>
              <Input id="apellidos" name="apellidos" value={formData.apellidos} onChange={handleChange} disabled={loading} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telefono">Teléfono</Label>
              <Input id="telefono" name="telefono" type="tel" value={formData.telefono} onChange={handleChange} disabled={loading} />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Guardar y Continuar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}