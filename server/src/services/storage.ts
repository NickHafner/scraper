// Stub for file storage management
// Will be implemented in Phase 2

export interface StorageOptions {
  sourceId: number;
  articleId: number;
}

export interface ArticleContent {
  html: string;
  markdown: string;
  metadata: Record<string, unknown>;
}

export async function saveArticleContent(
  _options: StorageOptions,
  _content: ArticleContent
): Promise<void> {
  throw new Error('Storage not implemented - Phase 2');
}

export async function deleteArticleContent(_options: StorageOptions): Promise<void> {
  throw new Error('Storage not implemented - Phase 2');
}

export async function getArticleContent(_options: StorageOptions): Promise<ArticleContent | null> {
  throw new Error('Storage not implemented - Phase 2');
}
