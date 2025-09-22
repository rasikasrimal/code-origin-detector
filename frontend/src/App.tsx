import { useMemo, useState } from "react";
import { Header } from "./components/Header";
import { AnalyzerPanel } from "./components/AnalyzerPanel";
import { ResultPanel } from "./components/ResultPanel";
import type { PredictionRecord } from "./types";

function App() {
  const [records, setRecords] = useState<PredictionRecord[]>([]);
  const active = useMemo(() => records[0], [records]);

  const handleSubmit = (record: PredictionRecord) => {
    setRecords((current) => [record, ...current.slice(0, 9)]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)]">
          <AnalyzerPanel onSubmit={handleSubmit} />
          <ResultPanel
            active={active}
            records={records}
            onSelect={(id) => {
              setRecords((current) => {
                const selected = current.find((item) => item.id === id);
                if (!selected) return current;
                return [selected, ...current.filter((item) => item.id !== id)];
              });
            }}
            onClear={() => setRecords([])}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
