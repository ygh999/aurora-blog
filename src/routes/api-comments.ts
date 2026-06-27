import { Hono } from 'hono';
import type { Env } from '../types';
import { getComments, createComment, getPendingComments, updateCommentStatus, deleteComment } from '../db';
import { authMiddleware } from '../auth';

export function createCommentRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.get('/posts/:id/comments', async (c) => {
    const postId = parseInt(c.req.param('id'));
    const comments = await getComments(c.env.DB, postId);
    return c.json(comments);
  });

  app.post('/posts/:id/comments', async (c) => {
    const postId = parseInt(c.req.param('id'));
    const { nickname, email, content, parent_id } = await c.req.json();
    if (!nickname || !content) return c.json({ error: 'Nickname and content required' }, 400);
    const ip = c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For') || '';
    const id = await createComment(c.env.DB, { post_id: postId, parent_id: parent_id || null, nickname, email: email || null, content, status: 'pending', ip });
    return c.json({ id, status: 'pending' }, 201);
  });

  app.get('/comments/pending', authMiddleware, async (c) => {
    const comments = await getPendingComments(c.env.DB);
    return c.json(comments);
  });

  app.put('/comments/:id', authMiddleware, async (c) => {
    const id = parseInt(c.req.param('id'));
    const { status } = await c.req.json();
    if (!['approved', 'rejected'].includes(status)) return c.json({ error: 'Invalid status' }, 400);
    await updateCommentStatus(c.env.DB, id, status);
    return c.json({ ok: true });
  });

  app.delete('/comments/:id', authMiddleware, async (c) => {
    const id = parseInt(c.req.param('id'));
    await deleteComment(c.env.DB, id);
    return c.json({ ok: true });
  });

  return app;
}
