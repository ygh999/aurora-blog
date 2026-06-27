import type { Post, PaginatedResult } from '../types';
import { layout } from './layout';

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

function estimateReadTime(content: string): number {
  return Math.max(1, Math.ceil(content.length / 500));
}

export function homePage(posts: PaginatedResult<Post>): string {
  const postCards = posts.items.length === 0
    ? '<p style="color:var(--text-muted)" data-i18n="posts.empty">暂无文章</p>'
    : posts.items.map(p => `
    <div class="card" onclick="location.href='/post/${p.slug}'">
      ${p.tags && p.tags.length ? p.tags.map(t => `<span class="tag-badge">${t.name}</span>`).join('') : ''}
      <h3>${p.title}</h3>
      <p>${p.excerpt || p.content_md.slice(0, 150) + '...'}</p>
      <div class="meta">${formatDate(p.created_at)} &middot; ${estimateReadTime(p.content_md)} <span data-i18n="posts.minutes">分钟阅读</span> ${p.comment_count ? '&middot; ' + p.comment_count + ' comments' : ''}</div>
    </div>`).join('');

  const pagination = posts.pages > 1 ? `<div class="pagination">
    ${Array.from({length: posts.pages}, (_, i) => i + 1).map(p =>
      p === posts.page ? `<span class="current">${p}</span>` : `<a href="/?page=${p}">${p}</a>`
    ).join('')}
  </div>` : '';

  const html = `
  <section class="hero">
    <h1 data-i18n="hero.title">极光笔记</h1>
    <p class="subtitle" data-i18n="hero.subtitle">在代码与星辰之间，记录技术探索的每一个瞬间。</p>
    <div class="scroll">&#8595;</div>
  </section>
  <div class="container">
    <h2 class="section-title" data-i18n="posts.latest">最新文章</h2>
    ${postCards}
    ${pagination}
  </div>`;

  return layout('Home', html, 'home');
}
