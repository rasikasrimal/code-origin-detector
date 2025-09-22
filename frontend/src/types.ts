export type OriginLabel = "ai" | "human";

export interface Explanation {
  id: string;
  message: string;
  contribution: number;
}

export interface PredictionRecord {
  id: string;
  filename: string;
  language: string;
  label: OriginLabel;
  probability: number;
  confidence: number;
  explanations: Explanation[];
  createdAt: string;
}
