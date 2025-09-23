export const EXAMPLE_SNIPPETS = [
  {
    id: "riemann-visualizer",
    title: "React integral visualizer",
    description: "SVG-based Riemann sum renderer with Tailwind styles.",
    filename: "riemann_sums_integral_visualizer_react_tailwind_svg.jsx",
    language: "JavaScript",
    code: `import { memo } from "react";

const SAMPLE_POINTS = 24;
const COLORS = ["#22c55e", "#0ea5e9", "#f59e0b"];

export const RiemannVisualizer = memo(function RiemannVisualizer({ fn, width = 640, height = 360 }) {
  const bars = Array.from({ length: SAMPLE_POINTS }, (_, index) => {
    const x = index / SAMPLE_POINTS;
    const y = Math.max(fn(x), 0);
    const barHeight = Math.min(y * height, height);
    return { id: index, x: x * width, barHeight };
  });

  return (
    <svg viewBox={\`0 0 \${width} \${height}\`} className="w-full">
      <defs>
        <linearGradient id="riemann-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
          {COLORS.map((stop, idx) => (
            <stop key={stop} offset={\`\${(idx / (COLORS.length - 1)) * 100}%\`} stopColor={stop} />
          ))}
        </linearGradient>
      </defs>
      {bars.map((bar) => (
        <rect
          key={bar.id}
          x={bar.x}
          width={width / SAMPLE_POINTS}
          y={height - bar.barHeight}
          height={bar.barHeight}
          fill="url(#riemann-gradient)"
          className="transition-all duration-300"
        />
      ))}
    </svg>
  );
});
`,
  },
  {
    id: "py-batch-cleaner",
    title: "Python batch cleaner",
    description: "Normalization pipeline for CSV customer data.",
    filename: "clean_customers.py",
    language: "Python",
    code: `import csv
from dataclasses import dataclass
from pathlib import Path

@dataclass
class Customer:
  email: str
  country: str
  segment: str

def load_customers(path: Path) -> list[Customer]:
  with path.open(encoding="utf-8") as stream:
    reader = csv.DictReader(stream)
    return [
      Customer(
        email=row.get("email", "").strip().lower(),
        country=row.get("country", "").strip() or "unknown",
        segment=row.get("segment", "").strip() or "general",
      )
      for row in reader
    ]

def group_by_country(customers: list[Customer]) -> dict[str, list[Customer]]:
  buckets: dict[str, list[Customer]] = {}
  for customer in customers:
    buckets.setdefault(customer.country, []).append(customer)
  return buckets
`,
  },
  {
    id: "go-log-watcher",
    title: "Go log watcher",
    description: "Streams Kubernetes logs with contextual tagging.",
    filename: "log_watcher.go",
    language: "Go",
    code: `package logwatcher

import (
  "bufio"
  "context"
  "fmt"
  "io"
)

type Entry struct {
  Message string
  Namespace string
  Pod string
}

func Stream(ctx context.Context, reader io.Reader, handle func(Entry)) error {
  scanner := bufio.NewScanner(reader)
  for scanner.Scan() {
    select {
    case <-ctx.Done():
      return ctx.Err()
    default:
      handle(parse(scanner.Text()))
    }
  }
  return scanner.Err()
}

func parse(raw string) Entry {
  return Entry{Message: raw, Namespace: "default", Pod: "pod-1"}
}
`,
  },
] as const;
