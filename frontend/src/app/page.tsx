import { AppHeader } from "@/components/app-header";
import { InputPanel } from "@/components/analyzer/input-panel";
import { ResultPanel } from "@/components/analyzer/result-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen flex-col bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_theme(colors.primary/25),_transparent_60%)]" />
      <AppHeader />
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10">
        <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-card/70 p-8 shadow-lg">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_theme(colors.primary/18),_transparent_55%)]" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">Human + AI provenance analytics</Badge>
              <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">
                Assess code origin with heuristics, stylometry, and calibrated models.
              </h2>
              <p className="max-w-2xl text-sm text-muted-foreground">
                Bring your own repositories, inspect per-file explanations, and compare model families before shipping a review workflow or advisory GitHub Action.
              </p>
            </div>
            <Card className="relative w-full max-w-xs border-primary/20 bg-background/80 p-0 shadow-md">
              <CardContent className="flex flex-col gap-3 p-5">
                <p className="text-xs font-medium uppercase tracking-[0.28em] text-muted-foreground">Snapshot</p>
                <div className="space-y-1">
                  <p className="text-3xl font-semibold leading-tight">0.87</p>
                  <p className="text-xs text-muted-foreground">Last run probability (AI)</p>
                </div>
                <Separator className="bg-border/40" />
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="font-medium text-foreground">0.12 FPR</p>
                    <p className="text-muted-foreground">Human → AI</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">0.79 F1</p>
                    <p className="text-muted-foreground">Macro score</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">5× CV</p>
                    <p className="text-muted-foreground">Repo grouped</p>
                  </div>
                  <div>
                    <p className="font-medium text-foreground">2</p>
                    <p className="text-muted-foreground">Languages</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <InputPanel />
          <ResultPanel />
        </div>
      </main>
      <footer className="border-t border-border bg-background/95">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-6 py-4 text-xs text-muted-foreground md:flex-row md:items-center md:justify-between">
          <p>Prototype UI for the code-origin-detector toolkit.</p>
          <p className="text-muted-foreground/80">
            Built with Next.js, Tailwind CSS, shadcn/ui primitives, Zustand, and Lucide icons.
          </p>
        </div>
      </footer>
    </div>
  );
}