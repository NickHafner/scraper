// Stub for Crawlee integration
// Will be implemented in Phase 2

export interface ScrapeOptions {
  sourceId: number;
  recipeId: number;
  maxPages?: number;
  onProgress?: (status: ScrapeStatus) => void;
}

export interface ScrapeStatus {
  phase: 'loading' | 'extracting' | 'processing';
  progress: number;
  articlesFound: number;
}

export async function scrapeSource(_options: ScrapeOptions): Promise<void> {
  throw new Error('Scraper not implemented - Phase 2');
}
