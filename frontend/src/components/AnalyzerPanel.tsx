import type { ChangeEvent, DragEvent, RefObject } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXAMPLE_SNIPPETS } from "../data/examples";
import type {
  AnalysisPayload,
  AnalysisSettings,
  AnalysisStatus,
  ExplanationLevel,
  ModelProfile,
} from "../types";

interface AnalyzerPanelProps {
  status: AnalysisStatus;
  settings: AnalysisSettings;
  onSettingsChange: (_settings: AnalysisSettings) => void;
  onAnalyze: (_payload: AnalysisPayload) => Promise<void>;
  runButtonRef: RefObject<HTMLButtonElement | null>;
}

const MAX_CHARACTERS = 20_000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = [
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".py",
  ".go",
  ".java",
  ".cs",
  ".rb",
  ".php",
  ".cpp",
  ".c",
  ".rs",
  ".md",
];

const MODEL_OPTIONS: { label: string; value: ModelProfile; helper: string }[] = [
  { label: "Heuristic baseline", value: "heuristic_v1", helper: "Fast, interpretable scoring." },
  { label: "ML stack", value: "ml_stack", helper: "Sklearn ensemble with calibrated output." },
  { label: "Hybrid v2", value: "hybrid_v2", helper: "Blends heuristics with learned weights." },
];

const EXPLANATION_OPTIONS: { label: string; value: ExplanationLevel; helper: string }[] = [
  { label: "Concise", value: "concise", helper: "Top drivers only." },
  { label: "Full", value: "full", helper: "All captured heuristics." },
];

