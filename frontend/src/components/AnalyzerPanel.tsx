import type { ChangeEvent, FormEvent, RefObject } from 'react';
import { forwardRef, useMemo, useRef, useState } from 'react';
import { expandY, hoverPop, listItem, press } from '../lib/animations';
import type { AnalysisSettings, AnalysisStatus } from '../types';

interface AnalyzerPanelProps {
  code: string;
  filename: string;
  language: string;
  status: AnalysisStatus;
  settings: AnalysisSettings;
  onCodeChange: (value: string) => void;
  onFilenameChange: (value: string) => void;
  onLanguageChange: (value: string) => void;
  onSettingsChange: (settings: AnalysisSettings) => void;
  onRun: () => void;
  onClear: () => void;
  runButtonRef: RefObject<HTMLButtonElement | null>;
}

const MAX_CHARACTERS = 20_000;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const SUPPORTED_EXTENSIONS = ['js', 'jsx', 'ts', 'tsx', 'py', 'go', 'java', 'cs', 'rb', 'php', 'cpp', 'c', 'rs', 'md'];

function shouldShowAdvancedByDefault(settings: AnalysisSettings) {
  return (
    settings.useHeuristics ||
    settings.model !== 'heuristic_v1' ||
    settings.explanationLevel !== 'full'
  );
}

const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: 'auto', label: 'Auto detect' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'python', label: 'Python' },
  { value: 'go', label: 'Go' },
  { value: 'java', label: 'Java' },
  { value: 'csharp', label: 'C#' },
  { value: 'ruby', label: 'Ruby' },
  { value: 'php', label: 'PHP' },
  { value: 'cpp', label: 'C++' },
  { value: 'rust', label: 'Rust' },
  { value: 'markdown', label: 'Markdown' },
];

