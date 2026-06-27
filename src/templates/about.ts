import { layout } from './layout';

export function aboutPage(): string {
  const html = `
  <div class="container">
    <h1 class="section-title" data-i18n="about.title">关于</h1>
    <div class="about-content">
      <p data-i18n="about.content">这是一个基于 Cloudflare Workers 构建的轻量级技术博客，使用极光粒子和流星效果作为视觉主题。</p>
      <h2>Tech Stack</h2>
      <ul>
        <li>Cloudflare Workers + D1 + R2</li>
        <li>Hono (Web Framework)</li>
        <li>TypeScript</li>
        <li>Canvas Particle System</li>
      </ul>
      <h2>Features</h2>
      <ul>
        <li>极光粒子 + 流星背景效果</li>
        <li>明暗主题切换</li>
        <li>中英文 i18n</li>
        <li>Markdown 文章</li>
        <li>评论系统</li>
        <li>图片上传 (R2)</li>
      </ul>
    </div>
  </div>`;

  return layout('About', html, 'about');
}
