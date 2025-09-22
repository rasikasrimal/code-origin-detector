import type { PredictionRecord } from "../types";

interface Props {
  active?: PredictionRecord;
  records: PredictionRecord[];
  onSelect: (_id: string) => void;
  onClear: () => void;
}

export function ResultPanel({ active, records, onSelect, onClear }: Props) {
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-card">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-slate-100">Latest prediction</h2>
        <p className="text-sm text-slate-400">Aggregated heuristics blended with a simple probability model.</p>
      </header>

      {active ? (
        <article className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-5">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">File</p>
              <p className="text-sm font-semibold text-slate-100">{active.filename}</p>
              <p className="text-xs text-slate-400">{active.language.toUpperCase()}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400">Probability (AI)</p>
              <p className="text-2xl font-semibold text-slate-100">{Math.round(active.probability * 100)}%</p>
              <p className="text-xs text-slate-400">Confidence {Math.round(active.confidence * 100)}%</p>
            </div>
          </div>
          <ul className="space-y-2">
            {active.explanations.map((item) => (
              <li key={item.id} className="rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-200">
                <div className="flex items-center justify-between">
                  <span>{item.message}</span>
                  <span className="text-xs text-slate-400">{item.contribution >= 0 ? "+" : ""}{item.contribution.toFixed(2)}</span>
                </div>
              </li>
            ))}
          </ul>
        </article>
      ) : (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-dashed border-slate-800 text-sm text-slate-400">
          Generate a prediction to see the model’s explanation.
        </div>
      )}

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-slate-100">History</p>
          <button
            type="button"
            onClick={onClear}
            className="rounded-md border border-slate-700 px-3 py-1 text-xs text-slate-300 transition hover:border-brand-400"
          >
            Clear
          </button>
        </div>
        <div className="space-y-2">
          {records.length === 0 ? (
            <p className="text-xs text-slate-400">Run the detector to populate history entries.</p>
          ) : (
            records.map((record) => (
              <button
                key={record.id}
                type="button"
                onClick={() => onSelect(record.id)}
                className="flex w-full items-center justify-between rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-left text-xs text-slate-300 transition hover:border-brand-400"
              >
                <div>
                  <p className="font-semibold text-slate-100">{record.filename}</p>
                  <p>{new Date(record.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
                <span className="text-slate-400">
                  {record.label === "ai" ? "AI" : "Human"} • {Math.round(record.probability * 100)}%
                </span>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}










