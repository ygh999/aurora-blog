import { Hono } from 'hono';
import type { Env, Post } from '../types';
import { getPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost, incrementViewCount, setPostTags } from '../db';
import { authMiddleware } from '../auth';
import { cachedGet, postListKey, postDetailKey, invalidatePostCache, invalidatePostDetailCache } from '../cache';

export function createPostRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const tag = c.req.query('tag');
    const status = c.req.query('status');
    // Cache public published posts only
    if (!status && !tag) {
      const result = await cachedGet(c.env.CACHE, postListKey(page), () => getPosts(c.env.DB, page, limit), 120);
      return c.json(result);
    }
    const result = await getPosts(c.env.DB, page, limit, tag || undefined, status || undefined);
    return c.json(result);
  });

  app.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const post = await cachedGet(c.env.CACHE, postDetailKey(slug), async () => {
      const p = await getPostBySlug(c.env.DB, slug);
      if (!p) return null;
      return p;
    }, 180);
    if (!post) return c.json({ error: 'Not found' }, 404);
    await incrementViewCount(c.env.DB, post.id);
    return c.json(post);
  });

  app.post('/', authMiddleware, async (c) => {
    const body = await c.req.json();
    const { title, slug, content_md, excerpt, cover_url, status, tags } = body;
    if (!title || !slug || !content_md) return c.json({ error: 'Missing required fields' }, 400);
    const id = await createPost(c.env.DB, { title, slug, content_md, excerpt, cover_url, status: status || 'draft' });
    if (tags && Array.isArray(tags)) await setPostTags(c.env.DB, id, tags);
    await invalidatePostCache(c.env.CACHE);
    return c.json({ id }, 201);
  });

  app.put('/:id', authMiddleware, async (c) => {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { tags, ...data } = body;
    await updatePost(c.env.DB, id, data);
    if (tags && Array.isArray(tags)) await setPostTags(c.env.DB, id, tags);
    await invalidatePostDetailCache(c.env.CACHE, (await getPostById(c.env.DB, id))?.slug || '');
    return c.json({ ok: true });
  });

  app.delete('/:id', authMiddleware, async (c) => {
    const id = parseInt(c.req.param('id'));
    const post = await getPostById(c.env.DB, id);
    await deletePost(c.env.DB, id);
    await invalidatePostCache(c.env.CACHE);
    if (post?.slug) await invalidatePostDetailCache(c.env.CACHE, post.slug);
    return c.json({ ok: true });
  });

  return app;
}
