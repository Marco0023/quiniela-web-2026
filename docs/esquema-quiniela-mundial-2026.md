# Esquema del Proyecto: Quiniela Mundial 2026

## 1. Vision general

**Quiniela Mundial 2026** sera una aplicacion web privada, mobile-first, gratuita y moderna para que familiares y amigos hagan predicciones durante el Mundial masculino 2026.

La aplicacion no sera de apuestas, no manejara dinero, cuotas, premios ni lenguaje asociado a apuestas. Todo el producto debe usar lenguaje de predicciones, puntos, posiciones y juego familiar.

El objetivo del MVP es tener una plataforma funcional y profesional que sirva como pieza de portafolio:

- Registro e inicio de sesion.
- Asignacion automatica de grupo por codigo secreto.
- Seleccion obligatoria de campeon.
- Predicciones por partido.
- Ranking independiente por grupo.
- Historial de predicciones.
- Dashboard responsive.
- Panel administrador.
- Sincronizacion automatica y manual con una API de futbol.
- Base de datos en Supabase/PostgreSQL.
- Deploy publico en Vercel.

## 2. Stack tecnologico

### Frontend

- Next.js.
- React.
- Tailwind CSS.
- Componentes reutilizables.
- UI mobile-first y responsive.

### Backend

- Supabase.
- Supabase Auth con correo y contrasena.
- Supabase Database con PostgreSQL.
- Supabase Row Level Security.
- Next.js Route Handlers / Server Actions para logica sensible.

### Hosting y repositorio

- Vercel para hosting.
- GitHub para repositorio.

### Integracion externa

- Capa generica `FootballApiProvider`.
- Proveedor concreto a definir despues.
- API como fuente principal para equipos, partidos, horarios, resultados, estados y banderas.
- Base local editable por admin como respaldo si la API falla.

## 3. Idioma, tono y formato

- Toda la aplicacion estara en espanol.
- No usar palabras relacionadas con apuestas.
- Horarios en formato de 12 horas con am/pm.
- Horarios guardados en UTC y convertidos segun el pais horario del usuario.

## 4. Grupos fijos

Para el MVP existiran exactamente 3 grupos fijos:

| Grupo | Nombre | Codigo secreto |
| --- | --- | --- |
| 1 | Familia Marquez | `FM26` |
| 2 | Familia Nuñez Quiñones | `PANTALONES26` |
| 3 | Mondaquera Bochinche | `MANCOS26` |

Reglas:

- Un usuario pertenece a un solo grupo.
- El grupo se asigna automaticamente durante el registro usando el codigo secreto.
- En el MVP no se podran crear, editar ni eliminar grupos desde admin.
- Mas adelante se podria extender el modelo para grupos dinamicos.

## 5. Usuarios y autenticacion

### Estrategia recomendada

Usar Supabase Auth con correo y contrasena.

Motivos:

- Es mas seguro y mantenible que crear autenticacion casera.
- Evita manejar hashes de contrasena manualmente.
- Permite usar sesiones, seguridad y middleware de Supabase.

### Registro

Campos:

- Nombre.
- Apellido.
- Alias.
- Correo.
- Contrasena.
- Codigo secreto de invitacion.
- Pais para horario de juegos.

Reglas:

- El alias debe ser unico en toda la app.
- El correo no se muestra a otros participantes.
- No se usara login con Google.
- No sera obligatorio verificar correo para simplificar el MVP.
- No habra recuperacion automatica de contrasena.
- Si alguien olvida la contrasena, se resuelve manualmente desde Supabase.

### Login

- Correo + contrasena.
- La app muestra el alias como identidad publica.

### Paises para horario

Opciones en orden alfabetico:

- Argentina: `America/Argentina/Buenos_Aires`.
- Chile: `America/Santiago`.
- Colombia: `America/Bogota`.
- Estados Unidos: `America/New_York`.
- Mexico: `America/Mexico_City`.
- Venezuela: `America/Caracas`.

Reglas:

- El pais horario se elige durante el registro.
- En el MVP queda fijo, igual que el grupo.

## 6. Roles

### Participante

Puede:

- Registrarse.
- Iniciar sesion.
- Seleccionar campeon obligatorio.
- Crear y editar predicciones mientras esten abiertas.
- Ver ranking de su grupo.
- Ver historial de sus predicciones.
- Ver resultados.
- Ver dashboard.

### Administrador

Administrador inicial:

- Nombre: Marco Riera.
- Correo: `mriera371@gmail.com`.

Puede:

