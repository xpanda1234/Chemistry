import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  Sparkles,
  BookOpen,
  Atom,
  Layers,
  Calculator,
  CheckCircle2,
  FileText,
  Copy,
  Printer,
  Volume2,
  VolumeX,
  PlusCircle,
  MessageSquare,
  Search,
  ExternalLink,
  ShieldAlert,
  Flame,
  Check,
  Zap,
  Bookmark,
  ChevronRight,
  Share2,
  Download,
  GraduationCap,
  FlaskConical,
  HelpCircle,
  Maximize2,
  RotateCcw,
} from 'lucide-react';
import {
  ChatMessage,
  AcademicLevel,
  StructuredProfessorAnswer,
  Flashcard,
  DiagramPayload,
  ChemistryTopic,
} from '../types.ts';
import { MathRenderer } from './MathRenderer.tsx';
import { InteractiveDiagram } from './InteractiveDiagram.tsx';

interface AiAnswerPageProps {
  answer: ChatMessage | null;
  academicLevel: AcademicLevel;
  setAcademicLevel: (level: AcademicLevel) => void;
  onBackToChat: () => void;
  onAskFollowUp: (prompt: string) => void;
  onAddFlashcard: (card: Partial<Flashcard>) => void;
  allRecentAnswers?: ChatMessage[];
  onSelectAnswer?: (msg: ChatMessage) => void;
}

