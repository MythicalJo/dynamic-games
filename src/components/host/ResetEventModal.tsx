import { useEffect, useState } from 'react';
import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface ResetEventModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

/**
 * Modal de confirmación en 2 pasos para "Reiniciar Evento":
 * Paso 1: "¿Seguro que quieres borrar todos los puntajes y reiniciar el evento?"
 * Paso 2: Confirmación definitiva antes de limpiar localStorage y poner puntajes en 0.
 */
export function ResetEventModal({ open, onClose, onConfirmReset }: ResetEventModalProps) {
  const [step, setStep] = useState<1 | 2>(1);

  useEffect(() => {
    if (open) {
      setStep(1);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/55 p-3 backdrop-blur-xs sm:items-center"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[95vw] overflow-hidden rounded-2xl border border-err/40 bg-surface p-5 text-ink shadow-2xl sm:max-w-md"
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-err-soft text-err">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] font-bold tracking-wider text-err uppercase">
                Paso {step} de 2 · Acción protegida
              </div>
              <h3 className="text-base font-extrabold text-ink">Reiniciar Evento</h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-ink-muted hover:text-ink"
            aria-label="Cerrar confirmación"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm font-semibold leading-relaxed text-ink">
              ¿Seguro que quieres borrar todos los puntajes y reiniciar el evento?
            </p>
            <p className="rounded-xl border border-line bg-canvas p-3 text-xs leading-relaxed text-ink-muted">
              Esto limpiará el guardado automático en <code className="font-mono">localStorage</code>,
              pondrá todos los puntajes en <strong>0</strong> y reiniciará el historial de preguntas usadas,
              el podio y el desempate (tus parejas registradas se conservan listas en 0 puntos).
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onClose}
                className="min-h-[44px] rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-bold text-ink hover:bg-surface-2"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="min-h-[44px] rounded-xl bg-warn px-4 py-2 text-xs font-extrabold text-warn-fg hover:opacity-90"
              >
                Sí, continuar →
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-xl border border-err/40 bg-err-soft p-3.5 text-sm font-bold leading-snug text-err">
              Confirmación final: todos los puntajes volverán a 0 y se borrará el progreso guardado del evento.
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="min-h-[44px] rounded-xl border border-line bg-canvas px-4 py-2 text-xs font-bold text-ink hover:bg-surface-2"
              >
                ← Volver
              </button>
              <button
                type="button"
                onClick={() => {
                  onConfirmReset();
                  onClose();
                }}
                className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-err px-4 py-2 text-xs font-extrabold text-err-fg hover:opacity-90 active:scale-95"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Sí, reiniciar todo</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
