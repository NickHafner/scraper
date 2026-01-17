import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// ============ RECIPES ============
export const recipes = sqliteTable('recipes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  selectors: text('selectors', { mode: 'json' }).$type<{
    articleList?: string;
    title?: string;
    content?: string;
    author?: string;
    date?: string;
    links?: string;
  }>(),
  pagination: text('pagination', { mode: 'json' }).$type<{
    type?: 'click' | 'url' | 'infinite';
    selector?: string;
    urlPattern?: string;
    maxPages?: number;
  }>(),
  filters: text('filters', { mode: 'json' }).$type<{
    include?: string[];
    exclude?: string[];
  }>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============ SOURCES ============
export const sources = sqliteTable('sources', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  url: text('url').notNull(),
  recipeId: integer('recipe_id').references(() => recipes.id, { onDelete: 'set null' }),
  schedule: text('schedule'), // cron expression
  lastRun: integer('last_run', { mode: 'timestamp' }),
  status: text('status', { enum: ['active', 'paused', 'error'] }).default('active'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============ ARTICLES ============
export const articles = sqliteTable('articles', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  sourceId: integer('source_id').references(() => sources.id, { onDelete: 'cascade' }).notNull(),
  url: text('url').notNull().unique(),
  title: text('title'),
  content: text('content'),
  author: text('author'),
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  archivedAt: integer('archived_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  contentHash: text('content_hash'),
  version: integer('version').default(1),
  metadata: text('metadata', { mode: 'json' }).$type<Record<string, unknown>>(),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============ TAGS ============
export const tags = sqliteTable('tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull().unique(),
  color: text('color').default('#6b7280'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============ ARTICLE_TAGS (Junction) ============
export const articleTags = sqliteTable('article_tags', {
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  tagId: integer('tag_id').references(() => tags.id, { onDelete: 'cascade' }).notNull(),
});

// ============ COLLECTIONS ============
export const collections = sqliteTable('collections', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============ COLLECTION_ARTICLES (Junction) ============
export const collectionArticles = sqliteTable('collection_articles', {
  collectionId: integer('collection_id').references(() => collections.id, { onDelete: 'cascade' }).notNull(),
  articleId: integer('article_id').references(() => articles.id, { onDelete: 'cascade' }).notNull(),
  position: integer('position').default(0),
});

// ============ JOBS ============
export const jobs = sqliteTable('jobs', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  bullmqId: text('bullmq_id'),
  sourceId: integer('source_id').references(() => sources.id, { onDelete: 'cascade' }),
  status: text('status', {
    enum: ['pending', 'running', 'completed', 'failed', 'cancelled']
  }).default('pending'),
  startedAt: integer('started_at', { mode: 'timestamp' }),
  completedAt: integer('completed_at', { mode: 'timestamp' }),
  articlesFound: integer('articles_found').default(0),
  articlesNew: integer('articles_new').default(0),
  error: text('error'),
  createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============ RELATIONS ============
export const recipesRelations = relations(recipes, ({ many }) => ({
  sources: many(sources),
}));

export const sourcesRelations = relations(sources, ({ one, many }) => ({
  recipe: one(recipes, {
    fields: [sources.recipeId],
    references: [recipes.id],
  }),
  articles: many(articles),
  jobs: many(jobs),
}));

export const articlesRelations = relations(articles, ({ one, many }) => ({
  source: one(sources, {
    fields: [articles.sourceId],
    references: [sources.id],
  }),
  articleTags: many(articleTags),
  collectionArticles: many(collectionArticles),
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  articleTags: many(articleTags),
}));

export const articleTagsRelations = relations(articleTags, ({ one }) => ({
  article: one(articles, {
    fields: [articleTags.articleId],
    references: [articles.id],
  }),
  tag: one(tags, {
    fields: [articleTags.tagId],
    references: [tags.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ many }) => ({
  collectionArticles: many(collectionArticles),
}));

export const collectionArticlesRelations = relations(collectionArticles, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionArticles.collectionId],
    references: [collections.id],
  }),
  article: one(articles, {
    fields: [collectionArticles.articleId],
    references: [articles.id],
  }),
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
  source: one(sources, {
    fields: [jobs.sourceId],
    references: [sources.id],
  }),
}));
