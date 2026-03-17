# TravelVault

A cinematic travel media vault built with Next.js, Supabase, and Framer Motion.

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Database & Auth**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS 4
- **Animations**: Framer Motion
- **Drag & Drop**: dnd-kit
- **Language**: TypeScript

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project

## Setup

1. Clone the repository:

```bash
git clone <repo-url>
cd travelvault
npm install
```

2. Copy the environment file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

3. Configure your Supabase project:

**Database tables:**

- `trips` — id, user_id, title, subtitle, cover_image_url, start_date, end_date, media_count, created_at, updated_at
- `media` — id, trip_id, file_url, thumbnail_url, type, caption, location_name, latitude, longitude, sort_order, exif_data, ken_burns_config, captured_at, uploaded_at

**Storage:**

- Create a `media` bucket (public)
- Used for trip cover images and media uploads

**Auth:**

- Enable Google OAuth (or your preferred provider)
- Set redirect URL to `http://localhost:3000/auth/callback`

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Deploy

Push to GitHub and connect to [Vercel](https://vercel.com) for automatic deployments. Set the environment variables in your Vercel project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_URL` (your production URL)

## Features

- Create and manage trips with cover images
- Upload photos and videos with EXIF extraction
- Drag-and-drop media reordering
- Cinematic slideshow with Ken Burns effects, film grain, and crossfade
- Edit media captions, locations, and Ken Burns parameters
- Batch select and delete media
- Mobile-friendly with swipe gestures in slideshow
- Dark cinematic design with warm gold accents
