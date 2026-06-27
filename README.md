# Aurora Blog

全功能个人博客系统，基于 Cloudflare Workers + D1 + R2，极光粒子 + 流星效果。

## 特性

- **极光粒子 + 流星**：Canvas 粒子系统，鼠标交互，reduced-motion 支持
- **明暗主题**：CSS 变量驱动，localStorage 持久化
- **中英文 i18n**：一键切换，全站文本翻译
- **Markdown 编辑器**：实时预览，代码高亮
- **评论系统**：访客评论 + 管理员审核
- **标签分类**：文章标签管理
- **图片上传**：R2 对象存储
- **管理后台**：仪表盘、文章管理、评论管理
- **JWT 认证**：PBKDF2 密码哈希

## 技术栈

- Runtime: Cloudflare Workers
- Framework: Hono
- Database: D1 (SQLite)
- Storage: R2
- Language: TypeScript
- Frontend: 内嵌 HTML + Canvas 粒子 + marked.js

## 开发

```bash
npm install
npm run db:init:local   # 初始化本地 D1
npm run dev             # 本地开发 http://localhost:8787
```

## 部署

```bash
# 1. 创建远程 D1 数据库
npx wrangler d1 create aurora-blog-db

# 2. 更新 wrangler.jsonc 中的 database_id

# 3. 创建 R2 Bucket
npx wrangler r2 bucket create aurora-blog-assets

# 4. 设置密钥
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_PASSWORD

# 5. 初始化远程数据库
npm run db:init

# 6. 部署
npm run deploy
```

## 默认管理员

- 首次登录时自动创建管理员账号
- 用户名: admin
- 密码: 通过 ADMIN_PASSWORD 环境变量配置

## 项目结构

```
aurora-blog/
├── src/
│   ├── index.ts              # Worker 入口（Hono 路由）
│   ├── types.ts              # TypeScript 类型
│   ├── db.ts                 # D1 数据库操作
│   ├── auth.ts               # JWT 认证
│   ├── routes/               # API 路由
│   │   ├── api-auth.ts       # 认证 API
│   │   ├── api-posts.ts      # 文章 API
│   │   ├── api-comments.ts   # 评论 API
│   │   ├── api-tags.ts       # 标签 API
│   │   └── api-upload.ts     # 上传 API
│   ├── templates/            # HTML 模板
│   │   ├── layout.ts         # 布局（含粒子、主题、i18n）
│   │   ├── home.ts           # 首页
│   │   ├── post-detail.ts    # 文章详情
│   │   ├── archive.ts        # 归档
│   │   ├── about.ts          # 关于
│   │   └── admin.ts          # 管理后台
│   └── migrations/
│       └── 001_init.sql      # D1 建表 SQL
├── wrangler.jsonc
├── package.json
└── tsconfig.json
```

## API

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/login | 登录 | 公开 |
| GET | /api/posts | 文章列表 | 公开 |
| GET | /api/posts/:slug | 文章详情 | 公开 |
| POST | /api/posts | 创建文章 | 需认证 |
| PUT | /api/posts/:id | 更新文章 | 需认证 |
| DELETE | /api/posts/:id | 删除文章 | 需认证 |
| POST | /api/comments/posts/:id/comments | 提交评论 | 公开 |
| GET | /api/tags | 标签列表 | 公开 |
| POST | /api/upload | 上传图片 | 需认证 |
