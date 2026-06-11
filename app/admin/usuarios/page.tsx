import { AppShell } from "@/components/app-shell";
import { KeyRound } from "lucide-react";
import { Badge, Card, inputClass, SectionHeader } from "@/components/ui";
import { resetUserPassword } from "@/lib/admin/users-actions";
import { getAdminUsersData } from "@/lib/repository";

export default async function AdminUsersPage({
  searchParams
}: {
  searchParams: Promise<{ error?: string; passwordUpdated?: string }>;
}) {
  const status = await searchParams;
  const data = await getAdminUsersData();

  return (
    <AppShell showAdmin>
      <SectionHeader eyebrow="Admin" title="Usuarios" />
      {status.error ? (
        <p className="mb-4 rounded-md bg-red-500/12 px-3 py-2 text-sm text-red-100">{status.error}</p>
      ) : null}
      {status.passwordUpdated ? (
        <p className="mb-4 rounded-md bg-emeraldGlow/12 px-3 py-2 text-sm text-emeraldGlow">
          Contraseña actualizada para {status.passwordUpdated}.
        </p>
      ) : null}
      <Card className="overflow-hidden p-0">
        {data.users.length === 0 ? (
          <p className="px-4 py-5 text-sm text-white/55">Todavía no hay usuarios registrados.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th className="px-4 py-3">Alias</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Horario</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Contraseña</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {data.users.map((profile) => (
                <tr key={profile.id}>
                  <td className="px-4 py-3 font-bold">{profile.alias}</td>
                  <td className="px-4 py-3 text-white/70">{profile.firstName} {profile.lastName}</td>
                  <td className="px-4 py-3 text-white/70">{profile.email}</td>
                  <td className="px-4 py-3 text-white/70">
                    {data.groups.find((group) => group.id === profile.groupId)?.name ?? "Sin grupo"}
                  </td>
                  <td className="px-4 py-3 text-white/70">{profile.timezoneCountry}</td>
                  <td className="px-4 py-3">
                    <Badge tone={profile.role === "admin" ? "gold" : "neutral"}>{profile.role}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <form action={resetUserPassword} className="flex min-w-72 items-center gap-2">
                      <input name="userId" type="hidden" value={profile.id} />
                      <input
                        autoComplete="new-password"
                        className={inputClass}
                        minLength={6}
                        name="password"
                        placeholder="Nueva contraseña"
                        required
                        type="password"
                      />
                      <button
                        className="inline-flex min-h-11 items-center gap-2 rounded-md bg-gold px-3 font-black text-pitch transition hover:bg-white"
                        type="submit"
                      >
                        <KeyRound className="size-4" />
                        Cambiar
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        )}
      </Card>
    </AppShell>
  );
}
