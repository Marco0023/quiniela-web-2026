# Quiniela Mundial 2026

Aplicacion web privada para predicciones familiares y de amigos durante el Mundial masculino 2026.

## Estado actual

El flujo principal ya fue probado en Vercel: registro, login, seleccion de campeon, predicciones, admin de resultados, ranking e historial.

Pendiente conocido antes del torneo:

- Activar el boton de sincronizacion desde el panel admin cuando ya convenga traer datos reales.
- Confirmar en Vercel las variables de entorno del proveedor real si se usa `football-data`.
- Mantener resultados manuales mientras el calendario/torneo no este activo.

## Stack

- Next.js
- React
- Tailwind CSS
- Supabase Auth
- PostgreSQL
- Vercel

## Inicio local

1. Instala dependencias:

```bash
npm install
```

2. Copia variables:

```bash
cp .env.example .env.local
```

3. Ejecuta el proyecto:

```bash
npm run dev
```

4. Abre `http://localhost:3000`.

## Supabase

El esquema inicial esta en:

```text
supabase/schema.sql
```

Datos demo de equipos y partidos:

```text
supabase/seed-demo.sql
```

La app usa Supabase cuando las variables de entorno estan configuradas. Si faltan variables o datos reales, algunas vistas pueden apoyarse en `lib/mock-data.ts` como fallback local/demo.

## Rutas principales

- `/login`
- `/registro`
- `/dashboard`
- `/partidos`
- `/ranking`
- `/historial`
- `/campeon`
- `/admin`

## Sincronizacion

La ruta para sincronizar equipos, partidos y resultados es:

```text
POST /api/sync
```

La interfaz esta en `lib/football-api/provider.ts` e incluye:

- `mock`: proveedor demo/local.
- `football-data`: proveedor real usando `FOOTBALL_DATA_API_TOKEN`.

El boton del panel admin esta pausado hasta acercarnos al torneo; los resultados pueden cargarse manualmente desde `/admin/resultados`.
