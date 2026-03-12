import { Link } from "wouter";
import { motion } from "framer-motion";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden">
      {/* Background Decorative Element */}
      <div className="absolute inset-0 z-0 opacity-40">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-abstract.png`}
          alt="Abstract calm background"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 px-6 max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <span className="inline-block py-1 px-3 rounded-full bg-secondary text-secondary-foreground text-xs font-semibold tracking-widest uppercase mb-8 border border-border/50">
            Un proceso de observación
          </span>
        </motion.div>

        <motion.h1 
          className="font-display text-4xl md:text-6xl lg:text-7xl leading-tight text-foreground mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          "No vengo a decirte quién eres. <br className="hidden md:block" />
          <span className="text-primary italic">Vengo a mostrarte cómo se construye la historia que hoy llamas 'yo'.</span>"
        </motion.h1>

        <motion.p 
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 font-light leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          Ego Consciente es un proceso de autoobservación.<br />
          Aquí no vienes a recibir una etiqueta.<br />
          Vienes a recuperar claridad.
        </motion.p>

        <motion.div 
          className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
        >
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 transition-all duration-300"
          >
            Iniciar proceso
          </Link>
          <Link 
            href="/login" 
            className="w-full sm:w-auto px-8 py-4 bg-transparent text-foreground border border-border rounded-2xl font-medium text-lg hover:bg-secondary hover:border-secondary transition-all duration-300"
          >
            Ya tengo cuenta
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
