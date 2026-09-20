import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  BookOpen,
  GraduationCap,
  Atom,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Zap,
  Flame,
  ShieldAlert,
  ArrowRight,
  BookMarked,
  CheckCircle2,
  Check,
  Clock,
  Download,
  Share2,
  BookmarkPlus,
  Compass,
  Paperclip,
  X,
  FileText,
  Layers,
  ListChecks,
  PlusCircle,
  TrendingDown,
  Maximize2,
} from 'lucide-react';
import { ChatMessage, AnswerMode, AcademicLevel, StructuredProfessorAnswer, Flashcard, DiagramPayload } from '../types.ts';
import { MathRenderer } from './MathRenderer.tsx';
import { InteractiveDiagram } from './InteractiveDiagram.tsx';

interface ChatboardProps {
  onAddFlashcard?: (card: Partial<Flashcard>) => void;
  academicLevel: AcademicLevel;
  setAcademicLevel: (level: AcademicLevel) => void;
  onNavigateTab?: (tab: string) => void;
  initialPrompt?: string;
  onClearInitialPrompt?: () => void;
  onOpenAnswerPage?: (message: ChatMessage) => void;
  onMessagesUpdated?: (messages: ChatMessage[]) => void;
}

const resolveEffectiveDiagram = (structured?: StructuredProfessorAnswer, promptText?: string): DiagramPayload => {
  if (structured?.diagram && structured.diagram.type) {
    return structured.diagram;
  }
  const text = (promptText || structured?.conceptSummary || structured?.detailedExplanation || '').toLowerCase();
  const topic = (structured?.topic || '').toLowerCase();

  if (text.includes('nmr') || text.includes('ftir') || text.includes('infrared') || text.includes('spectroscop') || topic === 'spectroscopy') {
    return {
      type: 'spectroscopy',
      title: 'Diagnostic Combined FTIR & 1H-NMR Spectrum',
      data: {},
    };
  }
  if (text.includes('nernst') || text.includes('galvanic') || text.includes('daniell') || text.includes('redox') || text.includes('half-cell') || text.includes('cell potential') || topic === 'electrochemistry') {
    return {
      type: 'galvanic',
      title: 'Galvanic (Voltaic) Daniell Cell & Electron Flow',
      data: {},
    };
  }
  if (text.includes('orbital') || text.includes('homo') || text.includes('lumo') || text.includes('paramagnet') || text.includes('bond order') || text.includes('mo theory') || text.includes('mo diagram') || topic === 'quantum') {
    return {
      type: 'mo',
      title: 'Molecular Orbital (MO) Energy Level Diagram',
      data: {},
    };
  }
  if (text.includes('crystal field') || text.includes('cft') || text.includes('octahedral') || text.includes('tetrahedral') || text.includes('coordination') || topic === 'coordination' || topic === 'inorganic') {
    return {
      type: 'cft',
      title: 'Crystal Field Theory (CFT) d-Orbital Splitting',
      data: {},
    };
  }
  if (text.includes('titrat') || text.includes('buffer') || text.includes('ph ') || text.includes('neutraliz') || topic === 'analytical') {
    return {
      type: 'titration',
      title: 'Acid-Base Titration & Neutralization Curve',
      data: {},
    };
  }
  if (structured?.mechanismSteps && structured.mechanismSteps.length > 0) {
    return {
      type: 'mechanism',
      title: 'Organic Reaction Mechanism & Electron Flow',
      data: {},
    };
  }
  return {
    type: 'energy',
    title: 'Reaction Coordinate & Activation Energy Profile',
    data: {},
  };
};

