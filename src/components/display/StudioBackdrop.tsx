import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Maximize2,
  Minimize2,
  Music,
  Pause,
  Play,
  QrCode,
  Repeat,
  Trash2,
  Upload,
  Volume2,
  VolumeX,
  Wifi,
  WifiOff,
  X,
} from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import {
  isAudioUnlocked,
  playBroadcastCue,
  subscribeAudioUnlock,
  unlockAudio,
} from '../../lib/sound';
import { RemoteConnectCard } from './RemoteConnectCard';

interface StudioBackdropProps {
  children: React.ReactNode;
}

export function StudioBackdrop({ children }: StudioBackdropProps) {
  const {
    state,
    connectedHosts,
    roomCode,
    audioMuted,
    soundEnabled,
    setSoundEnabled,
    notifyAudioUnlocked,
    resumeDisplayMusic,
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

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() => isAudioUnlocked());

  // QR visible automatically on Lobby (can be collapsed manually); hidden during live game unless toggled
  const [qrCollapsedInLobby, setQrCollapsedInLobby] = useState(false);
  const [qrOpenInGame, setQrOpenInGame] = useState(false);
  const [musicDrawerOpen, setMusicDrawerOpen] = useState(false);
  const displayMusicInputRef = useRef<HTMLInputElement | null>(null);

  const isLobby = state.displayMode === 'lobby';
  const qrExpanded = isLobby ? !qrCollapsedInLobby : qrOpenInGame;

  useEffect(() => {
    if (isLobby) {
      setQrOpenInGame(false);
    }
  }, [isLobby]);

  useEffect(() => {
    const unsubscribe = subscribeAudioUnlock((unlocked) => {
      setAudioUnlocked(unlocked);
      if (unlocked) {
        notifyAudioUnlocked();
      }
    });
    return unsubscribe;
  }, [notifyAudioUnlocked]);

  useEffect(() => {
    const onFsChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Requiere interacción directa del usuario
    }
  }, []);

  const handleEnableAudioAndFullscreen = useCallback(async () => {
    const unlocked = await unlockAudio();
    if (unlocked) {
      setAudioUnlocked(true);
      setSoundEnabled(true);
      notifyAudioUnlocked();
      resumeDisplayMusic();
      if (!audioMuted) {
        playBroadcastCue('switch');
      }
    }
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Ignorar si pantalla completa no está disponible
      }
    }
  }, [audioMuted, notifyAudioUnlocked, resumeDisplayMusic, setSoundEnabled]);

  const handleDisplayMusicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      await addMusicFiles(files);
      setMusicDrawerOpen(true);
    }
    e.target.value = '';
  };

  useEffect(() => {
    let hideTimer: number | null = null;
    const showControls = () => {
      setControlsVisible(true);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setControlsVisible(false), 3000);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      unlockAudio().then((ok) => {
        if (ok) notifyAudioUnlocked();
      });
      if (e.key === 'f' || e.key === 'F') {
        toggleFullscreen();
      }
    };

    const onPointerUnlock = () => {
      if (!isAudioUnlocked()) {
        unlockAudio().then((ok) => {
          if (ok) notifyAudioUnlocked();
        });
      }
    };

    window.addEventListener('mousemove', showControls);
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('pointerdown', onPointerUnlock);
    return () => {
      window.removeEventListener('mousemove', showControls);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('pointerdown', onPointerUnlock);
      if (hideTimer) window.clearTimeout(hideTimer);
    };
  }, [notifyAudioUnlocked, toggleFullscreen]);

  const effectiveMuted = audioMuted || !soundEnabled;
  const volumePct = Math.round(musicControl.volume * 100);

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none bg-canvas text-ink transition-colors duration-300">
      {/* Subtle Editorial Top Accent Hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-accent" />

      {/* Main Clutter-Free Content Stage */}
      <div className="relative z-10 h-full w-full">{children}</div>

      {/* Room Code + QR Overlay (visible on Lobby or toggleable via corner/hover button) */}
      <RemoteConnectCard
        expanded={qrExpanded}
        onToggle={() => {
          if (isLobby) setQrCollapsedInLobby((v) => !v);
          else setQrOpenInGame((v) => !v);
        }}
        showCornerBadgeWhenCollapsed={isLobby || controlsVisible}
      />

      {/* Hidden file picker for venue PC background music */}
      <input
        ref={displayMusicInputRef}
        type="file"
        accept="audio/*"
        multiple
        onChange={handleDisplayMusicChange}
        className="hidden"
      />

      {/* Display-Side Background Music Popover (PC loads local MP3s; Phone triggers Play/Pause/Volume!) */}
      {musicDrawerOpen && (
        <div className="fixed bottom-20 right-6 z-50 w-80 rounded-2xl border border-line-strong bg-surface/95 p-4 text-ink shadow-2xl backdrop-blur-md">
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold">
              <Music className="h-4 w-4 text-accent" />
              <span>Música de Fondo (PC)</span>
            </div>
            <button
              type="button"
              onClick={() => setMusicDrawerOpen(false)}
              className="rounded-lg border border-line bg-canvas p-1 text-ink-subtle hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <p className="mb-3 text-[11px] leading-relaxed text-ink-muted">
            Carga tus archivos MP3/WAV aquí en la PC del evento y controla Reproducir, Pausa y
            Volumen desde tu celular sin lag.
          </p>

          <button
            type="button"
            onClick={() => displayMusicInputRef.current?.click()}
            className="mb-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent px-3 py-2 text-xs font-bold text-accent-fg transition hover:opacity-90"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Cargar archivos de audio</span>
          </button>

          {musicTracks.length > 0 && (
            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5">
                <select
                  value={musicControl.trackId ?? ''}
                  onChange={(e) => selectMusicTrack(e.target.value)}
                  className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-2.5 py-1.5 text-xs font-semibold text-ink outline-none focus:border-accent"
                >
                  {musicTracks.map((tr) => (
                    <option key={tr.id} value={tr.id}>
                      {tr.name}
                    </option>
                  ))}
                </select>
                {musicControl.trackId && (
                  <button
                    type="button"
                    onClick={() => removeMusicTrack(musicControl.trackId!)}
                    className="rounded-lg border border-line bg-canvas p-1.5 text-ink-subtle hover:text-err"
                    title="Quitar pista"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!musicControl.trackId}
                  onClick={toggleMusicPlay}
                  className={`inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-bold transition disabled:opacity-40 ${
                    musicControl.isPlaying
                      ? 'bg-ink text-canvas'
                      : 'border border-line bg-canvas text-ink'
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
                <button
                  type="button"
                  onClick={() => setMusicLoop(!musicControl.loop)}
                  className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold ${
                    musicControl.loop
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-canvas text-ink-muted'
                  }`}
                >
                  <Repeat className="h-3.5 w-3.5" />
                  <span>Bucle</span>
                </button>
              </div>

              <div className="flex items-center gap-2 rounded-lg border border-line bg-canvas px-2.5 py-1.5">
                <Volume2 className="h-3.5 w-3.5 text-ink-muted" />
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={volumePct}
                  onChange={(e) => setMusicVolume(Number(e.target.value) / 100)}
                  className="h-1.5 flex-1 cursor-pointer accent-accent"
                />
                <span className="w-8 text-right font-mono text-[11px] font-bold text-ink tabular-nums">
                  {volumePct}%
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clean One-Click "Enable Audio & Fullscreen" + Quick Music Button (Autoplay Policy) */}
      {!audioUnlocked && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMusicDrawerOpen((v) => !v)}
            className="flex items-center gap-2 rounded-2xl border border-line-strong bg-surface/95 px-4 py-3 text-xs font-bold text-ink shadow-lg backdrop-blur-md transition hover:border-accent"
            title="Cargar música de fondo en esta PC"
          >
            <Music className="h-4 w-4 text-accent" />
            <span>Música{musicTracks.length > 0 ? ` (${musicTracks.length})` : ''}</span>
          </button>

          <button
            type="button"
            onClick={handleEnableAudioAndFullscreen}
            className="flex items-center gap-3 rounded-2xl border border-line-strong bg-ink px-5 py-3 text-left text-canvas shadow-lg transition hover:opacity-90 active:scale-[0.98]"
          >
            <Volume2 className="h-5 w-5 shrink-0" />
            <span className="leading-tight">
              <span className="block text-sm font-bold">{t.backdrop.enableAudioFullscreen}</span>
              <span className="block text-[11px] opacity-75">{t.backdrop.enableAudioSub}</span>
            </span>
            <Maximize2 className="h-4 w-4 shrink-0 opacity-80" />
          </button>
        </div>
      )}

      {/* Discreet Hover-Only Controls */}
      {audioUnlocked && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-line bg-surface/95 px-3 py-1.5 backdrop-blur-md transition-opacity duration-300 ${
            controlsVisible || musicDrawerOpen
              ? 'opacity-100'
              : 'pointer-events-none opacity-0'
          }`}
        >
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              connectedHosts > 0 ? 'text-ok' : 'text-ink-muted'
            }`}
          >
            {connectedHosts > 0 ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {connectedHosts > 0 ? t.backdrop.hostLive : t.backdrop.standby}
          </span>

          <div className="h-3.5 w-px bg-line" />

          {roomCode && (
            <button
              type="button"
              onClick={() => {
                if (isLobby) setQrCollapsedInLobby((v) => !v);
                else setQrOpenInGame((v) => !v);
              }}
              className="flex items-center gap-1 rounded-full px-2 py-1 font-mono text-xs font-bold text-ink transition hover:bg-surface-2"
              title="Mostrar / ocultar código QR de conexión remota"
            >
              <QrCode className="h-3.5 w-3.5 text-accent" />
              <span>{roomCode}</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMusicDrawerOpen((v) => !v)}
            className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold transition hover:bg-surface-2 ${
              musicControl.isPlaying ? 'text-accent' : 'text-ink'
            }`}
            title="Música de fondo en esta PC"
          >
            <Music className="h-3.5 w-3.5" />
            <span>{musicTracks.length > 0 ? musicTracks.length : 'Música'}</span>
          </button>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-ink transition hover:bg-surface-2"
          >
            {effectiveMuted ? (
              <VolumeX className="h-3.5 w-3.5 text-err" />
            ) : (
              <Volume2 className="h-3.5 w-3.5 text-ok" />
            )}
            {audioMuted && <span className="font-mono text-[10px] text-err">{t.backdrop.hostMuted}</span>}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-full border border-line bg-canvas px-2.5 py-1 text-xs font-semibold text-ink transition hover:border-line-strong"
            title="Pantalla completa (F)"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isFullscreen ? t.backdrop.exitFullscreen : t.backdrop.fullscreen}</span>
          </button>
        </div>
      )}
    </div>
  );
}
