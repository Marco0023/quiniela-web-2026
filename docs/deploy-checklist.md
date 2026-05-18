# Checklist de Deploy

## Antes de GitHub

- Ejecutar `npm.cmd run lint`.
- Ejecutar `npm.cmd run typecheck`.
- Ejecutar `npm.cmd run build`.
- Confirmar que `.env.local` no se sube al repositorio.
- Confirmar que `.env.example` tiene solo nombres de variables, sin secretos.

## GitHub

1. Crear repositorio privado o publico.
2. Inicializar git local si hace falta:

```bash
git init
git add .
git commit -m "Initial MVP for Quiniela Mundial 2026"
git branch -M main
git remote add origin URL_DEL_REPO
git push -u origin main
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
FOOTBALL_API_KEY
CRON_SECRET
```

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
- Si la tabla ya existia, ejecutar migraciones puntuales indicadas en la conversacion.

