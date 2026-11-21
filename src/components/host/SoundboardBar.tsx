import {
  Bell,
  Clock,
  Keyboard,
  Siren,
  Sparkles,
  Trophy,
  Volume2,
  VolumeX,
  Wind,
  XOctagon,
} from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import type { SoundCue } from '../../types/show';

interface SoundboardBarProps {
  shortcutNotice: string | null;
}

export function SoundboardBar({ shortcutNotice }: SoundboardBarProps) {
  const {
    audioMuted,
    toggleAudioMuted,
    triggerCue,
    connectedDisplays,
    displayAudioReady,
    t,
  } = useShow();

  const soundboardPads: {
    cue: SoundCue;
    label: string;
    icon: typeof Bell;
    toneClass: string;
  }[] = [
    {
      cue: 'timerTick',
      label: t.soundboard.pads.tick,
      icon: Clock,
      toneClass: 'border-cyan-400/35 bg-cyan-400/10 text-cyan-200 hover:bg-cyan-400/25',
    },
    {
      cue: 'timeUp',
      label: t.soundboard.pads.timeUp,
      icon: Siren,
      toneClass: 'border-orange-400/40 bg-orange-500/12 text-orange-200 hover:bg-orange-500/25',
    },
    {
      cue: 'cardFlip',
      label: t.soundboard.pads.swoosh,
      icon: Wind,
      toneClass: 'border-sky-400/35 bg-sky-400/10 text-sky-200 hover:bg-sky-400/25',
    },
    {
      cue: 'exactMatch',
      label: t.soundboard.pads.ding,
      icon: Bell,
      toneClass: 'border-emerald-400/40 bg-emerald-400/12 text-emerald-200 hover:bg-emerald-400/25',
    },
    {
      cue: 'miss',
      label: t.soundboard.pads.miss,
      icon: XOctagon,
      toneClass: 'border-rose-400/40 bg-rose-500/12 text-rose-200 hover:bg-rose-500/25',
    },
    {
      cue: 'fanfare',
      label: t.soundboard.pads.fanfare,
      icon: Trophy,
      toneClass: 'border-amber-400/45 bg-amber-400/15 text-amber-200 hover:bg-amber-400/30',
    },
  ];

  return (
    <footer className="sticky bottom-0 z-30 border-t border-white/12 bg-studio-950/95 px-4 py-2.5 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2.5">
        {/* Left: Global Mute Toggle + Display Speaker Readiness */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleAudioMuted}
            className={`flex items-center gap-2 rounded-xl border px-3 py-1.5 text-xs font-extrabold transition active:scale-95 ${
              audioMuted
                ? 'border-rose-500/60 bg-rose-500/20 text-rose-200'
                : 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
            }`}
            title={t.soundboard.globalMuteTooltip}
          >
            {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            <span>{audioMuted ? t.soundboard.muted : t.soundboard.sfxLive}</span>
          </button>

          {connectedDisplays > 0 && (
            <span
              className={`hidden items-center gap-1.5 rounded-lg border px-2 py-1 font-mono text-[10px] font-bold uppercase sm:inline-flex ${
                displayAudioReady
                  ? 'border-cyan-400/30 bg-cyan-400/10 text-cyan-200'
                  : 'border-amber-400/40 bg-amber-400/12 text-amber-200'
              }`}
              title={
                displayAudioReady
                  ? t.soundboard.displayAudioReadyTip
                  : t.soundboard.enableAudioOnDisplayTip
              }
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  displayAudioReady ? 'bg-emerald-400' : 'animate-ping bg-amber-400'
                }`}
              />
              {displayAudioReady
                ? t.soundboard.displayAudioReady
                : t.soundboard.enableAudioOnDisplay}
            </span>
          )}
        </div>

        {/* Center: Compact Soundboard Pads */}
        <div className="flex flex-wrap items-center gap-1.5">
          {soundboardPads.map(({ cue, label, icon: Icon, toneClass }) => (
            <button
              key={cue}
              type="button"
              disabled={audioMuted}
              onClick={() => triggerCue(cue)}
              className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-bold transition active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${toneClass}`}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Right: Shortcut Feedback Toast or Compact Shortcuts Legend */}
        <div className="hidden items-center gap-2 xl:flex">
          {shortcutNotice ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-400/50 bg-cyan-400/15 px-2.5 py-1 font-mono text-[11px] font-bold text-cyan-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              {shortcutNotice}
            </span>
          ) : (
            <div className="flex items-center gap-2 font-mono text-[10px] font-semibold text-slate-400">
              <Keyboard className="h-3.5 w-3.5 text-slate-500" />
              <span>
                <kbd className="rounded bg-white/10 px-1 py-0.5 text-slate-200">Space</kbd>{' '}
                {t.soundboard.shortcuts.timer}
              </span>
              <span>
                <kbd className="rounded bg-white/10 px-1 py-0.5 text-slate-200">R</kbd>{' '}
                {t.soundboard.shortcuts.reset}
              </span>
              <span>
                <kbd className="rounded bg-white/10 px-1 py-0.5 text-slate-200">1–5</kbd>{' '}
                {t.soundboard.shortcuts.fmReveal}
              </span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
