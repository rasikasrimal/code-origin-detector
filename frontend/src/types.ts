export type OriginVerdict = "ai" | "human" | "inconclusive";

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
}

export interface AnalysisPayload {
  code: string;
  filename: string;
  language: string;
}

export type AnalysisState = "idle" | "loading" | "success" | "error" | "timeout";

export interface AnalysisStatus {
  state: AnalysisState;
  message: string;
}
