import {
  Activity,
  Brain,
  Flame,
  Gamepad2,
  Gavel,
  Layers,
  MonitorPlay,
  Sparkles,
} from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { GAME_MODULES, getActiveGameModule } from '../../modules/registry';
import { FAST_MONEY_MODULE_ID } from '../../types/fastMoney';
import { CONFIDENCE_AUCTION_MODULE_ID } from '../../types/confidenceAuction';
import { MENTAL_SYNC_MODULE_ID } from '../../types/mentalSync';
import { POLYGRAPH_MODULE_ID } from '../../types/polygraph';

function getModuleIcon(id: string) {
  switch (id) {
    case FAST_MONEY_MODULE_ID:
      return Flame;
    case CONFIDENCE_AUCTION_MODULE_ID:
      return Gavel;
    case MENTAL_SYNC_MODULE_ID:
      return Brain;
    case POLYGRAPH_MODULE_ID:
      return Activity;
    case 'rapid-stage':
      return Sparkles;
    default:
      return Gamepad2;
  }
}

export function ActiveGamePanel() {
  const { state, setDisplayMode, setActiveModuleId, t } = useShow();
  const activeModule = getActiveGameModule(state.activeModuleId);
  const ActiveHostComponent = activeModule.HostComponent;
  const activeModCopy =
    t.modules.list[activeModule.id as keyof typeof t.modules.list] ?? activeModule;

  return (
    <div className="space-y-6">
      {/* Module Selector Grid */}
      <section className="rounded-2xl border border-white/10 bg-studio-900/85 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              <Layers className="h-5 w-5 text-cyan-400" />
              {t.modules.heading(GAME_MODULES.length)}
            </h2>
            <p className="text-xs text-slate-400">{t.modules.subheading}</p>
          </div>

          {state.displayMode !== 'game' && (
            <button
              type="button"
              onClick={() => setDisplayMode('game')}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-2 text-xs font-extrabold text-studio-950 shadow-[0_0_20px_rgba(0,229,255,0.28)] transition hover:brightness-110"
            >
              <MonitorPlay className="h-4 w-4" />
              {t.modules.switchDisplayTo(activeModCopy.shortName)}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {GAME_MODULES.map((mod) => {
            const isActive = activeModule.id === mod.id;
            const Icon = getModuleIcon(mod.id);
            const copy = t.modules.list[mod.id as keyof typeof t.modules.list] ?? mod;

            const activeFrame =
              mod.accent === 'rose'
                ? 'border-rose-400/80 bg-rose-500/15 glow-live'
                : mod.accent === 'emerald'
                  ? 'border-emerald-400/80 bg-emerald-500/15 shadow-[0_0_24px_rgba(52,211,153,0.25)]'
                  : mod.accent === 'cyan'
                    ? 'border-cyan-400/80 bg-cyan-400/15 glow-cyan'
                    : 'border-amber-400/80 bg-amber-400/15 glow-gold';

            const iconBadge =
              mod.accent === 'rose'
                ? 'bg-rose-500/20 text-rose-300'
                : mod.accent === 'emerald'
                  ? 'bg-emerald-400/20 text-emerald-300'
                  : mod.accent === 'cyan'
                    ? 'bg-cyan-400/20 text-cyan-300'
                    : 'bg-amber-400/20 text-amber-300';

            return (
              <button
                key={mod.id}
                type="button"
                onClick={() => setActiveModuleId(mod.id)}
                className={`flex flex-col justify-between rounded-xl border p-3.5 text-left transition active:scale-[0.98] ${
                  isActive
                    ? activeFrame
                    : 'border-white/10 bg-studio-950/70 hover:border-white/25 hover:bg-studio-850/80'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconBadge}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    {isActive && (
                      <span className="rounded bg-white/15 px-1.5 py-0.5 font-mono text-[9px] font-black tracking-wider text-white uppercase">
                        {t.common.active}
                      </span>
                    )}
                  </div>
                  <div className="mt-2.5 font-display text-lg font-extrabold tracking-wide text-white uppercase leading-tight">
                    {copy.shortName}
                  </div>
                  <div className="mt-0.5 font-mono text-[10px] font-bold text-slate-400 uppercase">
                    {copy.subtitle}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Game Module Host Console */}
      {ActiveHostComponent && <ActiveHostComponent />}
    </div>
  );
}
