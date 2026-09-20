import React, { useState } from 'react';
import {
  GraduationCap,
  Sparkles,
  Send,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Award,
  ArrowRight,
  RotateCcw,
  BookOpen,
} from 'lucide-react';
import { VivaEvaluation, AcademicLevel } from '../types.ts';

interface VivaModeProps {
  academicLevel: AcademicLevel;
}

const DEFAULT_VIVA_QUESTIONS = [
  {
    topic: 'Organic Chemistry',
    question: 'Why does an SN2 reaction proceed with 100% stereochemical inversion (Walden Inversion), whereas an SN1 reaction rarely yields a perfect 50:50 racemic mixture in actual laboratory experiments?',
  },
  {
    topic: 'Inorganic & Coordination Chemistry',
    question: 'Explain why carbon monoxide (CO) is at the extreme strong-field end of the spectrochemical series despite having a lower dipole moment than water. Detail the synergic bonding mechanism.',
  },
  {
    topic: 'Physical Chemistry & Thermodynamics',
    question: 'State the physical significance of the Maxwell relations in classical thermodynamics. How do they allow experimental measurement of quantities like (∂S/∂V)_T that cannot be measured with a calorimeter?',
  },
  {
    topic: 'Analytical Chemistry & Instrumentation',
    question: 'Why is the half-equivalence point in a weak acid-strong base titration physically significant? How does buffer capacity behave at this point according to the Van Slyke equation?',
  },
];

export const VivaMode: React.FC<VivaModeProps> = ({ academicLevel }) => {
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [evaluation, setEvaluation] = useState<VivaEvaluation | null>(null);

  const currentQ = DEFAULT_VIVA_QUESTIONS[selectedQuestionIndex];

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || loading) return;
    setLoading(true);

    try {
      const response = await fetch('/api/viva/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: currentQ.question,
          studentAnswer,
          topic: currentQ.topic,
          level: academicLevel,
        }),
      });

      const data = await response.json();
      if (data.evaluation) {
        setEvaluation(data.evaluation);
      }
    } catch (err) {
      console.error('Viva error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-100">
                Senior Chemistry Oral Examination (Viva Voce)
              </h2>
              <p className="text-xs text-slate-400">
                Rigorous oral examination simulation with external university professor rubric
              </p>
            </div>
          </div>
          <span className="self-start sm:self-auto text-xs px-3 py-1 bg-slate-950 border border-slate-800 text-teal-400 rounded-full font-mono">
            {academicLevel}
          </span>
        </div>

        {/* Question Selector Carousel */}
        <div className="flex gap-2 overflow-x-auto touch-pan-x no-scrollbar pb-1 -mx-1 px-1">
          {DEFAULT_VIVA_QUESTIONS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedQuestionIndex(idx);
                setStudentAnswer('');
                setEvaluation(null);
              }}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-mono font-medium whitespace-nowrap transition-all flex items-center shrink-0 active:scale-95 ${
                selectedQuestionIndex === idx
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Question {idx + 1}: {q.topic}
            </button>
          ))}
        </div>

        {/* Examiner Question Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
              External Examiner’s Prompt
            </span>
            <span className="text-xs font-mono text-slate-400">Marks: 10.0</span>
          </div>

          <h3 className="text-base sm:text-lg font-serif font-bold text-slate-100 leading-relaxed">
            "{currentQ.question}"
          </h3>

          <div className="space-y-2">
            <label className="text-xs font-mono text-slate-400 uppercase block">
              Your Oral Response (Type your spoken explanation):
            </label>
            <textarea
              value={studentAnswer}
              onChange={(e) => setStudentAnswer(e.target.value)}
              placeholder="State your answer as you would present it to a university oral examination board..."
              rows={6}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 sm:p-4 text-xs sm:text-sm text-slate-100 focus:outline-none focus:border-teal-500 font-sans leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              onClick={() => {
                setStudentAnswer('');
                setEvaluation(null);
              }}
              className="min-h-[44px] px-3 text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 font-mono active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              onClick={handleEvaluate}
              disabled={!studentAnswer.trim() || loading}
              className="min-h-[44px] px-5 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Evaluating...' : 'Submit to Examiner'}</span>
            </button>
          </div>
        </div>

        {/* Evaluation Rubric Card */}
        {evaluation && (
          <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-teal-400" />
                <h4 className="text-base font-bold font-serif text-slate-100">Examiner’s Formal Assessment</h4>
              </div>

              {/* Score Badge */}
              <div className="flex items-center gap-2 bg-slate-950 px-4 py-1.5 rounded-xl border border-teal-500/40">
                <span className="text-xs font-mono text-slate-400">Score:</span>
                <span className="text-xl font-mono font-bold text-teal-300">
                  {evaluation.score} <span className="text-xs text-slate-500">/ 10</span>
                </span>
              </div>
            </div>

            {/* Rubric Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 uppercase block mb-1">Concept Correctness</span>
                <span
                  className={`font-bold text-sm ${
                    evaluation.conceptStatus === 'Correct'
                      ? 'text-emerald-400'
                      : evaluation.conceptStatus === 'Partially Correct'
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {evaluation.conceptStatus}
                </span>
                <p className="text-slate-300 text-xs mt-1 font-sans">{evaluation.conceptFeedback}</p>
              </div>

              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-slate-500 uppercase block mb-1">Depth & Scientific Rigor</span>
                <span className="text-cyan-300 font-bold text-sm">{evaluation.explanationQuality}</span>
              </div>
            </div>

            {/* Missing Subtleties */}
            {evaluation.missingSubtleties && evaluation.missingSubtleties.length > 0 && (
              <div className="p-4 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1.5 text-xs">
                <span className="text-amber-400 font-mono font-bold uppercase flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>Subtleties Required for Full 10/10 Marks:</span>
                </span>
                <ul className="list-disc list-inside text-slate-300 space-y-1 font-sans">
                  {evaluation.missingSubtleties.map((sub, i) => (
                    <li key={i}>{sub}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Detailed Professor Verdict */}
            <div className="space-y-1.5 text-xs">
              <span className="text-teal-400 font-mono font-bold uppercase block">
                Professor’s Comprehensive Feedback:
              </span>
              <p className="text-slate-200 leading-relaxed font-sans bg-slate-950 p-4 rounded-xl border border-slate-800">
                {evaluation.detailedProfessorVerdict}
              </p>
            </div>

            {/* Probing Follow-Up Question */}
            {evaluation.followUpQuestion && (
              <div className="p-4 bg-teal-950/30 border border-teal-500/40 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-teal-300 text-xs font-mono font-bold uppercase">
                  <HelpCircle className="w-4 h-4" />
                  <span>Follow-Up Probe Question:</span>
                </div>
                <p className="text-sm font-serif font-bold text-slate-100 italic">
                  "{evaluation.followUpQuestion}"
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
