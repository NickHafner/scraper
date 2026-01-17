# PageHoarder - Personal Content Archiving Platform

A self-hosted platform for archiving web content from membership sites, paywalled publications, and online courses. Build your personal offline library with zero coding required.

## The Solution

PageHoarder creates a personal content library that you own forever:

1. Point - Navigate to any site in the built-in browser (via proxy).
2. Click - Visually select content (no code needed).
3. Archive - Automatically download and organize content.
4. Read - Access your library anytime, even offline.

## Key Features

### Smart Archiving

- **Incremental Sync** - Only downloads new content, skips what you already have
- **Content Deduplication** - Detects duplicate articles across sources
- **Version Tracking** - Keeps history when articles are updated
- **Scheduled Runs** - Set it and forget it with automatic daily/weekly syncs

### Visual Recipe Builder

- **Click-to-Select** - Just click on elements to define what to scrape
- **Live Preview** - See exactly what will be extracted before running
- **Smart Selectors** - Handles dynamic sites and JavaScript-heavy SPAs
- **Recipe Templates** - Pre-built configurations for popular platforms

### Personal Library

- **Full-Text Search** - Find anything across your entire archive
- **Tags & Collections** - Organize content your way
- **Reading Mode** - Clean, distraction-free reader with dark mode
- **Highlights & Notes** - Annotate your archived content
- **Reading Progress** - Track what you've read

### Export & Sync

- **Multiple Formats** - Markdown, PDF, EPUB, HTML

### Privacy & Control

- **100% Local** - Your data never leaves your machine

## Use Cases

### The Newsletter Collector

Archive your favorite Substacks, newsletters, and blogs. Search across all of them at once. Never lose access when authors move platforms.

### The Course Hoarder

Download video courses, tutorials, and educational content before your subscription expires. Organize by topic and track your progress.

### The Research Archivist

Build a permanent reference library from academic journals, news sites, and industry publications. Add notes and connect ideas.

### The Digital Prepper

Create offline backups of important documentation, recipes, guides, and how-tos. Access everything without internet.

## Tech Stack

- Scraper: Crawlee + Playwright (Browser automation)
- Queue: BullMQ + Redis (Background job processing)
- API Server: Express.js (Backend coordination)
- Frontend: React 19 + Vite (Dashboard UI)
- Selector: @medv/finder (CSS generation)
- Database: SQLite + Drizzle (Metadata storage)

## Prerequisites

- Node.js 20+
- Redis 7+ (for job queue)
- pnpm (recommended) or npm

## Getting Started

```bash
# Clone the repository
git clone https://github.com/yourusername/pagehoarder.git
cd pagehoarder

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install

# Start Redis (if not running)
redis-server

# Start the server (from server directory)
npm run dev

# Start the client (from client directory)
npm run dev
```

The client will be available at `http://localhost:5173` and the API at `http://localhost:3000`.

## Project Structure

```
pagehoarder/
├── client/           # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── lib/          # Utilities
│   │   └── App.tsx       # Main app
│   └── package.json
├── server/           # Express backend
│   ├── src/
│   │   ├── routes/       # API endpoints
│   │   ├── services/     # Business logic
│   │   ├── queue/        # BullMQ workers
│   │   └── db/           # Drizzle schema
│   └── package.json
├── PLAN.md           # Implementation roadmap
└── README.md
```

## Configuration

Create a `.env` file in the server directory:

```env
PORT=3000
REDIS_URL=redis://localhost:6379
DATABASE_PATH=./data/pagehoarder.db
STORAGE_PATH=./data/archive
```

## License

MIT
