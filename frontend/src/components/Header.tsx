import { useState } from "react";

interface Props {
  onRunClick: () => void;
}

const NAV_LINKS = [
  {
    href: "https://github.com/code-origin-detector/code-origin-detector/tree/main/docs",
    label: "Docs",
  },
  {
    href: "https://github.com/code-origin-detector/code-origin-detector",
    label: "GitHub",
  },
];

export function Header({ onRunClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen((current) => !current);
  };

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-neutral-900">Code Origin Detector</span>
            <p className="text-xs text-neutral-500">Probabilistic insights for code-authorship questions.</p>
          </div>
          <span className="hidden rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-600 md:inline-flex">
            Prototype
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              target="_blank"
              rel="noreferrer"
              className="transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            >
              {link.label}
            </a>
          ))}
          <a
            href="#limitations"
            className="transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
          >
            Ethics
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onRunClick}
            className="hidden rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 md:inline-flex"
          >
            Run analysis
          </button>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={toggleMenu}
            className="inline-flex rounded-full border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 md:hidden"
          >
            Menu
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className="border-t border-neutral-200 bg-surface px-4 pb-4 md:hidden" aria-label="Mobile navigation">
          <div className="flex flex-col gap-3 text-sm text-neutral-600">
            <button
              type="button"
              onClick={() => {
                closeMenu();
                onRunClick();
              }}
              className="rounded-full bg-brand-600 px-5 py-2 text-left font-semibold text-white transition hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            >
              Run analysis
            </button>
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                className="rounded-full px-4 py-2 transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
                onClick={closeMenu}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#limitations"
              onClick={closeMenu}
              className="rounded-full px-4 py-2 transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
            >
              Ethics
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
