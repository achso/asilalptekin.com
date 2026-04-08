import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Change {
  original: string;
  current: string;
}

// Variants to try when searching the TSX source —
// innerText decodes entities/unicode escapes that the source file uses literally.
function searchVariants(text: string): string[] {
  return [
    text,
    // JS unicode escape → actual character (apostrophe, quotes, dashes)
    text
      .replace(/'/g, "\\u2019")
      .replace(/'/g, "\\u2018")
      .replace(/"/g, "\\u201c")
      .replace(/"/g, "\\u201d")
      .replace(/—/g, "\\u2014")
      .replace(/–/g, "\\u2013"),
    // HTML entity form
    text.replace(/'/g, "&apos;").replace(/&/g, "&amp;"),
    // Escaped apostrophe
    text.replace(/'/g, "\\'"),
  ];
}

export async function POST(req: NextRequest) {
  // Hard block in production — this route should never be called there,
  // but this is a safety net.
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const body = await req.json();
  const changes: Change[] = body.changes ?? [];

  if (!changes.length) {
    return NextResponse.json({ saved: 0, failed: 0 });
  }

  const filePath = path.join(process.cwd(), "app/work/craftapp/page.tsx");
  let source = fs.readFileSync(filePath, "utf-8");

  let saved = 0;
  const failed: string[] = [];

  for (const { original, current } of changes) {
    if (!original || original === current) continue;

    let replaced = false;

    for (const variant of searchVariants(original)) {
      if (source.includes(variant)) {
        // Replace ALL occurrences of this exact string
        source = source.split(variant).join(current);
        saved++;
        replaced = true;
        break;
      }
    }

    if (!replaced) {
      failed.push(original.slice(0, 60) + (original.length > 60 ? "…" : ""));
    }
  }

  if (saved > 0) {
    fs.writeFileSync(filePath, source, "utf-8");
  }

  return NextResponse.json({ saved, failed: failed.length, failedItems: failed });
}
