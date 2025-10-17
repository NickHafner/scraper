# AI Coding Agent Instructions - Responsible Web Scraper

## Project Overview

A full-stack web scraping system with two distinct applications:

1. **Scraper Backend** – Express.js service handling ethical scraping (robots.txt validation, rate limiting, user agent rotation)
2. **Management UI** – React SPA for managing scrape jobs, viewing results, and submitting new websites

Scraped metadata stored in SQLite, raw content in JSON files. Both apps use Winston logging.

## Key Architecture Principles

### Ethical Scraping as Core Design (Backend)

- **Check `robots.txt` on first encounter**: Use the Robots Parser library to validate scrapeability; cache result in metadata for the domain
- **Rate limiting is mandatory**: Implement Bottleneck queue for concurrent requests (default patterns should respect server capacity)
- **User agent rotation**: Rotate user agents to appear as human traffic, not bots
- **Error recovery**: Implement exponential backoff retries for rate limit responses (HTTP 429)

### Full-Stack Communication

- **Backend API**: RESTful endpoints for job management (POST new URLs, GET job status/results)
- **React SPA**: Communicates with backend via Ky HTTP client for consistent request/response handling
- **Server-Side Rendering**: Backend uses Pug templates for initial webpage serve; React hydrates client-side
- **Job Queue**: Backend maintains queue of submitted URLs; React polls via Ky for real-time updates
- **Shared Database**: Both apps read/write to same SQLite instance (no direct React-to-DB connections)

### Component Structure (Expected)

**Backend (`backend/`)**

- **Entry point**: `src/index.js` (Express.js server + job queue initialization)
- **Express app**: `src/app.js` (middleware setup, route initialization, Pug template engine)
- **Views**: `views/` directory with Pug templates for initial page render and layouts
- **API routes**: `src/routes/jobs.js` (POST submit URL, GET status, GET results)
- **Scraper service**: Core logic for URL handling, Playwright/Cheerio delegation
- **Robots parser integration**: Middleware/utility to validate scrapeability before requests
- **Rate limiter**: Bottleneck-managed queue, likely with configurable concurrency
- **Storage layer**: Dual storage—SQLite for metadata, JSON files for raw scraped content
- **Logger configuration**: Winston setup for request/error tracking across modules

**Frontend (`frontend/`)**

- **Entry point**: `src/index.js` / `public/index.html` (React app)
- **Pages**: Job submission form, job history/status dashboard, results viewer
- **Routing**: Tanstack Router for client-side navigation
- **API client**: `src/services/api.js` (centralized backend communication via Ky)
- **State management**: React hooks or Context API for job state, results cache
- **Components**: Shadcn/ui components for consistent styling (URL input, job status table, content preview, error boundaries)

### Data Flows

```
User URL Input → Robots.txt Validation → Rate Limiter Queue →
  [Static: Cheerio] | [Dynamic: Playwright] → Data Extraction →
    SQLite Metadata + JSON Files → Logging
```

## Development Patterns

### HTTP Request Handling (Backend)

- Use Bottleneck to create queues: `new Bottleneck({ minTime: N, maxConcurrent: M })`
- Check `robots.txt` on first encounter for a domain; cache the result in metadata with domain as key
- For subsequent URLs from same domain, use cached metadata; refresh if stale (e.g., older than 30 days)
- Return error if path disallowed per robots.txt; don't attempt to scrape
- Implement retry logic for 429/503 responses with exponential backoff (2s → 4s → 8s max)
- Rotate user agents from a predefined list, not random generation

### Backend API Endpoints

- `POST /api/jobs` – Submit new URL for scraping (returns job ID)
- `GET /api/jobs` – List all jobs with status (paginated)
- `GET /api/jobs/:id` – Get job details (status, metadata reference, error messages)
- `GET /api/results/:id` – Retrieve scraped content (JSON from file system)
- Response format: `{ id, url, status, createdAt, dataFileReference, error }`

### React SPA State Management

- Store job list and current filters (status, date range) in state
- Implement polling (e.g., every 2-3 seconds) via Ky to refresh job status
- Consider IndexedDB or localStorage for offline caching of results
- Use React hooks (useState, useEffect, useCallback) for simplicity

### Content Extraction

- **Static sites**: Use Cheerio with CSS selectors; parameterize selectors for flexibility
- **Dynamic sites**: Use Playwright's `page.content()` after JavaScript rendering; set reasonable timeouts (30s default)
- **Data validation**: Validate extracted data shape before storing (empty strings, null checks)

### SQLite Integration

- Schema stores **metadata only**: URL, extraction timestamp, status, data file reference, hash, domain-level robots.txt cache
- JSON files store **actual scraped content**: Named consistently (e.g., `data/scraped-[domain]-[timestamp].json`)
- Robots.txt cache per domain: Store parse result and timestamp to avoid repeated fetches
- Use transactions for atomic metadata updates when creating new scrape records
- Include data file path reference in metadata for easy content retrieval

### Logging Strategy

- **Winston configuration**: Set up with file transports for persistent logs (separate error/combined logs)
- **Request logging**: Include URL, status code, retry count, user agent used
- **Error logging**: Include full error stack, URL context, and recovery action taken

## File Organization Convention

- **Backend** (`scraper-backend/`)

  - `src/` – Application source code
  - `src/scrapers/` – Extraction logic (static vs. dynamic handlers)
  - `src/services/` – Robots parser, rate limiter, storage
  - `src/utils/` – User agents, helpers, constants
  - `src/config/` – Environment/config management
  - `db/` – SQLite database and schema files
  - `data/` – JSON files with scraped content (use consistent naming: `[domain]-[timestamp].json`)
  - `logs/` – Output from Winston (gitignored)

- **Frontend** (`scraper-ui/`)
  - `src/components/` – React components (JobForm, JobTable, ResultsViewer, etc.)
  - `src/pages/` – Page-level components (Dashboard, Results)
  - `src/services/` – `api.js` for backend communication via Ky
  - `src/hooks/` – Custom React hooks (useJobs, useFetch, etc.)
  - `public/` – Static assets, `index.html`
  - `.env.local` – Environment variables (backend URL, API key if needed)

## Testing & Build Conventions

- Test external API calls (Playwright, SQLite) with mocks/stubs
- Test rate limiter queue behavior with fake timers if possible
- Include integration tests for robots.txt validation logic
- Verify exponential backoff timing in retry scenarios

## Critical External Dependencies

- **Express.js**: HTTP server framework and middleware
- **Pug**: Server-side template engine for SSR of initial webpage
- **Playwright**: Handles dynamic sites; requires browser binaries (auto-installed)
- **Cheerio**: jQuery-like syntax for static HTML parsing
- **Bottleneck**: Rate limiter; configure per target domain if needed
- **Robots-parser** (or similar): Parse `robots.txt` directives
- **SQLite3**: Synchronous or pooled async queries
- **Winston**: Structured logging with multiple transport types
- **Ky**: Lightweight HTTP client for frontend API communication
- **Shadcn/ui**: Component library for React UI with Tailwind CSS styling

## Key Commands (When Implemented)

- **Backend**
  - `npm test` – Run test suite
  - `npm start` – Start scraper service (or `node src/index.js`)
  - `npm run dev` – Start with nodemon for development
- **Frontend**
  - `npm start` – Start React dev server (CRA)
  - `npm run build` – Build production bundle
  - `npm test` – Run React tests

---

**Last Updated**: October 16, 2025 | **Project Stage**: Early scaffolding phase
