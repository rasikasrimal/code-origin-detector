import { useState } from 'react';
import { hoverPop, press } from '../lib/animations';

interface HeaderProps {
  onRunClick: () => void;
}

const NAV_LINKS = [
  {
    href: 'https://github.com/code-origin-detector/code-origin-detector/tree/main/docs',
    label: 'Docs',
  },
  {
    href: 'https://github.com/code-origin-detector/code-origin-detector',
    label: 'GitHub',
  },
];

export function Header({ onRunClick }: HeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((open) => !open);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/65">
      <div className="container flex items-center justify-between gap-4 py-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-semibold text-neutral-900">Code Origin Detector</span>
          <span className="hidden rounded-full bg-primary-100 px-3 py-1 text-xs font-medium text-primary-700 md:inline-flex">
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
              className={`${hoverPop} ${press} rounded-full px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
            >
              {link.label}
            </a>
          ))}
          <a
            href="#ethics"
            className={`${hoverPop} ${press} rounded-full px-3 py-2 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
          >
            Ethics
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              closeMenu();
              onRunClick();
            }}
            className={`${hoverPop} ${press} hidden rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white shadow-soft focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 md:inline-flex`}
          >
            Run analysis
          </button>
          <button
            type="button"
            aria-expanded={menuOpen}
            aria-label="Toggle navigation"
            onClick={toggleMenu}
            className={`${hoverPop} ${press} inline-flex rounded-full border border-neutral-200 px-3 py-2 text-sm font-medium text-neutral-700 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500 md:hidden`}
          >
            Menu
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className="border-t border-neutral-200 bg-white px-4 pb-6 pt-4 text-sm text-neutral-600 md:hidden" aria-label="Mobile navigation">
          <button
            type="button"
            onClick={() => {
              closeMenu();
              onRunClick();
            }}
            className={`${hoverPop} ${press} w-full rounded-full bg-primary-600 px-4 py-3 text-left font-semibold text-white shadow-soft focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
          >
            Run analysis
          </button>
          <div className="mt-3 grid gap-2">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noreferrer"
                onClick={closeMenu}
                className={`${hoverPop} ${press} rounded-full px-4 py-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
              >
                {link.label}
              </a>
            ))}
            <a
              href="#ethics"
              onClick={closeMenu}
              className={`${hoverPop} ${press} rounded-full px-4 py-3 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-primary-500`}
            >
              Ethics
            </a>
          </div>
        </div>
      ) : null}
    </header>
  );
}
