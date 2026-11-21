import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  RefreshCw,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { useShow } from '../../context/ShowContext';
import { ResetEventModal } from './ResetEventModal';

export function EventDataPanel() {
  const {
    state,
    updateEventMeta,
    exportEventJson,
    importEventJson,
    loadDemoData,
    resetEventProgress,
    resetAllData,
    t,
  } = useShow();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);

  const handleExport = () => {
    const json = exportEventJson();
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);
    const slug = (state.eventMeta.title || 'puntos-rapidos')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug || 'puntos-rapidos'}-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);

    setStatusMessage({
      type: 'success',
      text: t.eventData.exportedMsg(state.teams.length, state.questions.length),
    });
  };

  const handleFileImport = (file: File | undefined) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const result = importEventJson(content);
      if (result.ok) {
        setStatusMessage({
          type: 'success',
          text: t.eventData.importedMsg(file.name),
        });
      } else {
        setStatusMessage({
          type: 'error',
          text: result.error,
        });
      }
    };
    reader.onerror = () => {
      setStatusMessage({
        type: 'error',
        text: t.eventData.readError,
      });
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileImport(e.target.files?.[0]);
    e.target.value = '';
  };

  return (
    <div className="w-full max-w-full space-y-6">
      {/* Export / Import Event Data (.json) */}
      <section className="w-full max-w-full overflow-hidden rounded-2xl border border-line bg-surface p-4 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-ink">
              {t.eventData.backupTitle}
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">{t.eventData.backupDesc}</p>
          </div>
          <span className="rounded-full border border-line bg-canvas px-3 py-1 font-mono text-[11px] text-ink-subtle">
            {t.eventData.autoSaved(state.schemaVersion)}
          </span>
        </div>

        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-line bg-canvas p-3.5">
            <div className="text-[11px] font-medium text-ink-subtle">{t.eventData.teamsStat}</div>
            <div className="mt-1 font-mono text-2xl font-bold text-ink">{state.teams.length}</div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-3.5">
            <div className="text-[11px] font-medium text-ink-subtle">
              {t.eventData.questionsStat}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-ink">
              {state.questions.length}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-3.5">
            <div className="text-[11px] font-medium text-ink-subtle">
              {t.eventData.totalPointsStat}
            </div>
            <div className="mt-1 font-mono text-2xl font-bold text-ink">
              {state.teams.reduce((sum, item) => sum + item.score, 0).toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-line bg-canvas p-3.5">
            <div className="text-[11px] font-medium text-ink-subtle">
              {t.eventData.lastUpdatedStat}
            </div>
            <div className="mt-1 font-mono text-sm font-semibold text-ink">
              {new Date(state.updatedAt).toLocaleTimeString('es-ES')}
            </div>
          </div>
        </div>

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDraggingFile(true);
          }}
          onDragLeave={() => setIsDraggingFile(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDraggingFile(false);
            handleFileImport(e.dataTransfer.files?.[0]);
          }}
          className={`grid grid-cols-1 gap-3 rounded-xl transition sm:grid-cols-2 ${
            isDraggingFile ? 'ring-2 ring-accent ring-offset-4 ring-offset-surface' : ''
          }`}
        >
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-fg transition hover:opacity-90 active:scale-[0.99]"
          >
            <Download className="h-4 w-4" />
            <span>{t.eventData.exportBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border border-line-strong bg-canvas px-5 py-3 text-sm font-bold text-ink transition hover:bg-surface-2 active:scale-[0.99]"
          >
            <Upload className="h-4 w-4" />
            <span>{isDraggingFile ? t.eventData.dropJson : t.eventData.importBtn}</span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {statusMessage && (
          <div
            className={`mt-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'border-ok/35 bg-ok-soft text-ok'
                : 'border-err/35 bg-err-soft text-err'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </section>

      {/* Show Branding & Lobby Screen Text */}
      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5">
          <h2 className="text-lg font-bold tracking-tight text-ink">
            {t.eventData.brandingTitle}
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">{t.eventData.brandingDesc}</p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.eventData.showTitleLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.title}
              onChange={(e) => updateEventMeta({ title: e.target.value })}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.eventData.topBadgeLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.subtitle}
              onChange={(e) => updateEventMeta({ subtitle: e.target.value })}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.eventData.taglineLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.tagline}
              onChange={(e) => updateEventMeta({ tagline: e.target.value })}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-ink-muted">
              {t.eventData.lobbyStatusLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.lobbyMessage}
              onChange={(e) => updateEventMeta({ lobbyMessage: e.target.value })}
              className="w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
        </div>
      </section>

      {/* Session Utilities */}
      <section className="rounded-2xl border border-line bg-surface p-6">
        <h3 className="text-base font-bold text-ink">{t.eventData.sessionTitle}</h3>
        <p className="mt-0.5 text-xs text-ink-muted">{t.eventData.sessionDesc}</p>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => {
              loadDemoData();
              setConfirmClear(false);
              setStatusMessage({
                type: 'success',
                text: t.eventData.loadedDemoMsg,
              });
            }}
            className="inline-flex items-center gap-2 rounded-xl border border-line-strong bg-canvas px-4 py-2 text-xs font-semibold text-ink transition hover:bg-surface-2"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            {t.eventData.loadDemoBtn}
          </button>

          <button
            type="button"
            onClick={() => setResetModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-warn/45 bg-warn-soft px-4 py-2 text-xs font-bold text-warn transition hover:border-warn"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Reiniciar Todo</span>
          </button>

          {confirmClear ? (
            <div className="flex items-center gap-2 rounded-xl border border-err/40 bg-err-soft px-3.5 py-2">
              <span className="text-xs font-semibold text-err">{t.eventData.clearConfirmText}</span>
              <button
                type="button"
                onClick={() => {
                  resetAllData();
                  setConfirmClear(false);
                  setStatusMessage({
                    type: 'success',
                    text: t.eventData.clearedMsg,
                  });
                }}
                className="rounded-lg bg-err px-3 py-1 text-xs font-bold text-err-fg"
              >
                {t.eventData.yesClearAll}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-line bg-canvas px-2.5 py-1 text-xs font-medium text-ink-muted"
              >
                {t.common.cancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-err/35 bg-err-soft px-4 py-2 text-xs font-semibold text-err transition hover:opacity-90"
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t.eventData.clearAllBtn}
            </button>
          )}
        </div>
      </section>

      <ResetEventModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        onConfirmReset={() => {
          resetEventProgress();
          setStatusMessage({
            type: 'success',
            text: 'Evento reiniciado: localStorage limpio y todos los puntajes en 0.',
          });
        }}
      />
    </div>
  );
}
