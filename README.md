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
- **GitHub Actions CI/CD**：push 自动部署

## 技术栈

| 组件 | 技术 |
|------|------|
| Runtime | Cloudflare Workers |
| Framework | Hono |
| Database | D1 (SQLite) |
| Storage | R2 |
| Language | TypeScript |
| Frontend | 内嵌 HTML + Canvas 粒子 + marked.js |
| CI/CD | GitHub Actions |

## 快速开始（本地开发）

```bash
git clone https://github.com/ygh999/aurora-blog.git
cd aurora-blog
npm install
npm run db:init:local
npm run dev
# 打开 http://localhost:8787
```

默认管理员账号：用户名 `admin`，密码 `admin123`。

---

## 部署方式

### 方式一：Cloudflare Dashboard 连接 GitHub（推荐）

无需本地 CLI，Dashboard 中可视化配置所有绑定。**绑定信息只存在 Dashboard 中，不写入代码。**

#### 1. 创建 Cloudflare 资源

登录 [Cloudflare Dashboard](https://dash.cloudflare.com)：

| 资源 | 路径 | 名称 |
|------|------|------|
| D1 Database | Workers & Pages → D1 | `aurora-blog-db` |
| R2 Bucket | R2 Object Storage | `aurora-blog-assets` |

#### 2. 连接 GitHub 仓库

1. Workers & Pages → **Create application** → **Pages** → **Connect to Git**
2. 授权并选择 `ygh999/aurora-blog` 仓库
3. 构建配置：

| 设置项 | 值 |
|--------|-----|
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npm run build` |
| Build output directory | `dist` |

4. 点击 **Save and Deploy**

#### 3. 配置绑定和密钥

进入项目 → **Settings** → **Functions**：

**D1 绑定**：
- Add binding → Variable name: `DB` → Database: `aurora-blog-db`

**R2 绑定**：
- Add binding → Variable name: `R2` → Bucket: `aurora-blog-assets`

**密钥**（Environment Variables → 加密存储）：
- `JWT_SECRET` → 一个随机长字符串
- `ADMIN_PASSWORD` → 管理员密码

保存后 → **Deployments** → **Retry deployment** 让配置生效。

> **原理**：构建使用 `esbuild` 编译 TypeScript，不需要任何 Cloudflare 认证。D1/R2 绑定由 Dashboard 在部署时注入到 Worker 运行环境中。

---

### 方式二：Wrangler CLI 部署

绑定信息写在本地配置文件中，不提交到仓库。

```bash
# 登录
npx wrangler login

# 创建资源
npx wrangler d1 create aurora-blog-db          # 记录 database_id
npx wrangler r2 bucket create aurora-blog-assets

# 复制本地配置模板并填入你的值
cp wrangler.local.example.jsonc wrangler.local.jsonc
# 编辑 wrangler.local.jsonc，填入：
#   - database_id
#   - JWT_SECRET
#   - ADMIN_PASSWORD

# 设置密钥（Worker 运行时使用）
npx wrangler secret put JWT_SECRET
npx wrangler secret put ADMIN_PASSWORD

# 初始化数据库
npx wrangler d1 execute aurora-blog-db --remote --file=src/migrations/001_init.sql

# 使用本地配置部署
npx wrangler deploy --config wrangler.local.jsonc
```

> **注意**：`wrangler.local.jsonc` 已在 `.gitignore` 中，不会被提交到仓库。

---

### 方式三：GitHub Actions 自动部署

push 代码即自动部署。绑定信息存储在 GitHub Secrets 中，CI 运行时动态注入。

#### 1. 创建 Cloudflare 资源

同方式一，在 Dashboard 中创建 D1 和 R2 资源。进入 D1 数据库详情页，记录 **Database ID**。

#### 2. 配置 GitHub Secrets

进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions**：

点击 **New repository secret**，逐个添加以下 6 个 Secret：

| Secret 名称 | 说明 | 获取方式 |
|-------------|------|----------|
| `CLOUDFLARE_API_TOKEN` | API Token | Dashboard → 头像 → API Tokens → Create Token → Edit Workers 模板 |
| `CLOUDFLARE_ACCOUNT_ID` | 账户 ID | Dashboard 首页右侧栏 |
| `D1_DATABASE_ID` | D1 数据库 ID | D1 → `aurora-blog-db` → 详情页 |
| `R2_BUCKET_NAME` | R2 Bucket 名称 | R2 中的 Bucket 名，如 `aurora-blog-assets` |
| `JWT_SECRET` | JWT 签名密钥 | 自定义随机字符串，如 `my-blog-jwt-secret-2026` |
| `ADMIN_PASSWORD` | 管理员密码 | 自定义密码 |

添加完成后验证：
```
Actions → Secrets 列表应显示 6 个 Secret
```

#### 3. 配置 Worker 运行时密钥

首次部署成功后，还需要在 Cloudflare Dashboard 中设置 Worker 密钥（与 GitHub Secrets 保持一致）：

1. Cloudflare Dashboard → **Workers & Pages** → `aurora-blog`
2. **Settings** → **Variables and Secrets**
3. 添加两个 **Secret**（加密存储）：
   - `JWT_SECRET` = 与 GitHub Secret 中相同的值
   - `ADMIN_PASSWORD` = 与 GitHub Secret 中相同的值

> **为什么两边都要配？** GitHub Secrets 仅供 CI 构建使用，Worker 运行时读取的是 Cloudflare Dashboard 中的密钥。两者是独立的。

#### 4. Push 触发部署

```bash
git add .
git commit -m "feat: your changes"
git push
```

在 GitHub → **Actions** 标签页查看部署进度。

#### 5. CI 执行流程详解

每次 push 到 main，GitHub Actions 自动执行以下步骤：

```
┌─────────────────────────────────────────────────────┐
│  1. 检出代码                                         │
│     └─ wrangler.jsonc 只有基础配置，无绑定            │
│                                                      │
│  2. npm ci 安装依赖                                   │
│                                                      │
│  3. Configure Bindings（动态注入绑定）                │
│     └─ 读取 GitHub Secrets:                          │
│        D1_DATABASE_ID → 写入 wrangler.jsonc          │
│        R2_BUCKET_NAME → 写入 wrangler.jsonc          │
│     └─ 此时 wrangler.jsonc 包含完整绑定配置           │
│                                                      │
│  4. Init D1 Database                                 │
│     └─ 执行 001_init.sql 建表（幂等，重复执行无影响） │
│                                                      │
│  5. wrangler deploy                                  │
│     └─ 用注入后的配置构建并部署 Worker                │
│     └─ D1 绑定: DB → aurora-blog-db                  │
│     └─ R2 绑定: R2 → aurora-blog-assets              │
└─────────────────────────────────────────────────────┘
```

#### 6. 验证部署

1. 在 Cloudflare Dashboard → Workers & Pages 找到 Worker URL
2. 访问首页，确认极光粒子效果正常
3. 访问 `/admin/login`，使用 `admin` + 你设置的密码登录
4. 在后台创建第一篇文章

---

## 三种部署方式对比

| | Dashboard 直连 | Wrangler CLI | GitHub Actions |
|--|---------------|-------------|----------------|
| 绑定配置位置 | Dashboard Settings | wrangler.local.jsonc | GitHub Secrets → CI 注入 |
| 密钥配置位置 | Dashboard Secrets | wrangler secret | GitHub Secrets + Dashboard |
| 部署触发 | push 到 main | 手动执行 | push 到 main |
| database_id | Dashboard 绑定 | 本地文件（不提交） | GitHub Secret |
| bucket_name | Dashboard 绑定 | 本地文件（不提交） | GitHub Secret |
| 数据库初始化 | 手动执行 SQL | CLI 命令 | 自动 |
| 适合场景 | 快速上线 | 本地调试 | 自动化 CI/CD |

---

## API 文档

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录获取 JWT | 公开 |
| GET | `/api/posts` | 文章列表 | 公开 |
| GET | `/api/posts/:slug` | 文章详情 | 公开 |
| POST | `/api/posts` | 创建文章 | 需认证 |
| PUT | `/api/posts/:id` | 更新文章 | 需认证 |
| DELETE | `/api/posts/:id` | 删除文章 | 需认证 |
| GET | `/api/comments/posts/:id/comments` | 获取评论 | 公开 |
| POST | `/api/comments/posts/:id/comments` | 提交评论 | 公开 |
| GET | `/api/comments/pending` | 待审核评论 | 需认证 |
| PUT | `/api/comments/:id` | 更新评论状态 | 需认证 |
| DELETE | `/api/comments/:id` | 删除评论 | 需认证 |
| GET | `/api/tags` | 标签列表 | 公开 |
| POST | `/api/tags` | 创建标签 | 需认证 |
| POST | `/api/upload` | 上传图片 | 需认证 |

## 页面路由

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero 区 + 文章列表 |
| 文章详情 | `/post/:slug` | Markdown 渲染 + 评论 |
| 归档 | `/archive` | 按年月分组 + 标签云 |
| 关于 | `/about` | 关于页面 |
| 管理后台 | `/admin` | 仪表盘 |
| 文章编辑 | `/admin/edit/:id?` | Markdown 编辑器 |
| 评论管理 | `/admin/comments` | 待审核评论 |

## 项目结构

```
aurora-blog/
├── .github/workflows/
│   └── deploy.yml                    # GitHub Actions 自动部署
├── src/
│   ├── index.ts                      # Worker 入口（Hono 路由）
│   ├── types.ts                      # TypeScript 类型
│   ├── db.ts                         # D1 数据库操作
│   ├── auth.ts                       # JWT 认证
│   ├── routes/                       # REST API
│   ├── templates/                    # HTML 页面模板
│   └── migrations/
│       └── 001_init.sql              # D1 建表 SQL
├── wrangler.jsonc                    # 基础配置（无绑定）
├── wrangler.local.example.jsonc      # CLI 本地配置模板
├── package.json
└── README.md
```

## 默认管理员

- 首次登录时自动创建
- 用户名：`admin`
- 密码：通过 `ADMIN_PASSWORD` 环境变量配置

## License

MIT
