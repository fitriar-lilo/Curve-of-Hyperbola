import React, { useState } from 'react';
import { Question, UserAnswerState } from '../types';
import { Award, Printer, CheckCircle2, AlertTriangle, BookOpen, Sparkles, MessageSquareQuote, Download, Save, FileText, Check } from 'lucide-react';
import { playClickSound, playCorrectSound } from '../utils/audio';
import { downloadPdfReport, downloadHtmlReport } from '../utils/reportExporter';
import { MathView } from './MathView';

interface DiagnosticsReportProps {
  studentName: string;
  score: number;
  answers: Record<string, UserAnswerState>;
  questions: Question[];
  reflection: string;
  onReflectionChange: (val: string) => void;
  onReset: () => void;
  onSave?: () => void;
}

export const DiagnosticsReport: React.FC<DiagnosticsReportProps> = ({
  studentName,
  score,
  answers,
  questions,
  reflection,
  onReflectionChange,
  onReset,
  onSave,
}) => {
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // Score breakdown
  const quadScore = questions
    .filter((q) => q.section === 'quadratic')
    .filter((q) => answers[q.id]?.isCorrect).length;

  const hypScore = questions
    .filter((q) => q.section === 'hyperbola')
    .filter((q) => answers[q.id]?.isCorrect).length;

  const totalAttempts = Object.values(answers).reduce((acc, curr) => acc + (curr.attempts || 0), 0);
  const answeredCount = Object.values(answers).filter((a) => a.attempts > 0).length;
  const avgAttempts = answeredCount > 0 ? (totalAttempts / answeredCount).toFixed(1) : '1.0';

  // Mastery classification logic
  let masteryLevel: 'master' | 'track' | 'practice' = 'practice';
  let badgeTitle = 'Needs Practice';
  let badgeColor = 'bg-amber-950/80 text-amber-300 border-amber-700';
  let description = 'Review the core rules of hyperbolas and try the interactive sliders again.';

  if (score >= 13 && parseFloat(avgAttempts) <= 1.6) {
    masteryLevel = 'master';
    badgeTitle = 'Hyperbola Master 🏆';
    badgeColor = 'bg-emerald-950/80 text-emerald-300 border-emerald-500 shadow-emerald-900/30';
    description = 'Outstanding mastery of Cambridge IGCSE 0580 curved graphs! You accurately identified equations, asymptotes, and branch locations with great confidence.';
  } else if (score >= 9) {
    masteryLevel = 'track';
    badgeTitle = 'On the Right Track 🚀';
    badgeColor = 'bg-indigo-950/80 text-indigo-300 border-indigo-500';
    description = 'Good understanding of the general shapes and shifts! A few tricky signs or asymptotes needed retries.';
  } else {
    masteryLevel = 'practice';
    badgeTitle = 'Needs More Practice 📚';
    badgeColor = 'bg-rose-950/80 text-rose-300 border-rose-600';
    description = 'Keep working at it! Spend a few more minutes playing with the sliders in Section 2 to see how changing a and b shifts the branches.';
  }

  // Generate personalized review recommendations based on questions with attempts >= 2 or incorrect
  const recommendations: string[] = [];
  const struggledQuad = questions.some(
    (q) => q.section === 'quadratic' && (!answers[q.id]?.isCorrect || (answers[q.id]?.attempts || 0) >= 2)
  );
  if (struggledQuad) {
    recommendations.push('Review Quadratic Curves: remember U-shape is $+x^2$ (minimum) and n-shape is $-x^2$ (maximum). The constant $c$ gives the y-intercept.');
  }

  const struggledAsymptotes = ['hyp-12', 'hyp-13'].some(
    (id) => !answers[id]?.isCorrect || (answers[id]?.attempts || 0) >= 2
  );
  if (struggledAsymptotes) {
    recommendations.push('Review Horizontal Asymptotes: in $y = \\frac{a}{x} + b$, as $x \\to \\infty$, $\\frac{a}{x} \\to 0$. Therefore, the horizontal asymptote line is always $y = b$.');
  }

  const struggledQuadrants = ['hyp-14', 'hyp-15', 'hyp-7', 'hyp-10'].some(
    (id) => !answers[id]?.isCorrect || (answers[id]?.attempts || 0) >= 2
  );
  if (struggledQuadrants) {
    recommendations.push('Review Sign of "$a$": When $a > 0$, branches sit in Quadrants 1 & 3. When $a < 0$, branches sit in Quadrants 2 & 4 relative to asymptotes.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Excellent precision across all concepts! You are fully prepared for curved graph questions in IGCSE Paper 2 and Paper 4.');
  }

  const handleDownloadPdf = () => {
    try {
      playClickSound();
      downloadPdfReport({
        studentName,
        score,
        answers,
        questions,
        reflection,
      });
      playCorrectSound();
      setDownloadSuccessMessage('PDF Report downloaded successfully to your computer!');
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err) {
      console.error(err);
      // Fallback to HTML download if PDF generation encounters any issue
      downloadHtmlReport({
        studentName,
        score,
        answers,
        questions,
        reflection,
      });
      setDownloadSuccessMessage('Report downloaded successfully!');
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    }
  };

  const handleDownloadHtml = () => {
    playClickSound();
    downloadHtmlReport({
      studentName,
      score,
      answers,
      questions,
      reflection,
    });
    playCorrectSound();
    setDownloadSuccessMessage('Interactive HTML Report downloaded successfully!');
    setTimeout(() => setDownloadSuccessMessage(null), 4000);
  };

  const handleManualSave = () => {
    playClickSound();
    if (onSave) {
      onSave();
    }
    playCorrectSound();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handlePrint = () => {
    playClickSound();
    try {
      window.print();
    } catch {
      // If window.print() is blocked by iframe, download PDF directly
      handleDownloadPdf();
    }
  };

  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Toast Alert for Download or Save */}
      {downloadSuccessMessage && (
        <div className="no-print p-4 rounded-2xl bg-emerald-950/90 border border-emerald-500/80 text-emerald-200 text-sm font-semibold flex items-center justify-between shadow-xl animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{downloadSuccessMessage}</span>
          </div>
          <button
            onClick={() => setDownloadSuccessMessage(null)}
            className="text-xs text-emerald-300 hover:text-white underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {isSaved && (
        <div className="no-print p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/80 text-indigo-200 text-sm font-semibold flex items-center gap-2 shadow-xl animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-indigo-400 shrink-0" />
          <span>Progress & Answers saved successfully! (Data tersimpan dengan aman)</span>
        </div>
      )}

      {/* Printable Report Wrapper */}
      <div className="print-page p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8">
        {/* Header (Formatted for print and screen) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="text-xs uppercase font-bold tracking-widest text-indigo-400 mb-1">
              Cambridge IGCSE Mathematics 0580 • Curriculum Report
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Curved Graphs Mastery Portfolio
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
              <span>Student: <strong className="text-slate-200">{studentName || 'Student'}</strong></span>
              <span>•</span>
              <span>Date: {currentDate}</span>
              <span>•</span>
              <span>Syllabus: Cambridge 0580</span>
            </div>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2.5">
            {/* Tombol Save (Save Button) */}
            <button
              onClick={handleManualSave}
              className={`py-2.5 px-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
                isSaved
                  ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-600/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700 hover:border-slate-600'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4 text-white" /> : <Save className="w-4 h-4 text-emerald-400" />}
              <span>{isSaved ? 'Saved! ✓' : 'Save Progress (Simpan)'}</span>
            </button>

            {/* Direct Download PDF Button */}
            <button
              onClick={handleDownloadPdf}
              className="py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 text-white" />
              <span>Download PDF Report</span>
            </button>

            {/* Download HTML Button */}
            <button
              onClick={handleDownloadHtml}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Download standalone HTML certificate"
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>HTML</span>
            </button>

            {/* Print Button */}
            <button
              onClick={handlePrint}
              className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Open browser print dialog"
            >
              <Printer className="w-3.5 h-3.5 text-slate-400" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Score & Mastery Level Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Total Score */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Overall Score
            </div>
            <div className="text-4xl font-extrabold text-white font-mono flex items-baseline gap-1">
              <span>{score}</span>
              <span className="text-xl text-slate-500">/ 15</span>
            </div>
            <div className="text-xs text-emerald-400 mt-2 font-semibold">
              {Math.round((score / 15) * 100)}% Accuracy
            </div>
          </div>

          {/* Section Breakdown */}
          <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Section Breakdown
            </div>
            <div className="text-xs space-y-1">
              <div className="flex justify-between text-slate-300">
                <span>Warm-up (Quadratics):</span>
                <strong className="font-mono text-indigo-400">{quadScore} / 5</strong>
              </div>
              <div className="flex justify-between text-slate-300">
                <span>Assessment (Hyperbolas):</span>
                <strong className="font-mono text-sky-400">{hypScore} / 10</strong>
              </div>
              <div className="flex justify-between text-slate-300 pt-1 border-t border-slate-800">
                <span>Avg. Attempts per Q:</span>
                <strong className="font-mono text-amber-400">{avgAttempts}</strong>
              </div>
            </div>
          </div>

          {/* Mastery Classification */}
          <div className={`p-5 rounded-2xl border ${badgeColor} flex flex-col justify-between`}>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider mb-1 opacity-90">
                Mastery Classification
              </div>
              <div className="text-lg font-extrabold flex items-center gap-1.5">
                <Award className="w-5 h-5 shrink-0" />
                <span>{badgeTitle}</span>
              </div>
            </div>
            <p className="text-[11px] mt-2 opacity-90 leading-tight">
              {description}
            </p>
          </div>
        </div>

        {/* Personalized Recommendations */}
        <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
            <BookOpen className="w-4 h-4" />
            <span>Teacher Recommendations & Diagnostic Next Steps</span>
          </div>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {recommendations.map((rec, i) => (
              <li key={`rec-${i}`} className="flex items-start gap-2">
                <span className="text-indigo-400 font-bold shrink-0 mt-0.5">•</span>
                <div>
                  <MathView>{rec}</MathView>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Attempts Log Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Itemized Question Log & Attempt Tracking
            </h4>
            <span className="text-xs text-amber-400 font-medium">
              * Questions with 3+ attempts highlighted
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-800/80 text-slate-300 font-semibold border-b border-slate-700">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Question Title</th>
                  <th className="py-2.5 px-3">Concept</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-center">Attempts</th>
                  <th className="py-2.5 px-3 text-center">Hints Used</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {questions.map((q) => {
                  const state = answers[q.id];
                  const attemptsCount = state?.attempts ?? 0;
                  const isCorrect = state?.isCorrect ?? false;
                  const hintsCount = state?.revealedHints ?? 0;
                  const isHighAttempts = attemptsCount >= 3;

                  let concept = 'Quadratic Parabolas';
                  if (q.id === 'hyp-6' || q.id === 'hyp-7' || q.id === 'hyp-8') concept = 'Graph to Equation';
                  if (q.id === 'hyp-9' || q.id === 'hyp-10' || q.id === 'hyp-11') concept = 'Equation to Graph';
                  if (q.id === 'hyp-12' || q.id === 'hyp-13') concept = 'Horizontal Asymptote (y = b)';
                  if (q.id === 'hyp-14' || q.id === 'hyp-15') concept = 'Sign of a & Quadrants';

                  return (
                    <tr
                      key={q.id}
                      className={
                        isHighAttempts
                          ? 'bg-amber-950/30 text-amber-200'
                          : 'hover:bg-slate-800/40 text-slate-300'
                      }
                    >
                      <td className="py-2 px-3 font-mono font-bold text-slate-400">
                        {q.number}
                      </td>
                      <td className="py-2 px-3 font-medium text-slate-200">
                        <MathView>{q.title}</MathView>
                      </td>
                      <td className="py-2 px-3 text-slate-400">
                        {concept}
                      </td>
                      <td className="py-2 px-3">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Solved
                          </span>
                        ) : attemptsCount > 0 ? (
                          <span className="text-amber-400 font-semibold">In Progress</span>
                        ) : (
                          <span className="text-slate-500">Unanswered</span>
                        )}
                      </td>
                      <td className="py-2 px-3 text-center font-mono">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-xs ${
                            isHighAttempts
                              ? 'bg-amber-500/20 text-amber-300 font-bold border border-amber-600/40'
                              : 'text-slate-300'
                          }`}
                        >
                          {attemptsCount}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center font-mono text-slate-400">
                        {hintsCount}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Learning Reflection */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MessageSquareQuote className="w-4 h-4 text-violet-400" />
            <label htmlFor="reflection-text" className="text-sm font-bold text-slate-200">
              Student Learning Reflection
            </label>
          </div>
          <p className="text-xs text-slate-400">
            Write 1–2 sentences about what you learned today. (For example: How do you know which quadrants a hyperbola will be in? What does the horizontal asymptote tell you?)
          </p>
          <textarea
            id="reflection-text"
            rows={3}
            value={reflection}
            onChange={(e) => onReflectionChange(e.target.value)}
            placeholder="e.g., I learned that when a is positive, the branches are in Quadrants 1 and 3. The constant b tells me where the horizontal asymptote y = b is..."
            className="w-full p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-slate-200 text-xs focus:border-indigo-500 focus:outline-none resize-none"
          />
        </div>
      </div>

      {/* Start Over button (screen only) */}
      <div className="no-print flex justify-end">
        <button
          onClick={() => {
            if (window.confirm('Are you sure you want to start over? This will reset your score and attempts.')) {
              onReset();
            }
          }}
          className="text-xs text-rose-400 hover:text-rose-300 underline font-semibold transition-colors cursor-pointer"
        >
          Reset All Progress & Start Over
        </button>
      </div>
    </div>
  );
};
