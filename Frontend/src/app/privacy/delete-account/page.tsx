"use client";

export default function DeleteAccountPage() {
  return (
    <main className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">
        Solicitud de eliminación de datos
      </h1>

      <p className="mb-4">
        Si deseas solicitar la eliminación de tus datos personales asociados a
        esta aplicación, envía un correo a{" "}
        <strong>gabriellazo48@gmail.com</strong> con la siguiente información:
      </p>

      <ul className="list-disc ml-6 mb-4">
        <li>Asunto: Solicitud de eliminación de datos</li>
        <li>Dirección de email usada para registrarte</li>
        <li>Opcional: ID de usuario (si la conoces)</li>
      </ul>

      <p className="mb-4">
        Responderemos confirmando la eliminación y procederemos a borrar tus
        datos en un plazo razonable.
      </p>

      <p className="text-sm text-muted-foreground">
        Nota: esta es una página de instrucciones. Si prefieres un borrado
        automático desde Facebook, puedo implementar el Data Deletion Callback
        (un endpoint que Facebook llama y que confirma la eliminación).
      </p>
    </main>
  );
}
