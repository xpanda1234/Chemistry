import React, { useState, useEffect, useRef } from 'react';
import {
  FlaskConical,
  Play,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  Sun,
  Moon,
  Activity,
  Award,
  Thermometer,
  Layers,
} from 'lucide-react';
import { VIRTUAL_EXPERIMENTS } from '../data/chemistryKnowledge.ts';
import { VirtualExperiment } from '../types.ts';
import { MathRenderer } from './MathRenderer.tsx';

export const VirtualLab: React.FC = () => {
  const [selectedExpId, setSelectedExpId] = useState<string>('exp-titration');
  const [activeTab, setActiveTab] = useState<'bench' | 'theory' | 'procedure' | 'data' | 'viva'>('bench');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Titration simulation state
  const [buretVolumeAdded, setBuretVolumeAdded] = useState<number>(0);
  const [isDripping, setIsDripping] = useState<boolean>(false);
  const [stirrerOn, setStirrerOn] = useState<boolean>(true);
  const [indicatorAdded, setIndicatorAdded] = useState<boolean>(true);

  // Kinetics simulation state
  const [temperature, setTemperature] = useState<number>(25);
  const [kineticsTime, setKineticsTime] = useState<number>(0);
  const [isKineticsRunning, setIsKineticsRunning] = useState<boolean>(false);

  // TLC simulation state
  const [tlcSolventProgress, setTlcSolventProgress] = useState<number>(100);
  const [uvLampOn, setUvLampOn] = useState<boolean>(true);

  const experiment = VIRTUAL_EXPERIMENTS.find((e) => e.id === selectedExpId) || VIRTUAL_EXPERIMENTS[0];

  // Titration calculations
  const equivalenceVolume = 25.0;
  const initialPH = 2.88;
  const currentPH = React.useMemo(() => {
    const v = buretVolumeAdded;
    if (v <= 0) return 2.88;
    if (v < equivalenceVolume) {
      // Buffer region (Henderson-Hasselbalch)
      const ratio = v / (equivalenceVolume - v);
      return Math.min(6.5, 4.76 + Math.log10(ratio));
    }
    if (Math.abs(v - equivalenceVolume) < 0.1) {
      return 8.72; // Equivalence point
    }
    // Excess NaOH
    const excessV = v - equivalenceVolume;
    const totalV = 25.0 + 25.0 + v;
    const ohConcentration = (excessV * 0.1) / totalV;
    const pOH = -Math.log10(ohConcentration);
    return Math.min(13.0, 14.0 - pOH);
  }, [buretVolumeAdded]);

  // Solution appearance based on pH and indicator
  const flaskColor = React.useMemo(() => {
    if (!indicatorAdded) return 'rgba(241, 245, 249, 0.4)';
    if (currentPH < 8.2) return 'rgba(241, 245, 249, 0.5)'; // Colorless
    if (currentPH >= 8.2 && currentPH < 8.8) return 'rgba(244, 114, 182, 0.35)'; // Faint pink (End point)
    return 'rgba(236, 72, 153, 0.8)'; // Deep magenta / over-titrated
  }, [currentPH, indicatorAdded]);

  // Handle buret dripping interval
  useEffect(() => {
    let interval: any;
    if (isDripping && buretVolumeAdded < 50) {
      interval = setInterval(() => {
        setBuretVolumeAdded((prev) => Math.min(50, +(prev + 0.2).toFixed(2)));
      }, 100);
    } else {
      setIsDripping(false);
    }
    return () => clearInterval(interval);
  }, [isDripping, buretVolumeAdded]);

  // Handle kinetics timer
  useEffect(() => {
    let timer: any;
    if (isKineticsRunning && kineticsTime < 30) {
      timer = setInterval(() => {
        setKineticsTime((t) => t + 1);
      }, 600);
    } else {
      setIsKineticsRunning(false);
    }
    return () => clearInterval(timer);
  }, [isKineticsRunning, kineticsTime]);

  const currentConductivity = React.useMemo(() => {
    // Conductivity drops as OH- is consumed
    const k0 = 4.82 + (temperature - 25) * 0.1;
    const kInf = 1.24;
    const rateFactor = 0.08 * (1 + (temperature - 25) * 0.04);
    return +(kInf + (k0 - kInf) * Math.exp(-rateFactor * kineticsTime)).toFixed(2);
  }, [kineticsTime, temperature]);

  return (
    <div className="flex flex-col h-full bg-slate-950 text-slate-100 overflow-y-auto">
      {/* Top Header */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-4 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-300">
              <FlaskConical className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-lg font-bold text-slate-100">Virtual Chemistry Laboratory</h2>
                <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 font-mono">
                  Standard ACS Protocols
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Calibrated stoichiometric simulation • Real-time kinetics • Instrument data acquisition
              </p>
            </div>
          </div>

          {/* Experiment Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Experiment:</span>
            <select
              value={selectedExpId}
              onChange={(e) => {
                setSelectedExpId(e.target.value);
                setBuretVolumeAdded(0);
                setKineticsTime(0);
                setCurrentStepIndex(0);
              }}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-teal-300 font-medium focus:outline-none focus:border-teal-500"
            >
              {VIRTUAL_EXPERIMENTS.map((exp) => (
                <option key={exp.id} value={exp.id}>
                  [{exp.discipline}] {exp.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Experiment Navigation Tabs */}
        <div className="max-w-6xl mx-auto flex items-center gap-2 mt-4 border-t border-slate-800/80 pt-3 text-xs overflow-x-auto touch-pan-x no-scrollbar -mx-2 px-2">
          {[
            { id: 'bench', label: '⚗️ Simulation Bench' },
            { id: 'theory', label: '📖 Theory & Principle' },
            { id: 'procedure', label: '📋 Step-by-Step Procedure' },
            { id: 'data', label: '📊 Observations & Calculations' },
            { id: 'viva', label: '🎓 Laboratory Viva Voce' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[44px] px-3.5 py-2 rounded-xl font-medium transition-all whitespace-nowrap shrink-0 flex items-center ${
                activeTab === tab.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto w-full p-3 sm:p-4 md:p-6 pb-24 md:pb-6 space-y-6 flex-1">
        {/* TAB 1: SIMULATION BENCH */}
        {activeTab === 'bench' && (
          <div className="space-y-6">
            {/* Experiment Title Banner */}
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-mono text-teal-400 font-semibold uppercase tracking-wider">
                  {experiment.discipline} Chemistry Practicum
                </span>
                <h3 className="text-lg font-bold text-slate-100 font-serif">{experiment.title}</h3>
                <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{experiment.objective}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 font-mono">
                  Safety Goggles Required
                </span>
              </div>
            </div>

            {/* SIMULATION BENCH 1: ACID-BASE TITRATION */}
            {experiment.simulationType === 'titration_ph' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Apparatus Visualizer (6 cols) */}
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 flex flex-col items-center justify-between relative shadow-xl min-h-[460px]">
                  {/* Buret and Stand */}
                  <div className="relative flex flex-col items-center w-full">
                    {/* Buret Top Reservoir */}
                    <div className="text-xs font-mono text-slate-400 mb-1">Class A Buret (0.100 M NaOH)</div>

                    {/* Buret Glass Tube */}
                    <div className="relative w-12 h-56 bg-slate-950/80 border-2 border-slate-700 rounded-md overflow-hidden flex flex-col justify-end">
                      {/* Titrant liquid fill */}
                      <div
                        className="w-full bg-gradient-to-t from-teal-500/60 to-teal-400/40 transition-all duration-100"
                        style={{ height: `${Math.max(5, 100 - (buretVolumeAdded / 50) * 100)}%` }}
                      ></div>
                      {/* Graduations */}
                      <div className="absolute inset-0 flex flex-col justify-between p-1 pointer-events-none text-[8px] font-mono text-slate-500">
                        <span>0 mL</span>
                        <span>10 mL</span>
                        <span>25 mL</span>
                        <span>40 mL</span>
                        <span>50 mL</span>
                      </div>
                    </div>

                    {/* Stopcock valve */}
                    <div className="flex items-center gap-3 my-2">
                      <div className="w-5 h-5 bg-amber-600 rounded-sm border border-amber-400 cursor-pointer shadow-md flex items-center justify-center text-[9px] font-bold text-amber-100">
                        {isDripping ? 'ON' : 'OFF'}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">Stopcock</span>
                    </div>

                    {/* Drips Animation */}
                    <div className="h-8 flex items-center justify-center">
                      {isDripping && (
                        <div className="w-2 h-2 rounded-full bg-teal-300 animate-ping"></div>
                      )}
                    </div>

                    {/* Erlenmeyer Flask */}
                    <div className="relative w-44 h-36 flex flex-col items-center justify-end">
                      {/* Flask Neck */}
                      <div className="w-14 h-8 border-x-2 border-t-2 border-slate-600 bg-transparent"></div>
                      {/* Flask Body & Liquid */}
                      <div
                        className="w-44 h-28 border-2 border-slate-600 rounded-b-3xl transition-colors duration-300 overflow-hidden flex flex-col justify-end p-2 relative shadow-inner"
                        style={{ backgroundColor: flaskColor }}
                      >
                        {/* Magnetic flea */}
                        {stirrerOn && (
                          <div className="w-5 h-1.5 bg-white rounded-full mx-auto animate-spin shadow-sm"></div>
                        )}
                        <span className="text-[10px] text-center font-mono text-slate-900 font-bold block">
                          25.0 mL CH3COOH
                        </span>
                      </div>
                    </div>

                    {/* Magnetic Stirrer Base */}
                    <div className="w-52 h-8 bg-slate-950 border border-slate-800 rounded-lg mt-2 flex items-center justify-between px-3 text-[10px] text-slate-400 font-mono">
                      <span>MAGNETIC STIRRER</span>
                      <span className="text-teal-400 font-bold">500 RPM</span>
                    </div>
                  </div>
                </div>

                {/* Right: Analytical Instruments & Controls (5 cols) */}
                <div className="lg:col-span-5 space-y-4">
                  {/* Digital pH Meter Readout */}
                  <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                    <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Activity className="w-4 h-4 text-teal-400" />
                        DIGITAL pH READOUT
                      </span>
                      <span className="text-emerald-400">Electrode: Online</span>
                    </div>

                    <div className="p-4 bg-slate-950 border border-teal-500/30 rounded-xl text-center shadow-inner">
                      <span className="text-4xl sm:text-5xl font-mono font-bold text-teal-300 tracking-wider">
                        {currentPH.toFixed(2)}
                      </span>
                      <span className="block text-xs font-mono text-slate-500 mt-1">
                        Temperature: 298.15 K (25.0°C) • Slope: 99.4%
                      </span>
                    </div>

                    {/* Indicators & Alerts */}
                    <div className="space-y-1.5 text-xs">
                      {currentPH >= 8.2 && currentPH <= 9.0 ? (
                        <div className="p-2.5 bg-emerald-950/60 border border-emerald-500/40 rounded-lg text-emerald-200 flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>
                            <strong>End Point Observed:</strong> Persistent faint pink color (pH {currentPH.toFixed(2)}). Equivalence reached!
                          </span>
                        </div>
                      ) : currentPH > 9.0 ? (
                        <div className="p-2.5 bg-rose-950/60 border border-rose-500/40 rounded-lg text-rose-200 flex items-center gap-2">
                          <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                          <span>
                            <strong>Over-titrated:</strong> Deep pink solution. Excess base added beyond equivalence point.
                          </span>
                        </div>
                      ) : (
                        <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-teal-400"></span>
                          <span>Buffering region (pH &lt; 8.0). Keep titrating toward inflection.</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Buret Control Panel */}
                  <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-xl space-y-4">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 font-bold uppercase">Titrant Volume Dispensed</span>
                      <span className="text-teal-300 font-bold text-base">{buretVolumeAdded.toFixed(2)} mL</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setIsDripping(!isDripping)}
                        className={`min-h-[44px] py-2.5 px-3 rounded-xl font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow-md active:scale-95 ${
                          isDripping
                            ? 'bg-rose-600 hover:bg-rose-500 text-white'
                            : 'bg-teal-600 hover:bg-teal-500 text-white'
                        }`}
                      >
                        <Play className="w-3.5 h-3.5" />
                        <span>{isDripping ? 'Close Stopcock' : 'Open Stopcock'}</span>
                      </button>

                      <button
                        onClick={() => setBuretVolumeAdded((v) => +(Math.min(50, v + 0.1)).toFixed(2))}
                        className="min-h-[44px] py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium transition-all active:scale-95"
                      >
                        +0.10 mL (Dropwise)
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setBuretVolumeAdded((v) => +(Math.min(50, v + 1.0)).toFixed(2))}
                        className="min-h-[44px] py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium transition-all active:scale-95"
                      >
                        +1.00 mL (Rapid)
                      </button>

                      <button
                        onClick={() => {
                          setBuretVolumeAdded(0);
                          setIsDripping(false);
                        }}
                        className="min-h-[44px] py-2.5 px-3 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1 active:scale-95"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reset Buret</span>
                      </button>
                    </div>

                    {/* Secondary toggles */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={stirrerOn}
                          onChange={(e) => setStirrerOn(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-0"
                        />
                        <span>Magnetic Stirrer</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={indicatorAdded}
                          onChange={(e) => setIndicatorAdded(e.target.checked)}
                          className="rounded text-teal-600 focus:ring-0"
                        />
                        <span>Phenolphthalein</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATION BENCH 2: KINETICS & ARRHENIUS */}
            {experiment.simulationType === 'kinetics_temp' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                  <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-teal-400" />
                    Conductometric Hydrolysis Kinetics Bench
                  </h4>

                  {/* Reaction vessel animation */}
                  <div className="p-6 bg-slate-950 border border-slate-800 rounded-xl flex flex-col items-center justify-center min-h-[260px] space-y-4">
                    <div className="w-32 h-36 border-2 border-teal-500/40 rounded-b-2xl bg-teal-950/20 p-3 flex flex-col justify-end relative shadow-inner">
                      <div className="w-4 h-28 bg-slate-700 absolute top-[-10px] left-14 border border-slate-500 rounded-t"></div>
                      <div className="text-[10px] font-mono text-center text-teal-300 font-bold">
                        EtOAc + NaOH (0.020 M)
                      </div>
                      <div className="text-[9px] text-center text-slate-400">Dip Cell Immersed</div>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="flex items-center gap-1.5 text-amber-300">
                        <Thermometer className="w-4 h-4" />
                        <span>Bath Temp: {temperature}°C ({temperature + 273.15} K)</span>
                      </div>
                      <div className="text-cyan-300">
                        Elapsed Time: {kineticsTime} min
                      </div>
                    </div>
                  </div>

                  {/* Temperature slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono text-slate-400">
                      <span>Thermostat Temperature</span>
                      <span className="text-teal-400 font-bold">{temperature}°C</span>
                    </div>
                    <input
                      type="range"
                      min={20}
                      max={55}
                      step={5}
                      value={temperature}
                      onChange={(e) => setTemperature(+e.target.value)}
                      disabled={isKineticsRunning}
                      className="w-full accent-teal-500 cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>20°C (Room)</span>
                      <span>25°C (Standard)</span>
                      <span>35°C</span>
                      <span>45°C</span>
                      <span>55°C (Elevated)</span>
                    </div>
                  </div>
                </div>

                {/* Kinetics Instrument Readout */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
                    <span className="text-xs font-mono text-slate-400 block uppercase">Conductivity Dip Cell</span>
                    <div className="p-4 bg-slate-950 border border-teal-500/30 rounded-xl text-center shadow-inner">
                      <span className="text-4xl font-mono font-bold text-teal-300">
                        {currentConductivity}
                      </span>
                      <span className="text-sm font-mono text-teal-400 ml-1.5">mS/cm</span>
                      <p className="text-[11px] text-slate-500 font-mono mt-1">Cell Constant = 1.02 cm⁻¹</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <button
                        onClick={() => setIsKineticsRunning(!isKineticsRunning)}
                        className="py-2.5 px-3 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
                      >
                        <Play className="w-3.5 h-3.5" />
                        {isKineticsRunning ? 'Pause Run' : 'Start Kinetics'}
                      </button>

                      <button
                        onClick={() => {
                          setKineticsTime(0);
                          setIsKineticsRunning(false);
                        }}
                        className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
                      >
                        Reset Timer
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl text-xs space-y-2">
                    <span className="text-teal-400 font-mono font-bold uppercase block">Kinetic Law Summary</span>
                    <p className="text-slate-300">
                      Second-order rate constant: <code className="text-amber-300 font-mono">Rate = k[ester][OH⁻]</code>
                    </p>
                    <p className="text-slate-300">
                      Calculated Ea: <strong className="text-slate-100 font-mono">48.2 kJ·mol⁻¹</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATION BENCH 3: TLC PLATE */}
            {experiment.simulationType === 'tlc_plate' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col items-center">
                  <div className="flex items-center justify-between w-full mb-4">
                    <h4 className="text-sm font-semibold text-slate-200">Silica Gel 60 F254 TLC Plate</h4>
                    <button
                      onClick={() => setUvLampOn(!uvLampOn)}
                      className={`px-3 py-1 rounded-full text-xs font-mono font-medium flex items-center gap-1.5 transition-all ${
                        uvLampOn
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {uvLampOn ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                      {uvLampOn ? '254 nm UV Lamp: ON' : 'Visible Light'}
                    </button>
                  </div>

                  {/* TLC Plate Container */}
                  <div
                    className={`w-64 h-80 rounded-lg border-2 border-slate-700 p-4 relative shadow-2xl transition-colors duration-300 ${
                      uvLampOn ? 'bg-emerald-950/80' : 'bg-slate-200 text-slate-900'
                    }`}
                  >
                    {/* Solvent Front Line */}
                    <div className="absolute top-10 left-4 right-4 border-b border-dashed border-slate-400 flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Solvent Front</span>
                      <span>6.5 cm</span>
                    </div>

                    {/* Origin Line */}
                    <div className="absolute bottom-10 left-4 right-4 border-b border-slate-400 flex justify-between text-[9px] font-mono text-slate-400">
                      <span>Origin (1.0 cm)</span>
                      <span>Standards & Unknown</span>
                    </div>

                    {/* Spots: Aspirin, Acetaminophen, Caffeine, Unknown */}
                    {/* Aspirin spot (Rf 0.74) */}
                    <div
                      className={`absolute left-12 w-4 h-3 rounded-full transition-all ${
                        uvLampOn ? 'bg-slate-900/90 border border-emerald-400' : 'bg-transparent'
                      }`}
                      style={{ top: '80px' }}
                      title="Aspirin spot (Rf = 0.74)"
                    ></div>

                    {/* Acetaminophen spot (Rf 0.45) */}
                    <div
                      className={`absolute left-24 w-4 h-3 rounded-full transition-all ${
                        uvLampOn ? 'bg-slate-900/90 border border-emerald-400' : 'bg-transparent'
                      }`}
                      style={{ top: '150px' }}
                      title="Acetaminophen spot (Rf = 0.45)"
                    ></div>

                    {/* Caffeine spot (Rf 0.18) */}
                    <div
                      className={`absolute left-36 w-4 h-3 rounded-full transition-all ${
                        uvLampOn ? 'bg-slate-900/90 border border-emerald-400' : 'bg-transparent'
                      }`}
                      style={{ top: '220px' }}
                      title="Caffeine spot (Rf = 0.18)"
                    ></div>

                    {/* Unknown lane (Two spots: Aspirin + Caffeine) */}
                    <div
                      className={`absolute left-48 w-4 h-3 rounded-full transition-all ${
                        uvLampOn ? 'bg-slate-900/90 border border-emerald-400' : 'bg-transparent'
                      }`}
                      style={{ top: '80px' }}
                    ></div>
                    <div
                      className={`absolute left-48 w-4 h-3 rounded-full transition-all ${
                        uvLampOn ? 'bg-slate-900/90 border border-emerald-400' : 'bg-transparent'
                      }`}
                      style={{ top: '220px' }}
                    ></div>

                    {/* Lane Labels at bottom */}
                    <div className="absolute bottom-3 left-4 right-4 flex justify-between text-[9px] font-mono text-slate-400 px-2">
                      <span>Asp</span>
                      <span>Acet</span>
                      <span>Caff</span>
                      <span>Unk</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3 text-xs">
                    <span className="text-teal-400 font-mono font-bold uppercase block">
                      Retention Factor (Rf) Calculation
                    </span>
                    <p className="text-slate-300 font-mono">
                      Rf = (Distance solute) / (Distance solvent front)
                    </p>
                    <div className="space-y-2 pt-2 font-mono">
                      <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
                        <span className="text-slate-400">Aspirin:</span>
                        <span className="text-teal-300 font-bold">4.8 cm / 6.5 cm = 0.74</span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
                        <span className="text-slate-400">Acetaminophen:</span>
                        <span className="text-cyan-300 font-bold">2.9 cm / 6.5 cm = 0.45</span>
                      </div>
                      <div className="flex justify-between p-2 bg-slate-950 rounded-lg">
                        <span className="text-slate-400">Caffeine:</span>
                        <span className="text-amber-300 font-bold">1.2 cm / 6.5 cm = 0.18</span>
                      </div>
                    </div>
                    <div className="p-3 bg-teal-950/40 border border-teal-500/30 rounded-xl text-teal-200 text-xs">
                      <strong>Conclusive Diagnosis:</strong> The unknown analgesic tablet contains Aspirin and Caffeine.
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: THEORY & PRINCIPLE */}
        {activeTab === 'theory' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-100 font-serif border-b border-slate-800 pb-3">
              Theoretical Foundation & Governing Principles
            </h3>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                1. Fundamental Chemical Theory
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">{experiment.theory}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                2. Physicochemical Principle
              </h4>
              <p className="text-sm text-slate-300 leading-relaxed font-sans">{experiment.principle}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3">
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-mono font-bold text-amber-300 uppercase block mb-2">
                  Glassware & Apparatus
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {experiment.apparatus.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <span className="text-xs font-mono font-bold text-cyan-300 uppercase block mb-2">
                  Chemical Reagents & Standards
                </span>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {experiment.chemicals.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="p-4 bg-rose-950/30 border border-rose-500/30 rounded-xl space-y-2">
              <div className="flex items-center gap-2 text-rose-300 text-xs font-mono font-bold uppercase">
                <ShieldAlert className="w-4 h-4" />
                <span>Laboratory Safety Precautions (OSHA & ACS Standards)</span>
              </div>
              <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                {experiment.precautions.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* TAB 3: STEP-BY-STEP PROCEDURE */}
        {activeTab === 'procedure' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-100 font-serif border-b border-slate-800 pb-3">
              Standard Operating Procedure (SOP)
            </h3>

            <div className="space-y-4">
              {experiment.procedure.map((p) => (
                <div
                  key={p.step}
                  className={`p-4 rounded-xl border transition-all flex items-start gap-4 ${
                    currentStepIndex + 1 === p.step
                      ? 'bg-teal-950/30 border-teal-500/50 shadow-md'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400'
                  }`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      currentStepIndex + 1 === p.step
                        ? 'bg-teal-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.step}
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase text-slate-400">Step {p.step}</span>
                    <p className="text-sm text-slate-200 leading-relaxed font-sans">{p.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OBSERVATIONS & CALCULATIONS */}
        {activeTab === 'data' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-100 font-serif border-b border-slate-800 pb-3">
              Observations, Stoichiometric Calculations & Result
            </h3>

            {/* Observations Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-teal-400 uppercase tracking-wider">
                Experimental Observation Parameters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(experiment.observations).map(([key, val]) => (
                  <div key={key} className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono text-slate-400 uppercase block">{key}</span>
                    <span className="text-sm font-mono font-semibold text-teal-300 mt-1 block">{val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculations */}
            <div className="space-y-2">
              <h4 className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
                Stoichiometric & Mathematical Calculations
              </h4>
              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-200 whitespace-pre-line leading-relaxed">
                {experiment.calculations}
              </div>
            </div>

            {/* Final Result */}
            <div className="p-5 bg-teal-950/40 border border-teal-500/40 rounded-xl space-y-1.5">
              <span className="text-xs font-mono font-bold text-teal-300 uppercase flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>Conclusive Experimental Result</span>
              </span>
              <p className="text-sm text-slate-100 font-sans leading-relaxed">{experiment.result}</p>
            </div>
          </div>
        )}

        {/* TAB 5: VIVA VOCE QUESTIONS */}
        {activeTab === 'viva' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-lg font-bold text-slate-100 font-serif border-b border-slate-800 pb-3">
              Oral Examination (Viva Voce) Preparation
            </h3>
            <p className="text-xs text-slate-400">
              Typical questions asked by external university examiners during undergraduate and graduate practical exams.
            </p>

            <div className="space-y-4">
              {experiment.vivaQuestions.map((vq, idx) => (
                <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 text-xs font-mono flex items-center justify-center shrink-0">
                      Q{idx + 1}
                    </span>
                    <h5 className="text-sm font-semibold text-slate-100">{vq.question}</h5>
                  </div>
                  <div className="pl-8 text-xs text-slate-300 leading-relaxed font-sans bg-slate-900/60 p-3 rounded-lg border border-slate-800/80">
                    <strong className="text-teal-400 block font-mono mb-1">Model Professor Answer:</strong>
                    {vq.answer}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
