import { motion } from 'framer-motion';
import { Sparkles, Users } from 'lucide-react';
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
    <div className="flex h-full w-full flex-col items-center justify-between px-10 py-10 md:px-16 md:py-12">
      {/* Top Broadcast Pill */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="flex items-center gap-3 rounded-full border border-cyan-400/35 bg-studio-900/75 px-6 py-2 shadow-[0_0_30px_rgba(0,229,255,0.18)] backdrop-blur-md"
      >
        <Sparkles className="h-4 w-4 text-amber-300" />
        <span className="font-mono text-sm font-bold tracking-[0.28em] text-cyan-300 uppercase">
          {eventMeta.subtitle || t.lobby.defaultSubtitle}
        </span>
        <Sparkles className="h-4 w-4 text-amber-300" />
      </motion.div>

      {/* Center Hero Title + Contenders Roster */}
      <div className="flex w-full flex-1 flex-col items-center justify-center gap-8 py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative text-center"
        >
          {/* Radiant Back Glow */}
          <div className="pointer-events-none absolute inset-0 -z-10 mx-auto h-full w-4/5 rounded-full bg-amber-400/15 blur-[80px]" />

          <h1
            className="font-display font-black uppercase tracking-[0.04em] text-gradient-gold drop-shadow-[0_10px_35px_rgba(245,168,0,0.35)]"
            style={{ fontSize: 'clamp(4rem, 10.5vw, 9.5rem)', lineHeight: 0.92 }}
          >
            {eventMeta.title || 'PUNTOS RÁPIDOS'}
          </h1>

          {eventMeta.tagline && (
            <p
              className="mt-4 font-display font-bold tracking-[0.26em] text-slate-200/95 uppercase drop-shadow"
              style={{ fontSize: 'clamp(1.1rem, 2.2vw, 2rem)' }}
            >
              {eventMeta.tagline}
            </p>
          )}
        </motion.div>

        {/* Competing Friend Pairs Showcase */}
        {teams.length > 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="flex w-full flex-col items-center gap-4"
          >
            <div className="flex items-center gap-2.5 text-xs font-bold tracking-[0.25em] text-slate-400 uppercase">
              <span className="h-px w-10 bg-gradient-to-r from-transparent to-cyan-400/60" />
              <Users className="h-4 w-4 text-cyan-400" />
              <span>{t.lobby.competingPairs(teams.length)}</span>
              <span className="h-px w-10 bg-gradient-to-l from-transparent to-cyan-400/60" />
            </div>

            <div className={`grid w-full gap-4 ${gridCols}`}>
              {teams.map((team, index) => {
                const accent = TEAM_ACCENTS[team.accent];
                return (
                  <motion.div
                    key={team.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.18 + index * 0.05, duration: 0.4 }}
                    className={`relative overflow-hidden rounded-2xl border ${accent.border} bg-studio-900/75 px-6 py-4 backdrop-blur-md ${accent.glow}`}
                  >
                    <div className={`absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b ${accent.bar}`} />
                    <div className="pl-2">
                      <div className="truncate font-display text-2xl font-extrabold tracking-wide text-white uppercase md:text-3xl">
                        {team.name}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-base font-semibold text-slate-200/90 md:text-lg">
                        <span className="truncate">{team.playerA}</span>
                        <span className={`font-black ${accent.text}`}>&amp;</span>
                        <span className="truncate">{team.playerB}</span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-2xl border border-white/10 bg-studio-900/60 px-8 py-5 text-center backdrop-blur-md"
          >
            <p className="font-display text-2xl font-bold tracking-wider text-slate-300 uppercase">
              {t.lobby.teamsLoading}
            </p>
          </motion.div>
        )}
      </div>

      {/* Bottom Broadcast Status Bar */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.45 }}
        className="flex items-center gap-3.5 rounded-full border border-amber-400/30 bg-studio-900/80 px-7 py-2.5 backdrop-blur-md"
      >
        <span className="relative flex h-3 w-3">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-400" />
        </span>
        <span className="font-display text-xl font-bold tracking-[0.18em] text-amber-200 uppercase md:text-2xl">
          {eventMeta.lobbyMessage || t.lobby.defaultMessage}
        </span>
      </motion.div>
    </div>
  );
}
