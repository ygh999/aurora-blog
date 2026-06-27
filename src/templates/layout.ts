import type { Post, Tag } from '../types';

const CSS = `
@import url(https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Noto+Serif+SC:wght@400;600;700&display=swap);
*{margin:0;padding:0;box-sizing:border-box}
:root{
  --bg:#0a0a14;--surface:rgba(255,255,255,0.025);--border:rgba(123,47,247,0.1);
  --border-hover:rgba(0,245,212,0.25);--accent:#00f5d4;--accent2:#7b2ff7;--accent3:#f72585;
  --text-primary:#e8e8f0;--text-secondary:#8888aa;--text-muted:#555570;
  --radius:12px;--ease:cubic-bezier(0.16,1,0.3,1);
  --nav-bg:rgba(10,10,20,0.92);--card-bg:rgba(255,255,255,0.025);
  --input-bg:rgba(255,255,255,0.05);--input-border:rgba(123,47,247,0.15);
  --shadow:none;
}
:root[data-theme="light"]{
  --bg:#f4f5f7;--surface:rgba(0,0,0,0.02);--border:rgba(0,0,0,0.08);
  --border-hover:rgba(0,137,123,0.3);--accent:#00897b;--accent2:#5e35b1;--accent3:#c2185b;
  --text-primary:#1a1a2e;--text-secondary:#555570;--text-muted:#888;
  --nav-bg:rgba(244,245,247,0.92);--card-bg:rgba(255,255,255,0.7);
  --input-bg:rgba(255,255,255,0.8);--input-border:rgba(0,0,0,0.1);
  --shadow:0 1px 3px rgba(0,0,0,0.06);
}
body{font-family:Inter,'Noto Serif SC',sans-serif;background:var(--bg);color:var(--text-primary);overflow-x:hidden;-webkit-font-smoothing:antialiased;line-height:1.6}
canvas#bg{position:fixed;top:0;left:0;width:100%;height:100%;z-index:0;pointer-events:none}
.wrap{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column}
nav{position:fixed;top:0;width:100%;display:flex;justify-content:space-between;align-items:center;padding:0.8rem 2.5rem;background:var(--nav-bg);border-bottom:1px solid var(--border);z-index:100}
nav .logo{font-family:'Noto Serif SC',serif;font-size:1.3rem;font-weight:700;color:var(--accent);text-decoration:none}
nav .nav-links{list-style:none;display:flex;gap:1.5rem;align-items:center}
nav .nav-links a{color:var(--text-secondary);text-decoration:none;font-size:0.875rem;font-weight:500;transition:color 0.2s;cursor:pointer}
nav .nav-links a:hover,nav .nav-links a.active{color:var(--accent)}
nav .nav-controls{display:flex;gap:0.8rem;align-items:center}
.ctrl-btn{background:var(--surface);border:1px solid var(--border);color:var(--text-secondary);padding:0.35rem 0.6rem;border-radius:8px;cursor:pointer;font-size:0.8rem;transition:all 0.2s var(--ease)}
.ctrl-btn:hover{border-color:var(--border-hover);color:var(--accent)}
main{flex:1;padding-top:3.5rem}
.container{max-width:860px;margin:0 auto;padding:2rem}
footer{text-align:center;padding:2rem;color:var(--text-muted);font-size:0.8rem;border-top:1px solid var(--border);margin-top:auto}
a{color:var(--accent);text-decoration:none}
a:hover{text-decoration:underline}
.hero{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:85vh;text-align:center;padding:2rem;gap:1rem}
.hero h1{font-family:'Noto Serif SC',serif;font-size:clamp(2.2rem,5vw,3.8rem);font-weight:700;color:var(--accent);text-shadow:0 0 40px rgba(0,245,212,0.25);text-wrap:balance}
.hero .subtitle{font-size:1.05rem;color:var(--text-secondary);max-width:480px;line-height:1.8;text-wrap:pretty}
.hero .scroll{margin-top:2rem;color:var(--text-muted);font-size:1.3rem;animation:float 3s var(--ease) infinite}
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(8px)}}
.section-title{font-family:'Noto Serif SC',serif;font-size:1.6rem;margin-bottom:2rem;color:var(--text-primary);text-wrap:balance}
.card{background:var(--card-bg);border:1px solid var(--border);border-radius:var(--radius);padding:1.5rem 1.75rem;margin-bottom:1.25rem;transition:border-color 0.25s var(--ease),transform 0.25s var(--ease),box-shadow 0.25s;cursor:pointer;box-shadow:var(--shadow)}
.card:hover{border-color:var(--border-hover);transform:translateY(-2px)}
.tag-badge{display:inline-block;font-size:0.7rem;font-weight:600;color:var(--accent);background:rgba(0,245,212,0.08);padding:0.15rem 0.6rem;border-radius:6px;margin-right:0.4rem;margin-bottom:0.4rem}
.card h3{font-family:'Noto Serif SC',serif;font-size:1.15rem;font-weight:600;margin-bottom:0.4rem;color:var(--text-primary)}
.card p{font-size:0.9rem;color:var(--text-secondary);line-height:1.7}
.card .meta{margin-top:0.7rem;font-size:0.78rem;color:var(--text-muted)}
.post-content{line-height:1.9;font-size:1rem}
.post-content h1,.post-content h2,.post-content h3{font-family:'Noto Serif SC',serif;margin:2rem 0 1rem;color:var(--text-primary)}
.post-content h1{font-size:1.8rem} .post-content h2{font-size:1.5rem} .post-content h3{font-size:1.25rem}
.post-content p{margin-bottom:1rem}
.post-content code{background:var(--surface);padding:0.15rem 0.4rem;border-radius:4px;font-size:0.9em;font-family:'Courier New',monospace}
.post-content pre{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:1rem;overflow-x:auto;margin:1rem 0}
.post-content pre code{background:none;padding:0}
.post-content img{max-width:100%;border-radius:8px;margin:1rem 0}
.post-content blockquote{border-left:3px solid var(--accent);padding-left:1rem;color:var(--text-secondary);margin:1rem 0}
.post-content a{color:var(--accent)}
.post-content ul,.post-content ol{padding-left:1.5rem;margin-bottom:1rem}
.comment-form{margin-top:2rem}
.comment-form input,.comment-form textarea{width:100%;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;padding:0.7rem 1rem;color:var(--text-primary);font-size:0.9rem;font-family:inherit;margin-bottom:0.8rem;transition:border-color 0.2s}
.comment-form input:focus,.comment-form textarea:focus{outline:none;border-color:var(--accent)}
.comment-form textarea{min-height:100px;resize:vertical}
.btn{display:inline-block;background:var(--accent);color:#000;font-weight:600;padding:0.6rem 1.5rem;border:none;border-radius:8px;cursor:pointer;font-size:0.9rem;transition:opacity 0.2s}
.btn:hover{opacity:0.85}
.btn-outline{background:transparent;border:1px solid var(--border);color:var(--text-secondary)}
.btn-outline:hover{border-color:var(--accent);color:var(--accent)}
.btn-danger{background:var(--accent3);color:#fff}
.comment-item{padding:1rem 0;border-bottom:1px solid var(--border)}
.comment-item .comment-header{display:flex;justify-content:space-between;margin-bottom:0.5rem}
.comment-item .nickname{font-weight:600;color:var(--text-primary);font-size:0.9rem}
.comment-item .comment-time{font-size:0.75rem;color:var(--text-muted)}
.comment-item .comment-body{font-size:0.9rem;color:var(--text-secondary);line-height:1.7}
.pagination{display:flex;gap:0.5rem;justify-content:center;margin-top:2rem}
.pagination a,.pagination span{padding:0.4rem 0.8rem;border:1px solid var(--border);border-radius:6px;font-size:0.85rem;color:var(--text-secondary)}
.pagination span.current{background:var(--accent);color:#000;border-color:var(--accent)}
.archive-group h3{font-family:'Noto Serif SC',serif;color:var(--accent);margin:2rem 0 1rem;font-size:1.2rem}
.archive-item{display:flex;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border)}
.archive-item .title{color:var(--text-primary);font-size:0.95rem}
.archive-item .date{color:var(--text-muted);font-size:0.8rem}
.tag-cloud{display:flex;flex-wrap:wrap;gap:0.5rem;margin:1.5rem 0}
.tag-cloud .tag-badge{cursor:pointer;font-size:0.8rem;padding:0.3rem 0.8rem}
.admin-table{width:100%;border-collapse:collapse;margin-top:1rem}
.admin-table th,.admin-table td{text-align:left;padding:0.7rem 1rem;border-bottom:1px solid var(--border);font-size:0.85rem}
.admin-table th{color:var(--text-muted);font-weight:600;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.05em}
.admin-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem}
.editor-area{display:grid;grid-template-columns:1fr 1fr;gap:1rem;min-height:500px}
.editor-input{width:100%;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;padding:1rem;color:var(--text-primary);font-family:'Courier New',monospace;font-size:0.9rem;resize:vertical;min-height:500px;line-height:1.6}
.editor-preview{background:var(--card-bg);border:1px solid var(--border);border-radius:8px;padding:1.5rem;overflow-y:auto}
.editor-meta{display:flex;gap:1rem;margin-bottom:1rem;flex-wrap:wrap}
.editor-meta input,.editor-meta select{background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;padding:0.5rem 0.8rem;color:var(--text-primary);font-size:0.85rem;font-family:inherit}
.editor-meta input{flex:1;min-width:200px}
.status-badge{display:inline-block;font-size:0.7rem;font-weight:600;padding:0.15rem 0.5rem;border-radius:4px}
.status-published{background:rgba(0,245,212,0.1);color:var(--accent)}
.status-draft{background:rgba(255,200,0,0.1);color:#ff9800}
.status-pending{background:rgba(255,200,0,0.1);color:#ff9800}
.status-approved{background:rgba(0,245,212,0.1);color:var(--accent)}
.status-rejected{background:rgba(247,37,133,0.1);color:var(--accent3)}
.about-content{line-height:1.9}
.about-content h2{font-family:'Noto Serif SC',serif;font-size:1.5rem;margin:2rem 0 1rem;color:var(--accent)}
.stat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:1rem;margin:1.5rem 0}
.stat-card{background:var(--card-bg);border:1px solid var(--border);border-radius:var(--radius);padding:1.2rem;text-align:center}
.stat-card .num{font-size:2rem;font-weight:700;color:var(--accent)}
.stat-card .label{font-size:0.8rem;color:var(--text-muted);margin-top:0.3rem}
.login-box{max-width:360px;margin:8rem auto;padding:2rem;background:var(--card-bg);border:1px solid var(--border);border-radius:var(--radius)}
.login-box h2{text-align:center;margin-bottom:1.5rem;color:var(--accent)}
.login-box input{width:100%;background:var(--input-bg);border:1px solid var(--input-border);border-radius:8px;padding:0.7rem 1rem;color:var(--text-primary);font-size:0.9rem;margin-bottom:0.8rem}
.login-box .btn{width:100%}
.toast{position:fixed;top:5rem;right:2rem;background:var(--accent);color:#000;padding:0.8rem 1.2rem;border-radius:8px;font-size:0.85rem;font-weight:600;z-index:200;transform:translateX(120%);transition:transform 0.3s var(--ease)}
.toast.show{transform:translateX(0)}
@media(max-width:768px){
  nav{padding:0.6rem 1rem}
  nav .nav-links{gap:0.8rem}
  .container{padding:1.5rem 1rem}
  .hero{min-height:70vh;padding:1.5rem}
  .editor-area{grid-template-columns:1fr}
  .editor-meta{flex-direction:column}
  .admin-table{font-size:0.78rem}
  .admin-table th,.admin-table td{padding:0.5rem}
}
@media(prefers-reduced-motion:reduce){
  .hero .scroll{animation:none}
  .card{transition:none}
  .card:hover{transform:none}
}
`;