- Ver usuarios y sus grupos.
- Ver todas las predicciones por grupo y partido.
- Sincronizar datos con la API.
- Editar manualmente equipos, partidos o resultados si la API falla.
- Ver estadisticas basicas.
- Ver logs de sincronizacion.

No incluido en MVP:

- Desactivar usuarios.
- Resetear contrasenas desde la app.
- Crear o editar grupos.

### Participacion del administrador

Para simplificar el MVP:

- Un usuario pertenece a un solo grupo.
- Si Marco quiere participar en los 3 grupos, creara cuentas participantes separadas por grupo.
- La cuenta admin puede quedar separada del ranking.

Ejemplo:

- `mriera371@gmail.com`: admin.
- `mriera371+fm@gmail.com`: participante Familia Marquez.
- `mriera371+fnq@gmail.com`: participante Familia Nuñez Quiñones.
- `mriera371+mb@gmail.com`: participante Mondaquera Bochinche.

## 7. Campeon elegido

El MVP incluira prediccion global de campeon.

Reglas:

- El usuario debe seleccionar su campeon al registrarse o en su primer ingreso.
- Si no tiene campeon elegido, no puede avanzar al dashboard.
- La seleccion se guarda una sola vez.
- Nunca puede modificarse.
- El goleador del torneo queda fuera del MVP.
- La prediccion de posiciones de grupo queda fuera del MVP.

Puntos:

- Campeon acertado: 10 puntos.
- Bonus adicional si tambien acierta el ganador de la final: 5 puntos.

## 8. Predicciones por partido

### Reglas generales

- El usuario puede crear o editar predicciones hasta 5 minutos antes del inicio del partido.
- Al faltar 5 minutos:
  - Se bloquea la edicion.
  - Se revelan las predicciones realizadas dentro del grupo.
- Antes del cierre:
  - Cada usuario solo ve sus propias predicciones.
  - El admin puede ver todas.
- Despues del cierre:
  - Se muestran solo las predicciones hechas.
  - No se muestra una lista de usuarios que no predijeron.

### Fase de grupos

El usuario selecciona:

- Gana local.
- Empate.
- Gana visitante.

Marcador exacto:

- Opcional.
- Debe ser consistente con la seleccion principal.

Ejemplos:

- Si selecciona gana local, el marcador debe tener mas goles del local.
- Si selecciona empate, ambos equipos deben tener los mismos goles.
- Si selecciona gana visitante, el marcador debe tener mas goles del visitante.

Puntos:

- Acertar ganador o empate: 3 puntos.
- Acertar marcador exacto: +2 puntos.
- Acertar diferencia de goles: +1 punto, solo en victorias local/visitante.

Maximos:

- Victoria local/visitante con marcador exacto: 6 puntos.
- Empate con marcador exacto: 5 puntos.
- Empate sin marcador exacto: 3 puntos.

Regla especial de empate:

- En empates no se suma punto por diferencia de goles.
- Para sumar extra en empate, debe acertar el marcador exacto.

### Eliminacion directa antes de la final

Fases:

- Dieciseisavos.
- Octavos.
- Cuartos.
- Semifinales.
- Tercer puesto, si se decide tratarlo con reglas de eliminacion.

El usuario predice:

- Quien avanza o gana el partido, incluyendo prorroga y penales.
- Si habra prorroga.
- Si habra penales.

Puntos:

- Acertar quien avanza: 3 puntos.
- Acertar si hubo prorroga: +2 puntos.
- Acertar si hubo penales: +2 puntos.

Maximo:

- 7 puntos.

### Final

La final tiene reglas especiales.

El usuario predice:

- Ganador del Mundial, incluyendo prorroga y penales.
- Marcador de los 90 minutos, opcional.
- Si habra prorroga.
- Si habra penales.

Reglas:

- El marcador exacto de la final corresponde solo a los 90 minutos reglamentarios.
- El marcador puede ser empate.
- El ganador del Mundial se evalua aparte, incluyendo prorroga y penales.

Puntos:

- Acertar ganador de la final: 3 puntos.
- Acertar marcador exacto de 90 minutos: +2 puntos.
- Acertar diferencia de goles en 90 minutos: +1 punto solo si no es empate.
- Acertar prorroga: +2 puntos.
- Acertar penales: +2 puntos.
- Campeon global correcto: +10 puntos.
- Bonus campeon global correcto + ganador de final acertado: +5 puntos.

## 9. Ranking

Reglas:

- Cada grupo tiene ranking totalmente independiente.
- No existe ranking global entre grupos en el MVP.
- El dashboard muestra el ranking completo del grupo.
- Los empates comparten posicion.

Ejemplo:

