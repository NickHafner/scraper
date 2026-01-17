import { db } from './index.js';
import { recipes, sources, tags, collections } from './schema.js';

async function seed(): Promise<void> {
  console.log('Seeding database...');

  // Clear existing data (in reverse dependency order)
  await db.delete(collections);
  await db.delete(tags);
  await db.delete(sources);
  await db.delete(recipes);

  // Create sample recipes
  const [blogRecipe] = await db.insert(recipes).values({
    name: 'Generic Blog',
    selectors: {
      articleList: 'article a[href]',
      title: 'h1',
      content: 'article, .post-content, .entry-content',
      author: '.author, [rel="author"]',
      date: 'time, .date, .published',
    },
    pagination: {
      type: 'click',
      selector: '.next, .pagination a:last-child',
      maxPages: 5,
    },
  }).returning();

  if (!blogRecipe) {
    throw new Error('Failed to create blog recipe');
  }
  console.log('Created recipe:', blogRecipe.name);

  // Create sample sources
  const [source1] = await db.insert(sources).values({
    name: 'Example Blog',
    url: 'https://example.com/blog',
    recipeId: blogRecipe.id,
    schedule: '0 6 * * *', // Daily at 6 AM
    status: 'active',
  }).returning();

  if (!source1) {
    throw new Error('Failed to create source');
  }
  console.log('Created source:', source1.name);

  // Create sample tags
  await db.insert(tags).values([
    { name: 'Unread', color: '#ef4444' },
    { name: 'Favorite', color: '#f59e0b' },
    { name: 'Archive', color: '#6b7280' },
  ]);

  console.log('Created default tags');

  // Create sample collection
  await db.insert(collections).values({
    name: 'Reading List',
    description: 'Articles to read later',
  });

  console.log('Created default collection');

  console.log('Seed completed!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
