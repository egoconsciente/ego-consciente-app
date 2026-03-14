import { AppLayout } from "@/components/layout/app-layout";
import { Link } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { useStore } from "@/lib/store-context";
import { MessageSquare, BookOpen, TrendingUp, SunMedium, Map } from "lucide-react";

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

export default function Dashboard() {
  const { user } = useAuth();
  const { currentDay, reflections } = useStore();

  const hasReflectedToday = reflections.some((r) => r.day === currentDay);
  const todayPhrase = DAILY_PHRASES[(currentDay - 1) % DAILY_PHRASES.length];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto p-6 lg:p-10 pt-12">
        <header className="mb-12">
          <h1 className="font-display text-4xl lg:text-5xl font-semibold mb-3">
            Hola, {user?.name || "Caminante"}.
          </h1>
          <p className="text-xl text-muted-foreground font-light">
            ¿Qué parte de ti está al mando el día de hoy?
          </p>
        </header>

        {/* Daily Phrase Card */}
        <div className="bg-accent/10 border border-accent/20 rounded-3xl p-8 mb-8">
          <p className="text-xs font-semibold tracking-widest uppercase text-accent mb-3">
            Frase de hoy — Día {currentDay}
          </p>
          <p className="font-display text-lg md:text-xl text-foreground leading-relaxed italic">
            "{todayPhrase}"
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Day Card */}
          <div className="bg-gradient-to-br from-primary to-accent p-8 rounded-3xl text-primary-foreground shadow-lg shadow-primary/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 flex flex-col h-full justify-between">
              <div className="flex items-center gap-3 mb-10">
                <SunMedium className="w-6 h-6 text-primary-foreground/80" />
                <span className="font-medium tracking-wide uppercase text-sm text-primary-foreground/80">
                  Proceso activo
                </span>
              </div>
              <div>
                <p className="text-primary-foreground/70 mb-1 text-lg">
                  Te encuentras en el
                </p>
                <h2 className="font-display text-6xl font-bold tracking-tight mb-4">
                  Día {currentDay}
                </h2>
                <Link
                  href="/journey"
                  className="inline-flex items-center gap-2 text-primary-foreground/80 hover:text-primary-foreground text-sm font-medium transition-colors"
                >
                  <Map className="w-4 h-4" />
                  Ver mapa del proceso
                </Link>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Chat Card */}
            <div className="bg-card border border-border p-6 rounded-3xl hover:shadow-xl hover:border-primary/20 transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 text-primary group-hover:scale-110 transition-transform duration-300">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  Continuar conversación
                </h3>
                <p className="text-muted-foreground text-sm">
                  El Ego está listo para escucharte y ayudarte a desenredar la
                  narrativa de hoy.
                </p>
              </div>
              <Link
                href="/chat"
                className="mt-6 inline-flex items-center justify-center w-full py-3 bg-secondary text-secondary-foreground rounded-xl font-medium hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                Hablar con el Ego
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Reflection Card */}
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

              {/* Progress Card */}
              <div className="bg-card border border-border p-6 rounded-3xl hover:shadow-xl hover:border-primary/20 transition-all duration-300 group flex flex-col">
                <div className="w-10 h-10 bg-secondary-foreground/10 rounded-xl flex items-center justify-center mb-4 text-secondary-foreground group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-1">Mi progreso</h3>
                <p className="text-muted-foreground text-xs mb-4 flex-1">
                  {currentDay} de 40 días completados.
                </p>
                <Link
                  href="/progress"
                  className="inline-flex items-center justify-center w-full py-2.5 bg-secondary text-secondary-foreground rounded-lg font-medium text-sm hover:bg-secondary-foreground hover:text-secondary transition-colors"
                >
                  Ver recorrido
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
