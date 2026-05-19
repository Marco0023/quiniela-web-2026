import Image from "next/image";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, SectionHeader } from "@/components/ui";
import { selectChampion } from "@/lib/auth/actions";
import { getChampionSelectionData } from "@/lib/repository";

export default async function ChampionPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const data = await getChampionSelectionData();

  if (data.champion) {
    redirect("/dashboard");
  }

  return (
    <AppShell showAdmin={data.profile.role === "admin"}>
      <SectionHeader eyebrow="Obligatorio" title="Elige tu campeón" />
      <p className="mb-5 max-w-2xl text-sm leading-6 text-white/62">
        Esta seleccion se guarda una sola vez y no podra modificarse.
      </p>
      {error ? (
        <p className="mb-5 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{error}</p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-3">
        {data.teams.map((team) => (
          <Card key={team.id} className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <Image src={team.flagUrl} alt="" width={36} height={24} className="h-6 w-9 rounded-sm object-cover" />
              <span className="truncate font-black">{team.name}</span>
            </div>
            <form action={selectChampion}>
              <input name="teamId" type="hidden" value={team.id} />
              <button className="rounded-md bg-gold px-3 py-2 text-sm font-black text-pitch" type="submit">
                Elegir
              </button>
            </form>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
