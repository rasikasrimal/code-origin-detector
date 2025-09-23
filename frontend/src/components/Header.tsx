interface Props {
  onRunClick: () => void;
}

export function Header({ onRunClick }: Props) {
  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Code Origin Detector</span>
          <p className="text-sm text-slate-500">Estimate whether code leans human-written or AI-generated.</p>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-slate-600 md:flex">
          <a className="transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900" href="#examples">Examples</a>
          <a className="transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900" href="#results">Results</a>
          <a className="transition hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900" href="#limitations">Limitations</a>
        </nav>
        <button
          type="button"
          onClick={onRunClick}
          className="hidden rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-900 md:inline-flex"
        >
          Run analysis
        </button>
      </div>
    </header>
  );
}
