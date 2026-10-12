import React, { useState, useEffect, useMemo } from 'react';
import { Question, UserAnswerState, AppProgress } from './types';
import { getQuestionsWithShuffledOptions } from './data/questions';
import { QuestionCard } from './components/QuestionCard';
import { HyperbolaVisualizer } from './components/HyperbolaVisualizer';
import { DiagnosticsReport } from './components/DiagnosticsReport';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  GraduationCap,
  Sparkles,
  BookOpen,
  Sliders,
  Award,
  Save,
  Check,
} from 'lucide-react';
import { setSoundMuted, playClickSound, playCorrectSound } from './utils/audio';

const STORAGE_KEY = 'igcse_0580_hyperbolas_state_v1';

export default function App() {
  const [questions, setQuestions] = useState<Question[]>(() => getQuestionsWithShuffledOptions());
  const [studentName, setStudentName] = useState<string>('Alex Chen');
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [answers, setAnswers] = useState<Record<string, UserAnswerState>>({});
  const [reflection, setReflection] = useState<string>('');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);
  const [justSaved, setJustSaved] = useState<boolean>(false);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: AppProgress = JSON.parse(saved);
        if (parsed.studentName) setStudentName(parsed.studentName);
        if (parsed.currentSection) setCurrentSection(parsed.currentSection);
        if (parsed.answers) setAnswers(parsed.answers);
        if (parsed.reflection) setReflection(parsed.reflection);
        if (typeof parsed.isSoundMuted === 'boolean') {
          setIsMuted(parsed.isSoundMuted);
          setSoundMuted(parsed.isSoundMuted);
        }
      }
    } catch {
      // In-memory fallback if localStorage blocked or unavailable
    }
    setHasLoaded(true);
  }, []);

  // Compute total score (1 point per unique question solved correctly)
  const score = useMemo(() => {
    return Object.values(answers).filter((a) => a.isCorrect).length;
  }, [answers]);

  // Save progress to localStorage whenever relevant state changes
  useEffect(() => {
    if (!hasLoaded) return;
    try {
      const progressData: AppProgress = {
        studentName,
        currentSection,
        answers,
        score,
        reflection,
        startedAt: new Date().toISOString(),
        isSoundMuted: isMuted,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    } catch {
      // In-memory fallback
    }
  }, [hasLoaded, studentName, currentSection, answers, score, reflection, isMuted]);

  const handleMuteToggle = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    setSoundMuted(nextMuted);
  };

  const handleAnswer = (questionId: string, optionId: string, isCorrect: boolean) => {
    setAnswers((prev) => {
      const current = prev[questionId] || {
        selectedOptionId: null,
        isCorrect: false,
        attempts: 0,
        revealedHints: 0,
      };

      return {
        ...prev,
        [questionId]: {
          ...current,
          selectedOptionId: optionId,
          attempts: current.attempts + 1,
          isCorrect: isCorrect || current.isCorrect,
        },
      };
    });
  };

  const handleRevealHint = (questionId: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || {
        selectedOptionId: null,
        isCorrect: false,
        attempts: 0,
        revealedHints: 0,
      };

      return {
        ...prev,
        [questionId]: {
          ...current,
          revealedHints: current.revealedHints + 1,
        },
      };
    });
  };

  const handleReset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setAnswers({});
    setReflection('');
    setCurrentSection(1);
    setQuestions(getQuestionsWithShuffledOptions());
    playClickSound();
  };

  const handleExplicitSave = () => {
    try {
      const progressData: AppProgress = {
        studentName,
        currentSection,
        answers,
        score,
        reflection,
        startedAt: new Date().toISOString(),
        isSoundMuted: isMuted,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
    } catch {
      // ignore
    }
    playClickSound();
    playCorrectSound();
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2500);
  };

  // Section 1 questions (Warm-up Quadratics)
  const section1Questions = useMemo(() => {
    return questions.filter((q) => q.section === 'quadratic');
  }, [questions]);

  // Section 3 questions (Hyperbola Assessment)
  const section3Questions = useMemo(() => {
    return questions.filter((q) => q.section === 'hyperbola');
  }, [questions]);

  // Check completion of sections
  const isSection1Complete = section1Questions.every((q) => answers[q.id]?.isCorrect);
  const isSection3Complete = section3Questions.every((q) => answers[q.id]?.isCorrect);

  const section1CorrectCount = section1Questions.filter((q) => answers[q.id]?.isCorrect).length;
  const section3CorrectCount = section3Questions.filter((q) => answers[q.id]?.isCorrect).length;

  return (
    <div className="min-h-screen bg-[#0b0c16] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* GLOBAL TOP NAVIGATION HEADER (Hidden in print) */}
      <header className="no-print sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
          {/* Logo / Branding */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-violet-600 to-amber-400 p-0.5 shadow-lg shadow-indigo-600/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="text-xs uppercase font-extrabold tracking-wider bg-gradient-to-r from-indigo-400 to-violet-300 bg-clip-text text-transparent">
                Cambridge IGCSE 0580
              </div>
              <h1 className="text-sm font-bold text-white">
                Curved Graphs: Hyperbolas & Quadratics
              </h1>
            </div>
          </div>

          {/* Controls: Student Name, Sound Toggle, Reset, Score */}
          <div className="flex items-center gap-3">
            {/* Student Name Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-slate-400">Student:</span>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter name"
                className="bg-transparent text-slate-100 font-semibold focus:outline-none w-28 text-xs border-b border-transparent focus:border-indigo-400"
              />
            </div>

            {/* Score Pill */}
            <div className="flex items-center gap-1.5 bg-indigo-950/70 border border-indigo-700/50 px-3 py-1.5 rounded-xl text-xs font-mono">
              <span className="text-indigo-300 font-medium">Score:</span>
              <strong className="text-white text-sm font-bold">{score}</strong>
              <span className="text-slate-400">/ 15</span>
            </div>

            {/* Tombol Save (Header) */}
            <button
              onClick={handleExplicitSave}
              title="Save progress (Simpan progres)"
              className={`py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                justSaved
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/30 ring-1 ring-emerald-400'
                  : 'bg-slate-900 hover:bg-slate-800 text-emerald-400 border-slate-800 hover:border-emerald-600/50'
              }`}
            >
              {justSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5 text-emerald-400" />}
              <span>{justSaved ? 'Saved! ✓' : 'Save'}</span>
            </button>

            {/* Mute Toggle */}
            <button
              onClick={handleMuteToggle}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            </button>

            {/* Reset Button */}
            <button
              onClick={() => {
                if (window.confirm('Restart activity from the beginning?')) {
                  handleReset();
                }
              }}
              title="Start Over"
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-300 hover:border-rose-900/50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECTION STEPPER PROGRESS BAR */}
        <div className="max-w-6xl mx-auto px-4 pb-2">
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[
              { num: 1, label: '1. Warm-up (Quadratics)', stat: `${section1CorrectCount}/5` },
              { num: 2, label: '2. Concept & Visualizer', stat: 'Explore' },
              { num: 3, label: '3. Hyperbola Assessment', stat: `${section3CorrectCount}/10` },
              { num: 4, label: '4. Diagnostics & Report', stat: 'Portfolio' },
            ].map((sec) => {
              const isActive = currentSection === sec.num;
              const isPast = currentSection > sec.num;

              return (
                <button
                  key={`sec-${sec.num}`}
                  onClick={() => {
                    setCurrentSection(sec.num);
                    playClickSound();
                  }}
                  className={`text-left py-2 px-3 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border-indigo-500 text-white shadow-md shadow-indigo-900/30 ring-1 ring-indigo-500/30'
                      : isPast
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold truncate text-[11px] sm:text-xs">
                      {sec.label}
                    </span>
                    <span className="font-mono text-[10px] text-indigo-400 ml-1 hidden sm:inline">
                      {sec.stat}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* MAIN CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">
        {/* ========================================================= */}
        {/* SECTION 1: WARM-UP (QUADRATIC REVIEW) */}
        {/* ========================================================= */}
        {currentSection === 1 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Section Overview Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900 to-violet-950/70 border border-indigo-500/30 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <BookOpen className="w-4 h-4" />
                <span>Section 1 • Warm-up Review</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                Parabolas: Reviewing Quadratic Graphs (y = ax² + bx + c)
              </h2>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                Before tackling hyperbolas, let us review quadratic curves. Remember:
                a positive <span className="font-mono text-indigo-300 font-bold">+x²</span> produces a <span className="text-emerald-300 font-semibold">U-shape (minimum)</span>, while a negative <span className="font-mono text-rose-300 font-bold">-x²</span> produces an <span className="text-rose-300 font-semibold">inverted n-shape (maximum)</span>. The constant <span className="font-mono text-amber-300 font-bold">c</span> is the y-intercept!
              </p>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-indigo-900/40 text-xs">
                <span className="text-slate-400">
                  Answer all 5 questions below. You earn +1 point for each correct answer!
                </span>
                <span className="font-mono font-bold text-indigo-300">
                  {section1CorrectCount} of 5 Completed
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
              {section1Questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  userState={answers[q.id]}
                  onAnswer={handleAnswer}
                  onRevealHint={handleRevealHint}
                />
              ))}
            </div>

            {/* Section Footer Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <div className="text-xs text-slate-300">
                {isSection1Complete ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> All 5 warm-up questions completed! Ready for Section 2.
                  </span>
                ) : (
                  <span>
                    Answer all 5 questions to prepare for the hyperbola explainer. (You can also continue anytime.)
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleExplicitSave}
                  className="py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Save Progress</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentSection(2);
                    playClickSound();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>Continue to Section 2</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 2: CONCEPT EXPLANATION & INTERACTIVE VISUALIZER */}
        {/* ========================================================= */}
        {currentSection === 2 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Overview Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-violet-950/80 border border-indigo-500/30 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Sliders className="w-4 h-4" />
                <span>Section 2 • Concept & Visualizer</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                Understanding the Hyperbola: y = a/x + b
              </h2>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                A hyperbola has <strong>two separate curved branches</strong> that hug invisible boundary lines called <strong>asymptotes</strong>. Explore how changing the numerator <span className="font-mono text-indigo-300 font-bold">a</span> and the constant <span className="font-mono text-sky-300 font-bold">b</span> shapes and shifts the graph.
              </p>
            </div>

            {/* Interactive Visualizer & Examples */}
            <HyperbolaVisualizer />

            {/* Navigation to Section 3 */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                onClick={() => {
                  setCurrentSection(1);
                  playClickSound();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Back to Warm-up</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSection(3);
                  playClickSound();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                <span>Ready for Section 3: Assessment (10 MCQs)</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 3: ASSESSMENT (10 MCQS) */}
        {/* ========================================================= */}
        {currentSection === 3 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Overview Banner */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-violet-950/80 border border-indigo-500/30 shadow-xl">
              <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" />
                <span>Section 3 • Mastery Assessment</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white mb-2">
                Hyperbola Mastery Assessment (10 Questions)
              </h2>
              <p className="text-sm text-slate-300 max-w-3xl leading-relaxed">
                Test your skills across all 4 key Cambridge IGCSE competencies: matching graphs to equations, matching equations to graphs, identifying horizontal asymptotes (<span className="font-mono text-sky-300">y = b</span>), and determining quadrant placement from the sign of <span className="font-mono text-indigo-300">a</span>.
              </p>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-indigo-900/40 text-xs">
                <span className="text-slate-400">
                  Every correct question earns +1 point. Use step-by-step hints if needed!
                </span>
                <span className="font-mono font-bold text-indigo-300">
                  {section3CorrectCount} of 10 Solved
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-8">
              {section3Questions.map((q) => (
                <QuestionCard
                  key={q.id}
                  question={q}
                  userState={answers[q.id]}
                  onAnswer={handleAnswer}
                  onRevealHint={handleRevealHint}
                />
              ))}
            </div>

            {/* Section Footer Navigation */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-slate-900/90 border border-slate-800">
              <button
                onClick={() => {
                  setCurrentSection(2);
                  playClickSound();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="w-full sm:w-auto py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Review Section 2 Explainer</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={handleExplicitSave}
                  className="py-2.5 px-4 rounded-xl border border-slate-700 hover:border-slate-600 bg-slate-800 text-xs font-semibold text-slate-200 hover:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Save className="w-4 h-4 text-emerald-400" />
                  <span>Save Progress</span>
                </button>

                <button
                  onClick={() => {
                    setCurrentSection(4);
                    playClickSound();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="flex-1 sm:flex-none py-3 px-6 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                >
                  <span>View Diagnostics & PDF Export</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* SECTION 4: DIAGNOSTICS & PDF EXPORT */}
        {/* ========================================================= */}
        {currentSection === 4 && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <DiagnosticsReport
              studentName={studentName}
              score={score}
              answers={answers}
              questions={questions}
              reflection={reflection}
              onReflectionChange={setReflection}
              onReset={handleReset}
              onSave={handleExplicitSave}
            />

            <div className="no-print flex items-center justify-between p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
              <button
                onClick={() => {
                  setCurrentSection(3);
                  playClickSound();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-4 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Return to Assessment Questions</span>
              </button>

              <button
                onClick={() => {
                  setCurrentSection(1);
                  playClickSound();
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="py-2.5 px-4 rounded-xl bg-slate-800 text-indigo-300 hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>Review from Section 1</span>
              </button>
            </div>
          </div>
        )}

        {/* Global Floating Save Notification Toast */}
        {justSaved && (
          <div className="no-print fixed bottom-6 right-6 z-50 p-4 rounded-2xl bg-emerald-950/95 border border-emerald-500 text-white text-xs font-bold flex items-center gap-2.5 shadow-2xl shadow-emerald-950/80 animate-in fade-in slide-in-from-bottom duration-300">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Progress Saved Successfully! (Data progres tersimpan)</span>
          </div>
        )}
      </main>

      {/* FOOTER (Hidden in print) */}
      <footer className="no-print mt-auto border-t border-slate-800/80 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Cambridge IGCSE Mathematics (0580) • Interactive Learning Module</span>
          <span>Self-contained digital resource • Pure SVG Graphics & Web Audio</span>
        </div>
      </footer>
    </div>
  );
}
