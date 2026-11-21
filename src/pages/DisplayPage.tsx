import { AnimatePresence, motion } from 'framer-motion';
import { ShowProvider, useShow } from '../context/ShowContext';
import { StudioBackdrop } from '../components/display/StudioBackdrop';
import { LobbyScreen } from '../components/display/LobbyScreen';
import { LeaderboardScreen } from '../components/display/LeaderboardScreen';
import { PodiumScreen } from '../components/display/PodiumScreen';
import { TiebreakerDisplay } from '../components/display/TiebreakerDisplay';
import { RulesOverlayScreen } from '../components/display/RulesOverlayScreen';
import { getActiveGameModule } from '../modules/registry';
import { useWakeLock } from '../hooks/useWakeLock';

function DisplayViewport() {
  const { state } = useShow();
  useWakeLock(true);
  const activeModule = getActiveGameModule(state.activeModuleId);
  const ActiveModuleDisplay = activeModule.DisplayComponent;

  return (
    <StudioBackdrop>
      <AnimatePresence mode="wait">
        {state.displayMode === 'lobby' && (
          <motion.div
            key="display-lobby"
            initial={{ opacity: 0, scale: 0.985 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.015 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            <LobbyScreen />
          </motion.div>
        )}

        {state.displayMode === 'leaderboard' && (
          <motion.div
            key="display-leaderboard"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            <LeaderboardScreen />
          </motion.div>
        )}

        {state.displayMode === 'podium' && (
          <motion.div
            key="display-podium"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            <PodiumScreen />
          </motion.div>
        )}

        {state.displayMode === 'tiebreaker' && (
          <motion.div
            key="display-tiebreaker"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            <TiebreakerDisplay />
          </motion.div>
        )}

        {state.displayMode === 'game' && (
          <motion.div
            key={`display-game-${activeModule.id}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
            className="h-full w-full"
          >
            {ActiveModuleDisplay ? <ActiveModuleDisplay /> : <LobbyScreen />}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Per-Game Quick Rules Full-Screen Overlay */}
      <AnimatePresence>
        {state.rulesOverlayModuleId && (
          <RulesOverlayScreen moduleId={state.rulesOverlayModuleId} />
        )}
      </AnimatePresence>
    </StudioBackdrop>
  );
}

export function DisplayPage() {
  return (
    <ShowProvider role="display">
      <DisplayViewport />
    </ShowProvider>
  );
}
