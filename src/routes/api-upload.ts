import { Hono } from 'hono';
import type { Env } from '../types';
import { authMiddleware } from '../auth';

export function createUploadRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/', authMiddleware, async (c) => {
    const formData = await c.req.formData();
    const file = formData.get('file') as File | null;
    if (!file) return c.json({ error: 'No file provided' }, 400);

    const ext = file.name.split('.').pop() || 'bin';
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2,8)}.${ext}`;

    await c.env.R2.put(key, file.stream(), {
      httpMetadata: { contentType: file.type }
    });

    return c.json({ key, url: `/api/file/${key}` });
  });

  // Serve uploaded files
  app.get('/file/:key{.+}', async (c) => {
    const key = c.req.param('key');
    const obj = await c.env.R2.get(key);
    if (!obj) return c.notFound();
    const headers = new Headers();
    headers.set('Content-Type', obj.httpMetadata?.contentType || 'application/octet-stream');
    headers.set('Cache-Control', 'public, max-age=31536000');
    return new Response(obj.body, { headers });
  });

  return app;
}
