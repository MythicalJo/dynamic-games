import { Gamepad2, Languages, MonitorPlay, Trophy, Tv } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import type { DisplayMode } from '../../types/show';
import { getActiveGameModule } from '../../modules/registry';

export function DisplaySwitcherBar() {
  const { state, setDisplayMode, language, setLanguage, t } = useShow();
  const activeModule = getActiveGameModule(state.activeModuleId);
  const localizedModuleName =
    t.modules.list[activeModule.id as keyof typeof t.modules.list]?.shortName ??
    activeModule.shortName;

  const displayModes: {
    mode: DisplayMode;
    label: string;
    hotkey: string;
    icon: typeof Tv;
  }[] = [
    {
      mode: 'lobby',
      label: t.switcher.lobby,
      hotkey: '⇧1',
      icon: Tv,
    },
    {
      mode: 'leaderboard',
      label: t.switcher.leaderboard,
      hotkey: '⇧2',
      icon: Trophy,
    },
    {
      mode: 'game',
      label: t.switcher.activeGame,
      hotkey: '⇧3',
      icon: Gamepad2,
    },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-studio-950/90 px-5 py-3.5 backdrop-blur-xl">
      <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
        {/* Live On-Air Status Badge */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/50 bg-rose-500/15 px-3 py-1.5 glow-live">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500" />
              <span className="font-mono text-xs font-extrabold tracking-widest text-rose-200 uppercase">
                {t.switcher.onAir}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <MonitorPlay className="h-4 w-4 text-cyan-400" />
              <span className="font-medium text-slate-400">{t.switcher.displayScreen}</span>
              <span className="font-bold text-white">
                {state.displayMode === 'lobby' && t.switcher.lobby}
                {state.displayMode === 'leaderboard' && t.switcher.leaderboard}
                {state.displayMode === 'game' && localizedModuleName}
              </span>
            </div>
          </div>

          {/* Mobile/Compact ES | EN Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-white/15 bg-studio-900 p-1 xl:hidden">
            <Languages className="mx-1 h-3.5 w-3.5 text-cyan-300" />
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold transition ${
                language === 'es'
                  ? 'bg-amber-400 text-studio-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ES
            </button>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`rounded-lg px-2.5 py-1 font-mono text-xs font-extrabold transition ${
                language === 'en'
                  ? 'bg-cyan-400 text-studio-950'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>

        {/* Right Side: Quick Display Switcher + Desktop ES | EN Language Toggle */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="grid flex-1 grid-cols-1 gap-2 sm:grid-cols-3">
            {displayModes.map(({ mode, label, hotkey, icon: Icon }) => {
              const isActive = state.displayMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setDisplayMode(mode)}
                  className={`flex items-center justify-between gap-2.5 rounded-xl border px-3.5 py-2.5 text-sm font-bold transition active:scale-[0.98] ${
                    isActive
                      ? mode === 'leaderboard'
                        ? 'border-amber-400/80 bg-gradient-to-r from-amber-500/25 to-yellow-400/15 text-amber-200 glow-gold'
                        : 'border-cyan-400/80 bg-gradient-to-r from-cyan-400/25 to-sky-500/15 text-cyan-100 glow-cyan'
                      : 'border-white/10 bg-studio-900/90 text-slate-300 hover:border-white/25 hover:bg-studio-850 hover:text-white'
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Icon
                      className={`h-4 w-4 shrink-0 ${
                        isActive
                          ? mode === 'leaderboard'
                            ? 'text-amber-300'
                            : 'text-cyan-300'
                          : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{label}</span>
                  </span>
                  <kbd
                    className={`hidden rounded px-1.5 py-0.5 font-mono text-[10px] font-bold sm:inline-block ${
                      isActive ? 'bg-black/30 text-white' : 'bg-white/5 text-slate-500'
                    }`}
                  >
                    {hotkey}
                  </kbd>
                </button>
              );
            })}
          </div>

          {/* Desktop ES | EN Segmented Toggle (Synced in Real-Time to /display) */}
          <div
            className="hidden shrink-0 items-center gap-1 rounded-xl border border-white/15 bg-studio-900 p-1 xl:flex"
            title="Idioma / Language (syncs live to /display)"
          >
            <Languages className="mx-1.5 h-4 w-4 text-cyan-300" />
            <button
              type="button"
              onClick={() => setLanguage('es')}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-extrabold transition ${
                language === 'es'
                  ? 'bg-amber-400 text-studio-950 shadow-[0_0_12px_rgba(255,201,51,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ES
            </button>
            <span className="text-xs text-slate-600">|</span>
            <button
              type="button"
              onClick={() => setLanguage('en')}
              className={`rounded-lg px-2.5 py-1.5 font-mono text-xs font-extrabold transition ${
                language === 'en'
                  ? 'bg-cyan-400 text-studio-950 shadow-[0_0_12px_rgba(0,229,255,0.4)]'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
