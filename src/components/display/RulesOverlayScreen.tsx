import { motion } from 'framer-motion';
import { getGameRules } from '../../lib/gameRules';

interface RulesOverlayScreenProps {
  moduleId: string;
}

export function RulesOverlayScreen({ moduleId }: RulesOverlayScreenProps) {
  const rules = getGameRules(moduleId);
  if (!rules) return null;

  const Icon = rules.icon;

  return (
    <motion.div
      key={`rules-${rules.moduleId}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-30 flex h-full w-full flex-col justify-between bg-canvas px-10 py-10 text-ink md:px-20 md:py-14"
    >
      {/* Top Eyebrow */}
      <div className="flex items-center justify-between gap-4 border-b border-line pb-5">
        <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-1.5 font-mono text-xs font-bold tracking-[0.24em] text-accent uppercase">
          <span className="h-2 w-2 rounded-full bg-accent" />
          REGLAS RÁPIDAS
        </span>
        <span className="font-mono text-xs font-bold tracking-[0.2em] text-ink-subtle uppercase">
          {rules.subtitle}
        </span>
      </div>

      {/* Main Centered Icon + Title + 3 Giant Readable Bullets */}
      <div className="my-auto flex w-full max-w-5xl flex-col gap-8 self-center py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.32 }}
          className="flex items-center gap-5"
        >
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-2 border-accent bg-accent-soft text-accent md:h-20 md:w-20">
            <Icon className="h-9 w-9 md:h-11 md:w-11" />
          </div>
          <h1
            className="font-extrabold tracking-tight text-ink uppercase"
            style={{ fontSize: 'clamp(2.4rem, 5.4vw, 4.6rem)', lineHeight: 0.98 }}
          >
            {rules.title}
          </h1>
        </motion.div>

        <ol className="space-y-4 md:space-y-5">
          {rules.bullets.map((bullet, idx) => (
            <motion.li
              key={idx}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * (idx + 1), duration: 0.34 }}
              className="flex items-start gap-5 rounded-3xl border border-line bg-surface px-7 py-6 md:px-9 md:py-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-accent font-mono text-2xl font-extrabold text-accent-fg md:h-14 md:w-14">
                {idx + 1}
              </span>
              <p
                className="pt-0.5 font-bold leading-snug tracking-tight text-ink"
                style={{ fontSize: 'clamp(1.35rem, 2.6vw, 2.35rem)' }}
              >
                {bullet}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Quiet Editorial Footer */}
      <div className="text-center font-mono text-xs font-bold tracking-[0.26em] text-ink-subtle uppercase">
        ¿LISTOS? ¡EMPEZAMOS EN SEGUIDA!
      </div>
    </motion.div>
  );
}
