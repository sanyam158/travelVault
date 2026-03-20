# TravelVault

A cinematic travel media vault built with Next.js 15 + React 19 + Supabase.

## Tech Stack
- **Framework**: Next.js 15 (App Router, Turbopack)
- **UI**: React 19, Tailwind CSS 4, Framer Motion 12
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Auth**: Google OAuth + Magic Link via Supabase
- **Drag & Drop**: @dnd-kit/core + @dnd-kit/sortable
- **EXIF**: exifr
- **Toasts**: sonner

## Commands
- `npm run dev` — Start dev server (Turbopack)
- `npm run build` — Production build (Turbopack)
- `npm run start` — Start production server
- `npm run lint` — Run Next.js linter

## Project Structure
- `src/app/` — App Router pages and layouts
- `src/app/actions/` — Server Actions (trips.ts, media.ts)
- `src/components/` — Client and shared components
- `src/lib/queries/` — Server-side Supabase queries (trips.ts, media.ts)
- `src/lib/supabase/` — Supabase client/server/middleware setup
- `src/lib/utils/` — Utilities (exif.ts, kenburns.ts)
- `src/types/index.ts` — TypeScript interfaces (Trip, Media, User, KenBurnsConfig)

## Conventions
- Path alias: `@/*` maps to `./src/*`
- Server Components by default; add `'use client'` only when needed
- Server Actions in `src/app/actions/` with `'use server'`
- All Supabase queries verify user authentication and ownership
- Use `revalidatePath()` after mutations to refresh UI
- Heavy modals use `next/dynamic` with `ssr: false` for code splitting

## Theming
- Dark cinematic theme: background `#0a0a0a`, foreground `#f0e6d6`, accent `#d4a574`
- Display font: Cormorant Garamond (`var(--font-display)`)
- Body font: Outfit (`var(--font-body)`)
- Theme variables defined in `src/app/globals.css` @theme block

## Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL`
