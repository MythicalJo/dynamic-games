import React, { useCallback, useEffect, useState } from 'react';
import { Maximize2, Minimize2, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import {
  isAudioUnlocked,
  playBroadcastCue,
  subscribeAudioUnlock,
  unlockAudio,
} from '../../lib/sound';

interface StudioBackdropProps {
  children: React.ReactNode;
}

export function StudioBackdrop({ children }: StudioBackdropProps) {
  const {
    connectedHosts,
    audioMuted,
    soundEnabled,
    setSoundEnabled,
    notifyAudioUnlocked,
    resumeDisplayMusic,
    t,
  } = useShow();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState<boolean>(() => isAudioUnlocked());

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

  useEffect(() => {
    let hideTimer: number | null = null;
    const showControls = () => {
      setControlsVisible(true);
      if (hideTimer) window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => setControlsVisible(false), 2400);
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

  return (
    <div className="relative h-screen w-screen overflow-hidden select-none bg-canvas text-ink transition-colors duration-300">
      {/* Subtle 2px Editorial Top Accent Hairline */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-accent" />

      {/* Main Clutter-Free Content Stage */}
      <div className="relative z-10 h-full w-full">{children}</div>

      {/* Clean One-Click "Enable Audio & Fullscreen" Button (Autoplay Policy) */}
      {!audioUnlocked && (
        <div className="fixed bottom-6 right-6 z-50">
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
            controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
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
