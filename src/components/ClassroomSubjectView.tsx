import React, { useState } from 'react';
import { BookOpen, Sparkles, ChevronRight, Atom, Layers, HelpCircle, ArrowRight } from 'lucide-react';
import { TOPIC_CURRICULUM } from '../data/chemistryKnowledge.ts';

interface ClassroomSubjectViewProps {
  onSelectTopicPrompt: (prompt: string) => void;
}

export const ClassroomSubjectView: React.FC<ClassroomSubjectViewProps> = ({ onSelectTopicPrompt }) => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('organic');

  const currentSubject = TOPIC_CURRICULUM.find((s) => s.id === selectedSubjectId) || TOPIC_CURRICULUM[0];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      <div className="max-w-5xl mx-auto w-full space-y-5">
        {/* Header */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 text-xl shrink-0">
              {currentSubject.icon}
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-100">
                {currentSubject.title} Classroom
              </h2>
              <p className="text-xs text-slate-400">
                Comprehensive university syllabus modules, reaction mechanisms, and foundational theorems
              </p>
            </div>
          </div>

          {/* Discipline Picker */}
          <div className="flex gap-2 overflow-x-auto touch-pan-x no-scrollbar pb-1 text-xs -mx-1 px-1">
            {TOPIC_CURRICULUM.map((s) => (
              <button
                key={s.id}
                onClick={() => setSelectedSubjectId(s.id)}
                className={`min-h-[44px] px-3.5 py-2 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 active:scale-95 ${
                  selectedSubjectId === s.id
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span>{s.icon}</span>
                <span>{s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Modules Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-mono font-bold text-teal-400 uppercase tracking-wider">
              Curriculum Core Modules ({currentSubject.modules.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">B.Sc. & M.Sc. Graduate Standard</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentSubject.modules.map((mod, idx) => (
              <div
                key={idx}
                className="p-5 bg-slate-900 border border-slate-800 hover:border-teal-500/40 rounded-2xl shadow-lg space-y-3 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-teal-400 font-bold">Module {idx + 1}</span>
                    <span className="text-slate-500">Graduate Unit</span>
                  </div>
                  <h4 className="text-sm font-semibold text-slate-100 font-sans leading-relaxed">{mod}</h4>
                </div>

                <button
                  onClick={() =>
                    onSelectTopicPrompt(
                      `Provide a comprehensive graduate lecture and mechanism for: "${mod}" in ${currentSubject.title}. Include the core theory, chemical equations, diagrams, and exam questions.`
                    )
                  }
                  className="w-full min-h-[44px] py-2.5 px-3 bg-slate-950 hover:bg-teal-950 hover:text-teal-300 text-slate-300 border border-slate-800 hover:border-teal-500/30 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all mt-2 active:scale-95"
                >
                  <Sparkles className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>Consult Professor on this Module</span>
                  <ArrowRight className="w-3.5 h-3.5 shrink-0" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
