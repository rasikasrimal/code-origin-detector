export type OriginVerdict = "ai" | "human" | "inconclusive";

export type ModelProfile = "heuristic_v1" | "ml_stack" | "hybrid_v2";

export type ExplanationLevel = "concise" | "full";

export interface AnalysisSettings {
  useHeuristics: boolean;
  model: ModelProfile;
  explanationLevel: ExplanationLevel;
}

export interface Explanation {
  id: string;
  message: string;
  contribution: number;
}

export interface PredictionRecord {
  id: string;
  filename: string;
  language: string;
  label: OriginVerdict;
  probability: number;
  confidence: number;
  snippetLength: number;
  createdAt: string;
  explanations: Explanation[];
  notes?: string[];
  settings: AnalysisSettings;
  runDurationMs: number;
}

export interface AnalysisPayload {
  code: string;
  filename: string;
  language: string;
  settings: AnalysisSettings;
}

export type AnalysisState = "idle" | "loading" | "success" | "error" | "timeout";

export interface AnalysisStatus {
  state: AnalysisState;
  message: string;
}
