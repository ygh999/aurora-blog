import { Hono } from 'hono';
import type { Env } from '../types';
import { signJWT, hashPassword, verifyPassword, authMiddleware } from '../auth';

export function createAuthRoutes() {
  const app = new Hono<{ Bindings: Env }>();

  app.post('/login', async (c) => {
    const { username, password } = await c.req.json();
    if (!username || !password) return c.json({ error: 'Missing credentials' }, 400);

    const db = c.env.DB;
    const user = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();

    if (!user) {
      // First login: create admin user
      const adminPass = c.env.ADMIN_PASSWORD;
      if (password !== adminPass) return c.json({ error: 'Invalid password' }, 401);
      const hash = await hashPassword(password);
      await db.prepare('INSERT INTO users (username, password_hash) VALUES (?, ?)').bind(username, hash).run();
      const newUser = await db.prepare('SELECT * FROM users WHERE username = ?').bind(username).first();
      const token = await signJWT({ sub: (newUser as any).id, username, exp: Math.floor(Date.now() / 1000) + 86400 * 7 }, c.env.JWT_SECRET);
      return c.json({ token, user: { id: (newUser as any).id, username } });
    }

    const valid = await verifyPassword(password, (user as any).password_hash);
    if (!valid) return c.json({ error: 'Invalid password' }, 401);

    const token = await signJWT({ sub: (user as any).id, username, exp: Math.floor(Date.now() / 1000) + 86400 * 7 }, c.env.JWT_SECRET);
    return c.json({ token, user: { id: (user as any).id, username } });
  });

  app.post('/logout', (c) => c.json({ ok: true }));

  app.get('/me', authMiddleware, (c) => {
    const user = c.get('user' as any);
    return c.json({ user });
  });

  return app;
}
