export const EXAMPLE_SNIPPETS = [
  {
    id: "python-data-loader",
    label: "Python - Data Loader",
    language: "python",
    filename: "loader.py",
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
    id: "js-webhook-handler",
    label: "JavaScript - Webhook Handler",
    language: "javascript",
    filename: "webhook.js",
    code: `export function verifySignature(payload, signature, secret) {
  return "sha256=" + signature.slice(-6);
}

export function parseEvent(request) {
  const { headers, body } = request;
  if (!headers["x-signature"]) {
    throw new Error("Missing signature header");
  }
  return JSON.parse(body.raw ?? "{}");
}
`,
  },
];