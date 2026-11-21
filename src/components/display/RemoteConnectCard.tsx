import { QRCodeSVG } from 'qrcode.react';
import { QrCode, RefreshCw, Smartphone, X } from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { getRemoteHostUrl } from '../../lib/mqttSync';

interface RemoteConnectCardProps {
  expanded: boolean;
  onToggle: () => void;
  showCornerBadgeWhenCollapsed: boolean;
}

export function RemoteConnectCard({
  expanded,
  onToggle,
  showCornerBadgeWhenCollapsed,
}: RemoteConnectCardProps) {
  const { roomCode, remoteStatus, remoteConnectedCount, regenerateRoomCode } = useShow();

  if (!roomCode) return null;

  const remoteUrl = getRemoteHostUrl(roomCode);
  const isBrokerConnected = remoteStatus === 'connected';
  const hasRemoteHost = remoteConnectedCount > 0;

  if (!expanded) {
    if (!showCornerBadgeWhenCollapsed) return null;
    return (
      <div className="fixed bottom-6 left-6 z-40">
        <button
          type="button"
          onClick={onToggle}
          className="flex items-center gap-2 rounded-full border border-line bg-surface/95 px-3.5 py-2 text-xs font-bold text-ink shadow-sm backdrop-blur-md transition hover:border-line-strong"
          title="Mostrar código QR para conectar celular"
        >
          <span
            className={`h-2 w-2 rounded-full ${
              isBrokerConnected ? 'bg-ok' : remoteStatus === 'error' ? 'bg-err' : 'bg-warn'
            }`}
          />
          <QrCode className="h-3.5 w-3.5 text-ink-muted" />
          <span className="font-mono tracking-[0.18em]">{roomCode}</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 left-6 z-40 w-[256px] rounded-2xl border border-line-strong bg-surface/95 p-4 text-ink shadow-xl backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Smartphone className="h-3.5 w-3.5 text-accent" />
          <span className="font-mono text-[10px] font-bold tracking-[0.16em] text-ink-muted uppercase">
            Control Remoto
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={regenerateRoomCode}
            className="rounded-lg border border-line bg-canvas p-1 text-ink-subtle transition hover:text-ink"
            title="Generar nuevo código de sala"
          >
            <RefreshCw className="h-3 w-3" />
          </button>
          <button
            type="button"
            onClick={onToggle}
            className="rounded-lg border border-line bg-canvas p-1 text-ink-subtle transition hover:text-ink"
            title="Minimizar tarjeta QR"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      </div>

      {/* Crisp white pad so phones scan reliably even on Negro / Pizarra themes */}
      <div className="flex justify-center rounded-xl bg-white p-3">
        <QRCodeSVG value={remoteUrl} size={148} level="M" bgColor="#FFFFFF" fgColor="#111827" />
      </div>

      <div className="mt-3 text-center">
        <div className="font-mono text-[10px] font-bold tracking-[0.2em] text-ink-subtle uppercase">
          Código de Sala
        </div>
        <div className="mt-0.5 font-mono text-3xl font-extrabold tracking-[0.28em] text-ink">
          {roomCode}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-line bg-canvas px-2.5 py-1.5 text-[11px] font-semibold">
        <span
          className={`h-2 w-2 rounded-full ${
            isBrokerConnected
              ? 'bg-ok'
              : remoteStatus === 'error'
                ? 'bg-err'
                : 'animate-pulse bg-warn'
          }`}
        />
        <span className={isBrokerConnected ? 'text-ok' : 'text-ink-muted'}>
          {hasRemoteHost
            ? `Conectado ✓ (${remoteConnectedCount} celular${remoteConnectedCount > 1 ? 'es' : ''})`
            : isBrokerConnected
              ? 'Conectado ✓ · Escanea el QR'
              : remoteStatus === 'error'
                ? 'Sin conexión remota'
                : 'Conectando sala...'}
        </span>
      </div>
    </div>
  );
}
