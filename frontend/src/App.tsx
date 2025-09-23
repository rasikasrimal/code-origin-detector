import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Header } from "./components/Header";
import { AnalyzerPanel } from "./components/AnalyzerPanel";
import { ResultPanel } from "./components/ResultPanel";
import type {
  AnalysisPayload,
  AnalysisSettings,
  AnalysisStatus,
  PredictionRecord,
} from "./types";

const INITIAL_SETTINGS: AnalysisSettings = {
  useHeuristics: true,
  model: "heuristic_v1",
  explanationLevel: "full",
};

function App() {
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>({
    state: "idle",
    message: "Run an analysis to see results.",
  });
  const [settings, setSettings] = useState<AnalysisSettings>(INITIAL_SETTINGS);

  const runButtonRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  const activeRecord = useMemo(() => records[0], [records]);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (status.state === "success" && resultCardRef.current) {
      resultCardRef.current.focus();
    }
  }, [status.state]);

  const handleAnalyze = async ({ code, filename, language, settings: runSettings }: AnalysisPayload) => {
    if (typeof navigator !== "undefined" && navigator.onLine === false) {
      const message = "We couldn't connect. Check your network and retry.";
      setStatus({ state: "error", message });
      throw new Error(message);
    }

    try {
      setStatus({ state: "loading", message: "Analyzing snippet..." });
      if (code.length > 19_500) {
        await new Promise((resolve) => setTimeout(resolve, 420));
        const timeoutMessage = "This took too long. Try again or simplify the snippet.";
        setStatus({ state: "timeout", message: timeoutMessage });
        throw new Error(timeoutMessage);
      }

      const started = performance.now();
      await new Promise((resolve) => setTimeout(resolve, 520));
      const finished = performance.now();
      const record = buildPrediction({
        code,
        filename,
        language,
        settings: runSettings,
        runDurationMs: Math.round(finished - started),
      });
      setRecords((current) => [record, ...current].slice(0, 10));
      setStatus({ state: "success", message: "Analysis complete. Review the results below." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong on our side. Please try again.";
      setStatus({ state: "error", message });
      throw error;
    }
  };

  const selectRecord = (id: string) => {
    setRecords((current) => {
      const selected = current.find((item) => item.id === id);
      if (!selected) return current;
      return [selected, ...current.filter((item) => item.id !== id)];
    });
  };

  const clearHistory = () => {
    setRecords([]);
    setStatus({ state: "idle", message: "History cleared. Run a fresh analysis." });
  };

  const prepareNewAnalysis = () => {
    setStatus({ state: "idle", message: "Run an analysis to see results." });
    textareaRef.current?.focus();
  };

  const fadeIn = (delay = 0) => ({
    initial: { opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.18, ease: "easeOut", delay },
  });

  return (
    <div className="min-h-screen bg-surface-muted text-neutral-900">
      <a href="#main" className="skip-link">
        Skip to main content
      </a>
      <Header
        onRunClick={() => {
          if (runButtonRef.current) {
            runButtonRef.current.focus();
          } else {
            textareaRef.current?.focus();
          }
        }}
      />
      <motion.main
        id="main"
        className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-12 sm:px-6 lg:px-8"
      >
        <motion.section
          aria-labelledby="hero-heading"
          className="space-y-5"
          {...fadeIn(0)}
        >
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700">
            Prototype workspace
          </p>
          <div className="space-y-4">
            <h1 id="hero-heading" className="text-3xl font-semibold text-neutral-900 sm:text-4xl">
              Estimate the likely origin of a code snippet.
            </h1>
            <p className="max-w-3xl text-lg text-neutral-600">
              Paste or upload source code to gauge whether it leans human-written or AI-generated. Configure heuristic overlays
              and model profiles, then run the detector to compare successive results.
            </p>
            <p className="text-sm text-neutral-500">Results are probabilistic. Use judgment before drawing conclusions.</p>
          </div>
        </motion.section>

        <motion.section
          aria-labelledby="action-heading"
          className="rounded-2xl border border-neutral-200 bg-surface px-6 py-6 shadow-md"
          {...fadeIn(0.05)}
        >
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-3">
              <h2 id="action-heading" className="text-xl font-semibold text-neutral-900">
                Run an analysis in three steps
              </h2>
              <ol className="grid gap-3 text-sm text-neutral-600 sm:grid-cols-3">
                <li className="rounded-xl bg-surface-subtle px-4 py-3 shadow-sm">
                  <p className="font-semibold text-neutral-800">1. Add code</p>
                  <p>Paste a snippet, upload a file, or start with a curated example.</p>
                </li>
                <li className="rounded-xl bg-surface-subtle px-4 py-3 shadow-sm">
                  <p className="font-semibold text-neutral-800">2. Tune settings</p>
                  <p>Choose the model profile, explanation detail, and heuristic overlay.</p>
                </li>
                <li className="rounded-xl bg-surface-subtle px-4 py-3 shadow-sm">
                  <p className="font-semibold text-neutral-800">3. Review output</p>
                  <p>Inspect the verdict, confidence, heuristics, and downloadable report.</p>
                </li>
              </ol>
            </div>
            <motion.button
              type="button"
              onClick={() => runButtonRef.current?.focus() ?? textareaRef.current?.focus()}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 sm:w-auto"
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.015 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.97 }}
              aria-describedby="action-helper"
            >
              Jump to analyzer
            </motion.button>
          </div>
          <p id="action-helper" className="mt-4 text-xs text-neutral-500">
            The analyzer and result panels adapt to any screen size. On mobile, use the sticky action bar to run or clear inputs quickly.
          </p>
        </motion.section>

        <motion.section
          aria-label="Analysis workspace"
          className="grid gap-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]"
          {...fadeIn(0.1)}
        >
          <AnalyzerPanel
            ref={textareaRef}
            status={status}
            settings={settings}
            onSettingsChange={setSettings}
            onAnalyze={handleAnalyze}
            runButtonRef={runButtonRef}
          />
          <ResultPanel
            ref={resultCardRef}
            active={activeRecord}
            history={records}
            status={status}
            onCopy={() => handleCopy(activeRecord)}
            onDownload={() => handleDownload(activeRecord)}
            onSelect={selectRecord}
            onClearHistory={clearHistory}
            onReset={prepareNewAnalysis}
          />
        </motion.section>

        <motion.section
          id="limitations"
          className="space-y-4"
          aria-labelledby="limitations-heading"
          {...fadeIn(0.15)}
        >
          <h2 id="limitations-heading" className="text-sm font-semibold uppercase tracking-wide text-neutral-600">
            Ethical use and limitations
          </h2>
          <motion.div
            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700 shadow-sm"
            initial={{ opacity: shouldReduceMotion ? 1 : 0, y: shouldReduceMotion ? 0 : 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            Use this detector as one input among many. Probabilities are estimates, not proof, and can be wrong—especially with short,
            heavily templated, or minified code.
          </motion.div>
          <p className="text-sm text-neutral-500">
            Always confirm findings with peer review and consider the context where the code appears. Respect privacy and never use the
            detector to enforce punitive measures without human oversight.
          </p>
        </motion.section>
      </motion.main>
      <footer className="border-t border-neutral-200 bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-neutral-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>Copyright {new Date().getFullYear()} Code Origin Detector.</p>
          <div className="flex flex-wrap items-center gap-4">
            <a
              className="transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
              href="https://github.com/code-origin-detector/code-origin-detector/tree/main/docs"
              target="_blank"
              rel="noreferrer"
            >
              Documentation
            </a>
            <a
              className="transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
              href="https://github.com/code-origin-detector/code-origin-detector"
              target="_blank"
              rel="noreferrer"
            >
              GitHub repository
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildPrediction({
  code,
  filename,
  language,
  settings,
  runDurationMs,
}: AnalysisPayload & { runDurationMs: number }): PredictionRecord {
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
  const explanations = [] as PredictionRecord["explanations"];

  const lengthContribution = clamp(snippetLength / 20000, 0, 0.25) - 0.04;
  score += lengthContribution;
  explanations.push({
    id: "length",
    message: `Snippet length is ${snippetLength.toLocaleString()} characters across ${lines.length} lines.`,
    contribution: Number(lengthContribution.toFixed(2)),
  });

  if (settings.useHeuristics) {
    const commentRatio = visibleLines.length === 0 ? 0 : commentLines / visibleLines.length;
    const commentContribution = commentRatio < 0.05 ? 0.12 : commentRatio > 0.2 ? -0.08 : 0;
    score += commentContribution;
    explanations.push({
      id: "comments",
      message: commentRatio < 0.05 ? "Sparse comments detected." : "Moderate comment coverage detected.",
      contribution: Number(commentContribution.toFixed(2)),
    });

    const repetitionContribution = clamp(repeatedTokens * 0.04, 0, 0.16);
    score += repetitionContribution;
    explanations.push({
      id: "repetition",
      message: repeatedTokens > 0 ? `Repeated phrase patterns found (${repeatedTokens}).` : "Few repeated patterns detected.",
      contribution: Number(repetitionContribution.toFixed(2)),
    });

    if (minified) {
      score += 0.08;
      explanations.push({
        id: "minified",
        message: "Low whitespace density; snippet appears minified or compressed.",
        contribution: 0.08,
      });
    }

    if (blankLines > visibleLines.length * 0.4) {
      score -= 0.05;
      explanations.push({
        id: "structure",
        message: "Generous spacing and blank lines suggest manual formatting.",
        contribution: -0.05,
      });
    }
  } else {
    explanations.push({
      id: "heuristics-disabled",
      message: "Heuristic overlay disabled for this run.",
      contribution: 0,
    });
  }

  if (mixedLanguage) {
    score = clamp(score, 0.35, 0.65);
    explanations.push({
      id: "mixed-language",
      message: "Mixed-language constructs detected; weighting adjusted for uncertainty.",
      contribution: 0,
    });
  }

  const probability = clamp(Number(score.toFixed(2)), 0.05, 0.95);
  let label: PredictionRecord["label"] = "inconclusive";
  if (probability > 0.58) {
    label = "ai";
  } else if (probability < 0.42) {
    label = "human";
  }

  const confidenceDistance = Math.abs(probability - 0.5);
  const confidence = label === "inconclusive" ? 0.46 : clamp(0.4 + confidenceDistance * 1.8, 0.5, 0.95);

  const notes: string[] = [];
  if (minified) {
    notes.push("Detected low whitespace density; results may be less reliable for minified code.");
  }
  if (mixedLanguage) {
    notes.push("Detected multiple language patterns; treat the verdict as guidance only.");
  }

  let finalExplanations = explanations;
  if (settings.explanationLevel === "concise") {
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

async function handleCopy(record?: PredictionRecord) {
  if (!record) return;
  const verdict = record.label === "ai" ? "AI-leaning" : record.label === "human" ? "Human-leaning" : "Inconclusive";
  const summary = [
    `Verdict: ${verdict}`,
    `Probability (AI): ${(record.probability * 100).toFixed(0)}%`,
    `Confidence: ${(record.confidence * 100).toFixed(0)}%`,
    `Filename: ${record.filename}`,
    `Detected language: ${record.language}`,
    `Snippet length: ${record.snippetLength.toLocaleString()} characters`,
    `Heuristics: ${record.settings.useHeuristics ? "enabled" : "disabled"}`,
    `Model: ${record.settings.model}`,
    `Run duration: ${record.runDurationMs} ms`,
  ];

  if (navigator?.clipboard?.writeText) {
    await navigator.clipboard.writeText(summary.join("\n"));
    return;
  }

  const helper = document.createElement("textarea");
  helper.value = summary.join("\n");
  helper.setAttribute("readonly", "");
  helper.style.position = "absolute";
  helper.style.left = "-9999px";
  document.body.appendChild(helper);
  helper.select();
  document.execCommand("copy");
  document.body.removeChild(helper);
}

function handleDownload(record?: PredictionRecord) {
  if (!record) return;
  const blob = new Blob([JSON.stringify(record, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `code-origin-report-${record.id}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default App;
