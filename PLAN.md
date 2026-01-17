# PageHoarder Implementation Plan

## Overview

This document outlines the phased implementation approach for PageHoarder. The architecture follows a clear separation: React frontend for the UI, Express backend for API coordination, BullMQ for job processing, and Crawlee/Playwright for the actual scraping work.

---

## Phase 1: Foundation

### 1.1 Database Schema (Drizzle + SQLite)

Set up the core data models:

```
sources          - Websites/feeds to scrape
├── id
├── name
├── url
├── recipe_id    → recipes.id
├── schedule     - cron expression
├── last_run
├── status
└── created_at

recipes          - Scraping configurations
├── id
├── name
├── selectors    - JSON: { title, content, date, author, links }
├── pagination   - JSON: { type, selector, max_pages }
├── filters      - JSON: { include, exclude patterns }
└── created_at

articles         - Archived content
├── id
├── source_id    → sources.id
├── url
├── title
├── content      - cleaned HTML/markdown
├── author
├── published_at
├── archived_at
├── content_hash - for deduplication
├── version      - for tracking updates
└── metadata     - JSON: custom fields

tags             - Organization
├── id
├── name
└── color

article_tags     - Many-to-many
├── article_id
└── tag_id

collections      - User-defined groups
├── id
├── name
├── description
└── created_at

collection_articles
├── collection_id
└── article_id

jobs             - Job tracking (supplements BullMQ)
├── id
├── bullmq_id
├── source_id
├── status
├── started_at
├── completed_at
├── articles_found
├── articles_new
└── error
```

**Tasks:**
- [ ] Initialize Drizzle in server
- [ ] Create schema files for each table
- [ ] Set up migrations
- [ ] Create seed script for testing

### 1.2 Express API Server

Basic server structure:

```
server/src/
├── index.ts           - Entry point
├── routes/
│   ├── sources.ts     - CRUD for sources
│   ├── recipes.ts     - CRUD for recipes
│   ├── articles.ts    - Query/search articles
│   ├── jobs.ts        - Job management
│   └── proxy.ts       - Browser proxy endpoint
├── services/
│   ├── scraper.ts     - Crawlee orchestration
│   ├── storage.ts     - File management
│   └── search.ts      - Full-text search
├── queue/
│   ├── worker.ts      - BullMQ worker
│   └── jobs.ts        - Job definitions
└── db/
    ├── schema.ts
    └── index.ts       - Drizzle client
```

**API Endpoints:**

```
# Sources
GET    /api/sources
POST   /api/sources
GET    /api/sources/:id
PUT    /api/sources/:id
DELETE /api/sources/:id
POST   /api/sources/:id/run      - Trigger scrape

# Recipes
GET    /api/recipes
POST   /api/recipes
GET    /api/recipes/:id
PUT    /api/recipes/:id
DELETE /api/recipes/:id
POST   /api/recipes/:id/test     - Test selectors

# Articles
GET    /api/articles             - List with filters
GET    /api/articles/:id
DELETE /api/articles/:id
GET    /api/articles/search      - Full-text search

# Jobs
GET    /api/jobs
GET    /api/jobs/:id
DELETE /api/jobs/:id             - Cancel job

# Proxy (for visual selector)
POST   /api/proxy/navigate       - Load page in headless browser
POST   /api/proxy/screenshot     - Get current page state
POST   /api/proxy/evaluate       - Run selector, return matches
```

**Tasks:**
- [ ] Set up Express with TypeScript
- [ ] Add error handling middleware
- [ ] Implement CORS for local development
- [ ] Create route stubs
- [ ] Add request validation (zod)

### 1.3 Job Queue (BullMQ)

Worker types:

1. **ScrapeWorker** - Main scraping job
   - Receives: source_id
   - Uses recipe to extract article URLs
   - Queues individual ArticleWorker jobs

2. **ArticleWorker** - Single article processing
   - Receives: url, source_id, recipe_id
   - Downloads content
   - Extracts text using recipe selectors
   - Saves to database and storage

