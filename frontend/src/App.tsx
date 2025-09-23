import { useEffect, useMemo, useRef, useState } from "react";
import { Header } from "./components/Header";
import { AnalyzerPanel } from "./components/AnalyzerPanel";
import { ResultPanel } from "./components/ResultPanel";
import type { AnalysisPayload, AnalysisStatus, PredictionRecord } from "./types";

function App() {
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const [status, setStatus] = useState<AnalysisStatus>({ state: "idle", message: "Run an analysis to see results." });
  const runButtonRef = useRef<HTMLButtonElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  const activeRecord = useMemo(() => records[0], [records]);

  useEffect(() => {
    if (status.state === "success" && resultCardRef.current) {
      resultCardRef.current.focus();
    }
  }, [status.state]);

  const handleAnalyze = async ({ code, filename, language }: AnalysisPayload) => {
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

      await new Promise((resolve) => setTimeout(resolve, 480));
      const record = buildPrediction({ code, filename, language });
      setRecords((current) => [record, ...current].slice(0, 10));
      setStatus({ state: "success", message: "Analysis complete. Review the results below." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong on our side. Please try again.";
      setStatus({ state: "error", message });
      throw error;
    }
  };

  const clearAnalysis = () => {
    setRecords([]);
    setStatus({ state: "idle", message: "Run an analysis to see results." });
    textareaRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <a href="#main" className="skip-link focus-visible:left-4 focus-visible:top-4 focus-visible:translate-y-0">
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
      <main id="main" className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-4 py-12">
        <section className="space-y-4" aria-labelledby="hero-heading">
          <h1 id="hero-heading" className="text-3xl font-semibold text-slate-900 sm:text-4xl">
            Estimate where a code snippet comes from.
          </h1>
          <p className="max-w-3xl text-lg text-slate-600">
            Analyze pasted code or uploaded files to gauge whether they lean human-written or AI-generated.
          </p>
          <p className="text-sm text-slate-500">Results are probabilistic. Use judgment before drawing conclusions.</p>
        </section>

        <section aria-labelledby="analyzer-heading" className="grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          <AnalyzerPanel ref={textareaRef} status={status} onAnalyze={handleAnalyze} runButtonRef={runButtonRef} />
          <ResultPanel
            ref={resultCardRef}
            active={activeRecord}
            status={status}
            onCopy={() => handleCopy(activeRecord)}
            onDownload={() => handleDownload(activeRecord)}
            onReset={clearAnalysis}
          />
        </section>

        <section id="limitations" className="space-y-3" aria-labelledby="limitations-heading">
          <h2 id="limitations-heading" className="text-sm font-semibold uppercase tracking-wide text-slate-600">
            Ethical use and limitations
          </h2>
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            Use this detector as one input among many. Probabilities are estimates, not proof, and they can be wrong—especially with short, heavily templated, or minified code.
          </div>
          <p className="text-sm text-slate-500">
            Always confirm findings with peer review and consider the context where the code appears.
          </p>
        </section>
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Code Origin Detector.</p>
          <div className="flex flex-wrap gap-4">
            <a
              className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              href="#"
            >
              Accessibility statement
            </a>
            <a
              className="hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              href="#"
            >
              Need help? Contact us.
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

function buildPrediction({ code, filename, language }: AnalysisPayload): PredictionRecord {
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
  const explanations = [];

  const lengthContribution = clamp(snippetLength / 20000, 0, 0.25) - 0.05;
  score += lengthContribution;
  explanations.push({
    id: "length",
    message: `Snippet length is ${snippetLength.toLocaleString()} characters across ${lines.length} lines.`,
    contribution: Number(lengthContribution.toFixed(2)),
  });

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
  const confidence = label === "inconclusive" ? 0.45 : clamp(0.35 + confidenceDistance * 1.8, 0.5, 0.95);

  const notes: string[] = [];
  if (minified) {
    notes.push("Detected low whitespace density; results may be less reliable for minified code.");
  }
  if (mixedLanguage) {
    notes.push("Detected multiple language patterns; treat the verdict as guidance only.");
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
    explanations,
    notes,
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
