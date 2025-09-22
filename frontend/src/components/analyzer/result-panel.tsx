"use client";

import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Clock, FileBarChart, History, ListTree, Shield } from "lucide-react";

import { usePredictionStore } from "@/stores/prediction-store";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { Skeleton } from "../ui/skeleton";

function formatConfidence(probability: number) {
  return `${Math.round(probability * 100)}%`;
}

export function ResultPanel() {
  const active = usePredictionStore((state) => state.active);
  const records = usePredictionStore((state) => state.records);
  const status = usePredictionStore((state) => state.status);
  const setActive = usePredictionStore((state) => state.setActive);
  const reset = usePredictionStore((state) => state.reset);

  const showSkeleton = status === "loading" && !active;

  return (
    <motion.section
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut", delay: 0.1 }}
      className="space-y-6"
    >
      <Card className="border-border/60 bg-card/70 shadow-lg">
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-sm uppercase tracking-[0.2em] text-muted-foreground">
              <Shield className="h-4 w-4" strokeWidth={1.5} /> Model verdict
            </CardTitle>
            <CardDescription className="text-sm text-muted-foreground">
              Confidence-calibrated output with heuristic explanations.
            </CardDescription>
          </div>
          <Badge variant="neutral" className="flex items-center gap-1 text-[11px]">
            <FileBarChart className="h-3.5 w-3.5" /> Live inference
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          {showSkeleton ? (
            <div className="space-y-4">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
              <div className="grid gap-3 md:grid-cols-2">
                {Array.from({ length: 4 }).map((_, index) => (
                  <Skeleton key={index} className="h-12 w-full" />
                ))}
              </div>
            </div>
          ) : active ? (
            <div className="space-y-6">
              <div className="flex flex-col justify-between gap-4 rounded-2xl border border-primary/20 bg-background/90 p-5 shadow-inner md:flex-row md:items-center">
                <div className="space-y-1">
                  <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">File</p>
                  <p className="text-sm font-semibold text-foreground">{active.filename}</p>
                  <p className="text-xs text-muted-foreground">{active.language.toUpperCase()}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={active.label === "ai" ? "destructive" : "secondary"} className="text-sm">
                    {active.label === "ai" ? "Likely AI-generated" : "Likely human-authored"}
                  </Badge>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Probability (AI)</p>
                    <p className="text-2xl font-semibold leading-none">{formatConfidence(active.probability)}</p>
                    <p className="text-[11px] text-muted-foreground">Confidence {formatConfidence(active.confidence)}</p>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {active.explanations.slice(0, 6).map((reason) => (
                  <div
                    key={reason.id}
                    className="rounded-2xl border border-border/50 bg-muted/30 p-4 text-sm shadow-sm"
                  >
                    <p className="flex items-center gap-2 font-medium text-foreground">
                      <ListTree className="h-4 w-4 text-muted-foreground" />
                      {reason.message}
                    </p>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Contribution: {reason.contribution.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-4 text-xs text-muted-foreground">
                {active.label === "ai" ? (
                  <AlertTriangle className="h-4 w-4 text-primary" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                )}
                <span>
                  Predictions are advisory signals. Combine with code review context before drawing hard conclusions.
                </span>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border/60 bg-background/80 text-center text-sm text-muted-foreground">
              <Clock className="h-6 w-6" />
              <p>No predictions yet. Submit a file or paste code to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/60 bg-card/70 shadow-lg">
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <History className="h-4 w-4 text-muted-foreground" /> Recent runs
          </div>
          {records.length > 0 && (
            <Button variant="ghost" size="sm" onClick={reset}>
              Clear history
            </Button>
          )}
        </CardHeader>
        <Separator className="bg-border/60" />
        <CardContent className="space-y-2 pt-4">
          {records.length === 0 ? (
            <p className="text-xs text-muted-foreground">History will appear here after you run predictions.</p>
          ) : (
            records.map((record) => (
              <button
                key={record.id}
                onClick={() => setActive(record.id)}
                className="flex w-full items-center justify-between rounded-xl border border-border/60 bg-background/80 px-4 py-3 text-left text-xs transition hover:border-primary/40 hover:bg-primary/5"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-medium text-foreground">{record.filename}</span>
                  <span className="text-muted-foreground">
                    {record.language.toUpperCase()} • {new Date(record.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
                <Badge variant={record.label === "ai" ? "destructive" : "secondary"}>
                  {record.label === "ai" ? "AI" : "Human"} • {formatConfidence(record.probability)}
                </Badge>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </motion.section>
  );
}