// Curated Master Academic Answers for deep dives if no active question is selected
const CURATED_SAMPLE_ANSWERS: Record<string, ChatMessage> = {
  sn1_sn2: {
    id: 'sample-sn1-sn2',
    sender: 'professor',
    text: 'Explain the fundamental mechanism, kinetics, and stereochemical differences between SN1 and SN2 nucleophilic substitution.',
    timestamp: 'University Master Lecture',
    mode: 'learn',
    structured: {
      topic: 'organic',
      topicLabel: 'Organic Chemistry & Reaction Mechanisms',
      level: 'Undergraduate (B.Sc. 1st/2nd Yr)',
      questionType: 'Reaction Mechanism',
      conceptSummary:
        'Nucleophilic substitution at sp³ carbon centers proceeds predominantly through two fundamental kinetic pathways: unimolecular SN1 (stepwise via a planar carbocation intermediate) and bimolecular SN2 (concerted backside attack via a pentacoordinate transition state). Substrate steric hindrance, solvent polarity, and nucleophile strength govern the pathway selection.',
      coreTheory:
        'The SN1 pathway is governed by Hammond’s postulate, where the transition state for carbocation generation resembles the high-energy intermediate. Polar protic solvents stabilize leaving group ionization via hydrogen bonding. In contrast, the SN2 pathway involves orbital overlap of the nucleophile’s non-bonding HOMO with the σ*(C–X) LUMO directly opposite the leaving group (180° trajectory), inducing complete Walden inversion of stereochemical configuration.',
      detailedExplanation:
        'In an SN1 pathway, the rate-determining step (RDS) is unimolecular heterolysis of the carbon-halogen bond to generate a trigonal planar (sp²) carbocation with an empty 2pz orbital. Because nucleophilic attack can occur with equal statistical probability from both the re-face and si-face, stereochemical scrambling (racemization) typically results, though intimate ion-pair shielding may lead to partial net inversion.\n\nIn an SN2 pathway, the rate law Rate = k[Substrate][Nu⁻] dictates second-order kinetics. Because five ligands occupy the equatorial and axial positions in the [Nu···C···X]‡ transition state, steric congestion increases exponentially from methyl > 1° > 2° >> 3° (neopentyl and tertiary centers are completely inert to SN2). Polar aprotic solvents (such as DMSO, DMF, and acetone) dramatically accelerate SN2 by leaving nucleophilic anions unsolvated and "naked".',
      chemicalEquationLatex:
        '\\text{S}_\\text{N}1:\\; \\text{R}_3\\text{C-Br} \\xrightarrow{\\text{slow (RDS)}} \\text{R}_3\\text{C}^+ + \\text{Br}^- \\xrightarrow{\\text{fast, :Nu}^-} \\text{R}_3\\text{C-Nu} \\quad [\\text{Rate} = k[\\text{R-X}]]',
      diagram: {
        type: 'mechanism',
        title: 'Stepwise Carbocation vs Concerted Backside Substitution Pathway',
        data: {},
      },
      mechanismSteps: [
        {
          stepNumber: 1,
          title: 'Rate-Determining Heterolysis (Leaving Group Departure)',
          description: 'C–X bond undergoes heterolytic cleavage facilitated by dielectric solvent stabilization, yielding a planar sp² carbocation and halide anion.',
          reactant: 'R₃C–Br (Tetrahedral sp³ substrate)',
          intermediateOrProduct: 'R₃C⁺ (Planar sp² carbocation) + Br⁻',
          keyFeature: 'Rate-Determining Step (RDS) • Highest Activation Energy (Ea₁)',
          arrowNote: 'Curved arrow begins at C–Br bond pair and points directly to Br atom.',
        },
        {
          stepNumber: 2,
          title: 'Nucleophilic Capture of Carbocation',
          description: 'Nucleophile donates electron pair into the empty non-bonding 2pz orbital of the carbocation intermediate from either top or bottom face.',
          reactant: 'R₃C⁺ carbocation + :Nu⁻ nucleophile',
          intermediateOrProduct: 'R₃C–Nu (Substituted product, racemic mixture)',
          keyFeature: 'Diffusion-controlled fast step • Stereochemical racemization',
          arrowNote: 'Curved arrow originates at lone pair of Nu⁻ and attacks carbocation C center.',
        },
      ],
      comparisonTable: {
        conceptA: 'SN1 (Unimolecular)',
        conceptB: 'SN2 (Bimolecular)',
        rows: [
          { feature: 'Kinetic Rate Law', valA: 'Rate = k[Substrate] (1st order)', valB: 'Rate = k[Substrate][Nu⁻] (2nd order)' },
          { feature: 'Substrate Preference', valA: '3° > 2° >> 1° (methyl inert)', valB: 'Methyl > 1° > 2° >> 3° (steric hindrance)' },
          { feature: 'Stereochemical Outcome', valA: 'Racemization (with partial inversion)', valB: 'Complete Walden Inversion (100% optical inversion)' },
          { feature: 'Favored Solvent', valA: 'Polar Protic (H₂O, MeOH, EtOH)', valB: 'Polar Aprotic (DMSO, DMF, Acetone)' },
          { feature: 'Nucleophile Requirement', valA: 'Weak, neutral nucleophiles (H₂O, ROH)', valB: 'Strong, anionic nucleophiles (CN⁻, I⁻, N₃⁻)' },
          { feature: 'Rearrangements', valA: 'Possible (1,2-hydride & alkyl shifts)', valB: 'Impossible (no carbocation intermediate)' },
        ],
      },
      application:
        'Industrial nucleophilic substitution is the foundational synthetic tool for synthesizing active pharmaceutical ingredients (APIs), including the asymmetric synthesis of antiviral nucleoside analogs and targeted protease inhibitors.',
      practiceQuestion:
        'Predict the major mechanism (SN1 or SN2) and stereochemical product when (R)-2-bromobutane is treated with sodium cyanide (NaCN) in dimethyl sulfoxide (DMSO).',
      examStyleQuestion:
        'Explain why 1-bromobicyclo[2.2.1]heptane (bridgehead bromide) is inert to both SN1 and SN2 substitution under boiling solvolytic conditions. Refer to Bredt’s rule and orbital geometry.',
      sources: ['Clayden, Greeves & Warren: Organic Chemistry (2nd Ed.)', 'March’s Advanced Organic Chemistry (8th Ed.)', 'IUPAC Gold Book'],
      safetyWarnings: ['Cyanide and alkyl halides are hazardous skin-permeable toxins; handle in dedicated fume hood with secondary containment.'],
    },
  },
  mo_o2: {
    id: 'sample-mo-o2',
    sender: 'professor',
    text: 'Why is molecular oxygen (O2) paramagnetic according to Molecular Orbital (MO) Theory?',
    timestamp: 'University Master Lecture',
    mode: 'learn',
    structured: {
      topic: 'quantum',
      topicLabel: 'Quantum & Physical Chemistry',
      level: 'Postgraduate (M.Sc. Chemistry)',
      questionType: 'Coordination & Quantum',
      conceptSummary:
        'Classical Lewis structures predict all valence electrons in O₂ are paired (:O=O:), which would imply diamagnetism. However, liquid oxygen is strongly attracted to magnetic poles. Molecular Orbital (MO) Theory via LCAO explains this anomaly by revealing that O₂ possesses two unpaired electrons in degenerate antibonding π*2p orbitals obeying Hund’s rule of maximum multiplicity.',
      coreTheory:
        'When two oxygen atoms (valence configuration 2s² 2p⁴) combine, their 2p atomic orbitals overlap to form molecular orbitals: σ2pz (bonding), degenerate π2px and π2py (bonding), degenerate π*2px and π*2py (antibonding), and σ*2pz (antibonding). In O₂, 12 valence electrons populate these orbitals according to the Aufbau principle and Hund’s rule: the last two electrons occupy separate degenerate π* orbitals with parallel spins (S = 1, triplet ground state ³Σg⁻).',
      detailedExplanation:
        'The magnetic dipole moment of a molecule is given by the spin-only formula μs = √(n(n+2)) μB, where n is the number of unpaired electrons. For molecular oxygen, n = 2, yielding an experimental magnetic moment of μs ≈ 2.83 Bohr magnetons.\n\nThe bond order is quantitatively calculated as:\nBond Order = (Nb - Na) / 2 = (8 bonding valence e⁻ - 4 antibonding valence e⁻) / 2 = 2.0 (stable double bond).\n\nExcitation of this triplet ground state (³Σg⁻) to singlet oxygen (¹Δg, S = 0) requires 94.3 kJ/mol and renders oxygen an extremely potent, short-lived electrophilic oxidant in photodynamic therapy and organic synthesis.',
      chemicalEquationLatex:
        '\\text{O}_2 \\text{ Valence Configuration}: \\; (\\sigma_{2s})^2 (\\sigma^*_{2s})^2 (\\sigma_{2p_z})^2 (\\pi_{2p_x})^2 (\\pi_{2p_y})^2 (\\pi^*_{2p_x})^1 (\\pi^*_{2p_y})^1',
      diagram: {
        type: 'mo',
        title: 'O₂ Molecular Orbital Diagram & Degenerate π* Half-Filled Orbitals',
        data: {},
      },
      numericalSolution: {
        given: ['O₂ valence electron count = 12', 'Valence electronic configuration'],
        required: 'Bond order and unpaired electron count',
        formulaLatex: '\\text{Bond Order} = \\frac{N_b - N_a}{2} = \\frac{8 - 4}{2} = 2.0',
        unitsCheck: 'Dimensionless bond order corresponds to a classical covalent double bond.',
        substitution: '\\mu_s = \\sqrt{2(2+2)} = \\sqrt{8} \\approx 2.83 \\; \\mu_B',
        calculation: 'Spin multiplicity 2S + 1 = 2(1) + 1 = 3 (Triplet Ground State)',
        finalAnswer: 'Bond Order = 2.0, Unpaired Electrons n = 2, Spin = 1 (Triplet Paramagnetic)',
        interpretation: 'Directly validates paramagnetic liquid oxygen deflection between magnetic poles.',
      },
      application:
        'Singlet oxygen (¹O₂) photochemistry is central to photodynamic cancer therapy, atmospheric ozone layer kinetics, and industrial selective olefin photo-oxygenation (e.g., Schenck ene reaction).',
      practiceQuestion:
        'Using the MO diagram of O₂, predict the bond order, bond length trend, and magnetic properties for superoxide (O₂⁻) and peroxide (O₂²⁻).',
      examStyleQuestion:
        'Compare the MO diagram of O₂ with that of N₂. Why does the energy order of σ2pz and π2p invert between O₂ (no sp-mixing) and N₂ (strong sp-mixing)?',
      sources: ['Atkins & de Paula: Physical Chemistry (11th Ed.)', 'Miessler, Fischer & Tarr: Inorganic Chemistry (5th Ed.)'],
      safetyWarnings: ['Liquid oxygen is a cryogenic hazard that can cause severe frostbite and spontaneously ignites organic materials.'],
    },
  },
  galvanic_nernst: {
    id: 'sample-galvanic-nernst',
    sender: 'professor',
    text: 'Calculate the cell potential of a Galvanic Daniell Cell under non-standard conditions using the Nernst Equation.',
    timestamp: 'University Master Lecture',
    mode: 'learn',
    structured: {
      topic: 'electrochemistry',
      topicLabel: 'Physical & Electrochemistry',
      level: 'Graduate (B.Sc. Final / B.S.)',
      questionType: 'Thermodynamics & Kinetics',
      conceptSummary:
        'A Daniell cell converts chemical Gibbs free energy into electrical work through spontaneous redox electron transfer from zinc anode to copper cathode. Under non-standard ion activities, the electromotive force (EMF) is determined by the Nernst equation: E = E° - (RT/nF) ln Q.',
      coreTheory:
        'Standard reduction potentials are: E°(Cu²⁺/Cu) = +0.34 V and E°(Zn²⁺/Zn) = -0.76 V. The standard cell potential is E°cell = E°cathode - E°anode = +0.34 - (-0.76) = +1.10 V. The thermodynamic driving force relates to Gibbs free energy via ΔG° = -nFE°cell. When [Zn²⁺] increases or [Cu²⁺] decreases, reaction quotient Q increases, lowering cell EMF until equilibrium (E = 0, dead battery) is attained.',
      detailedExplanation:
        'At 298.15 K (25 °C), the pre-factor (RT/F) ln(10) evaluates to 0.05916 V. The Nernst equation simplifies to Ecell = E°cell - (0.05916 / n) log₁₀ Q.\n\nFor the spontaneous cell reaction Zn(s) + Cu²⁺(aq) ⇌ Zn²⁺(aq) + Cu(s), n = 2 electrons are transferred per mole of reaction. The reaction quotient is Q = [Zn²⁺] / [Cu²⁺], since solid elemental phases have unit activity (a = 1). When [Zn²⁺] = 0.010 M and [Cu²⁺] = 1.0 M, Q = 10⁻², yielding log Q = -2. The non-standard potential increases to E = 1.10 - (0.05916/2)(-2) = 1.10 + 0.059 = +1.16 V.',
      chemicalEquationLatex:
        'E_\\text{cell} = E^\\circ_\\text{cell} - \\frac{0.05916}{n} \\log_{10} \\left( \\frac{[\\text{Zn}^{2+}]}{[\\text{Cu}^{2+}]} \\right) \\quad \\text{at } 298.15\\text{ K}',
      diagram: {
        type: 'galvanic',
        title: 'Galvanic Daniell Cell: Zn(s)|Zn²⁺(aq)||Cu²⁺(aq)|Cu(s) with Salt Bridge',
        data: {},
      },
      numericalSolution: {
        given: ['E°(Cu²⁺/Cu) = +0.34 V', 'E°(Zn²⁺/Zn) = -0.76 V', '[Zn²⁺] = 0.010 M', '[Cu²⁺] = 1.00 M'],
        required: 'Cell potential E_cell at 298.15 K and ΔG',
        formulaLatex: 'E_\\text{cell} = E^\\circ_\\text{cell} - \\frac{0.05916}{n} \\log_{10} Q, \\quad \\Delta G = -nFE_\\text{cell}',
        unitsCheck: 'Volts (V) = Joules / Coulomb (J/C); ΔG in Joules/mole (J/mol).',
        substitution: 'Q = \\frac{0.010}{1.00} = 1.0 \\times 10^{-2}, \\quad \\log_{10}(10^{-2}) = -2.0',
        calculation: 'E = 1.100 - (0.02958)(-2.0) = 1.100 + 0.05916 = +1.159\\text{ V}',
        finalAnswer: 'E_\\text{cell} = +1.159\\text{ V} \\; (+1.16\\text{ V}), \\quad \\Delta G = -223.7\\text{ kJ/mol}',
        interpretation: 'Diluting the anodic compartment increases voltage output by driving the equilibrium forward according to Le Chatelier’s principle.',
      },
      application:
        'Nernstian electrochemistry underpins lithium-ion battery state-of-charge algorithms, potentiometric glass pH electrodes, and biological nerve action potential transmission (Goldman-Hodgkin-Katz equation).',
      practiceQuestion:
        'Calculate the concentration of Cu²⁺ required to reduce the Daniell cell potential to exactly +1.00 V when [Zn²⁺] = 0.50 M.',
      examStyleQuestion:
        'Derive the equilibrium constant K for the Daniell cell reaction at 298 K from E°cell = +1.10 V, and discuss why practical batteries reach equilibrium asymptotically.',
      sources: ['Bard & Faulkner: Electrochemical Methods (3rd Ed.)', 'Zumdahl & Zumdahl: Chemistry (10th Ed.)'],
      safetyWarnings: ['Copper sulfate is toxic to aquatic organisms; dispose of heavy metal electrolytic waste according to university environmental safety protocol.'],
    },
  },
};

