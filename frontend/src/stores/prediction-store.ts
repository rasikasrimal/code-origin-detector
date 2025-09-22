import { create } from "zustand";

import type { PredictionRecord } from "@/types/prediction";

interface PredictionState {
  records: PredictionRecord[];
  active?: PredictionRecord;
  status: "idle" | "loading" | "error" | "success";
  error?: string;
  addRecord: (record: PredictionRecord) => void;
  setActive: (id: string) => void;
  setStatus: (status: PredictionState["status"], error?: string) => void;
  reset: () => void;
}

export const usePredictionStore = create<PredictionState>((set) => ({
  records: [],
  active: undefined,
  status: "idle",
  error: undefined,
  addRecord: (record) =>
    set((state) => ({
      records: [record, ...state.records].slice(0, 20),
      active: record,
      status: "success",
      error: undefined,
    })),
  setActive: (id) =>
    set((state) => ({
      active: state.records.find((item) => item.id === id) ?? state.active,
    })),
  setStatus: (status, error) => set(() => ({ status, error })),
  reset: () => set({ records: [], active: undefined, status: "idle", error: undefined }),
}));
