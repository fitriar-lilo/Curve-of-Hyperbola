import React, { useState } from 'react';
import { MathGraph } from './MathGraph';
import { MathView } from './MathView';
import { Sliders, Sparkles, CheckCircle2, Info, Compass, ArrowRight } from 'lucide-react';
import { playClickSound } from '../utils/audio';

export function getHyperbolaLatex(paramA: number, paramB: number): string {
  let eq = 'y = ';
  if (paramA >= 0) {
    eq += `\\frac{${paramA}}{x}`;
  } else {
    eq += `-\\frac{${Math.abs(paramA)}}{x}`;
  }
  if (paramB > 0) {
    eq += ` + ${paramB}`;
  } else if (paramB < 0) {
    eq += ` - ${Math.abs(paramB)}`;
  }
  return eq;
}

export const HyperbolaVisualizer: React.FC = () => {
  const [a, setA] = useState<number>(4);
  const [b, setB] = useState<number>(2);
  const [showQuadrants, setShowQuadrants] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'visualizer' | 'examples' | 'keyfacts'>('visualizer');

  const handleAChange = (val: number) => {
    // If 0, skip to 1 or -1 depending on previous direction
    if (val === 0) {
      val = a > 0 ? -1 : 1;
    }
    setA(val);
    playClickSound();
  };

  const handleBChange = (val: number) => {
    setB(val);
    playClickSound();
  };

  // Generate table of values for current a and b
  const divisorsOfA: number[] = [];
  const absA = Math.abs(a);
  for (let i = 1; i <= Math.min(absA, 6); i++) {
    if (absA % i === 0) {
      divisorsOfA.push(i);
      divisorsOfA.push(-i);
    }
  }
  divisorsOfA.sort((x, y) => x - y);

  // Format equation nicely
  const formatEquation = (paramA: number, paramB: number) => {
    let eq = 'y = ';
    if (paramA > 0) {
      eq += `${paramA} / x`;
    } else {
      eq += `- ${Math.abs(paramA)} / x`;
    }

    if (paramB > 0) {
      eq += ` + ${paramB}`;
    } else if (paramB < 0) {
      eq += ` - ${Math.abs(paramB)}`;
    }
    return eq;
  };

  return (
    <div className="space-y-6">
      {/* Tab bar inside Section 2 */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800">
        <button
          onClick={() => { setActiveTab('visualizer'); playClickSound(); }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'visualizer'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Interactive Visualizer</span>
        </button>

        <button
          onClick={() => { setActiveTab('examples'); playClickSound(); }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'examples'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>3 Guided Examples</span>
        </button>

        <button
          onClick={() => { setActiveTab('keyfacts'); playClickSound(); }}
          className={`flex-1 min-w-[140px] py-2.5 px-4 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
            activeTab === 'keyfacts'
              ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Key Facts Summary</span>
        </button>
      </div>

      {/* TAB 1: INTERACTIVE VISUALIZER */}
      {activeTab === 'visualizer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Sliders & Controls */}
          <div className="lg:col-span-5 space-y-5">
            {/* Live Formula Banner */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-violet-950/70 border border-indigo-500/30 shadow-xl">
              <div className="text-xs font-semibold tracking-wider uppercase text-indigo-400 mb-1">
                Current Equation
              </div>
              <div className="text-3xl sm:text-4xl font-extrabold text-white py-1">
                <MathView latex={getHyperbolaLatex(a, b)} />
              </div>
              <div className="mt-3 flex items-center gap-2 text-xs text-slate-300">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                <span>Horizontal Asymptote: </span>
                <strong className="text-sky-400 font-semibold">
                  <MathView latex={`y = ${b}`} />
                </strong>
                <span className="mx-1">•</span>
                <span>Vertical Asymptote: </span>
                <strong className="text-amber-400 font-semibold">
                  <MathView latex="x = 0" />
                </strong>
              </div>
            </div>

            {/* Parameter a Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="slider-a" className="text-sm font-bold text-slate-200">
                    Numerator <span className="font-mono text-indigo-400">a</span> (Curvature & Quadrants)
                  </label>
                  <p className="text-xs text-slate-400">
                    {a > 0
                      ? 'Positive (a > 0): Branches in Quadrants 1 & 3'
                      : 'Negative (a < 0): Branches in Quadrants 2 & 4'}
                  </p>
                </div>
                <span className={`text-xl font-bold font-mono px-3 py-1 rounded-lg ${
                  a > 0 ? 'bg-indigo-500/20 text-indigo-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  a = {a}
                </span>
              </div>

              <input
                id="slider-a"
                type="range"
                min="-6"
                max="6"
                step="1"
                value={a}
                onChange={(e) => handleAChange(parseInt(e.target.value, 10))}
                className="w-full accent-indigo-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>-6 (Q2 & Q4)</span>
                <span className="text-rose-400/80 font-bold">Never zero!</span>
                <span>+6 (Q1 & Q3)</span>
              </div>
            </div>

            {/* Parameter b Slider */}
            <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor="slider-b" className="text-sm font-bold text-slate-200">
                    Constant <span className="font-mono text-sky-400">b</span> (Vertical Shift)
                  </label>
                  <p className="text-xs text-slate-400">
                    {b === 0
                      ? 'No vertical shift (Asymptote on x-axis y = 0)'
                      : b > 0
                      ? `Shifted UP by ${b} units (Asymptote y = ${b})`
                      : `Shifted DOWN by ${Math.abs(b)} units (Asymptote y = ${b})`}
                  </p>
                </div>
                <span className="text-xl font-bold font-mono px-3 py-1 rounded-lg bg-sky-500/20 text-sky-300">
                  b = {b}
                </span>
              </div>

              <input
                id="slider-b"
                type="range"
                min="-5"
                max="5"
                step="1"
                value={b}
                onChange={(e) => handleBChange(parseInt(e.target.value, 10))}
                className="w-full accent-sky-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />

              <div className="flex justify-between text-[11px] font-mono text-slate-500">
                <span>-5 (Down)</span>
                <span>0 (No shift)</span>
                <span>+5 (Up)</span>
              </div>
            </div>

            {/* Preset shortcuts */}
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-xs font-semibold text-slate-400 mb-2.5">Quick Presets:</div>
              <div className="flex flex-wrap gap-2">
                {[
                  { latex: 'y = \\frac{4}{x} + 2', aVal: 4, bVal: 2 },
                  { latex: 'y = -\\frac{6}{x} - 3', aVal: -6, bVal: -3 },
                  { latex: 'y = \\frac{2}{x}', aVal: 2, bVal: 0 },
                  { latex: 'y = -\\frac{3}{x} + 1', aVal: -3, bVal: 1 },
                ].map((item, idx) => (
                  <button
                    key={`preset-${idx}`}
                    onClick={() => {
                      setA(item.aVal);
                      setB(item.bVal);
                      playClickSound();
                    }}
                    className="text-xs py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-indigo-600/30 hover:border-indigo-400 border border-slate-700 text-slate-200 transition-colors"
                  >
                    <MathView latex={item.latex} />
                  </button>
                ))}
              </div>
            </div>

            {/* Quick explanation bullet points */}
            <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-900/40 text-xs text-slate-300 space-y-2">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <MathView>Why is $x = 0$ forbidden? Dividing any number by 0 has no answer. This creates an eternal gap! The graph splits into two separate curves (branches).</MathView>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <MathView>{`Why does $y$ approach $b$? When $x$ becomes huge, $\\frac{${Math.abs(a)}}{x} \\to 0$. So $y$ gets closer and closer to $y = ${b}$.`}</MathView>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Graph & Dynamic Table */}
          <div className="lg:col-span-7 space-y-5">
            {/* The SVG Graph */}
            <div className="flex flex-col items-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800 shadow-xl">
              <div className="w-full flex items-center justify-between mb-3 px-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    Live Hyperbola Graph
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setShowQuadrants(!showQuadrants); playClickSound(); }}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                      showQuadrants
                        ? 'bg-indigo-950/60 border-indigo-500/50 text-indigo-300'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    {showQuadrants ? 'Quadrants: Visible' : 'Quadrants: Hidden'}
                  </button>
                  <span className="text-[11px] text-slate-400 hidden sm:inline">
                    Move cursor to inspect points
                  </span>
                </div>
              </div>

              <div className="w-full max-w-[460px]">
                <MathGraph
                  config={{
                    type: 'hyperbola',
                    a,
                    b,
                    xRange: [-7, 7],
                    yRange: [-7, 7],
                    showAsymptotes: true,
                    showQuadrants,
                  }}
                  width={440}
                  height={380}
                  interactive={true}
                  className="w-full shadow-2xl"
                />
              </div>

              {/* Legend */}
              <div className="w-full mt-4 flex flex-wrap items-center justify-center gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-1 bg-indigo-400 rounded-full"></span>
                  <span className="text-slate-300">Curve Branches</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-sky-400"></span>
                  <span className="text-sky-300 font-medium">
                    <MathView latex={`y = ${b}`} /> (Horizontal Asymptote)
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4 h-0.5 border-t-2 border-dashed border-amber-400"></span>
                  <span className="text-amber-300 font-medium">
                    <MathView latex="x = 0" /> (Vertical Asymptote)
                  </span>
                </div>
              </div>
            </div>

            {/* Dynamic Step-by-Step Table of Values */}
            <div className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Step-by-Step Table of Coordinates
                </h4>
                <span className="text-[11px] text-slate-300">
                  <MathView latex={getHyperbolaLatex(a, b)} />
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-center text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-800/80 text-slate-300">
                      <th className="py-2 px-2 rounded-l-lg font-mono">
                        <MathView latex="x" />
                      </th>
                      {divisorsOfA.map((x) => (
                        <th key={`head-${x}`} className="py-2 px-1 font-mono text-slate-300">
                          {x}
                        </th>
                      ))}
                      <th className="py-2 px-2 font-mono text-amber-400 bg-amber-950/40">0</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-t border-slate-800">
                      <td className="py-2 px-2 font-mono font-bold text-indigo-400 bg-slate-800/40">
                        <MathView latex="a / x" />
                      </td>
                      {divisorsOfA.map((x) => (
                        <td key={`ax-${x}`} className="py-2 px-1 font-mono text-slate-300">
                          {a / x}
                        </td>
                      ))}
                      <td className="py-2 px-2 font-mono text-amber-400 bg-amber-950/40 font-bold">
                        undefined
                      </td>
                    </tr>
                    <tr className="border-t border-slate-800">
                      <td className="py-2 px-2 font-mono font-bold text-sky-400 bg-slate-800/40">
                        <MathView latex="y = \frac{a}{x} + b" />
                      </td>
                      {divisorsOfA.map((x) => {
                        const yVal = a / x + b;
                        return (
                          <td key={`y-${x}`} className="py-2 px-1 font-mono font-bold text-white bg-indigo-950/20">
                            {yVal}
                          </td>
                        );
                      })}
                      <td className="py-2 px-2 font-mono text-rose-400 bg-amber-950/40 font-semibold">
                        NO POINT
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: 3 GUIDED WORKED EXAMPLES */}
      {activeTab === 'examples' && (
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/50 text-sm text-indigo-200 flex items-center gap-3">
            <Compass className="w-5 h-5 text-indigo-400 shrink-0" />
            <span>
              Here are 3 standard Cambridge IGCSE exam examples. Pay close attention to the sign of <strong className="text-white">a</strong> and the value of <strong className="text-white">b</strong>.
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Example 1 */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/50 px-2 py-0.5 rounded">
                    Example 1
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Positive a, Shifted Up</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3">
                  <MathView latex="y = \frac{4}{x} + 2" />
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 mb-4">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div><MathView latex="a = 4" /> (positive): branches lie in <strong>Quadrants 1 & 3</strong>.</div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div><MathView latex="b = 2" /> (shifted up 2): horizontal asymptote is <span className="text-sky-400 font-bold"><MathView latex="y = 2" /></span>.</div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>Vertical asymptote is always <span className="text-amber-400 font-bold"><MathView latex="x = 0" /></span>.</div>
                  </li>
                </ul>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-[11px] text-slate-300">
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1.5">Key Coordinates:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><MathView>$x = 1 \implies y = 6$</MathView></div>
                    <div><MathView>$x = 2 \implies y = 4$</MathView></div>
                    <div><MathView>$x = -1 \implies y = -2$</MathView></div>
                    <div><MathView>$x = -2 \implies y = 0$</MathView></div>
                  </div>
                </div>
              </div>

              <div>
                <MathGraph
                  config={{
                    type: 'hyperbola',
                    a: 4,
                    b: 2,
                    xRange: [-6, 6],
                    yRange: [-6, 6],
                    showAsymptotes: true,
                  }}
                  width={280}
                  height={220}
                  className="w-full"
                />
              </div>
            </div>

            {/* Example 2 */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 bg-rose-950/50 px-2 py-0.5 rounded">
                    Example 2
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Negative a, Shifted Down</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3">
                  <MathView latex="y = -\frac{6}{x} - 3" />
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 mb-4">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div><MathView latex="a = -6" /> (negative): branches lie in <strong>Quadrants 2 & 4</strong>.</div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div><MathView latex="b = -3" /> (shifted down 3): horizontal asymptote is <span className="text-sky-400 font-bold"><MathView latex="y = -3" /></span>.</div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    <div>Vertical asymptote is <span className="text-amber-400 font-bold"><MathView latex="x = 0" /></span>.</div>
                  </li>
                </ul>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-[11px] text-slate-300">
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1.5">Key Coordinates:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><MathView>$x = 2 \implies y = -6$</MathView></div>
                    <div><MathView>$x = 3 \implies y = -5$</MathView></div>
                    <div><MathView>$x = -2 \implies y = 0$</MathView></div>
                    <div><MathView>$x = -3 \implies y = -1$</MathView></div>
                  </div>
                </div>
              </div>

              <div>
                <MathGraph
                  config={{
                    type: 'hyperbola',
                    a: -6,
                    b: -3,
                    xRange: [-7, 7],
                    yRange: [-7, 7],
                    showAsymptotes: true,
                  }}
                  width={280}
                  height={220}
                  className="w-full"
                />
              </div>
            </div>

            {/* Example 3 */}
            <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-indigo-500/50 transition-all">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-400 bg-sky-950/50 px-2 py-0.5 rounded">
                    Example 3
                  </span>
                  <span className="text-xs text-slate-400 font-medium">Positive a, No Shift</span>
                </div>
                <div className="text-2xl font-bold text-white mb-3">
                  <MathView latex="y = \frac{2}{x}" />
                </div>
                <ul className="text-xs text-slate-300 space-y-2.5 mb-4">
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <div><MathView latex="a = 2" /> (positive): branches lie in <strong>Quadrants 1 & 3</strong>.</div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <div><MathView latex="b = 0" /> (no shift): horizontal asymptote is the x-axis (<span className="text-sky-400 font-bold"><MathView latex="y = 0" /></span>).</div>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
                    <div>Vertical asymptote is the y-axis (<span className="text-amber-400 font-bold"><MathView latex="x = 0" /></span>).</div>
                  </li>
                </ul>

                <div className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80 mb-3 text-[11px] text-slate-300">
                  <div className="text-[10px] uppercase text-slate-400 font-bold mb-1.5">Key Coordinates:</div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div><MathView>$x = 1 \implies y = 2$</MathView></div>
                    <div><MathView>$x = 2 \implies y = 1$</MathView></div>
                    <div><MathView>$x = -1 \implies y = -2$</MathView></div>
                    <div><MathView>$x = -2 \implies y = -1$</MathView></div>
                  </div>
                </div>
              </div>

              <div>
                <MathGraph
                  config={{
                    type: 'hyperbola',
                    a: 2,
                    b: 0,
                    xRange: [-6, 6],
                    yRange: [-6, 6],
                    showAsymptotes: true,
                  }}
                  width={280}
                  height={220}
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KEY FACTS SUMMARY */}
      {activeTab === 'keyfacts' && (
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950/50 to-slate-900 border border-indigo-500/30 space-y-5">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">IGCSE Quick Cheat-Sheet: Hyperbolas</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-indigo-400 tracking-wider">
                1. General Form
              </span>
              <div className="text-2xl text-white font-bold my-1">
                <MathView latex="y = \frac{a}{x} + b" />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                A hyperbola consists of <strong>two separate smooth curved branches</strong>. It is never one continuous line because <MathView>$x = 0$</MathView> is undefined.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-sky-400 tracking-wider">
                2. Asymptotes (Boundary Lines)
              </span>
              <div className="text-slate-200 text-xs leading-relaxed space-y-1">
                <div>• <strong>Vertical Asymptote:</strong> Always <MathView>$x = 0$</MathView> (the y-axis).</div>
                <div>• <strong>Horizontal Asymptote:</strong> Always <MathView>$y = b$</MathView>. The curve gets infinitely close as <MathView>$x \to \pm\infty$</MathView>, but never touches it.</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-emerald-400 tracking-wider">
                3. Sign of a (Quadrant Placement)
              </span>
              <div className="text-slate-200 text-xs leading-relaxed space-y-1">
                <div>• <strong>If <MathView>$a &gt; 0$</MathView>:</strong> Curve is in <strong>Quadrants 1 & 3</strong> (top-right and bottom-left).</div>
                <div>• <strong>If <MathView>$a &lt; 0$</MathView>:</strong> Curve is in <strong>Quadrants 2 & 4</strong> (top-left and bottom-right).</div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2">
              <span className="text-xs uppercase font-bold text-violet-400 tracking-wider">
                4. Exam Sketching Checklist
              </span>
              <div className="text-slate-200 text-xs leading-relaxed space-y-1">
                <div>1. Draw and label the dashed horizontal line <MathView>$y = b$</MathView>.</div>
                <div>2. Check the sign of <MathView>$a$</MathView> to place the branches in opposite quadrants.</div>
                <div>3. Calculate 1 or 2 integer test points (e.g. at <MathView>$x = 1$</MathView> and <MathView>$x = -1$</MathView>).</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
