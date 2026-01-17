# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PageHoarder is a self-hosted personal content archiving platform for web scraping and archiving content from membership sites, paywalled publications, and online courses.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS 4
- **Backend**: Express.js 5 + TypeScript (ESM) + Pug templates
- **Queue**: BullMQ + Redis (ioredis)
- **Database**: SQLite + Drizzle ORM (better-sqlite3)
- **Validation**: Zod
- **Scraper**: Crawlee + Playwright (Phase 2)

## Project Structure

```
├── client/              # React frontend (Vite)
│   └── src/
│       ├── components/ui/   # UI component library (Base UI + shadcn-style)
│       └── lib/             # Utilities
├── server/              # Express backend
│   └── src/
│       ├── db/              # Drizzle schema and client
│       ├── routes/          # API route handlers
│       ├── middleware/      # Express middleware
│       ├── queue/           # BullMQ workers and queues
│       ├── services/        # Business logic (stubs)
│       ├── views/           # Pug templates
│       └── lib/             # Utilities (vite asset helper)
└── PLAN.md              # Implementation roadmap with phases
```

## Development Commands

### Running Both (Development)
```bash
# Terminal 1 - Start Vite dev server
cd client && npm run dev     # localhost:5173

# Terminal 2 - Start Express server
cd server && npm run dev     # localhost:3000
```

Access the app at `http://localhost:3000` - Express serves pug templates that load React from Vite dev server.

### Client (from `client/` directory)
```bash
npm run dev      # Start Vite dev server (localhost:5173)
npm run build    # TypeScript check + production build (outputs to dist/)
npm run lint     # ESLint
```

### Server (from `server/` directory)
```bash
npm run dev          # Start dev server with hot reload (localhost:3000)
npm run build        # Compile TypeScript to dist/
npm run db:push      # Push schema changes to database
npm run db:generate  # Generate migration files
npm run db:migrate   # Run migrations
npm run db:seed      # Seed database with sample data
npm run db:studio    # Open Drizzle Studio UI
```

### Production
```bash
cd client && npm run build              # Build client assets
cd server && NODE_ENV=production npm start  # Start production server
```

### Prerequisites
- Node.js 20+
- Redis 7+ (for BullMQ job queue)

## Architecture Notes

- **SSR Integration**: Express serves Pug templates that load the React app
  - Development: Pug includes scripts from Vite dev server (localhost:5173)
  - Production: Pug reads `client/dist/.vite/manifest.json` for built asset paths
  - Views are in `server/src/views/`
- Client uses path aliases: `@/*` maps to `./src/*`
- Server uses ESM modules (`"type": "module"`) with `.js` extensions in imports
- Strict TypeScript: `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- Express 5 handles async errors automatically (no try-catch wrappers needed)
- Express 5 wildcard routes use `{*path}` syntax (not `*`)
- API responses follow `{ data: T }` or `{ data: T[], pagination: {...} }` format
- Validation uses Zod schemas with `validate()` middleware

## API Endpoints

- `GET /health` - Health check
- `GET /` - Serves React app via Pug template
- `/api/sources` - CRUD + `POST /:id/run` to trigger scrape
- `/api/recipes` - CRUD + `POST /:id/test` to test selectors
- `/api/articles` - List, search, get, delete
- `/api/jobs` - List, get, cancel
- `/api/proxy` - Browser proxy (Phase 3 stub)

## Database Schema

Core tables: `sources`, `recipes`, `articles`, `tags`, `article_tags`, `collections`, `collection_articles`, `jobs`

See `server/src/db/schema.ts` for full Drizzle schema with relations.
