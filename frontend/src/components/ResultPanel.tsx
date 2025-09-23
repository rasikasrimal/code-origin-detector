import { hoverPop, listItem, press } from '../lib/animations';
import type { AnalysisStatus, PredictionRecord } from '../types';

interface ResultPanelProps {
  activeRecord?: PredictionRecord;
  history: PredictionRecord[];
  status: AnalysisStatus;
  onSelect: (id: string) => void;
  onClearHistory: () => void;
  onCopy: () => void;
  onExport: () => void;
}

const verdictLabels: Record<PredictionRecord['label'], { label: string; tone: string }> = {
  ai: { label: 'AI leaning', tone: 'bg-primary-100 text-primary-700' },
  human: { label: 'Human leaning', tone: 'bg-success-100 text-success-500' },
  inconclusive: { label: 'Inconclusive', tone: 'bg-warning-100 text-warning-500' },
};

const probabilityNotes: Record<PredictionRecord['label'], string> = {
  ai: 'High probability indicates likely machine assistance.',
  human: 'Signals point toward manual authorship.',
  inconclusive: 'Signals conflict. Manual review recommended.',
};

const confidenceWidths = [
  { max: 0.05, className: 'w-conf-5' },
  { max: 0.1, className: 'w-conf-10' },
  { max: 0.15, className: 'w-conf-15' },
  { max: 0.2, className: 'w-conf-20' },
  { max: 0.25, className: 'w-conf-25' },
  { max: 0.3, className: 'w-conf-30' },
  { max: 0.35, className: 'w-conf-35' },
  { max: 0.4, className: 'w-conf-40' },
  { max: 0.45, className: 'w-conf-45' },
  { max: 0.5, className: 'w-conf-50' },
  { max: 0.55, className: 'w-conf-55' },
  { max: 0.6, className: 'w-conf-60' },
  { max: 0.65, className: 'w-conf-65' },
  { max: 0.7, className: 'w-conf-70' },
  { max: 0.75, className: 'w-conf-75' },
  { max: 0.8, className: 'w-conf-80' },
  { max: 0.85, className: 'w-conf-85' },
  { max: 0.9, className: 'w-conf-90' },
  { max: 0.95, className: 'w-conf-95' },
  { max: 1, className: 'w-conf-100' },
];

function resolveConfidenceWidth(value: number) {
  const entry = confidenceWidths.find((item) => value <= item.max) ?? confidenceWidths.at(-1);
  return entry?.className ?? 'w-conf-0';
}

export function ResultPanel({ activeRecord, history, status, onSelect, onClearHistory, onCopy, onExport }: ResultPanelProps) {
  const loading = status.state === 'loading';

  return (
    <section className="space-y-6" aria-live="polite">
      <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft">
        <header className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">📊 Latest result</h2>
            <p className="text-sm text-neutral-600">Verdict updates in real time.</p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${verdictLabels[activeRecord?.label ?? 'inconclusive'].tone}`}>
            {verdictLabels[activeRecord?.label ?? 'inconclusive'].label}
          </span>
        </header>

        {loading ? (
          <div className="space-y-4" aria-hidden="true">
            <div className="skeleton h-10 w-3/4" />
            <div className="skeleton h-32 w-full" />
            <div className="skeleton h-24 w-full" />
          </div>
        ) : activeRecord ? (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Probability (AI)</span>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {(activeRecord.probability * 100).toFixed(0)}%
                </p>
                <p className="mt-2 text-sm text-neutral-600">{probabilityNotes[activeRecord.label]}</p>
              </div>
              <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-4">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Confidence</span>
                <p className="mt-1 text-2xl font-semibold text-neutral-900">
                  {(activeRecord.confidence * 100).toFixed(0)}%
                </p>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                  <div className={`h-full rounded-full bg-primary-500 ${resolveConfidenceWidth(activeRecord.confidence)}`} />
                </div>
                <p className="mt-2 text-sm text-neutral-600">Cross-check with manual review when below 70%.</p>
              </div>
            </div>

            <dl className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Filename</dt>
                <dd className="mt-1 text-sm text-neutral-800">{activeRecord.filename || 'Untitled snippet'}</dd>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Language</dt>
                <dd className="mt-1 text-sm text-neutral-800">{activeRecord.language || 'Auto detected'}</dd>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Characters</dt>
                <dd className="mt-1 text-sm text-neutral-800">{activeRecord.snippetLength.toLocaleString()}</dd>
              </div>
              <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
                <dt className="text-xs font-medium uppercase tracking-wide text-neutral-500">Runtime</dt>
                <dd className="mt-1 text-sm text-neutral-800">{activeRecord.runDurationMs} ms</dd>
              </div>
            </dl>

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-neutral-800">Why this result?</h3>
              <ul className="grid gap-2">
                {activeRecord.explanations.map((item) => (
                  <li key={item.id} className={`${listItem} rounded-2xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-700`}>
                    <div className="flex items-center justify-between text-xs text-neutral-500">
                      <span>Weight</span>
                      <span>{item.contribution >= 0 ? '+' : ''}{item.contribution.toFixed(2)}</span>
                    </div>
                    <p className="mt-1 text-sm text-neutral-700">{item.message}</p>
                  </li>
                ))}
              </ul>
            </div>

            {activeRecord.notes && activeRecord.notes.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-neutral-800">Notes</h3>
                <ul className="grid gap-1">
                  {activeRecord.notes.map((note) => (
                    <li key={note} className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-600">
                      {note}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onCopy}
                className={`${hoverPop} ${press} inline-flex items-center justify-center rounded-full border border-neutral-200 px-5 py-2 text-sm font-semibold text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
              >
                Copy summary
              </button>
              <button
                type="button"
                onClick={onExport}
                className={`${hoverPop} ${press} inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-soft focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
              >
                Export JSON
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
            Run an analysis to view probability, confidence, and drivers here.
          </div>
        )}
      </div>

      <div className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">🕒 History</h2>
            <p className="text-sm text-neutral-600">Tap an item to revisit the verdict.</p>
          </div>
          <button
            type="button"
            onClick={onClearHistory}
            className={`${hoverPop} ${press} rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60`}
            disabled={history.length === 0}
          >
            Clear all
          </button>
        </header>

        {history.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-neutral-200 bg-neutral-50 p-6 text-sm text-neutral-600">
            Analyses appear here after each run.
          </p>
        ) : (
          <ul className="space-y-3">
            {history.map((item) => (
              <li key={item.id} className={`${listItem} rounded-3xl border border-neutral-200 bg-neutral-50 p-4`}>
                <button
                  type="button"
                  onClick={() => onSelect(item.id)}
                  className={`${hoverPop} ${press} flex w-full flex-col items-start gap-2 text-left focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
                >
                  <div className="flex w-full items-center justify-between text-sm text-neutral-700">
                    <span className="font-semibold">{item.filename || 'Untitled snippet'}</span>
                    <span>{new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <div className="flex w-full items-center justify-between text-xs text-neutral-500">
                    <span>{verdictLabels[item.label].label}</span>
                    <span>{(item.probability * 100).toFixed(0)}% AI</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
