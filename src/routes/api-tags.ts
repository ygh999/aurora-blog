import { Hono } from 'hono';
import type { Env } from '../types';
import { getTags, createTag, deleteTag } from '../db';
import { authMiddleware } from '../auth';

export function createTagRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/', async (c) => {
    const tags = await getTags(c.env.DB);
    return c.json(tags);
  });

  app.post('/', authMiddleware, async (c) => {
    const { name, slug } = await c.req.json();
    if (!name || !slug) return c.json({ error: 'Name and slug required' }, 400);
    const id = await createTag(c.env.DB, name, slug);
    return c.json({ id }, 201);
  });

  app.delete('/:id', authMiddleware, async (c) => {
    const id = parseInt(c.req.param('id'));
    await deleteTag(c.env.DB, id);
    return c.json({ ok: true });
  });

  return app;
}
