import React, { useState } from 'react';
import {
  Check,
  CheckCircle2,
  ChevronRight,
  Gavel,
  ListPlus,
  Minus,
  Pause,
  Pencil,
  Play,
  Plus,
  RotateCcw,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  X,
  XCircle,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { formatBroadcastTimer } from '../../../lib/timer';
import { TEAM_ACCENTS } from '../../../types/show';
import { useConfidenceAuction } from './useConfidenceAuction';

type AuctionTab = 'live' | 'setup';

export function ConfidenceAuctionHost() {
  const { state, setDisplayMode, t } = useShow();
  const {
    auctionState,
    winningTeam,
    activeCategory,
    remainingMs,
    addCategory,
    updateCategory,
    deleteCategory,
    loadSampleCategories,
    selectCategory,
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

  const [tab, setTab] = useState<AuctionTab>('live');
  const [newTitle, setNewTitle] = useState('');
  const [newHint, setNewHint] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editHint, setEditHint] = useState('');

  const targetReached = auctionState.hits >= auctionState.bidTarget;
  const pct = Math.min(100, Math.round((auctionState.hits / Math.max(1, auctionState.bidTarget)) * 100));
  const remainingSec = remainingMs / 1000;
  const isUrgent = remainingMs > 0 && remainingSec <= 5;
  const isWarn = remainingMs > 0 && remainingSec <= 10 && !isUrgent;

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addCategory(newTitle, newHint);
    setNewTitle('');
    setNewHint('');
  };

  const handleNextCategory = () => {
    if (auctionState.categories.length === 0) return;
    const idx = auctionState.categories.findIndex((c) => c.id === auctionState.selectedCategoryId);
    const next = auctionState.categories[(idx + 1) % auctionState.categories.length];
    if (next) selectCategory(next.id);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-amber-400/35 bg-gradient-to-br from-amber-500/12 via-studio-900 to-studio-900 p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-amber-400/50 bg-amber-400/15 glow-gold">
              <Gavel className="h-6 w-6 text-amber-300" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="font-display text-3xl font-black tracking-wide text-gradient-gold uppercase leading-none">
                  {t.auction.title}
                </h2>
                <span className="rounded-md border border-amber-400/35 bg-amber-400/15 px-2 py-0.5 font-mono text-[10px] font-bold tracking-widest text-amber-200 uppercase">
                  {t.auction.subtitle}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-300">{t.auction.desc}</p>
            </div>
          </div>

          {state.displayMode !== 'game' && (
            <button
              type="button"
              onClick={() => setDisplayMode('game')}
              className="self-start rounded-xl bg-cyan-400 px-3.5 py-2 text-xs font-extrabold text-studio-950 transition hover:brightness-110 lg:self-center"
            >
              {t.common.pushToDisplay}
            </button>
          )}
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setTab('live')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              tab === 'live'
                ? 'border-amber-400/80 bg-amber-400/20 text-amber-100 glow-gold'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <Target className="h-4 w-4" />
            <span>{t.auction.tabs.live}</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('setup')}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition ${
              tab === 'setup'
                ? 'border-cyan-400/75 bg-cyan-400/20 text-cyan-100 glow-cyan'
                : 'border-white/10 bg-studio-950/65 text-slate-300 hover:border-white/25 hover:text-white'
            }`}
          >
            <ListPlus className="h-4 w-4" />
            <span>{t.auction.tabs.setup(auctionState.categories.length)}</span>
          </button>
        </div>
      </section>

      {tab === 'live' && (
        <div className="space-y-5">
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="space-y-4 rounded-2xl border border-white/10 bg-studio-900/90 p-5 xl:col-span-7">
              <div>
                <div className="mb-1.5 flex items-center justify-between">
                  <label className="font-mono text-xs font-bold tracking-wider text-cyan-300 uppercase">
                    {t.auction.activeCategory}
                  </label>
                  <button
                    type="button"
                    onClick={handleNextCategory}
                    className="inline-flex items-center gap-1 text-xs font-bold text-amber-300 hover:text-amber-200"
                  >
                    {t.auction.nextCategory} <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>

                <select
                  value={auctionState.selectedCategoryId ?? ''}
                  onChange={(e) => selectCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-cyan-400"
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
                  <p className="mt-1.5 text-xs text-slate-400">
                    {t.auction.hostHint} {activeCategory.hint}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
                <div className="sm:col-span-8">
                  <label className="mb-1.5 block font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t.auction.assignWinningTeam}
                  </label>
                  <select
                    value={winningTeam?.id ?? ''}
                    onChange={(e) => setWinningTeam(e.target.value)}
                    className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 text-sm font-bold text-white outline-none focus:border-amber-400"
                  >
                    {state.teams.length === 0 && (
                      <option value="">{t.common.noTeamsRegistered}</option>
                    )}
                    {state.teams.map((teamItem) => (
                      <option key={teamItem.id} value={teamItem.id}>
                        {teamItem.name} ({teamItem.playerA} &amp; {teamItem.playerB}) —{' '}
                        {teamItem.score} {t.common.pts.toLowerCase()}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-4">
                  <label className="mb-1.5 block font-mono text-xs font-bold tracking-wider text-slate-400 uppercase">
                    {t.auction.winPoints}
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={auctionState.rewardPoints}
                    onChange={(e) => setRewardPoints(Number(e.target.value))}
                    className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2.5 font-mono text-sm font-extrabold text-amber-300 outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-amber-400/35 bg-studio-900/90 p-5 xl:col-span-5">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold tracking-wider text-amber-300 uppercase">
                  {t.auction.highestBidTarget}
                </span>
                {winningTeam && (
                  <span
                    className={`rounded-md border px-2 py-0.5 font-mono text-[11px] font-bold ${TEAM_ACCENTS[winningTeam.accent].border} ${TEAM_ACCENTS[winningTeam.accent].bgSoft} ${TEAM_ACCENTS[winningTeam.accent].text}`}
                  >
                    {winningTeam.name}
                  </span>
                )}
              </div>

              <div className="my-3 flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => adjustBid(-1)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-rose-400/40 bg-rose-500/15 text-rose-200 transition hover:bg-rose-500/25 active:scale-95"
                >
                  <Minus className="h-6 w-6 stroke-[3]" />
                </button>

                <div className="min-w-[100px] rounded-2xl border border-amber-400/50 bg-studio-950 px-5 py-3 text-center glow-gold">
                  <div className="font-mono text-5xl font-black text-gradient-gold tabular-nums leading-none">
                    {auctionState.bidTarget}
                  </div>
                  <div className="mt-1 font-mono text-[10px] font-bold tracking-[0.22em] text-slate-400 uppercase">
                    {t.auction.answersUnit}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => adjustBid(1)}
                  className="flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-400/50 bg-emerald-500/15 text-emerald-200 transition hover:bg-emerald-500/30 active:scale-95"
                >
                  <Plus className="h-6 w-6 stroke-[3]" />
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                {[5, 8, 10, 12, 15].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => adjustBid(preset - auctionState.bidTarget)}
                    className={`rounded-lg border px-2.5 py-1 font-mono text-xs font-bold transition ${
                      auctionState.bidTarget === preset
                        ? 'border-amber-400 bg-amber-400/25 text-amber-200'
                        : 'border-white/10 bg-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div
              className={`rounded-2xl border p-5 xl:col-span-5 ${
                isUrgent
                  ? 'border-rose-500/80 bg-rose-500/15 glow-live'
                  : isWarn
                    ? 'border-amber-400/70 bg-amber-500/12'
                    : 'border-cyan-400/35 bg-studio-900/90'
              }`}
            >
              <div className="font-mono text-xs font-bold tracking-wider text-slate-300 uppercase">
                {t.auction.clockTitle} (
                {auctionState.timer.isRunning
                  ? t.common.running
                  : remainingMs === 0
                    ? t.common.timesUp
                    : t.common.ready}
                )
              </div>

              <div className="my-3 flex items-baseline gap-2">
                <span
                  className={`font-mono text-6xl font-black tabular-nums leading-none ${
                    remainingMs === 0 || isUrgent
                      ? 'text-rose-400'
                      : isWarn
                        ? 'text-amber-300'
                        : 'text-cyan-300'
                  }`}
                >
                  {formatBroadcastTimer(remainingMs)}
                </span>
                <span className="font-mono text-xl font-bold text-slate-400">{t.common.sec}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {auctionState.timer.isRunning ? (
                  <button
                    type="button"
                    onClick={pauseTimer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-3 text-sm font-extrabold text-studio-950 transition hover:brightness-110"
                  >
                    <Pause className="h-4 w-4 fill-current" />
                    {t.common.pause}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startTimer}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-500 px-4 py-3 text-sm font-extrabold text-studio-950 transition hover:brightness-110"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    {t.auction.start30s}
                  </button>
                )}

                <button
                  type="button"
                  onClick={addFiveSeconds}
                  className="rounded-xl border border-cyan-400/45 bg-cyan-400/12 px-3.5 py-3 font-mono text-xs font-extrabold text-cyan-200 hover:bg-cyan-400/25"
                >
                  +5s
                </button>

                <button
                  type="button"
                  onClick={resetTimer}
                  className="rounded-xl border border-white/15 bg-white/5 p-3 text-slate-200 hover:bg-white/10"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-col justify-between rounded-2xl border border-emerald-400/40 bg-studio-900/90 p-5 xl:col-span-7">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-mono text-xs font-bold tracking-wider text-emerald-300 uppercase">
                    {t.auction.validAnswersTitle}
                  </div>
                  <div className="mt-0.5 text-xs text-slate-400">{t.auction.validAnswersDesc}</div>
                </div>
                <div className="text-right font-mono">
                  <span className="text-3xl font-black text-white tabular-nums">
                    {auctionState.hits}
                  </span>
                  <span className="text-lg font-bold text-slate-400">
                    {' '}
                    / {auctionState.bidTarget}
                  </span>
                </div>
              </div>

              <div className="my-3 h-3 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className={`h-full rounded-full transition-all duration-200 ${
                    targetReached
                      ? 'bg-gradient-to-r from-emerald-400 via-yellow-300 to-amber-400'
                      : 'bg-gradient-to-r from-cyan-400 to-emerald-400'
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>

              <div className="flex items-stretch gap-3">
                <button
                  type="button"
                  onClick={incrementHit}
                  className={`flex flex-1 items-center justify-center gap-3 rounded-2xl py-5 font-display text-4xl font-black tracking-wider uppercase shadow-lg transition active:scale-[0.97] ${
                    targetReached
                      ? 'bg-gradient-to-r from-amber-300 via-yellow-400 to-emerald-400 text-studio-950 shadow-[0_0_30px_rgba(255,201,51,0.4)]'
                      : 'bg-gradient-to-r from-emerald-400 to-teal-400 text-studio-950 shadow-[0_0_28px_rgba(52,211,153,0.35)] hover:brightness-110'
                  }`}
                >
                  <Plus className="h-9 w-9 stroke-[3]" />
                  <span>{t.auction.hitButton}</span>
                </button>

                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={decrementHit}
                    disabled={auctionState.hits === 0}
                    className="flex flex-1 items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 text-xs font-extrabold text-slate-200 transition hover:bg-white/10 disabled:opacity-40"
                  >
                    {t.auction.undoHit}
                  </button>
                  <button
                    type="button"
                    onClick={resetRound}
                    className="flex flex-1 items-center justify-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 text-xs font-bold text-rose-200 transition hover:bg-rose-500/20"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> {t.common.reset}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-studio-900/85 p-4">
            <div className="flex items-center gap-2.5 text-sm">
              <Trophy className="h-5 w-5 text-amber-400" />
              <span className="font-bold text-white">{t.auction.roundVerdict}</span>
              <span className="text-xs text-slate-400">
                {auctionState.outcome === 'won' &&
                  t.auction.verdictWon(auctionState.awardedPoints, winningTeam?.name ?? '')}
                {auctionState.outcome === 'failed' && t.auction.verdictFailed}
                {auctionState.outcome === 'pending' &&
                  (targetReached ? t.auction.verdictReached : t.auction.verdictPending)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={!winningTeam}
                onClick={() => setOutcome('won')}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition active:scale-95 disabled:opacity-40 ${
                  auctionState.outcome === 'won'
                    ? 'border-amber-300 bg-gradient-to-r from-amber-400 to-yellow-400 text-studio-950 glow-gold'
                    : 'border-emerald-400/50 bg-emerald-400/15 text-emerald-200 hover:bg-emerald-400/25'
                }`}
              >
                <CheckCircle2 className="h-4 w-4" />
                <span>
                  {auctionState.outcome === 'won'
                    ? t.auction.awardedBtn(auctionState.awardedPoints)
                    : t.auction.bidClearedBtn(auctionState.rewardPoints)}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setOutcome('failed')}
                className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-extrabold transition active:scale-95 ${
                  auctionState.outcome === 'failed'
                    ? 'border-rose-400 bg-rose-500 text-white'
                    : 'border-rose-400/40 bg-rose-500/12 text-rose-200 hover:bg-rose-500/25'
                }`}
              >
                <XCircle className="h-4 w-4" />
                <span>{t.auction.bidFailedBtn}</span>
              </button>

              {auctionState.outcome !== 'pending' && (
                <button
                  type="button"
                  onClick={() => setOutcome('pending')}
                  className="rounded-xl border border-white/15 px-3 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/10"
                >
                  {t.auction.undoVerdict}
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {tab === 'setup' && (
        <section className="rounded-2xl border border-white/10 bg-studio-900/90 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
                {t.auction.setupTitle}
              </h3>
              <p className="text-xs text-slate-400">{t.auction.setupDesc}</p>
            </div>
            <button
              type="button"
              onClick={loadSampleCategories}
              className="flex items-center gap-1.5 rounded-xl border border-cyan-400/40 bg-cyan-400/12 px-3.5 py-2 text-xs font-bold text-cyan-200 hover:bg-cyan-400/25"
            >
              <Sparkles className="h-3.5 w-3.5" />
              {t.auction.resetSamples}
            </button>
          </div>

          <form
            onSubmit={handleAddCategory}
            className="mb-5 grid grid-cols-1 gap-3 rounded-2xl border border-cyan-400/25 bg-studio-950/80 p-4 md:grid-cols-12"
          >
            <div className="md:col-span-6">
              <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                {t.auction.categoryTitleLabel}
              </label>
              <input
                type="text"
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t.auction.categoryPlaceholder}
                className="w-full rounded-xl border border-white/15 bg-studio-900 px-3.5 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
              />
            </div>
            <div className="md:col-span-4">
              <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                {t.auction.optionalHintLabel}
              </label>
              <input
                type="text"
                value={newHint}
                onChange={(e) => setNewHint(e.target.value)}
                placeholder={t.auction.optionalHintPlaceholder}
                className="w-full rounded-xl border border-white/15 bg-studio-900 px-3.5 py-2 text-sm text-slate-200 outline-none focus:border-cyan-400"
              />
            </div>
            <div className="flex items-end md:col-span-2">
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-amber-400 px-4 py-2 text-xs font-extrabold text-studio-950 hover:brightness-110"
              >
                <Plus className="h-4 w-4 stroke-[2.5]" />
                {t.common.add}
              </button>
            </div>
          </form>

          <div className="space-y-2.5">
            {auctionState.categories.map((cat, idx) => {
              const isSelected = cat.id === auctionState.selectedCategoryId;
              const isEditing = editingId === cat.id;

              if (isEditing) {
                return (
                  <div
                    key={cat.id}
                    className="flex flex-col gap-2 rounded-xl border border-cyan-400/50 bg-studio-850 p-3 sm:flex-row"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 rounded-lg border border-white/15 bg-studio-950 px-3 py-1.5 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                    />
                    <input
                      type="text"
                      value={editHint}
                      onChange={(e) => setEditHint(e.target.value)}
                      className="flex-1 rounded-lg border border-white/15 bg-studio-950 px-3 py-1.5 text-xs text-slate-200 outline-none focus:border-cyan-400"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          if (editTitle.trim()) {
                            updateCategory(cat.id, { title: editTitle, hint: editHint });
                          }
                          setEditingId(null);
                        }}
                        className="rounded-lg bg-cyan-400 p-2 text-studio-950"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="rounded-lg border border-white/15 p-2 text-slate-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={cat.id}
                  className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3.5 ${
                    isSelected
                      ? 'border-amber-400/60 bg-amber-400/10'
                      : 'border-white/10 bg-studio-950/65'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{idx + 1}</span>
                      <span className="font-bold text-white">{cat.title}</span>
                    </div>
                    {cat.hint && <p className="mt-0.5 text-xs text-slate-400">{cat.hint}</p>}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        selectCategory(cat.id);
                        setTab('live');
                      }}
                      className={`rounded-lg px-3 py-1.5 text-xs font-extrabold transition ${
                        isSelected
                          ? 'bg-amber-400 text-studio-950'
                          : 'bg-white/10 text-white hover:bg-cyan-400 hover:text-studio-950'
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
                      className="rounded-lg border border-white/12 p-1.5 text-slate-300 hover:text-cyan-300"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteCategory(cat.id)}
                      className="rounded-lg border border-rose-500/25 bg-rose-500/10 p-1.5 text-rose-300 hover:bg-rose-500/25"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
