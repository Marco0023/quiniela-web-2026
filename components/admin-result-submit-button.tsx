"use client";

import { useFormStatus } from "react-dom";

export function AdminResultSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="min-h-11 rounded-md bg-gold px-4 font-black text-pitch transition hover:bg-white disabled:cursor-wait disabled:opacity-70 md:col-span-6"
      disabled={pending}
      type="submit"
    >
      {pending ? "Resultado guardado, calculando puntos..." : "Guardar resultado"}
    </button>
  );
}