const I18N = `window._i18n={zh:{
'nav.home':'首页','nav.posts':'文章','nav.archive':'归档','nav.about':'关于','nav.admin':'管理',
'hero.title':'极光笔记','hero.subtitle':'在代码与星辰之间，记录技术探索的每一个瞬间。',
'scroll':'向下滚动',
'posts.latest':'最新文章','posts.readMore':'阅读全文','posts.minutes':'分钟阅读','posts.empty':'暂无文章',
'archive.title':'文章归档','archive.byTag':'按标签',
'about.title':'关于','about.content':'这是一个基于 Cloudflare Workers 构建的轻量级技术博客，使用极光粒子和流星效果作为视觉主题。',
'comment.title':'评论','comment.name':'昵称','comment.email':'邮箱（可选）','comment.content':'写下你的评论...','comment.submit':'提交评论','comment.submitting':'提交中...','comment.success':'评论已提交，等待审核','comment.empty':'暂无评论','comment.reply':'回复',
'admin.dashboard':'仪表盘','admin.posts':'文章管理','admin.comments':'评论管理','admin.newPost':'新建文章','admin.editPost':'编辑文章','admin.postList':'文章列表','admin.pendingComments':'待审核评论','admin.allComments':'所有评论','admin.title':'标题','admin.slug':'Slug','admin.excerpt':'摘要','admin.status':'状态','admin.actions':'操作','admin.save':'保存','admin.delete':'删除','admin.approve':'通过','admin.reject':'拒绝','admin.published':'已发布','admin.draft':'草稿','admin.login':'登录','admin.username':'用户名','admin.password':'密码','admin.logout':'退出登录','admin.confirmDelete':'确认删除？','admin.noComments':'暂无待审核评论',
'theme.dark':'暗色','theme.light':'亮色',
'lang.zh':'中','lang.en':'EN',
'footer':'Powered by Cloudflare Workers'
},en:{
'nav.home':'Home','nav.posts':'Posts','nav.archive':'Archive','nav.about':'About','nav.admin':'Admin',
'hero.title':'Aurora Notes','hero.subtitle':'Between code and stardust, recording every moment of technical exploration.',
'scroll':'Scroll down',
'posts.latest':'Latest Posts','posts.readMore':'Read More','posts.minutes':'min read','posts.empty':'No posts yet',
'archive.title':'Archive','archive.byTag':'By Tag',
'about.title':'About','about.content':'A lightweight tech blog built on Cloudflare Workers, featuring aurora particles and shooting star effects.',
'comment.title':'Comments','comment.name':'Nickname','comment.email':'Email (optional)','comment.content':'Write your comment...','comment.submit':'Submit','comment.submitting':'Submitting...','comment.success':'Comment submitted, awaiting moderation','comment.empty':'No comments yet','comment.reply':'Reply',
'admin.dashboard':'Dashboard','admin.posts':'Posts','admin.comments':'Comments','admin.newPost':'New Post','admin.editPost':'Edit Post','admin.postList':'Post List','admin.pendingComments':'Pending Comments','admin.allComments':'All Comments','admin.title':'Title','admin.slug':'Slug','admin.excerpt':'Excerpt','admin.status':'Status','admin.actions':'Actions','admin.save':'Save','admin.delete':'Delete','admin.approve':'Approve','admin.reject':'Reject','admin.published':'Published','admin.draft':'Draft','admin.login':'Login','admin.username':'Username','admin.password':'Password','admin.logout':'Logout','admin.confirmDelete':'Confirm delete?','admin.noComments':'No pending comments',
'theme.dark':'Dark','theme.light':'Light',
'lang.zh':'中','lang.en':'EN',
'footer':'Powered by Cloudflare Workers'
}};`;

