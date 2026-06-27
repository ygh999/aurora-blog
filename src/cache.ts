import type { Env, Post, Tag, PaginatedResult } from './types';

// Cache key prefixes
const KEYS = {
  POST_LIST: 'posts:list',
  POST_DETAIL: 'post:detail',
  TAGS: 'tags:all',
  STATS: 'stats',
  CONFIG: 'config',
};

// Default TTL: 5 minutes
const DEFAULT_TTL = 300;

// Get from cache or compute
export async function cachedGet<T>(
  kv: KVNamespace,
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL
): Promise<T> {
  // Try cache first
  const cached = await kv.get(key, { type: 'json' });
  if (cached !== null) return cached as T;

  // Compute and cache
  const data = await fetcher();
  await kv.put(key, JSON.stringify(data), { expirationTtl: ttl });
  return data;
}

// Invalidate cache by key pattern
export async function invalidateCache(kv: KVNamespace, ...keys: string[]): Promise<void> {
  for (const key of keys) {
    await kv.delete(key);
  }
}

// Invalidate all post-related cache
export async function invalidatePostCache(kv: KVNamespace): Promise<void> {
  await invalidateCache(kv, KEYS.POST_LIST, KEYS.STATS);
}

// Invalidate specific post cache
export async function invalidatePostDetailCache(kv: KVNamespace, slug: string): Promise<void> {
  await invalidateCache(kv, `${KEYS.POST_DETAIL}:${slug}`, KEYS.POST_LIST, KEYS.STATS);
}

// Invalidate tag cache
export async function invalidateTagCache(kv: KVNamespace): Promise<void> {
  await invalidateCache(kv, KEYS.TAGS, KEYS.POST_LIST);
}

// Cache key builders
export function postListKey(page: number, tag?: string): string {
  return `${KEYS.POST_LIST}:p${page}${tag ? ':t:' + tag : ''}`;
}

export function postDetailKey(slug: string): string {
  return `${KEYS.POST_DETAIL}:${slug}`;
}

export { KEYS };