export const Chatboard: React.FC<ChatboardProps> = ({
  onAddFlashcard,
  academicLevel,
  setAcademicLevel,
  onNavigateTab,
  initialPrompt,
  onClearInitialPrompt,
  onOpenAnswerPage,
  onMessagesUpdated,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<AnswerMode>('learn');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [savedCardNotice, setSavedCardNotice] = useState<string | null>(null);
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [isHistoryDrawerOpen, setIsHistoryDrawerOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    if (messages.length > 0 && onMessagesUpdated) {
      onMessagesUpdated(messages);
    }
  }, [messages, onMessagesUpdated]);

  // Initial welcome message from the Senior Professor
  useEffect(() => {
    if (messages.length === 0) {
      const welcomeMessage: ChatMessage = {
        id: 'msg-welcome',
        sender: 'professor',
        text: 'Welcome to CHEMIA. I am your Senior Professor of Chemistry.',
        timestamp: 'Just now',
        mode: 'learn',
        structured: {
          topic: 'organic',
          topicLabel: 'Graduate Chemistry Classroom',
          level: academicLevel,
          questionType: 'Conceptual Theory',
          conceptSummary:
            'Welcome to CHEMIA — your university chemistry professor and computational laboratory mentor available 24/7.',
          coreTheory:
            'Chemistry at the undergraduate and graduate level connects atomic orbital overlap (HOMO/LUMO), classical thermodynamics (ΔG = ΔH - TΔS), kinetic reaction pathways, and spectroscopic characterization (NMR, FTIR, MS).',
          detailedExplanation:
            'Ask me any question in Organic, Physical, Inorganic, Analytical, or Quantum Chemistry. Every explanation provides structured progressive depth: core concepts, rigorous physical foundations, reaction mechanisms with curved electron arrows, interactive diagrams, numerical calculations with units checking, practice problems, and university exam marking schemes.',
          chemicalEquationLatex:
            '\\Delta G^\\circ = -RT \\ln K = \\Delta H^\\circ - T\\Delta S^\\circ, \\quad \\hat{H}\\Psi = E\\Psi',
          diagram: {
            type: 'mechanism',
            title: 'Interactive Reaction Mechanism & Energy Profile',
            data: {},
          },
          workedExample:
            'For example: ask "Explain the mechanism of SN1 vs SN2", "Why does benzene resist addition?", "Explain Crystal Field Theory for octahedral complexes", or "Calculate the pH of 0.050 M acetic acid".',
          application:
            'Academic coursework preparation, competitive graduate entrance exams, university lab preparation, and chemical research design.',
          practiceQuestion:
            'What branch of chemistry would you like to explore today? Select a mode above (Quick, Learn, Deep Dive, Exam, or Research) to tailor my pedagogical depth.',
          sources: ["Atkins' Physical Chemistry, 11th Ed.", "March's Advanced Organic Chemistry, 8th Ed."],
          safetyWarnings: [
            'All virtual lab simulations and experimental protocols enforce standard ACS and OSHA chemical safety guidelines.',
          ],
        },
      };
      setMessages([welcomeMessage]);
    }
  }, [academicLevel]);

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt.trim();
    if (!text || loading) return;

    const userMessage: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      mode: selectedMode,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!promptToSend) setInputPrompt('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          mode: selectedMode,
          level: academicLevel,
          history: messages.slice(-4),
        }),
      });

      const data = await response.json();

      if (data.structured) {
        const profMessage: ChatMessage = {
          id: `msg-prof-${Date.now()}`,
          sender: 'professor',
          text: data.structured.conceptSummary || 'Professor Analysis Complete',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          mode: selectedMode,
          structured: data.structured,
          note: data.note,
        };
        setMessages((prev) => [...prev, profMessage]);
      } else {
        throw new Error(data.error || 'Failed to receive response');
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `msg-error-${Date.now()}`,
        sender: 'professor',
        text: `Error: ${err.message}. Please check your connection and try again.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPrompt && initialPrompt.trim().length > 0) {
      setInputPrompt(initialPrompt);
      handleSendMessage(initialPrompt);
      if (onClearInitialPrompt) {
        onClearInitialPrompt();
      }
    }
  }, [initialPrompt]);

  const handleAction = async (msgId: string, action: string, msg: ChatMessage) => {
    setActionLoadingId(`${msgId}-${action}`);
    try {
      const response = await fetch('/api/chat/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          currentTopic: msg.structured?.topic,
          currentConcept: msg.structured?.conceptSummary,
          originalAnswer: msg.structured,
        }),
      });

      const data = await response.json();

      if (action === 'make_simple' && data.text) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, simplifiedVersion: data.text, isSimplified: !m.isSimplified } : m
          )
        );
      } else if (action === 'explain_more' && data.text) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId ? { ...m, expandedDetails: data.text, isExpanded: !m.isExpanded } : m
          )
        );
      } else if (action === 'compare' && data.comparison) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === msgId && m.structured
              ? {
                  ...m,
                  structured: {
                    ...m.structured,
                    comparisonTable: data.comparison,
                  },
                }
              : m
          )
        );
      } else if (action === 'flashcard' && msg.structured) {
        const newCard: Partial<Flashcard> = {
          topic: msg.structured.topic,
          front: msg.text || msg.structured.conceptSummary,
          back: msg.structured.coreTheory.slice(0, 160) + '...',
          explanation: msg.structured.detailedExplanation,
          difficulty: 'medium',
        };
        onAddFlashcard?.(newCard);
        setSavedCardNotice('Card added to your Chemistry Flashcards deck!');
        setTimeout(() => setSavedCardNotice(null), 3000);
      } else if (action === 'quiz_me') {
        handleSendMessage(`Quiz me on ${msg.structured?.topicLabel || 'this concept'} with a graduate-level question.`);
      } else if (action === 'practice_problem') {
        handleSendMessage(`Give me a numerical or mechanistic practice problem for ${msg.structured?.topicLabel || 'this concept'}.`);
      } else if (action === 'exam_answer') {
        handleSendMessage(`Provide the university examination marking scheme answer for: "${msg.text}".`);
      } else if (action === 'summarize') {
        handleSendMessage(`Provide a high-yield executive summary, key formulas, and boundary rules for: "${msg.text || msg.structured?.topicLabel}".`);
      } else if (action === 'mechanism') {
        handleSendMessage(`Provide the detailed step-by-step reaction mechanism with curved arrows, intermediates, and stereochemical outcome for: "${msg.text}".`);
      } else if (action === 'diagram') {
        handleSendMessage(`Generate an interactive chemical diagram and molecular orbital visualizer for: "${msg.text}".`);
      } else if (action === 'example') {
        handleSendMessage(`Provide a concrete worked university examination problem with step-by-step calculations for: "${msg.text || msg.structured?.topicLabel}".`);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoadingId(null);
    }
  };

  const samplePrompts = [
    'Explain the mechanism of SN1 vs SN2 with curved arrows and stereochemistry',
    'Why does benzene undergo electrophilic substitution rather than addition?',
    'Explain Crystal Field Theory (CFT) and calculate CFSE for octahedral d6',
    'What is entropy and how is it defined thermodynamically?',
    'Calculate the pH of 0.050 M acetic acid (Ka = 1.8 × 10⁻⁵)',
    'Explain 1H-NMR spin-spin splitting and the (n+1) rule',
  ];

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 relative">
      {/* Top Banner & Mode Bar */}
      <div className="bg-slate-900/90 border-b border-slate-800/80 px-4 py-3 shrink-0 backdrop-blur-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Left: Academic Level & Persona */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300 shadow-sm">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-base md:text-lg font-bold text-slate-100">
                  Professor’s Interactive Chatboard
                </h2>
                <span className="flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                  Active Office Hours
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Rigorous B.Sc./M.Sc. pedagogy • KaTeX mathematical formulas • Interactive mechanisms
              </p>
            </div>
          </div>

          {/* Right: Academic Level Picker & Mode Tabs */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1.5 rounded-lg border border-slate-800">
              <span className="text-slate-400 text-[11px]">Level:</span>
              <select
                value={academicLevel}
                onChange={(e) => setAcademicLevel(e.target.value as AcademicLevel)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="Undergraduate (B.Sc. 1st/2nd Yr)">B.Sc. Undergraduate</option>
                <option value="Graduate (B.Sc. Final / B.S.)">Graduate (B.Sc. Final)</option>
                <option value="Postgraduate (M.Sc. Chemistry)">Postgraduate (M.Sc.)</option>
                <option value="Research Scholar">Research Scholar / Ph.D.</option>
              </select>
            </div>

            {/* Answer Mode Buttons */}
            <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 overflow-x-auto max-w-full">
              {(
                [
                  { id: 'quick', label: '⚡ Quick', title: 'High-yield concise definition' },
                  { id: 'learn', label: '📚 Learn', title: 'Step-by-step progressive disclosure' },
                  { id: 'deep_dive', label: '🔬 Deep Dive', title: 'Orbital symmetry & thermodynamic rigor' },
                  { id: 'exam', label: '📝 Exam', title: 'University marking scheme with marks' },
                  { id: 'research', label: '🧪 Research', title: 'Literature sources and boundary conditions' },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setSelectedMode(mode.id)}
                  title={mode.title}
                  className={`min-h-[36px] px-2.5 py-1 rounded-md transition-all font-medium text-xs whitespace-nowrap ${
                    selectedMode === mode.id
                      ? 'bg-teal-600 text-white shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>

            {/* Chat History Button */}
            <button
              onClick={() => setIsHistoryDrawerOpen(true)}
              className="min-h-[38px] px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white rounded-lg border border-slate-800 flex items-center gap-1.5 text-xs font-mono transition-all ml-auto md:ml-0"
              title="View Inquiries History"
              aria-label="View Inquiries History"
            >
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span>History</span>
              <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-teal-300 font-bold">
                {messages.filter((m) => m.sender === 'user').length}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Floating Save Notice */}
      {savedCardNotice && (
        <div className="fixed top-20 right-6 z-50 bg-emerald-950/90 border border-emerald-500/30 text-emerald-200 px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 text-xs font-medium animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {savedCardNotice}
        </div>
      )}

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((msg) => (
            <div key={msg.id} className="space-y-3">
              {msg.sender === 'user' ? (
                /* User Question Bubble */
                <div className="flex justify-end">
                  <div className="max-w-xl bg-teal-600/90 text-white px-5 py-3 rounded-2xl rounded-tr-none shadow-md border border-teal-500/30">
                    <p className="text-sm sm:text-base leading-relaxed font-sans">{msg.text}</p>
                    <div className="flex items-center justify-end gap-2 mt-1.5 text-[11px] text-teal-200 font-mono">
                      <span>{msg.mode?.toUpperCase()}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Professor Answer Card (Pedagogical Progressive Architecture) */
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 md:p-7 shadow-xl space-y-5 relative">
                  {/* Header Badge Row */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-serif font-bold text-sm">
                        Ψ
                      </div>
                      <span className="font-serif font-bold text-slate-100 text-sm md:text-base">
                        Senior Professor’s Evaluation
                      </span>
                      {msg.structured?.topicLabel && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-400 text-xs font-mono border border-slate-700">
                          {msg.structured.topicLabel}
                        </span>
                      )}
                      {msg.structured?.questionType && (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-300 text-xs font-mono border border-slate-700">
                          {msg.structured.questionType}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono">{msg.timestamp}</span>
                      {onOpenAnswerPage && (
                        <button
                          onClick={() => onOpenAnswerPage(msg)}
                          className="min-h-[32px] px-2.5 py-1 rounded-lg bg-teal-500/20 hover:bg-teal-500/30 text-teal-300 border border-teal-500/40 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
                          title="Render this answer as a full scholarly lecture page"
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Full Page View</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Informative engine status note if present */}
                  {msg.note && (
                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
                      <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                      <span>{msg.note}</span>
                    </div>
                  )}

                  {/* Progressive Section 1: Concept Summary */}
                  {msg.structured?.conceptSummary && (
                    <div className="p-4 bg-teal-950/30 border-l-4 border-teal-500 rounded-r-xl">
                      <div className="flex items-center gap-1.5 text-teal-400 font-semibold text-xs tracking-wider uppercase mb-1 font-mono">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Step 1: Foundational Concept</span>
                      </div>
                      <p className="text-sm md:text-base text-slate-200 leading-relaxed font-sans">
                        {msg.structured.conceptSummary}
                      </p>
                    </div>
                  )}

                  {/* Simplified Version (if toggled via Make Simple) */}
                  {msg.isSimplified && msg.simplifiedVersion && (
                    <div className="p-4 bg-amber-950/30 border border-amber-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-xs uppercase tracking-wider font-mono">
                        <Zap className="w-3.5 h-3.5" />
                        <span>Simplified Intuitive Explanation</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                        {msg.simplifiedVersion}
                      </p>
                    </div>
                  )}

                  {/* Progressive Section 2: Core Theory */}
                  {msg.structured?.coreTheory && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <Atom className="w-3.5 h-3.5 text-teal-400" />
                        <span>Step 2: Core Theory & Physical Principles</span>
                      </h4>
                      <p className="text-sm md:text-base text-slate-300 leading-relaxed font-sans">
                        {msg.structured.coreTheory}
                      </p>
                    </div>
                  )}

                  {/* Progressive Section 3: Detailed Explanation */}
                  {msg.structured?.detailedExplanation && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                        <span>Step 3: Detailed Mechanistic / Theoretical Analysis</span>
                      </h4>
                      <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line font-sans">
                        {msg.structured.detailedExplanation}
                      </p>
                    </div>
                  )}

                  {/* Expanded Graduate Deep Dive (if toggled via Explain More) */}
                  {msg.isExpanded && msg.expandedDetails && (
                    <div className="p-4 bg-indigo-950/30 border border-indigo-500/30 rounded-xl space-y-2">
                      <div className="flex items-center gap-1.5 text-indigo-300 font-semibold text-xs uppercase tracking-wider font-mono">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Postgraduate / Research Deep Dive</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-sans">
                        {msg.expandedDetails}
                      </p>
                    </div>
                  )}

                  {/* Progressive Section 4: Balanced Chemical Equation / LaTeX */}
                  {msg.structured?.chemicalEquationLatex && (
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center">
                      <span className="block text-[11px] font-mono text-slate-400 uppercase mb-2">
                        Governing Chemical Equation / Thermodynamic Relation
                      </span>
                      <MathRenderer latex={msg.structured.chemicalEquationLatex} className="text-base sm:text-lg text-teal-200" />
                    </div>
                  )}

                  {/* Progressive Section 5: Interactive Diagram & Visualizer */}
                  {msg.structured && (
                    <div className="space-y-2">
                      <InteractiveDiagram
                        diagram={resolveEffectiveDiagram(msg.structured, msg.text)}
                        mechanismSteps={msg.structured.mechanismSteps}
                        topic={msg.structured.topic}
                      />
                    </div>
                  )}

                  {/* Comparison Table (if loaded via Compare Concepts) */}
                  {msg.structured?.comparisonTable && (
                    <div className="border border-slate-800 rounded-xl bg-slate-950 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-mono font-bold text-teal-400 uppercase">
                          Comparative Analysis: {msg.structured.comparisonTable.conceptA} vs {msg.structured.comparisonTable.conceptB}
                        </h5>
                        <span className="text-[10px] text-teal-400/90 font-mono sm:hidden">← scroll table →</span>
                      </div>
                      <div className="overflow-x-auto touch-pan-x no-scrollbar">
                        <table className="w-full min-w-[500px] text-xs text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-800 text-slate-400 font-mono">
                              <th className="p-2">Feature</th>
                              <th className="p-2 text-teal-300">{msg.structured.comparisonTable.conceptA}</th>
                              <th className="p-2 text-cyan-300">{msg.structured.comparisonTable.conceptB}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60 font-sans">
                            {msg.structured.comparisonTable.rows.map((r, idx) => (
                              <tr key={idx} className="hover:bg-slate-900/60">
                                <td className="p-2 font-mono text-slate-400">{r.feature}</td>
                                <td className="p-2 text-slate-200">{r.valA}</td>
                                <td className="p-2 text-slate-200">{r.valB}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Numerical Solution Section (if numerical problem) - Vertical Teaching Layout */}
                  {msg.structured?.numericalSolution && (
                    <div className="p-4 sm:p-5 bg-slate-950 border border-teal-500/20 rounded-xl space-y-3 font-sans">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-mono font-semibold text-teal-400 uppercase tracking-wider flex items-center gap-1.5">
                          <Atom className="w-3.5 h-3.5" />
                          <span>Numerical Problem Solution (Stepwise University Standard)</span>
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/20 text-teal-300">
                          Strict Scientific Form
                        </span>
                      </div>

                      {/* 1. Given */}
                      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-slate-400 font-mono block text-[10px] uppercase font-bold">
                          1. Given Parameters & Data:
                        </span>
                        <ul className="list-disc list-inside mt-1 text-slate-200 space-y-0.5 text-xs font-mono">
                          {msg.structured.numericalSolution.given.map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex justify-center text-teal-400/80 text-xs font-mono font-bold">↓ Required Target</div>

                      {/* 2. Required */}
                      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-slate-400 font-mono block text-[10px] uppercase font-bold">
                          2. Target Variable & Required Dimension:
                        </span>
                        <p className="font-semibold text-amber-300 text-sm">{msg.structured.numericalSolution.required}</p>
                      </div>

                      <div className="flex justify-center text-teal-400/80 text-xs font-mono font-bold">↓ Governing Formula</div>

                      {/* 3. Formula */}
                      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1">
                        <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">
                          3. Primary Physical/Thermodynamic Formula:
                        </span>
                        <MathRenderer latex={msg.structured.numericalSolution.formulaLatex} className="text-teal-300 text-base" />
                      </div>

                      {/* 4. Units check */}
                      {msg.structured.numericalSolution.unitsCheck && (
                        <>
                          <div className="flex justify-center text-teal-400/80 text-xs font-mono font-bold">↓ Units Verification</div>
                          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs space-y-1">
                            <span className="text-cyan-400 font-mono text-[10px] uppercase block font-bold">
                              4. Dimensional & Significant Figures Check:
                            </span>
                            <p className="text-slate-300 font-mono">{msg.structured.numericalSolution.unitsCheck}</p>
                          </div>
                        </>
                      )}

                      <div className="flex justify-center text-teal-400/80 text-xs font-mono font-bold">↓ Stepwise Substitution</div>

                      {/* 5. Substitution & Calculation */}
                      <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl text-xs space-y-2">
                        <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">
                          5. Substitution & Stepwise Calculation:
                        </span>
                        <MathRenderer latex={msg.structured.numericalSolution.substitution} />
                        <p className="text-slate-300 font-mono mt-1 whitespace-pre-line leading-relaxed">
                          {msg.structured.numericalSolution.calculation}
                        </p>
                      </div>

                      <div className="flex justify-center text-teal-400/80 text-xs font-mono font-bold">↓ Final Answer</div>

                      {/* 6. Final Answer Box */}
                      <div className="p-4 bg-teal-950/60 border border-teal-500/40 rounded-xl flex items-center justify-between shadow-lg">
                        <div>
                          <span className="text-xs font-mono text-teal-300 uppercase font-bold block">
                            Final Calculated Value:
                          </span>
                          <span className="text-lg sm:text-xl font-mono font-bold text-white tracking-wide mt-1 block">
                            {msg.structured.numericalSolution.finalAnswer}
                          </span>
                        </div>
                        <span className="text-xs px-2.5 py-1 bg-teal-500/20 text-teal-300 rounded font-mono border border-teal-500/30">
                          Verified
                        </span>
                      </div>

                      {/* 7. Physical Interpretation */}
                      {msg.structured.numericalSolution.interpretation && (
                        <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl text-xs space-y-1">
                          <span className="text-slate-400 font-mono text-[10px] uppercase block font-bold">
                            Physical Interpretation & Chemical Significance:
                          </span>
                          <p className="text-slate-300 leading-relaxed font-sans">
                            {msg.structured.numericalSolution.interpretation}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Worked Example */}
                  {msg.structured?.workedExample && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs">
                      <span className="text-amber-400 font-mono font-bold uppercase tracking-wider block">
                        Step 6: Concrete University Worked Example
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans">{msg.structured.workedExample}</p>
                    </div>
                  )}

                  {/* Application */}
                  {msg.structured?.application && (
                    <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-1 text-xs">
                      <span className="text-cyan-400 font-mono font-bold uppercase tracking-wider block">
                        Step 7: Industrial & Research Application
                      </span>
                      <p className="text-slate-300 leading-relaxed font-sans">{msg.structured.application}</p>
                    </div>
                  )}

                  {/* Practice & Exam Questions */}
                  {(msg.structured?.practiceQuestion || msg.structured?.examStyleQuestion) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {msg.structured.practiceQuestion && (
                        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                          <span className="text-emerald-400 font-mono font-semibold uppercase flex items-center gap-1">
                            <Check className="w-3.5 h-3.5" />
                            <span>Practice Problem</span>
                          </span>
                          <p className="text-slate-300 font-sans leading-relaxed">{msg.structured.practiceQuestion}</p>
                        </div>
                      )}
                      {msg.structured.examStyleQuestion && (
                        <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-xs space-y-1">
                          <span className="text-rose-400 font-mono font-semibold uppercase flex items-center gap-1">
                            <Flame className="w-3.5 h-3.5" />
                            <span>University Exam Question</span>
                          </span>
                          <p className="text-slate-300 font-sans leading-relaxed">{msg.structured.examStyleQuestion}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Academic Sources & Safety Warnings */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800 text-[11px] text-slate-400">
                    {msg.structured?.sources && msg.structured.sources.length > 0 && (
                      <div className="flex items-center gap-1.5">
                        <BookMarked className="w-3.5 h-3.5 text-teal-400" />
                        <span className="font-mono">
                          References: {msg.structured.sources.join(' • ')}
                        </span>
                      </div>
                    )}
                    {msg.structured?.safetyWarnings && msg.structured.safetyWarnings.length > 0 && (
                      <div className="flex items-center gap-1.5 text-amber-400 bg-amber-950/30 px-2.5 py-1 rounded-md border border-amber-900/40">
                        <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                        <span>Safety: {msg.structured.safetyWarnings[0]}</span>
                      </div>
                    )}
                  </div>

                  {/* Horizontally Scrollable Action Buttons Container with >=44px Touch Targets */}
                  <div className="pt-3 border-t border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <span>Professor Pedagogical Tools:</span>
                      <span className="text-teal-400 sm:hidden">← scroll actions →</span>
                    </div>

                    <div className="overflow-x-auto touch-pan-x no-scrollbar flex items-center gap-2 py-1 -mx-2 px-2">
                      {onOpenAnswerPage && (
                        <button
                          onClick={() => onOpenAnswerPage(msg)}
                          className="min-h-[44px] px-3.5 py-2 bg-gradient-to-r from-teal-900/80 to-cyan-900/80 hover:from-teal-800 hover:to-cyan-800 text-teal-200 border border-teal-500/40 rounded-xl transition-all flex items-center gap-1.5 font-bold text-xs whitespace-nowrap shrink-0 active:scale-95 shadow-sm"
                          title="Open full-page master academic view"
                        >
                          <Maximize2 className="w-4 h-4 text-teal-300 shrink-0" />
                          <span>Render Full Page</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleAction(msg.id, 'explain_more', msg)}
                        disabled={actionLoadingId === `${msg.id}-explain_more`}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <BookOpen className="w-4 h-4 text-indigo-400 shrink-0" />
                        <span>{msg.isExpanded ? 'Collapse Deep Dive' : 'Explain More'}</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'make_simple', msg)}
                        disabled={actionLoadingId === `${msg.id}-make_simple`}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>{msg.isSimplified ? 'Hide Simple' : 'Make Simple'}</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'diagram', msg)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <Sparkles className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Diagram</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'mechanism', msg)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Mechanism</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'example', msg)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <FileText className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Worked Example</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'quiz_me', msg)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                        <span>Quiz Me</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'practice_problem', msg)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Practice</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'compare', msg)}
                        disabled={actionLoadingId === `${msg.id}-compare`}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <Compass className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Compare</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'summarize', msg)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                      >
                        <ListChecks className="w-4 h-4 text-violet-400 shrink-0" />
                        <span>Summarize</span>
                      </button>

                      <button
                        onClick={() => handleAction(msg.id, 'flashcard', msg)}
                        className="min-h-[44px] px-3.5 py-2 bg-slate-800 hover:bg-teal-950 hover:text-teal-300 text-slate-200 rounded-xl transition-all flex items-center gap-1.5 font-medium text-xs whitespace-nowrap shrink-0 active:scale-95"
                        title="Save as Spaced Repetition Flashcard"
                      >
                        <BookmarkPlus className="w-4 h-4 text-teal-400 shrink-0" />
                        <span>Flashcards</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center gap-3 text-slate-300">
              <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-200 font-sans">
                  The Professor is structuring the pedagogical analysis...
                </p>
                <p className="text-xs text-slate-400 font-mono">
                  Synthesizing orbital mechanisms • KaTeX equations • University exam marking criteria
                </p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested Prompt Chips */}
      {messages.length <= 2 && (
        <div className="max-w-4xl mx-auto w-full px-4 py-2">
          <span className="text-[11px] font-mono text-slate-400 block mb-1.5">
            Suggested Graduate Chemistry Inquiries:
          </span>
          <div className="flex flex-wrap gap-2">
            {samplePrompts.map((prompt, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(prompt)}
                className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-full text-slate-300 hover:text-white transition-all text-left truncate max-w-xs"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Bottom Input Field */}
      <div className="bg-slate-900/95 border-t border-slate-800/80 p-3 sm:p-4 sticky bottom-0 backdrop-blur-md z-20 pb-20 md:pb-4">
        <div className="max-w-4xl mx-auto">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-1.5 sm:gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-2 sm:px-3 py-1.5 focus-within:border-teal-500 transition-all shadow-inner"
          >
            {/* Attachment Button */}
            <button
              type="button"
              onClick={() => setShowAttachModal(true)}
              className="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-teal-300 hover:bg-slate-900 rounded-xl flex items-center justify-center transition-all shrink-0 active:scale-95"
              title="Attach Spectrum, Formula, or Problem"
              aria-label="Attach File or Spectrum"
            >
              <Paperclip className="w-5 h-5" />
            </button>

            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder="Ask a chemistry question (e.g. 'Explain Aldol mechanism', 'Derive Nernst equation')..."
              className="flex-1 bg-transparent text-slate-100 text-xs sm:text-sm focus:outline-none placeholder-slate-500 font-sans min-h-[44px] px-1"
              disabled={loading}
            />

            <button
              type="submit"
              disabled={!inputPrompt.trim() || loading}
              className="min-h-[44px] px-3.5 sm:px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:hover:bg-teal-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md shrink-0 active:scale-95"
            >
              <span className="hidden sm:inline">Consult</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="flex items-center justify-between text-[11px] text-slate-500 px-2 mt-1.5 font-mono">
            <span>CHEMIA AI Professor • Graduate Office Hours</span>
            <span className="hidden sm:inline">LaTeX & Stepwise Mechanism Engine</span>
          </div>
        </div>
      </div>

      {/* Attachment Modal (Spectra & Lab Data) */}
      {showAttachModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-5 h-5 text-teal-400" />
                <h3 className="font-serif font-bold text-slate-100 text-base">
                  Attach Chemistry Data & Spectroscopy
                </h3>
              </div>
              <button
                onClick={() => setShowAttachModal(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                aria-label="Close Attachment Modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Select standard graduate laboratory data or spectroscopy signals to consult with the Professor:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {[
                {
                  title: 'IR Spectrum Peak Identification',
                  desc: 'Strong sharp absorption at 1715 cm⁻¹ and broad band at 2500–3300 cm⁻¹',
                  prompt: 'Identify the functional group with IR peaks at 1715 cm⁻¹ (strong sharp) and 2500-3300 cm⁻¹ (broad). Explain the vibrational modes.',
                },
                {
                  title: '1H-NMR Chemical Shifts & Splitting',
                  desc: 'Tri-substituted alkane: triplet at δ 1.25 (3H) and quartet at δ 4.12 (2H)',
                  prompt: 'Analyze this 1H-NMR spectrum: triplet at δ 1.25 (3H, J=7 Hz) and quartet at δ 4.12 (2H, J=7 Hz). What ethyl-adjacent group is present?',
                },
                {
                  title: 'Mass Spectrometry (EI-MS)',
                  desc: 'Molecular ion peak m/z = 74 (100%), base peak at m/z = 45',
                  prompt: 'Interpret the EI Mass Spectrum with M+ at m/z = 74 and base peak at m/z = 45. Propose the molecular fragmentation pathway.',
                },
                {
                  title: 'UV-Vis Charge Transfer Band',
                  desc: 'λmax = 500 nm in [Ti(H2O)6]3+ (d1 complex)',
                  prompt: 'Explain the UV-Vis absorption band at 500 nm (20,000 cm⁻¹) in [Ti(H2O)6]3+ using Crystal Field Theory and Jahn-Teller distortion.',
                },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setInputPrompt(item.prompt);
                    setShowAttachModal(false);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 transition-all space-y-1 active:scale-[0.99]"
                >
                  <div className="text-xs font-semibold text-teal-300 font-mono">{item.title}</div>
                  <div className="text-[11px] text-slate-400 font-sans">{item.desc}</div>
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setShowAttachModal(false)}
                className="min-h-[44px] px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Drawer / Slide-Over Sheet */}
      {isHistoryDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-md h-full flex flex-col p-5 shadow-2xl animate-slideInRight">
            {/* Drawer Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-teal-400" />
                <h3 className="font-serif font-bold text-slate-100 text-base">
                  Inquiries History
                </h3>
              </div>
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
                aria-label="Close History Drawer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Session Actions */}
            <div className="py-3 flex items-center justify-between border-b border-slate-800/60">
              <span className="text-xs text-slate-400 font-mono">
                {messages.filter((m) => m.sender === 'user').length} consultations recorded
              </span>
              <button
                onClick={() => {
                  setMessages([]);
                  setIsHistoryDrawerOpen(false);
                }}
                className="min-h-[36px] px-3 py-1 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-300 text-xs rounded-lg transition-all"
              >
                Clear History
              </button>
            </div>

            {/* Inquiry List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5">
              {messages.filter((m) => m.sender === 'user').length === 0 ? (
                <div className="text-center py-12 text-slate-500 text-xs">
                  No inquiries recorded yet. Ask a question to start your consultation log.
                </div>
              ) : (
                messages
                  .filter((m) => m.sender === 'user')
                  .map((msg, index) => (
                    <div
                      key={msg.id || index}
                      onClick={() => {
                        setInputPrompt(msg.text);
                        setIsHistoryDrawerOpen(false);
                      }}
                      className="p-3 bg-slate-950 hover:bg-slate-800/80 border border-slate-800 rounded-xl cursor-pointer transition-all space-y-1"
                    >
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                        <span>Consultation #{index + 1}</span>
                        <span>{msg.timestamp || 'Recent'}</span>
                      </div>
                      <p className="text-xs text-slate-200 line-clamp-2 font-sans font-medium">
                        {msg.text}
                      </p>
                    </div>
                  ))
              )}
            </div>

            {/* Drawer Footer */}
            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsHistoryDrawerOpen(false)}
                className="w-full min-h-[44px] py-2.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Close History
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
