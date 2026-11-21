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
import { SoundboardBar } from '../components/host/SoundboardBar';
import { useHostShortcuts } from '../hooks/useHostShortcuts';
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

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      {/* ================================================================= */}
      {/* SINGLE MINIMALIST TOP HEADER BAR                                  */}
      {/* ================================================================= */}
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          {/* Left: Brand + Audience Screen Launcher */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 font-bold tracking-tight text-ink">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="text-sm uppercase">{state.eventMeta.title || 'PUNTOS RÁPIDOS'}</span>
            </Link>

            <span className="hidden h-4 w-px bg-line sm:inline-block" />

            <button
              type="button"
              onClick={handleLaunchDisplay}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2"
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
          <nav className="flex items-center rounded-full border border-line bg-surface p-1">
            <button
              type="button"
              onClick={() => setTopMode('live')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                topMode === 'live'
                  ? 'bg-ink text-canvas'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <Radio className="h-3.5 w-3.5" />
              <span>En Vivo</span>
            </button>
            <button
              type="button"
              onClick={() => setTopMode('setup')}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-bold transition ${
                topMode === 'setup'
                  ? 'bg-ink text-canvas'
                  : 'text-ink-muted hover:text-ink'
              }`}
            >
              <ListChecks className="h-3.5 w-3.5" />
              <span>Preparación / Equipos</span>
            </button>
          </nav>

          {/* Right: 4-Palette Real-Time Theme Switcher (Blanco / Sepia / Negro / Pizarra) */}
          <div
            className="flex items-center gap-0.5 rounded-full border border-line bg-surface p-1"
            title="Tema visual (sincronizado en tiempo real con la pantalla del público)"
          >
            {THEMES.map((item) => {
              const active = theme === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTheme(item.id)}
                  className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition ${
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
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
        {topMode === 'live' ? (
          <div className="space-y-6">
            {/* STREAMLINED LIVE BAR: Screen Switcher + Game Picker */}
            <section className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-4 lg:flex-row lg:items-center lg:justify-between">
              {/* Active Screen Switcher */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="mr-1 inline-flex items-center gap-1.5 font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
                  <span className="h-2 w-2 rounded-full bg-err" />
                  Pantalla:
                </span>
                {screenModes.map(({ mode, label, hotkey, icon: Icon }) => {
                  const isActive = state.displayMode === mode;
                  return (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setDisplayMode(mode)}
                      className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition active:scale-[0.98] ${
                        isActive
                          ? 'border-accent bg-accent text-accent-fg'
                          : 'border-line bg-canvas text-ink hover:border-line-strong'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span>{label}</span>
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

              {/* Quick Active Game Module Switcher */}
              <div className="flex flex-wrap items-center gap-1.5 border-t border-line pt-3 lg:border-t-0 lg:pt-0">
                {GAME_MODULES.map((mod) => {
                  const isSelected = activeModule.id === mod.id;
                  const copy =
                    t.modules.list[mod.id as keyof typeof t.modules.list] ?? mod;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => {
                        setActiveModuleId(mod.id);
                        if (state.displayMode !== 'game') {
                          setDisplayMode('game');
                        }
                      }}
                      className={`rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition ${
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
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
              <div className="min-w-0 lg:col-span-8">
                {ActiveHostComponent && <ActiveHostComponent mode="live" />}
              </div>

              <div className="lg:col-span-4">
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
          <div className="space-y-6">
            {/* Clean Setup Sub-Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSetupSection('teams')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                    setupSection === 'teams'
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  <Users className="h-4 w-4" />
                  <span>Equipos y Parejas ({state.teams.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupSection('games')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                    setupSection === 'games'
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  <Gamepad2 className="h-4 w-4" />
                  <span>Preguntas y Juegos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSetupSection('event')}
                  className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold transition ${
                    setupSection === 'event'
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  <Database className="h-4 w-4" />
                  <span>Portada y Respaldo JSON</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setTopMode('live')}
                className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-accent-fg transition hover:opacity-90"
              >
                Ir a En Vivo →
              </button>
            </div>

            {setupSection === 'teams' && <TeamsManagerPanel />}

            {setupSection === 'games' && (
              <div className="space-y-5">
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
                        className={`rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
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

      {/* SLEEK COMPACT SOUNDBOARD FOOTER */}
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
