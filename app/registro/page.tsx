import Link from "next/link";
import { TIMEZONE_OPTIONS } from "@/lib/constants";
import { Field, inputClass } from "@/components/ui";
import { register } from "@/lib/auth/actions";

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto grid min-h-screen w-full max-w-2xl place-items-center px-4 py-10">
      <section className="w-full rounded-lg border border-white/10 bg-white/[0.06] p-5 shadow-glow backdrop-blur">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold">Registro</p>
        <h1 className="mt-2 text-3xl font-black">Crea tu usuario</h1>
        {error ? (
          <p className="mt-5 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{error}</p>
        ) : null}
        <form action={register} className="mt-6 grid gap-4 md:grid-cols-2">
          <Field label="Nombre">
            <input className={inputClass} name="firstName" required />
          </Field>
          <Field label="Apellido">
            <input className={inputClass} name="lastName" required />
          </Field>
          <Field label="Alias único">
            <input className={inputClass} name="alias" required />
          </Field>
          <Field label="Correo">
            <input className={inputClass} name="email" required type="email" />
          </Field>
          <Field label="Contraseña">
            <input className={inputClass} name="password" required type="password" />
          </Field>
          <Field label="País para horario">
            <select className={inputClass} defaultValue="Colombia" name="timezoneCountry" required>
              {TIMEZONE_OPTIONS.map((option) => (
                <option key={option.country} value={option.country}>
                  {option.country}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Código secreto">
              <input className={inputClass} name="inviteCode" placeholder="Ingresa tu código de invitación" required />
            </Field>
          </div>
          <button
            className="min-h-12 rounded-md bg-gold font-black text-pitch transition hover:bg-white md:col-span-2"
            type="submit"
          >
            Crear cuenta
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-white/55">
          ¿Ya tienes cuenta?{" "}
          <Link className="font-bold text-gold" href="/login">
            Inicia sesión
          </Link>
        </p>
      </section>
    </main>
  );
}
