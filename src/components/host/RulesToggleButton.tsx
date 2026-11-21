import { BookOpen, EyeOff } from 'lucide-react';
import { useShow } from '../../context/ShowContext';

interface RulesToggleButtonProps {
  moduleId: string;
}

/**
 * Botón compacto "Mostrar Reglas" dentro del panel de cada juego en /host.
 * Proyecta u oculta en tiempo real el overlay minimalista de 3 reglas en /display.
 */
export function RulesToggleButton({ moduleId }: RulesToggleButtonProps) {
  const { state, toggleRulesOverlay } = useShow();
  const isShowing = state.rulesOverlayModuleId === moduleId;

  return (
    <button
      type="button"
      onClick={() => toggleRulesOverlay(moduleId)}
      className={`inline-flex min-h-[34px] items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition active:scale-95 ${
        isShowing
          ? 'border-accent bg-accent text-accent-fg shadow-xs'
          : 'border-line bg-canvas text-ink hover:border-line-strong hover:bg-surface-2'
      }`}
      title="Mostrar u ocultar las reglas rápidas de este juego en la pantalla del público"
    >
      {isShowing ? (
        <>
          <EyeOff className="h-3.5 w-3.5 shrink-0" />
          <span>Ocultar Reglas</span>
        </>
      ) : (
        <>
          <BookOpen className="h-3.5 w-3.5 shrink-0 text-accent" />
          <span>Mostrar Reglas</span>
        </>
      )}
    </button>
  );
}
