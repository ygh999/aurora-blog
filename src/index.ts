import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types';
import { createAuthRoutes } from './routes/api-auth';
import { createPostRoutes } from './routes/api-posts';
import { createCommentRoutes } from './routes/api-comments';
import { createTagRoutes } from './routes/api-tags';
import { createUploadRoutes } from './routes/api-upload';
import { getPosts, getPostBySlug, getComments, getTags, getStats, getPendingComments, getPostById } from './db';
import { authMiddleware, getTokenFromRequest, verifyJWT } from './auth';
import { homePage } from './templates/home';
import { postDetailPage } from './templates/post-detail';
import { archivePage } from './templates/archive';
import { aboutPage } from './templates/about';
import { loginPage, adminDashboard, adminPostsPage, adminEditPage, adminCommentsPage } from './templates/admin';

const app = new Hono<{ Bindings: Env }>();

// CORS for API
app.use('/api/*', cors());

// API routes
app.route('/api/auth', createAuthRoutes());
app.route('/api/posts', createPostRoutes());
app.route('/api/comments', createCommentRoutes());
app.route('/api/tags', createTagRoutes());
app.route('/api/upload', createUploadRoutes());

// Health check
app.get('/api/health', (c) => c.json({ ok: true }));

// Helper: check admin auth for page routes
async function isAdmin(c: any): Promise<boolean> {
  // Also check query param token for admin pages
  const urlToken = c.req.query('token');
  const token = urlToken || getTokenFromRequest(c);
  if (!token) return false;
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  return !!payload;
}

// Public page routes
app.get('/', async (c) => {
  const page = parseInt(c.req.query('page') || '1');
  const tag = c.req.query('tag') || undefined;
  const posts = await getPosts(c.env.DB, page, 10, tag);
  return c.html(homePage(posts));
});

app.get('/post/:slug', async (c) => {
  const slug = c.req.param('slug');
  const post = await getPostBySlug(c.env.DB, slug);
  if (!post) return c.html('<h1>404</h1>', 404);
  const comments = await getComments(c.env.DB, post.id);
  return c.html(postDetailPage(post, comments));
});

app.get('/archive', async (c) => {
  const result = await getPosts(c.env.DB, 1, 1000);
  const tags = await getTags(c.env.DB);
  return c.html(archivePage(result.items, tags));
});

app.get('/about', (c) => c.html(aboutPage()));

// Admin routes
app.get('/admin/login', (c) => c.html(loginPage()));

app.get('/admin', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login');
  const stats = await getStats(c.env.DB);
  return c.html(adminDashboard(stats));
});

app.get('/admin/posts', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login');
  const result = await getPosts(c.env.DB, 1, 100, undefined, undefined);
  // Also get drafts
  const allPosts = await c.env.DB.prepare('SELECT * FROM posts ORDER BY created_at DESC').all();
  return c.html(adminPostsPage((allPosts.results || []) as any));
});

app.get('/admin/edit', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login');
  const tags = await getTags(c.env.DB);
  return c.html(adminEditPage(null, tags));
});

app.get('/admin/edit/:id', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login');
  const id = parseInt(c.req.param('id'));
  const post = await getPostById(c.env.DB, id);
  const tags = await getTags(c.env.DB);
  return c.html(adminEditPage(post, tags));
});

app.get('/admin/comments', async (c) => {
  if (!(await isAdmin(c))) return c.redirect('/admin/login');
  const comments = await getPendingComments(c.env.DB);
  return c.html(adminCommentsPage(comments));
});

// 404 fallback
app.notFound((c) => c.html('<h1 style="text-align:center;margin-top:10vh;color:#888">404 - Not Found</h1>', 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

export default app;
