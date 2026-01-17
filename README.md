# PageHoarder - Personal Content Archiving Platform

A self-hosted platform for archiving web content from membership sites, paywalled publications, and online courses. Build your personal offline library with zero coding required.

## The Problem

You pay for subscriptions to newsletters, online courses, news sites, and journals. But:
- Content disappears when subscriptions lapse
- Sites shut down or remove old articles
- You can't read offline or search across sources
- No way to highlight, annotate, or organize content you've paid for

## The Solution

PageHoarder creates a **personal content library** that you own forever:

1. **Point** - Navigate to any site in the built-in browser
2. **Click** - Visually select the content you want (no code needed)
3. **Archive** - Automatically download and organize content
4. **Read** - Access your library anytime, even offline

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
- **E-Reader Sync** - Send to Kindle, Kobo, or Remarkable
- **Cloud Backup** - Optional sync to your own cloud storage
- **Obsidian/Notion** - Export directly to your PKM system

### Privacy & Control
- **100% Local** - Your data never leaves your machine
- **No Accounts** - No sign-ups, no tracking, no cloud dependency
- **Open Formats** - Standard JSON recipes, Markdown content
- **Portable** - Move your library anywhere

## Quick Start

```bash
cd NodeImpl
npm install
npx playwright install chromium
npm start
```

Open http://localhost:3000 and start building your library.

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

| Component | Technology |
|-----------|------------|
| Runtime | Node.js 20+ with TypeScript |
| Browser Engine | Playwright (Chromium) |
| API Server | Express.js + WebSocket |
| Frontend | React 18 + Vite + Tailwind |
| Search | MiniSearch (full-text) |
| Database | SQLite + JSON files |
| Export | Turndown, Playwright PDF, epub-gen |

## Project Structure

```
NodeImpl/
├── src/
│   ├── core/           # Scraping engine
│   ├── library/        # Content management & search
│   ├── scheduler/      # Automated sync jobs
│   ├── api/            # REST + WebSocket server
│   └── js/             # Browser-injected scripts
├── client/             # React frontend
├── data/
│   ├── library.db      # SQLite database
│   ├── recipes/        # Scraping configurations
│   ├── content/        # Archived articles
│   └── sessions/       # Auth cookies
└── exports/            # Generated files
```

## Roadmap

- [x] Core scraping engine
- [x] Visual selector builder
- [x] Authentication manager
- [x] Export to MD/PDF/EPUB
- [ ] Content library with search
- [ ] Scheduled sync jobs
- [ ] Reading mode UI
- [ ] Browser extension
- [ ] Mobile companion app

## Philosophy

**Own your content.** When you pay for a subscription, you're paying for access to information. PageHoarder helps you preserve that access permanently, creating a personal knowledge base that grows over time.

This is not about piracy - it's about preserving content you've legitimately paid for against link rot, platform changes, and subscription lapses.

## License

MIT - Use it, modify it, make it yours.
