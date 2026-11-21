import { useEffect, useRef, useState } from 'react';

/**
 * Mantiene encendida la pantalla del celular (/host) o PC (/display) usando
 * Screen Wake Lock API con re-adquisición automática al volver al primer plano
 * y fallback silencioso en navegadores que no lo soporten.
 */
export function useWakeLock(enabled = true) {
  const [isActive, setIsActive] = useState(false);
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const isSupported =
    typeof navigator !== 'undefined' &&
    'wakeLock' in navigator &&
    typeof navigator.wakeLock?.request === 'function';

  useEffect(() => {
    if (!enabled || !isSupported) {
      setIsActive(false);
      return;
    }

    let cancelled = false;

    const requestLock = async () => {
      if (cancelled || document.visibilityState !== 'visible') return;
      if (sentinelRef.current && !sentinelRef.current.released) return;

      try {
        const sentinel = await navigator.wakeLock.request('screen');
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }

        sentinelRef.current = sentinel;
        setIsActive(true);

        const handleRelease = () => {
          if (sentinelRef.current === sentinel) {
            sentinelRef.current = null;
            setIsActive(false);
          }
        };

        sentinel.addEventListener('release', handleRelease);
      } catch {
        // Puede fallar antes de interacción del usuario, en batería baja o HTTP no seguro
        setIsActive(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void requestLock();
      }
    };

    const handleFirstGesture = () => {
      if (!sentinelRef.current || sentinelRef.current.released) {
        void requestLock();
      }
    };

    void requestLock();
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pointerdown', handleFirstGesture, { passive: true });
    window.addEventListener('keydown', handleFirstGesture, { passive: true });

    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pointerdown', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      if (sentinelRef.current) {
        const current = sentinelRef.current;
        sentinelRef.current = null;
        current.release().catch(() => {});
      }
      setIsActive(false);
    };
  }, [enabled, isSupported]);

  return { isSupported, isActive };
}
