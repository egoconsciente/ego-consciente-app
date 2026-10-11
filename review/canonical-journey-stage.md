# Avance canónico por etapas

Base: `stabilize-mvp-stage-flow`, commit `9182f8d`. Corrección independiente del autoguardado; no modifica saveReflection ni completeStageWithData.

`stage_progress` es la única fuente del avance. `resolveJourneyProgress` devuelve la primera etapa pendiente entre 1 y 40, cuenta completadas únicas y no usa fechas. Los huecos no permiten saltar etapas. El chat espera StageProvider y sincroniza su contexto y memoria cuando cambia la etapa.

Compatibilidad: se conservan `ego_memory.current_day` y `pea_entries.day_number` como nombres de columnas existentes; las nuevas escrituras usan la etapa canónica. No se cambia el esquema, las políticas RLS ni fechas. No se renumeran ni migran entradas antiguas. El Ego ordena PEA por created_at para obtener la observación más reciente, sin asumir que fue ayer.

Protección PEA: nuevas entradas usan INSERT, nunca UPSERT. Una colisión con el índice único user_id/day_number devuelve error sin sobrescribir el registro anterior ni presentar éxito. Esta corrección no permite editar entradas existentes desde el diario libre. Los números históricos pueden provenir del antiguo cálculo cronológico y no prueban que se haya completado esa etapa; una migración futura requeriría evidencia adicional. Los mensajes históricos del chat se mantienen como historial y pueden contener el texto antiguo “Día”; las nuevas bienvenidas dicen “Etapa”.

## Validación ejecutada

- `pnpm --filter @workspace/ego-consciente test`: 9 pruebas, 9 pasan, 0 fallan.
- `pnpm --filter @workspace/ego-consciente typecheck`: exit 0.
- `PORT=5173 BASE_PATH=/ pnpm --filter @workspace/ego-consciente build`: exit 0, 2243 módulos. Advertencias de sourcemap tooltip y tamaño del bundle.
- `git diff --check`: exit 0.

Pruebas: inicio tardío, avance lento, varias etapas en un día, interrupción, regreso prolongado, finalización, huecos/duplicados/valores inválidos, error de consulta y colisión PEA. Ejecutan las funciones reales transpiladas y simulan el cliente Supabase. No son pruebas E2E ni pruebas contra Supabase de producción. No se realizaron escrituras en datos reales.

## Aplicación del parche

Desde la raíz del repositorio en la base indicada:

```sh
git apply --check review/canonical-journey-stage.patch
git apply review/canonical-journey-stage.patch
pnpm --filter @workspace/ego-consciente test
pnpm --filter @workspace/ego-consciente typecheck
PORT=5173 BASE_PATH=/ pnpm --filter @workspace/ego-consciente build
```
