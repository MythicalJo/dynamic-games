import { AlertTriangle, RotateCcw, X } from 'lucide-react';

interface ResetEventModalProps {
  open: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

/**
 * Modal de confirmación global para "Reiniciar Todo":
 * Pone en 0 todos los puntajes, reinicia todos los juegos e historiales,
 * limpia localStorage y regresa /display a la Portada en tiempo real.
 */
export function ResetEventModal({ open, onClose, onConfirmReset }: ResetEventModalProps) {
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
                Confirmación requerida
              </div>
              <h3 className="text-base font-extrabold text-ink">Reiniciar Todo</h3>
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

        <div className="space-y-4">
          <p className="text-sm font-semibold leading-relaxed text-ink">
            ¿Seguro que quieres reiniciar toda la partida? Se pondrán en cero los puntajes y se
            reiniciarán todos los juegos.
          </p>

          <p className="rounded-xl border border-line bg-canvas p-3 text-xs leading-relaxed text-ink-muted">
            Esto borrará el progreso guardado en <code className="font-mono">localStorage</code>,
            reiniciará rondas, temporizadores e historial de preguntas usadas y devolverá la
            pantalla del público a la Portada.
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
      </div>
    </div>
  );
}
