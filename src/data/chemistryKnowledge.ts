import { Flashcard, VirtualExperiment, ExamPaper, QuizQuestion } from '../types.ts';

export const DEFAULT_FLASHCARDS: Flashcard[] = [
  {
    id: 'fc-1',
    topic: 'organic',
    front: 'What is the rate law and molecularity of an SN1 reaction?',
    back: 'Rate = k[R-X] (First order, Unimolecular)',
    explanation: 'The rate-determining step is the heterolytic cleavage of the C-X bond to form a carbocation intermediate. Nucleophile concentration does not appear in the rate equation.',
    difficulty: 'medium',
  },
  {
    id: 'fc-2',
    topic: 'organic',
    front: 'Why does SN2 lead to complete stereochemical inversion (Walden inversion)?',
    back: 'Backside nucleophilic attack into the σ* antibonding orbital',
    explanation: 'The nucleophile must donate electron density into the C-X σ* antibonding orbital at 180° opposite the leaving group, inverting the stereocenter like an umbrella in a gale.',
    difficulty: 'easy',
  },
  {
    id: 'fc-3',
    topic: 'inorganic',
    front: 'Why is carbon monoxide (CO) a strong field ligand in spectrochemical series?',
    back: 'Synergic bonding: σ-donation and strong π-backbonding (dπ → π*)',
    explanation: 'CO donates its lone pair via a σ-bond into an empty metal d-orbital and accepts electron density from filled metal t2g orbitals into its empty π* antibonding orbitals, dramatically increasing the crystal field splitting energy (Δo).',
    difficulty: 'difficult',
  },
  {
    id: 'fc-4',
    topic: 'physical',
    front: 'State the Clausius thermodynamic definition of entropy (dS).',
    back: 'dS = δq_rev / T',
    explanation: 'Entropy change equals the infinitesimal heat transferred reversibly divided by the absolute temperature at which the transfer occurs. S has units of J·K⁻¹·mol⁻¹.',
    difficulty: 'medium',
  },
  {
    id: 'fc-5',
    topic: 'spectroscopy',
    front: 'Where does the characteristic carbonyl (C=O) stretching peak appear in FTIR?',
    back: '1680 – 1750 cm⁻¹ (Strong, sharp absorption)',
    explanation: 'Esters typically absorb ~1735 cm⁻¹, unconjugated ketones/aldehydes ~1715 cm⁻¹, while conjugation with double bonds or aryl rings shifts the peak to lower wavenumbers (~1685 cm⁻¹).',
    difficulty: 'easy',
  },
  {
    id: 'fc-6',
    topic: 'analytical',
    front: 'What is the half-equivalence point in a weak acid-strong base titration?',
    back: 'pH = pKa of the weak acid ([HA] = [A⁻])',
    explanation: 'By the Henderson-Hasselbalch equation: pH = pKa + log([A⁻]/[HA]). When half the acid is neutralized, [A⁻] = [HA], so log(1) = 0 and pH equals pKa.',
    difficulty: 'medium',
  },
  {
    id: 'fc-7',
    topic: 'quantum',
    front: 'Why is O2 paramagnetic according to Molecular Orbital (MO) Theory?',
    back: 'Two unpaired electrons occupy degenerate π*2px and π*2py orbitals',
    explanation: 'Filling the 16 valence and core electrons of O2 yields the configuration ... (π2px)² (π2py)² (π*2px)¹ (π*2py)¹. Hund’s rule demands parallel spins in degenerate orbitals, producing paramagnetism with S = 1 (triplet ground state, ³Σg⁻).',
    difficulty: 'difficult',
  },
];