| Usuario | Puntos | Puesto |
| --- | ---: | ---: |
| Ana | 20 | 1 |
| Luis | 20 | 1 |
| Carlos | 18 | 3 |

Calculo:

- Puntos por predicciones de partidos.
- Puntos por campeon global.
- Bonus de final si aplica.
- Posiciones calculadas automaticamente.

## 10. Dashboard principal

El dashboard del participante mostrara:

- Bienvenida personalizada.
- Ranking completo del grupo.
- Proximos partidos.
- Resultados recientes.
- Resumen de puntos.
- Predicciones pendientes.
- Historial reciente.
- Campeon elegido.

No incluido en MVP:

- Notificaciones.
- Alertas.
- Badges simbolicos.

## 11. Historial de usuario

Mostrar solo predicciones por partido.

Campos visibles:

- Partido.
- Fecha y hora local.
- Prediccion realizada.
- Resultado oficial.
- Puntos obtenidos.
- Estado:
  - Acerto.
  - Fallo.
  - Pendiente.

No incluir en historial:

- Prediccion de campeon.

## 12. Pantalla de partidos y predicciones

Organizacion:

- Fase de grupos.
- Dieciseisavos.
- Octavos.
- Cuartos.
- Semifinales.
- Tercer puesto.
- Final.

Dentro de cada fase:

- Agrupar por fecha.
- Mostrar todos los partidos cargados.
- Permitir filtros o tabs para que la UI mobile no se sienta pesada.

Datos visuales:

- Nombres de equipos.
- Banderas como URL desde API.
- Estado del partido.
- Hora local del usuario.
- Prediccion del usuario.
- Indicador de abierto/cerrado/finalizado.

## 13. Estados de partido

Estados recomendados:

- `scheduled`: proximo.
- `locked`: cerrado para predicciones, aun no iniciado.
- `live`: en juego.
- `finished`: finalizado.
- `postponed`: pospuesto.
- `cancelled`: cancelado.

La app no necesita mostrar minuto a minuto en MVP.

## 14. Sincronizacion con API

### Estrategia hibrida

Usar:

- Sincronizacion automatica programada con Vercel Cron.
- Boton manual en admin: "Actualizar partidos/resultados ahora".

### Datos a importar

- Equipos.
- Banderas.
- Partidos.
- Fechas y horarios.
- Fases.
- Estados.
- Resultados.
- Datos de prorroga y penales cuando aplique.

### Capa generica

Crear una interfaz interna:

```ts
interface FootballApiProvider {
  syncTeams(): Promise<Team[]>;
  syncMatches(): Promise<Match[]>;
  syncResults(): Promise<MatchResult[]>;
}
```

Ventajas:

- Permite empezar con un proveedor y cambiarlo despues.
- Evita acoplar la app a una API concreta.
- Facilita fallback/manual admin.

## 15. Panel administrador MVP

Modulos:

### Usuarios

- Listar usuarios.
- Ver nombre, apellido, alias, correo, grupo, pais horario y rol.

### Predicciones

- Ver predicciones por grupo.
- Filtrar por partido, usuario o fase.

### Resultados

- Ejecutar sincronizacion manual con API.
- Editar manualmente equipos, horarios, banderas, estados o resultados si falla la API.
- Recalcular puntos despues de cambios manuales.

### Estadisticas

- Total usuarios.
- Usuarios por grupo.
- Total predicciones.
- Predicciones pendientes.
- Partidos finalizados.
- Ultima sincronizacion.

### Logs de sincronizacion

- Fecha/hora.
- Proveedor.
- Tipo de sync.
- Estado.
- Mensaje resumido.

## 16. Modelo de datos propuesto

### `profiles`

Perfil publico/privado extendido del usuario.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | FK a `auth.users.id` |
| `first_name` | text | Nombre |
| `last_name` | text | Apellido |
| `alias` | text | Unico global |
| `email` | text | Privado |
| `role` | text | `participant` o `admin` |
| `group_id` | uuid | FK a `groups.id`, nullable para admin puro |
| `timezone_country` | text | Pais elegido |
| `timezone` | text | Zona IANA |
| `created_at` | timestamptz | Fecha de creacion |

Restricciones:

- `alias` unico.
- `role` limitado a valores permitidos.

### `groups`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | PK |
| `name` | text | Nombre del grupo |
| `invite_code` | text | Codigo unico |
| `created_at` | timestamptz | Fecha de creacion |

Seed inicial:

- Familia Marquez / `FM26`.
- Familia Nuñez Quiñones / `PANTALONES26`.
- Mondaquera Bochinche / `MANCOS26`.

