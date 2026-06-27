import type { Post, Comment } from '../types';
import { layout } from './layout';

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function postDetailPage(post: Post, comments: Comment[]): string {
  const tagHtml = (post.tags || []).map(t => `<span class="tag-badge">${t.name}</span>`).join('');
  const commentList = comments.length === 0
    ? '<p style="color:var(--text-muted)" data-i18n="comment.empty">暂无评论</p>'
    : comments.map(c => `
    <div class="comment-item">
      <div class="comment-header">
        <span class="nickname">${c.nickname}</span>
        <span class="comment-time">${formatDate(c.created_at)}</span>
      </div>
      <div class="comment-body">${c.content}</div>
    </div>`).join('');

  const html = `
  <div class="container">
    <article>
      ${tagHtml ? '<div style="margin-bottom:0.8rem">' + tagHtml + '</div>' : ''}
      <h1 style="font-family:'Noto Serif SC',serif;font-size:clamp(1.8rem,4vw,2.5rem);margin-bottom:0.5rem;color:var(--text-primary);text-wrap:balance">${post.title}</h1>
      <div class="meta" style="margin-bottom:2rem">${formatDate(post.created_at)} &middot; ${post.view_count} views</div>
      ${post.cover_url ? `<img src="${post.cover_url}" alt="" style="width:100%;max-height:400px;object-fit:cover;border-radius:var(--radius);margin-bottom:2rem">` : ''}
      <div class="post-content md-render" id="postContent">${post.content_md}</div>
    </article>
    <section style="margin-top:3rem">
      <h2 class="section-title" data-i18n="comment.title">评论 (${comments.length})</h2>
      <div id="commentList">${commentList}</div>
      <div class="comment-form">
        <h3 style="margin-bottom:1rem;font-size:1.1rem" data-i18n="comment.title">发表评论</h3>
        <input type="text" id="cNickname" data-i18n-placeholder="comment.name" placeholder="昵称" required>
        <input type="email" id="cEmail" data-i18n-placeholder="comment.email" placeholder="邮箱（可选）">
        <textarea id="cContent" data-i18n-placeholder="comment.content" placeholder="写下你的评论..." required></textarea>
        <button class="btn" onclick="submitComment(${post.id})" data-i18n="comment.submit">提交评论</button>
      </div>
    </section>
  </div>
  <script>
  function submitComment(postId){
    var nickname=document.getElementById("cNickname").value;
    var email=document.getElementById("cEmail").value;
    var content=document.getElementById("cContent").value;
    if(!nickname||!content){showToast("Please fill in required fields");return}
    fetch("/api/comments/posts/"+postId+"/comments",{method:"POST",headers:{"Content-Type":"application/json"},
      body:JSON.stringify({nickname,email,content})})
    .then(function(r){return r.json()})
    .then(function(d){if(d.id){showToast(window._t("comment.success"));document.getElementById("cContent").value=""}else{showToast(d.error||"Error")}})
    .catch(function(){showToast("Network error")});
  }
  // Render markdown content
  if(window.marked){var el=document.getElementById("postContent");if(el)el.innerHTML=marked.parse(el.textContent)}
  </script>`;

  return layout(post.title, html);
}