export const VIRTUAL_EXPERIMENTS: VirtualExperiment[] = [
  {
    id: 'exp-titration',
    title: 'Potentiometric & Indicator Acid-Base Titration',
    discipline: 'Analytical',
    objective: 'Determine the exact concentration and pKa of an unknown weak acid (CH3COOH) by titrating against standardized 0.100 M NaOH.',
    theory: 'Neutralization of ethanoic acid proceeds as: CH3COOH(aq) + OH⁻(aq) ⇌ CH3COO⁻(aq) + H2O(l). At the equivalence point, the conjugate base hydrolyzes to yield a slightly alkaline solution (pH ~8.7).',
    principle: 'Measurement of hydronium ion concentration ([H3O⁺]) via calibrated glass-combination electrode as a function of titrant volume. Henderson-Hasselbalch applies in buffer region.',
    apparatus: ['50.00 mL Class A Buret', '250 mL Erlenmeyer Flask', 'Digital pH Meter (calibrated at pH 4.0, 7.0, 10.0)', 'Magnetic Stirrer & Teflon flea', 'Volumetric Pipet (25.00 mL)'],
    chemicals: ['Standardized 0.100 M Sodium Hydroxide (NaOH)', 'Unknown Acetic Acid Solution (CH3COOH)', 'Phenolphthalein Indicator Solution (0.1% in EtOH)', 'Deionized Water'],
    procedure: [
      { step: 1, text: 'Rinse and fill the buret with standardized 0.100 M NaOH solution. Remove air bubbles from the tip and zero the meniscus.' },
      { step: 2, text: 'Pipet exactly 25.00 mL of unknown acetic acid into the beaker. Add 25 mL DI water and 3 drops of phenolphthalein.' },
      { step: 3, text: 'Immerse the calibrated pH electrode and start magnetic stirring at moderate speed without splashing.' },
      { step: 4, text: 'Record initial pH (Volume = 0.00 mL). Add NaOH in 1.00 mL increments until pH 6.0, then 0.10 mL increments near equivalence.' },
      { step: 5, text: 'Note the persistent faint pink color lasting >30 seconds and the inflection jump on the titration curve.' },
    ],
    currentStep: 1,
    observations: {
      initialPH: 2.88,
      titrantNormality: '0.100 M',
      aliquotVolume: '25.00 mL',
      halfEqVolume: '12.50 mL',
      halfEqPH: '4.76 (Observed pKa)',
      equivalenceVolume: '25.00 mL',
      equivalencePH: '8.72',
    },
    calculations: 'M_acid × V_acid = M_base × V_base\nM_acid = (0.100 M × 25.00 mL) / 25.00 mL = 0.1000 M\npKa = pH at half-neutralization (V = 12.50 mL) = 4.76',
    result: 'The molarity of the unknown acetic acid was found to be 0.1000 ± 0.0004 M with an experimental pKa of 4.76 (literature value: 4.756 at 25°C).',
    precautions: [
      'NaOH is caustic; wear chemical splash goggles and neoprene gloves.',
      'Ensure the glass electrode bulb remains submerged throughout titration.',
      'Calibrate pH meter with fresh standard buffer solutions before measurement.',
      'Avoid reading parallax errors by viewing meniscus at eye level.'
    ],
    vivaQuestions: [
      { question: 'Why does the equivalence point of a weak acid titration occur above pH 7.0?', answer: 'Because at the equivalence point, the solution contains sodium acetate. The acetate ion CH3COO⁻ is a conjugate base that undergoes hydrolysis: CH3COO⁻ + H2O ⇌ CH3COOH + OH⁻, generating excess hydroxide ions.' },
      { question: 'Why can phenolphthalein be used instead of methyl orange for this titration?', answer: 'The pH transition range of phenolphthalein is 8.2 – 10.0, which perfectly overlaps the steep inflection region (pH 7.5 – 10.5) of acetic acid titration. Methyl orange (range 3.1 – 4.4) would change color far before the true equivalence point.' },
      { question: 'What is the physical significance of the inflection point on the derivative plot d(pH)/dV?', answer: 'The maximum of the first derivative d(pH)/dV corresponds exactly to the point of inflection, representing the true stoichiometric equivalence point with minimal titration error.' }
    ],
    simulationType: 'titration_ph',
  },
  {
    id: 'exp-kinetics',
    title: 'Chemical Kinetics: Saponification & Rate Constant',
    discipline: 'Physical',
    objective: 'Determine the order of reaction, second-order rate constant (k), and activation energy (Ea) for the alkaline hydrolysis of ethyl acetate.',
    theory: 'CH3COOC2H5 + OH⁻ → CH3COO⁻ + C2H5OH. The rate is given by Rate = k[ester][OH⁻]. As the reaction proceeds, highly conducting OH⁻ ions (λ° = 198 S·cm²·mol⁻¹) are replaced by lower mobility acetate ions (λ° = 40.9 S·cm²·mol⁻¹), allowing continuous conductometric tracking.',
    principle: 'Conductance κ_t decreases linearly with conversion: (κ_0 - κ_t) / (κ_t - κ_∞) = k·c_0·t for equimolar initial concentrations.',
    apparatus: ['Thermostatted Water Bath (25°C, 35°C, 45°C ± 0.1°C)', 'Conductivity Meter & Dip Cell (cell constant ~1.0 cm⁻¹)', 'Stopwatch', 'Twin-neck reaction vessel', 'Graduated pipets'],
    chemicals: ['0.020 M Ethyl Acetate (freshly prepared)', '0.020 M Sodium Hydroxide (CO2-free)', 'Potassium Chloride standard for cell calibration'],
    procedure: [
      { step: 1, text: 'Equilibrate 50.0 mL of 0.020 M NaOH and 50.0 mL of 0.020 M ethyl acetate in the 25°C constant-temperature water bath for 20 minutes.' },
      { step: 2, text: 'Rapidly mix both solutions, start the digital stopwatch, and immerse the clean conductivity cell.' },
      { step: 3, text: 'Record conductivity (mS/cm) at 1-minute intervals for 20 minutes, then 2-minute intervals up to 40 minutes.' },
      { step: 4, text: 'Repeat the kinetic run at 35.0°C and 45.0°C to construct the Arrhenius plot ln(k) vs 1/T.' },
    ],
    currentStep: 1,
    observations: {
      temperature: '298.15 K (25°C)',
      cellConstant: '1.02 cm⁻¹',
      initialConductivity: '4.82 mS/cm',
      finalConductivityInfinity: '1.24 mS/cm',
      rateConstant25C: '0.108 L·mol⁻¹·s⁻¹',
      activationEnergy: '48.2 kJ·mol⁻¹',
    },
    calculations: 'Slope of (κ_0 - κ_t)/(κ_t - κ_∞) vs time = k × c_0\nFrom Arrhenius: ln(k2/k1) = -(Ea/R) × (1/T2 - 1/T1)\nEa = 48.2 kJ/mol; Arrhenius pre-exponential factor A = 3.2 × 10⁷ L·mol⁻¹·s⁻¹',
    result: 'The reaction follows second-order kinetics with k(25°C) = 0.108 L·mol⁻¹·s⁻¹ and an Arrhenius activation energy Ea = 48.2 kJ·mol⁻¹.',
    precautions: [
      'Solutions must be protected from atmospheric CO2 absorption, which forms CO3²⁻ and distorts electrical conductance.',
      'Temperature fluctuations must be kept below ±0.1°C as conductivity has ~2%/°C temperature coefficient.'
    ],
    vivaQuestions: [
      { question: 'Why is conductometry preferred over volumetric titration for this kinetic study?', answer: 'Conductometry is a non-invasive, continuous measurement technique that does not require quenching or chemical perturbation of the reacting mixture at each time interval.' },
      { question: 'What is the sign of the entropy of activation (ΔS‡) for alkaline ester hydrolysis?', answer: 'ΔS‡ is negative (approx. -90 to -110 J·K⁻¹·mol⁻¹) because the transition state is an ordered, cyclic, tetrahedral intermediate solvated tightly by water molecules.' }
    ],
    simulationType: 'kinetics_temp',
  },
  {
    id: 'exp-tlc',
    title: 'Thin-Layer Chromatography (TLC) of Analgesic Drugs',
    discipline: 'Organic',
    objective: 'Separate and identify components in an unknown analgesic tablet mixture (Aspirin, Acetaminophen, Caffeine) by normal-phase silica gel TLC.',
    theory: 'Separation relies on differential partitioning between the polar stationary phase (Silica gel with silanol Si-OH groups) and the moderately polar mobile phase (Ethyl acetate : Hexanes 1:1 with 1% acetic acid).',
    principle: 'Polar compounds form stronger hydrogen bonds with silica and travel slower (lower Rf); less polar compounds partition preferentially into the eluent and travel faster (higher Rf).',
    apparatus: ['Silica gel 60 F254 TLC plates (aluminum backed, 5 × 10 cm)', 'Developing Chamber with filter paper wick', 'Capillary spotters (micropipets)', 'UV Viewing Cabinet (254 nm and 365 nm)', 'Iodine staining chamber'],
    chemicals: ['Standard reference solutions: Acetylsalicylic acid (Aspirin), Acetaminophen, Caffeine', 'Unknown analgesic extract', 'Developing solvent: Ethyl acetate / Hexanes (60:40 v/v) + 1% glacial acetic acid'],
    procedure: [
      { step: 1, text: 'Draw a pencil origin line 1.0 cm from the bottom of the plate. Do not use pen or gouge the silica adsorbent layer.' },
      { step: 2, text: 'Spot reference standards and unknown sample using fine glass capillaries; keep spot diameters <2 mm.' },
      { step: 3, text: 'Place the plate in the saturated developing chamber. Allow solvent to ascend until 0.5 cm from top (solvent front).' },
      { step: 4, text: 'Remove plate, immediately mark the solvent front with pencil, and air dry in the fume hood.' },
      { step: 5, text: 'Visualize spots under 254 nm shortwave UV (fluorescence quenching) and outline each spot. Calculate Rf values.' },
    ],
    currentStep: 1,
    observations: {
      solventFrontDistance: '6.5 cm',
      aspirinDistance: '4.8 cm (Rf = 0.74)',
      acetaminophenDistance: '2.9 cm (Rf = 0.45)',
      caffeineDistance: '1.2 cm (Rf = 0.18)',
      unknownSpots: 'Two spots observed at Rf 0.74 and Rf 0.18 (Aspirin + Caffeine compound formulation)',
    },
    calculations: 'Retention Factor Rf = (Distance traveled by solute spot) / (Distance traveled by solvent front)\nRf(Aspirin) = 4.8 / 6.5 = 0.74\nRf(Acetaminophen) = 2.9 / 6.5 = 0.45\nRf(Caffeine) = 1.2 / 6.5 = 0.18',
    result: 'The unknown analgesic was conclusively identified as a combination of Acetylsalicylic Acid (Rf 0.74) and Caffeine (Rf 0.18).',
    precautions: [
      'Handle TLC plates by edges only; fingerprints deposit squalene/lipids that show up as false spots.',
      'Always include acetic acid in eluent to suppress ionization of carboxylic acids, preventing tailing streaks.'
    ],
    vivaQuestions: [
      { question: 'Why does caffeine exhibit the lowest Rf value on normal phase silica?', answer: 'Caffeine has two basic nitrogen atoms and two amide carbonyls capable of strong dipole and hydrogen-bonding interactions with the acidic silanol (Si-OH) groups on the silica surface.' },
      { question: 'What causes the dark spots under 254 nm UV light on F254 plates?', answer: 'The plate contains an inorganic zinc silicate phosphor that emits green fluorescence under 254 nm UV. Aromatic compounds absorb this UV wavelength, preventing excitation of the phosphor (fluorescence quenching).' }
    ],
    simulationType: 'tlc_plate',
  },
];