export const AiAnswerPage: React.FC<AiAnswerPageProps> = ({
  answer,
  academicLevel,
  setAcademicLevel,
  onBackToChat,
  onAskFollowUp,
  onAddFlashcard,
  allRecentAnswers = [],
  onSelectAnswer,
}) => {
  // Select active answer: provided answer, or first recent professor answer, or fallback curated answer
  const [activeAnswer, setActiveAnswer] = useState<ChatMessage>(() => {
    if (answer && answer.structured) return answer;
    const recentProf = allRecentAnswers.find((m) => m.sender === 'professor' && m.structured);
    if (recentProf) return recentProf;
    return CURATED_SAMPLE_ANSWERS.sn1_sn2;
  });

  const [activePerspective, setActivePerspective] = useState<'comprehensive' | 'simplified' | 'exam'>('comprehensive');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [flashcardSaved, setFlashcardSaved] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('summary');
  const mainContentRef = useRef<HTMLDivElement | null>(null);

  // Update when prop changes
  useEffect(() => {
    if (answer && answer.structured) {
      setActiveAnswer(answer);
    }
  }, [answer]);

  // Clean up speech synthesis on unmount
  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const structured = activeAnswer.structured;

  // Audio Playback / Reader
  const toggleSpeech = () => {
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis is not supported in this browser environment.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const textToRead = [
      `Chemistry Lecture on: ${structured?.topicLabel || 'Advanced Chemistry Topic'}.`,
      structured?.conceptSummary || activeAnswer.text,
      `Core Theoretical Principles: ${structured?.coreTheory || ''}`,
      `Mechanistic Breakdown: ${structured?.detailedExplanation || ''}`,
      structured?.numericalSolution?.interpretation ? `Quantitative Analysis: ${structured.numericalSolution.interpretation}` : '',
      structured?.application ? `Real-world Applications: ${structured.application}` : '',
    ]
      .filter(Boolean)
      .join(' ');

    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Copy LaTeX / Markdown
  const handleCopyFormatted = () => {
    if (!structured) return;
    const markdown = `# ${structured.topicLabel || 'Chemistry Lecture'}: ${activeAnswer.text}
Academic Level: ${structured.level || academicLevel}

## 1. Executive Summary
${structured.conceptSummary}

## 2. Core Physical Theory
${structured.coreTheory}

## 3. Chemical Formalism
${structured.chemicalEquationLatex ? `$$${structured.chemicalEquationLatex}$$` : 'N/A'}

## 4. Mechanistic & In-Depth Breakdown
${structured.detailedExplanation}

${structured.numericalSolution ? `## 5. Quantitative Solution\nFormula: ${structured.numericalSolution.formulaLatex}\nFinal Answer: ${structured.numericalSolution.finalAnswer}` : ''}

## 6. Real-World Applications
${structured.application || 'N/A'}

## 7. Exam Practice Problem
${structured.examStyleQuestion || structured.practiceQuestion || 'N/A'}
`;

    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedNotification('Scholarly lecture notes & KaTeX copied to clipboard!');
      setTimeout(() => setCopiedNotification(null), 3000);
    });
  };

  // Instant Add to SRS Flashcards
  const handleSaveFlashcard = () => {
    if (!structured) return;
    onAddFlashcard({
      front: `${structured.topicLabel || 'Concept'}: ${activeAnswer.text.slice(0, 100)}`,
      back: structured.conceptSummary || activeAnswer.text,
      explanation: structured.coreTheory || structured.detailedExplanation,
      difficulty: 'medium',
    });
    setFlashcardSaved(true);
    setTimeout(() => setFlashcardSaved(false), 3000);
  };

  // Direct In-Page Chemistry Query
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim() || isSearching) return;

    setIsSearching(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: searchQuery,
          mode: 'learn',
          academicLevel,
        }),
      });

      const data = await res.json();
      if (data && data.message) {
        const newMsg: ChatMessage = {
          id: `search-${Date.now()}`,
          sender: 'professor',
          text: searchQuery,
          timestamp: 'Just now',
          mode: 'learn',
          structured: data.message.structured,
        };
        setActiveAnswer(newMsg);
        if (onSelectAnswer) {
          onSelectAnswer(newMsg);
        }
      }
    } catch (err) {
      console.error('Error generating AI answer page:', err);
    } finally {
      setIsSearching(false);
      setSearchQuery('');
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSectionId(id);
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Table of contents sections
  const tocSections = [
    { id: 'summary', title: '1. Executive Abstract & Summary', icon: Sparkles },
    { id: 'theory', title: '2. Core Physical Theory', icon: Atom },
    { id: 'equation', title: '3. Chemical & Math Formalism', icon: FileText, show: !!structured?.chemicalEquationLatex },
    { id: 'visualizer', title: '4. Interactive 2D/3D Visualizer', icon: Layers },
    { id: 'mechanism', title: '5. Mechanism & Elementary Steps', icon: ChevronRight, show: !!(structured?.mechanismSteps && structured.mechanismSteps.length > 0) },
    { id: 'numerical', title: '6. Quantitative Worked Solution', icon: Calculator, show: !!structured?.numericalSolution },
    { id: 'comparison', title: '7. Comparative Matrix', icon: BookOpen, show: !!structured?.comparisonTable },
    { id: 'application', title: '8. Real-World Applications', icon: FlaskConical, show: !!structured?.application },
    { id: 'exam', title: '9. University Exam Challenge', icon: Flame, show: !!(structured?.practiceQuestion || structured?.examStyleQuestion) },
    { id: 'sources', title: '10. Primary Citations & Safety', icon: ShieldAlert },
  ].filter((s) => s.show !== false);

  return (
    <div className="h-full flex flex-col bg-[#0b1120] text-slate-100 overflow-hidden select-text">
      {/* Top Header Bar */}
      <header className="shrink-0 bg-slate-900/95 border-b border-slate-800/80 px-4 py-3 z-30 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Left: Back to Chat + Breadcrumb */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToChat}
              className="min-h-[44px] min-w-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-2 text-xs font-semibold transition-all active:scale-95 shadow-sm"
              title="Return to AI Chat Tutor"
            >
              <ArrowLeft className="w-4 h-4 text-teal-400" />
              <span>Back to Chat</span>
            </button>

            <div className="hidden sm:flex items-center gap-2">
              <span className="text-slate-500 font-mono text-xs">/</span>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono font-medium">
                <Sparkles className="w-3.5 h-3.5 text-teal-400" />
                <span>AI Chatbot Master Answer</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">
                {structured?.topicLabel || 'Graduate Classroom'}
              </span>
            </div>
          </div>

          {/* Right Action Suite */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Audio Reader */}
            <button
              onClick={toggleSpeech}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                isSpeaking
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-bold animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Read Aloud with Voice Synthesis"
            >
              {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-teal-400" />}
              <span className="hidden md:inline">{isSpeaking ? 'Pause Audio' : 'Listen'}</span>
            </button>

            {/* Flashcard Save */}
            <button
              onClick={handleSaveFlashcard}
              className={`min-h-[44px] px-3 py-2 rounded-xl border text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm ${
                flashcardSaved
                  ? 'bg-emerald-600 text-white border-emerald-500 font-semibold'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'
              }`}
              title="Add to SRS Flashcards"
            >
              {flashcardSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4 text-emerald-400" />}
              <span className="hidden md:inline">{flashcardSaved ? 'Card Saved!' : 'Save Flashcard'}</span>
            </button>

            {/* Copy LaTeX / Notes */}
            <button
              onClick={handleCopyFormatted}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Copy Formatted Notes & LaTeX"
            >
              <Copy className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">Copy Notes</span>
            </button>

            {/* Print / PDF Export */}
            <button
              onClick={() => window.print()}
              className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
              title="Print / Save PDF"
            >
              <Printer className="w-4 h-4 text-indigo-400" />
              <span className="hidden lg:inline">Print / PDF</span>
            </button>

            {/* Ask Follow-up in Chat */}
            <button
              onClick={() => {
                onAskFollowUp(`Follow up on ${structured?.topicLabel || 'previous topic'}: `);
                onBackToChat();
              }}
              className="min-h-[44px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 text-white font-semibold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
            >
              <MessageSquare className="w-4 h-4" />
              <span className="hidden sm:inline">Ask Follow-up</span>
            </button>
          </div>
        </div>
      </header>

      {/* Copied notification toast */}
      {copiedNotification && (
        <div className="fixed top-16 right-4 z-50 bg-teal-600 text-white px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-2 text-xs font-mono animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{copiedNotification}</span>
        </div>
      )}

      {/* Direct Search / Inquire Bar on this Page */}
      <div className="bg-slate-900/60 border-b border-slate-800/70 px-4 py-2.5 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5">
          <form onSubmit={handleSearchSubmit} className="w-full md:max-w-2xl flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ask any chemistry topic to render a new full-page professor answer..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs md:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 min-h-[42px]"
              />
            </div>
            <button
              type="submit"
              disabled={!searchQuery.trim() || isSearching}
              className="min-h-[42px] px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-all active:scale-95"
            >
              {isSearching ? <Sparkles className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              <span>Render</span>
            </button>
          </form>

          {/* Quick Preloaded Lecture Answers Switcher */}
          <div className="flex items-center gap-2 overflow-x-auto max-w-full text-xs font-mono py-0.5">
            <span className="text-slate-500 shrink-0">Preset Master Lectures:</span>
            {Object.entries(CURATED_SAMPLE_ANSWERS).map(([key, item]) => {
              const isActive = activeAnswer.id === item.id;
              return (
                <button
                  key={key}
                  onClick={() => setActiveAnswer(item)}
                  className={`min-h-[34px] px-2.5 py-1 rounded-lg border transition-all whitespace-nowrap shrink-0 text-[11px] ${
                    isActive
                      ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 border-slate-700/60'
                  }`}
                >
                  {key === 'sn1_sn2' ? 'SN1 vs SN2' : key === 'mo_o2' ? 'O₂ MO Theory' : 'Daniell Galvanic'}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Body Layout: Sticky Academic Outline (Desktop) + Main Scholarly Article */}
      <div className="flex-1 min-h-0 overflow-y-auto" ref={mainContentRef}>
        <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* Left Column: Scholarly Outline / Table of Contents (Sticky on desktop) */}
          <aside className="hidden lg:block lg:col-span-3 space-y-4">
            <div className="sticky top-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="font-mono text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                  <span>Paper Index</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-teal-400 font-mono border border-slate-700">
                  {academicLevel.includes('(') ? academicLevel.split('(')[1].replace(')', '') : academicLevel}
                </span>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1 text-xs font-mono">
                {tocSections.map((sec) => (
                  <button
                    key={sec.id}
                    onClick={() => scrollToSection(sec.id)}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between ${
                      activeSectionId === sec.id
                        ? 'bg-teal-500/20 text-teal-300 font-bold border-l-2 border-teal-400'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                  </button>
                ))}
              </nav>

              {/* Perspective Toggles */}
              <div className="pt-3 border-t border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-slate-500 block uppercase">Pedagogical Lens</span>
                <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-[10px] font-mono">
                  <button
                    onClick={() => setActivePerspective('comprehensive')}
                    className={`py-1.5 rounded-lg transition-all text-center ${
                      activePerspective === 'comprehensive' ? 'bg-teal-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Full
                  </button>
                  <button
                    onClick={() => setActivePerspective('simplified')}
                    className={`py-1.5 rounded-lg transition-all text-center ${
                      activePerspective === 'simplified' ? 'bg-amber-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Simple
                  </button>
                  <button
                    onClick={() => setActivePerspective('exam')}
                    className={`py-1.5 rounded-lg transition-all text-center ${
                      activePerspective === 'exam' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Exam
                  </button>
                </div>
              </div>

              {/* Quick Metadata Box */}
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800/80 space-y-1.5 text-[11px] font-mono text-slate-400">
                <div className="flex justify-between">
                  <span>IUPAC Verified:</span>
                  <span className="text-teal-400 font-bold">Standard</span>
                </div>
                <div className="flex justify-between">
                  <span>Rigorous Math:</span>
                  <span className="text-cyan-400 font-bold">KaTeX</span>
                </div>
                <div className="flex justify-between">
                  <span>Visual Engine:</span>
                  <span className="text-amber-400 font-bold">Vector + 3D</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Column: Full Scholarly Lecture Article */}
          <main className="lg:col-span-9 space-y-8">
            {/* Article Title & Abstract Banner */}
            <section className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-mono font-bold uppercase tracking-wider">
                  {structured?.topic?.toUpperCase() || 'CHEMISTRY'}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
                  {structured?.level || academicLevel}
                </span>
                <span className="px-3 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-mono">
                  {structured?.questionType || 'Doctoral Lecture'}
                </span>
                <span className="ml-auto text-xs text-slate-500 font-mono">{activeAnswer.timestamp}</span>
              </div>

              {/* Main Question Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold font-serif text-slate-100 leading-tight">
                {activeAnswer.text}
              </h1>

              {/* Status Note */}
              {activeAnswer.note && (
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs font-mono">
                  <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
                  <span>{activeAnswer.note}</span>
                </div>
              )}

              {/* Section 1: Executive Abstract & Summary */}
              <div id="summary" className="scroll-mt-6 p-5 sm:p-6 bg-teal-950/30 border-l-4 border-teal-400 rounded-r-2xl space-y-2">
                <div className="flex items-center gap-2 text-teal-400 font-mono text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>Section 1: Executive Concept Synthesis</span>
                </div>
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed font-sans">
                  {structured?.conceptSummary || activeAnswer.text}
                </p>
              </div>

              {/* Alternative Simplified View (if toggled) */}
              {activePerspective === 'simplified' && (
                <div className="p-5 bg-amber-950/30 border border-amber-500/30 rounded-2xl space-y-2 animate-fadeIn">
                  <div className="flex items-center gap-2 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider">
                    <Zap className="w-4 h-4" />
                    <span>Feynman Intuitive Analogy</span>
                  </div>
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                    {activeAnswer.simplifiedVersion ||
                      'Think of this process like walking through a crowded revolving door (SN2 backside displacement) versus waiting for a room to completely empty before stepping inside from either side (SN1 carbocation pathway). The energy barrier determines how easily the molecule can navigate the transition.'}
                  </p>
                </div>
              )}
            </section>

            {/* Section 2: Core Physical Principles & Theory */}
            <section id="theory" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                  <Atom className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                    2. Theoretical Foundations & Governing Principles
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Thermodynamics, Kinetics & Orbital Overlap</span>
                </div>
              </div>

              <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed text-sm sm:text-base space-y-4 font-sans">
                <p className="whitespace-pre-line leading-relaxed">
                  {structured?.coreTheory}
                </p>

                {structured?.detailedExplanation && (
                  <div className="pt-3 border-t border-slate-800/80 space-y-3">
                    <h3 className="text-sm font-mono uppercase tracking-wider text-teal-400 font-semibold">
                      In-Depth Mechanistic Breakdown
                    </h3>
                    <p className="whitespace-pre-line leading-relaxed text-slate-300">
                      {structured.detailedExplanation}
                    </p>
                  </div>
                )}
              </div>
            </section>

            {/* Section 3: Chemical & Math Formalism (KaTeX Equations) */}
            {structured?.chemicalEquationLatex && (
              <section id="equation" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                      3. Chemical Formalism & Quantitative Equations
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">Standard IUPAC KaTeX Mathematical Representation</span>
                  </div>
                </div>

                <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl overflow-x-auto">
                  <MathRenderer latex={structured.chemicalEquationLatex} />
                </div>
              </section>
            )}

            {/* Section 4: Interactive Chemical Visualizer (2D Diagrams & 3D Ball-and-Stick) */}
            <section id="visualizer" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                      4. Chemical Visualizer & Structural Modeling
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">Multi-Modal 2D Vector & 3D Spatial Geometry</span>
                  </div>
                </div>
              </div>

              <div className="w-full">
                <InteractiveDiagram
                  diagram={structured?.diagram}
                  mechanismSteps={structured?.mechanismSteps}
                  topic={structured?.topic || 'organic'}
                />
              </div>
            </section>

            {/* Section 5: Step-by-Step Mechanism / Elementary Reactions */}
            {structured?.mechanismSteps && structured.mechanismSteps.length > 0 && (
              <section id="mechanism" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ChevronRight className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                      5. Step-by-Step Reaction Mechanism
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                      Curved Arrow Flow, Intermediates & Activation Barriers
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {structured.mechanismSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 relative overflow-hidden"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-mono text-teal-400 font-bold uppercase tracking-wider">
                          Phase {step.stepNumber}: {step.title}
                        </span>
                        {step.keyFeature && (
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-mono">
                            {step.keyFeature}
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-slate-300 leading-relaxed font-sans">{step.description}</p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase font-sans">Starting Substrate</span>
                          <span className="text-emerald-300 font-semibold">{step.reactant}</span>
                        </div>
                        <div className="p-3 bg-slate-900 rounded-xl border border-slate-800/80">
                          <span className="text-slate-500 block text-[10px] uppercase font-sans">Formed Intermediate / Product</span>
                          <span className="text-cyan-300 font-semibold">{step.intermediateOrProduct}</span>
                        </div>
                      </div>

                      {step.arrowNote && (
                        <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-xl text-xs text-teal-200 flex items-start gap-2">
                          <span className="text-teal-400 font-bold shrink-0">↷ Electron Flow:</span>
                          <span>{step.arrowNote}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Section 6: Quantitative Numerical Breakdown */}
            {structured?.numericalSolution && (
              <section id="numerical" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                    <Calculator className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                      6. Quantitative Worked Numerical Solution
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">Dimensional Analysis & Thermodynamic Values</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-xs font-mono text-slate-400 uppercase">Governing Formula</span>
                    <MathRenderer latex={structured.numericalSolution.formulaLatex} />
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-xs font-mono text-slate-400 uppercase">Input Parameters & Constants</span>
                    <p className="text-xs text-slate-300 font-mono">{structured.numericalSolution.given.join(' • ')}</p>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-xs font-mono text-slate-400 uppercase">Algebraic Substitution</span>
                    <MathRenderer latex={structured.numericalSolution.substitution} />
                  </div>
                  <div className="p-4 bg-teal-950/30 border border-teal-500/30 rounded-2xl space-y-1.5">
                    <span className="text-xs font-mono text-teal-400 uppercase font-bold">Final Calculated Result</span>
                    <p className="text-base sm:text-lg font-bold text-teal-200 font-mono">
                      {structured.numericalSolution.finalAnswer}
                    </p>
                  </div>
                </div>

                {structured.numericalSolution.interpretation && (
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl text-xs sm:text-sm text-slate-300">
                    <span className="text-teal-400 font-bold block mb-1 font-mono uppercase text-xs">
                      Physical Significance:
                    </span>
                    {structured.numericalSolution.interpretation}
                  </div>
                )}
              </section>
            )}

            {/* Section 7: Comparative Analysis Table */}
            {structured?.comparisonTable && (
              <section id="comparison" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                      7. Comparative Matrix Analysis
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">
                      {structured.comparisonTable.conceptA} vs {structured.comparisonTable.conceptB}
                    </span>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs sm:text-sm font-sans">
                    <thead className="bg-slate-950 text-slate-300 font-mono uppercase text-[11px] border-b border-slate-800">
                      <tr>
                        <th className="p-3.5 sm:p-4">Key Characteristic</th>
                        <th className="p-3.5 sm:p-4 text-teal-400">{structured.comparisonTable.conceptA}</th>
                        <th className="p-3.5 sm:p-4 text-cyan-400">{structured.comparisonTable.conceptB}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 bg-slate-900/60">
                      {structured.comparisonTable.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3.5 sm:p-4 font-mono font-medium text-slate-300">{row.feature}</td>
                          <td className="p-3.5 sm:p-4 text-slate-200">{row.valA}</td>
                          <td className="p-3.5 sm:p-4 text-slate-200">{row.valB}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* Section 8: Real-World Applications */}
            {structured?.application && (
              <section id="application" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
                    <FlaskConical className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                      8. Industrial, Biological & Synthetic Applications
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">Translational Chemistry & Materials Science</span>
                  </div>
                </div>

                <div className="p-5 bg-purple-950/20 border border-purple-500/30 rounded-2xl">
                  <p className="text-sm sm:text-base text-slate-200 leading-relaxed font-sans">
                    {structured.application}
                  </p>
                </div>
              </section>
            )}

            {/* Section 9: University Examination Questions & Practice */}
            {(structured?.practiceQuestion || structured?.examStyleQuestion) && (
              <section id="exam" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                    <Flame className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                      9. University Examination Challenge & Grading Rubric
                    </h2>
                    <span className="text-xs text-slate-400 font-mono">B.Sc. / M.Sc. Level Comprehensive Exam Questions</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {structured.practiceQuestion && (
                    <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-emerald-400 font-mono text-xs font-bold uppercase">
                        <Check className="w-4 h-4" />
                        <span>Core Practice Problem</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">{structured.practiceQuestion}</p>
                    </div>
                  )}

                  {structured.examStyleQuestion && (
                    <div className="p-5 bg-slate-950 border border-rose-900/40 rounded-2xl space-y-2">
                      <div className="flex items-center gap-1.5 text-rose-400 font-mono text-xs font-bold uppercase">
                        <Flame className="w-4 h-4" />
                        <span>Final Exam Challenge Question</span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed font-sans">{structured.examStyleQuestion}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Section 10: Academic Citations & Safety Protocol */}
            <section id="sources" className="scroll-mt-6 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-8 h-8 rounded-xl bg-slate-700/40 text-slate-300 flex items-center justify-center font-bold">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-slate-100 font-serif">
                    10. Primary Academic References & Laboratory Safety
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">Textbook Standard Citations & OSHA/ACS Safety</span>
                </div>
              </div>

              <div className="space-y-3 text-xs font-mono">
                {structured?.sources && structured.sources.length > 0 && (
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-1.5">
                    <span className="text-teal-400 font-bold block uppercase text-[10px]">
                      Recommended Standard Textbooks:
                    </span>
                    <ul className="list-disc list-inside space-y-1 text-slate-300">
                      {structured.sources.map((src, idx) => (
                        <li key={idx}>{src}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {structured?.safetyWarnings && structured.safetyWarnings.length > 0 && (
                  <div className="p-4 bg-amber-950/20 border border-amber-900/40 rounded-2xl flex items-start gap-2.5 text-amber-300">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                    <div>
                      <span className="font-bold block uppercase text-[10px] text-amber-400">
                        Laboratory Safety & Hazard Precaution:
                      </span>
                      <p className="font-sans text-xs mt-0.5 leading-relaxed">{structured.safetyWarnings.join(' • ')}</p>
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Bottom Footer Action Bar */}
            <div className="p-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-teal-950/40 border border-slate-800 rounded-3xl flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="text-base font-bold text-slate-100 font-serif">Deepen Your Mastery</h4>
                <p className="text-xs text-slate-400 font-mono">
                  Continue this exploration in the AI Tutor or test yourself in the Virtual Lab.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={onBackToChat}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <ArrowLeft className="w-4 h-4 text-teal-400" />
                  <span>Return to Chat</span>
                </button>

                <button
                  onClick={() => {
                    onAskFollowUp(`Can you explain common misconceptions and student mistakes regarding ${structured?.topicLabel || 'this topic'}?`);
                    onBackToChat();
                  }}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
                >
                  <HelpCircle className="w-4 h-4" />
                  <span>Ask Common Mistakes</span>
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};
