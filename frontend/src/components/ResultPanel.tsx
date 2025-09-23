import type { MouseEvent } from "react";
import { forwardRef, useMemo, useState } from "react";
import type { AnalysisStatus, PredictionRecord } from "../types";

interface Props {
  active?: PredictionRecord;
  history: PredictionRecord[];
  status: AnalysisStatus;
  onCopy: () => Promise<void> | void;
  onDownload: () => void;
  onSelect: (_id: string) => void;
  onClearHistory: () => void;
  onReset: () => void;
}

const CONFIDENCE_WIDTH_CLASSES = [
  "w-[0%]",
  "w-[10%]",
  "w-[20%]",
  "w-[30%]",
  "w-[40%]",
  "w-[50%]",
  "w-[60%]",
  "w-[70%]",
  "w-[80%]",
  "w-[90%]",
  "w-[100%]",
] as const;

export const ResultPanel = forwardRef<HTMLDivElement, Props>(function ResultPanel(
  { active, history, status, onCopy, onDownload, onSelect, onClearHistory, onReset }: Props,
  forwardedRef,
) {
  const [expanded, setExpanded] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "success" | "error">("idle");

  const headline = useMemo(() => {
    if (!active) return "Results";
    if (active.label === "ai") return "AI-leaning";
    if (active.label === "human") return "Human-leaning";
    return "Inconclusive";
  }, [active]);

  const badgeText = useMemo(() => {
    if (!active) return "Awaiting analysis";
    const percentage = Math.round(active.probability * 100);
    return `${percentage}% AI-likely`;
  }, [active]);

  const confidenceLevel = useMemo(() => {
    if (!active) return { label: "Unknown", explanation: "Run an analysis to view confidence." };
    if (active.confidence >= 0.75) return { label: "High", explanation: "Signals are consistent across multiple heuristics." };
    if (active.confidence >= 0.55) return { label: "Medium", explanation: "Signals show a moderate lean with some uncertainty." };
    return { label: "Low", explanation: "Signals conflict, so treat this verdict cautiously." };
  }, [active]);

  const confidenceClass = useMemo(() => {
    if (!active) return CONFIDENCE_WIDTH_CLASSES[0];
    const index = Math.min(CONFIDENCE_WIDTH_CLASSES.length - 1, Math.round(active.confidence * 10));
    return CONFIDENCE_WIDTH_CLASSES[index];
  }, [active]);

  const limitations = useMemo(() => {
    if (!active) return ["Use this as one input among many. Probabilities are estimates, not proof."];
    if (!active.notes || active.notes.length === 0) {
      return ["Use this as one input among many. Probabilities are estimates, not proof."];
    }
    return ["Use this as one input among many. Probabilities are estimates, not proof.", ...active.notes];
  }, [active]);

  const handleCopy = async () => {
    try {
      await onCopy();
      setCopyState("success");
      window.setTimeout(() => setCopyState("idle"), 1800);
    } catch (error) {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1800);
    }
  };

  const historyItems = useMemo(() => history.slice(1), [history]);

  return (
    <section className="space-y-6" id="results">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-neutral-900">Latest result</h2>
        <p className="text-sm text-neutral-600">Probabilistic verdict with supporting signals.</p>
      </header>

      <div
        ref={forwardedRef}
        tabIndex={active ? -1 : undefined}
        className="rounded-2xl border border-neutral-200 bg-surface px-6 py-6 shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
      >
        {!active ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 text-center text-sm text-neutral-500">
            <p className="font-medium text-neutral-600">Run your first analysis to see the verdict, confidence, and heuristics.</p>
            <p>Results will land here with a summary you can copy or export.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Verdict</p>
                <p className="text-3xl font-semibold text-neutral-900">{headline}</p>
                <span className="inline-flex items-center gap-2 rounded-full bg-brand-100 px-3 py-1 text-xs font-semibold text-brand-700">
                  {badgeText}
                </span>
              </div>
              <div className="w-full max-w-sm space-y-2">
                <div className="flex items-center justify-between text-xs text-neutral-500">
                  <span>Confidence</span>
                  <span className="font-medium text-neutral-700">{confidenceLevel.label}</span>
                </div>
                <div className="h-2 rounded-full bg-neutral-200">
                  <div
                    className={`${confidenceClass} h-full rounded-full transition-all ${
                      active.confidence >= 0.75
                        ? "bg-brand-500"
                        : active.confidence >= 0.55
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    aria-hidden
                  />
                </div>
                <p className="text-xs text-neutral-500">{confidenceLevel.explanation}</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Filename</dt>
                <dd className="break-words text-sm font-medium text-neutral-800">{active.filename}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Detected language</dt>
                <dd className="text-sm font-medium text-neutral-800">{active.language}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Snippet length</dt>
                <dd className="text-sm font-medium text-neutral-800">{active.snippetLength.toLocaleString()} characters</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Run settings</dt>
                <dd className="space-y-1 text-sm text-neutral-700">
                  <p>Model: {labelForModel(active.settings.model)}</p>
                  <p>Heuristics: {active.settings.useHeuristics ? "Enabled" : "Disabled"}</p>
                  <p>Explanation: {active.settings.explanationLevel === "full" ? "Full" : "Concise"}</p>
                </dd>
              </div>
            </dl>

            <div className="rounded-2xl border border-neutral-200 bg-surface-subtle">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
                aria-expanded={expanded}
              >
                Why this result?
                <span aria-hidden>{expanded ? "-" : "+"}</span>
              </button>
              {expanded ? (
                <ul className="space-y-2 border-t border-neutral-200 px-4 py-3 text-sm text-neutral-600">
                  {active.explanations.map((item) => (
                    <li key={item.id} className="flex flex-col gap-1 rounded-xl bg-surface px-3 py-2 shadow-inner sm:flex-row sm:items-center sm:justify-between">
                      <span>{item.message}</span>
                      <span className="text-xs font-medium text-neutral-500 sm:text-right">
                        {item.contribution >= 0 ? "+" : ""}
                        {item.contribution.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-semibold">Limitations</p>
              <ul className="space-y-1">
                {limitations.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void handleCopy()}
                className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
              >
                Copy summary
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
              >
                Download JSON report
              </button>
              <button
                type="button"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.blur();
                  onReset();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
              >
                Analyze another snippet
              </button>
            </div>
            {copyState === "success" ? <p className="text-sm text-accent-500">Summary copied.</p> : null}
            {copyState === "error" ? (
              <p className="text-sm text-rose-600">Could not access the clipboard. Copy manually instead.</p>
            ) : null}
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-neutral-200 bg-surface-subtle px-5 py-5 shadow-inner">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-neutral-800">History</p>
          <button
            type="button"
            onClick={onClearHistory}
            className="text-xs font-medium text-neutral-500 transition hover:text-neutral-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            disabled={history.length === 0}
          >
            Clear history
          </button>
        </div>
        {historyItems.length === 0 ? (
          <p className="text-xs text-neutral-500">Run a few analyses to build a short recall log.</p>
        ) : (
          <ul className="space-y-2">
            {historyItems.map((entry) => (
              <li key={entry.id}>
                <button
                  type="button"
                  onClick={() => onSelect(entry.id)}
                  className="flex w-full items-center justify-between rounded-xl border border-neutral-200 bg-surface px-4 py-3 text-left text-xs text-neutral-600 transition hover:border-neutral-300 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
                >
                  <div>
                    <p className="font-semibold text-neutral-800">{entry.filename}</p>
                    <p>{new Date(entry.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                  <span className="rounded-full bg-surface-subtle px-3 py-1 font-medium text-neutral-600">
                    {entry.label === "ai" ? "AI" : entry.label === "human" ? "Human" : "Mixed"}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {status.state === "loading" ? (
        <p className="text-sm text-neutral-500" aria-live="polite">
          {status.message}
        </p>
      ) : null}
      {status.state === "error" ? (
        <p className="text-sm text-rose-600" aria-live="polite">
          {status.message}
        </p>
      ) : null}
      {status.state === "timeout" ? (
        <p className="text-sm text-amber-600" aria-live="polite">
          {status.message}
        </p>
      ) : null}
    </section>
  );
});

function labelForModel(model: PredictionRecord["settings"]["model"]) {
  switch (model) {
    case "ml_stack":
      return "ML stack";
    case "hybrid_v2":
      return "Hybrid v2";
    default:
      return "Heuristic baseline";
  }
}