const PARTICLES = `(function(){
var c=document.getElementById("bg");if(!c)return;var x=c.getContext("2d"),W,H,pts=[],shoots=[];
var rm=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
var N=rm?40:100,COLS=["#00f5d4","#7b2ff7","#f72585","#4361ee","#4cc9f0"];
function rs(){W=c.width=innerWidth;H=c.height=innerHeight}addEventListener("resize",rs);rs();
var mx=-9999,my=-9999;addEventListener("mousemove",function(e){mx=e.clientX;my=e.clientY});
function Pt(){this.x=Math.random()*W;this.y=Math.random()*H;this.r=Math.random()*2.5+0.8;
this.vx=(Math.random()-.5)*.5;this.vy=(Math.random()-.5)*.5;
this.col=COLS[Math.floor(Math.random()*COLS.length)];
this.a=Math.random()*.35+.15;this.ph=Math.random()*6.28;this.sp=Math.random()*.02+.005}
Pt.prototype.up=function(){this.x+=this.vx;this.y+=this.vy;this.ph+=this.sp;
var dx=mx-this.x,dy=my-this.y,d=Math.sqrt(dx*dx+dy*dy);
if(d<150){var f=(150-d)/150*.012;this.vx-=dx*f;this.vy-=dy*f}
if(this.x<0||this.x>W)this.vx*=-1;if(this.y<0||this.y>H)this.vy*=-1};
Pt.prototype.dr=function(){var a=this.a+Math.sin(this.ph)*.12;
x.globalAlpha=Math.max(0,a);x.beginPath();x.arc(this.x,this.y,this.r,0,6.28);x.fillStyle=this.col;x.fill();
if(!rm){x.beginPath();x.arc(this.x,this.y,this.r*3,0,6.28);
var g=x.createRadialGradient(this.x,this.y,0,this.x,this.y,this.r*3);
g.addColorStop(0,this.col);g.addColorStop(1,"transparent");x.fillStyle=g;x.globalAlpha=a*.2;x.fill()}x.globalAlpha=1};
for(var i=0;i<N;i++)pts.push(new Pt());
function Shoot(){this.reset()}Shoot.prototype.reset=function(){
this.x=Math.random()*W*.7;this.y=Math.random()*H*.25;this.vx=3.5+Math.random()*3.5;this.vy=1.5+Math.random()*2;
this.len=50+Math.random()*70;this.a=1;this.decay=0.012+Math.random()*0.008;this.alive=true;this.delay=Math.random()*500};
Shoot.prototype.up=function(){if(this.delay>0){this.delay--;return}this.x+=this.vx;this.y+=this.vy;this.a-=this.decay;if(this.a<=0)this.alive=false};
Shoot.prototype.dr=function(){if(this.delay>0||!this.alive)return;
x.beginPath();x.moveTo(this.x,this.y);var tx=this.x-this.vx*this.len*.15,ty=this.y-this.vy*this.len*.15;x.lineTo(tx,ty);
var g=x.createLinearGradient(this.x,this.y,tx,ty);g.addColorStop(0,"rgba(200,230,255,"+this.a+")");g.addColorStop(1,"transparent");
x.strokeStyle=g;x.lineWidth=1.2;x.stroke();
x.beginPath();x.arc(this.x,this.y,1.5,0,6.28);x.fillStyle="rgba(220,240,255,"+this.a+")";x.fill()};
if(!rm){for(var i=0;i<4;i++){var s=new Shoot();s.reset();shoots.push(s)}}
function aurora(t){x.globalAlpha=.05;
for(var l=0;l<3;l++){x.beginPath();var yb=H*.28+l*50;x.moveTo(0,yb);
for(var px=0;px<=W;px+=6){var y=yb+Math.sin(px*.003+t*.0006+l)*70+Math.sin(px*.006+t*.001)*35;x.lineTo(px,y)}
x.lineTo(W,H);x.lineTo(0,H);x.closePath();
var gd=x.createLinearGradient(0,yb-80,0,H);
if(l===0){gd.addColorStop(0,"#00f5d4");gd.addColorStop(1,"transparent")}
else if(l===1){gd.addColorStop(0,"#7b2ff7");gd.addColorStop(1,"transparent")}
else{gd.addColorStop(0,"#f72585");gd.addColorStop(1,"transparent")}
x.fillStyle=gd;x.fill()}x.globalAlpha=1}
function lines(){for(var i=0;i<pts.length;i++)for(var j=i+1;j<pts.length;j++){
var dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y,d=Math.sqrt(dx*dx+dy*dy);
if(d<100){x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);
x.strokeStyle="#7b2ff7";x.globalAlpha=(1-d/100)*.08;x.lineWidth=.4;x.stroke();x.globalAlpha=1}}}
var t=0;(function go(){x.clearRect(0,0,W,H);t++;aurora(t);
for(var i=0;i<pts.length;i++){pts[i].up();pts[i].dr()}lines();
for(var i=0;i<shoots.length;i++){shoots[i].up();shoots[i].dr();if(!shoots[i].alive)shoots[i].reset()}
requestAnimationFrame(go)})();})();`;

