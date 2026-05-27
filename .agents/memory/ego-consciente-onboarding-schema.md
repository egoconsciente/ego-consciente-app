---
name: Ego Consciente onboarding_responses schema
description: Schema constraints and how "otra" option is persisted in incongruence_area.
---

`onboarding_responses` columns: `user_id`, `reason`, `incongruence_area`, `difficulty`, `daily_time`. No `incongruence_detail` column.

When the user picks "otra" in the incongruence-area step and types free-text detail, persist the **detail directly** into `incongruence_area` (not the literal "otra").

**Why:** `ego-engine.ts` interpolates that value into natural-language narration ("el área de \"${incongruence_area}\""). Saving `"otra"` or `"otra: <text>"` reads clunky; saving the bare detail keeps the voice clean. ego-engine has no conditional branching on the literal `"otra"` anywhere — verified.

**How to apply:** In onboarding save, if `area === "otra" && detail.trim()` → save `detail.trim()`; else save the option as-is. Keep `"otra"` capture as local UI state so we can migrate to a dedicated column later without data loss in flight.
