import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Shuffle,
  Trash2,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import type { GameHostProps } from '../../../modules/registry';
import { TeamSelectorStrip } from '../../host/TeamSelectorStrip';
import { useConfidenceAuction } from './useConfidenceAuction';

export function ConfidenceAuctionHost({ mode }: GameHostProps) {
  const { t } = useShow();
  const {
    auctionState,
    winningTeam,
    activeCategory,
    unusedCategoriesCount,
    remainingMs,
    addCategory,
    updateCategory,
    deleteCategory,
    loadSampleCategories,
    selectCategory,
    selectRandomCategory,
    adjustBid,
    setWinningTeam,
    setRewardPoints,
    startTimer,
    pauseTimer,
    resetTimer,
    addFiveSeconds,
    incrementHit,
    decrementHit,
    setOutcome,
    resetRound,
  } = useConfidenceAuction();

  const [newTitle, setNewTitle] = useState('');
  const [newHint, setNewHint] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHint, setEditHint] = useState('');

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addCategory(newTitle, newHint);
    setNewTitle('');
    setNewHint('');
  };

  const stepCategory = (dir: -1 | 1) => {
    if (auctionState.categories.length === 0) return;
    const len = auctionState.categories.length;
    const idx = auctionState.categories.findIndex((c) => c.id === auctionState.selectedCategoryId);
    const next = auctionState.categories[((idx >= 0 ? idx : 0) + dir + len) % len];
    if (next) selectCategory(next.id);
  };

  /* ===================================================================== */
  /* SETUP MODE: Categories Bank                                           */
  /* ===================================================================== */
  if (mode === 'setup') {
    return (
      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
              <Gavel className="h-5 w-5 shrink-0 text-accent" />
              <span>{t.auction.setupTitle}</span>
            </h2>
            <p className="mt-0.5 text-xs text-ink-muted">{t.auction.setupDesc}</p>
          </div>
          <button
            type="button"
            onClick={loadSampleCategories}
            className="rounded-xl border border-line bg-canvas px-3.5 py-2 text-xs font-semibold text-ink hover:bg-surface-2"
          >
            {t.auction.resetSamples}
          </button>
        </div>

        <form
          onSubmit={handleAddCategory}
          className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-line bg-canvas p-4 md:grid-cols-12"
        >
          <div className="md:col-span-6">
            <label className="mb-1 block text-xs font-semibold text-ink-muted">
              {t.auction.categoryTitleLabel}
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder={t.auction.categoryPlaceholder}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div className="md:col-span-4">
            <label className="mb-1 block text-xs font-semibold text-ink-muted">
              {t.auction.optionalHintLabel}
            </label>
            <input
              type="text"
              value={newHint}
              onChange={(e) => setNewHint(e.target.value)}
              placeholder={t.auction.optionalHintPlaceholder}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>
          <div className="flex items-end md:col-span-2">
            <button
              type="submit"
              className="inline-flex w-full items-center justify-center gap-1 rounded-lg bg-accent px-4 py-2 text-xs font-bold text-accent-fg"
            >
              <Plus className="h-4 w-4" />
              {t.common.add}
            </button>
          </div>
        </form>

        <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-canvas">
          {auctionState.categories.map((cat, idx) => {
            const isSelected = cat.id === auctionState.selectedCategoryId;
            const isEditing = editingId === cat.id;

            if (isEditing) {
              return (
                <div key={cat.id} className="flex flex-col gap-2 bg-surface p-3 sm:flex-row">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-sm text-ink outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={editHint}
                    onChange={(e) => setEditHint(e.target.value)}
                    className="flex-1 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
                  />
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        if (editTitle.trim()) updateCategory(cat.id, { title: editTitle, hint: editHint });
                        setEditingId(null);
                      }}
                      className="rounded-lg bg-accent p-2 text-accent-fg"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-line p-2 text-ink-muted"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div key={cat.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-ink-subtle">#{idx + 1}</span>
                    <span className="text-sm font-semibold text-ink">{cat.title}</span>
                  </div>
                  {cat.hint && <p className="mt-0.5 pl-6 text-xs text-ink-muted">{cat.hint}</p>}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => selectCategory(cat.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                      isSelected
                        ? 'bg-ink text-canvas'
                        : 'border border-line bg-surface text-ink hover:border-line-strong'
                    }`}
                  >
                    {isSelected ? t.common.onStage : t.common.loadLive}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(cat.id);
                      setEditTitle(cat.title);
                      setEditHint(cat.hint ?? '');
                    }}
                    className="rounded-lg border border-line p-1.5 text-ink-muted hover:text-ink"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteCategory(cat.id)}
                    className="rounded-lg border border-line p-1.5 text-ink-subtle hover:border-err/40 hover:bg-err-soft hover:text-err"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  }

  /* ===================================================================== */
  /* LIVE MODE: Category, Bid Counter, 30s Timer & Big "+1 ACIERTO"        */
  /* ===================================================================== */
  const targetReached = auctionState.hits >= auctionState.bidTarget;
  const pct = Math.min(100, Math.round((auctionState.hits / Math.max(1, auctionState.bidTarget)) * 100));
  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 5;
  const isWarn = remainingMs > 0 && remainingSec <= 10 && !isUrgent;

  return (
    <div className="w-full max-w-full space-y-5">
      {/* Category + 1-Tap Team Strip + Bid Counter */}
      <section className="w-full max-w-full rounded-2xl border border-line bg-surface p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
            <Gavel className="h-5 w-5 shrink-0 text-accent" />
            <span>{t.auction.title}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={selectRandomCategory}
              disabled={auctionState.categories.length === 0}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-xl bg-accent px-3 py-1.5 text-xs font-bold text-accent-fg transition hover:opacity-90 active:scale-95 disabled:opacity-40"
              title={`Quedan ${unusedCategoriesCount} categorías sin usar`}
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Categoría al azar</span>
            </button>
            <button
              type="button"
              onClick={() => stepCategory(-1)}
              disabled={auctionState.categories.length === 0}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-xl border border-line bg-canvas text-ink-muted hover:text-ink disabled:opacity-40"
              aria-label="Categoría anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => stepCategory(1)}
              disabled={auctionState.categories.length === 0}
              className="flex h-[36px] w-[36px] items-center justify-center rounded-xl border border-line bg-canvas text-ink-muted hover:text-ink disabled:opacity-40"
              aria-label="Siguiente categoría"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mb-4">
          <TeamSelectorStrip
            selectedTeamId={winningTeam?.id ?? null}
            onSelectTeam={setWinningTeam}
            label="Equipo ganador de la subasta:"
          />
        </div>

        <div className="grid w-full max-w-full grid-cols-1 gap-4 md:grid-cols-12">
          <div className="min-w-0 space-y-3 md:col-span-7">
            <div className="min-w-0">
              <div className="mb-1 flex flex-wrap items-center justify-between gap-1">
                <label className="text-xs font-semibold text-ink-muted">
                  {t.auction.activeCategory}
                </label>
                <span className="font-mono text-[10px] text-ink-subtle">
                  {unusedCategoriesCount} sin usar / {auctionState.categories.length}
                </span>
              </div>
              <select
                value={auctionState.selectedCategoryId ?? ''}
                onChange={(e) => selectCategory(e.target.value)}
                className="w-full max-w-full rounded-xl border border-line bg-canvas px-3.5 py-2.5 text-sm font-semibold text-ink outline-none focus:border-accent"
              >
                {auctionState.categories.length === 0 && (
                  <option value="">{t.auction.noCategoriesOption}</option>
                )}
                {auctionState.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.title}
                  </option>
                ))}
              </select>
              {activeCategory?.hint && (
                <p className="mt-1 break-words text-xs text-ink-muted">
                  {t.auction.hostHint} {activeCategory.hint}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <label className="text-xs font-semibold text-ink-muted">
                {t.auction.winPoints}:
              </label>
              <input
                type="number"
                min={1}
                value={auctionState.rewardPoints}
                onChange={(e) => setRewardPoints(Number(e.target.value))}
                className="w-24 rounded-xl border border-line bg-canvas px-3 py-2 text-center font-mono text-sm font-bold text-ink outline-none focus:border-accent sm:text-xs"
              />
              <span className="text-[11px] text-ink-subtle">
                (si fallan: +10 pts a los demás)
              </span>
            </div>
          </div>

          {/* Live Bid Counter */}
          <div className="flex w-full max-w-full flex-col justify-between rounded-xl border border-line bg-canvas p-4 md:col-span-5">
            <span className="text-center font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
              {t.auction.highestBidTarget}
            </span>

            <div className="my-2 flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => adjustBid(-1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:border-line-strong active:scale-95"
              >
                <Minus className="h-5 w-5" />
              </button>

              <div className="min-w-[76px] text-center">
                <div className="font-mono text-4xl font-extrabold text-accent tabular-nums leading-none">
                  {auctionState.bidTarget}
                </div>
                <div className="mt-0.5 font-mono text-[10px] font-semibold text-ink-subtle uppercase">
                  {t.auction.answersUnit}
                </div>
              </div>

              <button
                type="button"
                onClick={() => adjustBid(1)}
                className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-surface text-ink hover:border-line-strong active:scale-95"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-1.5">
              {[5, 8, 10, 12, 15].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => adjustBid(preset - auctionState.bidTarget)}
                  className={`rounded-md border px-2.5 py-1 font-mono text-xs font-bold sm:px-2 sm:py-0.5 sm:text-[11px] ${
                    auctionState.bidTarget === preset
                      ? 'border-ink bg-ink text-canvas'
                      : 'border-line bg-surface text-ink-muted hover:text-ink'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Big 30s Timer + Giant "+1 ACIERTO" Counter */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div
          className={`flex flex-col justify-between rounded-2xl border p-5 md:col-span-5 ${
            remainingMs === 0 || isUrgent
              ? 'border-err bg-err-soft'
              : isWarn
                ? 'border-warn bg-warn-soft'
                : 'border-line bg-surface'
          }`}
        >
          <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
            {t.auction.clockTitle}
          </span>

          <div
            className={`my-3 font-mono text-6xl font-extrabold tabular-nums leading-none ${
              remainingMs === 0 || isUrgent ? 'text-err' : isWarn ? 'text-warn' : 'text-ink'
            }`}
          >
            {formatBroadcastTimer(remainingMs)}
            <span className="ml-1 text-lg font-semibold text-ink-subtle">s</span>
          </div>

          <div className="flex items-center gap-2">
            {auctionState.timer.isRunning ? (
              <button
                type="button"
                onClick={pauseTimer}
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-warn py-3 text-base font-extrabold text-warn-fg active:scale-[0.98] sm:min-h-[44px] sm:text-sm"
              >
                <Pause className="h-5 w-5 fill-current sm:h-4 sm:w-4" />
                {t.common.pause}
              </button>
            ) : (
              <button
                type="button"
                onClick={startTimer}
                className="inline-flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-xl bg-accent py-3 text-base font-extrabold text-accent-fg active:scale-[0.98] sm:min-h-[44px] sm:text-sm"
              >
                <Play className="h-5 w-5 fill-current sm:h-4 sm:w-4" />
                {t.auction.start30s}
              </button>
            )}
            <button
              type="button"
              onClick={addFiveSeconds}
              className="min-h-[52px] rounded-xl border border-line bg-canvas px-3.5 py-2.5 font-mono text-xs font-bold text-ink active:scale-95 sm:min-h-[44px]"
            >
              +5s
            </button>
            <button
              type="button"
              onClick={resetTimer}
              className="min-h-[52px] rounded-xl border border-line bg-canvas px-3 py-2.5 text-ink-muted hover:text-ink active:scale-95 sm:min-h-[44px]"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* BIG "+1 ACIERTO" BUTTON */}
        <div className="flex flex-col justify-between rounded-2xl border border-line bg-surface p-5 md:col-span-7">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-wider text-ink-muted uppercase">
              {t.auction.validAnswersTitle}
            </span>
            <span className="font-mono text-2xl font-extrabold text-ink tabular-nums">
              {auctionState.hits}{' '}
              <span className="text-base font-semibold text-ink-subtle">
                / {auctionState.bidTarget}
              </span>
            </span>
          </div>

          <div className="my-3 h-2 w-full overflow-hidden rounded-full bg-line">
            <div
              className={`h-full rounded-full transition-all duration-200 ${
                targetReached ? 'bg-ok' : 'bg-accent'
              }`}
              style={{ width: `${pct}%` }}
            />
          </div>

          <div className="flex flex-col items-stretch gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={incrementHit}
              className={`flex min-h-[64px] flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-5 text-xl font-extrabold uppercase transition active:scale-[0.98] sm:text-2xl ${
                targetReached ? 'bg-ok text-ok-fg' : 'bg-ink text-canvas hover:opacity-90'
              }`}
            >
              <Plus className="h-7 w-7 shrink-0 stroke-[2.5]" />
              <span>{t.auction.hitButton}</span>
            </button>

            <div className="grid grid-cols-2 gap-1.5 sm:flex sm:flex-col">
              <button
                type="button"
                onClick={decrementHit}
                disabled={auctionState.hits === 0}
                className="min-h-[42px] flex-1 rounded-xl border border-line bg-canvas px-3.5 text-xs font-bold text-ink hover:border-line-strong disabled:opacity-40 sm:min-h-0"
              >
                {t.auction.undoHit}
              </button>
              <button
                type="button"
                onClick={resetRound}
                className="min-h-[42px] flex-1 rounded-xl border border-line bg-canvas px-3.5 text-xs font-semibold text-ink-muted hover:text-err sm:min-h-0"
              >
                {t.common.reset}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Round Verdict Actions */}
      <section className="flex w-full max-w-full flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-surface p-4">
        <span
          className={`text-xs font-semibold ${
            auctionState.outcome === 'failed'
              ? 'text-err'
              : auctionState.outcome === 'won'
                ? 'text-ok'
                : 'text-ink-muted'
          }`}
        >
          {auctionState.outcome === 'won' &&
            t.auction.verdictWon(auctionState.awardedPoints, winningTeam?.name ?? '')}
          {auctionState.outcome === 'failed' && t.auction.verdictFailed}
          {auctionState.outcome === 'pending' &&
            (targetReached ? t.auction.verdictReached : t.auction.verdictPending)}
        </span>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={!winningTeam}
            onClick={() => setOutcome('won')}
            className={`rounded-xl border px-4 py-2 text-xs font-bold transition disabled:opacity-40 ${
              auctionState.outcome === 'won'
                ? 'border-ok bg-ok text-ok-fg'
                : 'border-ok/40 bg-ok-soft text-ok hover:bg-ok hover:text-ok-fg'
            }`}
          >
            {auctionState.outcome === 'won'
              ? t.auction.awardedBtn(auctionState.awardedPoints)
              : t.auction.bidClearedBtn(auctionState.rewardPoints)}
          </button>

          <button
            type="button"
            onClick={() => setOutcome('failed')}
            className={`rounded-xl border px-4 py-2 text-xs font-bold transition ${
              auctionState.outcome === 'failed'
                ? 'border-err bg-err text-err-fg'
                : 'border-err/40 bg-err-soft text-err hover:bg-err hover:text-err-fg'
            }`}
          >
            {t.auction.bidFailedBtn}
          </button>

          {auctionState.outcome !== 'pending' && (
            <button
              type="button"
              onClick={() => setOutcome('pending')}
              className="rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink-muted hover:text-ink"
            >
              {t.auction.undoVerdict}
            </button>
          )}
        </div>
      </section>
    </div>
  );
}
