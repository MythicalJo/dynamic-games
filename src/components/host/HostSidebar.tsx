import {
  Database,
  ExternalLink,
  Gamepad2,
  LayoutDashboard,
  Radio,
  Users,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  Zap,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useShow } from '../../context/ShowContext';
import { getActiveGameModule } from '../../modules/registry';

export type HostTab = 'control' | 'teams' | 'game' | 'data';

interface HostSidebarProps {
  activeTab: HostTab;
  onSelectTab: (tab: HostTab) => void;
  onLaunchDisplay: () => void;
}

export function HostSidebar({ activeTab, onSelectTab, onLaunchDisplay }: HostSidebarProps) {
  const { state, connectedDisplays, transport, soundEnabled, setSoundEnabled, t } = useShow();
  const activeModule = getActiveGameModule(state.activeModuleId);
  const localizedActiveModName =
    t.modules.list[activeModule.id as keyof typeof t.modules.list]?.shortName ??
    activeModule.shortName;

  const navItems: { id: HostTab; label: string; subtitle: string; icon: typeof LayoutDashboard }[] = [
    {
      id: 'control',
      label: t.sidebar.nav.control.label,
      subtitle: t.sidebar.nav.control.subtitle,
      icon: LayoutDashboard,
    },
    {
      id: 'teams',
      label: t.sidebar.nav.teams.label,
      subtitle: t.sidebar.nav.teams.subtitle,
      icon: Users,
    },
    {
      id: 'game',
      label: t.sidebar.nav.game.label,
      subtitle: localizedActiveModName,
      icon: Gamepad2,
    },
    {
      id: 'data',
      label: t.sidebar.nav.data.label,
      subtitle: t.sidebar.nav.data.subtitle,
      icon: Database,
    },
  ];

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-white/10 bg-studio-900/95 lg:h-screen lg:w-72 lg:border-r lg:border-b-0">
      {/* Brand Header */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/50 bg-gradient-to-br from-amber-400/25 to-amber-600/15 glow-gold transition group-hover:scale-105">
            <Zap className="h-5 w-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <div className="truncate font-display text-xl font-black tracking-wide text-gradient-gold uppercase leading-none">
              {state.eventMeta.title || 'PUNTOS RÁPIDOS'}
            </div>
            <div className="mt-1 flex items-center gap-1.5 font-mono text-[10px] font-bold tracking-[0.2em] text-cyan-300 uppercase">
              <Radio className="h-3 w-3 text-rose-400" />
              <span>{t.sidebar.hostConsole}</span>
            </div>
          </div>
        </Link>
      </div>

      {/* Audience Display Connection & Launch Box */}
      <div className="border-b border-white/10 p-4">
        <div className="rounded-2xl border border-white/10 bg-studio-950/75 p-3.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-wider text-slate-400 uppercase">
              {t.sidebar.audienceScreen}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[11px] font-bold ${
                connectedDisplays > 0
                  ? 'border border-emerald-400/40 bg-emerald-400/15 text-emerald-300'
                  : 'border border-amber-400/35 bg-amber-400/10 text-amber-300'
              }`}
            >
              {connectedDisplays > 0 ? (
                <>
                  <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                  {t.sidebar.liveCount(connectedDisplays)}
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3" />
                  {t.sidebar.notOpen}
                </>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={onLaunchDisplay}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-3.5 py-2.5 text-sm font-extrabold text-studio-950 shadow-[0_0_20px_rgba(0,229,255,0.28)] transition hover:brightness-110 active:scale-[0.98]"
          >
            <ExternalLink className="h-4 w-4 stroke-[2.5]" />
            <span>
              {connectedDisplays > 0 ? t.sidebar.openAnotherDisplay : t.sidebar.launchDisplay}
            </span>
          </button>

          <div className="mt-2.5 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <Wifi className="h-3 w-3 text-cyan-400" />
              {transport === 'broadcast-channel' ? t.sidebar.broadcastApi : t.sidebar.storageSync}
            </span>
            <span className="font-mono text-slate-500">/#/display</span>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex flex-row gap-1.5 overflow-x-auto p-3 lg:flex-1 lg:flex-col lg:overflow-x-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const badge = item.id === 'teams' ? state.teams.length : null;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTab(item.id)}
              className={`group flex shrink-0 items-center gap-3 rounded-xl border px-3.5 py-3 text-left transition lg:w-full ${
                isActive
                  ? 'border-cyan-400/45 bg-cyan-400/12 text-white shadow-[0_0_20px_rgba(0,229,255,0.12)]'
                  : 'border-transparent bg-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
                  isActive
                    ? 'bg-cyan-400/20 text-cyan-300'
                    : 'bg-studio-850 text-slate-400 group-hover:text-slate-200'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{item.label}</span>
                  {badge !== null && (
                    <span
                      className={`rounded-md px-1.5 py-0.5 font-mono text-[11px] font-bold ${
                        isActive ? 'bg-cyan-400/25 text-cyan-200' : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {badge}
                    </span>
                  )}
                </div>
                <div className="hidden truncate text-xs text-slate-400 lg:block">{item.subtitle}</div>
              </div>
            </button>
          );
        })}
      </nav>

      {/* Bottom Host Utilities */}
      <div className="hidden items-center justify-between border-t border-white/10 px-4 py-3 lg:flex">
        <button
          type="button"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
            soundEnabled
              ? 'border-cyan-400/40 bg-cyan-400/10 text-cyan-200'
              : 'border-white/10 bg-white/5 text-slate-400 hover:text-slate-200'
          }`}
          title={t.sidebar.hostPreviewTooltip}
        >
          {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
          <span>{soundEnabled ? t.sidebar.hostPreviewOn : t.sidebar.hostPreviewOff}</span>
        </button>

        <span className="font-mono text-[11px] text-slate-500">v1.0</span>
      </div>
    </aside>
  );
}
