import { useCallback } from "react";

import { usePredictionStore } from "@/stores/prediction-store";
import type { PredictionRequestBody, PredictionRecord } from "@/types/prediction";

export function usePredict() {
  const addRecord = usePredictionStore((state) => state.addRecord);
  const setStatus = usePredictionStore((state) => state.setStatus);

  const runPrediction = useCallback(async (payload: PredictionRequestBody) => {
    try {
      setStatus("loading");
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }
      const data = (await response.json()) as { result: PredictionRecord };
      addRecord(data.result);
      setStatus("success");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setStatus("error", message);
      throw error;
    }
  }, [addRecord, setStatus]);

  return { runPrediction };
}
