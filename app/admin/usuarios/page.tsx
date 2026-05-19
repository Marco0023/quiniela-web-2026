import { AppShell } from "@/components/app-shell";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { getAdminUsersData } from "@/lib/repository";

export default async function AdminUsersPage() {
  const data = await getAdminUsersData();

  return (
    <AppShell showAdmin>
      <SectionHeader eyebrow="Admin" title="Usuarios" />
      <Card className="overflow-hidden p-0">
        {data.users.length === 0 ? (
          <p className="px-4 py-5 text-sm text-white/55">Todavía no hay usuarios registrados.</p>
        ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-white/5 text-xs uppercase tracking-[0.18em] text-white/45">
              <tr>
                <th className="px-4 py-3">Alias</th>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Correo</th>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Horario</th>
                <th className="px-4 py-3">Rol</th>
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
