export type ChemistryTopic =
  | 'organic'
  | 'inorganic'
  | 'physical'
  | 'analytical'
  | 'biochemistry'
  | 'spectroscopy'
  | 'quantum'
  | 'electrochemistry'
  | 'thermodynamics'
  | 'kinetics'
  | 'coordination'
  | 'polymer'
  | 'environmental'
  | 'laboratory'
  | 'numerical'
  | 'mechanism'
  | 'structure_id';

export type AcademicLevel = 'Undergraduate (B.Sc. 1st/2nd Yr)' | 'Graduate (B.Sc. Final / B.S.)' | 'Postgraduate (M.Sc. Chemistry)' | 'Research Scholar';

export type QuestionType =
  | 'Reaction Mechanism'
  | 'Numerical Problem'
  | 'Conceptual Theory'
  | 'Structure Identification'
  | 'Spectroscopy Interpretation'
  | 'Laboratory Chemistry'
  | 'Thermodynamics & Kinetics'
  | 'Coordination & Quantum';

export type AnswerMode = 'quick' | 'learn' | 'deep_dive' | 'exam' | 'research';

export interface MechanismStep {
  stepNumber: number;
  title: string;
  description: string;
  reactant: string;
  reagentOrCondition?: string;
  arrowNote?: string;
  intermediateOrProduct: string;
  curvedArrowSummary?: string;
  keyFeature?: string;
}

export interface NumericalBreakdown {
  given: string[];
  required: string;
  formulaLatex: string;
  unitsCheck: string;
  substitution: string;
  calculation: string;
  finalAnswer: string;
  interpretation: string;
  assumptions?: string;
}

export interface DiagramPayload {
  type: 'mechanism' | 'energy' | 'cft' | 'mo' | 'titration' | 'molecule3d' | 'spectroscopy' | 'galvanic' | 'electrochemistry';
  title: string;
  subtitle?: string;
  data?: {
    subType?: string;
    system?: string;
    molecule?: string;
    details?: Record<string, any>;
    customLabels?: Record<string, string>;
    [key: string]: any;
  };
}

export interface DiagramQAAnswer {
  question: string;
  diagramType: string;
  referencedComponent?: string;
  directAnswer: string;
  detailedExplanation: string;
  equationLatex?: string;
  examTips?: string;
  keyTakeaways?: string[];
}

export interface StructuredProfessorAnswer {
  topic: ChemistryTopic;
  topicLabel: string;
  level: AcademicLevel;
  questionType: QuestionType;
  conceptSummary: string;
  coreTheory: string;
  detailedExplanation: string;
  chemicalEquationLatex?: string;
  diagram?: DiagramPayload;
  mechanismSteps?: MechanismStep[];
  numericalSolution?: NumericalBreakdown;
  workedExample?: string;
  comparisonTable?: {
    conceptA: string;
    conceptB: string;
    rows: Array<{ feature: string; valA: string; valB: string }>;
  };
  application?: string;
  practiceQuestion?: string;
  examStyleQuestion?: string;
  sources?: string[];
  safetyWarnings?: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'professor';
  text: string;
  timestamp: string;
  mode?: AnswerMode;
  structured?: StructuredProfessorAnswer;
  expandedDetails?: string;
  simplifiedVersion?: string;
  isExpanded?: boolean;
  isSimplified?: boolean;
  note?: string;
}

export interface VirtualExperiment {
  id: string;
  title: string;
  discipline: 'Physical' | 'Organic' | 'Analytical';
  objective: string;
  theory: string;
  principle: string;
  apparatus: string[];
  chemicals: string[];
  procedure: Array<{ step: number; text: string; actionPrompt?: string }>;
  currentStep: number;
  observations: Record<string, string | number>;
  calculations: string;
  result: string;
  precautions: string[];
  vivaQuestions: Array<{ question: string; answer: string }>;
  simulationType: 'titration_ph' | 'kinetics_temp' | 'tlc_plate' | 'recrystallization' | 'conductometry';
}

export interface QuizQuestion {
  id: string;
  topic: ChemistryTopic;
  topicLabel: string;
  level: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  marks: number;
}

export interface Flashcard {
  id: string;
  topic: ChemistryTopic;
  front: string;
  back: string;
  explanation: string;
  difficulty: 'easy' | 'medium' | 'difficult';
  lastReviewed?: string;
}

export interface StudyPlanWeek {
  weekNumber: number;
  theme: string;
  dailyTopics: string[];
  milestoneQuiz: string;
}

export interface StudyPlan {
  id: string;
  level: AcademicLevel;
  hoursPerWeek: number;
  targetSubject: string;
  examDate: string;
  weeks: StudyPlanWeek[];
}

export interface StudentProgress {
  topicMastery: Record<ChemistryTopic, number>;
  questionsCount: number;
  topicsCompleted: string[];
  quizScores: Array<{ id: string; date: string; topic: string; score: number; total: number }>;
  weakTopics: string[];
  streakDays: number;
  examReadinessScore: number;
}

export interface VivaEvaluation {
  conceptStatus: 'Correct' | 'Partially Correct' | 'Incorrect';
  conceptFeedback: string;
  explanationQuality: 'Thorough' | 'Acceptable' | 'Needs Improvement';
  missingSubtleties: string[];
  score: number; // out of 10
  detailedProfessorVerdict: string;
  followUpQuestion: string;
}

export interface ExamPaper {
  id: string;
  title: string;
  level: AcademicLevel;
  durationMinutes: number;
  totalMarks: number;
  instructions: string[];
  sections: Array<{
    sectionName: string;
    marksPerQuestion: number;
    description: string;
    questions: Array<{
      id: string;
      qNumber: string;
      text: string;
      type: '1 mark' | '2 marks' | '5 marks' | '10 marks' | 'numerical' | 'mechanism' | 'essay';
      marks: number;
      markingScheme: string;
      modelAnswer: string;
    }>;
  }>;
}
