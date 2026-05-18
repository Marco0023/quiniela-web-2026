import Link from "next/link";
import { Trophy } from "lucide-react";
import { Field, inputClass } from "@/components/ui";
import { login } from "@/lib/auth/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glow backdrop-blur">
        <div className="mb-6 flex items-center gap-3">
          <div className="grid size-12 place-items-center rounded-md bg-gold text-pitch">
            <Trophy className="size-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Acceso privado</p>
            <h1 className="text-2xl font-black">Quiniela Mundial 2026</h1>
          </div>
        </div>
        {error ? (
          <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{error}</p>
        ) : null}
        <form action={login} className="grid gap-4">
          <Field label="Correo">
            <input className={inputClass} name="email" placeholder="correo@dominio.com" required type="email" />
          </Field>
          <Field label="Contrasena">
            <input className={inputClass} name="password" placeholder="Tu contrasena" required type="password" />
          </Field>
          <button className="min-h-12 rounded-md bg-gold font-black text-pitch transition hover:bg-white" type="submit">
            Iniciar sesion
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-white/55">
          No tienes cuenta?{" "}
          <Link className="font-bold text-gold" href="/registro">
            Registrate
          </Link>
        </p>
      </section>
    </main>
  );
}