### `teams`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | PK |
| `api_id` | text | ID externo nullable |
| `name` | text | Nombre en espanol si aplica |
| `short_name` | text | Codigo o abreviatura |
| `flag_url` | text | URL de bandera |
| `created_at` | timestamptz | Fecha de creacion |
| `updated_at` | timestamptz | Fecha de actualizacion |

### `matches`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | PK |
| `api_id` | text | ID externo nullable |
| `phase` | text | Fase |
| `match_number` | int | Numero de partido si existe |
| `home_team_id` | uuid | FK a `teams.id`, nullable si no definido |
| `away_team_id` | uuid | FK a `teams.id`, nullable si no definido |
| `home_placeholder` | text | Ej: Ganador Grupo A |
| `away_placeholder` | text | Ej: Segundo Grupo B |
| `kickoff_at` | timestamptz | Hora UTC |
| `status` | text | Estado |
| `created_at` | timestamptz | Fecha de creacion |
| `updated_at` | timestamptz | Fecha de actualizacion |

### `match_results`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `match_id` | uuid | PK/FK a `matches.id` |
| `home_score_90` | int | Goles local en 90 min |
| `away_score_90` | int | Goles visitante en 90 min |
| `home_score_final` | int | Goles local final con prorroga, sin penales |
| `away_score_final` | int | Goles visitante final con prorroga, sin penales |
| `winner_team_id` | uuid | Ganador/avanza |
| `went_extra_time` | boolean | Hubo prorroga |
| `went_penalties` | boolean | Hubo penales |
| `penalty_winner_team_id` | uuid | Ganador por penales si aplica |
| `is_manual_override` | boolean | Editado manualmente |
| `updated_at` | timestamptz | Fecha de actualizacion |

### `champion_predictions`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | PK |
| `user_id` | uuid | FK a `profiles.id` |
| `team_id` | uuid | FK a `teams.id` |
| `created_at` | timestamptz | Fecha de seleccion |

Restricciones:

- `user_id` unico.
- No se permite update desde la app.

### `match_predictions`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | PK |
| `match_id` | uuid | FK a `matches.id` |
| `user_id` | uuid | FK a `profiles.id` |
| `group_id` | uuid | Copia del grupo para consultas/RLS |
| `prediction_type` | text | `group_stage`, `knockout`, `final` |
| `predicted_outcome` | text | `home`, `draw`, `away` para 90 min o fase de grupos |
| `predicted_winner_team_id` | uuid | Quien avanza/gana, knockout/final |
| `predicted_home_score` | int | Marcador 90 min opcional |
| `predicted_away_score` | int | Marcador 90 min opcional |
| `predicts_extra_time` | boolean | Nullable |
| `predicts_penalties` | boolean | Nullable |
| `points_awarded` | int | Default 0 |
| `status` | text | `pending`, `scored` |
| `created_at` | timestamptz | Fecha de creacion |
| `updated_at` | timestamptz | Fecha de actualizacion |

Restricciones:

- Unica por `user_id` + `match_id`.
- No editable si `kickoff_at - 5 minutes <= now()`.
- Validar consistencia entre outcome y marcador cuando exista marcador.

### `prediction_score_breakdown`

Opcional pero recomendable para transparencia.

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | PK |
| `prediction_id` | uuid | FK a `match_predictions.id` |
| `winner_points` | int | Puntos por ganador/empate/avanza |
| `exact_score_points` | int | Puntos por marcador exacto |
| `goal_difference_points` | int | Puntos por diferencia |
| `extra_time_points` | int | Puntos por prorroga |
| `penalties_points` | int | Puntos por penales |
| `champion_bonus_points` | int | Bonus final/campeon si aplica |
| `total_points` | int | Total |
| `created_at` | timestamptz | Fecha de calculo |

### `sync_logs`

| Campo | Tipo | Notas |
| --- | --- | --- |
| `id` | uuid | PK |
| `provider` | text | Proveedor usado |
| `sync_type` | text | `teams`, `matches`, `results`, `full` |
| `status` | text | `success`, `error`, `partial` |
| `message` | text | Resumen |
| `metadata` | jsonb | Datos utiles |
| `created_at` | timestamptz | Fecha |

## 17. Seguridad y RLS

Reglas base:

- Participantes solo pueden ver su perfil.
- Participantes solo pueden ver usuarios de su grupo para ranking.
- Participantes solo pueden ver sus predicciones antes del cierre.
- Participantes pueden ver predicciones de su grupo despues del cierre.
- Participantes no pueden ver predicciones de otros grupos.
- Admin puede ver todo.
- Solo admin puede editar resultados, equipos, partidos y ejecutar sync manual.
- Campeon elegido no puede actualizarse una vez creado.

