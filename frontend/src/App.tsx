import { useEffect, useMemo, useRef, useState } from 'react';
import { AnalyzerPanel } from './components/AnalyzerPanel';
import { Header } from './components/Header';
import { ResultPanel } from './components/ResultPanel';
import type { AnalysisSettings, AnalysisStatus, PredictionRecord } from './types';

const INITIAL_SETTINGS: AnalysisSettings = {
  useHeuristics: true,
  model: 'heuristic_v1',
  explanationLevel: 'full',
};

const DEFAULT_STATUS: AnalysisStatus = {
  state: 'idle',
  message: 'Paste code or upload a file to get started.',
};

const LANGUAGE_LABELS: Record<string, string> = {
  auto: 'Auto detected',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  python: 'Python',
  go: 'Go',
  java: 'Java',
  csharp: 'C#',
  ruby: 'Ruby',
  php: 'PHP',
  cpp: 'C++',
  rust: 'Rust',
  markdown: 'Markdown',
};

const LANGUAGE_CODE_PATTERNS: Record<string, RegExp[]> = {
  Python: [/def\s+\w+\(/, /import\s+os/],
  Go: [/package\s+\w+/, /func\s+\w+\(/],
  Java: [/class\s+\w+\s+implements/, /System\.out\.println/],
  'C#': [/namespace\s+\w+/, /using\s+System/],
  JavaScript: [/function\s+\w+\(/, /console\.log/, /=>/],
  Rust: [/fn\s+\w+\(/, /let\s+mut/],
  'C++': [/#include\s+</, /std::/],
  HTML: [/<!DOCTYPE html>/i, /<div/],
};

function App() {
  const [code, setCode] = useState('');
  const [filename, setFilename] = useState('snippet.txt');
  const [language, setLanguage] = useState('auto');
  const [settings, setSettings] = useState<AnalysisSettings>(INITIAL_SETTINGS);
  const [status, setStatus] = useState<AnalysisStatus>(DEFAULT_STATUS);
  const [records, setRecords] = useState<PredictionRecord[]>([]);

  const runButtonRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  const activeRecord = records[0];
  const trimmedCode = code.trim();
  const runDisabled = status.state === 'loading' || trimmedCode.length === 0 || code.length > 20_000;

  useEffect(() => {
    if (status.state === 'success' && resultCardRef.current) {
      resultCardRef.current.focus();
    }
  }, [status.state]);

  const handleRun = async () => {
    if (runDisabled) return;
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      setStatus({ state: 'error', message: 'You are offline. Reconnect to analyze snippets.' });
      return;
    }

    setStatus({ state: 'loading', message: 'Analyzing your snippet…' });

    try {
      const started = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 520));
      if (code.length > 19_500) {
        setStatus({ state: 'timeout', message: 'Snippet is very large. Try a shorter selection.' });
        return;
      }
      const finished = performance.now();
      const languageLabel = resolveLanguage(language, filename, code);
      const record = buildPrediction({
        code,
        filename,
        language: languageLabel,
        settings,
        runDurationMs: Math.round(finished - started),
      });
      setRecords((current) => [record, ...current].slice(0, 10));
      setStatus({ state: 'success', message: 'Analysis complete. Review the verdict on the right.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong. Please retry.';
      setStatus({ state: 'error', message });
    }
  };

  const handleClearInputs = () => {
    setCode('');
    setFilename('snippet.txt');
    setLanguage('auto');
    setStatus(DEFAULT_STATUS);
    textareaRef.current?.focus();
  };

  const handleSelectHistory = (id: string) => {
    setRecords((current) => {
      const found = current.find((item) => item.id === id);
      if (!found) return current;
      return [found, ...current.filter((item) => item.id !== id)];
    });
  };

  const handleClearHistory = () => {
    setRecords([]);
    setStatus({ state: 'idle', message: 'History cleared. Paste new code to continue.' });
  };

  const handleCopy = async () => {
    if (!activeRecord) return;
    const verdictLabel = verdictFor(activeRecord.label);
    const summary = [
      `Verdict: ${verdictLabel}`,
      `AI probability: ${(activeRecord.probability * 100).toFixed(0)}%`,
      `Confidence: ${(activeRecord.confidence * 100).toFixed(0)}%`,
      `Filename: ${activeRecord.filename}`,
      `Language: ${activeRecord.language}`,
      `Characters: ${activeRecord.snippetLength.toLocaleString()}`,
      `Heuristics: ${activeRecord.settings.useHeuristics ? 'enabled' : 'disabled'}`,
      `Model: ${activeRecord.settings.model}`,
      `Run duration: ${activeRecord.runDurationMs} ms`,
    ].join('\n');

    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(summary);
      setStatus({ state: 'success', message: 'Copied summary to clipboard.' });
      return;
    }

    const helper = document.createElement('textarea');
    helper.value = summary;
    helper.setAttribute('readonly', '');
    helper.style.position = 'absolute';
    helper.style.left = '-9999px';
    document.body.appendChild(helper);
    helper.select();
    document.execCommand('copy');
    document.body.removeChild(helper);
    setStatus({ state: 'success', message: 'Copied summary to clipboard.' });
  };

  const handleExport = () => {
    if (!activeRecord) return;
    const blob = new Blob([JSON.stringify(activeRecord, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `code-origin-report-${activeRecord.id}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus({ state: 'success', message: 'Exported report as JSON.' });
  };

  const history = useMemo(() => records, [records]);

  return (
    <div className="relative min-h-screen bg-neutral-50 text-neutral-900">
      {status.state === 'loading' ? (
        <div className="pointer-events-none fixed inset-x-0 top-0 z-50 h-1 overflow-hidden bg-neutral-200">
          <div className="h-full w-1/3 animate-progress bg-primary-500" />
        </div>
      ) : null}
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header
        onRunClick={() => {
          runButtonRef.current?.focus();
          if (!runButtonRef.current) {
            textareaRef.current?.focus();
          }
        }}
      />
      <main id="main" className="container space-y-12 pb-32 pt-12 md:pb-16">
        <section className="space-y-4" aria-labelledby="intro">
          <h1 id="intro" className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
            Estimate whether code leans human-written or AI-generated.
          </h1>
          <p className="max-w-2xl text-lg text-neutral-600">
            Upload or paste source code, fine-tune model overlays, and review an accessible explanation for every verdict.
          </p>
          <p className="text-sm text-neutral-500">Results guide decisions but never replace human judgment.</p>
        </section>

        <section aria-labelledby="steps" className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 id="steps" className="text-base font-semibold text-neutral-800">
              Run an analysis in three steps
            </h2>
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Quick overview</span>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-soft">
                <div className="flex items-center gap-2 text-sm font-semibold text-neutral-800">
                  <span>{step.icon}</span>
                  {step.title}
                </div>
                <p className="mt-2 text-sm text-neutral-600">{step.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="grid gap-8 md:grid-cols-2 md:items-start">
          <AnalyzerPanel
            ref={textareaRef}
            code={code}
            filename={filename}
            language={language}
            status={status}
            settings={settings}
            onCodeChange={setCode}
            onFilenameChange={setFilename}
            onLanguageChange={setLanguage}
            onSettingsChange={setSettings}
            onRun={() => {
              void handleRun();
            }}
            onClear={handleClearInputs}
            runButtonRef={runButtonRef}
          />
          <div ref={resultCardRef} tabIndex={-1} className="outline-none">
            <ResultPanel
              activeRecord={activeRecord}
              history={history}
              status={status}
              onSelect={handleSelectHistory}
              onClearHistory={handleClearHistory}
              onCopy={() => {
                void handleCopy();
              }}
              onExport={handleExport}
            />
          </div>
        </div>

        <section id="ethics" className="space-y-3 rounded-3xl border border-warning-200 bg-warning-100/80 p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-warning-600">Ethics & limitations</h2>
          <p className="text-sm text-warning-700">
            Probabilities are indicative, not proof. Short or highly templated snippets increase uncertainty. Always combine
            automated insights with peer review and context.
          </p>
          <p className="text-xs text-warning-600">Respect privacy laws and organizational policy before uploading code.</p>
        </section>
      </main>

      <footer className="border-t border-neutral-200 bg-white">
        <div className="container flex flex-col gap-3 py-6 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Code Origin Detector.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className={`${hoverClass} rounded-full px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
              href="https://github.com/code-origin-detector/code-origin-detector/tree/main/docs"
              target="_blank"
              rel="noreferrer"
            >
              Documentation
            </a>
            <a
              className={`${hoverClass} rounded-full px-4 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
              href="https://github.com/code-origin-detector/code-origin-detector"
              target="_blank"
              rel="noreferrer"
            >
              GitHub repository
            </a>
          </div>
        </div>
      </footer>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/90 px-4 py-3 backdrop-blur md:hidden">
        <div className="container flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleClearInputs}
            className="flex-1 rounded-full border border-neutral-200 px-4 py-3 text-sm font-semibold text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => {
              void handleRun();
            }}
            disabled={runDisabled}
            className="flex-1 rounded-full bg-primary-600 px-4 py-3 text-sm font-semibold text-white shadow-soft focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {status.state === 'loading' ? 'Analyzing…' : 'Run'}
          </button>
        </div>
      </div>
    </div>
  );
}

const STEPS = [
  { icon: '1️⃣', title: 'Paste or upload', copy: 'Add code with a label so we can reference it later.' },
  { icon: '2️⃣', title: 'Adjust settings', copy: 'Pick overlays that match your review criteria.' },
  { icon: '3️⃣', title: 'Review verdict', copy: 'Inspect the drivers and export evidence if needed.' },
] as const;

function resolveLanguage(option: string, filename: string, code: string) {
  if (option !== 'auto') {
    return LANGUAGE_LABELS[option] ?? option;
  }
  const fromName = detectLanguageFromFilename(filename);
  if (fromName) return fromName;
  const fromCode = detectLanguageFromCode(code);
  if (fromCode) return fromCode;
  return LANGUAGE_LABELS.auto;
}

function detectLanguageFromFilename(name: string) {
  const extension = name.includes('.') ? name.toLowerCase().split('.').pop() ?? '' : '';
  switch (extension) {
    case 'js':
    case 'jsx':
      return 'JavaScript';
    case 'ts':
    case 'tsx':
      return 'TypeScript';
    case 'py':
      return 'Python';
    case 'go':
      return 'Go';
    case 'java':
      return 'Java';
    case 'cs':
      return 'C#';
    case 'rb':
      return 'Ruby';
    case 'php':
      return 'PHP';
    case 'cpp':
    case 'cc':
    case 'cxx':
      return 'C++';
    case 'c':
      return 'C';
    case 'rs':
      return 'Rust';
    case 'md':
      return 'Markdown';
    default:
      return null;
  }
}

function detectLanguageFromCode(code: string) {
  for (const [language, patterns] of Object.entries(LANGUAGE_CODE_PATTERNS)) {
    if (patterns.some((regex) => regex.test(code))) {
      return language;
    }
  }
  return null;
}

function buildPrediction({
  code,
  filename,
  language,
  settings,
  runDurationMs,
}: {
  code: string;
  filename: string;
  language: string;
  settings: AnalysisSettings;
  runDurationMs: number;
}): PredictionRecord {
  const snippetLength = code.length;
  const lines = code.split(/\r?\n/);
  const visibleLines = lines.filter((line) => line.trim().length > 0);
  const blankLines = lines.length - visibleLines.length;
  const commentLines = visibleLines.filter((line) => /(^\s*#)|(^\s*\/\/)|(^\s*\/\*)|(^\s*\*)|(^\s*<!--)/.test(line)).length;
  const avgLineLength = visibleLines.length === 0 ? snippetLength : snippetLength / visibleLines.length;
  const repeatedTokens = findRepeatedPhrases(code);
  const minified = visibleLines.length <= 1 || avgLineLength > 160;
  const mixedLanguage = containsMixedLanguage(code);

  let score = 0.5;
  const explanations: PredictionRecord['explanations'] = [];

  const lengthContribution = clamp(snippetLength / 20000, 0, 0.25) - 0.04;
  score += lengthContribution;
  explanations.push({
    id: 'length',
    message: `Snippet length is ${snippetLength.toLocaleString()} characters across ${lines.length} lines.`,
    contribution: Number(lengthContribution.toFixed(2)),
  });

  if (settings.useHeuristics) {
    const commentRatio = visibleLines.length === 0 ? 0 : commentLines / visibleLines.length;
    const commentContribution = commentRatio < 0.05 ? 0.12 : commentRatio > 0.2 ? -0.08 : 0;
    score += commentContribution;
    explanations.push({
      id: 'comments',
      message: commentRatio < 0.05 ? 'Sparse comments detected.' : 'Moderate comment coverage detected.',
      contribution: Number(commentContribution.toFixed(2)),
    });

    const repetitionContribution = clamp(repeatedTokens * 0.04, 0, 0.16);
    score += repetitionContribution;
    explanations.push({
      id: 'repetition',
      message: repeatedTokens > 0 ? `Repeated phrase patterns found (${repeatedTokens}).` : 'Few repeated patterns detected.',
      contribution: Number(repetitionContribution.toFixed(2)),
    });

    if (minified) {
      score += 0.08;
      explanations.push({
        id: 'minified',
        message: 'Low whitespace density; snippet appears minified or compressed.',
        contribution: 0.08,
      });
    }

    if (blankLines > visibleLines.length * 0.4) {
      score -= 0.05;
      explanations.push({
        id: 'structure',
        message: 'Generous spacing and blank lines suggest manual formatting.',
        contribution: -0.05,
      });
    }
  } else {
    explanations.push({
      id: 'heuristics-disabled',
      message: 'Heuristic overlay disabled for this run.',
      contribution: 0,
    });
  }

  if (mixedLanguage) {
    score = clamp(score, 0.35, 0.65);
    explanations.push({
      id: 'mixed-language',
      message: 'Mixed-language constructs detected; weighting adjusted for uncertainty.',
      contribution: 0,
    });
  }

  const probability = clamp(Number(score.toFixed(2)), 0.05, 0.95);
  let label: PredictionRecord['label'] = 'inconclusive';
  if (probability > 0.58) {
    label = 'ai';
  } else if (probability < 0.42) {
    label = 'human';
  }

  const confidenceDistance = Math.abs(probability - 0.5);
  const confidence = label === 'inconclusive' ? 0.46 : clamp(0.4 + confidenceDistance * 1.8, 0.5, 0.95);

  const notes: string[] = [];
  if (minified) {
    notes.push('Detected low whitespace density; results may be less reliable for minified code.');
  }
  if (mixedLanguage) {
    notes.push('Detected multiple language patterns; treat the verdict as guidance only.');
  }

  let finalExplanations = explanations;
  if (settings.explanationLevel === 'concise') {
    finalExplanations = [...explanations]
      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
      .slice(0, 3);
  }

  return {
    id: crypto.randomUUID(),
    filename,
    language,
    label,
    probability,
    confidence,
    snippetLength,
    createdAt: new Date().toISOString(),
    explanations: finalExplanations,
    notes,
    settings,
    runDurationMs,
  };
}

function findRepeatedPhrases(code: string) {
  const tokens = code
    .toLowerCase()
    .split(/[^a-zA-Z]+/)
    .filter((token) => token.length > 5);
  const frequency = tokens.reduce<Record<string, number>>((acc, token) => {
    acc[token] = (acc[token] ?? 0) + 1;
    return acc;
  }, {});
  return Object.values(frequency).filter((count) => count > 3).length;
}

function containsMixedLanguage(code: string) {
  const likelyPython = /\b(def|import|async\s+def|self)\b/.test(code);
  const likelyJS = /\b(function|const|let|=>|React)\b/.test(code);
  const likelyShell = /\b#!/.test(code);
  const likelyGo = /\bpackage\s+|func\s+/.test(code);
  const matches = [likelyPython, likelyJS, likelyShell, likelyGo].filter(Boolean).length;
  return matches > 1;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function verdictFor(label: PredictionRecord['label']) {
  switch (label) {
    case 'ai':
      return 'AI leaning';
    case 'human':
      return 'Human leaning';
    default:
      return 'Inconclusive';
  }
}

const hoverClass =
  'transform transition-transform transition-shadow duration-200 ease-out hover:-translate-y-0.5 hover:text-neutral-800 hover:shadow-soft active:scale-[0.97]';

export default App;
