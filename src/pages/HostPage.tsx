import { useState } from 'react';
import {
  Database,
  ExternalLink,
  Gamepad2,
  ListChecks,
  Radio,
  Trophy,
  Tv,
  Users,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShowProvider, useShow } from '../context/ShowContext';
import { GAME_MODULES, getActiveGameModule } from '../modules/registry';
import { TeamsManagerPanel } from '../components/host/TeamsManagerPanel';
import { EventDataPanel } from '../components/host/EventDataPanel';
import { QuickScoresRail } from '../components/host/QuickScoresRail';
import { RemoteConnectBar } from '../components/host/RemoteConnectBar';
import { SoundboardBar } from '../components/host/SoundboardBar';
import { useHostShortcuts } from '../hooks/useHostShortcuts';
import { useWakeLock } from '../hooks/useWakeLock';
import { getDisplayWindowUrl } from '../lib/i18n';
import { THEMES, type DisplayMode } from '../types/show';

type TopMode = 'live' | 'setup';
type SetupSection = 'teams' | 'games' | 'event';

function HostWorkspace() {
  const {
    state,
    theme,
    setTheme,
    setDisplayMode,
    setActiveModuleId,
    connectedDisplays,
    t,
  } = useShow();

  const [topMode, setTopMode] = useState<TopMode>('live');
  const [setupSection, setSetupSection] = useState<SetupSection>('teams');
  const { shortcutNotice } = useHostShortcuts();
  useWakeLock(true);

  const activeModule = getActiveGameModule(state.activeModuleId);
  const ActiveHostComponent = activeModule.HostComponent;

  const handleLaunchDisplay = () => {
    window.open(
      getDisplayWindowUrl(),
      'PuntosRapidosDisplay',
      'width=1280,height=720,menubar=no,toolbar=no'
    );
  };

  const screenModes: { mode: DisplayMode; label: string; hotkey: string; icon: typeof Tv }[] = [
    { mode: 'lobby', label: t.switcher.lobby, hotkey: '⇧1', icon: Tv },
    { mode: 'leaderboard', label: t.switcher.leaderboard, hotkey: '⇧2', icon: Trophy },
    { mode: 'game', label: t.switcher.activeGame, hotkey: '⇧3', icon: Gamepad2 },
  ];

  const currentScreenName =
    state.displayMode === 'lobby'
      ? t.switcher.lobby
      : state.displayMode === 'leaderboard'
        ? t.switcher.leaderboard
        : t.switcher.activeGame;

  return (
    <div className="flex min-h-screen w-full max-w-full flex-col overflow-x-hidden bg-canvas text-ink">
      {/* ================================================================= */}
      {/* SINGLE MINIMALIST TOP HEADER BAR                                  */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-30 w-full max-w-full border-b border-line bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2.5 px-3 py-2.5 sm:px-6 sm:py-3">
          {/* Left: Brand + Audience Screen Launcher */}
          <div className="flex min-w-0 flex-wrap items-center gap-2.5">
            <Link to="/" className="flex min-w-0 items-center gap-2 font-bold tracking-tight text-ink">
              <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-accent" />
              <span className="truncate text-sm uppercase">
                {state.eventMeta.title || 'PUNTOS RÁPIDOS'}
              </span>
            </Link>

            <span className="hidden h-4 w-px bg-line sm:inline-block" />

            <button
              type="button"
              onClick={handleLaunchDisplay}
              className="hidden items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2 sm:inline-flex"
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  connectedDisplays > 0 ? 'bg-ok' : 'bg-ink-subtle'
                }`}
              />
              <span>
                {connectedDisplays > 0
                  ? t.sidebar.liveCount(connectedDisplays)
                  : t.sidebar.launchDisplay}
              </span>
              <ExternalLink className="h-3 w-3 text-ink-subtle" />
            </button>
          </div>

          {/* Center: Clean 2-Mode Top Tabs — "En Vivo" vs "Preparación / Equipos" */}
          <nav className="order-3 flex w-full max-w-full items-center rounded-full border border-line bg-surface p-1 sm:order-2 sm:w-auto">
            <button
              type="button"
              onClick={() => setTopMode('live')}
              className={`inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition sm:min-h-0 sm:flex-none sm:px-4 ${
                topMode === 'live'
                  ? 'bg-ink text-canvas'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Radio className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">En Vivo</span>
            </button>
            <button
              type="button"
              onClick={() => setTopMode('setup')}
              className={`inline-flex min-h-[38px] flex-1 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold transition sm:min-h-0 sm:flex-none sm:px-4 ${
                topMode === 'setup'
                  ? 'bg-ink text-canvas'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <ListChecks className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Preparación / Equipos</span>
            </button>
          </nav>

          {/* Right: 4-Palette Real-Time Theme Switcher (Blanco / Sepia / Negro / Pizarra) */}
          <div
            className="order-2 flex max-w-full flex-wrap items-center gap-0.5 rounded-full border border-line bg-surface p-1 sm:order-3"
            title="Tema visual (sincronizado en tiempo real con la pantalla del público)"
          >
            {THEMES.map((item) => {
              const active = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`flex items-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold transition sm:px-2.5 sm:py-1 ${
                    active
                      ? 'bg-canvas text-ink shadow-xs ring-1 ring-line-strong'
                      : 'text-ink-muted hover:text-ink'
                  }`}
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: item.bgSwatch }}
                  />
                  <span className="hidden md:inline">{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ================================================================= */}
      {/* MAIN WORKSPACE                                                    */}
      {/* ================================================================= */}
      <main className="mx-auto w-full max-w-7xl flex-1 space-y-4 overflow-x-hidden px-3 py-4 sm:space-y-5 sm:px-6 sm:py-6">
        {/* Compact Cross-Device Remote Display Connector */}
        <RemoteConnectBar />

        {topMode === 'live' ? (
          <div className="w-full max-w-full space-y-5">
            {/* STREAMLINED LIVE BAR: Explicit Display Switcher + Decoupled Game Tabs */}
            <section className="flex w-full max-w-full flex-col gap-3 rounded-2xl border border-line bg-surface p-3.5 sm:p-4">
              {/* Row 1: Explicit Audience Screen Switcher (ONLY these buttons change /display mode) */}
              <div className="flex w-full max-w-full flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
                    <span className="h-2 w-2 rounded-full bg-err" />
                    Pantalla del público:
                  </span>
                  {state.displayMode !== 'game' && (
                    <span className="rounded-full border border-line bg-canvas px-2.5 py-0.5 text-[11px] font-medium text-ink-muted">
                      Proyectando «{currentScreenName}» · puedes preparar juegos abajo sin cambiarla
                    </span>
                  )}
                </div>

                <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-3 lg:w-auto lg:flex lg:flex-wrap lg:items-center">
                  {screenModes.map(({ mode, label, hotkey, icon: Icon }) => {
                    const isActive = state.displayMode === mode;
                    return (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setDisplayMode(mode)}
                        className={`inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition active:scale-[0.98] sm:min-h-[40px] lg:w-auto ${
                          isActive
                            ? 'border-accent bg-accent text-accent-fg'
                            : 'border-line bg-canvas text-ink hover:border-line-strong'
                        }`}
                      >
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        <span className="text-center leading-tight">{label}</span>
                        <kbd
                          className={`hidden font-mono text-[10px] sm:inline ${
                            isActive ? 'opacity-75' : 'text-ink-subtle'
                          }`}
                        >
                          {hotkey}
                        </kbd>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Row 2: Decoupled Host Game Switcher (NEVER forces /display away from Lobby/Leaderboard) */}
              <div className="flex w-full max-w-full flex-wrap items-center gap-1.5 border-t border-line pt-3">
                <span className="mr-1 font-mono text-[10px] font-bold tracking-wider text-ink-subtle uppercase">
                  Panel de juego:
                </span>
                {GAME_MODULES.map((mod) => {
                  const isSelected = activeModule.id === mod.id;
                  const copy =
                    t.modules.list[mod.id as keyof typeof t.modules.list] ?? mod;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => setActiveModuleId(mod.id)}
                      className={`min-h-[38px] rounded-lg border px-3 py-1.5 text-xs font-semibold transition sm:min-h-0 sm:px-2.5 ${
                        isSelected
                          ? 'border-ink bg-ink text-canvas'
                          : 'border-line bg-canvas text-ink-muted hover:border-line-strong hover:text-ink'
                      }`}
                    >
                      {copy.shortName}
                    </button>
                  );
                })}
              </div>
            </section>

            {/* ESSENTIAL LIVE 2-COLUMN DESK: Current Round Controls + Quick Score Actions */}
            <div className="grid w-full max-w-full grid-cols-1 items-start gap-5 lg:grid-cols-12">
              <div className="w-full max-w-full min-w-0 lg:col-span-8">
                {ActiveHostComponent && <ActiveHostComponent mode="live" />}
              </div>

              <div className="w-full max-w-full min-w-0 lg:col-span-4">
                <QuickScoresRail
                  onOpenTeams={() => {
                    setTopMode('setup');
                    setSetupSection('teams');
                  }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* ============================================================= */
          /* PREPARACIÓN / EQUIPOS (SETUP WORKSPACE)                       */
          /* ============================================================= */
          <div className="w-full max-w-full space-y-5">
            {/* Clean Setup Sub-Tabs */}
            <div className="flex w-full max-w-full flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSetupSection('teams')}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:min-h-0 sm:px-4 ${
                    setupSection === 'teams'
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  <Users className="h-4 w-4 shrink-0" />
                  <span>Equipos y Parejas ({state.teams.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupSection('games')}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:min-h-0 sm:px-4 ${
                    setupSection === 'games'
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  <Gamepad2 className="h-4 w-4 shrink-0" />
                  <span>Preguntas y Juegos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupSection('event')}
                  className={`inline-flex min-h-[40px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:min-h-0 sm:px-4 ${
                    setupSection === 'event'
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  <Database className="h-4 w-4 shrink-0" />
                  <span>Portada y Respaldo JSON</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTopMode('live')}
                className="min-h-[40px] rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-fg transition hover:opacity-90 sm:min-h-0"
              >
                Ir a En Vivo →
              </button>
            </div>

            {setupSection === 'teams' && <TeamsManagerPanel />}

            {setupSection === 'games' && (
              <div className="w-full max-w-full space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  {GAME_MODULES.map((mod) => {
                    const isSelected = activeModule.id === mod.id;
                    const copy =
                      t.modules.list[mod.id as keyof typeof t.modules.list] ?? mod;
                    return (
                      <button
                        key={mod.id}
                        type="button"
                        onClick={() => setActiveModuleId(mod.id)}
                        className={`min-h-[38px] rounded-xl border px-3.5 py-2 text-xs font-bold transition sm:min-h-0 ${
                          isSelected
                            ? 'border-accent bg-accent text-accent-fg'
                            : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink'
                        }`}
                      >
                        {copy.shortName}
                      </button>
                    );
                  })}
                </div>

                {ActiveHostComponent && <ActiveHostComponent mode="setup" />}
              </div>
            )}

            {setupSection === 'event' && <EventDataPanel />}
          </div>
        )}
      </main>

      {/* SLEEK COMPACT SOUNDBOARD FOOTER + MOBILE-FRIENDLY MUSIC MODAL */}
      <SoundboardBar shortcutNotice={shortcutNotice} />
    </div>
  );
}

export function HostPage() {
  return (
    <ShowProvider role="host">
      <HostWorkspace />
    </ShowProvider>
  );
}
