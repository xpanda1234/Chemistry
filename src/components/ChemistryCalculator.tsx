import React, { useState } from 'react';
import { Calculator, Sparkles, CheckCircle2, RotateCcw, HelpCircle, ArrowRight } from 'lucide-react';
import { MathRenderer } from './MathRenderer.tsx';
import { NumericalBreakdown } from '../types.ts';

const SAMPLE_NUMERICAL_PROBLEMS = [
  'Calculate the pH of 0.050 M acetic acid (CH3COOH) given Ka = 1.8 × 10⁻⁵ at 25°C. Check whether the 5% approximation holds.',
  'Calculate the standard Gibbs free energy change (ΔG°) and equilibrium constant K for a reaction with ΔH° = -85.2 kJ/mol and ΔS° = -135 J/(mol·K) at 298.15 K.',
  'For a first-order chemical decomposition with a rate constant k = 2.45 × 10⁻³ s⁻¹, calculate the half-life (t1/2) and the time required for 90% of the reactant to decompose.',
  'Calculate the EMF of a Daniel cell at 298 K: Zn(s) | Zn²⁺ (0.010 M) || Cu²⁺ (0.500 M) | Cu(s), given E°(Zn²⁺/Zn) = -0.76 V and E°(Cu²⁺/Cu) = +0.34 V.',
];

export const ChemistryCalculator: React.FC = () => {
  const [problemText, setProblemText] = useState('');
  const [loading, setLoading] = useState(false);
  const [solution, setSolution] = useState<NumericalBreakdown | null>(null);

  const handleSolve = async (textToSolve?: string) => {
    const text = textToSolve || problemText.trim();
    if (!text || loading) return;

    if (textToSolve) setProblemText(textToSolve);
    setLoading(true);

    try {
      const response = await fetch('/api/calculator/solve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ problemText: text }),
      });

      const data = await response.json();
      if (data.solution) {
        setSolution(data.solution);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-100">
                Rigorous Chemistry Numerical Solver
              </h2>
              <p className="text-xs text-slate-400">
                Units validation • Significant figures • Explicit thermodynamic approximations
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs px-3 py-1 bg-slate-950 border border-slate-800 text-teal-400 rounded-full font-mono">
            B.Sc. & M.Sc. Precision
          </span>
        </div>

        {/* Input Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <label className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block">
            Enter Numerical Chemistry Problem:
          </label>
          <textarea
            value={problemText}
            onChange={(e) => setProblemText(e.target.value)}
            placeholder="Type any numerical problem (pH, buffer equilibrium, kinetics order & activation energy, cell potential, thermodynamics, Osmotic pressure)..."
            rows={4}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
          />

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setProblemText('');
                setSolution(null);
              }}
              className="min-h-[44px] px-3 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              onClick={() => handleSolve()}
              disabled={!problemText.trim() || loading}
              className="min-h-[44px] px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Calculating...' : 'Solve Problem'}</span>
            </button>
          </div>

          {/* Sample Prompts */}
          <div className="pt-2 border-t border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block mb-2">
              University Benchmark Problems:
            </span>
            <div className="flex flex-wrap gap-2">
              {SAMPLE_NUMERICAL_PROBLEMS.map((prob, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSolve(prob)}
                  className="min-h-[44px] text-xs px-3.5 py-2 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all text-left flex items-center"
                >
                  <span className="line-clamp-1">{prob}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Structured Solution Breakdown Card */}
        {solution && (
          <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-teal-400" />
                <h3 className="text-base font-bold font-serif text-slate-100">
                  Step-by-Step Mathematical & Chemical Resolution
                </h3>
              </div>
              <span className="text-xs font-mono text-teal-400">Strict Scientific Format</span>
            </div>

            {/* Given & Required */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-slate-400 font-mono uppercase text-[10px] block font-bold">
                  1. Given Numerical Parameters:
                </span>
                <ul className="list-disc list-inside text-slate-200 space-y-0.5 font-mono">
                  {solution.given?.map((g, i) => (
                    <li key={i}>{g}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5">
                <span className="text-slate-400 font-mono uppercase text-[10px] block font-bold">
                  2. Required Target:
                </span>
                <p className="text-amber-300 font-semibold text-sm">{solution.required}</p>
              </div>
            </div>

            {/* Formula */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
              <span className="text-slate-400 font-mono uppercase text-[10px] block font-bold">
                3. Primary Governing Formula:
              </span>
              <MathRenderer latex={solution.formulaLatex} className="text-base text-teal-300" />
            </div>

            {/* Units & Significant Figures Check */}
            {solution.unitsCheck && (
              <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl text-xs space-y-1">
                <span className="text-cyan-400 font-mono uppercase text-[10px] block font-bold">
                  4. Dimensional & Significant Figures Verification:
                </span>
                <p className="text-slate-300 font-mono">{solution.unitsCheck}</p>
              </div>
            )}

            {/* Substitution & Stepwise Calculation */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2 text-xs">
              <span className="text-slate-400 font-mono uppercase text-[10px] block font-bold">
                5. Direct Substitution & Algebraic Operations:
              </span>
              <MathRenderer latex={solution.substitution} />
              <p className="text-slate-300 font-mono whitespace-pre-line leading-relaxed">
                {solution.calculation}
              </p>
            </div>

            {/* Final Answer in Highlighted Box */}
            <div className="p-5 bg-teal-950/50 border border-teal-500/50 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-mono text-teal-300 uppercase font-bold block">
                  Final Calculated Value:
                </span>
                <span className="text-xl sm:text-2xl font-mono font-bold text-white tracking-wide mt-1 block">
                  {solution.finalAnswer}
                </span>
              </div>
              <span className="text-xs px-3 py-1 bg-teal-500/20 text-teal-300 rounded-lg font-mono border border-teal-500/30">
                Verified
              </span>
            </div>

            {/* Physical Interpretation & Assumptions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {solution.interpretation && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-mono uppercase text-[10px] block font-bold">
                    Physical Interpretation:
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed">{solution.interpretation}</p>
                </div>
              )}

              {solution.assumptions && (
                <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-slate-400 font-mono uppercase text-[10px] block font-bold">
                    Assumptions & Boundary Conditions:
                  </span>
                  <p className="text-slate-300 font-sans leading-relaxed">{solution.assumptions}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
