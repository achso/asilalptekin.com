import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

interface Change {
  original: string;
  current: string;
}

// Recursively find all .tsx files in a directory
function getFiles(dir: string): string[] {
  let files: string[] = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    if (item.isDirectory()) {
      // Ignore node_modules, .next, etc. (though this targets 'app/')
      if (item.name.startsWith(".") || item.name === "node_modules") continue;
      files = [...files, ...getFiles(path.join(dir, item.name))];
    } else if (item.name.endsWith(".tsx")) {
      files.push(path.join(dir, item.name));
    }
  }
  return files;
}

// Variants to try when searching the TSX source —
// innerText decodes entities/unicode escapes that the source file uses literally.
function searchVariants(text: string): string[] {
  return [
    text,
    // HTML entity form
    text.replace(/'/g, "&apos;").replace(/&/g, "&amp;"),
    // Escaped apostrophe (very common in JSX)
    text.replace(/'/g, "\\'"),
    // Common unicode escapes
    text
      .replace(/'/g, "\\u2019")
      .replace(/'/g, "\\u2018")
      .replace(/"/g, "\\u201c")
      .replace(/"/g, "\\u201d")
      .replace(/—/g, "\\u2014")
      .replace(/–/g, "\\u2013"),
  ];
}

export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  const body = await req.json();
  const changes: Change[] = body.changes ?? [];

  if (!changes.length) {
    return NextResponse.json({ saved: 0, failed: 0 });
  }

  // Get all possible target files
  const allFiles = getFiles(path.join(process.cwd(), "app"));
  
  let saved = 0;
  const failed: string[] = [];

  for (const { original, current } of changes) {
    if (!original || original === current) continue;

    let foundInAnyFile = false;

    // Search through EVERY file for this specific fragment
    for (const filePath of allFiles) {
      let source = fs.readFileSync(filePath, "utf-8");
      let replacedInThisFile = false;

      for (const variant of searchVariants(original)) {
        if (source.includes(variant)) {
          // ── Context-Aware Escaping ────────────────────────────────────────
          // Check if the match is inside a string literal by looking at the char before it.
          const index = source.indexOf(variant);
          const charBefore = index > 0 ? source[index - 1] : "";
          let finalCurrent = current;

          if (charBefore === '"') {
            // Inside "..." -> escape double quotes
            finalCurrent = current.replace(/"/g, '\\"');
          } else if (charBefore === "'") {
            // Inside '...' -> escape single quotes
            finalCurrent = current.replace(/'/g, "\\'");
          } else if (charBefore === "`") {
            // Inside `...` -> escape backticks and interpolation
            finalCurrent = current.replace(/`/g, "\\`").replace(/\${/g, "\\${");
          }

          // Replace ALL occurrences (assuming they share context, or first match defines it)
          source = source.split(variant).join(finalCurrent);
          fs.writeFileSync(filePath, source, "utf-8");
          replacedInThisFile = true;
          break;
        }
      }

      if (replacedInThisFile) {
        foundInAnyFile = true;
        saved++;
        break; // Stop searching once we found and patched it
      }
    }

    if (!foundInAnyFile) {
      failed.push(original.slice(0, 60) + (original.length > 60 ? "…" : ""));
    }
  }

  return NextResponse.json({ saved, failed: failed.length, failedItems: failed });
}
