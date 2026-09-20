import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  MessageSquareQuote,
  HelpCircle,
  Check,
  BookmarkPlus,
  ArrowUpRight,
  X,
  Flame,
  Lightbulb,
  ExternalLink,
  Target,
  Send,
} from 'lucide-react';
import { DiagramPayload, MechanismStep, DiagramQAAnswer, Flashcard, ChemistryTopic } from '../types.ts';
import { MathRenderer } from './MathRenderer.tsx';
import { answerDiagramQuestion } from '../data/chemistryEngine.ts';

interface InteractiveDiagramProps {
  diagram?: DiagramPayload;
  mechanismSteps?: MechanismStep[];
  topic?: string;
  onAskInMainChat?: (question: string) => void;
  onAddFlashcard?: (card: Partial<Flashcard>) => void;
}

const DIAGRAM_TYPE_LABELS: Record<string, string> = {
  energy: 'Reaction Coordinate & Free Energy Profile',
  mechanism: 'Reaction Mechanism & Electron Flow',
  titration: 'Acid-Base Neutralization & Titration Curve',
  cft: 'Crystal Field Theory & d-Orbital Splitting',
  mo: 'Molecular Orbital (MO) Energy Diagram',
  galvanic: 'Galvanic Daniell Cell & Electron Flow',
  spectroscopy: 'FTIR & 1H-NMR Diagnostic Spectra',
  molecule3d: 'Interactive 3D Spatial Geometry',
};

