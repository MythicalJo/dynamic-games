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
  X,
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
    localConnectedDisplays,
    remoteStatus,
    displayAudioReady,
    musicTracks,
    musicControl,
    musicHostedOnDisplay,
    addMusicFiles,
    selectMusicTrack,
    removeMusicTrack,
    toggleMusicPlay,
    setMusicLoop,
    setMusicVolume,
    t,
  } = useShow();

  // En móviles inicia colapsado para dejar máxima área táctil al juego
  const [collapsed, setCollapsed] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth < 640 : false
  );
  const [showMusicModal, setShowMusicModal] = useState(false);
  const [tickFlip, setTickFlip] = useState(false);
  const musicInputRef = useRef<HTMLInputElement | null>(null);

  const isRemoteOnly = remoteStatus === 'connected' && localConnectedDisplays === 0;

  const handleMusicFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await addMusicFiles(files);
      setShowMusicModal(true);
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
    <>
      {/* Hidden file picker */}
      <input
        ref={musicInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleMusicFilesChange}
        className="hidden"
      />

      {/* ================================================================= */}
      {/* IN-PLACE MOBILE-FRIENDLY MODAL / BOTTOM SHEET FOR MÚSICA DE FONDO */}
      {/* ================================================================= */}
      {showMusicModal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-3 backdrop-blur-xs sm:items-center"
          onClick={() => setShowMusicModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[95vw] overflow-hidden rounded-2xl border border-line-strong bg-surface p-5 text-ink shadow-2xl sm:max-w-md"
          >
            {/* Header */}
            <div className="mb-4 flex items-center justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Music className="h-4 w-4 shrink-0 text-accent" />
                <h3 className="truncate text-sm font-extrabold text-ink">Música de Fondo</h3>
                {musicHostedOnDisplay && (
                  <span className="shrink-0 rounded-full border border-ok/40 bg-ok-soft px-2 py-0.5 font-mono text-[10px] font-bold text-ok">
                    En PC ✓
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={() => setShowMusicModal(false)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-line bg-canvas text-ink-muted hover:text-ink"
                aria-label="Cerrar música de fondo"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload Button (when on same PC) or Remote Guidance */}
              {!isRemoteOnly ? (
                <button
                  type="button"
                  onClick={() => musicInputRef.current?.click()}
                  className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border border-line-strong bg-canvas px-4 py-2.5 text-xs font-bold text-ink transition hover:bg-surface-2 active:scale-[0.99]"
                >
                  <Upload className="h-4 w-4 text-accent" />
                  <span>Cargar archivos de audio (MP3, WAV, OGG)</span>
                </button>
              ) : (
                <p className="rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-xs leading-relaxed text-ink-muted">
                  {musicTracks.length > 0
                    ? 'Controlando las pistas cargadas en la PC del evento sin retraso.'
                    : 'Carga tus archivos MP3 desde el botón «Música» en /display (PC del evento) y contrólalos desde aquí.'}
                </p>
              )}

              {/* Track Selector */}
              {musicTracks.length > 0 && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-ink-muted">
                    Pista activa ({musicTracks.length})
                  </label>
                  <div className="flex w-full max-w-full items-center gap-2">
                    <select
                      value={musicControl.trackId ?? ''}
                      onChange={(e) => selectMusicTrack(e.target.value)}
                      className="min-h-[44px] min-w-0 flex-1 truncate rounded-xl border border-line bg-canvas px-3 py-2 text-sm font-semibold text-ink outline-none focus:border-accent"
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
                        className="flex h-[44px] w-[44px] shrink-0 items-center justify-center rounded-xl border border-line bg-canvas text-ink-subtle hover:border-err/40 hover:text-err"
                        title="Quitar pista"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Play/Pause + Loop */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={!musicControl.trackId}
                  onClick={toggleMusicPlay}
                  className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-extrabold transition active:scale-[0.98] disabled:opacity-40 ${
                    musicControl.isPlaying
                      ? 'bg-accent text-accent-fg'
                      : 'bg-ink text-canvas'
                  }`}
                >
                  {musicControl.isPlaying ? (
                    <>
                      <Pause className="h-4 w-4 fill-current" />
                      <span>Pausar</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 fill-current" />
                      <span>Reproducir</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMusicLoop(!musicControl.loop)}
                  className={`inline-flex min-h-[48px] items-center justify-center gap-2 rounded-xl border px-4 py-2 text-sm font-bold transition active:scale-[0.98] ${
                    musicControl.loop
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-canvas text-ink-muted hover:text-ink'
                  }`}
                >
                  <Repeat className="h-4 w-4" />
                  <span>{musicControl.loop ? 'Bucle: Sí' : 'Bucle: No'}</span>
                </button>
              </div>

              {/* Volume Slider (default 25%) */}
              <div className="rounded-xl border border-line bg-canvas p-3">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                  <span className="inline-flex items-center gap-1.5 text-ink-muted">
                    <Volume2 className="h-3.5 w-3.5" />
                    Volumen
                  </span>
                  <span className="font-mono font-bold text-ink tabular-nums">{volumePct}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volumePct}
                  onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                  className="h-2 w-full cursor-pointer accent-accent"
                  aria-label="Volumen de música de fondo"
                />
              </div>

              {musicControl.isPlaying && connectedDisplays > 0 && (
                <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] font-bold text-ok">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-ok" />
                  <span>Sonando en pantalla del público</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* COMPACT STICKY SOUNDBOARD FOOTER (ZERO HORIZONTAL OVERFLOW)       */}
      {/* ================================================================= */}
      <footer className="sticky bottom-0 z-30 w-full max-w-full overflow-x-hidden border-t border-line bg-canvas/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:px-6">
          {/* Left: Global Mute + Background Music Modal Trigger + Local Preview */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={toggleAudioMuted}
              title={t.soundboard.globalMuteTooltip}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition sm:min-h-0 ${
                audioMuted
                  ? 'border-err/40 bg-err-soft text-err'
                  : 'border-line bg-surface text-ink hover:border-line-strong'
              }`}
            >
              {audioMuted ? (
                <VolumeX className="h-3.5 w-3.5 shrink-0" />
              ) : (
                <Volume2 className="h-3.5 w-3.5 shrink-0 text-ok" />
              )}
              <span>{audioMuted ? t.soundboard.muted : t.soundboard.sfxLive}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowMusicModal(true)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition sm:min-h-0 ${
                musicControl.isPlaying
                  ? 'border-accent bg-accent text-accent-fg'
                  : showMusicModal
                    ? 'border-ink bg-ink text-canvas'
                    : 'border-line bg-surface text-ink hover:border-line-strong'
              }`}
            >
              <Music className="h-3.5 w-3.5 shrink-0" />
              <span>
                Música{musicTracks.length > 0 ? ` (${musicTracks.length})` : ''}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={t.sidebar.hostPreviewTooltip}
              className={`hidden items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition sm:inline-flex ${
                soundEnabled
                  ? 'border-accent/40 bg-accent-soft text-accent'
                  : 'border-line bg-canvas text-ink-subtle hover:text-ink'
              }`}
            >
              <Headphones className="h-3 w-3" />
              <span>{soundEnabled ? 'Local: Sí' : 'Local: No'}</span>
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

          {/* Center: Clean SFX Pads (2 columns on small phones so full labels fit with zero clipping) */}
          {!collapsed && (
            <div className="order-3 grid w-full grid-cols-2 gap-1.5 pt-1 sm:order-2 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-1 sm:pt-0">
              {pads.map(({ cue, label, icon: Icon }) => (
                <button
                  key={cue}
                  type="button"
                  disabled={audioMuted}
                  onClick={() => handlePadClick(cue)}
                  className="inline-flex min-h-[40px] items-center justify-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-line-strong hover:bg-surface-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-0 sm:py-1"
                >
                  <Icon className="h-3.5 w-3.5 shrink-0 text-ink-muted sm:h-3 sm:w-3" />
                  <span className="truncate">{label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Right: Shortcut Notice or Quiet Shortcuts + Collapse */}
          <div className="order-2 flex items-center gap-2 sm:order-3">
            {shortcutNotice ? (
              <span className="max-w-[160px] truncate rounded-md border border-accent/35 bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent sm:max-w-none">
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
              className="inline-flex min-h-[36px] items-center gap-1 rounded-full border border-line px-2.5 py-1 text-xs font-semibold text-ink-muted hover:text-ink sm:min-h-0 sm:rounded-lg sm:p-1"
              title={collapsed ? 'Mostrar sonidos' : 'Ocultar sonidos'}
            >
              <span className="sm:hidden">Efectos</span>
              {collapsed ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}