const THEME_I18N = `(function(){
var theme=localStorage.getItem("theme")||"dark";
var lang=localStorage.getItem("lang")||"zh";
document.documentElement.setAttribute("data-theme",theme);
document.documentElement.setAttribute("data-lang",lang);
window._t=function(k){return(window._i18n&&window._i18n[lang]&&window._i18n[lang][k])||k};
window._lang=lang;
window._setTheme=function(t){localStorage.setItem("theme",t);document.documentElement.setAttribute("data-theme",t)};
window._setLang=function(l){localStorage.setItem("lang",l);document.documentElement.setAttribute("data-lang",l);window._lang=l;
document.querySelectorAll("[data-i18n]").forEach(function(el){var k=el.getAttribute("data-i18n");el.textContent=window._t(k)});
document.querySelectorAll("[data-i18n-placeholder]").forEach(function(el){var k=el.getAttribute("data-i18n-placeholder");el.placeholder=window._t(k)});
};
})();`;

export function layout(title: string, content: string, activeNav?: string): string {
  const navItems = [
    { href: '/', key: 'nav.home', id: 'home' },
    { href: '/archive', key: 'nav.archive', id: 'archive' },
    { href: '/about', key: 'nav.about', id: 'about' },
  ];
  const navHtml = navItems.map(n =>
    `<li><a href="${n.href}" class="${activeNav === n.id ? 'active' : ''}" data-i18n="${n.key}">${n.key}</a></li>`
  ).join('');

  return `<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark" data-lang="zh">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${title} - Aurora Blog</title>
<style>${CSS}</style>
</head>
<body>
<canvas id="bg"></canvas>
<div class="wrap">
<nav>
  <a href="/" class="logo">Aurora Blog</a>
  <ul class="nav-links">${navHtml}</ul>
  <div class="nav-controls">
    <button class="ctrl-btn" onclick="_setTheme(document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark')" id="themeBtn">&#9790;</button>
    <button class="ctrl-btn" onclick="_setLang(window._lang==='zh'?'en':'zh')" id="langBtn">EN</button>
  </div>
</nav>
<main>${content}</main>
<footer><span data-i18n="footer">Powered by Cloudflare Workers</span> &middot; Aurora Blog 2026</footer>
</div>
<div class="toast" id="toast"></div>
<script>${I18N}</script>
<script>${THEME_I18N}</script>
<script>${PARTICLES}</script>
<script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
<script>
function showToast(msg){var t=document.getElementById("toast");t.textContent=msg;t.classList.add("show");setTimeout(function(){t.classList.remove("show")},3000)}
function renderMd(el){if(window.marked)el.innerHTML=marked.parse(el.textContent)}
document.querySelectorAll(".md-render").forEach(renderMd);
</script>
</body>
</html>`;
}