export const UNIVERSITY_EXAM_BSC: ExamPaper = {
  id: 'bsc-chem-annual-2026',
  title: 'B.Sc. (Honours) Chemistry Degree Examination — Paper III: Advanced Organic & Physical Chemistry',
  level: 'Graduate (B.Sc. Final / B.S.)',
  durationMinutes: 180,
  totalMarks: 75,
  instructions: [
    'Answer all questions in Section A (Objective/Short answer).',
    'Answer any FOUR questions from Section B (5 marks each).',
    'Answer any THREE questions from Section C (10 marks each).',
    'Use of non-programmable scientific calculators is permitted.',
    'Illustrate reaction mechanisms with curved arrows and energy diagrams where appropriate.'
  ],
  sections: [
    {
      sectionName: 'Section A: Fundamental Definitions & Mechanisms (15 Marks)',
      marksPerQuestion: 1,
      description: 'Answer all 15 questions. Each question carries 1 mark.',
      questions: [
        {
          id: 'q1-1',
          qNumber: '1(a)',
          text: 'State the Hückel rule of aromaticity for monocyclic planar conjugated polyenes.',
          type: '1 mark',
          marks: 1,
          markingScheme: 'Full 1 mark for stating (4n+2) π-electrons where n is a non-negative integer (0,1,2...), with planar, cyclic, fully conjugated criteria.',
          modelAnswer: 'A planar, monocyclic, fully conjugated ring system possesses aromatic stabilization if it contains (4n + 2) delocalized π-electrons, where n = 0, 1, 2, 3... (e.g., Benzene has 6 π-electrons with n = 1).'
        },
        {
          id: 'q1-2',
          qNumber: '1(b)',
          text: 'What is the stereochemical outcome of an SN2 reaction at an asymmetric chiral carbon?',
          type: '1 mark',
          marks: 1,
          markingScheme: '1 mark for Walden inversion / complete inversion of stereochemical configuration.',
          modelAnswer: 'Complete inversion of configuration (Walden Inversion) due to backside nucleophilic attack on the C–X σ* antibonding orbital.'
        },
        {
          id: 'q1-3',
          qNumber: '1(c)',
          text: 'Write the thermodynamic relation between standard Gibbs free energy change (ΔG°) and equilibrium constant (K).',
          type: '1 mark',
          marks: 1,
          markingScheme: '1 mark for ΔG° = -RT ln K or K = exp(-ΔG°/RT).',
          modelAnswer: 'ΔG° = -RT ln K (where R is the universal gas constant and T is absolute temperature in Kelvin).'
        },
        {
          id: 'q1-4',
          qNumber: '1(d)',
          text: 'Give the electronic ground state term symbol for a free gaseous d³ transition metal ion in an octahedral field.',
          type: '1 mark',
          marks: 1,
          markingScheme: '1 mark for ⁴A₂g.',
          modelAnswer: '⁴A₂g (from the Russell-Saunders ⁴F free ion term split by an octahedral crystal field).'
        },
      ]
    },
    {
      sectionName: 'Section B: Mechanistic & Analytical Problems (20 Marks)',
      marksPerQuestion: 5,
      description: 'Answer any 4 out of 6 questions. Each question carries 5 marks.',
      questions: [
        {
          id: 'q2-1',
          qNumber: '2',
          text: 'Explain the mechanism of acid-catalyzed Aldol Condensation of acetaldehyde followed by dehydration to crotonaldehyde. Detail all curved arrows and intermediates.',
          type: 'mechanism',
          marks: 5,
          markingScheme: 'Enol formation (1.5 marks), Nucleophilic addition to protonated aldehyde (1.5 marks), Proton transfer & dehydration via E1cB/E1 (2 marks).',
          modelAnswer: 'Step 1: Protonation of carbonyl oxygen followed by loss of α-proton yields enol intermediate. Step 2: Nucleophilic attack of enol π-electrons onto a second protonated acetaldehyde molecule forms a β-hydroxycarbocation. Step 3: Deprotonation yields β-hydroxybutyraldehyde (aldol). Step 4: Acid-catalyzed elimination of H2O yields conjugated crotonaldehyde (2-butenal).'
        },
        {
          id: 'q2-2',
          qNumber: '3',
          text: 'Calculate the pH and degree of dissociation (α) of a 0.050 M solution of cyanic acid (HOCN) given Ka = 3.5 × 10⁻⁴ at 25°C. Check whether the quadratic formula is required.',
          type: 'numerical',
          marks: 5,
          markingScheme: 'Equilibrium expression setup (1 mark), approximation validity check (1 mark), quadratic solution (2 marks), final pH & α (1 mark).',
          modelAnswer: 'Ka = x² / (0.050 - x) = 3.5 × 10⁻⁴. Since c/Ka = 0.050 / (3.5 × 10⁻⁴) = 143 < 400, the 5% rule fails and the quadratic equation must be solved:\nx² + 3.5×10⁻⁴ x - 1.75×10⁻⁵ = 0\nx = [H⁺] = 4.01 × 10⁻³ M\npH = -log(4.01 × 10⁻³) = 2.40\nDegree of dissociation α = x / c = 4.01×10⁻³ / 0.050 = 0.0802 (8.02% ionized).'
        }
      ]
    },
    {
      sectionName: 'Section C: Advanced Essays & Derivations (30 Marks)',
      marksPerQuestion: 10,
      description: 'Answer any 3 out of 5 questions. Each question carries 10 marks.',
      questions: [
        {
          id: 'q3-1',
          qNumber: '4',
          text: 'Discuss Crystal Field Theory (CFT) for octahedral [ML6]ⁿ⁺ and tetrahedral [ML4]ⁿ⁺ complexes. Derive the relationship between Δt and Δo, and explain why tetrahedral complexes are almost universally high-spin.',
          type: 'essay',
          marks: 10,
          markingScheme: 'Octahedral splitting diagram with t2g (-0.4Δo) and eg (+0.6Δo) (3 marks), Tetrahedral splitting diagram e (-0.6Δt) and t2 (+0.4Δt) (3 marks), Geometric derivation showing Δt = (4/9)Δo (2 marks), Pairing energy comparison explaining high-spin exclusivity (2 marks).',
          modelAnswer: 'In octahedral geometry, ligands approach directly along x, y, z axes, creating maximum electrostatic repulsion with dx²-y² and dz² (eg set raised by +0.6Δo), while dxy, dyz, dxz lie between axes (t2g set lowered by -0.4Δo). In tetrahedral geometry, no ligand points directly at any d-orbital; orbitals directed toward edges (dxy, dyz, dxz) experience greater repulsion than those pointing at faces (dx²-y², dz²). Hence splitting reverses to e and t2. Because there are only 4 ligands instead of 6, and orientation is non-axial, Δt = (4/9)Δo. Because Δt is always significantly smaller than the electron pairing energy (P), pairing is energetically unfavorable; thus virtually all tetrahedral complexes adopt high-spin electron configurations.'
        }
      ]
    }
  ]
};

