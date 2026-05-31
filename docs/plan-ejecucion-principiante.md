# ¿Qué hago ahora? — Plan simple para implementar las mejoras (principiante)

Si tú construiste la app con apoyo de LLMs, vas muy bien. Lo que sigue es **ordenar el trabajo** para reducir errores sin romper lo que ya funciona.

## Objetivo de esta semana
Cerrar 4 mejoras pequeñas en este orden:
1. Corregir typo de documentación.
2. Corregir la falla de `/auth/callback`.
3. Alinear comentario/documentación con el comportamiento real.
4. Agregar pruebas del callback.

---

## Paso 0 — Crea una rama por tarea (importante)
No mezcles todo en una sola rama.

Ejemplo:
```bash
git checkout -b fix/docs-typo
```

Luego, para cada tarea, abre un PR pequeño.

---

## Paso 1 — Tarea fácil (15 min): typo en documentación
- Archivo: `replit.md`
- Cambio: reemplazar `no models definitions exist right now` por `no model definitions exist right now`.

Checklist:
- [ ] Editar texto.
- [ ] Commit.
- [ ] Abrir PR.

---

## Paso 2 — Tarea crítica (falla real): `/auth/callback`
Problema actual: si la red está lenta, a los 600 ms podría salir "Enlace no válido" aunque el link sí sea correcto.

Qué hacer:
1. Exponer un estado `isReady` desde el contexto de auth.
2. En `AuthCallback`, solo mostrar error cuando:
   - `isReady === true`, y
   - `isAuthenticated === false`.
3. Mientras `isReady === false`, mantener spinner.

Checklist:
- [ ] `AuthContext` expone `isReady`.
- [ ] `AuthCallback` usa `isReady` para decidir error vs loading.
- [ ] Probar manualmente con throttling de red en el navegador.

---

## Paso 3 — Alinea comentarios/documentación
- Actualiza el bloque de comentario de `auth-callback.tsx` para que diga exactamente lo que hace el código.
- Regla: **si cambia la lógica, cambia el comentario el mismo día**.

Checklist:
- [ ] Comentario actualizado.
- [ ] Sin contradicciones entre comentario y código.

---

## Paso 4 — Pruebas mínimas (Vitest + Testing Library)
Crea tests de componente para:
1. Autenticado + onboarding incompleto -> `/onboarding`.
2. Autenticado + onboarding completo + portal incompleto -> `/ego-intro`.
3. Autenticado + portal completo -> `/dashboard`.
4. No autenticado + `isReady=true` -> error.
5. `isReady=false` -> loading (sin error prematuro).

Checklist:
- [ ] Archivo de test creado.
- [ ] Tests pasan en local.
- [ ] PR con evidencia de salida de tests.

---

## Definición de “terminado” para cada PR
Un PR se considera bien hecho si cumple:
- Cambio pequeño y enfocado.
- Mensaje claro de por qué se hizo.
- Captura/salida de test o validación manual.
- Sin mezclar refactors no relacionados.

---

## Si te bloqueas
Cuando pidas ayuda a un LLM, usa este prompt corto:

> “Quiero un cambio mínimo y seguro. Dame diff por archivo, pruebas a ejecutar y plan de rollback si algo falla.”

Eso te ayuda a mantener control técnico y evitar respuestas demasiado grandes.

---

## Consejo final
No necesitas “saber toda IA” para avanzar. Ya hiciste lo más difícil: construir.
Ahora toca operar como ingeniero de producto: cambios pequeños, medibles y con pruebas.
