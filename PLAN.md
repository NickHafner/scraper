# PageHoarder Implementation Plan

## Vision

Transform PageHoarder from a simple scraper into a **personal content archiving platform** - a self-hosted alternative to services like Pocket, Instapaper, or Readwise, but with the power to pull content from behind paywalls using your own legitimate credentials.

---

## Getting Started

```bash
cd NodeImpl
npm install
npx playwright install chromium
npm run dev      # Development with hot reload
npm start        # Production mode
```

Open http://localhost:3000

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  Dashboard  │  Recipe Editor  │  Library  │  Reader  │  Settings │
└──────────────────────────┬──────────────────────────────────────┘
                           │ REST + WebSocket
┌──────────────────────────┴──────────────────────────────────────┐
│                      API Server (Express)                        │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│   Recipes   │   Library   │  Scheduler  │      Export           │
└─────────────┴──────┬──────┴─────────────┴───────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                     Core Engine                                  │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│  Browser    │    Auth     │  Scraper    │     Selector          │
│  Manager    │   Manager   │   Engine    │      System           │
└─────────────┴─────────────┴─────────────┴───────────────────────┘
                     │
┌────────────────────┴────────────────────────────────────────────┐
│                      Data Layer                                  │
├─────────────┬─────────────┬─────────────┬───────────────────────┤
│   SQLite    │    JSON     │   Content   │      Search           │
│  (metadata) │  (recipes)  │   (files)   │     (MiniSearch)      │
└─────────────┴─────────────┴─────────────┴───────────────────────┘
```

---

## Phase 1: Core Foundation (CURRENT)
*Basic scraping capabilities*

- [x] 1.1 Project structure with TypeScript ES modules
- [x] 1.2 Zod schemas for Recipe and data models
- [x] 1.3 BrowserManager with Playwright integration
- [x] 1.4 Cookie persistence for session management
- [x] 1.5 AuthManager with "Record Login" mode
- [x] 1.6 Visual selector with JavaScript injection
- [x] 1.7 Scraper engine with pagination support
- [x] 1.8 Export to Markdown, PDF, EPUB
- [x] 1.9 Express API server with WebSocket

---

## Phase 2: Content Library
*Transform from scraper to archive platform*

### 2.1 Database Layer
- [ ] Add SQLite with better-sqlite3 for metadata
- [ ] Design schema for articles, sources, tags, collections
- [ ] Content hashing for deduplication
- [ ] Track scrape history and article versions

**Schema Design:**
```sql
-- Sources (recipes with metadata)
CREATE TABLE sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  recipe_json TEXT,
  last_sync DATETIME,
  sync_frequency TEXT,  -- 'manual' | 'daily' | 'weekly'
  article_count INTEGER DEFAULT 0
);

-- Articles (scraped content)
CREATE TABLE articles (
  id TEXT PRIMARY KEY,
  source_id TEXT REFERENCES sources(id),
  url TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  author TEXT,
  published_at DATETIME,
  scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  content_hash TEXT,  -- For deduplication
  content_path TEXT,  -- Path to markdown file
  word_count INTEGER,
  read_progress REAL DEFAULT 0,
  is_read BOOLEAN DEFAULT FALSE,
  is_favorite BOOLEAN DEFAULT FALSE
);

-- Tags
CREATE TABLE tags (
  id INTEGER PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  color TEXT
);

-- Article-Tag relationship
CREATE TABLE article_tags (
  article_id TEXT REFERENCES articles(id),
  tag_id INTEGER REFERENCES tags(id),
  PRIMARY KEY (article_id, tag_id)
);

-- Collections (folders/groups)
CREATE TABLE collections (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  parent_id INTEGER REFERENCES collections(id)
);

