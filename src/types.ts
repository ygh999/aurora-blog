export interface Env {
  DB: D1Database;
  R2: R2Bucket;
  CACHE: KVNamespace;
  JWT_SECRET: string;
  ADMIN_PASSWORD: string;
}

export interface User {
  id: number;
  username: string;
  password_hash: string;
  created_at: number;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  content_md: string;
  excerpt: string | null;
  cover_url: string | null;
  status: 'draft' | 'published';
  view_count: number;
  created_at: number;
  updated_at: number;
  tags?: Tag[];
  comment_count?: number;
}

export interface Comment {
  id: number;
  post_id: number;
  parent_id: number | null;
  nickname: string;
  email: string | null;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  ip: string | null;
  created_at: number;
}

export interface Tag {
  id: number;
  name: string;
  slug: string;
  count?: number;
}

export interface PostTag {
  post_id: number;
  tag_id: number;
}

export interface JWTPayload {
  sub: number;
  username: string;
  exp: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
