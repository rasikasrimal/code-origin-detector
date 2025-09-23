import type { MouseEvent } from "react";
import { forwardRef, useMemo, useState } from "react";
import type { AnalysisStatus, PredictionRecord } from "../types";

interface Props {
  active?: PredictionRecord;
  status: AnalysisStatus;
  onCopy: () => Promise<void> | void;
  onDownload: () => void;
  onReset: () => void;
}

export const ResultPanel = forwardRef<HTMLDivElement, Props>(function ResultPanel(
  { active, status, onCopy, onDownload, onReset }: Props,
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
    if (!active) return "";
    const percentage = Math.round(active.probability * 100);
    return `${percentage}% AI-likely`;
  }, [active]);

  const confidenceLevel = useMemo(() => {
    if (!active) return { label: "Unknown", explanation: "Run an analysis to view confidence." };
    if (active.confidence >= 0.75) return { label: "High", explanation: "Signals are consistent across multiple heuristics." };
    if (active.confidence >= 0.55) return { label: "Medium", explanation: "Signals show a moderate lean with some uncertainty." };
    return { label: "Low", explanation: "Signals conflict, so treat this verdict cautiously." };
  }, [active]);

  const confidenceWidth = useMemo(() => {
    if (!active) return "0%";
    return `${Math.round(active.confidence * 100)}%`;
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
      window.setTimeout(() => setCopyState("idle"), 1600);
    } catch (error) {
      setCopyState("error");
      window.setTimeout(() => setCopyState("idle"), 1600);
    }
  };

  return (
    <section className="space-y-4" id="results">
      <header className="space-y-1">
        <h2 className="text-xl font-semibold text-slate-900">Latest result</h2>
        <p className="text-sm text-slate-600">Probabilistic verdict shown after each analysis.</p>
      </header>

      <div
        ref={forwardedRef}
        tabIndex={active ? -1 : undefined}
        className="rounded-2xl border border-slate-200 bg-white p-6 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
      >
        {!active ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-slate-500">
            Run an analysis to see results here.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">Verdict</p>
                <p className="text-2xl font-semibold text-slate-900">{headline}</p>
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                  {badgeText}
                </div>
              </div>
              <div className="w-full max-w-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Confidence</span>
                  <span className="font-medium text-slate-700">{confidenceLevel.label}</span>
                </div>
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className={`h-full rounded-full ${
                      active.confidence >= 0.75
                        ? "bg-emerald-500"
                        : active.confidence >= 0.55
                        ? "bg-amber-500"
                        : "bg-rose-500"
                    }`}
                    style={{ width: confidenceWidth }}
                    aria-hidden
                  />
                </div>
                <p className="text-xs text-slate-500">{confidenceLevel.explanation}</p>
              </div>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Filename</dt>
                <dd className="break-words text-sm font-medium text-slate-800">{active.filename}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Detected language</dt>
                <dd className="text-sm font-medium text-slate-800">{active.language}</dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">Snippet length</dt>
                <dd className="text-sm font-medium text-slate-800">{active.snippetLength.toLocaleString()} characters</dd>
              </div>
            </dl>

            <div className="rounded-xl border border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => setExpanded((value) => !value)}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
                aria-expanded={expanded}
              >
                Why this result?
                <span aria-hidden>{expanded ? "-" : "+"}</span>
              </button>
              {expanded ? (
                <ul className="space-y-2 border-t border-slate-200 px-4 py-3 text-sm text-slate-600">
                  {active.explanations.map((item) => (
                    <li key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                      <span>{item.message}</span>
                      <span className="mt-1 text-xs text-slate-400 sm:mt-0">
                        {item.contribution >= 0 ? "+" : ""}
                        {item.contribution.toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            <div className="space-y-2 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
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
                className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              >
                Copy summary
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              >
                Download JSON report
              </button>
              <button
                type="button"
                onClick={(event: MouseEvent<HTMLButtonElement>) => {
                  event.currentTarget.blur();
                  onReset();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-transparent px-4 py-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              >
                Analyze another snippet
              </button>
            </div>
            {copyState === "success" ? <p className="text-sm text-emerald-600">Summary copied.</p> : null}
            {copyState === "error" ? (
              <p className="text-sm text-rose-600">Couldn’t access the clipboard. Copy manually instead.</p>
            ) : null}
          </div>
        )}
      </div>

      {status.state === "loading" ? (
        <p className="text-sm text-slate-500" aria-live="polite">
          Analyzing…
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

