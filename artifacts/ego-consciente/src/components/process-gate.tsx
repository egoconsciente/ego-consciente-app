import { Link } from "wouter";
import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/app-layout";

export function ProcessGate() {
  return (
    <AppLayout>
      <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg
              viewBox="0 0 100 100"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-8 h-8 text-primary"
            >
              {[0, 120, 240].map((angle) => (
                <ellipse
                  key={angle}
                  cx="50"
                  cy="32"
                  rx="16"
                  ry="28"
                  transform={`rotate(${angle} 50 52)`}
                />
              ))}
            </svg>
          </div>

          <h2 className="font-display text-2xl font-semibold text-foreground mb-3">
            Aún no has comenzado tu proceso
          </h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Esta sección estará disponible una vez que cruces el umbral e inicies tu camino de 40 días.
          </p>

          <Link
            href="/dashboard"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-medium text-lg hover:bg-primary/90 transition-all duration-300"
          >
            Volver al inicio
          </Link>
        </motion.div>
      </div>
    </AppLayout>
  );
}
