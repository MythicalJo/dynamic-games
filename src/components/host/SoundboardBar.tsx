import React, { useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  Clock,
  Headphones,
  Music,
  Pause,
  Play,
  Repeat,
  Siren,
  Trash2,
  Trophy,
  Upload,
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
    soundEnabled,
    setSoundEnabled,
    triggerCue,
    connectedDisplays,
    displayAudioReady,
    musicTracks,
    musicControl,
    addMusicFiles,
    selectMusicTrack,
    removeMusicTrack,
    toggleMusicPlay,
    setMusicLoop,
    setMusicVolume,
    t,
  } = useShow();

  const [collapsed, setCollapsed] = useState(false);
  const [showMusicBar, setShowMusicBar] = useState(false);
  const [tickFlip, setTickFlip] = useState(false);
  const musicInputRef = useRef<HTMLInputElement | null>(null);

  const handleMusicFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await addMusicFiles(files);
      setShowMusicBar(true);
    }
    e.target.value = '';
  };

  const handlePadClick = (cue: SoundCue) => {
    if (cue === 'timerTick') {
      const next = !tickFlip;
      setTickFlip(next);
      triggerCue(next ? 'timerTick' : 'timerTock');
      return;
    }
    triggerCue(cue);
  };

  const pads: { cue: SoundCue; label: string; icon: typeof Bell }[] = [
    { cue: 'timerTick', label: t.soundboard.pads.tick, icon: Clock },
    { cue: 'timeUp', label: t.soundboard.pads.timeUp, icon: Siren },
    { cue: 'cardFlip', label: t.soundboard.pads.swoosh, icon: Wind },
    { cue: 'exactMatch', label: t.soundboard.pads.ding, icon: Bell },
    { cue: 'miss', label: t.soundboard.pads.miss, icon: XOctagon },
    { cue: 'fanfare', label: t.soundboard.pads.fanfare, icon: Trophy },
  ];

  const volumePct = Math.round(musicControl.volume * 100);

  return (
    <footer className="sticky bottom-0 z-30 border-t border-line bg-canvas/95 backdrop-blur-md">
      {/* Compact Expandable Custom Background Music Strip */}
      {showMusicBar && (
        <div className="border-b border-line bg-surface">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-ink">
                <Music className="h-3.5 w-3.5 text-accent" />
                Música de Fondo
              </span>

              <button
                type="button"
                onClick={() => musicInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-ink transition hover:border-line-strong"
              >
                <Upload className="h-3.5 w-3.5" />
                <span>Cargar audio</span>
              </button>

              <input
                ref={musicInputRef}
                type="file"
                accept="audio/*"
                multiple
                onChange={handleMusicFilesChange}
                className="hidden"
              />

              {musicTracks.length > 0 ? (
                <div className="flex items-center gap-1.5">
                  <select
                    value={musicControl.trackId ?? ''}
                    onChange={(e) => selectMusicTrack(e.target.value)}
                    className="max-w-[220px] rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-ink outline-none focus:border-accent"
                  >
                    {musicTracks.map((track) => (
                      <option key={track.id} value={track.id}>
                        {track.name}
                      </option>
                    ))}
                  </select>

                  {musicControl.trackId && (
                    <button
                      type="button"
                      onClick={() => removeMusicTrack(musicControl.trackId!)}
                      className="rounded-lg border border-line bg-canvas p-1 text-ink-subtle hover:border-err/40 hover:text-err"
                      title="Quitar pista"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              ) : (
                <span className="text-xs text-ink-subtle">
                  Carga archivos MP3, WAV u OGG desde tu computadora
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Play / Pause */}
              <button
                type="button"
                disabled={!musicControl.trackId}
                onClick={toggleMusicPlay}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold transition disabled:opacity-40 ${
                  musicControl.isPlaying
                    ? 'bg-accent text-accent-fg'
                    : 'border border-line bg-canvas text-ink hover:border-line-strong'
                }`}
              >
                {musicControl.isPlaying ? (
                  <>
                    <Pause className="h-3.5 w-3.5 fill-current" />
                    <span>Pausar</span>
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>Reproducir</span>
                  </>
                )}
              </button>

              {/* Loop Toggle */}
              <button
                type="button"
                onClick={() => setMusicLoop(!musicControl.loop)}
                className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-semibold transition ${
                  musicControl.loop
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-line bg-canvas text-ink-muted hover:text-ink'
                }`}
                title="Repetir pista en bucle"
              >
                <Repeat className="h-3.5 w-3.5" />
                <span>Bucle</span>
              </button>

              {/* Volume Slider (default 25%) */}
              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 py-1">
                <Volume2 className="h-3.5 w-3.5 text-ink-muted" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volumePct}
                  onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                  className="h-1.5 w-24 cursor-pointer accent-accent"
                  aria-label="Volumen de música de fondo"
                />
                <span className="w-8 text-right font-mono text-[11px] font-bold text-ink tabular-nums">
                  {volumePct}%
                </span>
              </div>

              {musicControl.isPlaying && connectedDisplays > 0 && (
                <span className="hidden font-mono text-[10px] font-semibold text-ok md:inline">
                  Sonando en pantalla
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Compact Soundboard Row */}
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2 px-4 py-2 sm:px-6">
        {/* Left: Global Mute + Background Music Drawer Toggle + Local Preview */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleAudioMuted}
            title={t.soundboard.globalMuteTooltip}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              audioMuted
                ? 'border-err/40 bg-err-soft text-err'
                : 'border-line bg-surface text-ink hover:border-line-strong'
            }`}
          >
            {audioMuted ? (
              <VolumeX className="h-3.5 w-3.5" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-ok" />
            )}
            <span>{audioMuted ? t.soundboard.muted : t.soundboard.sfxLive}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowMusicBar((v) => !v)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition ${
              musicControl.isPlaying
                ? 'border-accent bg-accent text-accent-fg'
                : showMusicBar
                  ? 'border-ink bg-ink text-canvas'
                  : 'border-line bg-surface text-ink hover:border-line-strong'
            }`}
          >
            <Music className="h-3.5 w-3.5" />
            <span>
              Música{musicTracks.length > 0 ? ` (${musicTracks.length})` : ''}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={t.sidebar.hostPreviewTooltip}
            className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition ${
              soundEnabled
                ? 'border-accent/40 bg-accent-soft text-accent'
                : 'border-line bg-canvas text-ink-subtle hover:text-ink'
            }`}
          >
            <Headphones className="h-3 w-3" />
            <span className="hidden sm:inline">{soundEnabled ? 'Local: Sí' : 'Local: No'}</span>
          </button>

          {connectedDisplays > 0 && (
            <span
              title={
                displayAudioReady
                  ? t.soundboard.displayAudioReadyTip
                  : t.soundboard.enableAudioOnDisplayTip
              }
              className="hidden items-center gap-1.5 text-[11px] font-medium text-ink-muted lg:inline-flex"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  displayAudioReady ? 'bg-ok' : 'bg-warn'
                }`}
              />
              {displayAudioReady
                ? t.soundboard.displayAudioReady
                : t.soundboard.enableAudioOnDisplay}
            </span>
          )}
        </div>

        {/* Center: Compact Minimal SFX Pads */}
        {!collapsed && (
          <div className="flex flex-wrap items-center gap-1">
            {pads.map(({ cue, label, icon: Icon }) => (
              <button
                key={cue}
                type="button"
                disabled={audioMuted}
                onClick={() => handlePadClick(cue)}
                className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-medium text-ink transition hover:border-line-strong hover:bg-surface-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Icon className="h-3 w-3 text-ink-muted" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        )}

        {/* Right: Shortcut Notice or Quiet Shortcuts + Collapse */}
        <div className="flex items-center gap-2">
          {shortcutNotice ? (
            <span className="rounded-md border border-accent/35 bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent">
              {shortcutNotice}
            </span>
          ) : (
            <div className="hidden items-center gap-2 font-mono text-[10px] text-ink-subtle xl:flex">
              <span>Espacio: Reloj</span>
              <span>·</span>
              <span>R: Reiniciar</span>
              <span>·</span>
              <span>1–5: Revelar</span>
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed((v) => !v)}
            className="rounded-lg border border-line p-1 text-ink-subtle hover:text-ink"
            title={collapsed ? 'Mostrar sonidos' : 'Ocultar sonidos'}
          >
            {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          </button>
        </div>
      </div>
    </footer>
  );
}
