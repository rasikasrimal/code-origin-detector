import Link from "next/link";
import { FileCode2, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function AppHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-transparent text-primary">
            <div className="absolute inset-1 rounded-full border border-primary/30" />
            <FileCode2 className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-semibold tracking-tight">Code Origin Detector</h1>
            <p className="text-xs text-muted-foreground">
              AI vs Human authored insights in real time
            </p>
          </div>
        </div>
        <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
          <Badge variant="neutral" className="flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5" /> Prototype UI
          </Badge>
          <Button asChild size="sm" variant="outline" className="text-xs">
            <Link href="https://github.com/your-org/code-origin-detector" prefetch={false}>
              View docs
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
}