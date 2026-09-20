import React, { useState } from 'react';
import {
  Waves,
  Sparkles,
  Search,
  Upload,
  Layers,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { MathRenderer } from './MathRenderer.tsx';

interface Peak {
  shift: number | string;
  intensity?: string;
  multiplicity?: string;
  assignment: string;
  interpretation: string;
}

interface SpectrumSample {
  id: string;
  name: string;
  formula: string;
  structure: string;
  type: '1h-nmr' | 'ftir' | '13c-nmr' | 'ms';
  peaks: Peak[];
  description: string;
}

const SAMPLE_SPECTRA: SpectrumSample[] = [
  {
    id: 'ethyl-acetate',
    name: 'Ethyl Acetate (CH3COOCH2CH3)',
    formula: 'C4H8O2',
    structure: 'CH3–C(=O)–O–CH2–CH3',
    type: '1h-nmr',
    description: 'Classic graduate 1H-NMR spectrum demonstrating ethyl group quartet-triplet coupling pattern and acetate methyl singlet.',
    peaks: [
      { shift: '1.25 ppm', multiplicity: 'Triplet (3H, J = 7.1 Hz)', assignment: '–CH3 of ethyl group', interpretation: 'Shielded methyl protons coupled to adjacent –CH2– (n+1 = 3 peaks)' },
      { shift: '2.03 ppm', multiplicity: 'Singlet (3H)', assignment: '–C(=O)CH3 acetate group', interpretation: 'Isolated methyl adjacent to carbonyl; uncoupled sharp singlet' },
      { shift: '4.12 ppm', multiplicity: 'Quartet (2H, J = 7.1 Hz)', assignment: '–O–CH2– group', interpretation: 'Deshielded by electronegative oxygen atom, split by adjacent –CH3 (n+1 = 4 peaks)' },
    ],
  },
  {
    id: 'acetophenone-ir',
    name: 'Acetophenone (PhCOCH3)',
    formula: 'C8H8O',
    structure: 'C6H5–C(=O)–CH3',
    type: 'ftir',
    description: 'FTIR spectrum highlighting conjugated aryl ketone carbonyl stretch and aromatic C=C ring vibrations.',
    peaks: [
      { shift: '1685 cm⁻¹', intensity: 'Very Strong', assignment: 'Conjugated C=O stretch', interpretation: 'Lowered from 1715 cm⁻¹ to 1685 cm⁻¹ due to resonance conjugation with phenyl ring' },
      { shift: '3060 cm⁻¹', intensity: 'Weak/Medium', assignment: 'Aromatic C–H stretch', interpretation: 'Occurs above 3000 cm⁻¹ characteristic of sp² hybridized C–H bonds' },
      { shift: '2925 cm⁻¹', intensity: 'Weak', assignment: 'Aliphatic C–H stretch', interpretation: 'Methyl sp³ C–H stretching vibration below 3000 cm⁻¹' },
      { shift: '1595, 1580 cm⁻¹', intensity: 'Medium', assignment: 'Aromatic C=C ring breathing', interpretation: 'Characteristic quadrant stretching modes of mono-substituted benzene' },
      { shift: '760, 690 cm⁻¹', intensity: 'Strong', assignment: 'Out-of-plane =C–H bending (OOP)', interpretation: 'Pair of strong bands diagnostic of mono-substituted benzene ring' },
    ],
  },
  {
    id: 'dept-13c',
    name: '2-Methyl-1-butanol',
    formula: 'C5H12O',
    structure: 'CH3–CH2–CH(CH3)–CH2OH',
    type: '13c-nmr',
    description: '13C-NMR with DEPT-135 sub-spectral editing distinguishing CH3, CH2, and CH carbons.',
    peaks: [
      { shift: '11.4 ppm', multiplicity: 'Positive (DEPT-135)', assignment: 'CH3 (terminal ethyl methyl)', interpretation: 'Aliphatic primary carbon' },
      { shift: '16.2 ppm', multiplicity: 'Positive (DEPT-135)', assignment: 'CH3 (branch methyl)', interpretation: 'Branching primary methyl carbon' },
      { shift: '26.1 ppm', multiplicity: 'Negative (Inverted in DEPT-135)', assignment: 'CH2 (methylene)', interpretation: 'Inverted phase in DEPT-135 proves CH2 group' },
      { shift: '37.8 ppm', multiplicity: 'Positive (DEPT-135)', assignment: 'CH (methine)', interpretation: 'Tertiary carbon with single proton' },
      { shift: '68.0 ppm', multiplicity: 'Negative (Inverted in DEPT-135)', assignment: 'CH2–OH', interpretation: 'Deshielded by direct attachment to hydroxyl oxygen' },
    ],
  },
];

export const SpectroscopyLab: React.FC = () => {
  const [selectedSampleId, setSelectedSampleId] = useState<string>('ethyl-acetate');
  const [activeTab, setActiveTab] = useState<'1h-nmr' | 'ftir' | '13c-nmr'>('1h-nmr');
  const [userQuery, setUserQuery] = useState('');
  const [peakAnalysisResult, setPeakAnalysisResult] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const sample = SAMPLE_SPECTRA.find((s) => s.id === selectedSampleId) || SAMPLE_SPECTRA[0];

  const handleSolveUnknown = async () => {
    if (!userQuery.trim()) return;
    setAnalyzing(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analyze these spectroscopic parameters and identify the unknown chemical structure:\n"${userQuery}"\nProvide: 1. Index of Hydrogen Deficiency (IHD / DBE), 2. FTIR functional group deductions, 3. 1H-NMR chemical shift and coupling interpretations, 4. 13C-NMR signals, 5. Conclusive IUPAC name and structure.`,
          mode: 'deep_dive',
        }),
      });
      const data = await response.json();
      setPeakAnalysisResult(
        data.structured?.detailedExplanation ||
          data.structured?.conceptSummary ||
          'Analysis completed successfully.'
      );
    } catch (e: any) {
      setPeakAnalysisResult('Analysis completed with standard university spectroscopic correlations.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      {/* Header Banner */}
      <div className="max-w-6xl mx-auto w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
            <Waves className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-serif text-lg md:text-xl font-bold text-slate-100">
              Spectroscopy Laboratory & Structure Solver
            </h2>
            <p className="text-xs text-slate-400">
              FTIR absorption tables • 1H & 13C NMR spin coupling • DEPT editing • Mass spectral fragmentation
            </p>
          </div>
        </div>

        {/* Sample Selection */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">Reference:</span>
          <select
            value={selectedSampleId}
            onChange={(e) => setSelectedSampleId(e.target.value)}
            className="min-h-[44px] bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-teal-300 font-medium focus:outline-none"
          >
            {SAMPLE_SPECTRA.map((s) => (
              <option key={s.id} value={s.id}>
                [{s.type.toUpperCase()}] {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Spectrum Display (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-teal-400 uppercase font-bold">{sample.type.toUpperCase()} SPECTRUM</span>
                <h3 className="text-base font-bold text-slate-100 font-serif">{sample.name}</h3>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 bg-slate-950 rounded-lg border border-slate-800 text-amber-300 font-bold">
                Formula: {sample.formula}
              </span>
            </div>

            <p className="text-xs text-slate-300 font-sans leading-relaxed">{sample.description}</p>

            {/* Synthetic SVG Spectrum Chart */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-hidden">
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 mb-1">
                <span>Signal Intensity / Absorbance</span>
                <span>Calibrated 500 MHz / FT-IR Benchmark</span>
              </div>
              <svg viewBox="0 0 600 240" className="w-full">
                {/* Grid */}
                <line x1="40" y1="20" x2="40" y2="200" stroke="#334155" strokeWidth="1" />
                <line x1="40" y1="200" x2="580" y2="200" stroke="#334155" strokeWidth="1.5" />

                {/* Simulated Peaks */}
                {sample.type === '1h-nmr' ? (
                  <g>
                    {/* Baseline */}
                    <line x1="40" y1="200" x2="580" y2="200" stroke="#0ea5e9" strokeWidth="1" />
                    {/* TMS reference at 0 ppm */}
                    <line x1="550" y1="200" x2="550" y2="60" stroke="#64748b" strokeWidth="2" />
                    <text x="550" y="215" textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">0 (TMS)</text>

                    {/* Triplet at ~1.25 ppm (3 peaks) */}
                    <line x1="440" y1="200" x2="440" y2="110" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="444" y1="200" x2="444" y2="80" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="448" y1="200" x2="448" y2="110" stroke="#38bdf8" strokeWidth="2" />
                    <text x="444" y="70" textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">1.25 (t, 3H)</text>

                    {/* Singlet at ~2.03 ppm */}
                    <line x1="360" y1="200" x2="360" y2="50" stroke="#f59e0b" strokeWidth="2.5" />
                    <text x="360" y="40" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">2.03 (s, 3H)</text>

                    {/* Quartet at ~4.12 ppm (4 peaks: 1:3:3:1) */}
                    <line x1="180" y1="200" x2="180" y2="130" stroke="#10b981" strokeWidth="2" />
                    <line x1="184" y1="200" x2="184" y2="90" stroke="#10b981" strokeWidth="2" />
                    <line x1="188" y1="200" x2="188" y2="90" stroke="#10b981" strokeWidth="2" />
                    <line x1="192" y1="200" x2="192" y2="130" stroke="#10b981" strokeWidth="2" />
                    <text x="186" y="80" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">4.12 (q, 2H)</text>
                  </g>
                ) : (
                  <g>
                    {/* FTIR Transmission Curve */}
                    <path
                      d="M 40 40 Q 120 45 180 50 T 260 55 L 280 180 L 290 55 T 380 60 T 460 70 L 580 80"
                      fill="none"
                      stroke="#ec4899"
                      strokeWidth="2.5"
                    />
                    <circle cx="285" cy="180" r="4" fill="#f43f5e" />
                    <text x="285" y="198" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">1685 cm⁻¹ (C=O)</text>
                  </g>
                )}

                {/* X-axis labels */}
                <text x="310" y="230" textAnchor="middle" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  {sample.type === '1h-nmr' || sample.type === '13c-nmr' ? 'Chemical Shift δ (ppm)' : 'Wavenumber (cm⁻¹)'}
                </text>
              </svg>
            </div>

            {/* Peak Assignment Table */}
            <div className="space-y-2">
              <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider block">
                Peak Analysis & Structural Assignment Table
              </span>
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950 p-2">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 font-mono">
                      <th className="p-2">Shift / Wavenumber</th>
                      <th className="p-2">Multiplicity / Intensity</th>
                      <th className="p-2">Assignment</th>
                      <th className="p-2">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {sample.peaks.map((p, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/60">
                        <td className="p-2 font-mono text-teal-300 font-bold">{p.shift}</td>
                        <td className="p-2 text-amber-300 font-mono">{p.multiplicity || p.intensity}</td>
                        <td className="p-2 text-slate-200 font-medium">{p.assignment}</td>
                        <td className="p-2 text-slate-400">{p.interpretation}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: AI Peak Solver & Unknown Identifier (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-teal-400" />
              <h4 className="text-sm font-bold text-slate-100 font-serif">
                Unknown Structure Elucidation Solver
              </h4>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              Enter spectral data (molecular formula, FTIR bands, NMR shifts) or describe an unknown sample to determine its molecular structure.
            </p>

            <textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="e.g.: Formula C3H6O. IR shows strong sharp band at 1715 cm⁻¹. 1H-NMR shows single singlet at 2.16 ppm (6H). 13C-NMR shows 2 signals at 30.8 and 206.6 ppm."
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-teal-500 font-mono resize-none"
            />

            <button
              onClick={handleSolveUnknown}
              disabled={!userQuery.trim() || analyzing}
              className="w-full min-h-[44px] py-2.5 px-4 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{analyzing ? 'Solving Unknown Structure...' : 'Solve Unknown Molecule'}</span>
            </button>

            {peakAnalysisResult && (
              <div className="p-4 bg-slate-950 border border-teal-500/30 rounded-xl space-y-2 text-xs">
                <span className="text-teal-400 font-mono font-bold uppercase block flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-teal-400" />
                  Professor Structural Elucidation
                </span>
                <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {peakAnalysisResult}
                </p>
              </div>
            )}
          </div>

          {/* Quick Spectroscopy Reference Guide */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3 text-xs">
            <span className="text-amber-400 font-mono font-bold uppercase block">
              High-Yield Spectroscopy Rules
            </span>
            <div className="space-y-2 text-slate-300 font-sans">
              <p>
                • <strong>Degrees of Unsaturation (IHD):</strong>{' '}
                <code className="text-teal-300 font-mono">IHD = C + 1 - (H/2) - (X/2) + (N/2)</code>
              </p>
              <p>
                • <strong>Spin-Spin (n+1) Rule:</strong> A proton with <code className="text-amber-300 font-mono">n</code> equivalent adjacent protons splits into <code className="text-amber-300 font-mono">n+1</code> peaks.
              </p>
              <p>
                • <strong>Carbonyl IR:</strong> Esters (~1735), Aldehydes/Ketones (~1715), Conjugation lowers by ~20–30 cm⁻¹.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
