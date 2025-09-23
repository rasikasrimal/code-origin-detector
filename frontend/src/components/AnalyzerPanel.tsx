import type { ChangeEvent, DragEvent, RefObject } from "react";
import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EXAMPLE_SNIPPETS } from "../data/examples";
import type { AnalysisPayload, AnalysisStatus } from "../types";

interface AnalyzerPanelProps {
  status: AnalysisStatus;
  onAnalyze: (_payload: AnalysisPayload) => Promise<void>;
  runButtonRef: RefObject<HTMLButtonElement | null>;
}

const MAX_CHARACTERS = 20_000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx", ".py", ".go", ".java", ".cs", ".rb", ".php", ".cpp", ".c", ".rs", ".md"];

export const AnalyzerPanel = forwardRef<HTMLTextAreaElement, AnalyzerPanelProps>(function AnalyzerPanel(
  { status, onAnalyze, runButtonRef }: AnalyzerPanelProps,
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
  const [message, setMessage] = useState<{ tone: "info" | "success" | "error" | "warning"; text: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [fileError, setFileError] = useState<"file-too-large" | "unsupported-language" | "binary" | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);

  const derivedLanguage = useMemo(() => detectLanguage(filename, code), [filename, code]);

  useEffect(() => {
    if (status.state === "error" && status.message) {
      setMessage({ tone: "error", text: status.message });
    } else if (status.state === "success") {
      setMessage({ tone: "success", text: "Analysis complete. Scroll to the results." });
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
    setValidationError(snippet.code.length > MAX_CHARACTERS ? "This snippet exceeds 20,000 characters. Trim it to continue." : null);
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
        return "We couldn’t scan this file type. Upload a text-based code file.";
      case "binary":
        return "Binary files aren’t supported. Please upload readable code.";
      default:
        return null;
    }
  };

  return (
    <section aria-labelledby="analyzer-heading" className="space-y-6">
      <header className="space-y-2">
        <h2 id="analyzer-heading" className="text-xl font-semibold text-slate-900">
          Input options
        </h2>
        <p className="text-sm text-slate-600">
          Paste code, upload a file, or explore curated examples before running the detector.
        </p>
      </header>

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <div className="space-y-2">
            <label htmlFor="filename" className="text-sm font-medium text-slate-700">
              Filename
            </label>
            <input
              id="filename"
              value={filename}
              onChange={handleFilenameChange}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
              autoComplete="off"
              placeholder="snippet.js"
            />
          </div>
          <div className="flex flex-col items-start gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Detected language</span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              {derivedLanguage}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium text-slate-700">
            Paste code
          </label>
          <textarea
            id="code"
            ref={assignTextareaRef}
            value={code}
            onChange={handleCodeChange}
            className="h-64 w-full resize-y rounded-xl border border-slate-300 bg-white px-4 py-3 font-mono text-sm text-slate-900 shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
            placeholder="Paste your code snippet or drop a file…"
            spellCheck={false}
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <span>Supports up to 20,000 characters.</span>
            <span className="font-medium text-slate-600">
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
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-10 text-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 ${
              dragActive
                ? "border-slate-500 bg-slate-100"
                : fileError
                ? "border-rose-300 bg-rose-50"
                : "border-slate-300 bg-slate-50"
            }`}
          >
            <span className="text-sm font-semibold text-slate-700">Upload a code file</span>
            <span id={helperId} className="mt-2 text-sm text-slate-500">
              Drag & drop or browse. .js, .py, .java, .cpp, .tsx, .md, and more.
            </span>
            <span className="mt-3 text-xs text-slate-400">
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

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            ref={runButtonRef}
            onClick={async () => {
              if (disabled) return;
              try {
                setMessage(null);
                await onAnalyze({ code, filename, language: derivedLanguage });
              } catch (error) {
                if (error instanceof Error) {
                  setMessage({ tone: "error", text: error.message });
                } else {
                  setMessage({ tone: "error", text: "Something went wrong on our side. Please try again." });
                }
              }
            }}
            disabled={disabled}
            className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status.state === "loading" ? (
              <span className="motion-safe:animate-pulse">Analyzing…</span>
            ) : (
              "Run analysis"
            )}
          </button>
          <button
            type="button"
            onClick={openFilePicker}
            className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
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
                : status.state === "loading"
                ? "text-slate-500"
                : status.state === "success"
                ? "text-emerald-600"
                : "text-slate-500"
            }`}
          >
            {status.message}
          </div>
        </div>
        {message ? (
          <div
            className={`text-sm ${
              message.tone === "error"
                ? "text-rose-600"
                : message.tone === "success"
                ? "text-emerald-600"
                : message.tone === "warning"
                ? "text-amber-600"
                : "text-slate-600"
            }`}
          >
            {message.text}
          </div>
        ) : null}
      </div>

      <section id="examples" className="space-y-3">
        <header className="flex items-center justify-between">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">Try a sample snippet</h3>
        </header>
        <div className="grid gap-3 md:grid-cols-2">
          {EXAMPLE_SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              type="button"
              onClick={() => handleExample(snippet.id)}
              className="group flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900"
            >
              <div className="space-y-2">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{snippet.language}</p>
                <p className="text-base font-semibold text-slate-900">{snippet.title}</p>
                <p className="text-sm text-slate-500">{snippet.description}</p>
              </div>
              <div className="mt-3 rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-500">
                {getPreview(snippet.code)}
              </div>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-slate-700">
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






