export interface GraphConfig {
  type: 'hyperbola' | 'quadratic';
  // Hyperbola parameters: y = a/x + b
  a?: number;
  b?: number;
  // Quadratic parameters: y = ax^2 + bx + c
  quadA?: number;
  quadB?: number;
  quadC?: number;
  // Visual options
  xRange?: [number, number];
  yRange?: [number, number];
  highlightPoints?: Array<{ x: number; y: number; label?: string }>;
  showAsymptotes?: boolean;
  showQuadrants?: boolean;
}

export interface QuestionOption {
  id: string;
  label: string;
  subLabel?: string;
  graphConfig?: GraphConfig;
  isCorrect: boolean;
}

export interface Question {
  id: string;
  section: 'quadratic' | 'hyperbola';
  number: number;
  title: string;
  prompt: string;
  graphConfig?: GraphConfig;
  equationDisplay?: string;
  options: QuestionOption[];
  hints: string[];
  explanation: string;
}

export interface UserAnswerState {
  selectedOptionId: string | null;
  isCorrect: boolean;
  attempts: number;
  revealedHints: number;
}

export interface AppProgress {
  studentName: string;
  currentSection: number; // 1, 2, 3, 4
  answers: Record<string, UserAnswerState>;
  score: number;
  reflection: string;
  startedAt: string;
  completedAt?: string;
  isSoundMuted: boolean;
}
