import React, { useState } from 'react';
import {
  Award,
  Check,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Star,
  StickyNote,
  Trash2,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import { TEAM_ACCENTS, type PreparedQuestion } from '../../../types/show';

export function RapidStageHost() {
  const {
    state,
    updateStageState,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    adjustTeamScore,
    t,
  } = useShow();

  const { stageState, questions, teams } = state;
  const selectedQuestion = questions.find((q) => q.id === stageState.selectedQuestionId) ?? null;

  const [showAddForm, setShowAddForm] = useState(false);
  const [category, setCategory] = useState('TELEPATÍA');
  const [points, setPoints] = useState('250');
  const [prompt, setPrompt] = useState('');
  const [answer, setAnswer] = useState('');
  const [hostNote, setHostNote] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<{
    category: string;
    points: string;
    prompt: string;
    answer: string;
    hostNote: string;
  } | null>(null);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    const newId = addQuestion({
      category: category.trim() || 'GENERAL',
      points: Number(points) || 100,
      prompt: prompt.trim(),
      answer: answer.trim(),
      hostNote: hostNote.trim() || undefined,
    });
    updateStageState({
      selectedQuestionId: newId,
      answerRevealed: false,
      promptVisible: true,
    });
    setPrompt('');
    setAnswer('');
    setHostNote('');
    setShowAddForm(false);
  };

  const startEditQuestion = (q: PreparedQuestion) => {
    setEditingId(q.id);
    setEditDraft({
      category: q.category,
      points: String(q.points),
      prompt: q.prompt,
      answer: q.answer,
      hostNote: q.hostNote ?? '',
    });
  };

  const saveEditQuestion = (id: string) => {
    if (!editDraft || !editDraft.prompt.trim()) return;
    updateQuestion(id, {
      category: editDraft.category,
      points: Number(editDraft.points) || 100,
      prompt: editDraft.prompt.trim(),
      answer: editDraft.answer.trim(),
      hostNote: editDraft.hostNote.trim() || undefined,
    });
    setEditingId(null);
    setEditDraft(null);
  };

  const handleSelectQuestion = (id: string) => {
    updateStageState({
      selectedQuestionId: id,
      answerRevealed: false,
      promptVisible: true,
    });
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-cyan-400/30 bg-studio-900/90 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              <Sparkles className="h-5 w-5 text-amber-400" />
              {t.rapidStage.controllerTitle}
            </h2>
            <p className="text-xs text-slate-400">{t.rapidStage.controllerDesc}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => updateStageState({ promptVisible: !stageState.promptVisible })}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-bold transition ${
                stageState.promptVisible
                  ? 'border-cyan-400/50 bg-cyan-400/15 text-cyan-200'
                  : 'border-white/15 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              {stageState.promptVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              {stageState.promptVisible ? t.rapidStage.promptVisible : t.rapidStage.promptHidden}
            </button>

            <button
              type="button"
              disabled={!selectedQuestion}
              onClick={() => updateStageState({ answerRevealed: !stageState.answerRevealed })}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-xs font-extrabold transition disabled:opacity-40 ${
                stageState.answerRevealed
                  ? 'border-amber-400 bg-gradient-to-r from-amber-400 to-yellow-500 text-studio-950 glow-gold'
                  : 'border-amber-400/50 bg-amber-400/15 text-amber-200 hover:bg-amber-400/25'
              }`}
            >
              <Sparkles className="h-4 w-4" />
              {stageState.answerRevealed ? t.rapidStage.hideAnswer : t.rapidStage.revealAnswer}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          <div className="md:col-span-5">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t.rapidStage.roundBannerLabel}
            </label>
            <input
              type="text"
              value={stageState.roundLabel}
              onChange={(e) => updateStageState({ roundLabel: e.target.value })}
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
            />
          </div>

          <div className="md:col-span-4">
            <label className="mb-1.5 block text-xs font-bold tracking-wider text-slate-400 uppercase">
              {t.rapidStage.spotlightTeam}
            </label>
            <select
              value={stageState.spotlightTeamId ?? ''}
              onChange={(e) =>
                updateStageState({ spotlightTeamId: e.target.value ? e.target.value : null })
              }
              className="w-full rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
            >
              <option value="">{t.rapidStage.noneAllPairs}</option>
              {teams.map((teamItem) => (
                <option key={teamItem.id} value={teamItem.id}>
                  {teamItem.name} ({teamItem.playerA} &amp; {teamItem.playerB})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end md:col-span-3">
            <label className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/15 bg-studio-950 px-3.5 py-2 text-xs font-bold text-slate-200">
              <span>{t.rapidStage.bottomScoreStrip}</span>
              <input
                type="checkbox"
                checked={stageState.showBottomScores}
                onChange={(e) => updateStageState({ showBottomScores: e.target.checked })}
                className="h-4 w-4 accent-cyan-400"
              />
            </label>
          </div>
        </div>

        {selectedQuestion ? (
          <div className="mt-5 rounded-2xl border border-white/10 bg-studio-950/75 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-cyan-400/20 px-2.5 py-0.5 font-mono text-xs font-bold text-cyan-200">
                  {selectedQuestion.category}
                </span>
                <span className="rounded-md bg-amber-400/20 px-2.5 py-0.5 font-mono text-xs font-bold text-amber-300">
                  +{selectedQuestion.points} {t.common.pts}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-500 uppercase">
                {t.rapidStage.loadedOnStage}
              </span>
            </div>

            <p className="mt-3 text-base font-bold text-white">{selectedQuestion.prompt}</p>

            <div className="mt-3 rounded-xl border border-amber-400/25 bg-amber-400/8 px-3.5 py-2.5">
              <span className="font-mono text-[10px] font-bold tracking-widest text-amber-300 uppercase">
                {stageState.answerRevealed ? t.rapidStage.answerVisible : t.rapidStage.answerHidden}:
              </span>
              <p className="mt-0.5 text-sm font-semibold text-amber-100">
                {selectedQuestion.answer || '—'}
              </p>
            </div>

            {selectedQuestion.hostNote && (
              <div className="mt-2.5 flex items-start gap-2 rounded-xl border border-violet-400/25 bg-violet-500/10 px-3.5 py-2 text-xs text-violet-200">
                <StickyNote className="mt-0.5 h-3.5 w-3.5 shrink-0 text-violet-300" />
                <span>
                  <strong className="uppercase">{t.rapidStage.privateHostNote}</strong>{' '}
                  {selectedQuestion.hostNote}
                </span>
              </div>
            )}

            {teams.length > 0 && (
              <div className="mt-4 border-t border-white/10 pt-3.5">
                <div className="mb-2 flex items-center gap-1.5 text-xs font-bold tracking-wider text-slate-400 uppercase">
                  <Award className="h-3.5 w-3.5 text-amber-400" />
                  {t.rapidStage.quickAward(selectedQuestion.points)}
                </div>
                <div className="flex flex-wrap gap-2">
                  {teams.map((team) => {
                    const accent = TEAM_ACCENTS[team.accent];
                    return (
                      <button
                        key={team.id}
                        type="button"
                        onClick={() => adjustTeamScore(team.id, selectedQuestion.points)}
                        className={`flex items-center gap-2 rounded-xl border ${accent.border} ${accent.bgSoft} px-3 py-1.5 text-xs font-extrabold text-white transition hover:brightness-125 active:scale-95`}
                      >
                        <span className={`h-2 w-2 rounded-full ${accent.dot}`} />
                        <span>{team.name}</span>
                        <span className="font-mono text-amber-300">+{selectedQuestion.points}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="mt-4 rounded-xl border border-dashed border-white/15 py-6 text-center text-sm text-slate-400">
            {t.rapidStage.selectOrAddPrompt}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-white/10 bg-studio-900/85 p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold tracking-wide text-white uppercase">
              {t.rapidStage.bankTitle(questions.length)}
            </h2>
            <p className="text-xs text-slate-400">{t.rapidStage.bankDesc}</p>
          </div>

          <button
            type="button"
            onClick={() => setShowAddForm((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-yellow-500 px-4 py-2 text-xs font-extrabold text-studio-950 transition hover:brightness-110"
          >
            <Plus className="h-4 w-4 stroke-[2.5]" />
            {showAddForm ? t.rapidStage.closeForm : t.rapidStage.addQuestion}
          </button>
        </div>

        {showAddForm && (
          <form
            onSubmit={handleAddQuestion}
            className="mb-5 space-y-3 rounded-2xl border border-cyan-400/35 bg-studio-950/90 p-4"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                  {t.rapidStage.category}
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-sm font-semibold text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                  {t.rapidStage.pointValue}
                </label>
                <input
                  type="number"
                  required
                  value={points}
                  onChange={(e) => setPoints(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 font-mono text-sm font-bold text-amber-300 outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                {t.rapidStage.questionPrompt}
              </label>
              <textarea
                rows={2}
                required
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-sm font-medium text-white outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                  {t.rapidStage.answerRevealText}
                </label>
                <input
                  type="text"
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-sm font-medium text-white outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-400 uppercase">
                  {t.rapidStage.privateNoteInput}
                </label>
                <input
                  type="text"
                  value={hostNote}
                  onChange={(e) => setHostNote(e.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-studio-900 px-3 py-2 text-sm font-medium text-white outline-none focus:border-cyan-400"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="rounded-xl border border-white/15 px-4 py-2 text-xs font-bold text-slate-300 hover:bg-white/10"
              >
                {t.common.cancel}
              </button>
              <button
                type="submit"
                className="rounded-xl bg-cyan-400 px-5 py-2 text-xs font-extrabold text-studio-950 hover:brightness-110"
              >
                {t.rapidStage.saveAndLoad}
              </button>
            </div>
          </form>
        )}

        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/15 py-10 text-center text-sm text-slate-400">
            {t.rapidStage.emptyBank}
          </div>
        ) : (
          <div className="space-y-2.5">
            {questions.map((q, index) => {
              const isSelected = q.id === stageState.selectedQuestionId;
              const isEditing = editingId === q.id && editDraft !== null;

              if (isEditing && editDraft) {
                return (
                  <div
                    key={q.id}
                    className="space-y-3 rounded-2xl border border-cyan-400/50 bg-studio-850/90 p-4"
                  >
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        value={editDraft.category}
                        onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                        className="rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-xs font-bold text-cyan-200 uppercase outline-none focus:border-cyan-400 sm:col-span-2"
                      />
                      <input
                        type="number"
                        value={editDraft.points}
                        onChange={(e) => setEditDraft({ ...editDraft, points: e.target.value })}
                        className="rounded-lg border border-white/15 bg-studio-950 px-3 py-2 font-mono text-xs font-bold text-amber-300 outline-none focus:border-cyan-400"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={editDraft.prompt}
                      onChange={(e) => setEditDraft({ ...editDraft, prompt: e.target.value })}
                      className="w-full rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <input
                        type="text"
                        value={editDraft.answer}
                        onChange={(e) => setEditDraft({ ...editDraft, answer: e.target.value })}
                        className="rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-xs text-amber-100 outline-none focus:border-cyan-400"
                      />
                      <input
                        type="text"
                        value={editDraft.hostNote}
                        onChange={(e) => setEditDraft({ ...editDraft, hostNote: e.target.value })}
                        className="rounded-lg border border-white/15 bg-studio-950 px-3 py-2 text-xs text-violet-200 outline-none focus:border-cyan-400"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft(null);
                        }}
                        className="flex items-center gap-1 rounded-lg border border-white/15 px-3 py-1.5 text-xs font-bold text-slate-300 hover:bg-white/10"
                      >
                        <X className="h-3.5 w-3.5" />
                        {t.common.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditQuestion(q.id)}
                        className="flex items-center gap-1 rounded-lg bg-cyan-400 px-3.5 py-1.5 text-xs font-extrabold text-studio-950"
                      >
                        <Check className="h-3.5 w-3.5" />
                        {t.common.save}
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={q.id}
                  className={`flex flex-col gap-3 rounded-2xl border p-4 transition sm:flex-row sm:items-center sm:justify-between ${
                    isSelected
                      ? 'border-cyan-400/60 bg-cyan-400/10'
                      : 'border-white/10 bg-studio-950/60 hover:border-white/20'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-500">#{index + 1}</span>
                      <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[11px] font-bold text-cyan-300">
                        {q.category}
                      </span>
                      <span className="font-mono text-xs font-extrabold text-amber-300">
                        +{q.points} {t.common.pts}
                      </span>
                      {isSelected && (
                        <span className="inline-flex items-center gap-1 rounded bg-cyan-400/25 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-200 uppercase">
                          <Star className="h-3 w-3" /> {t.common.onStage}
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 text-sm font-semibold text-white">{q.prompt}</p>
                    {q.answer && (
                      <p className="mt-1 text-xs text-slate-400">
                        <span className="font-bold text-amber-300/90">
                          {t.rapidStage.display.answerReveal}:
                        </span>{' '}
                        {q.answer}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectQuestion(q.id)}
                      className={`rounded-xl px-3.5 py-2 text-xs font-extrabold transition ${
                        isSelected
                          ? 'border border-cyan-400/50 bg-cyan-400/20 text-cyan-100'
                          : 'bg-white/10 text-white hover:bg-cyan-400 hover:text-studio-950'
                      }`}
                    >
                      {isSelected ? t.common.onStage : t.rapidStage.loadOnStage}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditQuestion(q)}
                      className="rounded-xl border border-white/12 bg-white/5 p-2 text-slate-300 hover:border-cyan-400/40 hover:text-cyan-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-2 text-rose-300 hover:bg-rose-500/25"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
