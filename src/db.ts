import type { Env, Post, Comment, Tag, PaginatedResult } from './types';

export async function getPosts(
  db: D1Database,
  page: number = 1,
  limit: number = 10,
  tag?: string,
  status?: string
): Promise<PaginatedResult<Post>> {
  const offset = (page - 1) * limit;
  let where = 'WHERE 1=1';
  const params: any[] = [];

  if (status) {
    where += ' AND p.status = ?';
    params.push(status);
  } else {
    where += " AND p.status = 'published'";
  }

  if (tag) {
    where += ' AND p.id IN (SELECT pt.post_id FROM post_tags pt JOIN tags t ON pt.tag_id = t.id WHERE t.slug = ?)';
    params.push(tag);
  }

  const countResult = await db.prepare(
    `SELECT COUNT(DISTINCT p.id) as total FROM posts p ${where}`
  ).bind(...params).first();
  const total = (countResult as any)?.total || 0;

  const posts = await db.prepare(
    `SELECT p.*, (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id AND c.status = 'approved') as comment_count
     FROM posts p ${where} ORDER BY p.created_at DESC LIMIT ? OFFSET ?`
  ).bind(...params, limit, offset).all();

  const items = (posts.results || []) as Post[];

  // Fetch tags for each post
  for (const post of items) {
    const tagRows = await db.prepare(
      'SELECT t.* FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?'
    ).bind(post.id).all();
    post.tags = (tagRows.results || []) as Tag[];
  }

  return { items, total, page, limit, pages: Math.ceil(total / limit) };
}

export async function getPostBySlug(db: D1Database, slug: string): Promise<Post | null> {
  const post = await db.prepare(
    'SELECT * FROM posts WHERE slug = ?'
  ).bind(slug).first() as Post | null;
  if (!post) return null;

  const tagRows = await db.prepare(
    'SELECT t.* FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?'
  ).bind(post.id).all();
  post.tags = (tagRows.results || []) as Tag[];

  const countResult = await db.prepare(
    "SELECT COUNT(*) as count FROM comments WHERE post_id = ? AND status = 'approved'"
  ).bind(post.id).first();
  post.comment_count = (countResult as any)?.count || 0;

  return post;
}

export async function getPostById(db: D1Database, id: number): Promise<Post | null> {
  const post = await db.prepare('SELECT * FROM posts WHERE id = ?').bind(id).first() as Post | null;
  if (!post) return null;
  const tagRows = await db.prepare(
    'SELECT t.* FROM tags t JOIN post_tags pt ON t.id = pt.tag_id WHERE pt.post_id = ?'
  ).bind(post.id).all();
  post.tags = (tagRows.results || []) as Tag[];
  return post;
}

export async function createPost(db: D1Database, data: Omit<Post, 'id' | 'view_count' | 'created_at' | 'updated_at'>): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO posts (title, slug, content_md, excerpt, cover_url, status) VALUES (?, ?, ?, ?, ?, ?)'
  ).bind(data.title, data.slug, data.content_md, data.excerpt || null, data.cover_url || null, data.status).run();
  return (result.meta as any).last_row_id;
}

export async function updatePost(db: D1Database, id: number, data: Partial<Post>): Promise<void> {
  const fields: string[] = [];
  const params: any[] = [];
  if (data.title !== undefined) { fields.push('title = ?'); params.push(data.title); }
  if (data.slug !== undefined) { fields.push('slug = ?'); params.push(data.slug); }
  if (data.content_md !== undefined) { fields.push('content_md = ?'); params.push(data.content_md); }
  if (data.excerpt !== undefined) { fields.push('excerpt = ?'); params.push(data.excerpt); }
  if (data.cover_url !== undefined) { fields.push('cover_url = ?'); params.push(data.cover_url); }
  if (data.status !== undefined) { fields.push('status = ?'); params.push(data.status); }
  fields.push('updated_at = unixepoch()');
  params.push(id);
  await db.prepare(`UPDATE posts SET ${fields.join(', ')} WHERE id = ?`).bind(...params).run();
}

export async function deletePost(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM posts WHERE id = ?').bind(id).run();
}

export async function incrementViewCount(db: D1Database, id: number): Promise<void> {
  await db.prepare('UPDATE posts SET view_count = view_count + 1 WHERE id = ?').bind(id).run();
}

export async function getComments(db: D1Database, postId: number, status?: string): Promise<Comment[]> {
  let query = 'SELECT * FROM comments WHERE post_id = ?';
  const params: any[] = [postId];
  if (status) { query += ' AND status = ?'; params.push(status); }
  else { query += " AND status = 'approved'"; }
  query += ' ORDER BY created_at ASC';
  const result = await db.prepare(query).bind(...params).all();
  return (result.results || []) as Comment[];
}

export async function createComment(db: D1Database, data: Omit<Comment, 'id' | 'created_at'>): Promise<number> {
  const result = await db.prepare(
    'INSERT INTO comments (post_id, parent_id, nickname, email, content, status, ip) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(data.post_id, data.parent_id || null, data.nickname, data.email || null, data.content, data.status || 'pending', data.ip || null).run();
  return (result.meta as any).last_row_id;
}

export async function getPendingComments(db: D1Database): Promise<(Comment & { post_title: string })[]> {
  const result = await db.prepare(
    "SELECT c.*, p.title as post_title FROM comments c JOIN posts p ON c.post_id = p.id WHERE c.status = 'pending' ORDER BY c.created_at DESC"
  ).all();
  return (result.results || []) as any;
}

export async function updateCommentStatus(db: D1Database, id: number, status: string): Promise<void> {
  await db.prepare('UPDATE comments SET status = ? WHERE id = ?').bind(status, id).run();
}

export async function deleteComment(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM comments WHERE id = ?').bind(id).run();
}

export async function getTags(db: D1Database): Promise<Tag[]> {
  const result = await db.prepare(
    'SELECT t.*, (SELECT COUNT(*) FROM post_tags pt WHERE pt.tag_id = t.id) as count FROM tags t ORDER BY count DESC'
  ).all();
  return (result.results || []) as Tag[];
}

export async function createTag(db: D1Database, name: string, slug: string): Promise<number> {
  const result = await db.prepare('INSERT INTO tags (name, slug) VALUES (?, ?)').bind(name, slug).run();
  return (result.meta as any).last_row_id;
}

export async function deleteTag(db: D1Database, id: number): Promise<void> {
  await db.prepare('DELETE FROM post_tags WHERE tag_id = ?').bind(id).run();
  await db.prepare('DELETE FROM tags WHERE id = ?').bind(id).run();
}

export async function setPostTags(db: D1Database, postId: number, tagIds: number[]): Promise<void> {
  await db.prepare('DELETE FROM post_tags WHERE post_id = ?').bind(postId).run();
  for (const tagId of tagIds) {
    await db.prepare('INSERT INTO post_tags (post_id, tag_id) VALUES (?, ?)').bind(postId, tagId).run();
  }
}

export async function getStats(db: D1Database): Promise<{ posts: number; comments: number; pending: number; tags: number }> {
  const posts = await db.prepare('SELECT COUNT(*) as c FROM posts').first() as any;
  const comments = await db.prepare('SELECT COUNT(*) as c FROM comments').first() as any;
  const pending = await db.prepare("SELECT COUNT(*) as c FROM comments WHERE status = 'pending'").first() as any;
  const tags = await db.prepare('SELECT COUNT(*) as c FROM tags').first() as any;
  return { posts: posts?.c || 0, comments: comments?.c || 0, pending: pending?.c || 0, tags: tags?.c || 0 };
}
