import Image from "next/image";
import Link from "next/link";
import {
  LockKeyhole,
  ShieldCheck,
  Smartphone,
  Target,
  Trophy,
  UserRound,
  UsersRound
} from "lucide-react";
import { Field, inputClass } from "@/components/ui";
import { login } from "@/lib/auth/actions";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#020817] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(53,129,255,0.24),transparent_32rem),radial-gradient(circle_at_86%_20%,rgba(0,194,255,0.16),transparent_28rem),linear-gradient(135deg,#020817_0%,#041a3d_52%,#061126_100%)]" />
      <div className="login-light left-[8%] top-[4%]" />
      <div className="login-light right-[6%] top-[8%]" />
      <div className="login-light bottom-[10%] left-[36%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,8,23,0.34)_1px,transparent_1px),linear-gradient(0deg,rgba(2,8,23,0.34)_1px,transparent_1px)] bg-[size:72px_72px] opacity-25" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-[#061b15] via-[#03142f]/40 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl flex-col px-5 py-6 md:px-10">
        <header className="flex items-center justify-between">
          <Link href="/login" className="flex items-center gap-3">
            <div className="grid size-14 place-items-center rounded-2xl bg-white text-[#03142f] shadow-[0_0_30px_rgba(255,255,255,0.18)]">
              <Trophy className="size-8 text-[#d8a939]" />
            </div>
            <div className="leading-tight">
              <p className="text-2xl font-black tracking-tight">QUINIELA</p>
              <p className="text-lg font-semibold text-white/88">
                MUNDIAL <span className="text-[#80d35a]">2026</span>
              </p>
            </div>
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_0.88fr]">
          <div className="relative min-h-[680px] overflow-hidden lg:min-h-[620px]">
            <div className="pointer-events-none absolute -left-10 top-8 text-[12rem] font-black leading-none text-white/[0.035] md:text-[18rem]">
              26
            </div>
            <div className="relative z-10 max-w-2xl pt-10 md:pt-16">
              <span className="inline-flex rounded-md bg-[#80d35a]/15 px-3 py-1 text-sm font-black uppercase tracking-wide text-[#8fe56d]">
                Vive la pasión
              </span>
              <h1 className="mt-5 text-5xl font-black leading-[0.95] tracking-tight text-white md:text-7xl lg:max-w-xl">
                Acierta. Compite.
                <span className="block text-[#80d35a]">Gana.</span>
              </h1>
              <p className="mt-7 max-w-lg text-lg leading-8 text-white/82">
                Únete a la quiniela del Mundial 2026 y demuestra quién sabe más de fútbol.
              </p>

              <div className="mt-10 grid max-w-lg gap-6 rounded-lg border border-white/10 bg-[#020817]/45 p-4 backdrop-blur-sm md:p-5">
                <Feature
                  icon={UsersRound}
                  title="Compite por el primer lugar"
                  body="Demuestra tu nivel y sube en el ranking del grupo."
                />
                <Feature icon={Target} title="Haz tus predicciones" body="Suma puntos y sube posiciones." />
                <Feature icon={Trophy} title="Sé el campeón" body="El primero en la tabla será legendario." />
              </div>
            </div>

            <Image
              src="/images/trophy-hero.png"
              alt="Copa dorada estilizada"
              width={760}
              height={760}
              priority
              className="pointer-events-none absolute -bottom-20 -right-16 z-0 w-[18rem] max-w-none rotate-[6deg] opacity-95 drop-shadow-[0_30px_80px_rgba(216,169,57,0.32)] md:w-[24rem] lg:-bottom-28 lg:right-4 lg:w-[27rem] xl:right-16"
            />
          </div>

          <section className="rounded-lg border border-white/15 bg-[#081629]/80 p-5 shadow-[0_30px_120px_rgba(0,0,0,0.38)] backdrop-blur-xl md:p-10">
            <div className="mx-auto mb-7 grid size-16 place-items-center rounded-full border border-[#80d35a] text-[#80d35a]">
              <UserRound className="size-8" />
            </div>
            <div className="mb-7 text-center">
              <h2 className="text-3xl font-black">Bienvenido/a de nuevo</h2>
              <p className="mt-2 text-white/70">Ingresa a tu cuenta para continuar</p>
            </div>
            {error ? (
              <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{error}</p>
            ) : null}
            <form action={login} className="grid gap-4">
              <Field label="Correo electrónico">
                <input className={inputClass} name="email" placeholder="Ingresa tu correo" required type="email" />
              </Field>
              <Field label="Contraseña">
                <input
                  className={inputClass}
                  name="password"
                  placeholder="Ingresa tu contraseña"
                  required
                  type="password"
                />
              </Field>
              <label className="mt-1 flex items-center gap-2 text-sm text-white/78">
                <input checked readOnly className="size-4 accent-[#80d35a]" type="checkbox" />
                Mantener sesión iniciada
              </label>
              <p className="text-xs leading-5 text-white/45">
                Tu sesión se mantiene activa automáticamente en este navegador mientras no cierres sesión.
              </p>
              <button
                className="mt-2 min-h-14 rounded-md bg-[#80d35a] font-black text-[#03142f] transition hover:bg-white"
                type="submit"
              >
                Iniciar sesión
              </button>
            </form>
            <p className="mt-7 text-center text-sm text-white/62">
              ¿No tienes cuenta?{" "}
              <Link className="font-bold text-[#8fe56d]" href="/registro">
                Regístrate aquí
              </Link>
            </p>
          </section>
        </section>

        <footer className="grid gap-5 border-t border-white/10 py-7 text-center md:grid-cols-4">
          <FooterItem icon={LockKeyhole} title="100% privado" body="Solo personas con el código pueden unirse." />
          <FooterItem icon={ShieldCheck} title="Seguro y confiable" body="Tus datos están protegidos en todo momento." />
          <FooterItem icon={Target} title="Resultados al día" body="Ranking y puntos siempre claros." />
          <FooterItem
            icon={Smartphone}
            title="Diseñado para todos"
            body="Disfruta la quiniela desde tu celular o computadora."
          />
        </footer>
        <p className="pb-5 text-center text-xs text-white/42">
          Quiniela Mundial 2026. Este sitio no está afiliado con FIFA.
        </p>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  title,
  body
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-[3rem_1fr] gap-4">
      <div className="grid size-11 place-items-center rounded-md bg-[#80d35a]/12 text-[#80d35a]">
        <Icon className="size-7" />
      </div>
      <div>
        <p className="font-black">{title}</p>
        <p className="mt-1 text-sm text-white/62">{body}</p>
      </div>
    </div>
  );
}

function FooterItem({
  icon: Icon,
  title,
  body
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="px-4 md:border-r md:border-white/10 md:last:border-r-0">
      <Icon className="mx-auto mb-3 size-7 text-[#80d35a]" />
      <p className="font-bold">{title}</p>
      <p className="mx-auto mt-2 max-w-48 text-sm leading-5 text-white/50">{body}</p>
    </div>
  );
}