3. **SchedulerWorker** - Cron-based triggers
   - Checks sources for scheduled runs
   - Queues ScrapeWorker jobs

**Tasks:**
- [ ] Set up BullMQ connection
- [ ] Create worker process
- [ ] Implement job retry logic
- [ ] Add job progress events
- [ ] Create scheduler service

---

## Phase 2: Core Scraping

### 2.1 Crawlee Integration

```typescript
// Scraper service structure
interface ScrapeOptions {
  sourceId: number;
  recipe: Recipe;
  maxPages?: number;
  onProgress?: (status: ScrapeStatus) => void;
}

interface Recipe {
  selectors: {
    articleList: string;    // Selector for article links
    title: string;
    content: string;
    author?: string;
    date?: string;
  };
  pagination?: {
    type: 'click' | 'url' | 'infinite';
    selector?: string;
    urlPattern?: string;
    maxPages: number;
  };
}
```

**Scraping Flow:**
1. Load source URL in Playwright
2. Apply recipe selectors to find article links
3. Handle pagination if configured
4. For each article URL:
   - Check if already archived (by URL or content hash)
   - Queue ArticleWorker job if new
5. Report progress via BullMQ events

**Tasks:**
- [ ] Install and configure Crawlee
- [ ] Create PlaywrightCrawler instance
- [ ] Implement article extraction
- [ ] Add content cleaning (readability)
- [ ] Handle JavaScript-heavy pages
- [ ] Implement duplicate detection

### 2.2 Content Storage

Directory structure:
```
data/
├── pagehoarder.db
└── archive/
    └── {source_id}/
        └── {article_id}/
            ├── content.html    - Original HTML
            ├── content.md      - Cleaned markdown
            ├── metadata.json   - Article metadata
            └── assets/         - Images, etc.
                ├── image1.jpg
                └── image2.png
```

**Tasks:**
- [ ] Create storage service
- [ ] Implement asset downloading
- [ ] Rewrite asset URLs in content
- [ ] Add cleanup for deleted articles

---

## Phase 3: Visual Recipe Builder

### 3.1 Browser Proxy Service

The proxy service runs a persistent Playwright browser that the frontend can control.

```typescript
interface ProxySession {
  id: string;
  browser: Browser;
  page: Page;
  createdAt: Date;
}

// Proxy endpoints
POST /api/proxy/session          - Create new session
DELETE /api/proxy/session/:id    - Close session
POST /api/proxy/navigate         - Go to URL
GET  /api/proxy/screenshot       - Get current page as image
POST /api/proxy/select           - Highlight matching elements
POST /api/proxy/generate         - Generate selector from element
```

**Tasks:**
- [ ] Implement session management
- [ ] WebSocket for real-time updates
- [ ] Screenshot streaming
- [ ] Element highlighting overlay
- [ ] @medv/finder integration for selector generation

### 3.2 Frontend Selector UI

Components needed:
- `BrowserFrame` - Displays proxied page
- `SelectorPanel` - Shows/edits current selectors
- `ElementPicker` - Click-to-select overlay
- `PreviewPanel` - Shows extracted data preview

**User Flow:**
1. Enter URL → loads in browser frame
2. Click "Select Title" → enters pick mode
3. Click on article title → generates selector
4. System highlights all matching elements
5. User confirms or adjusts
6. Repeat for content, author, date, links
7. Save as recipe

**Tasks:**
- [ ] Create browser frame component
- [ ] Implement click handler overlay
- [ ] Build selector editing UI
- [ ] Add live preview of extracted data
- [ ] Recipe save/load functionality

---

## Phase 4: Frontend Dashboard

### 4.1 Pages

```
/                     - Dashboard overview
/sources              - Source management
/sources/:id          - Source detail + history
/sources/new          - Add source wizard
/recipes              - Recipe library
/recipes/:id          - Recipe editor
/library              - Article archive
/library/:id          - Article reader
/collections          - Collection management
/collections/:id      - Collection view
/jobs                 - Job queue monitor
/settings             - App configuration
```

