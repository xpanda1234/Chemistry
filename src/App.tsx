import React, { useState, useEffect } from 'react';
import {
  Menu,
  X,
  GraduationCap,
  Atom,
  Sparkles,
  MessageSquare,
  FlaskConical,
  TrendingUp,
  BookOpen,
  User,
  Award,
  CheckCircle2,
  Calculator,
  FileText,
  ChevronRight,
  BookMarked,
  Waves,
} from 'lucide-react';
import { AcademicLevel, Flashcard, StudentProgress, ChatMessage } from './types.ts';
import { DEFAULT_FLASHCARDS } from './data/chemistryKnowledge.ts';
import { Navigation } from './components/Navigation.tsx';
import { Chatboard } from './components/Chatboard.tsx';
import { AiAnswerPage } from './components/AiAnswerPage.tsx';
import { VirtualLab } from './components/VirtualLab.tsx';
import { SpectroscopyLab } from './components/SpectroscopyLab.tsx';
import { ClassroomSubjectView } from './components/ClassroomSubjectView.tsx';
import { VivaMode } from './components/VivaMode.tsx';
import { ChemistryCalculator } from './components/ChemistryCalculator.tsx';
import { ExamGenerator } from './components/ExamGenerator.tsx';
import { FlashcardsView } from './components/FlashcardsView.tsx';
import { DashboardView } from './components/DashboardView.tsx';