export const AnalyzerPanel = forwardRef<HTMLTextAreaElement, AnalyzerPanelProps>(function AnalyzerPanel(
  { status, settings, onSettingsChange, onAnalyze, runButtonRef }: AnalyzerPanelProps,
  forwardedRef,
) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const assignTextareaRef = (node: HTMLTextAreaElement | null) => {
    textareaRef.current = node;
    if (!forwardedRef) return;
    if (typeof forwardedRef === "function") {
      forwardedRef(node);
    } else {
      forwardedRef.current = node;
    }
  };

  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const [filename, setFilename] = useState("snippet.txt");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState<
    { tone: "info" | "success" | "error" | "warning"; text: string } | null
  >(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<"file-too-large" | "unsupported-language" | "binary" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const derivedLanguage = useMemo(() => detectLanguage(filename, code), [filename, code]);

  useEffect(() => {
    if (status.state === "error" && status.message) {
      setMessage({ tone: "error", text: status.message });
    } else if (status.state === "success") {
      setMessage({ tone: "success", text: "Analysis complete. Review the results on the right." });
    } else if (status.state === "timeout") {
      setMessage({ tone: "warning", text: status.message });
    }
  }, [status]);

  const handleCodeChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const next = event.target.value;
    setCode(next);
    if (next.length > MAX_CHARACTERS) {
      setValidationError("This snippet exceeds 20,000 characters. Trim it to continue.");
    } else {
      setValidationError(null);
    }
  };

  const handleFilenameChange = (event: ChangeEvent<HTMLInputElement>) => {
    setFilename(event.target.value);
  };

  const openFilePicker = useCallback(() => {
    hiddenInputRef.current?.click();
  }, []);

  const handleExample = useCallback((id: string) => {
    const snippet = EXAMPLE_SNIPPETS.find((item) => item.id === id);
    if (!snippet) return;
    setFilename(snippet.filename);
    setCode(snippet.code);
    setMessage({ tone: "success", text: "Example loaded. Ready when you are." });
    setValidationError(
      snippet.code.length > MAX_CHARACTERS
        ? "This snippet exceeds 20,000 characters. Trim it to continue."
        : null,
    );
    queueMicrotask(() => textareaRef.current?.focus());
  }, []);

  const handleFile = async (file: File) => {
    setFileError(null);
    if (file.size > MAX_FILE_BYTES) {
      setFileError("file-too-large");
      return;
    }

    const extension = file.name.includes(".") ? `.${file.name.toLowerCase().split(".").pop()!}` : "";
    const isTextType = file.type.startsWith("text/") || (extension && SUPPORTED_EXTENSIONS.includes(extension));
    if (!isTextType) {
      setFileError("unsupported-language");
      return;
    }

    const text = await file.text();
    if (/\u0000/.test(text)) {
      setFileError("binary");
      return;
    }

    setFilename(file.name);
    setCode(text);
    setValidationError(text.length > MAX_CHARACTERS ? "This snippet exceeds 20,000 characters. Trim it to continue." : null);
    setMessage({ tone: "success", text: `Loaded ${file.name}.` });
    queueMicrotask(() => textareaRef.current?.focus());
  };

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragActive(false);
    const file = event.dataTransfer.files?.[0];
    if (file) {
      await handleFile(file);
    }
  };

  const disabled = code.trim().length === 0 || Boolean(validationError) || status.state === "loading";
  const nearingLimit = code.length >= MAX_CHARACTERS * 0.9 && code.length <= MAX_CHARACTERS;

  const helperId = "drop-helper";
  const statusId = "analysis-status";

  const resolveFileErrorMessage = () => {
    switch (fileError) {
      case "file-too-large":
        return "This file exceeds 5 MB. Try a smaller file.";
      case "unsupported-language":
        return "We couldn't scan this file type. Upload a text-based code file.";
      case "binary":
        return "Binary files aren't supported. Please upload readable code.";
      default:
        return null;
    }
  };

  const clearInputs = () => {
    setCode("");
    setFilename("snippet.txt");
    setMessage({ tone: "info", text: "Inputs cleared." });
    setValidationError(null);
    textareaRef.current?.focus();
  };

  const updateSettings = (patch: Partial<AnalysisSettings>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  return (
    <section aria-labelledby="analyzer-heading" className="space-y-6">
      <header className="space-y-2">
        <h2 id="analyzer-heading" className="text-xl font-semibold text-neutral-900">
          Input options
        </h2>
        <p className="text-sm text-neutral-600">
          Paste code, upload a file, or explore curated examples before running the detector.
        </p>
      </header>

      <div className="space-y-6 rounded-2xl border border-neutral-200 bg-surface px-6 py-7 shadow-card">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="space-y-2" htmlFor="filename">
            <span className="text-sm font-medium text-neutral-800">Filename</span>
            <input
              id="filename"
              value={filename}
              onChange={handleFilenameChange}
              className="w-full rounded-lg border border-neutral-200 bg-surface-subtle px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
              autoComplete="off"
              placeholder="snippet.js"
            />
          </label>
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">Detected language</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-surface-subtle px-3 py-1 text-xs font-medium text-neutral-600">
              {derivedLanguage}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium text-neutral-800">
            Paste code
          </label>
          <textarea
            id="code"
            ref={assignTextareaRef}
            value={code}
            onChange={handleCodeChange}
            className="h-64 w-full resize-y rounded-2xl border border-neutral-200 bg-surface-subtle px-4 py-3 font-mono text-sm text-neutral-900 shadow-inner transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            placeholder="Paste your code snippet or drop a file..."
            spellCheck={false}
            aria-describedby="character-count"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-neutral-500" id="character-count">
            <span>Supports up to 20,000 characters.</span>
            <span className="font-medium text-neutral-600">
              {code.length.toLocaleString()} / {MAX_CHARACTERS.toLocaleString()} characters
            </span>
          </div>
          {nearingLimit ? (
            <p className="text-xs text-amber-600">Approaching limit—keep under 20,000 characters.</p>
          ) : null}
          {validationError ? <p className="text-xs text-rose-600">{validationError}</p> : null}
        </div>

        <div className="space-y-3">
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openFilePicker();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setDragActive(false);
            }}
            onDrop={handleDrop}
            aria-describedby={helperId}
            aria-label="Upload a code file"
            className={`${
              dragActive
                ? "border-brand-400 bg-brand-50"
                : fileError
                ? "border-rose-300 bg-rose-50"
                : "border-neutral-200 bg-surface-subtle"
            } flex flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500`}
          >
            <span className="text-sm font-semibold text-neutral-800">Upload a code file</span>
            <span id={helperId} className="mt-2 text-sm text-neutral-500">
              Drag & drop or browse. .js, .py, .java, .cpp, .tsx, .md, and more.
            </span>
            <span className="mt-3 text-xs text-neutral-400">
              {dragActive ? "Release to analyze this file" : "Drop file here"}
            </span>
          </div>
          <input
            ref={hiddenInputRef}
            type="file"
            className="sr-only"
            onChange={async (event: ChangeEvent<HTMLInputElement>) => {
              const file = event.target.files?.[0];
              if (file) {
                await handleFile(file);
              }
              event.target.value = "";
            }}
          />
          {fileError ? <p className="text-xs text-rose-600">{resolveFileErrorMessage()}</p> : null}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-2" htmlFor="model">
            <span className="text-sm font-medium text-neutral-800">Model profile</span>
            <select
              id="model"
              value={settings.model}
              onChange={(event) => updateSettings({ model: event.target.value as ModelProfile })}
              className="rounded-lg border border-neutral-200 bg-surface-subtle px-3 py-2 text-sm text-neutral-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            >
              {MODEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-neutral-500">
              {MODEL_OPTIONS.find((option) => option.value === settings.model)?.helper}
            </p>
          </label>
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-neutral-800">Explanation detail</legend>
            <div className="flex gap-2">
              {EXPLANATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateSettings({ explanationLevel: option.value })}
                  className={`${
                    settings.explanationLevel === option.value
                      ? "border-brand-200 bg-brand-50 text-brand-700"
                      : "border-neutral-200 bg-surface-subtle text-neutral-600 hover:border-neutral-300"
                  } flex-1 rounded-full border px-3 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500`}
                  aria-pressed={settings.explanationLevel === option.value}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-neutral-500">
              {EXPLANATION_OPTIONS.find((option) => option.value === settings.explanationLevel)?.helper}
            </p>
          </fieldset>
          <div className="rounded-2xl border border-neutral-200 bg-surface-subtle px-4 py-3 md:col-span-2">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-neutral-800">Heuristic overlay</p>
                <p className="text-xs text-neutral-500">Blend rule-based signals into the model output for explainability.</p>
              </div>
              <label className="relative inline-flex h-6 w-11 items-center">
                <input
                  type="checkbox"
                  className="peer sr-only"
                  checked={settings.useHeuristics}
                  onChange={(event) => updateSettings({ useHeuristics: event.target.checked })}
                  aria-label="Toggle heuristic overlay"
                />
                <span className="absolute inset-0 rounded-full bg-neutral-300 transition peer-checked:bg-brand-500" />
                <span className="absolute left-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
              </label>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            ref={runButtonRef}
            onClick={async () => {
              if (disabled) return;
              try {
                setMessage(null);
                await onAnalyze({ code, filename, language: derivedLanguage, settings });
              } catch (error) {
                if (error instanceof Error) {
                  setMessage({ tone: "error", text: error.message });
                } else {
                  setMessage({ tone: "error", text: "Something went wrong on our side. Please try again." });
                }
              }
            }}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status.state === "loading" ? "Analyzing..." : "Run analysis"}
          </button>
          <button
            type="button"
            onClick={clearInputs}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
          >
            Clear input
          </button>
          <button
            type="button"
            onClick={openFilePicker}
            className="rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
          >
            Upload file
          </button>
          <div
            id={statusId}
            role="status"
            aria-live="polite"
            className={`text-sm ${
              status.state === "error"
                ? "text-rose-600"
                : status.state === "success"
                ? "text-accent-500"
                : status.state === "loading"
                ? "text-neutral-500"
                : "text-neutral-500"
            }`}
          >
            {status.message}
          </div>
        </div>
        {message ? (
          <div
            role="alert"
            className={`text-sm ${
              message.tone === "error"
                ? "text-rose-600"
                : message.tone === "success"
                ? "text-accent-500"
                : message.tone === "warning"
                ? "text-amber-600"
                : "text-neutral-600"
            }`}
          >
            {message.text}
          </div>
        ) : null}
      </div>

      <section id="examples" className="space-y-3">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-600">Try a sample snippet</h3>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          {EXAMPLE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              onClick={() => handleExample(snippet.id)}
              className="group flex h-full flex-col justify-between rounded-2xl border border-neutral-200 bg-surface px-4 py-4 text-left shadow-sm transition hover:border-neutral-300 hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">{snippet.language}</p>
                <p className="text-base font-semibold text-neutral-900">{snippet.title}</p>
                <p className="text-sm text-neutral-500">{snippet.description}</p>
              </div>
              <div className="mt-3 rounded-lg bg-surface-subtle p-3 font-mono text-xs text-neutral-500 shadow-inner">
                {getPreview(snippet.code)}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-neutral-700 group-hover:text-brand-600">
                Use this example
              </span>
            </button>
          ))}
        </div>
      </section>
    </section>
  );
});

function detectLanguage(filename: string, code: string) {
  const extension = filename.split(".").pop()?.toLowerCase();
  const byExtension: Record<string, string> = {
    js: "JavaScript",
    jsx: "JavaScript",
    ts: "TypeScript",
    tsx: "TypeScript",
    py: "Python",
    go: "Go",
    rb: "Ruby",
    php: "PHP",
    rs: "Rust",
    java: "Java",
    cs: "C#",
    cpp: "C++",
    c: "C",
    md: "Markdown",
  };
  if (extension && byExtension[extension]) {
    return byExtension[extension];
  }

  if (/\b(def|async\s+def|import\s)/.test(code)) return "Python";
  if (/\b(function|const|let|=>|React)\b/.test(code)) return "JavaScript";
  if (/\bpackage\s+\w+|func\s+/.test(code)) return "Go";
  if (/#include\s+<|std::/.test(code)) return "C++";
  if (/using\s+System|namespace\s+/.test(code)) return "C#";
  return "Plain text";
}

function getPreview(code: string) {
  const trimmed = code.trim().split(/\r?\n/).slice(0, 3);
  return trimmed.join("\n");
}
