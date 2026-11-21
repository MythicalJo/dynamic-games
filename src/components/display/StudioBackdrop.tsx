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
  const { connectedHosts, audioMuted, soundEnabled, setSoundEnabled, notifyAudioUnlocked, t } =
    useShow();
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
      // Browser may require direct click gesture
    }
  }, []);

  const handleEnableAudioAndFullscreen = useCallback(async () => {
    const unlocked = await unlockAudio();
    if (unlocked) {
      setAudioUnlocked(true);
      setSoundEnabled(true);
      notifyAudioUnlocked();
      if (!audioMuted) {
        playBroadcastCue('switch');
      }
    }
    if (!document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch {
        // Ignore if fullscreen is unavailable
      }
    }
  }, [audioMuted, notifyAudioUnlocked, setSoundEnabled]);

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
    <div className="relative h-screen w-screen overflow-hidden select-none studio-stage-glow text-white">
      {/* Subtle Studio Grid */}
      <div className="pointer-events-none absolute inset-0 studio-grid-bg opacity-65" />

      {/* Ambient Animated Studio Spotlights */}
      <div className="pointer-events-none absolute -top-40 left-1/2 h-[38rem] w-[72rem] -translate-x-1/2 rounded-full bg-cyan-500/15 blur-[130px] animate-spotlight" />
      <div className="pointer-events-none absolute -bottom-44 -left-24 h-[30rem] w-[42rem] rounded-full bg-amber-500/14 blur-[130px]" />
      <div className="pointer-events-none absolute -bottom-44 -right-24 h-[30rem] w-[42rem] rounded-full bg-indigo-500/18 blur-[130px]" />

      {/* Crisp Top & Bottom Broadcast Trim Lines */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-cyan-400/80 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[3px] bg-gradient-to-r from-transparent via-amber-400/70 to-transparent" />

      {/* Main Content Stage */}
      <div className="relative z-10 h-full w-full">{children}</div>

      {/* One-Click "Enable Audio & Fullscreen" Prompt (Satisfies Browser Autoplay Policy) */}
      {!audioUnlocked && (
        <div className="fixed bottom-6 right-6 z-50">
          <button
            type="button"
            onClick={handleEnableAudioAndFullscreen}
            className="group flex items-center gap-3 rounded-2xl border-2 border-amber-300/85 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 px-5 py-3 text-sm font-black text-studio-950 shadow-[0_0_35px_rgba(255,201,51,0.45)] transition hover:scale-[1.03] hover:brightness-110 active:scale-[0.98]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-studio-950/15">
              <Volume2 className="h-5 w-5 stroke-[2.5]" />
            </span>
            <span className="text-left leading-tight">
              <span className="block font-display text-xl tracking-wide uppercase">
                {t.backdrop.enableAudioFullscreen}
              </span>
              <span className="block font-mono text-[10px] font-bold opacity-80">
                {t.backdrop.enableAudioSub}
              </span>
            </span>
            <Maximize2 className="h-4 w-4 stroke-[2.5] transition group-hover:scale-110" />
          </button>
        </div>
      )}

      {/* Hover-Only Discreet Audience Screen Controls (Zero Clutter When Idle) */}
      {audioUnlocked && (
        <div
          className={`fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full border border-white/15 bg-studio-950/85 px-3 py-1.5 backdrop-blur-md transition-opacity duration-300 ${
            controlsVisible ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
        >
          <span
            className={`flex items-center gap-1.5 text-xs font-semibold ${
              connectedHosts > 0 ? 'text-cyan-300' : 'text-amber-300'
            }`}
            title={connectedHosts > 0 ? 'Connected to Host Control Panel' : 'Synced via Local Storage'}
          >
            {connectedHosts > 0 ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {connectedHosts > 0 ? t.backdrop.hostLive : t.backdrop.standby}
          </span>

          <div className="h-3.5 w-px bg-white/15" />

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            {effectiveMuted ? (
              <VolumeX className="h-4 w-4 text-rose-400" />
            ) : (
              <Volume2 className="h-4 w-4 text-emerald-300" />
            )}
            {audioMuted && (
              <span className="font-mono text-[10px] text-rose-300">{t.backdrop.hostMuted}</span>
            )}
          </button>

          <button
            type="button"
            onClick={toggleFullscreen}
            className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white transition hover:bg-cyan-400/25"
            title="Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            <span>{isFullscreen ? t.backdrop.exitFullscreen : t.backdrop.fullscreen}</span>
          </button>
        </div>
      )}
    </div>
  );
}
