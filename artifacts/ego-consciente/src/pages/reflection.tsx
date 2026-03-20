import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { useStore } from "@/lib/store-context";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Reflection() {
  const { currentDay, addReflection, reflections } = useStore();
  const { toast } = useToast();
  
  const existingReflection = reflections.find(r => r.day === currentDay);
  
  const [p, setP] = useState(existingReflection?.pensamiento || "");
  const [e, setE] = useState(existingReflection?.emocion || "");
  const [a, setA] = useState(existingReflection?.accion || "");
  const [isSaved, setIsSaved] = useState(!!existingReflection);

  useEffect(() => {
    if (existingReflection) {
      setP(existingReflection.pensamiento);
      setE(existingReflection.emocion);
      setA(existingReflection.accion);
      setIsSaved(true);
    }
  }, [existingReflection]);

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!p.trim() || !e.trim() || !a.trim()) return;
    
    addReflection(p, e, a);
    setIsSaved(true);
    toast({
      title: "Reflexión guardada",
      description: "Tu registro diario ha sido integrado a tu proceso.",
      duration: 4000,
    });
  };

  return (
    <AppLayout>
      <div className="max-w-3xl mx-auto p-6 lg:p-10 pt-12 pb-32">
        <header className="mb-10 text-center">
          <h1 className="font-display text-4xl md:text-5xl font-semibold mb-4">Registro PEA</h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Día {currentDay}. Desglosa la experiencia de hoy. Observar el patrón es el primer paso para no repetirlo ciegamente.
          </p>
        </header>

        {isSaved ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border p-8 md:p-12 rounded-3xl text-center shadow-lg shadow-black/5"
          >
            <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-display font-semibold mb-2">Registro completado</h2>
            <p className="text-muted-foreground mb-8">Has depositado tu observación del día {currentDay}.</p>
            
            <div className="text-left bg-background rounded-2xl p-6 space-y-4 border border-border">
               <div>
                 <span className="text-xs font-bold uppercase text-primary tracking-wider">Pensamiento</span>
                 <p className="mt-1 text-foreground">{p}</p>
               </div>
               <div className="h-px w-full bg-border" />
               <div>
                 <span className="text-xs font-bold uppercase text-accent tracking-wider">Emoción</span>
                 <p className="mt-1 text-foreground">{e}</p>
               </div>
               <div className="h-px w-full bg-border" />
               <div>
                 <span className="text-xs font-bold uppercase text-secondary-foreground tracking-wider">Acción</span>
                 <p className="mt-1 text-foreground">{a}</p>
               </div>
            </div>

            <button 
              onClick={() => setIsSaved(false)}
              className="mt-8 text-sm text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
            >
              Editar registro
            </button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            <motion.div 
              className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            >
              <label className="block mb-4">
                <span className="font-display text-2xl font-semibold text-primary block mb-2">Pensamiento</span>
                <span className="text-sm text-muted-foreground block mb-4">¿Qué narrativa construyó tu mente? ¿Qué te dijiste a ti mismo?</span>
                <textarea 
                  required
                  value={p}
                  onChange={(ev) => setP(ev.target.value)}
                  placeholder="Ej: Pensé que si no terminaba todo hoy, fracasaría."
                  className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none h-32 transition-all"
                />
              </label>
            </motion.div>

            <motion.div 
              className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            >
              <label className="block mb-4">
                <span className="font-display text-2xl font-semibold text-accent block mb-2">Emoción</span>
                <span className="text-sm text-muted-foreground block mb-4">¿Qué sensación física acompañó ese pensamiento?</span>
                <textarea 
                  required
                  value={e}
                  onChange={(ev) => setE(ev.target.value)}
                  placeholder="Ej: Tensión en el pecho, respiración corta, ansiedad."
                  className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-accent/20 focus:border-accent resize-none h-32 transition-all"
                />
              </label>
            </motion.div>

            <motion.div 
              className="bg-card p-6 md:p-8 rounded-3xl border border-border shadow-sm"
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            >
              <label className="block mb-4">
                <span className="font-display text-2xl font-semibold text-secondary-foreground block mb-2">Acción</span>
                <span className="text-sm text-muted-foreground block mb-4">¿Cómo respondiste? ¿Qué hiciste impulsado por esa emoción?</span>
                <textarea 
                  required
                  value={a}
                  onChange={(ev) => setA(ev.target.value)}
                  placeholder="Ej: Me quedé trabajando hasta tarde sin comer, ignorando mi cansancio."
                  className="w-full bg-background border border-border rounded-xl p-4 text-foreground focus:ring-2 focus:ring-secondary-foreground/20 focus:border-secondary-foreground resize-none h-32 transition-all"
                />
              </label>
            </motion.div>

            <motion.button 
              type="submit"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
              className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-semibold text-lg hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-1 transition-all duration-300"
            >
              Guardar reflexión
            </motion.button>
          </form>
        )}
      </div>
    </AppLayout>
  );
}
