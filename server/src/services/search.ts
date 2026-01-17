// Stub for full-text search
// Will be implemented in Phase 5 with FTS5

export interface SearchOptions {
  query: string;
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  articleId: number;
  title: string;
  snippet: string;
  score: number;
}

export async function searchArticles(_options: SearchOptions): Promise<SearchResult[]> {
  throw new Error('Search not implemented - Phase 5');
}
