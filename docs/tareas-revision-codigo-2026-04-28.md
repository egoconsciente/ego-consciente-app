# Revisión del código base — Tareas propuestas (2026-04-28)

## 1) Tarea para corregir un error tipográfico
**Título:** Corregir typo gramatical en la documentación de `lib/db`.

**Problema detectado:** En `replit.md` aparece la frase "no models definitions exist right now", que mezcla plural/singular y suena incorrecta en inglés técnico.

**Propuesta de tarea:** Cambiar la frase por "no model definitions exist right now" (o una versión equivalente clara).

**Criterio de aceptación:**
- El bloque de documentación de `lib/db` queda gramaticalmente correcto y consistente.

---

## 2) Tarea para corregir una falla
**Título:** Evitar falsos errores en `/auth/callback` cuando la sesión tarda en inicializar.

**Problema detectado:** `AuthCallback` muestra error tras 600 ms si `isAuthenticated` sigue en `false`, incluso cuando la app todavía está resolviendo estado de autenticación/red. Eso puede producir un falso negativo en enlaces válidos.

**Propuesta de tarea:**
- Exponer `isReady` desde `AuthContext` (o estado equivalente de carga).
- En `AuthCallback`, mostrar error solo cuando el estado de auth esté realmente resuelto y la sesión no exista.
- Aumentar/ajustar la estrategia de timeout para redes lentas (o eliminar timeout y depender de estado real).

**Criterio de aceptación:**
- Un enlace de confirmación válido no muestra mensaje de "Enlace no válido" por latencia temporal.
- Un enlace inválido/expirado sí muestra error cuando corresponde.

---

## 3) Tarea para corregir discrepancia en comentarios/documentación
**Título:** Alinear comentarios de `/auth/callback` con el comportamiento real de validación.

**Problema detectado:** El comentario en `auth-callback.tsx` indica que el fallback de error significa "link inválido o expirado", pero la implementación actual usa un timeout fijo de 600 ms; eso no distingue entre "inválido" y "aún cargando".

**Propuesta de tarea:**
- Actualizar el comentario para reflejar explícitamente la condición real actual **o** (preferible) actualizar implementación y comentario juntos para que la semántica del comentario sea verdadera.
- Documentar claramente qué señales determinan "enlace inválido".

**Criterio de aceptación:**
- No hay contradicción entre el comentario de alto nivel y el flujo real de control.

---

## 4) Tarea para mejorar una prueba
**Título:** Añadir pruebas para el flujo de redirección y fallback de `AuthCallback`.

**Problema detectado:** No hay cobertura automatizada visible para el comportamiento crítico de callback de autenticación.

**Propuesta de tarea:**
- Agregar tests de componente (por ejemplo con Vitest + Testing Library) para estos casos:
  1. Usuario autenticado + onboarding incompleto -> redirige a `/onboarding`.
  2. Usuario autenticado + onboarding completo + portal incompleto -> redirige a `/ego-intro`.
  3. Usuario autenticado + portal completo -> redirige a `/dashboard`.
  4. Usuario no autenticado con auth resuelta -> muestra estado de error.
  5. Estado de auth no resuelto -> mantiene loading y **no** muestra error prematuro.

**Criterio de aceptación:**
- Suite de pruebas nueva pasa en CI/local y cubre decisiones críticas del callback.

