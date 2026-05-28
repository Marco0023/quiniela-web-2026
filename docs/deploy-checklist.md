# Checklist de Deploy

## Antes de GitHub

- Ejecutar `npm.cmd run lint`.
- Ejecutar `npm.cmd run typecheck`.
- Ejecutar `npm.cmd run build`.
- Confirmar que `.env.local` no se sube al repositorio.
- Confirmar que `.env.example` tiene solo nombres de variables, sin secretos.
- Confirmar que no quedan cambios locales sin commit antes de desplegar.

## GitHub

1. Confirmar que el repositorio remoto esta conectado.
2. Subir los ultimos commits:

```bash
git status
git push
```

## Vercel

1. Importar el repositorio desde GitHub.
2. Configurar framework: Next.js.
3. Agregar variables de entorno:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
FOOTBALL_API_PROVIDER=mock
FOOTBALL_DATA_API_TOKEN
FOOTBALL_DATA_API_BASE_URL=https://api.football-data.org/v4
FOOTBALL_DATA_COMPETITION=WC
FOOTBALL_DATA_SEASON=2026
CRON_SECRET
```

Notas:

- Para mantener la sincronizacion pausada antes del torneo, usar `FOOTBALL_API_PROVIDER=mock` o dejar el boton admin deshabilitado.
- Para activar datos reales, usar `FOOTBALL_API_PROVIDER=football-data` y configurar `FOOTBALL_DATA_API_TOKEN`.
- El boton admin de sincronizacion esta pausado por ahora; los resultados se pueden guardar manualmente desde `/admin/resultados`.

4. Deploy.
5. Probar:
   - Registro.
   - Login.
   - Seleccion de campeon.
   - Prediccion.
   - Admin resultados.
   - Ranking.

## Supabase

- Confirmar que email confirmation esta desactivado.
- Ejecutar `supabase/schema.sql`.
- Ejecutar `supabase/seed-demo.sql`.
- Si la tabla ya existia, ejecutar migraciones puntuales indicadas en la conversacion:
  - `supabase/classification-predictions.sql`
  - `supabase/ranking-snapshots.sql`
  - `supabase/football-data-groups.sql`
- Confirmar que existe la cuenta admin y que los codigos de grupo funcionan.