export const AnalyzerPanel = forwardRef<HTMLTextAreaElement, AnalyzerPanelProps>(function AnalyzerPanel(
  {
    code,
    filename,
    language,
    status,
    settings,
    onCodeChange,
    onFilenameChange,
    onLanguageChange,
    onSettingsChange,
    onRun,
    onClear,
    runButtonRef,
  }: AnalyzerPanelProps,
  forwardedRef,
) {
  const [inputMode, setInputMode] = useState<'paste' | 'upload'>('paste');
  const [fileError, setFileError] = useState<string | null>(null);
  const [advancedExpanded, setAdvancedExpanded] = useState(() => shouldShowAdvancedByDefault(settings));
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);

  const assignRef = (node: HTMLTextAreaElement | null) => {
    if (typeof forwardedRef === 'function') {
      forwardedRef(node);
    } else if (forwardedRef) {
      forwardedRef.current = node;
    }
  };

  const charactersRemaining = MAX_CHARACTERS - code.length;
  const disabled = status.state === 'loading' || code.trim().length === 0 || code.length > MAX_CHARACTERS;

  const helperMessage = useMemo(() => {
    if (fileError) return fileError;
    if (code.length > MAX_CHARACTERS) return 'Limit reached. Remove some text.';
    if (charactersRemaining < 1000 && charactersRemaining >= 0) return `${charactersRemaining} characters left.`;
    return 'Paste readable source code. We ignore formatting.';
  }, [charactersRemaining, code.length, fileError]);

  const runLabel = status.state === 'loading' ? 'Analyzing…' : 'Run analysis';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (disabled) return;
    onRun();
  };

  const handleFileButton = () => {
    setInputMode('upload');
    hiddenInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_BYTES) {
      setFileError('File exceeds 5 MB limit.');
      return;
    }

    const extension = file.name.includes('.') ? file.name.toLowerCase().split('.').pop() ?? '' : '';
    if (extension && !SUPPORTED_EXTENSIONS.includes(extension)) {
      setFileError('Upload a supported code file.');
      return;
    }

    const text = await file.text();
    if (text.includes('\u0000')) {
      setFileError('Binary files are not supported.');
      return;
    }

    setFileError(null);
    onFilenameChange(file.name);
    onCodeChange(text);
    setInputMode('paste');
    event.target.value = '';
  };

  const handleSettingChange = (patch: Partial<AnalysisSettings>) => {
    onSettingsChange({ ...settings, ...patch });
  };

  const toggleAdvancedExpanded = () => {
    setAdvancedExpanded((value) => !value);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-labelledby="input-heading">
      <section className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft">
        <header className="space-y-1">
          <h2 id="input-heading" className="text-xl font-semibold text-neutral-900">
            📝 Add code
          </h2>
          <p className="text-sm text-neutral-600">Paste source or import a file to begin.</p>
        </header>

        <div className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500">Input options</span>
          <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setInputMode('paste')}
            className={`${hoverPop} ${press} ${listItem} flex h-16 flex-col justify-center rounded-2xl border px-4 text-left text-sm font-medium transition-colors ${inputMode === 'paste' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-neutral-200 bg-neutral-50 text-neutral-700'} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
          >
            Paste manually
            <span className="text-xs font-normal text-neutral-500">Quickest way to check snippets.</span>
          </button>
          <button
            type="button"
            onClick={handleFileButton}
            className={`${hoverPop} ${press} ${listItem} flex h-16 flex-col justify-center rounded-2xl border px-4 text-left text-sm font-medium transition-colors ${inputMode === 'upload' ? 'border-primary-200 bg-primary-50 text-primary-700' : 'border-neutral-200 bg-neutral-50 text-neutral-700'} focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
          >
            Upload file
            <span className="text-xs font-normal text-neutral-500">Accepts plain-text code formats.</span>
          </button>
          </div>
        </div>

        <label className="grid gap-2 text-sm font-medium text-neutral-700" htmlFor="filename">
          File label
          <input
            id="filename"
            name="filename"
            value={filename}
            onChange={(event) => onFilenameChange(event.target.value)}
            placeholder="example.py"
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            aria-describedby="filename-helper"
          />
          <span id="filename-helper" className="text-xs font-normal text-neutral-500">
            Twelve characters min helps context.
          </span>
        </label>

        <label className="grid gap-2 text-sm font-medium text-neutral-700" htmlFor="language">
          Language hint
          <select
            id="language"
            name="language"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
          >
            {LANGUAGE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-neutral-500">Choose manually if auto guess fails.</span>
        </label>

        <label className="grid gap-3 text-sm font-medium text-neutral-700" htmlFor="code">
          Code snippet
          <textarea
            ref={assignRef}
            id="code"
            name="code"
            value={code}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              if (fileError) setFileError(null);
              onCodeChange(event.target.value);
            }}
            rows={14}
            className="w-full rounded-3xl border border-neutral-200 bg-neutral-50 px-4 py-4 text-sm text-neutral-900 shadow-inner transition focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            aria-describedby="code-helper"
            spellCheck={false}
          />
          <div className="flex items-center justify-between text-xs text-neutral-500" id="code-helper">
            <span>{helperMessage}</span>
            <span>{Math.max(charactersRemaining, 0).toLocaleString()} left</span>
          </div>
        </label>
        <input
          ref={hiddenInputRef}
          type="file"
          accept=".js,.jsx,.ts,.tsx,.py,.go,.java,.cs,.rb,.php,.cpp,.c,.rs,.md,.txt"
          onChange={(event) => {
            void handleFileChange(event);
          }}
          className="sr-only"
        />
      </section>

      <section className="space-y-4 rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft">
        <header className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">⚙️ Settings</h2>
            <p className="text-sm text-neutral-600">Tweak overlays before you run.</p>
          </div>
          <button
            type="button"
            onClick={toggleAdvancedExpanded}
            className={`${hoverPop} ${press} rounded-full border border-neutral-200 px-4 py-2 text-sm font-medium text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
            aria-expanded={advancedExpanded}
            aria-controls="advanced-panel"
          >
            {advancedExpanded ? 'Hide advanced' : 'Show advanced'}
          </button>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-700">
            <input
              type="checkbox"
              checked={settings.useHeuristics}
              onChange={(event) => handleSettingChange({ useHeuristics: event.target.checked })}
              className="h-5 w-5 rounded border-neutral-300 text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            />
            Enable heuristic overlay
          </label>
          <p className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
            Helps explain verdict using handcrafted signals.
          </p>
        </div>

        <div id="advanced-panel" data-expanded={advancedExpanded} className={`${expandY} space-y-4`}>
          <label className="grid gap-2 text-sm font-medium text-neutral-700">
            Model profile
            <select
              value={settings.model}
              onChange={(event) => handleSettingChange({ model: event.target.value as AnalysisSettings['model'] })}
              className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-900 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
            >
              <option value="heuristic_v1">Heuristic baseline</option>
              <option value="ml_stack">ML stack</option>
              <option value="hybrid_v2">Hybrid v2</option>
            </select>
            <span className="text-xs font-normal text-neutral-500">Pick slower stacks for thoroughness.</span>
          </label>

          <fieldset className="grid gap-3">
            <legend className="text-sm font-medium text-neutral-700">Explanation detail</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className={`${hoverPop} ${press} flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}>
                Concise
                <input
                  type="radio"
                  name="explanationLevel"
                  value="concise"
                  checked={settings.explanationLevel === 'concise'}
                  onChange={(event) => event.target.checked && handleSettingChange({ explanationLevel: 'concise' })}
                  className="h-5 w-5 text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                />
              </label>
              <label className={`${hoverPop} ${press} flex cursor-pointer items-center justify-between rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}>
                Full
                <input
                  type="radio"
                  name="explanationLevel"
                  value="full"
                  checked={settings.explanationLevel === 'full'}
                  onChange={(event) => event.target.checked && handleSettingChange({ explanationLevel: 'full' })}
                  className="h-5 w-5 text-primary-600 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500"
                />
              </label>
            </div>
          </fieldset>

          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-xs text-neutral-500">
            <strong className="block text-sm text-neutral-700">Heuristic overlay</strong>
            Provides context when probability feels close.
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            ref={runButtonRef as RefObject<HTMLButtonElement>}
            type="submit"
            disabled={disabled}
            className={`${hoverPop} ${press} inline-flex items-center justify-center rounded-full bg-primary-600 px-6 py-3 text-sm font-semibold text-white shadow-soft focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60`}
          >
            {runLabel}
          </button>
          <button
            type="button"
            onClick={onClear}
            className={`${hoverPop} ${press} inline-flex items-center justify-center rounded-full border border-neutral-200 px-6 py-3 text-sm font-semibold text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
          >
            Clear inputs
          </button>
          <span className="text-xs text-neutral-500" role="status" aria-live="polite">
            {status.message}
          </span>
        </div>
      </section>
    </form>
  );
});
