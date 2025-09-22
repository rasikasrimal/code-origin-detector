"use client";

import { ChangeEvent, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Wand2 } from "lucide-react";

import { usePredict } from "@/hooks/use-predict";
import { usePredictionStore } from "@/stores/prediction-store";
import type { PredictionRequestBody } from "@/types/prediction";
import { EXAMPLE_SNIPPETS } from "@/lib/example-snippets";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Textarea } from "../ui/textarea";
import { Label } from "../ui/label";

const ACCEPTED_TYPES = [".py", ".js", ".ts", ".tsx", ".jsx"];

function deriveLanguage(filename: string, fallback: string) {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (!ext) return fallback;
  if (["py", "pyw"].includes(ext)) return "python";
  if (["js", "jsx", "cjs", "mjs", "ts", "tsx"].includes(ext)) return "javascript";
  return fallback;
}

export function InputPanel() {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [code, setCode] = useState("");
  const [filename, setFilename] = useState("snippet.py");
  const [language, setLanguage] = useState("python");
  const status = usePredictionStore((state) => state.status);
  const error = usePredictionStore((state) => state.error);
  const { runPrediction } = usePredict();

  const disabled = status === "loading";

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setCode(text);
    setFilename(file.name);
    setLanguage(deriveLanguage(file.name, language));
  };

  const handleExample = (id: string) => {
    const snippet = EXAMPLE_SNIPPETS.find((item) => item.id === id);
    if (!snippet) return;
    setCode(snippet.code);
    setFilename(snippet.filename);
    setLanguage(snippet.language);
  };

  const submitPayload = async () => {
    const trimmed = code.trim();
    if (!trimmed) return;
    const payload: PredictionRequestBody = {
      filename,
      code: trimmed,
      language,
    };
    await runPrediction(payload);
  };

  const statusLabel = (() => {
    if (status === "loading") return "Analyzing snippet…";
    if (status === "error" && error) return error;
    if (status === "success") return "Prediction complete";
    return "";
  })();

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="flex flex-col"
    >
      <Card className="relative overflow-hidden border-border/60 bg-card/70 shadow-lg">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent" />
        <CardHeader className="relative space-y-3">
          <div className="flex items-center justify-between gap-3">
            <CardTitle className="text-lg font-semibold tracking-tight">Run a new analysis</CardTitle>
            <Badge variant="neutral" className="uppercase tracking-wide text-[10px]">Heuristics + ML</Badge>
          </div>
          <CardDescription>
            Paste code, upload a file, or start from curated examples to estimate the likelihood that the snippet was authored by an AI assistant.
          </CardDescription>
        </CardHeader>
        <CardContent className="relative space-y-6">
          <Tabs defaultValue="paste" className="w-full">
            <TabsList className="w-fit border border-border/60 bg-background/80 shadow-sm">
              <TabsTrigger value="paste">Paste code</TabsTrigger>
              <TabsTrigger value="upload">Upload file</TabsTrigger>
            </TabsList>
            <TabsContent value="paste" className="mt-4 space-y-4 rounded-2xl border border-border/50 bg-background/90 p-5 shadow-inner">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="filename">Filename</Label>
                  <Input
                    id="filename"
                    value={filename}
                    onChange={(event) => {
                      setFilename(event.target.value);
                      setLanguage(deriveLanguage(event.target.value, language));
                    }}
                    disabled={disabled}
                  />
                </div>
                <div className="md:w-40">
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={language}
                    onChange={(event) => setLanguage(event.target.value)}
                    disabled={disabled}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Source</Label>
                <Textarea
                  id="code"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  rows={16}
                  placeholder="Paste source code here"
                  disabled={disabled}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span>{code.length.toLocaleString()} characters</span>
                  {statusLabel ? (
                    <span className={status === "error" ? "text-destructive" : "text-primary"}>{statusLabel}</span>
                  ) : null}
                </div>
              </div>
            </TabsContent>
            <TabsContent value="upload" className="mt-4 rounded-2xl border border-dashed border-border/60 bg-background/90 p-8 text-center shadow-inner">
              <div className="flex flex-col items-center justify-center gap-3">
                <Upload className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
                <p className="text-sm font-medium">Drag & drop or choose a file</p>
                <p className="text-xs text-muted-foreground">Accepted: {ACCEPTED_TYPES.join(", ")}</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled}
                >
                  Browse files
                </Button>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <Button onClick={submitPayload} disabled={disabled || code.trim().length === 0} className="w-full md:w-auto">
              <Wand2 className="mr-2 h-4 w-4" /> Analyze origin
            </Button>
            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground/70">Quick examples:</span>
              {EXAMPLE_SNIPPETS.map((snippet) => (
                <Button
                  key={snippet.id}
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleExample(snippet.id)}
                  disabled={disabled}
                  className="border-dashed"
                >
                  {snippet.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
}