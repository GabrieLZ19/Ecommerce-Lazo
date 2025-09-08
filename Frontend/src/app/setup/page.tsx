"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ExternalLink, Copy } from "lucide-react";
import { useState } from "react";

export default function SetupPage() {
  const [copied, setCopied] = useState(false);

  const envTemplate = `# Environment variables for Frontend Development
# Replace with your actual Supabase credentials

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# MercadoPago Configuration  
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=your_mercadopago_public_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# API Backend URL
NEXT_PUBLIC_API_URL=http://localhost:8000/api`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <AlertTriangle className="h-8 w-8 text-yellow-500" />
        <h1 className="text-3xl font-bold">Configuración Requerida</h1>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span>1. Configurar Variables de Entorno</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Para que LAZO funcione correctamente, necesitas configurar las
              variables de entorno en el archivo{" "}
              <code className="bg-muted px-2 py-1 rounded">.env.local</code>
            </p>

            <div className="bg-muted p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">
                  Template .env.local:
                </span>
                <Button variant="outline" size="sm" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4 mr-1" />
                  {copied ? "¡Copiado!" : "Copiar"}
                </Button>
              </div>
              <pre className="text-sm overflow-x-auto whitespace-pre-wrap">
                {envTemplate}
              </pre>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Obtener Credenciales de Supabase</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-muted-foreground">
                Sigue estos pasos para obtener tus credenciales de Supabase:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  Ve a{" "}
                  <a
                    href="https://supabase.com"
                    target="_blank"
                    className="text-primary hover:underline"
                  >
                    supabase.com
                  </a>{" "}
                  y crea una cuenta
                </li>
                <li>Crea un nuevo proyecto</li>
                <li>En el dashboard, ve a Settings → API</li>
                <li>Copia la URL del proyecto y la clave anon pública</li>
                <li>Pégalas en tu archivo .env.local</li>
              </ol>
              <Button asChild variant="outline">
                <a
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ir a Supabase
                </a>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Configurar Base de Datos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Una vez que tengas tu proyecto de Supabase, ejecuta las
              migraciones de la base de datos:
            </p>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm font-medium mb-2">
                SQL a ejecutar en Supabase:
              </p>
              <p className="text-sm text-muted-foreground">
                Ve al editor SQL en tu dashboard de Supabase y ejecuta el
                archivo:{" "}
                <code>Backend/supabase/migrations/001_initial_schema.sql</code>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. MercadoPago (Opcional para desarrollo)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Para pagos, necesitarás credenciales de MercadoPago. Por ahora
              puedes usar una clave de prueba o dejar el valor por defecto.
            </p>
            <Button asChild variant="outline">
              <a
                href="https://developers.mercadopago.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ir a MercadoPago Developers
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <p className="text-sm text-green-800">
              <strong>💡 Tip:</strong> Una vez configuradas las variables de
              entorno, reinicia el servidor de desarrollo con{" "}
              <code>npm run dev</code> para que los cambios surtan efecto.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
