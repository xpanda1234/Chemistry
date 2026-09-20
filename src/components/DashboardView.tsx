import React from 'react';
import {
  TrendingUp,
  Award,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
} from 'lucide-react';
import { StudentProgress, AcademicLevel } from '../types.ts';

interface DashboardViewProps {
  progress: StudentProgress;
  academicLevel: AcademicLevel;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ progress, academicLevel, onNavigateTab }) => {
  const topics = [
    { key: 'organic', label: 'Organic Chemistry', color: 'from-emerald-500 to-teal-600', icon: '🧪' },
    { key: 'inorganic', label: 'Inorganic Chemistry', color: 'from-blue-500 to-indigo-600', icon: '🔷' },
    { key: 'physical', label: 'Physical Chemistry', color: 'from-amber-500 to-orange-600', icon: '⚛️' },
    { key: 'analytical', label: 'Analytical & Instrumental', color: 'from-purple-500 to-pink-600', icon: '🔬' },
    { key: 'spectroscopy', label: 'Spectroscopy Lab', color: 'from-cyan-500 to-blue-600', icon: '📈' },
    { key: 'quantum', label: 'Quantum Chemistry', color: 'from-rose-500 to-red-600', icon: '🌌' },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6">
      <div className="max-w-5xl mx-auto w-full space-y-5">
        {/* Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shrink-0">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-serif text-lg md:text-xl font-bold text-slate-100">
                Academic Progress & Mastery Dashboard
              </h2>
              <p className="text-xs text-slate-400">
                Continuous competency tracking across graduate chemistry disciplines
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-amber-300 text-xs font-mono">
              <Flame className="w-4 h-4 text-amber-400" />
              <span>{progress.streakDays} Day Streak</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 border border-teal-500/30 rounded-xl text-teal-300 text-xs font-mono font-bold">
              <Award className="w-4 h-4 text-teal-400" />
              <span>Readiness: {progress.examReadinessScore}%</span>
            </div>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Questions Consulted</span>
            <p className="text-2xl font-mono font-bold text-slate-100">{progress.questionsCount}</p>
            <span className="text-[10px] text-teal-400">Pedagogical consultations</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Exam Readiness</span>
            <p className="text-2xl font-mono font-bold text-teal-300">{progress.examReadinessScore}%</p>
            <span className="text-[10px] text-slate-400">Based on B.Sc. rubric</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Topics Mastered</span>
            <p className="text-2xl font-mono font-bold text-cyan-300">{progress.topicsCompleted.length}</p>
            <span className="text-[10px] text-slate-400">Core curricular units</span>
          </div>

          <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[11px] font-mono text-slate-400 uppercase">Academic Level</span>
            <p className="text-sm font-serif font-bold text-slate-100 truncate">{academicLevel}</p>
            <span className="text-[10px] text-amber-400">Active Syllabus</span>
          </div>
        </div>

        {/* Subject Mastery Progress Bars */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <h3 className="text-base font-serif font-bold text-slate-100 border-b border-slate-800 pb-3">
            Discipline Mastery Scores
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((t) => {
              const val = (progress.topicMastery as any)[t.key] || 50;
              return (
                <div key={t.key} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 font-medium text-slate-200">
                      <span>{t.icon}</span>
                      <span>{t.label}</span>
                    </span>
                    <span className="font-mono font-bold text-teal-400">{val}%</span>
                  </div>

                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${t.color} transition-all duration-500`}
                      style={{ width: `${val}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Weak Topics & Recommendations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Weak Topics */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-rose-400 font-mono text-xs font-bold uppercase">
              <AlertTriangle className="w-4 h-4" />
              <span>Identified Focus & Weak Areas</span>
            </div>
            <div className="space-y-2">
              {progress.weakTopics.map((w, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between text-xs"
                >
                  <span className="text-slate-300">{w}</span>
                  <button
                    onClick={() => onNavigateTab('chat')}
                    className="min-h-[44px] px-3 text-teal-400 hover:text-teal-300 font-mono flex items-center gap-1 shrink-0 ml-2 active:scale-95"
                  >
                    <span>Practice</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Action Pathways */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-xl">
            <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-bold uppercase">
              <BookOpen className="w-4 h-4" />
              <span>Recommended Study Modules</span>
            </div>
            <div className="space-y-2.5">
              <button
                onClick={() => onNavigateTab('lab')}
                className="w-full min-h-[48px] p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-left transition-all active:scale-[0.99]"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">Potentiometric Titration Practicum</span>
                  <span className="text-slate-400 text-[11px]">Virtual Lab • Analytical Chemistry</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
              </button>

              <button
                onClick={() => onNavigateTab('spectroscopy')}
                className="w-full min-h-[48px] p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-left transition-all active:scale-[0.99]"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">1H-NMR Spin-Spin Splitting Lab</span>
                  <span className="text-slate-400 text-[11px]">Spectroscopy Lab • Instrumental Analysis</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
              </button>

              <button
                onClick={() => onNavigateTab('exam')}
                className="w-full min-h-[48px] p-3.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-left transition-all active:scale-[0.99]"
              >
                <div>
                  <span className="font-semibold text-slate-200 block">Mock University Examination Paper</span>
                  <span className="text-slate-400 text-[11px]">3 Hours • Complete Marking Scheme</span>
                </div>
                <ChevronRight className="w-4 h-4 text-teal-400 shrink-0 ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
