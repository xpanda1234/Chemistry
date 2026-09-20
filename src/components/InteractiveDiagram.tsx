import React, { useState, useRef, useEffect } from 'react';
import { Download, ZoomIn, ZoomOut, RotateCcw, Layers, Compass, ChevronRight, ChevronLeft } from 'lucide-react';
import { DiagramPayload, MechanismStep } from '../types.ts';

interface InteractiveDiagramProps {
  diagram?: DiagramPayload;
  mechanismSteps?: MechanismStep[];
  topic?: string;
}

export const InteractiveDiagram: React.FC<InteractiveDiagramProps> = ({
  diagram,
  mechanismSteps,
  topic = 'organic',
}) => {
  const [zoom, setZoom] = useState(1);
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMolecule, setSelectedMolecule] = useState<'benzene' | 'water' | 'caffeine' | 'cisplatin' | 'methane'>('benzene');
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Helper to determine the initial diagram type
  const resolveDiagramType = (d?: DiagramPayload, t?: string, steps?: MechanismStep[]) => {
    if (d?.type) return d.type;
    const lowerTopic = (t || '').toLowerCase();
    if (lowerTopic.includes('spectroscop') || lowerTopic.includes('nmr') || lowerTopic.includes('ftir')) return 'spectroscopy';
    if (lowerTopic.includes('electrochem') || lowerTopic.includes('nernst') || lowerTopic.includes('redox')) return 'galvanic';
    if (lowerTopic.includes('coordination') || lowerTopic.includes('cft') || lowerTopic.includes('inorganic')) return 'cft';
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

  // Keep state synchronized when new message or props arrive
  useEffect(() => {
    const resolved = resolveDiagramType(diagram, topic, mechanismSteps);
    setActiveDiagramType(resolved);
    if (diagram?.type === 'molecule3d') {
      setActiveTab('3d');
    } else {
      setActiveTab('visual');
    }
  }, [diagram, topic, mechanismSteps]);

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

    // Touch support for mobile devices
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

    // Atom definitions for 3D representation
    type Atom = { x: number; y: number; z: number; color: string; radius: number; label: string };
    type Bond = [number, number, boolean?]; // [atomIdx1, atomIdx2, isDouble?]

    let atoms: Atom[] = [];
    let bonds: Bond[] = [];

    if (selectedMolecule === 'benzene') {
      const r = 70;
      for (let i = 0; i < 6; i++) {
        const theta = (i * Math.PI) / 3;
        atoms.push({
          x: r * Math.cos(theta),
          y: r * Math.sin(theta),
          z: 0,
          color: '#38bdf8',
          radius: 12,
          label: 'C',
        });
        atoms.push({
          x: (r + 40) * Math.cos(theta),
          y: (r + 40) * Math.sin(theta),
          z: 0,
          color: '#f8fafc',
          radius: 8,
          label: 'H',
        });
      }
      for (let i = 0; i < 6; i++) {
        const c1 = i * 2;
        const c2 = ((i + 1) % 6) * 2;
        bonds.push([c1, c2, i % 2 === 0]);
        bonds.push([c1, c1 + 1, false]);
      }
    } else if (selectedMolecule === 'water') {
      atoms = [
        { x: 0, y: -20, z: 0, color: '#f43f5e', radius: 16, label: 'O' },
        { x: -55, y: 35, z: 0, color: '#f8fafc', radius: 10, label: 'H' },
        { x: 55, y: 35, z: 0, color: '#f8fafc', radius: 10, label: 'H' },
      ];
      bonds = [
        [0, 1],
        [0, 2],
      ];
    } else if (selectedMolecule === 'methane') {
      atoms = [
        { x: 0, y: 0, z: 0, color: '#38bdf8', radius: 14, label: 'C' },
        { x: 0, y: -65, z: 0, color: '#f8fafc', radius: 9, label: 'H' },
        { x: 60, y: 25, z: 25, color: '#f8fafc', radius: 9, label: 'H' },
        { x: -60, y: 25, z: 25, color: '#f8fafc', radius: 9, label: 'H' },
        { x: 0, y: 25, z: -60, color: '#f8fafc', radius: 9, label: 'H' },
      ];
      bonds = [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ];
    } else if (selectedMolecule === 'cisplatin') {
      atoms = [
        { x: 0, y: 0, z: 0, color: '#fbbf24', radius: 18, label: 'Pt' },
        { x: -65, y: -65, z: 0, color: '#10b981', radius: 14, label: 'Cl' },
        { x: 65, y: -65, z: 0, color: '#10b981', radius: 14, label: 'Cl' },
        { x: -65, y: 65, z: 0, color: '#6366f1', radius: 12, label: 'NH₃' },
        { x: 65, y: 65, z: 0, color: '#6366f1', radius: 12, label: 'NH₃' },
      ];
      bonds = [
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 4],
      ];
    } else {
      // Caffeine skeleton representation
      atoms = [
        { x: -30, y: -40, z: 0, color: '#38bdf8', radius: 12, label: 'C' },
        { x: 20, y: -50, z: 10, color: '#6366f1', radius: 12, label: 'N' },
        { x: 60, y: -20, z: 0, color: '#38bdf8', radius: 12, label: 'C' },
        { x: 50, y: 30, z: -10, color: '#38bdf8', radius: 12, label: 'C' },
        { x: 0, y: 40, z: 0, color: '#6366f1', radius: 12, label: 'N' },
        { x: -40, y: 10, z: 5, color: '#38bdf8', radius: 12, label: 'C' },
        { x: -75, y: -60, z: -5, color: '#f43f5e', radius: 14, label: 'O' },
        { x: 90, y: 60, z: -15, color: '#f43f5e', radius: 14, label: 'O' },
      ];
      bonds = [
        [0, 1],
        [1, 2],
        [2, 3],
        [3, 4],
        [4, 5],
        [5, 0],
        [0, 6, true],
        [3, 7, true],
      ];
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Rotate idle slightly if not dragging
      if (!isDragging) {
        angleY += 0.004;
      }

      // Project atoms
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);

      const projected = atoms.map((atom) => {
        // Rotate around Y
        const x1 = atom.x * cosY - atom.z * sinY;
        const z1 = atom.x * sinY + atom.z * cosY;
        // Rotate around X
        const y2 = atom.y * cosX - z1 * sinX;
        const z2 = atom.y * sinX + z1 * cosX;

        const scale = 320 / (320 + z2);
        return {
          ...atom,
          projX: cx + x1 * scale,
          projY: cy + y2 * scale,
          projZ: z2,
          scale,
        };
      });

      // Draw bonds first (behind)
      bonds.forEach(([idx1, idx2, isDouble]) => {
        const p1 = projected[idx1];
        const p2 = projected[idx2];
        if (!p1 || !p2) return;

        ctx.strokeStyle = '#475569';
        ctx.lineWidth = isDouble ? 5 : 3.5;
        ctx.beginPath();
        ctx.moveTo(p1.projX, p1.projY);
        ctx.lineTo(p2.projX, p2.projY);
        ctx.stroke();

        if (isDouble) {
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      });

      // Sort atoms by Z depth (painter's algorithm)
      const sorted = [...projected].sort((a, b) => b.projZ - a.projZ);

      // Draw atom spheres
      sorted.forEach((atom) => {
        const r = atom.radius * atom.scale;
        const grad = ctx.createRadialGradient(
          atom.projX - r * 0.35,
          atom.projY - r * 0.35,
          r * 0.1,
          atom.projX,
          atom.projY,
          r
        );
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, atom.color);
        grad.addColorStop(1, '#0f172a');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(atom.projX, atom.projY, Math.max(2, r), 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#f8fafc';
        ctx.font = `bold ${Math.round(11 * atom.scale)}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(atom.label, atom.projX, atom.projY);
      });

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
  }, [activeTab, selectedMolecule, activeDiagramType]);

  const handleExportSVG = () => {
    if (!svgRef.current) return;
    const svgData = new XMLSerializer().serializeToString(svgRef.current);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);
    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `chemia-${activeDiagramType}-diagram.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  };

  const DIAGRAM_TYPE_LABELS: Record<string, string> = {
    mechanism: 'Reaction Mechanism',
    energy: 'Potential Energy Profile',
    mo: 'Molecular Orbital Diagram',
    spectroscopy: 'FTIR & 1H-NMR Spectrum',
    cft: 'Crystal Field Splitting',
    galvanic: 'Galvanic Daniell Cell',
    titration: 'Titration Curve',
    molecule3d: '3D Ball & Stick',
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl my-3">
      {/* Header bar */}
      <div className="px-4 py-3 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-serif text-xs font-bold">
            Ψ
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1.5">
              {diagram?.title || `${DIAGRAM_TYPE_LABELS[activeDiagramType] || 'Chemical'} Visualizer`}
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">
              Topic: <span className="text-teal-400 font-semibold">{topic.toUpperCase()}</span> • Calibration: IUPAC / Graduate
            </span>
          </div>
        </div>

        {/* View Mode Tabs: [2D Diagram | 3D Model | Steps] */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <div className="flex bg-slate-900 p-0.5 rounded-lg border border-slate-800 mr-1 overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveTab('visual')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === 'visual'
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              📊 2D Diagram
            </button>

            {mechanismSteps && mechanismSteps.length > 0 && (
              <button
                onClick={() => setActiveTab('steps')}
                className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeTab === 'steps'
                    ? 'bg-teal-600 text-white shadow-sm font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                🔬 Steps ({mechanismSteps.length})
              </button>
            )}

            <button
              onClick={() => setActiveTab('3d')}
              className={`min-h-[36px] px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                activeTab === '3d'
                  ? 'bg-teal-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ⚛️ 3D Model
            </button>
          </div>

          {/* Quick Diagram Type Switcher (allows students to inspect other views) */}
          {activeTab === 'visual' && (
            <div className="relative">
              <select
                value={activeDiagramType}
                onChange={(e) => setActiveDiagramType(e.target.value)}
                className="bg-slate-800 hover:bg-slate-750 text-teal-300 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-teal-500 cursor-pointer min-h-[36px]"
                aria-label="Select diagram representation"
              >
                <option value="mechanism">Mechanism (Curved Arrows)</option>
                <option value="energy">Reaction Coordinate Energy</option>
                <option value="mo">Molecular Orbital (MO) Theory</option>
                <option value="spectroscopy">FTIR & 1H-NMR Spectroscopy</option>
                <option value="cft">Crystal Field Theory (CFT)</option>
                <option value="galvanic">Galvanic (Daniell) Cell</option>
                <option value="titration">Acid-Base Titration Curve</option>
              </select>
            </div>
          )}

          {/* Touch-friendly Zoom In / Out / Reset */}
          {activeTab === 'visual' && (
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setZoom((z) => Math.min(2.0, +(z + 0.15).toFixed(2)))}
                className="min-h-[36px] min-w-[36px] p-1 text-slate-400 hover:text-slate-100 flex items-center justify-center"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.7, +(z - 0.15).toFixed(2)))}
                className="min-h-[36px] min-w-[36px] p-1 text-slate-400 hover:text-slate-100 flex items-center justify-center"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                className="min-h-[36px] min-w-[36px] p-1 text-slate-400 hover:text-slate-100 flex items-center justify-center"
                title="Reset Zoom"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleExportSVG}
                className="min-h-[36px] min-w-[36px] p-1 text-teal-400 hover:text-teal-300 flex items-center justify-center"
                title="Export SVG Vector Graphic"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Canvas / Vector Display Area */}
      <div className="relative min-h-[360px] bg-slate-950 flex flex-col items-center justify-center p-3">
        {activeTab === '3d' ? (
          /* 3D Ball & Stick Interactive Model */
          <div className="w-full flex flex-col items-center">
            {/* Molecule quick selectors */}
            <div className="flex flex-wrap items-center justify-center gap-1.5 mb-2.5 z-10">
              <span className="text-xs text-slate-400 font-mono mr-1">3D Geometry:</span>
              {(['benzene', 'water', 'methane', 'cisplatin', 'caffeine'] as const).map((mol) => (
                <button
                  key={mol}
                  onClick={() => setSelectedMolecule(mol)}
                  className={`min-h-[36px] px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                    selectedMolecule === mol
                      ? 'bg-teal-600 text-white font-bold shadow'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {mol}
                </button>
              ))}
            </div>

            <canvas
              ref={canvasRef}
              width={640}
              height={320}
              className="w-full max-w-2xl h-[320px] rounded-xl bg-slate-900 border border-slate-800 cursor-grab active:cursor-grabbing touch-none"
            />
            <span className="text-[11px] text-slate-500 font-mono mt-2">
              Drag or touch to rotate 360° orbital projection • Depth sorting & specular shading enabled
            </span>
          </div>
        ) : activeTab === 'steps' && mechanismSteps && mechanismSteps.length > 0 ? (
          /* Step-by-Step Mechanism Visualizer */
          <div className="w-full max-w-2xl space-y-4 py-2">
            <div className="flex items-center justify-between bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800">
              <button
                onClick={() => setActiveStep((s) => Math.max(0, s - 1))}
                disabled={activeStep === 0}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="text-center font-mono">
                <span className="text-xs text-teal-400 font-bold">Step {activeStep + 1} of {mechanismSteps.length}</span>
                <p className="text-[11px] text-slate-400">{mechanismSteps[activeStep]?.title}</p>
              </div>
              <button
                onClick={() => setActiveStep((s) => Math.min(mechanismSteps.length - 1, s + 1))}
                disabled={activeStep === mechanismSteps.length - 1}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-700 min-h-[38px] min-w-[38px] flex items-center justify-center"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-wider">
                  Phase {mechanismSteps[activeStep].stepNumber} of {mechanismSteps.length}
                </span>
                <span className="text-[11px] px-2 py-0.5 bg-amber-500/10 border border-amber-500/20 text-amber-300 rounded font-mono">
                  {mechanismSteps[activeStep].keyFeature || 'Elementary Step'}
                </span>
              </div>
              <h5 className="text-base font-semibold text-slate-100">{mechanismSteps[activeStep].title}</h5>
              <p className="text-sm text-slate-300 leading-relaxed">{mechanismSteps[activeStep].description}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-mono">
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Starting Species</span>
                  <span className="text-emerald-300 font-semibold text-sm">{mechanismSteps[activeStep].reactant}</span>
                </div>
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="text-slate-500 block text-[10px] uppercase font-sans">Formed Intermediate / Product</span>
                  <span className="text-cyan-300 font-semibold text-sm">{mechanismSteps[activeStep].intermediateOrProduct}</span>
                </div>
              </div>

              {mechanismSteps[activeStep].arrowNote && (
                <div className="p-3 bg-teal-950/30 border border-teal-800/40 rounded-lg text-xs text-teal-200 flex items-start gap-2">
                  <span className="text-teal-400 font-bold">↷ Curved Arrow Flow:</span>
                  <span>{mechanismSteps[activeStep].arrowNote}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* SVG Vector Diagram Render with Horizontal Scroll Container on mobile */
          <div className="w-full overflow-x-auto touch-pan-x py-2 flex justify-center">
            <div className="min-w-[660px] max-w-3xl w-full flex justify-center">
              <svg
                ref={svgRef}
                viewBox="0 0 760 360"
                className="w-full h-auto transition-transform duration-200 select-none"
                style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}
              >
                <defs>
                  <linearGradient id="curveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="45%" stopColor="#f59e0b" />
                    <stop offset="65%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#10b981" />
                  </linearGradient>
                  <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                  <marker id="curvedArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#f43f5e" />
                  </marker>
                </defs>

                {/* Background grid */}
                <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="1,3" />
                </pattern>
                <rect width="760" height="360" fill="url(#grid)" opacity="0.6" rx="10" />

                {/* 1. MECHANISM DIAGRAM */}
                {activeDiagramType === 'mechanism' && (
                  <g>
                    {/* Substrate Box */}
                    <rect x="30" y="100" width="160" height="120" rx="8" fill="#1e293b" stroke="#0ea5e9" strokeWidth="2" />
                    <text x="110" y="130" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold">Reactant Substrate</text>
                    <text x="110" y="155" textAnchor="middle" fill="#f8fafc" fontSize="16" fontFamily="monospace">R — Br</text>
                    <text x="110" y="180" textAnchor="middle" fill="#94a3b8" fontSize="11">C-Br bond polarization</text>
                    <text x="110" y="200" textAnchor="middle" fill="#f43f5e" fontSize="11">δ⁺ C — Br δ⁻</text>

                    {/* RDS Arrow */}
                    <path d="M 195 160 L 275 160" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    <text x="235" y="145" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Step 1 (Slow / RDS)</text>
                    <text x="235" y="180" textAnchor="middle" fill="#cbd5e1" fontSize="10">- Br⁻ (Ionization)</text>

                    {/* Intermediate Box */}
                    <rect x="280" y="80" width="180" height="160" rx="8" fill="#1e293b" stroke="#f59e0b" strokeWidth="2" />
                    <text x="370" y="110" textAnchor="middle" fill="#f59e0b" fontSize="14" fontWeight="bold">Planar Intermediate</text>
                    <circle cx="370" cy="155" r="32" fill="#0f172a" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3,3" />
                    <text x="370" y="158" textAnchor="middle" fill="#f8fafc" fontSize="18" fontWeight="bold" fontFamily="monospace">R⁺</text>
                    <text x="370" y="180" textAnchor="middle" fill="#fbbf24" fontSize="11">Planar sp² (empty 2pz)</text>
                    <text x="370" y="202" textAnchor="middle" fill="#94a3b8" fontSize="10">Top / Bottom attack allowed</text>

                    {/* Nucleophile attack curved arrow */}
                    <path d="M 400 60 Q 420 120 385 140" fill="none" stroke="#f43f5e" strokeWidth="2.5" markerEnd="url(#curvedArrow)" />
                    <text x="435" y="65" textAnchor="middle" fill="#f43f5e" fontSize="11" fontWeight="bold">:Nu⁻ (Nucleophile)</text>

                    {/* Fast Step Arrow */}
                    <path d="M 465 160 L 545 160" stroke="#10b981" strokeWidth="3" markerEnd="url(#arrowhead)" />
                    <text x="505" y="145" textAnchor="middle" fill="#34d399" fontSize="11" fontWeight="bold">Step 2 (Fast)</text>
                    <text x="505" y="180" textAnchor="middle" fill="#cbd5e1" fontSize="10">Nucleophilic Capture</text>

                    {/* Product Box */}
                    <rect x="550" y="100" width="180" height="120" rx="8" fill="#1e293b" stroke="#10b981" strokeWidth="2" />
                    <text x="640" y="130" textAnchor="middle" fill="#10b981" fontSize="14" fontWeight="bold">Substituted Product</text>
                    <text x="640" y="160" textAnchor="middle" fill="#f8fafc" fontSize="16" fontFamily="monospace">R — Nu</text>
                    <text x="640" y="185" textAnchor="middle" fill="#94a3b8" fontSize="11">Inverted + Retained</text>
                    <text x="640" y="202" textAnchor="middle" fill="#34d399" fontSize="10">(Racemic Mixture)</text>

                    {/* Bottom banner */}
                    <rect x="120" y="280" width="520" height="45" rx="6" fill="#0f172a" stroke="#334155" />
                    <text x="380" y="308" textAnchor="middle" fill="#cbd5e1" fontSize="12">
                      Key Principle: Rate = k[R-X] • Solvent polar stabilization • Stereochemistry governed by planar intermediate
                    </text>
                  </g>
                )}

                {/* 2. MOLECULAR ORBITAL (MO) DIAGRAM */}
                {activeDiagramType === 'mo' && (
                  <g>
                    {/* Left: Atomic Orbitals of Atom A */}
                    <text x="120" y="45" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">Atom A (2p AOs)</text>
                    {[-35, 0, 35].map((dx, i) => (
                      <g key={`aoA-${i}`}>
                        <line x1={120 + dx - 14} y1={170} x2={120 + dx + 14} y2={170} stroke="#38bdf8" strokeWidth="3" />
                        <text x={120 + dx} y={164} textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">{i === 0 ? '↑↓' : '↑'}</text>
                        <text x={120 + dx} y={190} textAnchor="middle" fill="#94a3b8" fontSize="10">{i === 0 ? '2px' : i === 1 ? '2py' : '2pz'}</text>
                      </g>
                    ))}
                    <text x="120" y="215" textAnchor="middle" fill="#64748b" fontSize="11">Oxygen Atom A (2p⁴)</text>

                    {/* Right: Atomic Orbitals of Atom B */}
                    <text x="640" y="45" textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">Atom B (2p AOs)</text>
                    {[-35, 0, 35].map((dx, i) => (
                      <g key={`aoB-${i}`}>
                        <line x1={640 + dx - 14} y1={170} x2={640 + dx + 14} y2={170} stroke="#38bdf8" strokeWidth="3" />
                        <text x={640 + dx} y={164} textAnchor="middle" fill="#38bdf8" fontSize="13" fontWeight="bold">{i === 0 ? '↑↓' : '↑'}</text>
                        <text x={640 + dx} y={190} textAnchor="middle" fill="#94a3b8" fontSize="10">{i === 0 ? '2px' : i === 1 ? '2py' : '2pz'}</text>
                      </g>
                    ))}
                    <text x="640" y="215" textAnchor="middle" fill="#64748b" fontSize="11">Oxygen Atom B (2p⁴)</text>

                    {/* Center MO Title */}
                    <text x="380" y="30" textAnchor="middle" fill="#fbbf24" fontSize="15" fontWeight="bold">O₂ Molecular Orbitals (LCAO)</text>

                    {/* σ*2pz Antibonding (LUMO - Empty) */}
                    <line x1="330" y1="65" x2="430" y2="65" stroke="#f43f5e" strokeWidth="3" />
                    <text x="380" y="58" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="bold">σ*2pz (LUMO, empty)</text>
                    <line x1="150" y1="170" x2="330" y2="65" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="610" y1="170" x2="430" y2="65" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

                    {/* π*2px, π*2py Degenerate Antibonding (HOMO with 2 unpaired electrons) */}
                    <rect x="290" y="105" width="180" height="28" rx="4" fill="#1e293b" stroke="#f59e0b" strokeWidth="1.5" />
                    <line x1="315" y1="120" x2="365" y2="120" stroke="#f59e0b" strokeWidth="3" />
                    <text x="340" y="116" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">↑</text>
                    <text x="340" y="132" textAnchor="middle" fill="#cbd5e1" fontSize="9">π*2px</text>

                    <line x1="395" y1="120" x2="445" y2="120" stroke="#f59e0b" strokeWidth="3" />
                    <text x="420" y="116" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">↑</text>
                    <text x="420" y="132" textAnchor="middle" fill="#cbd5e1" fontSize="9">π*2py</text>
                    <text x="485" y="123" fill="#f59e0b" fontSize="11" fontWeight="bold">HOMO (S=1 Paramagnetic)</text>

                    <line x1="150" y1="170" x2="315" y2="120" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="610" y1="170" x2="445" y2="120" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

                    {/* π2px, π2py Degenerate Bonding (Filled 4e-) */}
                    <rect x="290" y="210" width="180" height="28" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                    <line x1="315" y1="225" x2="365" y2="225" stroke="#10b981" strokeWidth="3" />
                    <text x="340" y="222" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">↑↓</text>
                    <text x="340" y="236" textAnchor="middle" fill="#cbd5e1" fontSize="9">π2px</text>

                    <line x1="395" y1="225" x2="445" y2="225" stroke="#10b981" strokeWidth="3" />
                    <text x="420" y="222" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">↑↓</text>
                    <text x="420" y="236" textAnchor="middle" fill="#cbd5e1" fontSize="9">π2py</text>
                    <text x="485" y="228" fill="#10b981" fontSize="11" fontWeight="bold">π bonding (4e⁻)</text>

                    {/* σ2pz Bonding (Filled 2e- at lowest energy) */}
                    <line x1="330" y1="265" x2="430" y2="265" stroke="#10b981" strokeWidth="3" />
                    <text x="380" y="261" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold">↑↓</text>
                    <text x="380" y="280" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">σ2pz bonding (2e⁻)</text>

                    <line x1="150" y1="170" x2="330" y2="265" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="610" y1="170" x2="430" y2="265" stroke="#475569" strokeWidth="1" strokeDasharray="3,3" />

                    {/* Bottom Summary Bar */}
                    <rect x="70" y="305" width="620" height="42" rx="6" fill="#0f172a" stroke="#334155" />
                    <text x="380" y="325" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">
                      Bond Order = (Nb - Na) / 2 = (8 - 4) / 2 = 2.0 (Double Bond)
                    </text>
                    <text x="380" y="340" textAnchor="middle" fill="#fbbf24" fontSize="11">
                      2 Unpaired Electrons in degenerate π* directly prove liquid oxygen paramagnetism
                    </text>
                  </g>
                )}

                {/* 3. SPECTROSCOPY (FTIR + 1H-NMR) DIAGRAM */}
                {activeDiagramType === 'spectroscopy' && (
                  <g>
                    {/* Top: FTIR Transmission Spectrum */}
                    <rect x="40" y="25" width="680" height="135" rx="6" fill="#0f172a" stroke="#334155" />
                    <text x="55" y="45" fill="#38bdf8" fontSize="12" fontWeight="bold">FTIR Spectrum (Transmittance % vs Wavenumber cm⁻¹)</text>

                    {/* Wavenumber Axis: 4000 to 500 cm-1 */}
                    <line x1="60" y1="135" x2="700" y2="135" stroke="#64748b" strokeWidth="1" />
                    {[4000, 3500, 3000, 2500, 2000, 1715, 1500, 1000, 500].map((wn) => {
                      const x = 60 + ((4000 - wn) / 3500) * 640;
                      return (
                        <g key={wn}>
                          <line x1={x} y1={135} x2={x} y2={140} stroke="#64748b" />
                          <text x={x} y={150} textAnchor="middle" fill={wn === 1715 ? '#fbbf24' : '#64748b'} fontSize="9" fontWeight={wn === 1715 ? 'bold' : 'normal'}>
                            {wn}
                          </text>
                        </g>
                      );
                    })}

                    {/* FTIR Absorption trace */}
                    <path
                      d="M 60 60 Q 120 62 160 85 T 230 65 L 360 65 L 430 65 L 450 128 L 460 65 L 520 65 Q 560 95 620 120 T 700 80"
                      fill="none"
                      stroke="#06b6d4"
                      strokeWidth="2"
                    />
                    <circle cx="450" cy="128" r="4" fill="#f43f5e" />
                    <rect x="390" y="38" width="135" height="22" rx="4" fill="#1e293b" stroke="#f43f5e" />
                    <text x="457" y="53" textAnchor="middle" fill="#fda4af" fontSize="10" fontWeight="bold">C=O Stretch (1715 cm⁻¹)</text>

                    {/* Bottom: 1H-NMR Spectrum */}
                    <rect x="40" y="175" width="680" height="145" rx="6" fill="#0f172a" stroke="#334155" />
                    <text x="55" y="195" fill="#a855f7" fontSize="12" fontWeight="bold">¹H-NMR 400 MHz Spectrum (Chemical Shift δ ppm & Spin-Spin J-Coupling)</text>

                    {/* Baseline */}
                    <line x1="60" y1="295" x2="700" y2="295" stroke="#64748b" strokeWidth="1" />
                    {[10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0].map((ppm) => {
                      const x = 60 + ((10 - ppm) / 10) * 640;
                      return (
                        <g key={ppm}>
                          <line x1={x} y1={295} x2={x} y2={300} stroke="#64748b" />
                          <text x={x} y={310} textAnchor="middle" fill={ppm === 0 ? '#38bdf8' : '#94a3b8'} fontSize="10" fontWeight={ppm === 0 ? 'bold' : 'normal'}>
                            {ppm === 0 ? '0 (TMS)' : ppm}
                          </text>
                        </g>
                      );
                    })}

                    {/* TMS at 0 ppm */}
                    <line x1="700" y1="295" x2="700" y2="230" stroke="#38bdf8" strokeWidth="1.5" />
                    <text x="700" y="222" textAnchor="middle" fill="#38bdf8" fontSize="9">TMS</text>

                    {/* Triplet at 1.25 ppm */}
                    <g>
                      <line x1={60 + (8.75 / 10) * 640 - 4} y1={295} x2={60 + (8.75 / 10) * 640 - 4} y2={260} stroke="#34d399" strokeWidth="1.5" />
                      <line x1={60 + (8.75 / 10) * 640} y1={295} x2={60 + (8.75 / 10) * 640} y2={230} stroke="#34d399" strokeWidth="2" />
                      <line x1={60 + (8.75 / 10) * 640 + 4} y1={295} x2={60 + (8.75 / 10) * 640 + 4} y2={260} stroke="#34d399" strokeWidth="1.5" />
                      <text x={60 + (8.75 / 10) * 640} y={218} textAnchor="middle" fill="#34d399" fontSize="10" fontWeight="bold">Triplet (3H)</text>
                      <text x={60 + (8.75 / 10) * 640} y={230} textAnchor="middle" fill="#94a3b8" fontSize="9">δ 1.25, J=7.1 Hz</text>
                    </g>

                    {/* Singlet at 2.10 ppm */}
                    <g>
                      <line x1={60 + (7.9 / 10) * 640} y1={295} x2={60 + (7.9 / 10) * 640} y2={215} stroke="#fbbf24" strokeWidth="2.5" />
                      <text x={60 + (7.9 / 10) * 640} y={205} textAnchor="middle" fill="#fbbf24" fontSize="10" fontWeight="bold">Singlet (3H)</text>
                      <text x={60 + (7.9 / 10) * 640} y={215} textAnchor="middle" fill="#94a3b8" fontSize="9">δ 2.10</text>
                    </g>

                    {/* Quartet at 4.12 ppm */}
                    <g>
                      <line x1={60 + (5.88 / 10) * 640 - 6} y1={295} x2={60 + (5.88 / 10) * 640 - 6} y2={270} stroke="#ec4899" strokeWidth="1.5" />
                      <line x1={60 + (5.88 / 10) * 640 - 2} y1={295} x2={60 + (5.88 / 10) * 640 - 2} y2={235} stroke="#ec4899" strokeWidth="2" />
                      <line x1={60 + (5.88 / 10) * 640 + 2} y1={295} x2={60 + (5.88 / 10) * 640 + 2} y2={235} stroke="#ec4899" strokeWidth="2" />
                      <line x1={60 + (5.88 / 10) * 640 + 6} y1={295} x2={60 + (5.88 / 10) * 640 + 6} y2={270} stroke="#ec4899" strokeWidth="1.5" />
                      <text x={60 + (5.88 / 10) * 640} y={222} textAnchor="middle" fill="#ec4899" fontSize="10" fontWeight="bold">Quartet (2H)</text>
                      <text x={60 + (5.88 / 10) * 640} y={232} textAnchor="middle" fill="#94a3b8" fontSize="9">δ 4.12, J=7.1 Hz</text>
                    </g>

                    {/* Aromatic multiplet at 7.3 ppm */}
                    <g>
                      <line x1={60 + (2.7 / 10) * 640 - 4} y1={295} x2={60 + (2.7 / 10) * 640 - 4} y2={245} stroke="#38bdf8" strokeWidth="1.5" />
                      <line x1={60 + (2.7 / 10) * 640} y1={295} x2={60 + (2.7 / 10) * 640} y2={235} stroke="#38bdf8" strokeWidth="2" />
                      <line x1={60 + (2.7 / 10) * 640 + 4} y1={295} x2={60 + (2.7 / 10) * 640 + 4} y2={245} stroke="#38bdf8" strokeWidth="1.5" />
                      <text x={60 + (2.7 / 10) * 640} y={222} textAnchor="middle" fill="#38bdf8" fontSize="10" fontWeight="bold">Aromatic (5H)</text>
                      <text x={60 + (2.7 / 10) * 640} y={232} textAnchor="middle" fill="#94a3b8" fontSize="9">δ 7.3 - 7.8</text>
                    </g>

                    {/* Summary */}
                    <text x="380" y="340" textAnchor="middle" fill="#cbd5e1" fontSize="11">
                      Structural Correlation: Diagnostic Carbonyl (1715 cm⁻¹) & -OCH₂CH₃ (quartet + triplet) confirms Ester / Ketone structure
                    </text>
                  </g>
                )}

                {/* 4. GALVANIC (DANIELL) CELL DIAGRAM */}
                {(activeDiagramType === 'galvanic' || activeDiagramType === 'electrochemistry') && (
                  <g>
                    <text x="380" y="35" textAnchor="middle" fill="#38bdf8" fontSize="15" fontWeight="bold">
                      Galvanic (Voltaic) Daniell Cell: Zn(s) | Zn²⁺(1 M) || Cu²⁺(1 M) | Cu(s)
                    </text>

                    {/* Circuit wire */}
                    <path d="M 180 140 L 180 70 L 330 70" fill="none" stroke="#f59e0b" strokeWidth="2.5" />
                    <path d="M 430 70 L 580 70 L 580 140" fill="none" stroke="#f59e0b" strokeWidth="2.5" />

                    {/* Electron flow arrows */}
                    <polygon points="250,66 265,70 250,74" fill="#38bdf8" />
                    <text x="250" y="58" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">e⁻ flow →</text>

                    <polygon points="500,66 515,70 500,74" fill="#38bdf8" />
                    <text x="500" y="58" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">e⁻ flow →</text>

                    {/* Voltmeter */}
                    <circle cx="380" cy="70" r="32" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
                    <text x="380" y="66" textAnchor="middle" fill="#34d399" fontSize="14" fontWeight="bold" fontFamily="monospace">+1.10 V</text>
                    <text x="380" y="82" textAnchor="middle" fill="#94a3b8" fontSize="9">E°cell (Standard)</text>

                    {/* Anode Beaker (Zinc) */}
                    <rect x="110" y="140" width="140" height="150" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                    <rect x="115" y="190" width="130" height="95" rx="4" fill="#0284c7" fillOpacity="0.25" />
                    <text x="180" y="275" textAnchor="middle" fill="#38bdf8" fontSize="11">1.0 M ZnSO₄ (aq)</text>

                    {/* Zinc Electrode */}
                    <rect x="165" y="110" width="30" height="110" rx="2" fill="#64748b" stroke="#cbd5e1" strokeWidth="1.5" />
                    <text x="180" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontWeight="bold">Zn Anode (-)</text>

                    {/* Anode reaction */}
                    <rect x="80" y="300" width="200" height="40" rx="5" fill="#1e293b" stroke="#f43f5e" />
                    <text x="180" y="316" textAnchor="middle" fill="#fda4af" fontSize="11" fontWeight="bold">Anodic Oxidation (Loss of e⁻)</text>
                    <text x="180" y="332" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace">Zn(s) → Zn²⁺(aq) + 2e⁻</text>

                    {/* Cathode Beaker (Copper) */}
                    <rect x="510" y="140" width="140" height="150" rx="8" fill="#0f172a" stroke="#64748b" strokeWidth="2" />
                    <rect x="515" y="190" width="130" height="95" rx="4" fill="#0ea5e9" fillOpacity="0.4" />
                    <text x="580" y="275" textAnchor="middle" fill="#38bdf8" fontSize="11">1.0 M CuSO₄ (aq)</text>

                    {/* Copper Electrode */}
                    <rect x="565" y="110" width="30" height="110" rx="2" fill="#b45309" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="580" y="100" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Cu Cathode (+)</text>

                    {/* Cathode reaction */}
                    <rect x="480" y="300" width="200" height="40" rx="5" fill="#1e293b" stroke="#10b981" />
                    <text x="580" y="316" textAnchor="middle" fill="#6ee7b7" fontSize="11" fontWeight="bold">Cathodic Reduction (Gain of e⁻)</text>
                    <text x="580" y="332" textAnchor="middle" fill="#f8fafc" fontSize="11" fontFamily="monospace">Cu²⁺(aq) + 2e⁻ → Cu(s)</text>

                    {/* Salt Bridge */}
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

                    {/* Nernst Formula */}
                    <rect x="290" y="285" width="180" height="60" rx="6" fill="#0f172a" stroke="#f59e0b" />
                    <text x="380" y="303" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Nernst Equation (298 K)</text>
                    <text x="380" y="320" textAnchor="middle" fill="#e2e8f0" fontSize="10" fontFamily="monospace">E = E° - (0.05916/n) log Q</text>
                    <text x="380" y="336" textAnchor="middle" fill="#94a3b8" fontSize="9">ΔG° = -nFE° = -212.3 kJ/mol</text>
                  </g>
                )}

                {/* 5. CRYSTAL FIELD THEORY (CFT) */}
                {activeDiagramType === 'cft' && (
                  <g>
                    {/* Free Metal Ion */}
                    <text x="130" y="60" textAnchor="middle" fill="#94a3b8" fontSize="13" fontWeight="bold">Free Metal Ion</text>
                    <line x1="50" y1="180" x2="210" y2="180" stroke="#64748b" strokeWidth="2" />
                    {[-60, -30, 0, 30, 60].map((dx, i) => (
                      <g key={i}>
                        <line x1={130 + dx - 12} y1="180" x2={130 + dx + 12} y2="180" stroke="#38bdf8" strokeWidth="3" />
                        <text x={130 + dx} y="205" textAnchor="middle" fill="#94a3b8" fontSize="10">d</text>
                      </g>
                    ))}
                    <text x="130" y="235" textAnchor="middle" fill="#64748b" fontSize="11">5 degenerate d-orbitals</text>

                    <path d="M 210 180 L 350 110" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />
                    <path d="M 210 180 L 350 240" stroke="#475569" strokeWidth="1.5" strokeDasharray="3,3" />

                    {/* Octahedral Splitting */}
                    <text x="430" y="45" textAnchor="middle" fill="#38bdf8" fontSize="14" fontWeight="bold">Octahedral Field (Oh)</text>

                    {/* eg set */}
                    <rect x="340" y="95" width="180" height="30" rx="4" fill="#1e293b" stroke="#f43f5e" strokeWidth="1.5" />
                    <text x="430" y="115" textAnchor="middle" fill="#fda4af" fontSize="13" fontWeight="bold">eg set (dx²-y², dz²)</text>
                    <text x="540" y="115" fill="#f43f5e" fontSize="12" fontWeight="bold">+0.6 Δo</text>

                    {/* Barycenter */}
                    <line x1="330" y1="180" x2="530" y2="180" stroke="#64748b" strokeWidth="1" strokeDasharray="4,4" />
                    <text x="540" y="184" fill="#64748b" fontSize="11">Barycenter</text>

                    {/* t2g set */}
                    <rect x="340" y="225" width="180" height="30" rx="4" fill="#1e293b" stroke="#10b981" strokeWidth="1.5" />
                    <text x="430" y="245" textAnchor="middle" fill="#6ee7b7" fontSize="13" fontWeight="bold">t2g set (dxy, dyz, dxz)</text>
                    <text x="540" y="245" fill="#10b981" fontSize="12" fontWeight="bold">-0.4 Δo</text>

                    {/* Splitting bracket */}
                    <line x1="320" y1="110" x2="320" y2="240" stroke="#f59e0b" strokeWidth="2" />
                    <polygon points="316,115 320,105 324,115" fill="#f59e0b" />
                    <polygon points="316,235 320,245 324,235" fill="#f59e0b" />
                    <text x="300" y="180" textAnchor="middle" fill="#fbbf24" fontSize="14" fontWeight="bold">Δo</text>

                    {/* Tetrahedral indicator */}
                    <rect x="610" y="90" width="125" height="170" rx="6" fill="#0f172a" stroke="#334155" />
                    <text x="672" y="115" textAnchor="middle" fill="#e2e8f0" fontSize="11" fontWeight="bold">Tetrahedral (Td)</text>
                    <text x="672" y="145" textAnchor="middle" fill="#10b981" fontSize="11">t2 (raised)</text>
                    <text x="672" y="175" textAnchor="middle" fill="#f59e0b" fontSize="11" fontWeight="bold">Δt = ⁴/₉ Δo</text>
                    <text x="672" y="205" textAnchor="middle" fill="#f43f5e" fontSize="11">e (lowered)</text>
                    <text x="672" y="235" textAnchor="middle" fill="#94a3b8" fontSize="9">Always High-Spin</text>
                  </g>
                )}

                {/* 6. TITRATION CURVE */}
                {activeDiagramType === 'titration' && (
                  <g>
                    <line x1="80" y1="40" x2="80" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="80" y1="300" x2="700" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="50" y="50" fill="#94a3b8" fontSize="12" fontWeight="bold">pH</text>
                    <text x="670" y="325" fill="#94a3b8" fontSize="12" fontWeight="bold">Volume of Titrant (mL)</text>

                    {[0, 2, 4, 6, 7, 8, 10, 12, 14].map((ph) => {
                      const y = 300 - (ph / 14) * 250;
                      return (
                        <g key={ph}>
                          <line x1="75" y1={y} x2="80" y2={y} stroke="#64748b" />
                          <text x="68" y={y + 4} textAnchor="end" fill="#64748b" fontSize="10">{ph}</text>
                        </g>
                      );
                    })}

                    <rect x="140" y="195" width="180" height="40" rx="4" fill="#0284c7" fillOpacity="0.15" stroke="#0284c7" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="230" y="220" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">Buffer Region (pH ≈ pKa ± 1)</text>

                    <path
                      d="M 80 250 Q 200 220 300 200 T 360 160 L 375 75 T 460 60 L 680 55"
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3.5"
                    />

                    <circle cx="227" cy="215" r="5" fill="#38bdf8" />
                    <line x1="227" y1="215" x2="227" y2="300" stroke="#38bdf8" strokeWidth="1" strokeDasharray="2,2" />
                    <text x="227" y="190" textAnchor="middle" fill="#38bdf8" fontSize="11" fontWeight="bold">Half-Eq: pH = pKa (4.76)</text>
                    <text x="227" y="315" textAnchor="middle" fill="#38bdf8" fontSize="10">V½ = 12.5 mL</text>

                    <circle cx="370" cy="115" r="6" fill="#f43f5e" />
                    <line x1="370" y1="115" x2="370" y2="300" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                    <line x1="80" y1="115" x2="370" y2="115" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3,3" />
                    <text x="440" y="115" fill="#f43f5e" fontSize="12" fontWeight="bold">Equivalence Point (pH 8.7)</text>
                    <text x="370" y="315" textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">Veq = 25.0 mL</text>

                    <rect x="520" y="90" width="160" height="50" rx="6" fill="#1e293b" stroke="#f59e0b" />
                    <text x="600" y="110" textAnchor="middle" fill="#fbbf24" fontSize="11" fontWeight="bold">Phenolphthalein Range</text>
                    <text x="600" y="128" textAnchor="middle" fill="#f8fafc" fontSize="10">pH 8.2 (Colorless) → 10.0 (Pink)</text>
                  </g>
                )}

                {/* 7. POTENTIAL ENERGY COORDINATE CURVE */}
                {activeDiagramType === 'energy' && (
                  <g>
                    <line x1="80" y1="40" x2="80" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <line x1="80" y1="300" x2="700" y2="300" stroke="#94a3b8" strokeWidth="2" markerEnd="url(#arrowhead)" />
                    <text x="45" y="50" fill="#94a3b8" fontSize="12" fontWeight="bold">Potential Energy (G)</text>
                    <text x="660" y="325" fill="#94a3b8" fontSize="12" fontWeight="bold">Reaction Coordinate</text>

                    <path
                      d="M 100 240 Q 180 240 230 110 T 350 160 T 480 90 T 660 210"
                      fill="none"
                      stroke="url(#curveGrad)"
                      strokeWidth="4"
                    />

                    <circle cx="110" cy="240" r="5" fill="#38bdf8" />
                    <text x="110" y="265" textAnchor="middle" fill="#38bdf8" fontSize="12" fontWeight="bold">Reactants</text>

                    <circle cx="230" cy="110" r="6" fill="#f59e0b" />
                    <text x="230" y="85" textAnchor="middle" fill="#fbbf24" fontSize="13" fontWeight="bold">TS 1 ‡</text>
                    <text x="230" y="100" textAnchor="middle" fill="#cbd5e1" fontSize="10">(RDS Activation Barrier)</text>

                    <circle cx="350" cy="160" r="5" fill="#a855f7" />
                    <text x="350" y="185" textAnchor="middle" fill="#c084fc" fontSize="12" fontWeight="bold">Intermediate (R⁺)</text>

                    <circle cx="480" cy="90" r="6" fill="#ec4899" />
                    <text x="480" y="70" textAnchor="middle" fill="#f472b6" fontSize="12" fontWeight="bold">TS 2 ‡</text>

                    <circle cx="650" cy="210" r="5" fill="#10b981" />
                    <text x="650" y="235" textAnchor="middle" fill="#34d399" fontSize="12" fontWeight="bold">Products</text>

                    <line x1="680" y1="240" x2="680" y2="210" stroke="#38bdf8" strokeWidth="2" />
                    <line x1="675" y1="240" x2="685" y2="240" stroke="#38bdf8" strokeWidth="1" />
                    <line x1="675" y1="210" x2="685" y2="210" stroke="#38bdf8" strokeWidth="1" />
                    <text x="715" y="230" fill="#38bdf8" fontSize="12" fontWeight="bold">ΔG° &lt; 0</text>
                    <text x="715" y="245" fill="#94a3b8" fontSize="9">(Exergonic)</text>

                    <line x1="100" y1="240" x2="230" y2="240" stroke="#64748b" strokeWidth="1" strokeDasharray="3,3" />
                    <line x1="200" y1="240" x2="200" y2="110" stroke="#f59e0b" strokeWidth="1.5" />
                    <text x="180" y="180" fill="#fbbf24" fontSize="11" fontWeight="bold">Ea (1)</text>
                  </g>
                )}
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 text-[11px] text-slate-400 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-teal-400" />
          <span>Active View: <strong className="text-slate-200">{DIAGRAM_TYPE_LABELS[activeDiagramType] || activeDiagramType}</strong> • Calibrated to university standards</span>
        </div>
        <div className="flex items-center gap-2 font-mono text-slate-400">
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          <span>•</span>
          <span>Vector Graphics & 3D WebGL</span>
        </div>
      </div>
    </div>
  );
};