const SUGGESTED_DIAGRAM_QUESTIONS: Record<string, Array<{ label: string; component: string; question: string }>> = {
  energy: [
    {
      label: 'Why is TS 1 the Rate-Determining Step?',
      component: 'Transition State 1 (TS 1 ‡)',
      question: 'Why is TS 1 higher in energy than TS 2, and how does this make step 1 the Rate-Determining Step (RDS)?',
    },
    {
      label: 'What does the intermediate well represent?',
      component: 'Reaction Intermediate (Energy Valley)',
      question: 'What does the depth of the intermediate potential energy well tell us about its physical lifetime and stability?',
    },
    {
      label: 'How does a catalyst change this coordinate?',
      component: 'Activation Energy Barriers (Ea1 / Ea2)',
      question: 'How does the introduction of a catalyst alter the activation barriers and transition states on this curve?',
    },
    {
      label: 'Is this reaction thermodynamically favorable?',
      component: 'Standard Free Energy of Reaction (ΔG°)',
      question: 'Why is this reaction exergonic (ΔG° < 0), and does thermodynamic favorability guarantee a fast reaction?',
    },
  ],
  titration: [
    {
      label: 'Why does pH = pKa at half-equivalence?',
      component: 'Half-Equivalence Point (V½, pH = pKa)',
      question: 'Derive from the Henderson-Hasselbalch equation why pH equals pKa at exactly half the equivalence volume (12.5 mL).',
    },
    {
      label: 'Why is equivalence point pH > 7 for weak acid?',
      component: 'Equivalence Point (Inflection Leap)',
      question: 'Why is the equivalence point pH basic (pH ~8.7) for acetic acid rather than neutral (pH = 7.00)?',
    },
    {
      label: 'How to select the right indicator?',
      component: 'Indicator Transition Range (Phenolphthalein)',
      question: 'How do you choose between Phenolphthalein and Methyl Orange based on this titration inflection curve?',
    },
    {
      label: 'Explain buffer capacity across this curve',
      component: 'Buffer Region (pH ≈ pKa ± 1)',
      question: 'Explain how buffer capacity (β) changes across the titration and why the slope is flattest near V½.',
    },
  ],
  cft: [
    {
      label: 'Why do eg orbitals destabilize by +0.6 Δo?',
      component: 'eg Orbitals (dx²-y², dz²)',
      question: 'Why do the eg orbitals experience greater electrostatic repulsion than t2g orbitals in an octahedral ligand field?',
    },
    {
      label: 'Explain Jahn-Teller distortion in Cu²⁺',
      component: 'Jahn-Teller Tetragonal (D₄h) Distortion',
      question: 'How does the Jahn-Teller theorem explain tetragonal elongation and split the eg and t2g levels in d⁹ Cu²⁺?',
    },
    {
      label: 'What governs High-Spin vs Low-Spin?',
      component: 'Crystal Field Splitting Parameter (Δo)',
      question: 'What factors determine whether a transition metal complex adopts a high-spin or low-spin configuration?',
    },
    {
      label: 'Why is tetrahedral splitting Δt = 4/9 Δo?',
      component: 'Tetrahedral vs Octahedral Splitting',
      question: 'Why is the tetrahedral crystal field splitting energy (Δt) only four-ninths of the octahedral splitting (Δo)?',
    },
  ],
  mo: [
    {
      label: 'Why does liquid O₂ stick to magnets?',
      component: 'HOMO Degenerate π*2p Antibonding Orbitals',
      question: 'How does this Molecular Orbital diagram explain the observed paramagnetism of liquid oxygen (S = 1)?',
    },
    {
      label: 'How is the bond order calculated?',
      component: 'Bond Order Formula',
      question: 'Calculate the bond order for O₂ from this diagram and predict what happens to bond strength upon ionization to O₂⁺.',
    },
    {
      label: 'Why is orbital ordering different in N₂ vs O₂?',
      component: '2s-2p Orbital Mixing (sp-mixing)',
      question: 'Why does the σ2pz orbital lie above the π2p orbitals in N₂, but below π2p in O₂ (sp-mixing effect)?',
    },
    {
      label: 'Distinguish bonding vs antibonding nodes',
      component: 'Nodal Planes in Antibonding Orbitals',
      question: 'Explain the physical significance of the inter-nuclear nodal plane in the σ* and π* antibonding orbitals.',
    },
  ],
  galvanic: [
    {
      label: 'Why do electrons travel from Zn to Cu?',
      component: 'External Circuit Electron Flow',
      question: 'Why do electrons flow spontaneously from the zinc anode to the copper cathode, and what drives this standard EMF of +1.10 V?',
    },
    {
      label: 'What is the function of the salt bridge?',
      component: 'Salt Bridge (KCl / KNO₃ Gel)',
      question: 'What would happen to cell potential and current if the salt bridge were removed, and why are K⁺ and Cl⁻ ions chosen?',
    },
    {
      label: 'How to use Nernst equation if [Zn²⁺] changes?',
      component: 'Nernst Equation & Cell Potential',
      question: 'Use the Nernst equation to calculate the Daniell cell potential if [Zn²⁺] is increased to 2.0 M and [Cu²⁺] is 0.01 M.',
    },
    {
      label: 'Why is cell potential 0.00 V at equilibrium?',
      component: 'Chemical Equilibrium in Batteries',
      question: 'Why does the voltmeter eventually drop to exactly 0.00 V as a battery discharges, and what is Q equal to at that point?',
    },
  ],
  spectroscopy: [
    {
      label: 'Why is the carbonyl C=O peak so intense?',
      component: 'FTIR Carbonyl C=O Stretch (1715 cm⁻¹)',
      question: 'Why does the carbonyl stretch give such a sharp, intense absorption band near 1715 cm⁻¹ compared to a C=C stretch?',
    },
    {
      label: 'Explain triplet-quartet splitting (n+1 rule)',
      component: 'NMR Spin-Spin J-Coupling (Triplet/Quartet)',
      question: 'Explain how the ethyl group (-CH₂CH₃) generates a 2H quartet and 3H triplet via the (n+1) spin coupling rule.',
    },
    {
      label: 'Why is TMS set to 0.00 ppm?',
      component: 'Tetramethylsilane (TMS) Standard',
      question: 'Why is Tetramethylsilane (TMS) chosen as the universal chemical shift reference at exactly 0.00 ppm in ¹H-NMR?',
    },
    {
      label: 'Distinguish ester vs carboxylic acid',
      component: 'Diagnostic Functional Group Bands',
      question: 'How do you distinguish between an ester and a carboxylic acid using both FTIR (O-H broad vs sharp) and ¹H-NMR?',
    },
  ],
  mechanism: [
    {
      label: 'Why is Step 1 the slowest step?',
      component: 'Rate-Determining Heterolytic Cleavage',
      question: 'Why does Step 1 (heterolytic bond cleavage) have the highest activation energy in this reaction mechanism?',
    },
    {
      label: 'What do curved electron arrows signify?',
      component: 'Curved Arrow Formalism',
      question: 'Explain the strict electron-pair conventions for curved arrows: where does the tail start and where does the head point?',
    },
    {
      label: 'Why does this cause racemization vs inversion?',
      component: 'Stereochemical Consequence',
      question: 'Explain why planar intermediate geometry leads to racemization in SN1, whereas backside attack leads to Walden inversion in SN2.',
    },
  ],
  molecule3d: [
    {
      label: 'Explain orbital hybridization and bond angles',
      component: 'VSEPR Molecular Geometry',
      question: 'Explain the orbital hybridization (sp³, sp², sp) and theoretical bond angles for this 3D molecular structure.',
    },
    {
      label: 'Discuss molecular dipole and symmetry',
      component: 'Dipole Moment & Symmetry Point Group',
      question: 'Is this molecule polar or non-polar? Explain how individual bond dipoles add or cancel based on symmetry.',
    },
  ],
};

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  diagram,
  mechanismSteps,
  topic = 'organic',
  onAskInMainChat,
  onAddFlashcard,
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMolecule, setSelectedMolecule] = useState<'benzene' | 'water' | 'caffeine' | 'cisplatin' | 'methane' | 'ethanol' | 'aspirin' | 'ammonia'>('benzene');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const qaSectionRef = useRef<HTMLDivElement | null>(null);

  // Diagram Q&A State
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [diagramQuestion, setDiagramQuestion] = useState<string>('');
  const [isAnswering, setIsAnswering] = useState<boolean>(false);
  const [qaAnswer, setQaAnswer] = useState<DiagramQAAnswer | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);
  const [qaError, setQaError] = useState<string | null>(null);

  // Helper to determine the diagram type
  const resolveDiagramType = (d?: DiagramPayload, t?: string, steps?: MechanismStep[]) => {
    if (d?.type) return d.type;
    const lowerTopic = (t || '').toLowerCase();
    if (lowerTopic.includes('spectroscop') || lowerTopic.includes('nmr') || lowerTopic.includes('ftir')) return 'spectroscopy';
    if (lowerTopic.includes('electrochem') || lowerTopic.includes('nernst') || lowerTopic.includes('redox') || lowerTopic.includes('galvanic')) return 'galvanic';
    if (lowerTopic.includes('coordination') || lowerTopic.includes('cft') || lowerTopic.includes('jahn teller') || lowerTopic.includes('inorganic')) return 'cft';
    if (lowerTopic.includes('quantum') || lowerTopic.includes('orbital') || lowerTopic.includes('mo')) return 'mo';
    if (lowerTopic.includes('analytical') || lowerTopic.includes('titrat') || lowerTopic.includes('buffer')) return 'titration';
    if (steps && steps.length > 0) return 'mechanism';
    return 'energy';
  };

  const [activeDiagramType, setActiveDiagramType] = useState<string>(() => resolveDiagramType(diagram, topic, mechanismSteps));
  const [activeTab, setActiveTab] = useState<'visual' | '3d' | 'steps'>(() => {
    if (diagram?.type === 'molecule3d') return '3d';
    return 'visual';
  });

  // Keep state synchronized when props change
  useEffect(() => {
    const resolved = resolveDiagramType(diagram, topic, mechanismSteps);
    setActiveDiagramType(resolved);
    if (diagram?.type === 'molecule3d') {
      setActiveTab('3d');
    } else {
      setActiveTab('visual');
    }
  }, [diagram, topic, mechanismSteps]);

  // Diagram Sub-Type details from payload
  const subType = diagram?.data?.subType || 'standard';
  const diagramDetails = diagram?.data?.details || {};

  // Interactive 3D Canvas rendering for molecules
  useEffect(() => {
    if (activeTab !== '3d' && activeDiagramType !== 'molecule3d') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let angleX = 0.4;
    let angleY = 0.5;
    let isDragging = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - lastMouseX;
      const deltaY = e.clientY - lastMouseY;
      angleY += deltaX * 0.01;
      angleX += deltaY * 0.01;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        lastMouseX = e.touches[0].clientX;
        lastMouseY = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - lastMouseX;
      const deltaY = e.touches[0].clientY - lastMouseY;
      angleY += deltaX * 0.01;
      angleX += deltaY * 0.01;
      lastMouseX = e.touches[0].clientX;
      lastMouseY = e.touches[0].clientY;
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);

    type Atom = { x: number; y: number; z: number; color: string; radius: number; label: string };
    type Bond = [number, number, boolean?];

    const getMoleculeData = (mol: string): { atoms: Atom[]; bonds: Bond[] } => {
      if (mol === 'water') {
        return {
          atoms: [
            { x: 0, y: -10, z: 0, color: '#ef4444', radius: 18, label: 'O' },
            { x: -50, y: 35, z: 0, color: '#f8fafc', radius: 12, label: 'H' },
            { x: 50, y: 35, z: 0, color: '#f8fafc', radius: 12, label: 'H' },
          ],
          bonds: [
            [0, 1],
            [0, 2],
          ],
        };
      }
      if (mol === 'methane') {
        return {
          atoms: [
            { x: 0, y: 0, z: 0, color: '#334155', radius: 18, label: 'C' },
            { x: 0, y: -60, z: 0, color: '#f8fafc', radius: 12, label: 'H' },
            { x: 55, y: 20, z: 0, color: '#f8fafc', radius: 12, label: 'H' },
            { x: -28, y: 20, z: 50, color: '#f8fafc', radius: 12, label: 'H' },
            { x: -28, y: 20, z: -50, color: '#f8fafc', radius: 12, label: 'H' },
          ],
          bonds: [
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
          ],
        };
      }
      if (mol === 'ammonia') {
        return {
          atoms: [
            { x: 0, y: -15, z: 0, color: '#3b82f6', radius: 18, label: 'N' },
            { x: 45, y: 25, z: 0, color: '#f8fafc', radius: 12, label: 'H' },
            { x: -25, y: 25, z: 40, color: '#f8fafc', radius: 12, label: 'H' },
            { x: -25, y: 25, z: -40, color: '#f8fafc', radius: 12, label: 'H' },
          ],
          bonds: [
            [0, 1],
            [0, 2],
            [0, 3],
          ],
        };
      }
      if (mol === 'ethanol') {
        return {
          atoms: [
            { x: -60, y: 10, z: 0, color: '#334155', radius: 16, label: 'C' },
            { x: 0, y: -10, z: 0, color: '#334155', radius: 16, label: 'C' },
            { x: 55, y: 15, z: 0, color: '#ef4444', radius: 16, label: 'O' },
            { x: 95, y: -5, z: 0, color: '#f8fafc', radius: 11, label: 'H' },
            { x: -60, y: 55, z: 0, color: '#f8fafc', radius: 11, label: 'H' },
            { x: -95, y: -10, z: 30, color: '#f8fafc', radius: 11, label: 'H' },
            { x: -95, y: -10, z: -30, color: '#f8fafc', radius: 11, label: 'H' },
            { x: 0, y: -55, z: 25, color: '#f8fafc', radius: 11, label: 'H' },
            { x: 0, y: -55, z: -25, color: '#f8fafc', radius: 11, label: 'H' },
          ],
          bonds: [
            [0, 1],
            [1, 2],
            [2, 3],
            [0, 4],
            [0, 5],
            [0, 6],
            [1, 7],
            [1, 8],
          ],
        };
      }
      if (mol === 'cisplatin') {
        return {
          atoms: [
            { x: 0, y: 0, z: 0, color: '#a855f7', radius: 22, label: 'Pt' },
            { x: -60, y: -60, z: 0, color: '#10b981', radius: 17, label: 'Cl' },
            { x: -60, y: 60, z: 0, color: '#10b981', radius: 17, label: 'Cl' },
            { x: 60, y: -60, z: 0, color: '#3b82f6', radius: 15, label: 'NH₃' },
            { x: 60, y: 60, z: 0, color: '#3b82f6', radius: 15, label: 'NH₃' },
          ],
          bonds: [
            [0, 1],
            [0, 2],
            [0, 3],
            [0, 4],
          ],
        };
      }
      // Default: Benzene ring
      const r = 65;
      const atoms: Atom[] = [];
      const bonds: Bond[] = [];
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        atoms.push({
          x: r * Math.cos(theta),
          y: r * Math.sin(theta),
          z: 0,
          color: '#38bdf8',
          radius: 16,
          label: 'C',
        });
        atoms.push({
          x: (r + 40) * Math.cos(theta),
          y: (r + 40) * Math.sin(theta),
          z: 0,
          color: '#f8fafc',
          radius: 11,
          label: 'H',
        });
      }
      for (let i = 0; i < 6; i++) {
        bonds.push([i * 2, ((i + 1) % 6) * 2, i % 2 === 0]);
        bonds.push([i * 2, i * 2 + 1]);
      }
      return { atoms, bonds };
    };

    const { atoms, bonds } = getMoleculeData(selectedMolecule);

    const render = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Project 3D points
      const projected = atoms.map((atom) => {
        // Rotate around Y
        const x1 = atom.x * Math.cos(angleY) + atom.z * Math.sin(angleY);
        const z1 = -atom.x * Math.sin(angleY) + atom.z * Math.cos(angleY);
        // Rotate around X
        const y2 = atom.y * Math.cos(angleX) - z1 * Math.sin(angleX);
        const z2 = atom.y * Math.sin(angleX) + z1 * Math.cos(angleX);

        const fov = 400;
        const scale = fov / (fov + z2);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
          radius: Math.max(8, atom.radius * scale),
          color: atom.color,
          label: atom.label,
        };
      });

      // Draw Bonds
      bonds.forEach(([i, j, isDouble]) => {
        const p1 = projected[i];
        const p2 = projected[j];
        ctx.strokeStyle = isDouble ? '#38bdf8' : '#64748b';
        ctx.lineWidth = isDouble ? 5 : 3;
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.stroke();
      });

      // Sort atoms by Z for Painter's Algorithm
      const sorted = [...projected].sort((a, b) => b.z - a.z);

      // Draw Atoms
      sorted.forEach((p) => {
        const grad = ctx.createRadialGradient(
          p.x - p.radius * 0.3,
          p.y - p.radius * 0.3,
          p.radius * 0.1,
          p.x,
          p.y,
          p.radius
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, p.color);
        grad.addColorStop(1, '#020617');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.round(p.radius * 0.8)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.label, p.x, p.y);
      });

      if (!isDragging) {
        angleY += 0.005;
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [activeTab, activeDiagramType, selectedMolecule]);

  // Handle selecting a specific hotspot on the diagram
  const handleSelectComponent = (componentName: string, suggestedQuestion?: string) => {
    setSelectedComponent(componentName);
    if (suggestedQuestion) {
      setDiagramQuestion(suggestedQuestion);
    }
    // Smooth scroll down to Q&A section
    setTimeout(() => {
      qaSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  };

  // Submit question about the diagram
  const handleAskDiagramQuestion = async (overrideQuestion?: string) => {
    const q = (overrideQuestion || diagramQuestion).trim();
    if (!q) return;

    setIsAnswering(true);
    setQaError(null);

    try {
      const res = await fetch('/api/diagram-qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          diagramType: activeDiagramType,
          diagramTitle: diagram?.title || DIAGRAM_TYPE_LABELS[activeDiagramType] || 'Chemical Visualizer',
          diagramData: diagram?.data || {},
          selectedComponent: selectedComponent || undefined,
          topic,
        }),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.answer) {
          setQaAnswer(json.answer);
          setIsAnswering(false);
          return;
        }
      }
      throw new Error('Fallback to local engine');
    } catch {
      // Instant institutional client-side diagram answer
      const localAnswer = answerDiagramQuestion({
        question: q,
        diagramType: activeDiagramType,
        diagramTitle: diagram?.title || DIAGRAM_TYPE_LABELS[activeDiagramType] || 'Chemical Visualizer',
        diagramData: diagram?.data || {},
        selectedComponent: selectedComponent || undefined,
        topic,
      });
      setQaAnswer(localAnswer);
    } finally {
      setIsAnswering(false);
    }
  };

  // Export SVG utility
  const handleDownloadSvg = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(diagram?.title || 'chemistry-diagram').toLowerCase().replace(/\s+/g, '-')}.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Question chips for the active diagram
  const activeSuggestedQuestions = SUGGESTED_DIAGRAM_QUESTIONS[activeDiagramType] || SUGGESTED_DIAGRAM_QUESTIONS.energy;

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col my-3 transition-all">
      {/* Top Header & Navigation Bar */}
      <div className="px-4 py-3 bg-slate-950/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs sm:text-sm font-serif font-bold text-slate-100 tracking-wide">
                {diagram?.title || DIAGRAM_TYPE_LABELS[activeDiagramType] || 'Interactive Chemical Model'}
              </h4>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20 font-semibold uppercase">
                {activeDiagramType}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono">
              Click visual elements or ask questions below to analyze exact physical coordinates
            </p>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-mono">
          <button
            onClick={() => setActiveTab('visual')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'visual'
                ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2D Vector View
          </button>
          {mechanismSteps && mechanismSteps.length > 0 && (
            <button
              onClick={() => setActiveTab('steps')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'steps'
                  ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Step Breakdown ({mechanismSteps.length})
            </button>
          )}
          <button
            onClick={() => setActiveTab('3d')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === '3d'
                ? 'bg-teal-500/20 text-teal-300 font-bold border border-teal-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3D Spatial Model
          </button>
        </div>
      </div>

      {/* Secondary Controls Bar: Mode selector, Zoom, Download */}
      <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Quick Diagram Type Switcher */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full py-1">
          <span className="text-[11px] font-mono text-slate-500 shrink-0">Model:</span>
          {Object.entries(DIAGRAM_TYPE_LABELS).map(([key, label]) => (
            <button
              key={key}
              onClick={() => {
                setActiveDiagramType(key);
                setSelectedComponent(null);
                setQaAnswer(null);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-mono whitespace-nowrap transition-all ${
                activeDiagramType === key
                  ? 'bg-teal-500/20 text-teal-300 border-teal-500/40 font-bold'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border-slate-800'
              }`}
            >
              {key === 'energy' ? 'Energy Profile' : key === 'cft' ? 'CFT Splitting' : key === 'mo' ? 'MO Theory' : key === 'galvanic' ? 'Daniell Cell' : key === 'titration' ? 'Titration' : key === 'spectroscopy' ? 'FTIR/NMR' : key === 'mechanism' ? 'Mechanism' : '3D Spatial'}
            </button>
          ))}
        </div>

        {/* Zoom & Download Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 2.0))}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(1)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-all"
            title="Reset Zoom"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={handleDownloadSvg}
            className="p-1.5 text-slate-400 hover:text-teal-400 hover:bg-slate-800 rounded-lg transition-all"
            title="Export Vector SVG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Visual Stage */}
      <div className="relative w-full min-h-[360px] bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
        {/* Active Hotspot Notification Pill */}
        {selectedComponent && (
          <div className="absolute top-3 left-3 z-20 flex items-center gap-2 px-3 py-1.5 bg-teal-950/90 border border-teal-500/50 rounded-xl text-xs text-teal-300 font-mono shadow-lg backdrop-blur-sm animate-fadeIn">
            <Target className="w-3.5 h-3.5 text-teal-400 animate-pulse" />
            <span>Target: <strong>{selectedComponent}</strong></span>
            <button
              onClick={() => setSelectedComponent(null)}
              className="text-slate-400 hover:text-white ml-1"
              title="Clear selection"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 3D Tab */}
        {activeTab === '3d' && (
          <div className="w-full flex flex-col items-center justify-center space-y-3">
            <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1">
              <span className="text-[11px] font-mono text-slate-500 mr-1">Select Molecule:</span>
              {(['benzene', 'water', 'methane', 'ammonia', 'ethanol', 'cisplatin', 'caffeine', 'aspirin'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMolecule(m)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all ${
                    selectedMolecule === m
                      ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-bold'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
            <canvas
              ref={canvasRef}
              width={560}
              height={320}
              className="max-w-full cursor-grab active:cursor-grabbing rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-inner"
            />
            <span className="text-[11px] font-mono text-slate-400">
              Drag or touch canvas to rotate molecule in 3D spatial space • Auto-rotating
            </span>
          </div>
        )}

        {/* Step Breakdown Tab */}
        {activeTab === 'steps' && mechanismSteps && mechanismSteps.length > 0 && (
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                  {mechanismSteps[activeStep]?.stepNumber || activeStep + 1}
                </span>
                <h4 className="font-serif font-bold text-slate-100 text-sm sm:text-base">
                  {mechanismSteps[activeStep]?.title}
                </h4>
              </div>
              <div className="flex items-center gap-1 text-xs font-mono text-slate-400">
                <span>Step {activeStep + 1} of {mechanismSteps.length}</span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
              {mechanismSteps[activeStep]?.description}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div>
                <span className="text-slate-500 block">Reactant Center:</span>
                <span className="text-teal-300 font-bold">{mechanismSteps[activeStep]?.reactant}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Intermediate / Product:</span>
                <span className="text-indigo-300 font-bold">{mechanismSteps[activeStep]?.intermediateOrProduct}</span>
              </div>
              {mechanismSteps[activeStep]?.arrowNote && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800/80">
                  <span className="text-amber-400 block font-semibold">Curved Electron Arrow Note:</span>
                  <span className="text-slate-300">{mechanismSteps[activeStep]?.arrowNote}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                disabled={activeStep === 0}
                onClick={() => setActiveStep((s) => Math.max(s - 1, 0))}
                className="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-mono"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous Step
              </button>
              <button
                disabled={activeStep === mechanismSteps.length - 1}
                onClick={() => setActiveStep((s) => Math.min(s + 1, mechanismSteps.length - 1))}
                className="px-3 py-1.5 rounded-lg border border-teal-500/40 bg-teal-600/20 text-teal-300 hover:bg-teal-600/30 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 text-xs font-mono font-bold"
              >
                Next Step
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* 2D Vector Visual Tab */}
        {activeTab === 'visual' && (
          <div
            className="w-full flex items-center justify-center overflow-auto transition-transform duration-200"
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
          >
            <div className="w-full max-w-4xl aspect-[16/9] max-h-[460px]">
              <svg
                ref={svgRef}
                viewBox="0 0 760 360"
                className="w-full h-full drop-shadow-md select-none"
              >
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="8"
                    markerHeight="6"
                    refX="7"
                    refY="3"
                    orient="auto"
                  >
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                  <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="3" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* 1. REACTION MECHANISM FLOW */}
                {activeDiagramType === 'mechanism' && (
                  <g>
                    <rect x="30" y="80" width="180" height="140" rx="10" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
                    <text x="120" y="110" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">Starting Substrate</text>
                    <text x="120" y="140" textAnchor="middle" fill="#f8fafc" fontSize="16" fontFamily="monospace">R — LG</text>
                    <text x="120" y="165" textAnchor="middle" fill="#94a3b8" fontSize="11">Polar C-LG Bond (δ⁺/δ⁻)</text>
                    <text x="120" y="195" textAnchor="middle" fill="#64748b" fontSize="10">Substrate Activation</text>

                    {/* Arrow 1 */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Curved Arrow (Heterolytic Cleavage)', 'What does the double-barbed curved arrow represent in this step?')}
                    >
                      <path d="M 220 150 Q 255 120 285 145" fill="none" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrowhead)" />
                      <text x="255" y="110" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">- LG⁻ Departure</text>
                      <text x="255" y="175" textAnchor="middle" fill="#94a3b8" fontSize="10">TS 1 ‡ (RDS)</text>
                    </g>

                    {/* Intermediate Box */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Reaction Intermediate (Planar sp² Carbocation)', 'Why is the carbocation intermediate planar, and how does that affect stereochemistry?')}
                    >
                      <rect
                        x="295"
                        y="80"
                        width="180"
                        height="140"
                        rx="10"
                        fill="#1e293b"
                        stroke={selectedComponent?.includes('Intermediate') ? '#38bdf8' : '#a855f7'}
                        strokeWidth={selectedComponent?.includes('Intermediate') ? 3 : 2}
                        filter={selectedComponent?.includes('Intermediate') ? 'url(#glow)' : undefined}
                      />
                      <text x="385" y="110" textAnchor="middle" fill="#c084fc" fontSize="13" fontWeight="bold">Carbocation Intermediate</text>
                      <text x="385" y="145" textAnchor="middle" fill="#f8fafc" fontSize="18" fontFamily="monospace">R⁺ [Empty 2pz]</text>
                      <text x="385" y="170" textAnchor="middle" fill="#38bdf8" fontSize="11">Planar sp² Hybrid (120°)</text>
                      <text x="385" y="195" textAnchor="middle" fill="#94a3b8" fontSize="10">Equal Top/Bottom Attack</text>
                    </g>

                    {/* Arrow 2 */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Nucleophilic Capture Arrow', 'How does the nucleophile donate its lone pair into the empty p orbital?')}
                    >
                      <path d="M 485 150 Q 515 120 545 145" fill="none" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)" />
                      <text x="515" y="110" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">+ Nu⁻ Attack</text>
                      <text x="515" y="175" textAnchor="middle" fill="#94a3b8" fontSize="10">Fast Capture</text>
                    </g>

                    {/* Product Box */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Final Substituted Product', 'What stereochemical mixture is formed in this product?')}
                    >
                      <rect
                        x="555"
                        y="80"
                        width="180"
                        height="140"
                        rx="10"
                        fill="#0f172a"
                        stroke={selectedComponent?.includes('Product') ? '#38bdf8' : '#10b981'}
                        strokeWidth={selectedComponent?.includes('Product') ? 3 : 2}
                      />
                      <text x="645" y="110" textAnchor="middle" fill="#10b981" fontSize="13" fontWeight="bold">Substituted Product</text>
                      <text x="645" y="145" textAnchor="middle" fill="#f8fafc" fontSize="18" fontFamily="monospace">R — Nu</text>
                      <text x="645" y="170" textAnchor="middle" fill="#94a3b8" fontSize="11">Inversion + Retention</text>
                      <text x="645" y="195" textAnchor="middle" fill="#34d399" fontSize="10">Racemic Mixture (50:50)</text>
                    </g>

                    {/* Bottom banner */}
                    <rect x="60" y="270" width="640" height="40" rx="8" fill="#0f172a" stroke="#334155" />
                    <text x="380" y="295" textAnchor="middle" fill="#cbd5e1" fontSize="11">
                      Rate Law: Rate = k[Substrate] • Governed by planar carbocation stability (3° &gt; 2° &gt;&gt; 1°) • Solvent protic stabilization
                    </text>
                  </g>
                )}

                {/* 2. REACTION COORDINATE & POTENTIAL ENERGY PROFILE */}
                {activeDiagramType === 'energy' && (
                  <g>
                    {/* Axes */}
                    <line x1="80" y1="40" x2="80" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="80" y1="300" x2="710" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="45" y="50" fill="#94a3b8" fontSize="12" fontWeight="bold">Gibbs Free Energy (G)</text>
                    <text x="680" y="325" fill="#94a3b8" fontSize="12" fontWeight="bold">Reaction Coordinate</text>

                    {/* Free Energy Curve */}
                    <path
                      d="M 100 240 Q 180 240 230 110 T 350 160 T 480 90 T 660 210"
                      fill="none"
                      stroke="url(#curveGrad)"
                      strokeWidth="4"
                    />

                    {/* Reactants Point */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Reactants Ground State', 'What governs the initial free energy level of the reactants?')}
                    >
                      <circle cx="110" cy="240" r={selectedComponent?.includes('Reactants') ? 8 : 5} fill="#38bdf8" />
                      <text x="110" y="265" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">Reactants</text>
                    </g>

                    {/* TS 1 Point */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Transition State 1 (TS 1 ‡)', 'Why is TS 1 higher in energy than TS 2, making it the Rate Determining Step (RDS)?')}
                    >
                      <circle
                        cx="230"
                        cy="110"
                        r={selectedComponent?.includes('TS 1') ? 9 : 6}
                        fill="#f59e0b"
                        filter={selectedComponent?.includes('TS 1') ? 'url(#glow)' : undefined}
                      />
                      <text x="230" y="85" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="bold">TS 1 ‡</text>
                      <text x="230" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="10">(RDS Barrier, ΔG‡₁)</text>
                    </g>

                    {/* Intermediate Point */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Reaction Intermediate (Carbocation Well)', 'What does the depth of the intermediate potential energy well represent?')}
                    >
                      <circle
                        cx="350"
                        cy="160"
                        r={selectedComponent?.includes('Intermediate') ? 8 : 5}
                        fill="#a855f7"
                        filter={selectedComponent?.includes('Intermediate') ? 'url(#glow)' : undefined}
                      />
                      <text x="350" y="185" textAnchor="middle" fill="#c084fc" fontSize="12" fontWeight="bold">Intermediate (R⁺)</text>
                      <text x="350" y="198" textAnchor="middle" fill="#94a3b8" fontSize="9">Local Energy Minimum</text>
                    </g>

                    {/* TS 2 Point */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Transition State 2 (TS 2 ‡)', 'Why does TS 2 have a lower activation barrier than TS 1?')}
                    >
                      <circle cx="480" cy="90" r={selectedComponent?.includes('TS 2') ? 8 : 5} fill="#ec4899" />
                      <text x="480" y="70" textAnchor="middle" fill="#f472b6" fontSize="12" fontWeight="bold">TS 2 ‡</text>
                      <text x="480" y="82" textAnchor="middle" fill="#cbd5e1" fontSize="9">(Fast Capture Barrier)</text>
                    </g>

                    {/* Products Point */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Products & Overall ΔG°', 'Is this reaction thermodynamically favorable (exergonic)?')}
                    >
                      <circle cx="650" cy="210" r={selectedComponent?.includes('Products') ? 8 : 5} fill="#10b981" />
                      <text x="650" y="235" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">Products</text>
                    </g>

                    {/* ΔG° Indicator */}
                    <line x1="680" y1="240" x2="680" y2="210" stroke="#38bdf8" strokeWidth="2" />
                    <text x="715" y="230" fill="#38bdf8" fontSize="12" fontWeight="bold">ΔG° &lt; 0</text>
                    <text x="715" y="245" fill="#94a3b8" fontSize="9">(Exergonic)</text>

                    {/* Ea(1) Indicator */}
                    <line x1="100" y1="240" x2="230" y2="240" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="200" y1="240" x2="200" y2="110" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="180" y="180" fill="#fbbf24" fontSize="11" fontWeight="bold">Ea (1)</text>
                  </g>
                )}

                {/* 3. ACID-BASE TITRATION & NEUTRALIZATION CURVE */}
                {activeDiagramType === 'titration' && (
                  <g>
                    <line x1="80" y1="40" x2="80" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="80" y1="300" x2="710" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="50" y="50" fill="#94a3b8" fontSize="12" fontWeight="bold">pH</text>
                    <text x="660" y="325" fill="#94a3b8" fontSize="11" fontWeight="bold">Volume of Titrant (mL)</text>

                    {[14, 12, 10, 8, 7, 4, 2, 0].map((ph) => {
                      const y = 300 - (ph / 14) * 260;
                      return (
                        <g key={ph}>
                          <line x1="75" y1={y} x2="80" y2={y} stroke="#64748b" />
                          <text x="68" y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{ph}</text>
                        </g>
                      );
                    })}

                    {/* Buffer Region Box */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Buffer Region (pH ≈ pKa ± 1)', 'Explain the buffer capacity and Henderson-Hasselbalch equation in this region.')}
                    >
                      <rect
                        x="130"
                        y="190"
                        width="190"
                        height="45"
                        rx="6"
                        fill="#0284c7"
                        fillOpacity="0.15"
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray="3,3"
                      />
                      <text x="225" y="215" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">Buffer Region (pH ≈ pKa ± 1)</text>
                    </g>

                    {/* Sigmoidal Neutralization Curve */}
                    <path
                      d="M 80 250 Q 200 220 300 200 T 360 160 L 375 75 T 460 60 L 680 55"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                    />

                    {/* Half-Equivalence Point */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Half-Equivalence Point (pH = pKa)', 'Why does pH equal pKa at the half-equivalence point?')}
                    >
                      <circle cx="227" cy="215" r={selectedComponent?.includes('Half') ? 7 : 5} fill="#38bdf8" />
                      <line x1="227" y1="215" x2="227" y2="300" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
                      <text x="227" y="185" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">Half-Eq: pH = pKa (4.76)</text>
                      <text x="227" y="315" textAnchor="middle" fill="#38bdf8" fontSize="10">V½ = 12.5 mL</text>
                    </g>

                    {/* Equivalence Point */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Equivalence Point (Inflection Leap)', 'Why is the equivalence point pH greater than 7.0 for a weak acid?')}
                    >
                      <circle
                        cx="370"
                        cy="115"
                        r={selectedComponent?.includes('Equivalence') ? 9 : 6}
                        fill="#f43f5e"
                        filter={selectedComponent?.includes('Equivalence') ? 'url(#glow)' : undefined}
                      />
                      <line x1="370" y1="115" x2="370" y2="300" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                      <line x1="80" y1="115" x2="370" y2="115" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                      <text x="440" y="115" fill="#f43f5e" fontSize="12" fontWeight="bold">Equivalence Point (pH 8.7)</text>
                      <text x="370" y="315" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">Veq = 25.0 mL</text>
                    </g>

                    {/* Indicator Range */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Indicator Transition Range (Phenolphthalein)', 'How do you choose the correct indicator based on the steep inflection of this curve?')}
                    >
                      <rect x="520" y="90" width="170" height="50" rx="6" fill="#1e293b" stroke="#f59e0b" />
                      <text x="605" y="110" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Phenolphthalein Range</text>
                      <text x="605" y="128" textAnchor="middle" fill="#f8fafc" fontSize="10">pH 8.2 (Colorless) → 10.0 (Pink)</text>
                    </g>
                  </g>
                )}

                {/* 4. CRYSTAL FIELD THEORY (CFT) d-ORBITAL SPLITTING */}
                {activeDiagramType === 'cft' && (
                  <g>
                    <text x="380" y="35" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="bold">
                      {subType === 'jahn_teller'
                        ? 'Jahn-Teller Tetragonal (D₄h) Distortion in d⁹ [Cu(H₂O)₆]²⁺'
                        : 'Octahedral Crystal Field (Oh) d-Orbital Splitting'}
                    </text>

                    {/* Free Ion degenerate d-orbitals */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Free Ion Degenerate d-Orbitals', 'Why are the 5 d-orbitals completely degenerate in a free metal ion?')}
                    >
                      <text x="120" y="115" textAnchor="middle" fill="#94a3b8" fontSize="11">Free Ion (Spherical)</text>
                      {[-40, -20, 0, 20, 40].map((dx, i) => (
                        <line key={`free-${i}`} x1={120 + dx - 8} y1={170} x2={120 + dx + 8} y2={170} stroke="#94a3b8" strokeWidth="2.5" />
                      ))}
                      <text x="120" y="195" textAnchor="middle" fill="#64748b" fontSize="10">Five Degenerate d</text>
                    </g>

                    {/* Barycenter line */}
                    <line x1="200" y1="170" x2="680" y2="170" stroke="#475569" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="690" y="174" fill="#64748b" fontSize="10">Barycenter</text>

                    {/* Octahedral Splitting */}
                    {subType !== 'jahn_teller' ? (
                      <g>
                        {/* eg set */}
                        <g
                          className="cursor-pointer group"
                          onClick={() => handleSelectComponent('eg Orbitals (dx²-y², dz²)', 'Why are the eg orbitals destabilized by +0.6 Δo?')}
                        >
                          <line x1="330" y1="110" x2="390" y2="110" stroke="#f43f5e" strokeWidth="3.5" />
                          <line x1="410" y1="110" x2="470" y2="110" stroke="#f43f5e" strokeWidth="3.5" />
                          <text x="400" y="95" textAnchor="middle" fill="#fda4af" fontSize="12" fontWeight="bold">eg set (+0.6 Δo)</text>
                          <text x="360" y="128" textAnchor="middle" fill="#94a3b8" fontSize="10">dx²-y²</text>
                          <text x="440" y="128" textAnchor="middle" fill="#94a3b8" fontSize="10">dz²</text>
                        </g>

                        {/* t2g set */}
                        <g
                          className="cursor-pointer group"
                          onClick={() => handleSelectComponent('t2g Orbitals (dxy, dyz, dxz)', 'Why are the t2g orbitals stabilized by -0.4 Δo below the barycenter?')}
                        >
                          <line x1="310" y1="220" x2="355" y2="220" stroke="#3b82f6" strokeWidth="3.5" />
                          <line x1="375" y1="220" x2="420" y2="220" stroke="#3b82f6" strokeWidth="3.5" />
                          <line x1="440" y1="220" x2="485" y2="220" stroke="#3b82f6" strokeWidth="3.5" />
                          <text x="400" y="245" textAnchor="middle" fill="#93c5fd" fontSize="12" fontWeight="bold">t2g set (-0.4 Δo)</text>
                          <text x="332" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">dxy</text>
                          <text x="397" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">dyz</text>
                          <text x="462" y="210" textAnchor="middle" fill="#94a3b8" fontSize="10">dxz</text>
                        </g>

                        {/* Δo bracket */}
                        <line x1="530" y1="110" x2="530" y2="220" stroke="#fbbf24" strokeWidth="2" />
                        <line x1="520" y1="110" x2="540" y2="110" stroke="#fbbf24" strokeWidth="1" />
                        <line x1="520" y1="220" x2="540" y2="220" stroke="#fbbf24" strokeWidth="1" />
                        <text x="560" y="170" fill="#fbbf24" fontSize="13" fontWeight="bold">Δo (10 Dq)</text>
                      </g>
                    ) : (
                      /* Jahn-Teller Tetragonal Splitting */
                      <g>
                        {/* eg split into dx2-y2 (higher) and dz2 (lower) */}
                        <g
                          className="cursor-pointer group"
                          onClick={() => handleSelectComponent('Jahn-Teller eg split (dx²-y² vs dz²)', 'Why does dz² stabilize while dx²-y² destabilizes upon axial ligand elongation?')}
                        >
                          <line x1="480" y1="75" x2="550" y2="75" stroke="#f43f5e" strokeWidth="3" />
                          <text x="515" y="65" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="bold">dx²-y² (higher repulsion)</text>

                          <line x1="480" y1="130" x2="550" y2="130" stroke="#f59e0b" strokeWidth="3" />
                          <text x="515" y="148" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">dz² (stabilized by elongation)</text>

                          <text x="580" y="105" fill="#f43f5e" fontSize="10">δ₁ split</text>
                        </g>

                        {/* t2g split into dxy (higher) and dxz, dyz (lower) */}
                        <g
                          className="cursor-pointer group"
                          onClick={() => handleSelectComponent('Jahn-Teller t2g split (dxy vs dxz, dyz)', 'Why do dxz and dyz drop in energy when axial ligands move away?')}
                        >
                          <line x1="480" y1="195" x2="550" y2="195" stroke="#3b82f6" strokeWidth="3" />
                          <text x="515" y="190" textAnchor="middle" fill="#93c5fd" fontSize="10">dxy</text>

                          <line x1="460" y1="240" x2="510" y2="240" stroke="#10b981" strokeWidth="3" />
                          <line x1="520" y1="240" x2="570" y2="240" stroke="#10b981" strokeWidth="3" />
                          <text x="515" y="260" textAnchor="middle" fill="#34d399" fontSize="10">dxz, dyz (stabilized)</text>
                        </g>

                        <text x="380" y="310" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">
                          Tetragonal Elongation (D₄h): 4 short equatorial Cu-O bonds (~1.96 Å), 2 long axial bonds (~2.30 Å)
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* 5. MOLECULAR ORBITAL (MO) ENERGY DIAGRAM */}
                {activeDiagramType === 'mo' && (
                  <g>
                    {/* Left: Atom A */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Atom A 2p Orbitals', 'How do atomic wavefunctions combine to form molecular orbitals (LCAO)?')}
                    >
                      <text x="120" y="45" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">Atom A (2p AOs)</text>
                      {[-35, 0, 35].map((dx, i) => (
                        <g key={`aoA-${i}`}>
                          <line x1={120 + dx - 14} y1={170} x2={120 + dx + 14} y2={170} stroke="#38bdf8" strokeWidth="3" />
                          <text x={120 + dx} y={164} textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">{i === 0 ? '↑↓' : '↑'}</text>
                          <text x={120 + dx} y={190} textAnchor="middle" fill="#94a3b8" fontSize="10">{i === 0 ? '2px' : i === 1 ? '2py' : '2pz'}</text>
                        </g>
                      ))}
                      <text x="120" y="215" textAnchor="middle" fill="#64748b" fontSize="11">Oxygen Atom A (2p⁴)</text>
                    </g>

                    {/* Right: Atom B */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Atom B 2p Orbitals', 'Explain Hund’s rule and Pauli exclusion in filling these atomic orbitals.')}
                    >
                      <text x="640" y="45" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">Atom B (2p AOs)</text>
                      {[-35, 0, 35].map((dx, i) => (
                        <g key={`aoB-${i}`}>
                          <line x1={640 + dx - 14} y1={170} x2={640 + dx + 14} y2={170} stroke="#38bdf8" strokeWidth="3" />
                          <text x={640 + dx} y={164} textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">{i === 0 ? '↑↓' : '↑'}</text>
                          <text x={640 + dx} y={190} textAnchor="middle" fill="#94a3b8" fontSize="10">{i === 0 ? '2px' : i === 1 ? '2py' : '2pz'}</text>
                        </g>
                      ))}
                      <text x="640" y="215" textAnchor="middle" fill="#64748b" fontSize="11">Oxygen Atom B (2p⁴)</text>
                    </g>

                    {/* Center MO Title */}
                    <text x="380" y="30" textAnchor="middle" fill="#fbbf24" fontSize="15" fontWeight="bold">O₂ Molecular Orbitals (LCAO)</text>

                    {/* σ*2pz Antibonding (LUMO) */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('σ*2pz LUMO Antibonding Orbital', 'Why is σ*2pz the Lowest Unoccupied Molecular Orbital (LUMO)?')}
                    >
                      <line x1="330" y1="65" x2="430" y2="65" stroke="#f43f5e" strokeWidth="3" />
                      <text x="380" y="58" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="bold">σ*2pz (LUMO, empty)</text>
                    </g>

                    {/* π*2px, π*2py Degenerate Antibonding (HOMO with 2 unpaired electrons) */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('HOMO Degenerate π*2p Orbitals (Paramagnetism)', 'Why do the two unpaired electrons in π* make liquid O2 paramagnetic?')}
                    >
                      <rect
                        x="290"
                        y="105"
                        width="180"
                        height="28"
                        rx="4"
                        fill="#1e293b"
                        stroke={selectedComponent?.includes('HOMO') ? '#38bdf8' : '#f59e0b'}
                        strokeWidth={selectedComponent?.includes('HOMO') ? 2.5 : 1.5}
                        filter={selectedComponent?.includes('HOMO') ? 'url(#glow)' : undefined}
                      />
                      <line x1="315" y1="120" x2="365" y2="120" stroke="#f59e0b" strokeWidth="3" />
                      <text x="340" y="116" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">↑</text>
                      <text x="340" y="132" textAnchor="middle" fill="#cbd5e1" fontSize="9">π*2px</text>

                      <line x1="395" y1="120" x2="445" y2="120" stroke="#f59e0b" strokeWidth="3" />
                      <text x="420" y="116" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">↑</text>
                      <text x="420" y="132" textAnchor="middle" fill="#cbd5e1" fontSize="9">π*2py</text>
                      <text x="485" y="123" fill="#f59e0b" fontSize="11" fontWeight="bold">HOMO (S=1 Paramagnetic)</text>
                    </g>

                    {/* π2px, π2py Degenerate Bonding */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Degenerate π2p Bonding Orbitals', 'Why are the bonding π orbitals filled with 4 electrons here?')}
                    >
                      <rect x="290" y="210" width="180" height="28" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                      <line x1="315" y1="225" x2="365" y2="225" stroke="#10b981" strokeWidth="3" />
                      <text x="340" y="222" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">↑↓</text>
                      <text x="340" y="236" textAnchor="middle" fill="#cbd5e1" fontSize="9">π2px</text>

                      <line x1="395" y1="225" x2="445" y2="225" stroke="#10b981" strokeWidth="3" />
                      <text x="420" y="222" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">↑↓</text>
                      <text x="420" y="236" textAnchor="middle" fill="#cbd5e1" fontSize="9">π2py</text>
                      <text x="485" y="228" fill="#10b981" fontSize="11" fontWeight="bold">π bonding (4e⁻)</text>
                    </g>

                    {/* σ2pz Bonding */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('σ2pz Bonding Orbital', 'Explain why σ2pz has zero nodal planes between the nuclei.')}
                    >
                      <line x1="330" y1="265" x2="430" y2="265" stroke="#10b981" strokeWidth="3" />
                      <text x="380" y="261" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">↑↓</text>
                      <text x="380" y="280" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">σ2pz bonding (2e⁻)</text>
                    </g>

                    <text x="380" y="325" textAnchor="middle" fill="#cbd5e1" fontSize="11">
                      Bond Order = (8 bonding - 4 antibonding) / 2 = 2.0 (Double Bond O=O) • Liquid O₂ adheres to magnetic poles
                    </text>
                  </g>
                )}

                {/* 6. GALVANIC DANIELL CELL */}
                {(activeDiagramType === 'galvanic' || activeDiagramType === 'electrochemistry') && (
                  <g>
                    <text x="380" y="35" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="bold">
                      Galvanic (Voltaic) Daniell Cell: Zn(s) | Zn²⁺(1 M) || Cu²⁺(1 M) | Cu(s)
                    </text>

                    {/* Circuit Wire & Voltmeter */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Voltmeter & External Wire Electron Flow', 'Why do electrons flow spontaneously from the Zn anode to the Cu cathode?')}
                    >
                      <path d="M 180 140 L 180 70 L 330 70" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                      <path d="M 430 70 L 580 70 L 580 140" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                      <polygon points="250,66 265,70 250,74" fill="#38bdf8" />
                      <text x="250" y="58" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">e⁻ flow →</text>
                      <polygon points="500,66 515,70 500,74" fill="#38bdf8" />
                      <text x="500" y="58" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">e⁻ flow →</text>

                      <circle cx="380" cy="70" r="32" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                      <text x="380" y="66" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold" fontFamily="monospace">+1.10 V</text>
                      <text x="380" y="82" textAnchor="middle" fill="#94a3b8" fontSize="9">E°cell (Standard)</text>
                    </g>

                    {/* Zinc Anode Half-Cell */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Zinc Anode (Oxidation)', 'Why is zinc oxidized rather than reduced in this spontaneous cell?')}
                    >
                      <rect x="110" y="140" width="140" height="150" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                      <rect x="115" y="190" width="130" height="95" rx="4" fill="#0284c7" fillOpacity="0.25" />
                      <text x="180" y="275" textAnchor="middle" fill="#38bdf8" fontSize="11">1.0 M ZnSO₄ (aq)</text>

                      <rect x="165" y="110" width="30" height="110" rx="2" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
                      <text x="180" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">Zn Anode (-)</text>

                      <rect x="80" y="300" width="200" height="40" rx="5" fill="#1e293b" stroke="#f43f5e" />
                      <text x="180" y="316" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="bold">Anodic Oxidation (Loss of e⁻)</text>
                      <text x="180" y="332" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace">Zn(s) → Zn²⁺(aq) + 2e⁻</text>
                    </g>

                    {/* Copper Cathode Half-Cell */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Copper Cathode (Reduction)', 'Why does copper plate out on the cathode during cell discharge?')}
                    >
                      <rect x="510" y="140" width="140" height="150" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                      <rect x="515" y="190" width="130" height="95" rx="4" fill="#0ea5e9" fillOpacity="0.4" />
                      <text x="580" y="275" textAnchor="middle" fill="#38bdf8" fontSize="11">1.0 M CuSO₄ (aq)</text>

                      <rect x="565" y="110" width="30" height="110" rx="2" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
                      <text x="580" y="100" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Cu Cathode (+)</text>

                      <rect x="480" y="300" width="200" height="40" rx="5" fill="#1e293b" stroke="#10b981" />
                      <text x="580" y="316" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">Cathodic Reduction (Gain of e⁻)</text>
                      <text x="580" y="332" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace">Cu²⁺(aq) + 2e⁻ → Cu(s)</text>
                    </g>

                    {/* Salt Bridge */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('Salt Bridge & Ion Migration', 'What is the function of the salt bridge, and how do K+ and Cl- ions migrate?')}
                    >
                      <path
                        d="M 220 230 L 220 150 Q 220 135 235 135 L 525 135 Q 540 135 540 150 L 540 230"
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="14"
                        strokeLinecap="round"
                      />
                      <path
                        d="M 220 230 L 220 150 Q 220 135 235 135 L 525 135 Q 540 135 540 150 L 540 230"
                        fill="none"
                        stroke="#c084fc"
                        strokeWidth="8"
                        strokeLinecap="round"
                      />
                      <text x="380" y="130" textAnchor="middle" fill="#f8fafc" fontSize="11" fontWeight="bold">Salt Bridge (K⁺ / Cl⁻)</text>
                      <text x="260" y="160" textAnchor="middle" fill="#fda4af" fontSize="10">Cl⁻ → Anode</text>
                      <text x="500" y="160" textAnchor="middle" fill="#6ee7b7" fontSize="10">K⁺ → Cathode</text>
                    </g>
                  </g>
                )}

                {/* 7. DIAGNOSTIC SPECTROSCOPY (FTIR & NMR) */}
                {activeDiagramType === 'spectroscopy' && (
                  <g>
                    <text x="380" y="30" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold">
                      Diagnostic FTIR & ¹H-NMR Spectroscopy Suite
                    </text>

                    {/* FTIR Section (Top Half) */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('FTIR Spectrum & C=O Stretch', 'Why is the C=O stretch at 1715 cm⁻¹ so intense and sharp in FTIR?')}
                    >
                      <rect x="40" y="45" width="680" height="115" rx="8" fill="#0f172a" stroke="#334155" />
                      <text x="60" y="65" fill="#38bdf8" fontSize="11" fontWeight="bold">FTIR Transmission Spectrum (%T)</text>
                      <text x="660" y="65" textAnchor="end" fill="#64748b" fontSize="10">4000 cm⁻¹ → 600 cm⁻¹</text>

                      {/* FTIR Baseline with diagnostic dips */}
                      <path
                        d="M 60 75 Q 140 75 160 120 Q 180 75 220 75 L 350 75 Q 365 145 380 75 L 490 75 Q 520 100 550 75 L 680 75"
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="2"
                      />
                      {/* C=O dip */}
                      <circle cx="365" cy="145" r="4" fill="#f43f5e" />
                      <text x="365" y="158" textAnchor="middle" fill="#fda4af" fontSize="10" fontWeight="bold">C=O (1715 cm⁻¹)</text>

                      {/* O-H / C-H dip */}
                      <circle cx="160" cy="120" r="4" fill="#fbbf24" />
                      <text x="160" y="135" textAnchor="middle" fill="#fde047" fontSize="10">C-H sp³ (2950 cm⁻¹)</text>
                    </g>

                    {/* NMR Section (Bottom Half) */}
                    <g
                      className="cursor-pointer group"
                      onClick={() => handleSelectComponent('¹H-NMR Spectrum & Triplet/Quartet', 'Explain the triplet-quartet splitting pattern using the (n+1) coupling rule.')}
                    >
                      <rect x="40" y="180" width="680" height="135" rx="8" fill="#0f172a" stroke="#334155" />
                      <text x="60" y="200" fill="#38bdf8" fontSize="11" fontWeight="bold">¹H-NMR Chemical Shift (δ, ppm)</text>
                      <line x1="60" y1="285" x2="680" y2="285" stroke="#64748b" strokeWidth="1.5" />

                      {/* TMS at 0.00 ppm */}
                      <line x1="680" y1="285" x2="680" y2="220" stroke="#f43f5e" strokeWidth="2" />
                      <text x="680" y="210" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">TMS (0 ppm)</text>

                      {/* Triplet at 1.25 ppm */}
                      <g>
                        <line x1="560" y1="285" x2="560" y2="245" stroke="#34d399" strokeWidth="1.5" />
                        <line x1="565" y1="285" x2="565" y2="225" stroke="#34d399" strokeWidth="2" />
                        <line x1="570" y1="285" x2="570" y2="245" stroke="#34d399" strokeWidth="1.5" />
                        <text x="565" y="215" textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">Triplet (3H, -CH₃)</text>
                      </g>

                      {/* Quartet at 4.10 ppm */}
                      <g>
                        <line x1="390" y1="285" x2="390" y2="255" stroke="#ec4899" strokeWidth="1.5" />
                        <line x1="395" y1="285" x2="395" y2="230" stroke="#ec4899" strokeWidth="2" />
                        <line x1="400" y1="285" x2="400" y2="230" stroke="#ec4899" strokeWidth="2" />
                        <line x1="405" y1="285" x2="405" y2="255" stroke="#ec4899" strokeWidth="1.5" />
                        <text x="397" y="215" textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold">Quartet (2H, -OCH₂-)</text>
                      </g>

                      {/* Singlet at 2.10 ppm */}
                      <g>
                        <line x1="490" y1="285" x2="490" y2="225" stroke="#fbbf24" strokeWidth="2.5" />
                        <text x="490" y="215" textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">Singlet (3H)</text>
                      </g>
                    </g>

                    <text x="380" y="335" textAnchor="middle" fill="#cbd5e1" fontSize="11">
                      Structural Correlation: Diagnostic Carbonyl (1715 cm⁻¹) & -OCH₂CH₃ (quartet + triplet) confirms Ester / Ketone structure
                    </text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Diagram Inquiries & Targeted Analysis Section */}
      <div ref={qaSectionRef} className="px-4 py-4 bg-slate-950 border-t border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold">
              <MessageSquareQuote className="w-3.5 h-3.5" />
            </div>
            <div>
              <h5 className="text-xs sm:text-sm font-serif font-bold text-slate-100 flex items-center gap-2">
                <span>Diagram Inquiries & Targeted University Analysis</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                  Interactive Hotspots
                </span>
              </h5>
              <p className="text-[11px] text-slate-400 font-mono">
                Ask specific questions about coordinates, peaks, transition states, or orbital splits on this diagram
              </p>
            </div>
          </div>

          {selectedComponent && (
            <button
              onClick={() => {
                setSelectedComponent(null);
                setQaAnswer(null);
              }}
              className="px-2 py-1 text-[11px] font-mono rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              <span>Clear Target</span>
            </button>
          )}
        </div>

        {/* Suggested Diagnostic Question Chips */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
            Suggested High-Yield Questions for this {DIAGRAM_TYPE_LABELS[activeDiagramType] || 'Diagram'}:
          </span>
          <div className="flex flex-wrap gap-2">
            {activeSuggestedQuestions.map((qItem, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSelectedComponent(qItem.component);
                  setDiagramQuestion(qItem.question);
                  handleAskDiagramQuestion(qItem.question);
                }}
                disabled={isAnswering}
                className="px-3 py-1.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-800 hover:border-teal-500/40 text-slate-300 hover:text-teal-300 text-xs font-mono text-left flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50"
              >
                <Sparkles className="w-3 h-3 text-teal-400 shrink-0" />
                <span className="truncate max-w-[280px] sm:max-w-md">{qItem.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Question Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAskDiagramQuestion();
          }}
          className="flex flex-col sm:flex-row gap-2 pt-1"
        >
          <div className="relative flex-1">
            <input
              type="text"
              value={diagramQuestion}
              onChange={(e) => setDiagramQuestion(e.target.value)}
              placeholder={
                selectedComponent
                  ? `Ask specific question about ${selectedComponent}...`
                  : 'Ask any question about this diagram (e.g. Why is TS1 higher? How does the salt bridge work?)...'
              }
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-3 pr-9 py-2 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500/50 min-h-[42px]"
            />
            {diagramQuestion && (
              <button
                type="button"
                onClick={() => setDiagramQuestion('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <button
            type="submit"
            disabled={!diagramQuestion.trim() || isAnswering}
            className="min-h-[42px] px-4 py-2 bg-teal-600 hover:bg-teal-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 whitespace-nowrap transition-all active:scale-95"
          >
            {isAnswering ? <Sparkles className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            <span>{isAnswering ? 'Analyzing Diagram...' : 'Ask Diagram AI'}</span>
          </button>
        </form>

        {/* AI Diagram Answer Display Card */}
        {qaAnswer && (
          <div className="p-4 sm:p-5 bg-slate-900/90 border border-teal-500/30 rounded-2xl space-y-3.5 shadow-xl animate-fadeIn">
            {/* Answer Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                  <Lightbulb className="w-3.5 h-3.5" />
                </span>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    Diagram Target:
                  </span>
                  <span className="text-xs font-bold text-teal-300 font-mono">
                    {qaAnswer.referencedComponent || selectedComponent || 'Diagram Analysis'}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {onAskInMainChat && (
                  <button
                    onClick={() => {
                      onAskInMainChat(
                        `Regarding the diagram (${qaAnswer.diagramType}): ${qaAnswer.question}`
                      );
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-mono flex items-center gap-1 transition-all"
                    title="Send this diagram question to the main lecture chat"
                  >
                    <ArrowUpRight className="w-3 h-3 text-teal-400" />
                    <span>Open in Chat</span>
                  </button>
                )}
                {onAddFlashcard && (
                  <button
                    onClick={() => {
                      onAddFlashcard({
                        topic: (topic as ChemistryTopic) || 'physical',
                        front: qaAnswer.question,
                        back: qaAnswer.directAnswer,
                        explanation: qaAnswer.detailedExplanation,
                        difficulty: 'medium',
                      });
                      setCopiedNotification('Saved to Flashcards!');
                      setTimeout(() => setCopiedNotification(null), 2500);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-[11px] font-mono flex items-center gap-1 transition-all"
                  >
                    <BookmarkPlus className="w-3 h-3" />
                    <span>{copiedNotification || 'Save Flashcard'}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Direct High-Yield Answer */}
            <div className="p-3 bg-teal-950/20 border-l-2 border-teal-400 rounded-r-xl">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-teal-400 block mb-1">
                Direct Physical Answer
              </span>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans font-medium">
                {qaAnswer.directAnswer}
              </p>
            </div>

            {/* Detailed Mechanism / Orbital Breakdown */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                Detailed Diagrammatic & Theoretical Breakdown:
              </span>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans whitespace-pre-line">
                {qaAnswer.detailedExplanation}
              </p>
            </div>

            {/* KaTeX Governing Equation */}
            {qaAnswer.equationLatex && (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-center overflow-x-auto">
                <span className="text-[10px] font-mono text-slate-500 uppercase block mb-1">
                  Governing KaTeX Expression
                </span>
                <MathRenderer latex={qaAnswer.equationLatex} className="text-sm sm:text-base text-teal-300" />
              </div>
            )}

            {/* University Exam Tip */}
            {qaAnswer.examTips && (
              <div className="p-3 bg-amber-950/20 border border-amber-500/30 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 font-mono text-[11px] font-bold uppercase">
                  <Flame className="w-3.5 h-3.5" />
                  <span>University Examination Tip & Grading Criteria:</span>
                </div>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {qaAnswer.examTips}
                </p>
              </div>
            )}

            {/* Key Takeaways */}
            {qaAnswer.keyTakeaways && qaAnswer.keyTakeaways.length > 0 && (
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block">
                  Core Scientific Takeaways:
                </span>
                <ul className="space-y-1 text-xs text-slate-300 font-sans">
                  {qaAnswer.keyTakeaways.map((point, pIdx) => (
                    <li key={pIdx} className="flex items-start gap-1.5">
                      <Check className="w-3.5 h-3.5 text-teal-400 shrink-0 mt-0.5" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>
            Active View: <strong className="text-slate-200">{DIAGRAM_TYPE_LABELS[activeDiagramType] || activeDiagramType}</strong> • Calibrated to university standards
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>•</span>
          <span>Interactive Vector Coordinates & 3D WebGL</span>
        </div>
      </div>
    </div>
  );
};
