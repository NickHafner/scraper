import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { config } from '../config.js';

interface ViteManifestEntry {
  file: string;
  src?: string;
  css?: string[];
  isEntry?: boolean;
}

interface ViteManifest {
  [key: string]: ViteManifestEntry;
}

interface ViteAssets {
  jsFile: string | null;
  cssFile: string | null;
}

// Path to client build output
const CLIENT_DIST = join(process.cwd(), '..', 'client', 'dist');
const MANIFEST_PATH = join(CLIENT_DIST, '.vite', 'manifest.json');

let cachedManifest: ViteManifest | null = null;

/**
 * Read and cache the Vite manifest in production
 */
function getManifest(): ViteManifest | null {
  if (config.NODE_ENV === 'development') {
    return null;
  }

  if (cachedManifest) {
    return cachedManifest;
  }

  if (!existsSync(MANIFEST_PATH)) {
    console.warn('Vite manifest not found at:', MANIFEST_PATH);
    return null;
  }

  try {
    const content = readFileSync(MANIFEST_PATH, 'utf-8');
    cachedManifest = JSON.parse(content) as ViteManifest;
    return cachedManifest;
  } catch (err) {
    console.error('Failed to read Vite manifest:', err);
    return null;
  }
}

/**
 * Get the built asset paths for production
 */
export function getViteAssets(): ViteAssets {
  const manifest = getManifest();

  if (!manifest) {
    return { jsFile: null, cssFile: null };
  }

  // Find the entry point (main.tsx)
  const entry = manifest['src/main.tsx'] || manifest['index.html'];

  if (!entry) {
    console.warn('Could not find entry point in Vite manifest');
    return { jsFile: null, cssFile: null };
  }

  return {
    jsFile: `/${entry.file}`,
    cssFile: entry.css?.[0] ? `/${entry.css[0]}` : null,
  };
}

/**
 * Check if we're in development mode
 */
export function isDev(): boolean {
  return config.NODE_ENV === 'development';
}

/**
 * Get the client dist directory path
 */
export function getClientDistPath(): string {
  return CLIENT_DIST;
}
