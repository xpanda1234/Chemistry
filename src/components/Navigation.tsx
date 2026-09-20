import React from 'react';
import {
  MessageSquare,
  FlaskConical,
  Waves,
  BookOpen,
  GraduationCap,
  Calculator,
  FileText,
  BookMarked,
  TrendingUp,
  Atom,
  ShieldCheck,
  Settings as SettingsIcon,
  Library,
  Sparkles,
  ClipboardList,
  CheckCircle2,
  X,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCloseDrawer?: () => void;
  isMobileDrawer?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  onCloseDrawer,
  isMobileDrawer = false,
}) => {
  const navSections = [
    {
      title: 'Teaching & AI',
      items: [
        { id: 'chat', label: 'AI Chemistry Tutor', icon: MessageSquare, badge: '24/7 AI' },
        { id: 'ai-answer', label: 'AI Answer Page', icon: Sparkles, badge: 'Full Page' },
        { id: 'dashboard', label: 'Dashboard', icon: TrendingUp },
        { id: 'classrooms', label: 'Subjects & Classrooms', icon: BookOpen },
        { id: 'lessons', label: 'Lessons & Curriculum', icon: Library },
      ],
    },
    {
      title: 'Practice & Examination',
      items: [
        { id: 'calculator', label: 'Practice & Numerical Solver', icon: Calculator, badge: 'KaTeX' },
        { id: 'viva', label: 'Quizzes & Viva Voce', icon: GraduationCap, badge: 'Oral' },
        { id: 'flashcards', label: 'Flashcards', icon: BookMarked, badge: 'SRS' },
        { id: 'exam', label: 'Study Plan & University Exams', icon: FileText },
        { id: 'notes', label: 'Study Notes & Cheat-sheets', icon: ClipboardList },
      ],
    },
    {
      title: 'Virtual Laboratories',
      items: [
        { id: 'lab', label: 'Virtual Laboratory', icon: FlaskConical, badge: 'Buret/TLC' },
        { id: 'spectroscopy', label: 'Spectroscopy Lab', icon: Waves, badge: 'IR/NMR' },
      ],
    },
    {
      title: 'System & Tracking',
      items: [
        { id: 'progress', label: 'Progress & Mastery', icon: CheckCircle2 },
        { id: 'settings', label: 'Curriculum Settings', icon: SettingsIcon },
      ],
    },
  ];

  const handleItemClick = (id: string) => {
    // Map aliases
    let target = id;
    if (id === 'lessons') target = 'classrooms';
    if (id === 'progress') target = 'dashboard';
    setActiveTab(target);
    if (onCloseDrawer) {
      onCloseDrawer();
    }
  };

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 select-none ${
        isMobileDrawer ? 'w-full h-full' : 'w-64 h-full'
      }`}
    >
      {/* Brand Header */}
      <div className="p-4 sm:p-5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-serif font-black text-xl shadow-lg shadow-teal-950/40 shrink-0">
            Ψ
          </div>
          <div>
            <h1 className="font-serif font-black text-base tracking-wide text-slate-100 flex items-center gap-1.5">
              <span>CHEMIA</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 font-bold">
                PRO
              </span>
            </h1>
            <p className="text-[10px] text-slate-400 font-mono tracking-tight">Graduate Chemistry AI Classroom</p>
          </div>
        </div>

        {isMobileDrawer && onCloseDrawer && (
          <button
            onClick={onCloseDrawer}
            aria-label="Close menu"
            className="p-2 min-w-[44px] min-h-[44px] rounded-lg bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Navigation Links with >=44px touch targets */}
      <nav className="flex-1 p-3 sm:p-4 space-y-4 overflow-y-auto overscroll-contain">
        {navSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-1">
            <div className="px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive =
                activeTab === item.id ||
                (item.id === 'lessons' && activeTab === 'classrooms') ||
                (item.id === 'progress' && activeTab === 'dashboard');

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full min-h-[44px] flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-950/40 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 active:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        isActive
                          ? 'bg-teal-700 text-teal-100'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Footer Status & Safety Certification */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/70 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="font-mono text-[11px] text-slate-300">Senior Professor 24/7 Live</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-teal-400 shrink-0" />
          <span>ACS & OSHA Chemical Safety Calibrated</span>
        </div>
      </div>
    </aside>
  );
};

