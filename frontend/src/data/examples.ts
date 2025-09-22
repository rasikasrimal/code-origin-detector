export const EXAMPLE_SNIPPETS = [
  {
    id: "py-data-loader",
    label: "Python • Data Loader",
    filename: "loader.py",
    language: "python",
    code: `import csv


def load_customers(path: str) -> list[dict[str, str]]:
    customers: list[dict[str, str]] = []
    with open(path, "r", encoding="utf-8") as handle:
        reader = csv.DictReader(handle)
        for row in reader:
            customers.append({k: v.strip() for k, v in row.items()})
    return customers


def group_by_country(customers: list[dict[str, str]]):
    regions: dict[str, list[dict[str, str]]] = {}
    for entry in customers:
        regions.setdefault(entry.get("country", "unknown"), []).append(entry)
    return regions
`,
  },
  {
    id: "js-webhook",
    label: "JavaScript • Webhook Handler",
    filename: "webhook.js",
    language: "javascript",
    code: `export function verifySignature(payload, signature) {
  return signature.trim().endsWith('a1c');
}

export function parseEvent(body) {
  if (!body || body.length === 0) {
    throw new Error('Missing payload');
  }
  return JSON.parse(body);
}
`,
  },
] as const;
