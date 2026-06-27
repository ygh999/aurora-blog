import type { Post, Comment, Tag } from '../types';
import { layout } from './layout';

function formatDate(ts: number): string {
  const d = new Date(ts * 1000);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export function loginPage(): string {
  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Login - Aurora Blog</title>
<style>
@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Serif+SC:wght@400;600&display=swap);
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#0a0a14;--card-bg:rgba(255,255,255,0.025);--border:rgba(123,47,247,0.1);--accent:#00f5d4;--text-primary:#e8e8f0;--input-bg:rgba(255,255,255,0.05);--input-border:rgba(123,47,247,0.15)}
body{font-family:Inter,'Noto Serif SC',sans-serif;background:var(--bg);color:var(--text-primary);min-height:100vh;display:flex;align-items:center;justify-content:center}
.login-box{max-width:360px;width:100%;margin:2rem;padding:2rem;background:var(--card-bg);border:1px solid var(--border);border-radius:12px}
.login-box h2{text-align:center;margin-bottom:1.5rem;color:var(--accent)}
.login-box input{width:100%;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;padding:0.7rem 1rem;color:var(--text-primary);font-size:0.9rem;margin-bottom:0.8rem;font-family:inherit}
.login-box input:focus{outline:none;border-color:var(--accent)}
.btn{width:100%;background:var(--accent);color:#000;font-weight:600;padding:0.7rem;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem}
.error{color:#f72585;font-size:0.85rem;text-align:center;margin-bottom:0.8rem;display:none}
</style></head><body>
<div class="login-box">
  <h2>Aurora Blog</h2>
  <div class="error" id="err"></div>
  <input type="text" id="user" placeholder="Username" autocomplete="username">
  <input type="password" id="pass" placeholder="Password" autocomplete="current-password">
  <button class="btn" onclick="doLogin()">Login</button>
</div>
<script>
var theme=localStorage.getItem("theme")||"dark";document.documentElement.setAttribute("data-theme",theme);
function doLogin(){
  var u=document.getElementById("user").value,p=document.getElementById("pass").value;
  if(!u||!p)return;
  fetch("/api/auth/login",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({username:u,password:p})})
  .then(function(r){return r.json()})
  .then(function(d){if(d.token){localStorage.setItem("token",d.token);location.href="/admin?token="+d.token}else{
    document.getElementById("err").textContent=d.error||"Login failed";document.getElementById("err").style.display="block"}})
  .catch(function(){document.getElementById("err").textContent="Network error";document.getElementById("err").style.display="block"});
}
document.getElementById("pass").addEventListener("keydown",function(e){if(e.key==="Enter")doLogin()});
</script></body></html>`;
}

export function adminDashboard(stats: { posts: number; comments: number; pending: number; tags: number }): string {
  const html = `
  <div class="container">
    <div class="admin-header">
      <h1 class="section-title" data-i18n="admin.dashboard">仪表盘</h1>
      <div><a href="/admin/posts" class="btn-outline ctrl-btn" data-i18n="admin.posts">文章管理</a>
      <a href="/admin/comments" class="btn-outline ctrl-btn" data-i18n="admin.comments">评论管理</a>
      <a href="/admin/edit" class="btn" data-i18n="admin.newPost">新建文章</a></div>
    </div>
    <div class="stat-grid">
      <div class="stat-card"><div class="num">${stats.posts}</div><div class="label" data-i18n="admin.posts">文章</div></div>
      <div class="stat-card"><div class="num">${stats.comments}</div><div class="label" data-i18n="comment.title">评论</div></div>
      <div class="stat-card"><div class="num">${stats.pending}</div><div class="label" data-i18n="admin.pendingComments">待审核</div></div>
      <div class="stat-card"><div class="num">${stats.tags}</div><div class="label">标签</div></div>
    </div>
  </div>`;
  return layout('Admin', html);
}

export function adminPostsPage(posts: Post[]): string {
  const rows = posts.map(p => `
    <tr>
      <td><a href="/post/${p.slug}">${p.title}</a></td>
      <td><span class="status-badge status-${p.status}">${p.status}</span></td>
      <td>${formatDate(p.created_at)}</td>
      <td>
        <a href="/admin/edit/${p.id}" class="ctrl-btn">Edit</a>
        <button class="ctrl-btn btn-danger" onclick="deletePost(${p.id})">Delete</button>
      </td>
    </tr>`).join('');

  const html = `
  <div class="container">
    <div class="admin-header">
      <h1 class="section-title" data-i18n="admin.postList">文章列表</h1>
      <a href="/admin/edit" class="btn" data-i18n="admin.newPost">新建文章</a>
    </div>
    <table class="admin-table">
      <thead><tr><th data-i18n="admin.title">标题</th><th data-i18n="admin.status">状态</th><th>Date</th><th data-i18n="admin.actions">操作</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="4" style="color:var(--text-muted)">No posts</td></tr>'}</tbody>
    </table>
  </div>
  <script>
  function deletePost(id){if(!confirm(window._t("admin.confirmDelete")))return;
    fetch("/api/posts/"+id,{method:"DELETE",headers:{Authorization:"Bearer "+localStorage.getItem("token")}})
    .then(function(r){return r.json()}).then(function(){location.reload()})}
  </script>`;
  return layout('Admin Posts', html);
}

export function adminEditPage(post: Post | null, tags: Tag[]): string {
  const tagCheckboxes = tags.map(t => {
    const checked = post?.tags?.some(pt => pt.id === t.id) ? 'checked' : '';
    return `<label style="cursor:pointer;margin-right:0.8rem"><input type="checkbox" value="${t.id}" ${checked}> ${t.name}</label>`;
  }).join('');

  const html = `
  <div class="container">
    <h1 class="section-title">${post ? 'Edit Post' : 'New Post'}</h1>
    <div class="editor-meta">
      <input type="text" id="edTitle" placeholder="Title" value="${post?.title || ''}">
      <input type="text" id="edSlug" placeholder="slug" value="${post?.slug || ''}">
      <select id="edStatus"><option value="draft" ${post?.status==='draft'?'selected':''}>Draft</option><option value="published" ${post?.status==='published'?'selected':''}>Published</option></select>
    </div>
    <input type="text" id="edExcerpt" placeholder="Excerpt" value="${post?.excerpt || ''}" style="width:100%;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;padding:0.5rem 0.8rem;color:var(--text-primary);font-size:0.85rem;margin-bottom:0.8rem">
    <div style="margin-bottom:0.8rem">${tagCheckboxes || '<span style="color:var(--text-muted)">No tags. Create tags first.</span>'}</div>
    <div class="editor-area">
      <textarea class="editor-input" id="edContent" placeholder="Write Markdown here...">${post?.content_md || ''}</textarea>
      <div class="editor-preview post-content" id="edPreview"></div>
    </div>
    <div style="margin-top:1rem;display:flex;gap:0.8rem">
      <button class="btn" onclick="savePost()" data-i18n="admin.save">Save</button>
      <a href="/admin/posts" class="ctrl-btn">Cancel</a>
    </div>
  </div>
  <script>
  var postId=${post ? post.id : 'null'};
  var ed=document.getElementById("edContent");
  var preview=document.getElementById("edPreview");
  function updatePreview(){if(window.marked)preview.innerHTML=marked.parse(ed.value)}
  ed.addEventListener("input",updatePreview);updatePreview();
  document.getElementById("edTitle").addEventListener("input",function(){
    if(!postId)document.getElementById("edSlug").value=this.value.toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff]+/g,"-").replace(/^-|-$/g,"")});
  function savePost(){
    var title=document.getElementById("edTitle").value;
    var slug=document.getElementById("edSlug").value;
    var content=ed.value;
    var excerpt=document.getElementById("edExcerpt").value;
    var status=document.getElementById("edStatus").value;
    var tagIds=Array.from(document.querySelectorAll('input[type=checkbox]:checked')).map(function(c){return parseInt(c.value)});
    if(!title||!slug||!content){showToast("Please fill title, slug and content");return}
    var body=JSON.stringify({title,slug,content_md:content,excerpt,status,tags:tagIds});
    var url=postId?"/api/posts/"+postId:"/api/posts";
    var method=postId?"PUT":"POST";
    fetch(url,{method:method,headers:{"Content-Type":"application/json",Authorization:"Bearer "+localStorage.getItem("token")},
      body:body}).then(function(r){return r.json()}).then(function(d){
      if(d.id||d.ok){showToast("Saved!");if(!postId&&d.id)location.href="/admin/edit/"+d.id}
      else showToast(d.error||"Error")}).catch(function(){showToast("Network error")});
  }
  </script>`;
  return layout(post ? 'Edit Post' : 'New Post', html);
}

export function adminCommentsPage(comments: (Comment & { post_title: string })[]): string {
  const rows = comments.map(c => `
    <tr>
      <td>${c.nickname}</td>
      <td>${c.content.slice(0, 60)}...</td>
      <td><a href="/post/">${c.post_title}</a></td>
      <td><span class="status-badge status-${c.status}">${c.status}</span></td>
      <td>${formatDate(c.created_at)}</td>
      <td>
        ${c.status === 'pending' ? `<button class="ctrl-btn" onclick="moderate(${c.id},'approved')">Approve</button>
        <button class="ctrl-btn" onclick="moderate(${c.id},'rejected')">Reject</button>` : ''}
        <button class="ctrl-btn btn-danger" onclick="delComment(${c.id})">Delete</button>
      </td>
    </tr>`).join('');

  const html = `
  <div class="container">
    <div class="admin-header">
      <h1 class="section-title" data-i18n="admin.comments">评论管理</h1>
      <a href="/admin" class="ctrl-btn">Dashboard</a>
    </div>
    <table class="admin-table">
      <thead><tr><th>Author</th><th>Content</th><th>Post</th><th>Status</th><th>Date</th><th>Actions</th></tr></thead>
      <tbody>${rows || '<tr><td colspan="6" style="color:var(--text-muted)">No comments</td></tr>'}</tbody>
    </table>
  </div>
  <script>
  function moderate(id,status){
    fetch("/api/comments/"+id,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:"Bearer "+localStorage.getItem("token")},
      body:JSON.stringify({status:status})}).then(function(r){return r.json()}).then(function(){location.reload()})}
  function delComment(id){if(!confirm("Delete comment?"))
    fetch("/api/comments/"+id,{method:"DELETE",headers:{Authorization:"Bearer "+localStorage.getItem("token")}})
    .then(function(){location.reload()})}
  </script>`;
  return layout('Admin Comments', html);
}
