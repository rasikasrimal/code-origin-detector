import { ChangeEvent, useMemo, useRef, useState } from "react";
import { EXAMPLE_SNIPPETS } from "../data/examples";
import type { PredictionRecord } from "../types";

interface Props {
  onSubmit: (_record: PredictionRecord) => void;
}

export function AnalyzerPanel({ onSubmit }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("snippet.py");
  const [language, setLanguage] = useState("python");
  const [status, setStatus] = useState<string | null>(null);

  const disabled = code.trim().length === 0;

  const derivedLanguage = useMemo(() => {
    const match = filename.split(".").pop();
    if (!match) return language;
    if (["py", "pyw"].includes(match)) return "python";
    if (["js", "jsx", "ts", "tsx", "mjs", "cjs"].includes(match)) return "javascript";
    return language;
  }, [filename, language]);

  const handleExample = (id: string) => {
    const snippet = EXAMPLE_SNIPPETS.find((item) => item.id === id);
    if (!snippet) return;
    setFilename(snippet.filename);
    setLanguage(snippet.language);
    setCode(snippet.code);
    setStatus("Loaded example snippet");
  };

  const handleFileUpload = async (file: File) => {
    const text = await file.text();
    setFilename(file.name);
    setLanguage(derivedLanguage);
    setCode(text);
    setStatus(`Loaded ${file.name}`);
  };

  const handleSubmit = () => {
    const trimmed = code.trim();
    if (!trimmed) {
      setStatus("Add or load a snippet before running the detector.");
      return;
    }

    const probability = Math.min(0.95, Math.max(0.05, trimmed.length / 1500));
    const label = probability >= 0.5 ? "ai" : "human";
    const confidence = label === "ai" ? probability : 1 - probability;

    const record: PredictionRecord = {
      id: crypto.randomUUID(),
      filename,
      language: derivedLanguage,
      label,
      probability,
      confidence,
      createdAt: new Date().toISOString(),
      explanations: [
        {
          id: "length",
          message: `Snippet length is ${trimmed.length} characters`,
          contribution: Math.abs(probability - 0.5),
        },
        {
          id: "heuristics",
          message:
            label === "ai"
              ? "Simple heuristics suggest synthetic structure"
              : "Heuristics lean human-authored",
          contribution: label === "ai" ? 0.18 : -0.14,
        },
      ],
    };

    onSubmit(record);
    setStatus("Prediction added to history.");
  };

  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-slate-800 bg-slate-900/70 p-6 shadow-card">
      <header className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-100">Run a new analysis</h2>
        <p className="text-sm text-slate-400">
          Paste code, upload a file, or try one of the curated examples to see the detector in action.
        </p>
      </header>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-slate-300" htmlFor="filename">
          Filename
        </label>
        <input
          id="filename"
          className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
          value={filename}
          onChange={(event) => setFilename(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300" htmlFor="language">
          Language
        </label>
        <input
          id="language"
          value={derivedLanguage}
          className="w-full cursor-not-allowed rounded-lg border border-slate-700 bg-slate-950/40 px-3 py-2 text-sm text-slate-400"
          disabled
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-300" htmlFor="code">
          Source code
        </label>
        <textarea
          id="code"
          className="h-64 w-full rounded-xl border border-slate-700 bg-slate-950/60 px-3 py-2 font-mono text-sm text-slate-100 focus:border-brand-400 focus:outline-none"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400">
          <span>{code.length.toLocaleString()} characters</span>
          {status ? <span>{status}</span> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-400 disabled:cursor-not-allowed disabled:opacity-50"
          onClick={handleSubmit}
          disabled={disabled}
        >
          Analyze origin
        </button>
        <button
          type="button"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-brand-400"
          onClick={() => fileInputRef.current?.click()}
        >
          Upload file
        </button>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept=".py,.pyw,.js,.jsx,.ts,.tsx,.mjs,.cjs"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0];
            if (file) {
              void handleFileUpload(file);
            }
          }}
        />
      </div>

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Quick examples</p>
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs text-slate-300 transition hover:border-brand-400"
              onClick={() => handleExample(snippet.id)}
            >
              {snippet.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}








