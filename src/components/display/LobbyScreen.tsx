import { motion } from 'framer-motion';
import { useShow } from '../../context/ShowContext';
import { TEAM_ACCENTS } from '../../types/show';

export function LobbyScreen() {
  const { state, t } = useShow();
  const { eventMeta, teams } = state;

  const gridCols =
    teams.length <= 2
      ? 'grid-cols-1 md:grid-cols-2 max-w-4xl'
      : teams.length <= 4
        ? 'grid-cols-2 max-w-5xl'
        : teams.length <= 6
          ? 'grid-cols-2 lg:grid-cols-3 max-w-6xl'
          : 'grid-cols-2 lg:grid-cols-4 max-w-7xl';

  return (
    <div className="flex h-full w-full flex-col items-center justify-between px-12 py-12 md:px-20 md:py-14">
      {/* Top Eyebrow Label */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-full border border-line bg-surface px-5 py-1.5"
      >
        <span className="font-mono text-xs font-bold tracking-[0.26em] text-accent uppercase">
          {eventMeta.subtitle || t.lobby.defaultSubtitle}
        </span>
      </motion.div>

      {/* Center Editorial Hero + Pairs Grid */}
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-center"
        >
          <h1
            className="font-extrabold tracking-tight text-ink uppercase"
            style={{ fontSize: 'clamp(3.6rem, 9.2vw, 8.2rem)', lineHeight: 0.94 }}
          >
            {eventMeta.title || 'PUNTOS RÁPIDOS'}
          </h1>

          {eventMeta.tagline && (
            <p
              className="mt-5 font-mono font-semibold tracking-[0.22em] text-ink-muted uppercase"
              style={{ fontSize: 'clamp(0.9rem, 1.5vw, 1.3rem)' }}
            >
              {eventMeta.tagline}
            </p>
          )}
        </motion.div>

        {teams.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.45 }}
            className="flex w-full flex-col items-center gap-4"
          >
            <span className="font-mono text-xs font-bold tracking-[0.24em] text-ink-subtle uppercase">
              {t.lobby.competingPairs(teams.length)}
            </span>

            <div className={`grid w-full gap-4 ${gridCols}`}>
              {teams.map((team) => {
                const accent = TEAM_ACCENTS[team.accent];
                return (
                  <div
                    key={team.id}
                    className="flex items-center gap-4 rounded-2xl border border-line bg-surface px-6 py-5"
                  >
                    <span
                      className="h-3.5 w-3.5 shrink-0 rounded-full"
                      style={{ backgroundColor: accent.hex }}
                    />
                    <div className="min-w-0 text-left">
                      <div className="truncate text-2xl font-extrabold tracking-tight text-ink uppercase md:text-3xl">
                        {team.name}
                      </div>
                      <div className="mt-0.5 truncate text-base font-medium text-ink-muted md:text-lg">
                        {team.playerA} y {team.playerB}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <div className="rounded-2xl border border-line bg-surface px-8 py-5 text-center">
            <p className="text-xl font-bold tracking-wide text-ink-muted uppercase">
              {t.lobby.teamsLoading}
            </p>
          </div>
        )}
      </div>

      {/* Quiet Editorial Bottom Status */}
      <div className="flex items-center gap-3 rounded-full border border-line bg-surface px-6 py-2">
        <span className="h-2.5 w-2.5 rounded-full bg-accent" />
        <span className="font-mono text-sm font-bold tracking-[0.18em] text-ink uppercase md:text-base">
          {eventMeta.lobbyMessage || t.lobby.defaultMessage}
        </span>
      </div>
    </div>
  );
}
