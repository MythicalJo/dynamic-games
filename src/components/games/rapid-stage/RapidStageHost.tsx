import React, { useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';
import { useShow } from '../../../context/ShowContext';
import type { GameHostProps } from '../../../modules/registry';
import { TEAM_ACCENTS, type PreparedQuestion } from '../../../types/show';
import { RulesToggleButton } from '../../host/RulesToggleButton';

export function RapidStageHost({ mode }: GameHostProps) {
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

  const [category, setCategory] = useState('TELEPATÍA');
  const [points, setPoints] = useState('25');
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
      points: Number(points) || 20,
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
      points: Number(editDraft.points) || 20,
      prompt: editDraft.prompt.trim(),
      answer: editDraft.answer.trim(),
      hostNote: editDraft.hostNote.trim() || undefined,
    });
    setEditingId(null);
    setEditDraft(null);
  };

  const selectQuestion = (id: string) => {
    updateStageState({
      selectedQuestionId: id,
      answerRevealed: false,
      promptVisible: true,
    });
  };

  const currentIdx = questions.findIndex((q) => q.id === stageState.selectedQuestionId);
  const stepQuestion = (dir: -1 | 1) => {
    if (questions.length === 0) return;
    const next = questions[((currentIdx >= 0 ? currentIdx : 0) + dir + questions.length) % questions.length];
    if (next) selectQuestion(next.id);
  };

  /* ===================================================================== */
  /* SETUP MODE: Question Bank                                             */
  /* ===================================================================== */
  if (mode === 'setup') {
    return (
      <section className="rounded-2xl border border-line bg-surface p-6">
        <div className="mb-5">
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight text-ink">
            <Sparkles className="h-5 w-5 shrink-0 text-accent" />
            <span>{t.rapidStage.bankTitle(questions.length)}</span>
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">{t.rapidStage.bankDesc}</p>
        </div>

        <form onSubmit={handleAddQuestion} className="mb-5 space-y-3 rounded-xl border border-line bg-canvas p-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                {t.rapidStage.category}
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-muted">
                {t.rapidStage.pointValue}
              </label>
              <input
                type="number"
                required
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface px-3 py-2 font-mono text-sm font-bold text-ink outline-none focus:border-accent"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-semibold text-ink-muted">
              {t.rapidStage.questionPrompt}
            </label>
            <textarea
              rows={2}
              required
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <input
              type="text"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder={t.rapidStage.answerRevealText}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
            <input
              type="text"
              value={hostNote}
              onChange={(e) => setHostNote(e.target.value)}
              placeholder={t.rapidStage.privateNoteInput}
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-5 py-2 text-xs font-bold text-accent-fg"
            >
              <Plus className="h-4 w-4" />
              {t.rapidStage.saveAndLoad}
            </button>
          </div>
        </form>

        {questions.length === 0 ? (
          <div className="rounded-xl border border-dashed border-line-strong py-10 text-center text-xs text-ink-muted">
            {t.rapidStage.emptyBank}
          </div>
        ) : (
          <div className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-canvas">
            {questions.map((q, idx) => {
              const isSelected = q.id === stageState.selectedQuestionId;
              const isEditing = editingId === q.id && editDraft !== null;

              if (isEditing && editDraft) {
                return (
                  <div key={q.id} className="space-y-2.5 bg-surface p-4">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                      <input
                        type="text"
                        value={editDraft.category}
                        onChange={(e) => setEditDraft({ ...editDraft, category: e.target.value })}
                        className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-bold text-ink sm:col-span-2"
                      />
                      <input
                        type="number"
                        value={editDraft.points}
                        onChange={(e) => setEditDraft({ ...editDraft, points: e.target.value })}
                        className="rounded-lg border border-line bg-canvas px-3 py-1.5 font-mono text-xs font-bold text-ink"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={editDraft.prompt}
                      onChange={(e) => setEditDraft({ ...editDraft, prompt: e.target.value })}
                      className="w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink"
                    />
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <input
                        type="text"
                        value={editDraft.answer}
                        onChange={(e) => setEditDraft({ ...editDraft, answer: e.target.value })}
                        className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-ink"
                      />
                      <input
                        type="text"
                        value={editDraft.hostNote}
                        onChange={(e) => setEditDraft({ ...editDraft, hostNote: e.target.value })}
                        className="rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs text-ink"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null);
                          setEditDraft(null);
                        }}
                        className="rounded-lg border border-line p-2 text-ink-muted"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => saveEditQuestion(q.id)}
                        className="rounded-lg bg-accent p-2 text-accent-fg"
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              }

              return (
                <div key={q.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-ink-subtle">#{idx + 1}</span>
                      <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-[10px] font-bold text-ink-muted">
                        {q.category}
                      </span>
                      <span className="font-mono text-xs font-bold text-accent">
                        +{q.points} {t.common.pts}
                      </span>
                    </div>
                    <p className="mt-1 text-sm font-medium text-ink">{q.prompt}</p>
                    {q.answer && (
                      <p className="mt-0.5 text-xs text-ink-muted">
                        {t.rapidStage.display.answerReveal}: {q.answer}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => selectQuestion(q.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold ${
                        isSelected
                          ? 'bg-ink text-canvas'
                          : 'border border-line bg-surface text-ink hover:border-line-strong'
                      }`}
                    >
                      {isSelected ? t.common.onStage : t.rapidStage.loadOnStage}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEditQuestion(q)}
                      className="rounded-lg border border-line p-1.5 text-ink-muted hover:text-ink"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteQuestion(q.id)}
                      className="rounded-lg border border-line p-1.5 text-ink-subtle hover:border-err/40 hover:bg-err-soft hover:text-err"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    );
  }

  /* ===================================================================== */
  /* LIVE MODE: Streamlined Prompt Controls                                */
  /* ===================================================================== */
  return (
    <section className="space-y-4 rounded-2xl border border-line bg-surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-ink">
          <Sparkles className="h-5 w-5 shrink-0 text-accent" />
          <span>{t.rapidStage.controllerTitle}</span>
        </h2>

        <div className="flex flex-wrap items-center gap-2">
          <RulesToggleButton moduleId="rapid-stage" />
          <button
            type="button"
            onClick={() => updateStageState({ promptVisible: !stageState.promptVisible })}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold ${
              stageState.promptVisible
                ? 'border-ink bg-ink text-canvas'
                : 'border-line bg-canvas text-ink-muted'
            }`}
          >
            {stageState.promptVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {stageState.promptVisible ? t.rapidStage.promptVisible : t.rapidStage.promptHidden}
          </button>

          <button
            type="button"
            disabled={!selectedQuestion}
            onClick={() => updateStageState({ answerRevealed: !stageState.answerRevealed })}
            className={`rounded-xl border px-4 py-2 text-xs font-bold transition disabled:opacity-40 ${
              stageState.answerRevealed
                ? 'border-accent bg-accent text-accent-fg'
                : 'border-line bg-canvas text-ink hover:border-line-strong'
            }`}
          >
            {stageState.answerRevealed ? t.rapidStage.hideAnswer : t.rapidStage.revealAnswer}
          </button>
        </div>
      </div>

      {/* Question Selector + Meta Row */}
      <div className="grid w-full max-w-full grid-cols-1 gap-3 md:grid-cols-12">
        <div className="flex min-w-0 items-center gap-1.5 md:col-span-6">
          <button
            type="button"
            onClick={() => stepQuestion(-1)}
            className="shrink-0 rounded-xl border border-line bg-canvas p-2.5 text-ink-muted hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <select
            value={stageState.selectedQuestionId ?? ''}
            onChange={(e) => selectQuestion(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent"
          >
            {questions.map((q, idx) => (
              <option key={q.id} value={q.id}>
                #{idx + 1} [{q.category}] {q.prompt.slice(0, 60)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => stepQuestion(1)}
            className="shrink-0 rounded-xl border border-line bg-canvas p-2.5 text-ink-muted hover:text-ink"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="md:col-span-4">
          <select
            value={stageState.spotlightTeamId ?? ''}
            onChange={(e) =>
              updateStageState({ spotlightTeamId: e.target.value ? e.target.value : null })
            }
            className="w-full rounded-xl border border-line bg-canvas px-3 py-2 text-xs font-semibold text-ink outline-none focus:border-accent"
          >
            <option value="">{t.rapidStage.noneAllPairs}</option>
            {teams.map((teamItem) => (
              <option key={teamItem.id} value={teamItem.id}>
                {teamItem.name} ({teamItem.playerA} y {teamItem.playerB})
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="flex h-full cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-line bg-canvas px-2.5 py-2 text-[11px] font-semibold text-ink-muted">
            <input
              type="checkbox"
              checked={stageState.showBottomScores}
              onChange={(e) => updateStageState({ showBottomScores: e.target.checked })}
              className="h-3.5 w-3.5 accent-accent"
            />
            <span>Puntajes</span>
          </label>
        </div>
      </div>

      {selectedQuestion ? (
        <div className="rounded-xl border border-line bg-canvas p-4">
          <div className="flex items-center justify-between gap-2 font-mono text-xs font-bold">
            <span className="text-accent">
              {selectedQuestion.category} · +{selectedQuestion.points} {t.common.pts}
            </span>
            <span className="text-ink-subtle">
              {stageState.answerRevealed ? t.rapidStage.answerVisible : t.rapidStage.answerHidden}
            </span>
          </div>

          <p className="mt-2 text-base font-bold text-ink">{selectedQuestion.prompt}</p>

          <div className="mt-3 rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm text-ink">
            <span className="font-semibold text-ink-muted">
              {t.rapidStage.display.answerReveal}:{' '}
            </span>
            {selectedQuestion.answer || '—'}
          </div>

          {selectedQuestion.hostNote && (
            <p className="mt-2 text-xs text-ink-muted">
              <strong>{t.rapidStage.privateHostNote}</strong> {selectedQuestion.hostNote}
            </p>
          )}

          {teams.length > 0 && (
            <div className="mt-4 border-t border-line pt-3">
              <div className="mb-2 text-xs font-semibold text-ink-muted">
                {t.rapidStage.quickAward(selectedQuestion.points)}
              </div>
              <div className="flex flex-wrap gap-2">
                {teams.map((team) => (
                  <button
                    key={team.id}
                    type="button"
                    onClick={() => adjustTeamScore(team.id, selectedQuestion.points)}
                    className="inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-bold text-ink transition hover:border-accent active:scale-95"
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: TEAM_ACCENTS[team.accent].hex }}
                    />
                    <span>{team.name}</span>
                    <span className="font-mono text-accent">+{selectedQuestion.points}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-line-strong py-8 text-center text-xs text-ink-muted">
          {t.rapidStage.selectOrAddPrompt}
        </div>
      )}
    </section>
  );
}