### 4.2 Key Components

**Dashboard**
- Active jobs status
- Recent articles
- Source health overview
- Quick actions

**Library**
- Grid/list view toggle
- Filter by source, tag, collection, date
- Search bar
- Bulk actions (tag, delete, export)

**Reader**
- Clean reading mode
- Dark/light theme
- Highlight & notes (future)
- Reading progress (future)

**Tasks:**
- [ ] Set up React Router
- [ ] Create layout components
- [ ] Build source management pages
- [ ] Build library view
- [ ] Create article reader
- [ ] Add job queue monitor

---

## Phase 5: Search & Organization

### 5.1 Full-Text Search

Options:
1. **SQLite FTS5** - Built-in, simple, good for moderate scale
2. **MeiliSearch** - Better UX, faceted search, typo tolerance

Start with FTS5, plan for MeiliSearch upgrade path.

```sql
CREATE VIRTUAL TABLE articles_fts USING fts5(
  title,
  content,
  author,
  content='articles',
  content_rowid='id'
);
```

**Tasks:**
- [ ] Set up FTS5 virtual table
- [ ] Create search triggers for sync
- [ ] Implement search API endpoint
- [ ] Add search UI with highlighting

### 5.2 Tags & Collections

- Tags: Quick categorization, auto-suggest based on content
- Collections: Manual curation, ordered lists

**Tasks:**
- [ ] Tag CRUD API
- [ ] Collection CRUD API
- [ ] Bulk tagging UI
- [ ] Collection management UI

---

## Phase 6: Export & Sync

### 6.1 Export Formats

- **Markdown** - Direct file download or zip
- **HTML** - Standalone page with embedded assets
- **PDF** - Via Playwright print (future)
- **EPUB** - Via pandoc or custom builder (future)

**Tasks:**
- [ ] Markdown exporter
- [ ] HTML exporter with asset bundling
- [ ] Bulk export (zip)
- [ ] Export API endpoints

---

## Phase 7: Polish & Optimization

### 7.1 Performance

- [ ] Add database indexes
- [ ] Implement pagination for large libraries
- [ ] Lazy load images in reader
- [ ] Cache frequently accessed data

### 7.2 Error Handling

- [ ] Graceful scrape failures
- [ ] Retry logic with backoff
- [ ] User-friendly error messages
- [ ] Job failure notifications

### 7.3 UX Improvements

- [ ] Onboarding flow
- [ ] Recipe templates for popular sites
- [ ] Keyboard shortcuts
- [ ] Responsive mobile layout

---

## Implementation Priority

**MVP (Start Here):**
1. Database schema (1.1)
2. Basic API server (1.2)
3. Manual scrape trigger (2.1 - basic)
4. Article storage (2.2)
5. Simple library view (4.2)
6. Article reader (4.2)

**V1:**
1. Job queue with progress (1.3)
2. Full scraping flow (2.1)
3. Visual recipe builder (3.1, 3.2)
4. Search (5.1)
5. Tags & collections (5.2)

**V2:**
1. Scheduled runs
2. Export features (6.1)
3. Polish (7.x)

---

## Technical Decisions

### Why SQLite over Postgres?
- Zero configuration for self-hosted users
- Single file backup
- Plenty fast for personal use (thousands of articles)
- FTS5 provides good search

### Why BullMQ over simple queue?
- Proven reliability
- Built-in retry/backoff
- Progress events
- Scheduled jobs
- Dashboard available (Bull Board)

### Why Crawlee?
- Built on Playwright, handles SPAs
- Automatic request queuing
- Built-in proxy rotation (if needed)
- Session management
- Mature error handling

---

## Open Questions

1. **Authentication** - Add for multi-user or keep single-user?
2. **Video support** - Download videos or just metadata?
3. **Browser extension** - "Save to PageHoarder" button?
4. **Mobile app** - PWA sufficient or native needed?
