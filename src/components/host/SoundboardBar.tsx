import React, { useRef, useState } from 'react';
import {
  Bell,
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

  // 5 botones principales siempre visibles en el dock fijo (y Tic-Tac accesible en la fila superior / escritorio)
  const mainPads: { cue: SoundCue; label: string; title: string; icon: typeof Bell; tone?: string }[] = [
    { cue: 'exactMatch', label: t.soundboard.pads.ding, title: 'Respuesta correcta', icon: Bell, tone: 'text-ok' },
    { cue: 'miss', label: t.soundboard.pads.miss, title: 'Respuesta equivocada', icon: XOctagon, tone: 'text-err' },
    { cue: 'timeUp', label: t.soundboard.pads.timeUp, title: 'Se acabó el tiempo', icon: Siren, tone: 'text-warn' },
    { cue: 'cardFlip', label: t.soundboard.pads.swoosh, title: 'Revelar / Volteo', icon: Wind, tone: 'text-accent' },
    { cue: 'fanfare', label: t.soundboard.pads.fanfare, title: 'Fanfarria', icon: Trophy, tone: 'text-accent' },
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
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-3 backdrop-blur-xs sm:items-center"
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
      {/* FIXED BOTTOM DOCK: ALWAYS VISIBLE & REACHABLE WITH ONE THUMB      */}
      {/* ================================================================= */}
      <footer className="fixed right-0 bottom-0 left-0 z-50 w-full max-w-[100vw] overflow-hidden border-t border-line bg-canvas/95 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-1.5 px-2.5 py-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-2 sm:px-6">
          {/* Row 1 on mobile / Left on desktop: Mute + Música modal + Tic-Tac + Local Preview */}
          <div className="flex w-full items-center justify-between gap-1.5 sm:w-auto sm:justify-start sm:gap-2">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleAudioMuted}
                title={t.soundboard.globalMuteTooltip}
                className={`inline-flex min-h-[32px] items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition sm:min-h-0 sm:px-3 sm:text-xs ${
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
                <span>{audioMuted ? t.soundboard.muted : 'Sonido'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowMusicModal(true)}
                className={`inline-flex min-h-[32px] items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold transition sm:min-h-0 sm:px-3 sm:text-xs ${
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
                disabled={audioMuted}
                onClick={() => handlePadClick('timerTick')}
                title="Tic-Tac manual"
                className="inline-flex min-h-[32px] items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-[11px] font-semibold text-ink transition hover:border-line-strong active:scale-95 disabled:opacity-40 sm:hidden"
              >
                <Clock className="h-3 w-3 text-ink-muted" />
                <span>{t.soundboard.pads.tick}</span>
              </button>
            </div>

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
                className="inline-flex items-center gap-1 text-[10px] font-semibold text-ink-muted sm:text-[11px]"
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    displayAudioReady ? 'bg-ok' : 'bg-warn'
                  }`}
                />
                <span className="hidden lg:inline">
                  {displayAudioReady
                    ? t.soundboard.displayAudioReady
                    : t.soundboard.enableAudioOnDisplay}
                </span>
                <span className="sm:hidden">
                  {displayAudioReady ? 'PC ✓' : 'Sin audio PC'}
                </span>
              </span>
            )}
          </div>

          {/* Row 2 on mobile (5-col thumb dock) / Center on desktop: ALL primary SFX buttons */}
          <div className="grid w-full grid-cols-5 gap-1 sm:flex sm:w-auto sm:flex-wrap sm:items-center sm:gap-1.5">
            {mainPads.map(({ cue, label, title, icon: Icon, tone }) => (
              <button
                key={cue}
                type="button"
                disabled={audioMuted}
                onClick={() => handlePadClick(cue)}
                title={title}
                className="flex min-h-[44px] flex-col items-center justify-center gap-0.5 rounded-xl border border-line bg-surface px-1 py-1 text-[10px] font-bold text-ink transition hover:border-line-strong hover:bg-surface-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:min-h-[34px] sm:flex-row sm:gap-1.5 sm:rounded-lg sm:px-2.5 sm:py-1 sm:text-xs sm:font-semibold"
              >
                <Icon className={`h-3.5 w-3.5 shrink-0 ${tone ?? 'text-ink-muted'}`} />
                <span className="max-w-full truncate leading-none">{label}</span>
              </button>
            ))}

            {/* Tic-Tac pad on desktop */}
            <button
              type="button"
              disabled={audioMuted}
              onClick={() => handlePadClick('timerTick')}
              title="Tic-Tac alternado"
              className="hidden min-h-[34px] items-center gap-1.5 rounded-lg border border-line bg-surface px-2.5 py-1 text-xs font-semibold text-ink transition hover:border-line-strong hover:bg-surface-2 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 sm:inline-flex"
            >
              <Clock className="h-3.5 w-3.5 shrink-0 text-ink-muted" />
              <span>{t.soundboard.pads.tick}</span>
            </button>
          </div>

          {/* Right on desktop: Shortcut Notice or Quiet Shortcuts */}
          <div className="hidden items-center gap-2 xl:flex">
            {shortcutNotice ? (
              <span className="rounded-md border border-accent/35 bg-accent-soft px-2.5 py-0.5 font-mono text-[11px] font-semibold text-accent">
                {shortcutNotice}
              </span>
            ) : (
              <div className="flex items-center gap-2 font-mono text-[10px] text-ink-subtle">
                <span>Espacio: Reloj</span>
                <span>·</span>
                <span>R: Reiniciar</span>
                <span>·</span>
                <span>1–5: Revelar</span>
              </div>
            )}
          </div>
        </div>
      </footer>
    </>
  );
}
