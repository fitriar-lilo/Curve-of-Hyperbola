import React, { useState } from 'react';
import { Question, UserAnswerState } from '../types';
import { MathGraph } from './MathGraph';
import { Lightbulb, CheckCircle2, XCircle, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';
import { playCorrectSound, playIncorrectSound, playClickSound } from '../utils/audio';

interface QuestionCardProps {
  question: Question;
  userState?: UserAnswerState;
  onAnswer: (questionId: string, optionId: string, isCorrect: boolean) => void;
  onRevealHint: (questionId: string) => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  question,
  userState,
  onAnswer,
  onRevealHint,
}) => {
  const [lastSelectedOptionId, setLastSelectedOptionId] = useState<string | null>(null);
  const [justGotWrong, setJustGotWrong] = useState<boolean>(false);

  const isResolvedCorrect = userState?.isCorrect ?? false;
  const attempts = userState?.attempts ?? 0;
  const revealedHints = userState?.revealedHints ?? 0;

  const handleSelectOption = (optionId: string, isCorrect: boolean) => {
    if (isResolvedCorrect) return; // already solved

    setLastSelectedOptionId(optionId);

    if (isCorrect) {
      setJustGotWrong(false);
      playCorrectSound();
      onAnswer(question.id, optionId, true);
    } else {
      setJustGotWrong(true);
      playIncorrectSound();
      onAnswer(question.id, optionId, false);
    }
  };

  const handleHintClick = () => {
    playClickSound();
    onRevealHint(question.id);
  };

  return (
    <div className={`p-6 rounded-2xl bg-slate-900/90 border transition-all duration-300 shadow-xl ${
      isResolvedCorrect
        ? 'border-emerald-500/40 ring-1 ring-emerald-500/20'
        : 'border-slate-800 hover:border-slate-700'
    }`}>
      {/* Header Info */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-700/50">
            Question {question.number} of 15
          </span>
          <span className="text-xs font-semibold text-slate-400">
            {question.section === 'quadratic' ? 'Section 1: Warm-up' : 'Section 3: Assessment'}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {attempts > 0 && (
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-medium ${
              attempts >= 3
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                : 'bg-slate-800 text-slate-300'
            }`}>
              {attempts} {attempts === 1 ? 'attempt' : 'attempts'}
            </span>
          )}

          {isResolvedCorrect && (
            <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-700 font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              +1 Point
            </span>
          )}
        </div>
      </div>

      {/* Question Title & Prompt */}
      <div className="space-y-2 mb-5">
        <h3 className="text-base font-bold text-white leading-snug">
          {question.title}
        </h3>
        <p className="text-sm text-slate-300 leading-relaxed">
          {question.prompt}
        </p>

        {question.equationDisplay && !question.graphConfig && (
          <div className="inline-block mt-1 py-1.5 px-3.5 rounded-xl bg-slate-950/80 border border-indigo-500/30 font-mono text-base font-bold text-indigo-300">
            {question.equationDisplay}
          </div>
        )}
      </div>

      {/* Main Graph (if question displays a graph) */}
      {question.graphConfig && (
        <div className="mb-6 flex justify-center">
          <div className="max-w-[420px] w-full">
            <MathGraph
              config={question.graphConfig}
              width={380}
              height={320}
              interactive={false}
              className="w-full shadow-lg"
            />
          </div>
        </div>
      )}

      {/* Options Grid */}
      <div className={`grid gap-3 mb-5 ${
        question.options[0]?.graphConfig ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
      }`}>
        {question.options.map((option, idx) => {
          const letter = String.fromCharCode(65 + idx); // A, B, C, D
          const isSelected = userState?.selectedOptionId === option.id || lastSelectedOptionId === option.id;
          const isSelectedCorrect = isSelected && isResolvedCorrect;
          const isSelectedWrong = isSelected && !isResolvedCorrect && justGotWrong;

          return (
            <button
              key={option.id}
              onClick={() => handleSelectOption(option.id, option.isCorrect)}
              disabled={isResolvedCorrect}
              className={`relative text-left p-4 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                isSelectedCorrect
                  ? 'bg-emerald-950/60 border-emerald-500 text-white shadow-lg shadow-emerald-950/50 ring-2 ring-emerald-500/30'
                  : isSelectedWrong
                  ? 'bg-rose-950/50 border-rose-500 text-slate-200'
                  : 'bg-slate-950/50 border-slate-800 text-slate-200 hover:bg-slate-800/60 hover:border-indigo-500/40'
              } ${isResolvedCorrect && !option.isCorrect ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold font-mono transition-colors ${
                  isSelectedCorrect
                    ? 'bg-emerald-500 text-slate-950'
                    : isSelectedWrong
                    ? 'bg-rose-500 text-white'
                    : 'bg-slate-800 text-slate-300'
                }`}>
                  {letter}
                </span>

                {isSelectedCorrect && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                )}
                {isSelectedWrong && (
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
                    <XCircle className="w-4 h-4" /> Try again
                  </span>
                )}
              </div>

              {/* Text Label */}
              <div className="font-mono text-sm font-bold text-white mb-1">
                {option.label}
              </div>

              {option.subLabel && (
                <div className="text-xs text-slate-400 mb-2">
                  {option.subLabel}
                </div>
              )}

              {/* Graph inside option card (for Q4, Q5, Q9, Q10, Q11) */}
              {option.graphConfig && (
                <div className="mt-2 w-full flex justify-center">
                  <div className="w-full max-w-[240px]">
                    <MathGraph
                      config={option.graphConfig}
                      width={240}
                      height={200}
                      interactive={false}
                      className="w-full"
                    />
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback & Teacher Explanation when correct */}
      {isResolvedCorrect && (
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-sm space-y-2 mb-4 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 font-bold text-emerald-300">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Well Done!</span>
          </div>
          <p className="text-xs text-emerald-100/90 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}

      {/* Incorrect encouragement banner */}
      {justGotWrong && !isResolvedCorrect && (
        <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-xs text-rose-200 flex items-center justify-between mb-4">
          <span>Not quite! Check the signs and key features. You have unlimited retries!</span>
          <span className="text-amber-400 font-semibold cursor-pointer underline" onClick={handleHintClick}>
            Use a hint
          </span>
        </div>
      )}

      {/* Progressive Hints Section */}
      <div className="space-y-2 pt-2 border-t border-slate-800/60">
        <div className="flex items-center justify-between">
          <button
            onClick={handleHintClick}
            disabled={revealedHints >= question.hints.length || isResolvedCorrect}
            className={`text-xs font-semibold py-1.5 px-3 rounded-lg flex items-center gap-2 transition-all ${
              revealedHints >= question.hints.length || isResolvedCorrect
                ? 'opacity-40 text-slate-500 cursor-not-allowed'
                : 'text-amber-300 bg-amber-950/50 hover:bg-amber-900/60 border border-amber-800/60'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {revealedHints === 0
                ? 'Need a Hint? (Step-by-step)'
                : revealedHints < question.hints.length
                ? `Reveal Next Hint (${revealedHints + 1} of ${question.hints.length})`
                : 'All Hints Revealed'}
            </span>
          </button>

          {revealedHints > 0 && (
            <span className="text-[11px] text-amber-400/80 font-mono">
              {revealedHints}/{question.hints.length} hints active
            </span>
          )}
        </div>

        {/* Revealed Hints List */}
        {revealedHints > 0 && (
          <div className="space-y-1.5 mt-2">
            {question.hints.slice(0, revealedHints).map((hint, idx) => (
              <div
                key={`hint-${idx}`}
                className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-200/90 leading-relaxed flex items-start gap-2"
              >
                <span className="w-4 h-4 rounded-full bg-amber-500/30 text-amber-300 text-[10px] flex items-center justify-center shrink-0 font-bold mt-0.5">
                  {idx + 1}
                </span>
                <span>{hint}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