## 18. Calculo de puntos

La puntuacion debe calcularse automaticamente cuando:

- Un partido cambia a finalizado.
- Se edita manualmente un resultado.
- Se sincronizan resultados desde API.
- Se confirma el campeon del Mundial.

Recomendacion:

- Implementar una funcion server-side `scoreMatch(matchId)`.
- Implementar una funcion `recalculateGroupRankings(groupId)` o usar una vista SQL.
- Guardar `points_awarded` en predicciones para historial rapido.
- Mantener breakdown para auditoria.

## 19. Vistas o queries recomendadas

### Ranking por grupo

Vista `group_rankings`:

- `group_id`.
- `user_id`.
- `alias`.
- `total_points`.
- `rank`.

Usar ranking con empates:

- SQL `RANK() OVER (PARTITION BY group_id ORDER BY total_points DESC)`.

### Dashboard

Queries:

- Perfil actual.
- Campeon elegido.
- Ranking completo de grupo.
- Proximos partidos.
- Resultados recientes.
- Predicciones pendientes del usuario.
- Historial reciente del usuario.

## 20. Rutas sugeridas

### Publicas

- `/login`.
- `/registro`.

### Participante

- `/`.
- `/dashboard`.
- `/partidos`.
- `/partidos/[id]`.
- `/ranking`.
- `/historial`.
- `/campeon`.
- `/perfil`.

### Admin

- `/admin`.
- `/admin/usuarios`.
- `/admin/predicciones`.
- `/admin/resultados`.
- `/admin/estadisticas`.
- `/admin/logs`.

## 21. Componentes sugeridos

### Layout

- `AppShell`.
- `MobileNav`.
- `Header`.
- `PageTitle`.

### Usuarios/Auth

- `LoginForm`.
- `RegisterForm`.
- `ChampionGate`.
- `TimezoneSelect`.

### Predicciones

- `MatchCard`.
- `PredictionForm`.
- `ScoreInput`.
- `OutcomeSelector`.
- `ExtraTimeToggle`.
- `PenaltyToggle`.
- `PredictionLockBadge`.

### Ranking

- `RankingTable`.
- `RankingPosition`.

### Dashboard

- `WelcomeCard`.
- `PointsSummary`.
- `UpcomingMatches`.
- `RecentResults`.
- `PendingPredictions`.
- `RecentHistory`.
- `ChampionSummary`.

### Admin

- `AdminUsersTable`.
- `AdminPredictionsTable`.
- `AdminResultEditor`.
- `SyncNowButton`.
- `SyncLogsTable`.
- `StatsCards`.

## 22. Estilo visual

Direccion:

- Oscuro.
- Moderno.
- Deportivo.
- Elegante.
- Premium.
- Tarjetas tipo app.
- Gradientes suaves.
- Banderas de paises.
- Sin copiar branding oficial exacto de FIFA.

Mobile-first:

- Navegacion inferior en movil.
- Cards compactas.
- Botones grandes y claros.
- Formularios faciles de usar.
- Ranking legible en pantallas pequenas.

## 23. MVP obligatorio confirmado

Incluye:

- Login.
- Registro.
- Grupos por codigo secreto.
- Seleccion obligatoria e inmutable de campeon.
- Predicciones por partido.
- Ranking independiente por grupo.
- Historial de usuario.
- Dashboard.
- Admin MVP.
- Integracion API mediante capa generica.
- Sincronizacion automatica y manual.
- Responsive movil.
- Deploy publico.

No incluye en MVP:

- Goleador.
- Prediccion de posiciones de grupo.
- Notificaciones.
- Alertas.
- Badges.
- Desactivacion de usuarios.
- Reset de contrasena desde la app.
- Creacion dinamica de grupos.
- Ranking global entre grupos.
- Login social.
- Verificacion obligatoria de email.

## 24. Orden de implementacion recomendado

1. Crear proyecto Next.js con Tailwind.
2. Configurar Supabase.
3. Crear schema SQL y seeds de grupos.
4. Configurar Auth y perfiles.
5. Crear registro/login.
6. Implementar gate obligatorio de campeon.
7. Crear tablas de equipos/partidos/resultados.
8. Crear UI de partidos y predicciones.
9. Implementar bloqueo/revelado a 5 minutos.
10. Implementar calculo de puntos.
11. Crear ranking por grupo.
12. Crear dashboard.
13. Crear historial.
14. Crear admin MVP.
15. Crear capa `FootballApiProvider`.
16. Crear sync manual y cron.
17. Pulir UI responsive.
18. Preparar deploy en Vercel.