export const TOPIC_CURRICULUM = [
  {
    id: 'organic',
    title: 'Organic Chemistry',
    icon: '🧪',
    badge: 'Core Graduate Discipline',
    modules: [
      'Structure & Bonding (Hybridization, MO description of σ and π bonds)',
      'Aromaticity, Anti-aromaticity, and Annulenes',
      'Stereochemistry & Conformational Analysis (R/S, Topicity, Cyclohexane)',
      'Nucleophilic Substitution (SN1, SN2, SNi, Neighboring Group Participation)',
      'Elimination Reactions (E1, E2, E1cB, Saytzeff vs Hofmann selectivity)',
      'Electrophilic & Nucleophilic Aromatic Substitution',
      'Carbonyl Chemistry & Enolate Additions (Aldol, Claisen, Mannich, Michael)',
      'Pericyclic Reactions (Woodward-Hoffmann rules, Diels-Alder, Sigmatropic)',
      'Spectroscopic Structure Elucidation (FTIR, 1H/13C-NMR, 2D COSY/HSQC)'
    ]
  },
  {
    id: 'inorganic',
    title: 'Inorganic Chemistry',
    icon: '🔷',
    badge: 'Transition Metals & Coordination',
    modules: [
      'Crystal Field Theory (CFT) & Ligand Field Theory (LFT)',
      'Molecular Orbital Diagrams for Homonuclear & Heteronuclear Diatomics',
      'Electronic Spectra of Transition Metal Complexes (Orgel & Tanabe-Sugano)',
      'Organometallic Chemistry (18-Electron Rule, Metal Carbonyls, Catalysis)',
      'Bioinorganic Chemistry (Hemoglobin, Myoglobin, Cytochromes, Chlorophyll)',
      'Lanthanides & Actinides (Lanthanide Contraction, Magnetic Properties)'
    ]
  },
  {
    id: 'physical',
    title: 'Physical Chemistry',
    icon: '⚛️',
    badge: 'Thermodynamics & Quantum',
    modules: [
      'Classical Thermodynamics (Laws, Free Energy, Maxwell Relations)',
      'Chemical Equilibrium & Phase Rule (Clapeyron-Clausius, Binary Eutectics)',
      'Chemical Kinetics (Collision Theory, Transition State Theory, Eyring)',
      'Electrochemistry (Nernst Equation, Butler-Volmer, Conductometry)',
      'Quantum Chemistry (Schrödinger Equation, Particle in a Box, Harmonic Oscillator)',
      'Statistical Thermodynamics (Partition Functions, Boltzmann Distribution)'
    ]
  },
  {
    id: 'analytical',
    title: 'Analytical & Instrumental',
    icon: '🔬',
    badge: 'Quantitative Methodology',
    modules: [
      'Titrimetric & Gravimetric Analysis (Equivalence equilibria, buffer capacity)',
      'Chromatography (HPLC, GC-MS, TLC theory, Van Deemter equation)',
      'Spectrophotometry & Beer-Lambert Law (Deviations, Calibration curves)',
      'Electroanalytical Techniques (Cyclic Voltammetry, Potentiometry)',
      'Quality Assurance, Error Propagation, and Statistical Hypothesis Testing'
    ]
  },
  {
    id: 'spectroscopy',
    title: 'Spectroscopy Lab',
    icon: '📈',
    badge: 'Multi-Technique Characterization',
    modules: [
      'Proton NMR (Chemical Shift, Spin-spin coupling, Pascal triangle, Diastereotopic protons)',
      'Carbon-13 NMR (Proton decoupled, DEPT-45, DEPT-90, DEPT-135)',
      'FTIR (Hooke’s Law harmonic model, Fermi resonance, Hydrogen bonding shifts)',
      'Mass Spectrometry (McLafferty rearrangement, α-cleavage, Isotope ratios)',
      'UV-Vis Spectroscopy (Woodward-Fieser rules for conjugated dienes & enones)'
    ]
  },
];
