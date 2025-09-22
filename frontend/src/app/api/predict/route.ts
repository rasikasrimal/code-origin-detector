import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

import type { PredictionRequestBody, PredictionResponse } from "@/types/prediction";

const GENERIC_MARKERS = ["temp", "data", "result", "value", "item"];
const COMMENT_MARKERS = [/^\s*#/, /^\s*\/\//, /^\s*\/\*/];

function scoreCode(code: string) {
  const lines = code.split(/\r?\n/).filter(Boolean);
  const lineCount = lines.length;
  const commentLines = lines.filter((line) => COMMENT_MARKERS.some((regex) => regex.test(line))).length;
  const genericHits = GENERIC_MARKERS.reduce((acc, marker) => acc + (code.includes(marker) ? 1 : 0), 0);
  const repetition = Math.min(1, (code.length / 1200) * 0.35);
  const signal = genericHits * 0.08 + repetition - (commentLines / Math.max(lineCount, 1)) * 0.4;
  const probability = Math.max(0.03, Math.min(0.97, 0.5 + signal));
  return { lineCount, commentLines, genericHits, probability };
}

export async function POST(request: Request) {
  const body = (await request.json()) as PredictionRequestBody;
  const { code, filename, language } = body;
  if (!code || !filename) {
    return NextResponse.json({ error: "Missing code or filename" }, { status: 400 });
  }
  const { probability, genericHits, commentLines, lineCount } = scoreCode(code);
  const label = probability >= 0.5 ? "ai" : "human";
  const confidence = label === "ai" ? probability : 1 - probability;
  const result: PredictionResponse["result"] = {
    id: randomUUID(),
    filename,
    language,
    label,
    probability,
    confidence,
    createdAt: new Date().toISOString(),
    explanations: [
      {
        id: "generic-identifiers",
        message:
          genericHits > 0 ? `${genericHits} generic identifier hits detected` : "Identifier patterns consistent with human style",
        contribution: genericHits > 0 ? genericHits * 0.08 : -0.04,
      },
      {
        id: "comment-density",
        message: commentLines === 0 ? "No comments detected" : `${commentLines} comment lines present`,
        contribution: commentLines === 0 ? 0.12 : -0.08,
      },
      {
        id: "line-count",
        message: `${lineCount} total lines analysed`,
        contribution: Math.min(0.1, lineCount / 2000),
      },
    ],
  };
  return NextResponse.json({ result });
}
