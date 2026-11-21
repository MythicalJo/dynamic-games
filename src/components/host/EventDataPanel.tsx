import React, { useRef, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileJson,
  RefreshCw,
  Sparkles,
  Trash2,
  Upload,
} from 'lucide-react';
import { useShow } from '../../context/ShowContext';

export function EventDataPanel() {
  const {
    state,
    updateEventMeta,
    exportEventJson,
    importEventJson,
    loadDemoData,
    resetAllData,
    t,
  } = useShow();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
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
    link.download = `${slug || 'puntos-rapidos'}-event-${dateStamp}.json`;
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
    <div className="space-y-6">
      {/* Export / Import Event Data (.json) */}
      <section className="rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-500/10 via-studio-900 to-studio-900 p-5">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              <FileJson className="h-5 w-5 text-amber-400" />
              {t.eventData.backupTitle}
            </h2>
            <p className="mt-0.5 text-xs text-slate-300">{t.eventData.backupDesc}</p>
          </div>
          <span className="rounded-lg border border-white/10 bg-studio-950/80 px-3 py-1 font-mono text-[11px] text-slate-400">
            {t.eventData.autoSaved(state.schemaVersion)}
          </span>
        </div>

        {/* Summary Stats */}
        <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-white/10 bg-studio-950/75 p-3">
            <div className="font-mono text-[11px] text-slate-400 uppercase">
              {t.eventData.teamsStat}
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-cyan-300">
              {state.teams.length}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-studio-950/75 p-3">
            <div className="font-mono text-[11px] text-slate-400 uppercase">
              {t.eventData.questionsStat}
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-amber-300">
              {state.questions.length}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-studio-950/75 p-3">
            <div className="font-mono text-[11px] text-slate-400 uppercase">
              {t.eventData.totalPointsStat}
            </div>
            <div className="mt-1 font-mono text-2xl font-extrabold text-white">
              {state.teams.reduce((sum, item) => sum + item.score, 0).toLocaleString()}
            </div>
          </div>
          <div className="rounded-xl border border-white/10 bg-studio-950/75 p-3">
            <div className="font-mono text-[11px] text-slate-400 uppercase">
              {t.eventData.lastUpdatedStat}
            </div>
            <div className="mt-1 font-mono text-sm font-bold text-slate-200">
              {new Date(state.updatedAt).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Primary Export / Import Buttons */}
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
          className={`grid grid-cols-1 gap-3 rounded-2xl transition sm:grid-cols-2 ${
            isDraggingFile ? 'ring-2 ring-cyan-400 ring-offset-4 ring-offset-studio-900' : ''
          }`}
        >
          <button
            type="button"
            onClick={handleExport}
            className="flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-5 py-3.5 text-sm font-extrabold text-studio-950 shadow-[0_0_24px_rgba(255,201,51,0.28)] transition hover:brightness-110 active:scale-[0.99]"
          >
            <Download className="h-5 w-5 stroke-[2.5]" />
            <span>{t.eventData.exportBtn}</span>
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-2.5 rounded-xl border border-cyan-400/60 bg-cyan-400/15 px-5 py-3.5 text-sm font-extrabold text-cyan-100 transition hover:bg-cyan-400/25 active:scale-[0.99]"
          >
            <Upload className="h-5 w-5 stroke-[2.5]" />
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
            className={`mt-4 flex items-center gap-2.5 rounded-xl border px-4 py-3 text-xs font-semibold ${
              statusMessage.type === 'success'
                ? 'border-emerald-400/40 bg-emerald-400/12 text-emerald-200'
                : 'border-rose-400/45 bg-rose-500/15 text-rose-200'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}
      </section>

      {/* Show Branding & Lobby Screen Text */}
      <section className="rounded-2xl border border-white/10 bg-studio-900/85 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-cyan-400" />
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              {t.eventData.brandingTitle}
            </h2>
            <p className="text-xs text-slate-400">{t.eventData.brandingDesc}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.eventData.showTitleLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.title}
              onChange={(e) => updateEventMeta({ title: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.eventData.topBadgeLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.subtitle}
              onChange={(e) => updateEventMeta({ subtitle: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.eventData.taglineLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.tagline}
              onChange={(e) => updateEventMeta({ tagline: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-300 uppercase">
              {t.eventData.lobbyStatusLabel}
            </label>
            <input
              type="text"
              value={state.eventMeta.lobbyMessage}
              onChange={(e) => updateEventMeta({ lobbyMessage: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
            />
          </div>
        </div>
      </section>

      {/* Session Utilities */}
      <section className="rounded-2xl border border-white/10 bg-studio-900/85 p-5">
        <h3 className="font-display text-xl font-extrabold tracking-wide text-white uppercase">
          {t.eventData.sessionTitle}
        </h3>
        <p className="mt-1 text-xs text-slate-400">{t.eventData.sessionDesc}</p>

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
            className="flex items-center gap-2 rounded-xl border border-cyan-400/40 bg-cyan-400/12 px-4 py-2.5 text-xs font-bold text-cyan-200 transition hover:bg-cyan-400/20"
          >
            <RefreshCw className="h-4 w-4" />
            {t.eventData.loadDemoBtn}
          </button>

          {confirmClear ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/50 bg-rose-500/15 px-3.5 py-2">
              <span className="text-xs font-bold text-rose-200">
                {t.eventData.clearConfirmText}
              </span>
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
                className="rounded-lg bg-rose-500 px-3 py-1 text-xs font-extrabold text-white hover:bg-rose-400"
              >
                {t.eventData.yesClearAll}
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-white/15 px-2.5 py-1 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                {t.common.cancel}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="flex items-center gap-2 rounded-xl border border-rose-500/35 bg-rose-500/10 px-4 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20"
            >
              <Trash2 className="h-4 w-4" />
              {t.eventData.clearAllBtn}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
