# Quiniela Mundial 2026

Aplicacion web privada para predicciones familiares y de amigos durante el Mundial masculino 2026.

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

El MVP visual usa datos mock en `lib/mock-data.ts` para poder avanzar la UI antes de conectar el proyecto real de Supabase.

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

La ruta reservada para sincronizar equipos, partidos y resultados es:

```text
POST /api/sync
```

Por ahora usa un proveedor mock. La interfaz esta en `lib/football-api/provider.ts`.
