import { resolveJourneyProgress } from "./journey-progress";
import { supabase } from "./supabase";

// ═══════════════════════════════════════════════
//  TYPES
// ═══════════════════════════════════════════════

export interface OnboardingData {
  reason: string;
  incongruence_area: string;
  difficulty: string;
  daily_time: string;
}

export interface PeaEntry {
  day_number: number;
  thought: string;
  emotion: string;
  action: string;
  created_at: string;
}

export interface ChatMsg {
  id: string;
  role: "user" | "ego";
  content: string;
  created_at: string;
}

export interface EgoContext {
  onboarding: OnboardingData | null;
  peaEntries: PeaEntry[];
  latestPea: PeaEntry | null;
  currentStage: number;
  messageCount: number;
}

export interface EgoMemoryPayload {
  user_id: string;
  current_day: number;
  primary_incongruence_area: string | null;
  primary_difficulty: string | null;
  latest_thought: string | null;
  latest_emotion: string | null;
  latest_action: string | null;
  dominant_pattern_summary: string | null;
  current_focus: string | null;
  next_question: string | null;
  suggested_step: string | null;
}

type ResponseMode = "reflect" | "clarify" | "step";

// ═══════════════════════════════════════════════
//  DATA FETCHERS
// ═══════════════════════════════════════════════

