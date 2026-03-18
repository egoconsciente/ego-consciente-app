import { AppLayout } from "@/components/layout/app-layout";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";
import { useStages } from "@/lib/stage-context";
import { BookOpen, TrendingUp, SunMedium, Map, ArrowRight, Lock, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { TOTAL_STAGES } from "@/lib/stages";

const DAILY_PHRASES = [
  "Tu ego no es tu esencia. Es la historia que hoy organiza tu experiencia.",
  "Observar sin reaccionar es el primer acto de libertad interior.",
  "Lo que niegas te controla. Lo que observas, te informa.",
  "No necesitas destruir tu ego. Necesitas entenderlo.",
  "Cada patrón repetido es una puerta que aún no has cruzado.",
  "Tu sistema de protección fue brillante. Pero ya no necesitas todas sus reglas.",
  "El ego no miente. Solo cuenta la única historia que conoce.",
  "Hoy no busques perfección. Busca un instante de honestidad.",
  "La congruencia no es un destino. Es una práctica diaria.",
  "Lo que sientes no te define. Solo muestra lo que tu sistema está procesando.",
  "Un pensamiento observado pierde la mitad de su poder automático.",
  "No estás roto. Estás operando con un mapa desactualizado.",
  "La incomodidad que sientes es información, no un error.",
  "Cada vez que te observas sin juzgarte, rompes un ciclo.",
  "Tu ego construyó muros para protegerte. Hoy puedes abrir una ventana.",
  "No necesitas tener todas las respuestas. Solo una pregunta honesta.",
  "La claridad llega cuando dejas de buscarla y empiezas a observar.",
  "Tu paso mínimo de hoy es más valioso que tu plan perfecto de mañana.",
  "Lo que más te cuesta decir es probablemente lo que más necesitas observar.",
  "Tu sistema tiene razones. No las juzgues — estúdialas.",
  "La congruencia empieza cuando lo que piensas, sientes y haces se acercan.",
  "Hoy tu ego intentará protegerte. Solo obsérvalo hacerlo.",
  "No viniste aquí a arreglarte. Viniste a conocerte.",
  "El silencio interior no se impone. Se practica.",
  "Cada emoción repetida es un mensaje que aún no has leído.",
  "Tu narrativa puede cambiar. Pero primero necesitas verla.",
  "Ser honesto contigo mismo es más revolucionario que cualquier cambio externo.",
  "No confundas lo que haces con lo que eres.",
  "Un acto congruente hoy vale más que cuarenta promesas.",
  "Tu ego te protege de lo desconocido. Pero lo desconocido también eres tú.",
  "Observa qué parte de ti habla más fuerte hoy.",
  "No tienes que ganar la batalla. Solo verla con claridad.",
  "Lo que llamas 'yo' es una construcción en movimiento.",
  "Hoy permítete no saber. Eso también es avanzar.",
  "Tu sistema se tensa cuando algo importante quiere emerger.",
  "La vulnerabilidad no es debilidad. Es el ego bajando la guardia.",
  "Cada día que observas, el patrón pierde un poco de automatismo.",
  "No busques la respuesta. Busca la pregunta que aún no te has hecho.",
  "Estás más cerca de ti mismo de lo que crees.",
  "El proceso no termina aquí. Aquí es donde realmente empieza.",
];

function getDailyPhrase(): string {
  const today = new Date();
  const dayOfYear = Math.floor(
    (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
  );
  return DAILY_PHRASES[dayOfYear % DAILY_PHRASES.length];
}

function PreProcessDashboard({ userName }: { userName: string }) {
  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 lg:p-10 pt-12">
        <header className="mb-12">
          <h1 className="font-display text-4xl lg:text-5xl font-semibold mb-3">
            Hola, {userName}.
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            Tu proceso de observación te espera.
          </p>
        </header>

        <div className="bg-accent/10 border border-accent/20 rounded-3xl p-8 mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            Antes de cruzar el umbral
          </p>
          <p className="font-display text-lg text-foreground leading-relaxed italic">
            "No vengo a decirte quién eres. Vengo a mostrarte cómo se construye la historia que hoy llamas 'yo'."
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-primary to-accent p-8 rounded-3xl text-primary-foreground shadow-lg shadow-primary/10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-10">
                <SunMedium className="w-6 h-6 text-primary-foreground/80" />
                <span className="font-medium tracking-wide uppercase text-sm text-primary-foreground/80">
                  Tu proceso
                </span>
              </div>
              <div>
                <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight mb-4">
                  Empezar mi proceso
                </h2>
                <p className="text-primary-foreground/70 mb-6 leading-relaxed">
                  40 etapas de observación consciente.
                </p>
                <Link
                  href="/ego-intro"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary-foreground text-primary rounded-2xl font-semibold hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
                >
                  Empezar mi proceso
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 gap-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-6 rounded-3xl opacity-60 relative">
                <div className="absolute top-4 right-4">
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent/50">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground/70">Registro PEA</h3>
                <p className="text-muted-foreground/70 text-xs">
                  Pensamiento, emoción, acción — cada etapa.
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-3xl opacity-60 relative">
                <div className="absolute top-4 right-4">
                  <Lock className="w-4 h-4 text-muted-foreground/50" />
                </div>
                <div className="w-10 h-10 bg-secondary-foreground/10 rounded-xl flex items-center justify-center mb-4 text-secondary-foreground/50">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-1 text-foreground/70">Mi progreso</h3>
                <p className="text-muted-foreground/70 text-xs">
                  Tu recorrido de 40 etapas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function ActiveDashboard({ userName }: { userName: string }) {
  const { reflections } = useStore();
  const { currentStage, completedCount, getCurrentStageDefinition } = useStages();
  const stageDef = getCurrentStageDefinition();
  const todayPhrase = getDailyPhrase();
  const hasReflectedToday = reflections.some((r) => {
    const today = new Date();
    return (
      r.date.getFullYear() === today.getFullYear() &&
      r.date.getMonth() === today.getMonth() &&
      r.date.getDate() === today.getDate()
    );
  });

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 lg:p-10 pt-12 space-y-8">
        <header>
          <h1 className="font-display text-4xl lg:text-5xl font-semibold mb-3">
            Hola, {userName}.
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            ¿Qué parte de ti está al mando el día de hoy?
          </p>
        </header>

        <section>
          <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-3xl text-primary-foreground shadow-lg shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <SunMedium className="w-6 h-6 text-primary-foreground/80" />
                  <span className="font-medium tracking-wide uppercase text-sm text-primary-foreground/80">
                    Proceso activo
                  </span>
                </div>
                <p className="text-primary-foreground/70 mb-1 text-lg">
                  Te encuentras en la
                </p>
                <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-2">
                  Etapa {currentStage} <span className="text-2xl font-medium text-primary-foreground/60">de {TOTAL_STAGES}</span>
                </h2>
                {stageDef && (
                  <p className="text-primary-foreground/70 text-sm">{stageDef.title}</p>
                )}
              </div>
              <Link
                href="/journey"
                className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors shrink-0"
              >
                <Map className="w-4 h-4" />
                Ver mapa del proceso
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stageDef && (
            <div className="bg-card border border-border p-6 rounded-3xl hover:shadow-xl hover:border-primary/20 transition-all duration-300 group">
              <div className="flex items-start justify-between mb-3">
                <span className="text-xs font-semibold tracking-widest uppercase text-primary">
                  Etapa actual
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  ~{stageDef.estimatedMinutes} min
                </span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{stageDef.title}</h3>
              <p className="text-muted-foreground text-sm mb-4">{stageDef.shortDescription}</p>
              <Link
                href={`/journey/${currentStage}`}
                className="inline-flex items-center justify-center w-full py-3 bg-primary text-primary-foreground rounded-xl font-medium hover:bg-primary/90 transition-colors"
              >
                Continuar etapa
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          )}

          <div className="bg-card border border-border p-6 rounded-3xl hover:shadow-xl hover:border-primary/20 transition-all duration-300 group flex flex-col">
            <div className="w-10 h-10 bg-accent/10 rounded-xl flex items-center justify-center mb-4 text-accent group-hover:scale-110 transition-transform duration-300">
              <BookOpen className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold mb-1">Registro PEA</h3>
            <p className="text-muted-foreground text-xs mb-4 flex-1">
              Identifica el patrón.
            </p>
            <Link
              href="/reflection"
              className={`inline-flex items-center justify-center w-full py-2.5 rounded-lg font-medium text-sm transition-colors ${hasReflectedToday ? "bg-background border border-border text-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90"}`}
            >
              {hasReflectedToday ? "Ver registro" : "Registrar hoy"}
            </Link>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-card border border-border rounded-3xl p-6 flex items-center justify-between hover:shadow-md transition-all">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-secondary-foreground/10 rounded-xl flex items-center justify-center text-secondary-foreground">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Mi progreso</h3>
                <p className="text-muted-foreground text-xs">{completedCount} de {TOTAL_STAGES} etapas completadas</p>
              </div>
            </div>
            <Link
              href="/progress"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver recorrido
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-3xl p-6">
            <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
              Frase de hoy
            </p>
            <p className="font-display text-lg text-foreground leading-relaxed italic">
              "{todayPhrase}"
            </p>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

export default function Dashboard() {
  const { user, portalComplete } = useAuth();
  const userName = user?.name || "Caminante";

  if (!portalComplete) {
    return <PreProcessDashboard userName={userName} />;
  }

  return <ActiveDashboard userName={userName} />;
}
