# Plan de Prueba Manual MVP

## Objetivo

Probar el flujo completo con dos usuarios del mismo grupo.

## Preparacion

1. Crear dos usuarios participantes con el mismo codigo:
   - Usuario A: codigo `FM26`.
   - Usuario B: codigo `FM26`.
2. Ambos deben elegir campeon.
3. Ambos deben entrar al mismo partido demo.

## Flujo

1. Usuario A guarda una prediccion.
2. Usuario B guarda una prediccion distinta.
3. Antes del cierre, cada usuario debe ver solo su prediccion.
4. Para probar revelado sin esperar, editar temporalmente en Supabase el `kickoff_at` del partido a una hora menor a 5 minutos desde ahora.
5. Refrescar `/partidos/[id]` con ambos usuarios.
6. Ambos deben ver las predicciones hechas por el grupo.
7. Entrar como admin.
8. Ir a `/admin/resultados`.
9. Guardar resultado oficial.
10. Revisar:
    - `/ranking`.
    - `/historial`.
    - `/admin/predicciones`.
    - `/admin/logs`.

## Resultado esperado

- Ranking suma puntos reales.
- Historial muestra resultado, puntos y estado.
- Admin ve logs de resultado manual.
- No se muestran usuarios que no predijeron.

