import React, { useState } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  HelpCircle,
  Printer,
} from 'lucide-react';
import { UNIVERSITY_EXAM_BSC } from '../data/chemistryKnowledge.ts';
import { ExamPaper, AcademicLevel } from '../types.ts';
import { MathRenderer } from './MathRenderer.tsx';

interface ExamGeneratorProps {
  academicLevel: AcademicLevel;
}

export const ExamGenerator: React.FC<ExamGeneratorProps> = ({ academicLevel }) => {
  const [examPaper, setExamPaper] = useState<ExamPaper>(UNIVERSITY_EXAM_BSC);
  const [loading, setLoading] = useState(false);
  const [expandedSolutions, setExpandedSolutions] = useState<Record<string, boolean>>({});
  const [selectedDiscipline, setSelectedDiscipline] = useState('Organic & Physical Chemistry');

  const toggleSolution = (qId: string) => {
    setExpandedSolutions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const handleGenerateExam = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/exam/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ level: academicLevel, subject: selectedDiscipline }),
      });
      const data = await response.json();
      if (data.exam && data.exam.sections) {
        setExamPaper(data.exam);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      <div className="max-w-4xl mx-auto w-full space-y-5">
        {/* Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-100">
                University Examination Paper Generator
              </h2>
              <p className="text-xs text-slate-400">
                Official university format • Sectioned mark distributions • Full marking scheme & model answers
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print / PDF</span>
            </button>
            <button
              onClick={handleGenerateExam}
              disabled={loading}
              className="min-h-[44px] px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              <span>{loading ? 'Generating Exam...' : 'Generate Paper'}</span>
            </button>
          </div>
        </div>

        {/* Exam Paper Sheet */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6 font-sans">
          {/* Header Title Block */}
          <div className="text-center border-b border-slate-800 pb-5 space-y-2">
            <span className="text-xs font-mono text-teal-400 uppercase tracking-widest block font-bold">
              CHEMIA UNIVERSITY CHEMISTRY BOARD
            </span>
            <h3 className="text-lg sm:text-xl font-serif font-bold text-slate-100">
              {examPaper.title}
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-slate-400 pt-1">
              <span>Time Allowed: {examPaper.durationMinutes} Minutes (3 Hours)</span>
              <span>•</span>
              <span>Maximum Marks: {examPaper.totalMarks}</span>
              <span>•</span>
              <span>Level: {academicLevel}</span>
            </div>
          </div>

          {/* Instructions Box */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-1.5 text-xs">
            <span className="text-slate-400 font-mono uppercase text-[11px] block font-bold">
              General Examination Instructions:
            </span>
            <ul className="list-disc list-inside text-slate-300 space-y-1">
              {examPaper.instructions.map((ins, i) => (
                <li key={i}>{ins}</li>
              ))}
            </ul>
          </div>

          {/* Sections List */}
          <div className="space-y-8">
            {examPaper.sections.map((section, sIdx) => (
              <div key={sIdx} className="space-y-4">
                <div className="border-b border-slate-800 pb-2">
                  <h4 className="text-sm sm:text-base font-bold text-teal-300 font-serif">
                    {section.sectionName}
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">{section.description}</p>
                </div>

                <div className="space-y-4">
                  {section.questions.map((q) => (
                    <div
                      key={q.id}
                      className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-2.5">
                          <span className="font-mono font-bold text-teal-400 text-xs shrink-0 mt-0.5">
                            {q.qNumber}.
                          </span>
                          <p className="text-sm text-slate-200 leading-relaxed font-sans">{q.text}</p>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-300 bg-slate-900 px-2.5 py-1 rounded border border-slate-800 shrink-0">
                          [{q.marks} {q.marks === 1 ? 'Mark' : 'Marks'}]
                        </span>
                      </div>

                      {/* Toggle Marking Scheme & Model Answer */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        <button
                          onClick={() => toggleSolution(q.id)}
                          className="text-xs text-teal-400 hover:text-teal-300 flex items-center gap-1 font-mono font-medium"
                        >
                          {expandedSolutions[q.id] ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                          {expandedSolutions[q.id] ? 'Hide Marking Scheme & Answer' : 'View Marking Scheme & Model Answer'}
                        </button>
                        <span className="text-[10px] font-mono text-slate-500 uppercase">{q.type}</span>
                      </div>

                      {expandedSolutions[q.id] && (
                        <div className="p-4 bg-slate-900 border border-teal-500/20 rounded-lg space-y-3 text-xs animate-fadeIn">
                          {/* Marking Scheme */}
                          <div className="p-2.5 bg-amber-950/30 border border-amber-500/20 rounded text-amber-200">
                            <strong className="block font-mono uppercase text-[10px] text-amber-400 mb-1">
                              Examiner’s Marking Scheme:
                            </strong>
                            <p className="font-sans">{q.markingScheme}</p>
                          </div>

                          {/* Model Answer */}
                          <div className="space-y-1">
                            <strong className="block font-mono uppercase text-[10px] text-teal-400">
                              Full Model Answer:
                            </strong>
                            <p className="text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-950 p-3 rounded border border-slate-800">
                              {q.modelAnswer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
