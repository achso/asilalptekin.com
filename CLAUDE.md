# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Personal portfolio site for Asil Alptekin (product/UX designer), built with Next.js App Router, TypeScript, Tailwind CSS v4, and shadcn/ui (`base-nova` style, `neutral` base color). Deployed on Vercel.

## Commands

```bash
npm run dev     # start dev server (localhost:3000)
npm run build   # production build
npm run start   # serve production build
npm run lint    # eslint (flat config, next/core-web-vitals + next/typescript)
```

There is no test suite configured in this repo.

## Architecture

### Content model: case studies live in `data/projects.ts`

`data/projects.ts` exports a single `projects: ProjectData[]` array that is the source of truth for the homepage grid and case study pages. Each project has a loosely-structured shape: short `content` (problem/solution/impact) for the card/preview, an optional `overview` and `sections[]` (freeform title+content blocks) for long-form narrative, and an optional `technicalNarrative` block. Not all fields are used by all case studies — see the two rendering paths below.

### Two case-study rendering paths

- **Generic path**: `app/work/[slug]/page.tsx` looks up a project by `slug` from `data/projects.ts` and renders it generically (hero, overview, problem/outcome, metadata, `sections[]`). This is the fallback for any project without a bespoke page.
- **Bespoke pages**: `app/work/craftapp/page.tsx` and `app/work/route-planner/page.tsx` are large, hand-built page implementations for specific case studies (not using the generic `[slug]` template) — they pull their own copy/layout independent of the shared renderer. When editing a specific case study's content or layout, check whether it has a bespoke page under `app/work/<slug>/` before touching `[slug]/page.tsx`.

### Dev-only inline content editor (`AdminEditMode` + `/api/save-edits`)

`components/AdminEditMode.tsx` (mounted globally in `app/layout.tsx`, guarded by `process.env.NODE_ENV !== "development"`) turns `p`/`h1`/`h2`/`h3` elements inside `#editable-content` into `contentEditable` fields. On save, it diffs original vs. edited `innerText` and POSTs the changes to `app/api/save-edits/route.ts`, which does a brute-force text search-and-replace across every `.tsx` file under `app/` (trying several escaping variants: raw, HTML-entity, escaped-quote, unicode-escape) and writes the match back to disk. This is a source-editing tool, not a CMS — it mutates `.tsx` files directly and only runs in development. Because matching is by exact text fragment, duplicate copy across files/components can cause a save to patch the wrong occurrence.

### Design tokens

Theme colors/radii are defined as CSS custom properties in `app/globals.css` (`:root` / `.dark`) and mapped into Tailwind via the `@theme inline` block, following the shadcn CSS-variables convention. The `@/*` path alias resolves to the repo root (see `tsconfig.json` and `components.json` aliases: `@/components`, `@/lib`, `@/hooks`, `@/components/ui`).
