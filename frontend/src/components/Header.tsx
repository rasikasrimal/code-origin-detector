import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface Props {
  onRunClick: () => void;
}

const NAV_LINKS = [
  {
    href: "#action-heading",
    label: "Prototype",
    external: false,
  },
  {
    href: "https://github.com/code-origin-detector/code-origin-detector/tree/main/docs",
    label: "Docs",
    external: true,
  },
  {
    href: "https://github.com/code-origin-detector/code-origin-detector",
    label: "GitHub",
    external: true,
  },
  {
    href: "#limitations",
    label: "Ethics",
    external: false,
  },
] as const;

export function Header({ onRunClick }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const handler = () => {
      setScrolled(window.scrollY > 12);
    };
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <motion.header
      className="sticky top-0 z-50 border-b border-transparent bg-surface/90 backdrop-blur supports-[backdrop-filter]:bg-surface/70"
      initial={false}
      animate={{
        boxShadow: scrolled ? "0 12px 30px rgba(15,23,42,0.08)" : "0 0 0 rgba(0,0,0,0)",
        borderBottomColor: scrolled ? "rgba(15,23,42,0.08)" : "rgba(15,23,42,0.05)",
      }}
      transition={{ duration: 0.18, ease: "easeOut" }}
    >
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-900">Code Origin Detector</span>
            <span className="text-xs text-neutral-500">Probabilistic insights for code-authorship questions.</span>
          </div>
          <span className="hidden rounded-full border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-medium text-brand-700 md:inline-flex">
            Prototype
          </span>
        </div>
        <nav className="hidden items-center gap-6 text-sm text-neutral-600 md:flex" aria-label="Primary">
          {NAV_LINKS.map((link) => (
            <motion.a
              key={link.label}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noreferrer" : undefined}
              className="rounded-full px-3 py-2 transition-colors hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
              whileHover={{ scale: shouldReduceMotion ? 1 : 1.05 }}
              whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
            >
              {link.label}
            </motion.a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <motion.button
            type="button"
            onClick={onRunClick}
            className="hidden rounded-full bg-brand-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 md:inline-flex"
            whileHover={{ scale: shouldReduceMotion ? 1 : 1.04 }}
            whileTap={{ scale: shouldReduceMotion ? 1 : 0.95 }}
          >
            Run analysis
          </motion.button>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((value) => !value)}
            className="inline-flex rounded-full border border-neutral-200 px-3 py-2 text-sm font-semibold text-neutral-600 transition hover:border-neutral-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500 md:hidden"
          >
            Menu
          </button>
        </div>
      </div>
      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border-t border-neutral-200 bg-surface px-4 pb-4 md:hidden"
            aria-label="Mobile navigation"
          >
            <div className="flex flex-col gap-3 text-sm text-neutral-600">
              <motion.button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  onRunClick();
                }}
                className="rounded-full bg-brand-600 px-5 py-2 text-left font-semibold text-white shadow-sm transition-colors hover:bg-brand-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
                whileTap={{ scale: shouldReduceMotion ? 1 : 0.97 }}
              >
                Run analysis
              </motion.button>
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.label}
                  href={link.href}
                  target={link.external ? "_blank" : undefined}
                  rel={link.external ? "noreferrer" : undefined}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-full px-4 py-2 transition hover:bg-surface-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-brand-500"
                  whileHover={{ scale: shouldReduceMotion ? 1 : 1.01 }}
                  whileTap={{ scale: shouldReduceMotion ? 1 : 0.97 }}
                >
                  {link.label}
                </motion.a>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