export async function fetchEgoContext(userId: string): Promise<EgoContext> {
  const [onboardingRes, peaRes, progressRes] = await Promise.all([
    supabase
      .from("onboarding_responses")
      .select("reason,incongruence_area,difficulty,daily_time")
      .eq("user_id", userId)
      .maybeSingle(),
    supabase
      .from("pea_entries")
      .select("day_number,thought,emotion,action,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("stage_progress")
      .select("stage_number,status")
      .eq("user_id", userId),
  ]);

  const onboarding = onboardingRes.data as OnboardingData | null;
  const peaEntries = (peaRes.data ?? []) as PeaEntry[];
  const latestPea = peaEntries.length > 0 ? peaEntries[0] : null;

  if (progressRes.error) throw progressRes.error;
  const { currentStage } = resolveJourneyProgress(
    (progressRes.data ?? []).map(row => ({ stageNumber: row.stage_number, status: row.status }))
  );

  console.log("[EgoEngine] Contexto cargado:", {
    hasOnboarding: !!onboarding,
    peaCount: peaEntries.length,
    currentStage,
  });

  return { onboarding, peaEntries, latestPea, currentStage, messageCount: 0 };
}

export async function loadChatMessages(userId: string): Promise<ChatMsg[]> {
  const { data, error } = await supabase
    .from("chat_messages")
    .select("id,role,content,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    console.error("[EgoEngine] Error cargando mensajes:", error);
    return [];
  }
  return (data ?? []) as ChatMsg[];
}

export async function saveChatMessage(
  userId: string,
  role: "user" | "ego",
  content: string
): Promise<ChatMsg | null> {
  const { data, error } = await supabase
    .from("chat_messages")
    .insert({ user_id: userId, role, content })
    .select("id,role,content,created_at")
    .single();

  if (error) {
    console.error("[EgoEngine] Error guardando mensaje:", error);
    return null;
  }
  return data as ChatMsg;
}

// ═══════════════════════════════════════════════
//  EGO MEMORY BUILDER
// ═══════════════════════════════════════════════

export function buildEgoMemory(
  userId: string,
  ctx: EgoContext
): EgoMemoryPayload {
  const { onboarding, peaEntries, latestPea, currentStage } = ctx;

  const primaryArea = onboarding?.incongruence_area ?? null;
  const primaryDiff = onboarding?.difficulty ?? null;

  let patternSummary: string | null = null;
  if (peaEntries.length >= 3) {
    const emotions = peaEntries.slice(0, 5).map((e) => e.emotion);
    const uniqueEmotions = [...new Set(emotions)];
    if (uniqueEmotions.length <= 2) {
      patternSummary = `Tu sistema tiende a repetir un estado emocional: "${uniqueEmotions[0]}". Esto no es un juicio — es un dato.`;
    } else {
      patternSummary = `Tus emociones recientes muestran variación: ${uniqueEmotions.join(", ")}. Tu sistema está procesando.`;
    }
  }

  let currentFocus: string | null = null;
  if (primaryArea && primaryDiff) {
    currentFocus = `Observar la tensión en "${primaryArea}" cuando aparece "${primaryDiff}".`;
  } else if (primaryArea) {
    currentFocus = `Observar qué ocurre en el área de "${primaryArea}".`;
  }

  let nextQuestion: string | null = null;
  if (!latestPea) {
    nextQuestion = "¿Qué pensaste, sentiste e hiciste hoy?";
  } else if (latestPea.thought && latestPea.emotion) {
    nextQuestion = `En tu última reflexión notaste "${latestPea.emotion}". ¿Qué notas hoy?`;
  }

  let suggestedStep: string | null = null;
  const dailyTime = onboarding?.daily_time ?? "5 min";
  if (!latestPea) {
    suggestedStep = `Dedica ${dailyTime} a tu primera reflexión PEA.`;
  } else {
    suggestedStep = `Hoy dedica ${dailyTime} a observar si el patrón de tu última reflexión se repite.`;
  }

  const payload: EgoMemoryPayload = {
    user_id: userId,
    // Legacy Supabase column name; its value is the canonical stage.
    current_day: currentStage,
    primary_incongruence_area: primaryArea,
    primary_difficulty: primaryDiff,
    latest_thought: latestPea?.thought ?? null,
    latest_emotion: latestPea?.emotion ?? null,
    latest_action: latestPea?.action ?? null,
    dominant_pattern_summary: patternSummary,
    current_focus: currentFocus,
    next_question: nextQuestion,
    suggested_step: suggestedStep,
  };

  console.log("[EgoEngine] Ego memory computada:", payload);
  return payload;
}

export async function saveEgoMemory(payload: EgoMemoryPayload): Promise<void> {
  const { error } = await supabase
    .from("ego_memory")
    .upsert(payload, { onConflict: "user_id" });

  if (error) {
    console.error("[EgoEngine] Error guardando ego_memory:", error);
  } else {
    console.log("[EgoEngine] ego_memory guardada.");
  }
}

// ═══════════════════════════════════════════════
//  DETERMINISTIC RESPONSE ENGINE
// ═══════════════════════════════════════════════

const EMOTION_KEYWORDS = [
  "ansios", "ansiedad", "triste", "tristeza", "frustrad", "enojad", "enojo",
  "preocupad", "confundid", "sol", "soledad", "cansad", "abrumad",
  "miedo", "culpa", "vergüenza", "insegur", "nervios", "angustia",
  "rabia", "impotencia", "vacío",
];

const ACTION_KEYWORDS = [
  "decidí", "hice", "actué", "cambié", "dejé", "empecé", "intenté",
  "evité", "elegí", "hablé", "callé", "renuncié", "acepté",
];

function detectKeywords(text: string): { hasEmotion: boolean; hasAction: boolean } {
  const lower = text.toLowerCase();
  return {
    hasEmotion: EMOTION_KEYWORDS.some((k) => lower.includes(k)),
    hasAction: ACTION_KEYWORDS.some((k) => lower.includes(k)),
  };
}

function chooseMode(userMessage: string, ctx: EgoContext): ResponseMode {
  const { hasEmotion, hasAction } = detectKeywords(userMessage);

  if (userMessage.length < 25) return "clarify";
  if (hasEmotion) return "reflect";
  if (hasAction) return "step";

  const cycle: ResponseMode[] = ["reflect", "clarify", "step"];
  return cycle[ctx.messageCount % 3];
}

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const REFLECT_GENERIC = [
  "Veo una tensión ahí. No la juzgues — obsérvala.",
  "Tu sistema está procesando algo. Eso ya es información valiosa.",
  "Lo que describes no te define. Solo muestra cómo opera tu sistema hoy.",
  "Noto que hay algo ahí que quiere ser visto. Continúa.",
  "Eso que mencionas lleva una carga. ¿Puedes solo observarla, sin resolverla?",
];

const CLARIFY_GENERIC = [
  "¿Qué parte de eso te genera más fricción?",
  "Cuando mencionas eso, ¿qué notas en tu cuerpo?",
  "¿Eso que describes se repite, o es algo nuevo?",
  "¿Qué pensaste justo antes de que eso ocurriera?",
  "¿Qué harías diferente si el miedo no estuviera?",
  "¿Puedes separar lo que piensas de lo que sientes ahí?",
];

const STEP_GENERIC = [
  "Un paso mínimo hoy: observa eso sin intentar cambiarlo.",
  "No busques resolver. Solo registra: pensamiento, emoción, acción.",
  "Tu paso congruente hoy: quedarte un momento con lo que sientes antes de actuar.",
  "Hoy no busques perfección. Busca un gesto honesto.",
  "Antes de dormir, pregúntate: ¿en qué fui congruente hoy?",
];

function reflectWithContext(userMessage: string, ctx: EgoContext): string {
  const { onboarding, latestPea } = ctx;

  if (onboarding && detectKeywords(userMessage).hasEmotion) {
    return `Veo una fricción entre lo que sientes y el área de "${onboarding.incongruence_area}" que mencionaste al inicio. Eso no es un error — es una señal.`;
  }

  if (latestPea) {
    return `Hoy parece que tu sistema sigue procesando lo que notaste antes: "${latestPea.emotion}". Eso es parte del proceso.`;
  }

  return pickRandom(REFLECT_GENERIC);
}

function clarifyWithContext(ctx: EgoContext): string {
  if (ctx.peaEntries.length === 0 && ctx.onboarding) {
    return `Mencionaste que te cuesta "${ctx.onboarding.difficulty}". ¿Puedes darme un ejemplo concreto de hoy?`;
  }
  return pickRandom(CLARIFY_GENERIC);
}

function stepWithContext(ctx: EgoContext): string {
  const time = ctx.onboarding?.daily_time ?? "5 min";

  if (ctx.latestPea) {
    return `Hoy dedica ${time} a observar si lo que sentiste en tu última reflexión ("${ctx.latestPea.emotion}") aparece de nuevo. Sin juzgar.`;
  }

  return pickRandom(STEP_GENERIC);
}

export function generateResponse(userMessage: string, ctx: EgoContext): string {
  const mode = chooseMode(userMessage, ctx);

  switch (mode) {
    case "reflect":
      return reflectWithContext(userMessage, ctx);
    case "clarify":
      return clarifyWithContext(ctx);
    case "step":
      return stepWithContext(ctx);
  }
}

// ═══════════════════════════════════════════════
//  WELCOME / INITIAL MESSAGE
// ═══════════════════════════════════════════════

export function generateWelcome(ctx: EgoContext): string {
  const { onboarding, latestPea, currentStage } = ctx;

  if (onboarding && !latestPea) {
    return (
      `Sé por qué estás aquí. Mencionaste: "${onboarding.reason}". ` +
      `Estás en la etapa ${currentStage}. Antes de que conversemos, te invito a completar ` +
      `tu primera reflexión PEA — pensamiento, emoción, acción. ` +
      `Eso me da contexto real para acompañarte.`
    );
  }

  if (onboarding && latestPea) {
    return (
      `Etapa ${currentStage}. En tu última reflexión notaste: "${latestPea.emotion}". ` +
      `Y mencionaste que lo que más te cuesta es "${onboarding.difficulty}". ` +
      `¿Quieres explorar esa conexión hoy?`
    );
  }

  return (
    `Etapa ${currentStage}. Estoy aquí para observar contigo. ` +
    `No voy a juzgarte ni etiquetarte. Solo quiero ayudarte a ver tus patrones. ` +
    `¿Qué pensaste, qué sentiste y qué hiciste hoy?`
  );
}
