import type { ExamQuestion } from '../utils/assessmentMappers';

/** Shown only when PYQ API session fails — JEE/NEET-style samples, not generic placeholders. */
export const PYQ_DEMO_QUESTIONS: ExamQuestion[] = [
  {
    id: 'pyq-1',
    text: 'A particle moves in a circle of radius 0.5 m with constant speed 4 m/s. The magnitude of centripetal acceleration is:',
    options: ['8 m/s²', '16 m/s²', '32 m/s²', '64 m/s²'],
  },
  {
    id: 'pyq-2',
    text: 'Which element has the highest first ionization energy?',
    options: ['Na', 'Mg', 'Al', 'Si'],
  },
  {
    id: 'pyq-3',
    text: 'In a photoelectric experiment, increasing the intensity of light while keeping frequency constant increases:',
    options: [
      'Maximum kinetic energy of photoelectrons',
      'Number of photoelectrons emitted',
      'Work function of the metal',
      'Stopping potential',
    ],
  },
  {
    id: 'pyq-4',
    text: 'The hybridization of carbon in ethene (C₂H₄) is:',
    options: ['sp', 'sp²', 'sp³', 'sp³d'],
  },
  {
    id: 'pyq-5',
    text: 'A block of mass 2 kg on a smooth horizontal surface is pulled with 10 N. Its acceleration is:',
    options: ['2 m/s²', '5 m/s²', '10 m/s²', '20 m/s²'],
  },
  {
    id: 'pyq-6',
    text: 'Which reagent converts a primary alcohol to an aldehyde without over-oxidation to acid?',
    options: ['KMnO₄ (hot)', 'PCC in CH₂Cl₂', 'NaBH₄', 'LiAlH₄'],
  },
  {
    id: 'pyq-7',
    text: 'The dimensional formula of magnetic field B is:',
    options: ['[MT⁻²A⁻¹]', '[MT⁻¹A⁻¹]', '[MLT⁻²A⁻¹]', '[M⁰L⁰T⁰]'],
  },
  {
    id: 'pyq-8',
    text: 'In the reaction 2SO₂ + O₂ ⇌ 2SO₃, decreasing volume at constant temperature will:',
    options: [
      'Shift equilibrium toward products',
      'Shift equilibrium toward reactants',
      'Have no effect on equilibrium',
      'Decrease Kc',
    ],
  },
  {
    id: 'pyq-9',
    text: 'The de Broglie wavelength of an electron accelerated through potential V is proportional to:',
    options: ['V', '√V', '1/√V', '1/V²'],
  },
  {
    id: 'pyq-10',
    text: 'Which of the following is a strong electrolyte in aqueous solution?',
    options: ['CH₃COOH', 'NH₄OH', 'NaCl', 'H₂CO₃'],
  },
];