const ACADEMIC_LEVELS: AcademicLevel[] = [
  'Undergraduate (B.Sc. 1st/2nd Yr)',
  'Graduate (B.Sc. Final / B.S.)',
  'Postgraduate (M.Sc. Chemistry)',
  'Research Scholar',
];

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('chat');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [academicLevel, setAcademicLevel] = useState<AcademicLevel>('Graduate (B.Sc. Final / B.S.)');
  const [flashcards, setFlashcards] = useState<Flashcard[]>(DEFAULT_FLASHCARDS);
  const [initialChatPrompt, setInitialChatPrompt] = useState<string>('');
  const [selectedAnswerForPage, setSelectedAnswerForPage] = useState<ChatMessage | null>(null);
  const [recentChatMessages, setRecentChatMessages] = useState<ChatMessage[]>([]);

  const [studentProgress, setStudentProgress] = useState<StudentProgress>({
    topicMastery: {
      organic: 72,
      inorganic: 65,
      physical: 58,
      analytical: 48,
      spectroscopy: 42,
      quantum: 35,
      electrochemistry: 60,
      thermodynamics: 55,
      kinetics: 68,
      coordination: 62,
      biochemistry: 50,
      polymer: 30,
      environmental: 45,
      laboratory: 70,
      numerical: 52,
      mechanism: 75,
      structure_id: 40,
    },
    questionsCount: 16,
    topicsCompleted: ['SN1 / SN2 Kinetics', 'Crystal Field Splitting', 'Acid-Base Titration Curves', 'Thin-Layer Chromatography'],
    quizScores: [
      { id: 'q1', date: 'Yesterday', topic: 'Organic Chemistry', score: 8, total: 10 },
      { id: 'q2', date: '2 days ago', topic: 'Physical Chemistry', score: 7, total: 10 },
    ],
    weakTopics: [
      'Molecular Orbital Theory (Heteronuclear Diatomics CO/NO)',
      '13C-NMR DEPT-135 Phase Inversion Interpretation',
      'Clapeyron-Clausius Phase Boundary Calculations'
    ],
    streakDays: 4,
    examReadinessScore: 72,
  });

  // Sync progress from backend
  useEffect(() => {
    fetch('/api/progress')
      .then((res) => res.json())
      .then((data) => {
        if (data.progress) {
          setStudentProgress(data.progress);
        }
      })
      .catch((e) => console.warn('Progress sync:', e));
  }, []);

  const handleAddFlashcard = (card: Partial<Flashcard>) => {
    const fullCard: Flashcard = {
      id: `fc-${Date.now()}`,
      topic: card.topic || 'organic',
      front: card.front || 'New Chemistry Concept',
      back: card.back || 'Answer',
      explanation: card.explanation || '',
      difficulty: card.difficulty || 'medium',
    };

    setFlashcards((prev) => [fullCard, ...prev]);

    // Send to server
    fetch('/api/flashcards', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ card: fullCard }),
    }).catch((e) => console.warn('Flashcard sync error:', e));
  };

  const handleNavigateWithPrompt = (prompt: string) => {
    setInitialChatPrompt(prompt);
    setActiveTab('chat');
  };

  const handleOpenAnswerPage = (msg: ChatMessage) => {
    setSelectedAnswerForPage(msg);
    setActiveTab('ai-answer');
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 font-sans text-slate-100">
      {/* Desktop Sidebar Navigation */}
      <div className="hidden md:flex h-full shrink-0">
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex animate-fadeIn">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-4/5 max-w-xs h-full bg-slate-900 border-r border-slate-800 flex flex-col shadow-2xl">
            <Navigation
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
              }}
              onCloseDrawer={() => setMobileMenuOpen(false)}
              isMobileDrawer={true}
            />
          </div>
        </div>
      )}

      {/* Mobile Profile & Level Sheet / Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fadeIn">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setProfileModalOpen(false)}
          />
          <div className="relative z-10 w-full sm:max-w-md bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            {/* Sheet Handle for touch */}
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto sm:hidden" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-slate-100">Student Profile & Level</h3>
                  <p className="text-[11px] text-slate-400 font-mono">CHEMIA Academic Registry</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                aria-label="Close Profile"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Readiness</span>
                <span className="text-base font-mono font-bold text-teal-300">
                  {studentProgress.examReadinessScore}%
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Streak</span>
                <span className="text-base font-mono font-bold text-amber-300">
                  {studentProgress.streakDays} Days 🔥
                </span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 block">Questions</span>
                <span className="text-base font-mono font-bold text-slate-200">
                  {studentProgress.questionsCount}
                </span>
              </div>
            </div>

            {/* Academic Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider block">
                Select Academic Level:
              </label>
              <div className="space-y-1.5">
                {ACADEMIC_LEVELS.map((lvl) => {
                  const isSelected = academicLevel === lvl;
                  return (
                    <button
                      key={lvl}
                      onClick={() => {
                        setAcademicLevel(lvl);
                        setProfileModalOpen(false);
                      }}
                      className={`w-full min-h-[44px] px-3 py-2.5 rounded-xl text-xs font-medium text-left flex items-center justify-between transition-all ${
                        isSelected
                          ? 'bg-teal-600 text-white font-semibold shadow-md'
                          : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
                      }`}
                    >
                      <span>{lvl}</span>
                      {isSelected && <CheckCircle2 className="w-4 h-4 text-white shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-2 border-t border-slate-800 space-y-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold block">
                Quick Navigation
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setActiveTab('flashcards');
                    setProfileModalOpen(false);
                  }}
                  className="min-h-[44px] p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2"
                >
                  <BookMarked className="w-4 h-4 text-teal-400 shrink-0" />
                  <span className="truncate">Flashcards</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('exam');
                    setProfileModalOpen(false);
                  }}
                  className="min-h-[44px] p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2"
                >
                  <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                  <span className="truncate">Exam Papers</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('calculator');
                    setProfileModalOpen(false);
                  }}
                  className="min-h-[44px] p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2"
                >
                  <Calculator className="w-4 h-4 text-sky-400 shrink-0" />
                  <span className="truncate">Calculators</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('spectroscopy');
                    setProfileModalOpen(false);
                  }}
                  className="min-h-[44px] p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs text-slate-300 flex items-center gap-2"
                >
                  <Waves className="w-4 h-4 text-purple-400 shrink-0" />
                  <span className="truncate">Spectroscopy</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Top Header: [☰] CHEMIA [Profile] */}
        <header className="md:hidden flex items-center justify-between px-3 sm:px-4 py-2 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shrink-0 z-30">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 min-w-[44px] min-h-[44px] rounded-xl bg-slate-800/80 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 transition-all"
              aria-label="Open Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div
              onClick={() => setActiveTab('chat')}
              className="flex items-center gap-1.5 cursor-pointer select-none"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-serif font-black text-sm shadow-md">
                Ψ
              </div>
              <span className="font-serif font-black text-sm tracking-wide text-slate-100">
                CHEMIA
              </span>
              <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-teal-500/20 text-teal-300 font-bold">
                PRO
              </span>
            </div>
          </div>

          {/* Profile / Academic Level Button */}
          <button
            onClick={() => setProfileModalOpen(true)}
            className="min-h-[44px] px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 flex items-center gap-1.5 text-xs font-mono active:scale-95 transition-all"
            aria-label="Student Profile and Academic Level"
          >
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[11px] font-medium text-teal-300 max-w-[110px] truncate">
              {academicLevel.includes('(') ? academicLevel.split('(')[1].replace(')', '') : academicLevel}
            </span>
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          </button>
        </header>

        {/* Dynamic Tab Render Container */}
        <main className="flex-1 h-full min-h-0 overflow-hidden relative">
          {activeTab === 'chat' && (
            <Chatboard
              academicLevel={academicLevel}
              setAcademicLevel={setAcademicLevel}
              onAddFlashcard={handleAddFlashcard}
              onNavigateTab={setActiveTab}
              initialPrompt={initialChatPrompt}
              onClearInitialPrompt={() => setInitialChatPrompt('')}
              onOpenAnswerPage={handleOpenAnswerPage}
              onMessagesUpdated={setRecentChatMessages}
            />
          )}

          {activeTab === 'ai-answer' && (
            <AiAnswerPage
              answer={selectedAnswerForPage}
              academicLevel={academicLevel}
              setAcademicLevel={setAcademicLevel}
              onBackToChat={() => setActiveTab('chat')}
              onAskFollowUp={handleNavigateWithPrompt}
              onAddFlashcard={handleAddFlashcard}
              allRecentAnswers={recentChatMessages}
              onSelectAnswer={setSelectedAnswerForPage}
            />
          )}

          {activeTab === 'lab' && <VirtualLab />}

          {activeTab === 'spectroscopy' && <SpectroscopyLab />}

          {activeTab === 'classrooms' && (
            <ClassroomSubjectView onSelectTopicPrompt={handleNavigateWithPrompt} />
          )}

          {activeTab === 'viva' && <VivaMode academicLevel={academicLevel} />}

          {activeTab === 'calculator' && <ChemistryCalculator />}

          {activeTab === 'exam' && <ExamGenerator academicLevel={academicLevel} />}

          {activeTab === 'flashcards' && (
            <FlashcardsView cards={flashcards} onAddCard={handleAddFlashcard} />
          )}

          {activeTab === 'dashboard' && (
            <DashboardView
              progress={studentProgress}
              academicLevel={academicLevel}
              onNavigateTab={setActiveTab}
            />
          )}
        </main>

        {/* Fixed Mobile Bottom Navigation Bar (5 Items: Home, Ask AI, Practice, Lab, Me) */}
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/90 shadow-2xl safe-area-pb"
          aria-label="Mobile Navigation"
        >
          <div className="grid grid-cols-5 h-14 items-stretch px-1">
            {/* 1. Home (Dashboard) */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-all relative select-none active:scale-95 ${
                activeTab === 'dashboard'
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-current={activeTab === 'dashboard' ? 'page' : undefined}
            >
              {activeTab === 'dashboard' && (
                <div className="absolute top-0 w-8 h-0.5 bg-teal-400 rounded-full" />
              )}
              <TrendingUp className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-mono leading-none">Home</span>
            </button>

            {/* 2. Ask AI (Primary Chat) */}
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-all relative select-none active:scale-95 ${
                activeTab === 'chat'
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-current={activeTab === 'chat' ? 'page' : undefined}
            >
              {activeTab === 'chat' && (
                <div className="absolute top-0 w-8 h-0.5 bg-teal-400 rounded-full" />
              )}
              <div className="relative">
                <MessageSquare className="w-5 h-5 mb-0.5" />
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-teal-400 animate-ping" />
                <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-teal-400" />
              </div>
              <span className="text-[10px] font-mono leading-none">Ask AI</span>
            </button>

            {/* 3. Practice (Classrooms, Quizzes, Calculator) */}
            <button
              onClick={() => setActiveTab('classrooms')}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-all relative select-none active:scale-95 ${
                activeTab === 'classrooms' || activeTab === 'viva' || activeTab === 'calculator' || activeTab === 'exam'
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-current={activeTab === 'classrooms' ? 'page' : undefined}
            >
              {(activeTab === 'classrooms' || activeTab === 'viva' || activeTab === 'calculator' || activeTab === 'exam') && (
                <div className="absolute top-0 w-8 h-0.5 bg-teal-400 rounded-full" />
              )}
              <BookOpen className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-mono leading-none">Practice</span>
            </button>

            {/* 4. Lab (Virtual Lab & Spectroscopy) */}
            <button
              onClick={() => setActiveTab('lab')}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-all relative select-none active:scale-95 ${
                activeTab === 'lab' || activeTab === 'spectroscopy'
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              aria-current={activeTab === 'lab' ? 'page' : undefined}
            >
              {(activeTab === 'lab' || activeTab === 'spectroscopy') && (
                <div className="absolute top-0 w-8 h-0.5 bg-teal-400 rounded-full" />
              )}
              <FlaskConical className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-mono leading-none">Lab</span>
            </button>

            {/* 5. Me (Profile, Level & Progress) */}
            <button
              onClick={() => setProfileModalOpen(true)}
              className={`flex flex-col items-center justify-center min-h-[44px] transition-all relative select-none active:scale-95 ${
                profileModalOpen
                  ? 'text-teal-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {profileModalOpen && (
                <div className="absolute top-0 w-8 h-0.5 bg-teal-400 rounded-full" />
              )}
              <User className="w-5 h-5 mb-0.5" />
              <span className="text-[10px] font-mono leading-none">Me</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
}
