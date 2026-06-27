import type { Context, Next } from 'hono';
import type { Env, JWTPayload } from './types';

async function getKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signJWT(payload: JWTPayload, secret: string): Promise<string> {
  const key = await getKey(secret);
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const body = btoa(JSON.stringify(payload)).replace(/=/g, '');
  const data = `${header}.${body}`;
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const signature = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${data}.${signature}`;
}

export async function verifyJWT(token: string, secret: string): Promise<JWTPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const key = await getKey(secret);
    const data = `${parts[0]}.${parts[1]}`;
    const sig = Uint8Array.from(atob(parts[2].replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0));
    const valid = await crypto.subtle.verify('HMAC', key, sig, new TextEncoder().encode(data));
    if (!valid) return null;
    const payload = JSON.parse(atob(parts[1])) as JWTPayload;
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch { return null; }
}

export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  const saltStr = btoa(String.fromCharCode(...salt));
  return `${saltStr}:${hash}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltStr, hashStr] = stored.split(':');
  const salt = Uint8Array.from(atob(saltStr), c => c.charCodeAt(0));
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt, iterations: 100000, hash: 'SHA-256' }, key, 256);
  const hash = btoa(String.fromCharCode(...new Uint8Array(bits)));
  return hash === hashStr;
}

export function getTokenFromRequest(c: Context): string | null {
  const auth = c.req.header('Authorization');
  if (auth?.startsWith('Bearer ')) return auth.slice(7);
  const cookie = c.req.header('Cookie');
  if (cookie) {
    const match = cookie.match(/token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

export async function authMiddleware(c: Context<{ Bindings: Env }>, next: Next) {
  const token = getTokenFromRequest(c);
  if (!token) return c.json({ error: 'Unauthorized' }, 401);
  const payload = await verifyJWT(token, c.env.JWT_SECRET);
  if (!payload) return c.json({ error: 'Invalid token' }, 401);
  c.set('user', payload);
  await next();
}
