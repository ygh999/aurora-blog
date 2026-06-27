import { Hono } from 'hono';
import type { Env, Post } from '../types';
import { getPosts, getPostBySlug, getPostById, createPost, updatePost, deletePost, incrementViewCount, setPostTags } from '../db';
import { authMiddleware } from '../auth';

export function createPostRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/', async (c) => {
    const page = parseInt(c.req.query('page') || '1');
    const limit = parseInt(c.req.query('limit') || '10');
    const tag = c.req.query('tag');
    const status = c.req.query('status');
    const result = await getPosts(c.env.DB, page, limit, tag || undefined, status || undefined);
    return c.json(result);
  });

  app.get('/:slug', async (c) => {
    const slug = c.req.param('slug');
    const post = await getPostBySlug(c.env.DB, slug);
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
    return c.json({ id }, 201);
  });

  app.put('/:id', authMiddleware, async (c) => {
    const id = parseInt(c.req.param('id'));
    const body = await c.req.json();
    const { tags, ...data } = body;
    await updatePost(c.env.DB, id, data);
    if (tags && Array.isArray(tags)) await setPostTags(c.env.DB, id, tags);
    return c.json({ ok: true });
  });

  app.delete('/:id', authMiddleware, async (c) => {
    const id = parseInt(c.req.param('id'));
    await deletePost(c.env.DB, id);
    return c.json({ ok: true });
  });

  return app;
}
