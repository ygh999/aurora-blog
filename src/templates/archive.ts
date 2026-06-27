import type { Post, Tag } from '../types';
import { layout } from './layout';

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function archivePage(posts: Post[], tags: Tag[]): string {
  // Group posts by year-month
  const groups: Record<string, Post[]> = {};
  for (const p of posts) {
    const d = new Date(p.created_at * 1000);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    if (!groups[key]) groups[key] = [];
    groups[key].push(p);
  }

  const archiveHtml = Object.entries(groups).sort((a,b) => b[0].localeCompare(a[0])).map(([key, items]) => `
    <div class="archive-group">
      <h3>${key}</h3>
      ${items.map(p => `
        <div class="archive-item">
          <a href="/post/${p.slug}" class="title">${p.title}</a>
          <span class="date">${formatDate(p.created_at)}</span>
        </div>`).join('')}
    </div>`).join('');

  const tagCloudHtml = tags.length > 0 ? `
    <h3 style="margin-top:2rem;color:var(--text-secondary)" data-i18n="archive.byTag">按标签</h3>
    <div class="tag-cloud">
      ${tags.map(t => `<a href="/?tag=${t.slug}" class="tag-badge">${t.name} (${t.count || 0})</a>`).join('')}
    </div>` : '';

  const html = `
  <div class="container">
    <h1 class="section-title" data-i18n="archive.title">文章归档</h1>
    ${archiveHtml || '<p style="color:var(--text-muted)">暂无文章</p>'}
    ${tagCloudHtml}
  </div>`;

  return layout('Archive', html, 'archive');
}
