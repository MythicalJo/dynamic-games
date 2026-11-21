import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Link2, Smartphone, Unlink, Wifi } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { normalizeRoomCode } from '../../lib/mqttSync';

export function RemoteConnectBar() {
  const {
    roomCode,
    remoteStatus,
    remoteError,
    localConnectedDisplays,
    connectRemoteRoom,
    disconnectRemoteRoom,
  } = useShow();

  const [searchParams] = useSearchParams();
  const [inputCode, setInputCode] = useState<string>(() => {
    const fromHash = searchParams.get('room');
    const fromWindow =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('room')
        : null;
    return normalizeRoomCode(fromHash || fromWindow || roomCode || '');
  });

  const autoConnectedRef = useRef<string | null>(null);

  // Auto-rellenar y conectar automáticamente si ?room=XXXX viene en la URL (ej. desde QR)
  useEffect(() => {
    const fromHash = searchParams.get('room');
    const fromWindow =
      typeof window !== 'undefined'
        ? new URLSearchParams(window.location.search).get('room')
        : null;
    const urlCode = normalizeRoomCode(fromHash || fromWindow || '');

    if (urlCode.length === 4 && autoConnectedRef.current !== urlCode) {
      autoConnectedRef.current = urlCode;
      setInputCode(urlCode);
      connectRemoteRoom(urlCode);
    }
  }, [searchParams, connectRemoteRoom]);

  // Muestra "Conectado ✓" tan pronto client.connected sea true en MQTT
  const isRemoteConnected = remoteStatus === 'connected';
  const isConnecting = remoteStatus === 'connecting' || remoteStatus === 'reconnecting';
  const isLocalOnly = !isRemoteConnected && !isConnecting && localConnectedDisplays > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = normalizeRoomCode(inputCode);
    if (cleaned.length !== 4) return;
    connectRemoteRoom(cleaned);
  };

  return (
    <section className="rounded-2xl border border-line bg-surface px-4 py-3">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
        {/* Left: Title + Live Status Pill */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:justify-start">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-accent" />
            <span className="text-xs font-bold text-ink">Conectar Pantalla Remota</span>
          </div>

          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold ${
              isRemoteConnected || isLocalOnly
                ? 'border-ok/40 bg-ok-soft text-ok'
                : isConnecting
                  ? 'border-warn/40 bg-warn-soft text-warn'
                  : remoteStatus === 'error'
                    ? 'border-err/40 bg-err-soft text-err'
                    : 'border-line bg-canvas text-ink-muted'
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                isRemoteConnected || isLocalOnly
                  ? 'bg-ok'
                  : isConnecting
                    ? 'animate-pulse bg-warn'
                    : remoteStatus === 'error'
                      ? 'bg-err'
                      : 'bg-ink-subtle'
              }`}
            />
            {isRemoteConnected
              ? `Conectado ✓ (${roomCode})`
              : isConnecting
                ? 'Conectando...'
                : isLocalOnly
                  ? 'Conectado ✓ (Local)'
                  : 'Desconectado'}
          </span>
        </div>

        {/* Right: 4-letter Room Code Input + Connect / Disconnect Button */}
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
          <div className="relative flex-1 sm:flex-none">
            <input
              type="text"
              value={inputCode}
              onChange={(e) => setInputCode(normalizeRoomCode(e.target.value))}
              maxLength={4}
              placeholder="ABCD"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              aria-label="Código de sala de 4 letras"
              className="min-h-[42px] w-full rounded-xl border border-line bg-canvas px-3 text-center font-mono text-base font-extrabold tracking-[0.26em] text-ink uppercase outline-none focus:border-accent sm:min-h-[36px] sm:w-28 sm:text-sm"
            />
          </div>

          {isRemoteConnected || isConnecting ? (
            <button
              type="button"
              onClick={disconnectRemoteRoom}
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-err/40 bg-err-soft px-3.5 text-xs font-bold text-err transition hover:bg-err hover:text-err-fg active:scale-95 sm:min-h-[36px]"
            >
              <Unlink className="h-3.5 w-3.5" />
              <span>Desconectar</span>
            </button>
          ) : (
            <button
              type="submit"
              disabled={normalizeRoomCode(inputCode).length !== 4}
              className="inline-flex min-h-[42px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-accent px-4 text-xs font-bold text-accent-fg transition hover:opacity-90 active:scale-95 disabled:opacity-40 sm:min-h-[36px]"
            >
              {isLocalOnly ? <Wifi className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
              <span>Conectar</span>
            </button>
          )}
        </form>
      </div>

      {remoteError && (
        <p className="mt-2 text-xs font-medium text-err">{remoteError}</p>
      )}
    </section>
  );
}