-- Highlights & Notes
CREATE TABLE annotations (
  id INTEGER PRIMARY KEY,
  article_id TEXT REFERENCES articles(id),
  type TEXT,  -- 'highlight' | 'note'
  content TEXT,
  position_start INTEGER,
  position_end INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### 2.2 Incremental Sync
- [ ] Track already-scraped URLs per source
- [ ] Compare content hashes to detect updates
- [ ] Store article versions when content changes
- [ ] "Sync New Only" vs "Full Resync" modes

### 2.3 Content Storage
- [ ] Store articles as Markdown files with YAML frontmatter
- [ ] Download and store images locally
- [ ] Generate thumbnails for article cards
- [ ] Organize files by source/date structure

**Content File Format:**
```markdown
---
id: abc123
source: my-newsletter
url: https://example.com/article
title: "Article Title"
author: "John Doe"
published: 2024-01-15
scraped: 2024-01-16T10:30:00Z
tags: [technology, ai]
---

# Article Title

Article content here...
```

---

## Phase 3: Search & Discovery
*Find anything in your archive*

### 3.1 Full-Text Search
- [ ] Integrate MiniSearch for fast client-side search
- [ ] Index article titles, content, authors
- [ ] Search result highlighting
- [ ] Search filters (source, date range, tags)

### 3.2 Smart Organization
- [ ] Auto-tagging based on content analysis
- [ ] Suggested tags from article keywords
- [ ] "Similar articles" recommendations
- [ ] Reading statistics dashboard

---

## Phase 4: Scheduler & Automation
*Set it and forget it*

### 4.1 Job Scheduler
- [ ] Add node-cron or Agenda for scheduling
- [ ] Per-source sync frequency (daily/weekly/manual)
- [ ] Global sync schedules
- [ ] Retry failed syncs with exponential backoff

### 4.2 Notifications
- [ ] Desktop notifications for new content
- [ ] Notification for sync failures
- [ ] Summary email (optional)
- [ ] "New articles" badge in UI

### 4.3 Queue System
- [ ] Job queue for scraping tasks
- [ ] Concurrent scraping with limits
- [ ] Priority queue (manual > scheduled)
- [ ] Progress persistence across restarts

---

## Phase 5: Reading Experience
*A pleasure to read*

### 5.1 Reader Mode
- [ ] Clean, distraction-free article view
- [ ] Typography controls (font, size, line height)
- [ ] Dark/light/sepia themes
- [ ] Estimated reading time
- [ ] Reading progress indicator

### 5.2 Annotations
- [ ] Text highlighting with colors
- [ ] Margin notes
- [ ] Export highlights as markdown
- [ ] Highlight search

### 5.3 Reading Workflow
- [ ] "Read Later" queue
- [ ] Reading history
- [ ] "Mark all as read" for sources
- [ ] Keyboard navigation

---

## Phase 6: Enhanced UI
*Modern, responsive interface*

### 6.1 Dashboard
- [ ] Overview cards (total articles, unread, sources)
- [ ] Recent activity feed
- [ ] Quick actions (sync all, add source)
- [ ] Storage usage indicator

### 6.2 Library Views
- [ ] Card view with thumbnails
- [ ] List view for dense browsing
- [ ] Magazine layout for visual content
- [ ] Saved view configurations

### 6.3 Recipe Editor
- [ ] Step-by-step wizard for new sources
- [ ] Embedded browser preview
- [ ] Selector test with match count
- [ ] Import/export recipes as files

### 6.4 Responsive Design
- [ ] Mobile-friendly layouts
- [ ] Touch gestures for reading
- [ ] PWA support for offline access

---

## Phase 7: Export & Integration
*Your data, your way*

### 7.1 Enhanced Export
- [ ] Batch export entire library
- [ ] Custom EPUB metadata
- [ ] PDF with table of contents
- [ ] Export with/without images

### 7.2 E-Reader Integration
- [ ] Send to Kindle via email
- [ ] Kobo/Remarkable support
- [ ] Calibre integration

### 7.3 PKM Integration
- [ ] Obsidian-compatible markdown
- [ ] Notion API export
- [ ] Logseq format
- [ ] Custom template support

### 7.4 Backup & Restore
- [ ] Full library backup (zip)
- [ ] Incremental backups
- [ ] Cloud storage sync (optional)
- [ ] Import from backup

---

## Phase 8: Advanced Features
*Power user capabilities*

### 8.1 Browser Extension
- [ ] "Save to PageHoarder" button
- [ ] Quick recipe creation from current page
- [ ] Highlight and save selection
- [ ] Sync reading progress

### 8.2 Recipe Templates
- [ ] Pre-built recipes for popular sites
- [ ] Community recipe sharing (optional)
- [ ] Recipe auto-detection hints
- [ ] Recipe versioning

### 8.3 Advanced Scraping
- [ ] Handle JavaScript SPAs better
- [ ] Proxy support for rate limiting
- [ ] Custom headers/user agents
- [ ] Wait conditions for dynamic content

### 8.4 API Access
- [ ] REST API for third-party integration
- [ ] Webhook notifications
- [ ] CLI tool for scripting

---

## Tech Stack (Updated)

| Component | Technology | Purpose |
|-----------|------------|---------|
| Runtime | Node.js 20+ | Server environment |
| Language | TypeScript 5.x | Type safety |
| Browser | Playwright | Web automation |
| API | Express.js | REST endpoints |
| Realtime | WebSocket (ws) | Live updates |
| Database | better-sqlite3 | Metadata storage |
| Search | MiniSearch | Full-text search |
| Scheduler | node-cron | Job scheduling |
| Frontend | React 18 + Vite | UI framework |
| Styling | Tailwind + shadcn/ui | Components |
| State | Zustand | Client state |
| Data Fetching | TanStack Query | API caching |
| Markdown | Turndown | HTML → MD |
| PDF | Playwright | PDF generation |
| EPUB | epub-gen-memory | E-book creation |

---

## Directory Structure (Updated)

```
NodeImpl/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts                 # Entry point
│   ├── core/
│   │   ├── browser.ts           # BrowserManager
│   │   ├── auth.ts              # AuthManager
│   │   ├── scraper.ts           # Scraping engine
│   │   └── selector.ts          # Visual selector
│   ├── library/
│   │   ├── database.ts          # SQLite operations
│   │   ├── articles.ts          # Article CRUD
│   │   ├── sources.ts           # Source management
│   │   ├── search.ts            # Search indexing
│   │   └── storage.ts           # File storage
│   ├── scheduler/
│   │   ├── jobs.ts              # Job definitions
│   │   ├── queue.ts             # Job queue
│   │   └── cron.ts              # Cron schedules
│   ├── export/
│   │   ├── markdown.ts          # MD export
│   │   ├── pdf.ts               # PDF export
│   │   ├── epub.ts              # EPUB export
│   │   └── integrations.ts      # PKM exports
│   ├── api/
│   │   ├── server.ts            # Express setup
│   │   ├── routes/              # API routes
│   │   └── websocket.ts         # WS handlers
│   └── js/
│       └── selector.js          # Injected script
├── client/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Library.tsx
│   │   │   ├── Reader.tsx
│   │   │   ├── Sources.tsx
│   │   │   └── Settings.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── package.json
├── data/
│   ├── library.db               # SQLite database
│   ├── recipes/                 # JSON recipe files
│   ├── content/                 # Article markdown files
│   │   └── {source}/
│   │       └── {date}/
│   │           └── {slug}.md
│   ├── assets/                  # Downloaded images
│   └── sessions/                # Auth cookies
└── exports/                     # Generated exports
```

---

## API Endpoints (Updated)

### Sources
```
GET    /api/sources              # List all sources
POST   /api/sources              # Add new source
GET    /api/sources/:id          # Get source details
PUT    /api/sources/:id          # Update source
DELETE /api/sources/:id          # Delete source
POST   /api/sources/:id/sync     # Trigger sync
```

### Articles
```
GET    /api/articles             # List articles (paginated)
GET    /api/articles/:id         # Get article
PUT    /api/articles/:id         # Update article metadata
DELETE /api/articles/:id         # Delete article
GET    /api/articles/:id/content # Get article content
```

### Library
```
GET    /api/library/stats        # Library statistics
GET    /api/library/search       # Full-text search
GET    /api/library/tags         # List all tags
POST   /api/library/tags         # Create tag
GET    /api/library/collections  # List collections
POST   /api/library/collections  # Create collection
```

### Sync & Jobs
```
POST   /api/sync/all             # Sync all sources
GET    /api/jobs                 # List scheduled jobs
GET    /api/jobs/:id/status      # Job status
POST   /api/jobs/:id/cancel      # Cancel job
WS     /api/progress             # Real-time updates
```

### Export
```
POST   /api/export/articles      # Export selected articles
POST   /api/export/source/:id    # Export entire source
GET    /api/export/formats       # Available formats
```

---

## Success Metrics

1. **Reliability**: 95%+ successful scrapes
2. **Speed**: < 2s per article on average
3. **Storage**: Efficient with deduplication
4. **Search**: < 100ms query response
5. **UX**: Recipe creation in < 5 minutes

---

## Non-Goals (For Now)

- Cloud hosting / SaaS version
- Multi-user support
- Social features / sharing
- AI summarization
- Mobile native apps (PWA first)

---

## Getting Help

- Check existing recipes in `data/recipes/`
- Enable debug logging with `DEBUG=pagehoarder:*`
- File issues on GitHub

---

## Contributing

See CONTRIBUTING.md for guidelines.
