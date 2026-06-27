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
# 1. 克隆仓库
git clone https://github.com/ygh999/aurora-blog.git
cd aurora-blog

# 2. 安装依赖
npm install

# 3. 初始化本地数据库
npm run db:init:local

# 4. 启动本地开发服务器
npm run dev

# 5. 打开 http://localhost:8787
```

默认管理员账号：用户名 `admin`，密码 `admin123`（本地开发）。

---

## 部署方式

### 方式一：Cloudflare Dashboard 连接 GitHub（推荐）

最简单的部署方式，无需本地 CLI，每次 push 自动部署。

#### 第一步：准备 Cloudflare 资源

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
2. **获取 Account ID**：右侧栏可见
3. **创建 API Token**：头像 → My Profile → API Tokens → Create Token → 选择 **Edit Cloudflare Workers** 模板
4. **创建 D1 数据库**：Workers & Pages → D1 → Create database → 命名 `aurora-blog-db` → 复制 Database ID
5. **创建 R2 Bucket**：R2 Object Storage → Create bucket → 命名 `aurora-blog-assets`

#### 第二步：连接 GitHub 仓库

1. Cloudflare Dashboard → **Workers & Pages**
2. 点击 **Create application**
3. 选择 **Pages** 标签页 → **Connect to Git**
4. 授权 Cloudflare 访问 GitHub，选择 `aurora-blog` 仓库
5. 配置构建设置：

| 设置项 | 值 |
|--------|-----|
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `npx wrangler deploy --outdir dist` |
| Build output directory | `dist` |

6. 点击 **Save and Deploy**

#### 第三步：配置绑定和环境变量

首次部署后，进入项目 → **Settings** → **Functions**：

1. **D1 Database bindings** → Add binding
   - Variable name: `DB`
   - D1 database: 选择 `aurora-blog-db`

2. **R2 Bucket bindings** → Add binding
   - Variable name: `R2`
   - R2 bucket: 选择 `aurora-blog-assets`

3. **Environment Variables (Encrypted)** → Add
   - `JWT_SECRET` = 一个随机长字符串
   - `ADMIN_PASSWORD` = 管理员密码

4. 点击 **Save**

5. 进入 **Deployments** → **Retry deployment**，让绑定生效

#### 完成！

部署成功后，访问 `https://aurora-blog.pages.dev` 即可。每次 push 到 main 分支会自动触发部署。

---

### 方式二：Wrangler CLI 部署

适合需要更多控制的场景。

#### 第一步：安装和登录

```bash
# 安装依赖
npm install

# 登录 Cloudflare
npx wrangler login
```

#### 第二步：创建远程资源

```bash
# 创建 D1 数据库
npx wrangler d1 create aurora-blog-db
# 输出中找到 database_id，填入 wrangler.jsonc

# 创建 R2 Bucket
npx wrangler r2 bucket create aurora-blog-assets
```

#### 第三步：更新配置

编辑 `wrangler.jsonc`，将 `database_id` 替换为真实值：

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "aurora-blog-db",
      "database_id": "你的真实database_id"
    }
  ]
}
```

#### 第四步：设置密钥

```bash
npx wrangler secret put JWT_SECRET
# 输入一个随机长字符串

npx wrangler secret put ADMIN_PASSWORD
# 输入管理员密码
```

#### 第五步：初始化数据库并部署

```bash
# 初始化远程数据库表结构
npx wrangler d1 execute aurora-blog-db --remote --file=src/migrations/001_init.sql

# 部署
npm run deploy
```

#### 完成！

部署成功后，访问 `https://aurora-blog.你的子域名.workers.dev` 即可。

---

### 方式三：GitHub Actions 自动部署

push 代码即自动部署。已在仓库中配置好 `.github/workflows/deploy.yml`。

#### 第一步：准备 Cloudflare 资源

在 Cloudflare Dashboard 中创建所需的资源：

1. **获取 Account ID**
   - 登录 [Cloudflare Dashboard](https://dash.cloudflare.com)
   - 右侧栏可以看到 **Account ID**

2. **创建 API Token**
   - 点击右上角头像 → **My Profile** → **API Tokens**
   - 点击 **Create Token**
   - 选择 **Edit Cloudflare Workers** 模板
   - 复制生成的 Token

3. **创建 D1 数据库**
   - 左侧 → **Workers & Pages** → **D1**
   - 点击 **Create database** → 名称输入 `aurora-blog-db`
   - 创建后进入数据库详情页，复制 **Database ID**

4. **创建 R2 Bucket**
   - 左侧 → **R2 Object Storage**
   - 点击 **Create bucket** → 名称输入 `aurora-blog-assets`

#### 第二步：更新 wrangler.jsonc 配置

编辑项目根目录的 `wrangler.jsonc`，将 `database_id` 替换为第一步获取的真实值：

```jsonc
{
  "name": "aurora-blog",
  "main": "src/index.ts",
  "compatibility_date": "2026-06-27",
  "compatibility_flags": ["nodejs_compat"],
  "vars": {
    "JWT_SECRET": "dev-secret-change-in-production",
    "ADMIN_PASSWORD": "admin123"
  },
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "aurora-blog-db",
      "database_id": "你的真实database_id"
    }
  ],
  "r2_buckets": [
    {
      "binding": "R2",
      "bucket_name": "aurora-blog-assets"
    }
  ]
}
```

> **注意**：`vars` 中的 `JWT_SECRET` 和 `ADMIN_PASSWORD` 仅用于本地开发，部署后会被 GitHub Secrets 中的值覆盖。

#### 第三步：配置 GitHub Secrets

进入 GitHub 仓库 → **Settings** → **Secrets and variables** → **Actions** → 点击 **New repository secret**：

| Secret 名称 | 说明 | 值来源 |
|-------------|------|--------|
| `CLOUDFLARE_API_TOKEN` | Cloudflare API Token | 第一步创建的 Token |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare Account ID | Dashboard 右侧栏 |

添加完成后，Secrets 列表应显示：
```
CLOUDFLARE_API_TOKEN    Updated X minutes ago
CLOUDFLARE_ACCOUNT_ID   Updated X minutes ago
```

#### 第四步：Push 触发首次部署

```bash
# 确保 wrangler.jsonc 已更新 database_id
git add wrangler.jsonc
git commit -m "config: update D1 database_id"
git push
```

GitHub Actions 会自动运行部署流程：
1. 检出代码
2. 安装依赖 (`npm ci`)
3. 初始化远程 D1 数据库表结构
4. 构建并部署 Worker

在 GitHub 仓库 → **Actions** 标签页可以查看部署进度。

#### 第五步：配置 Worker 密钥

首次部署成功后，需要设置 JWT 密钥和管理员密码。

**方式 A：通过 Cloudflare Dashboard（推荐）**

1. 登录 Cloudflare Dashboard → **Workers & Pages**
2. 找到 `aurora-blog` → 点击进入
3. **Settings** → **Variables and Secrets**
4. 点击 **Add** → 选择 **Secret**
   - Variable name: `JWT_SECRET`
   - Value: 输入一个随机长字符串（如 `my-super-secret-jwt-key-2026`）
   - 点击 **Encrypt and save**
5. 再次点击 **Add** → 选择 **Secret**
   - Variable name: `ADMIN_PASSWORD`
   - Value: 输入管理员密码（如 `MySecurePass123!`）
   - 点击 **Encrypt and save**

**方式 B：通过 Wrangler CLI（本地）**

```bash
# 确保已登录
npx wrangler login

# 设置密钥
npx wrangler secret put JWT_SECRET
# 输入一个随机长字符串

npx wrangler secret put ADMIN_PASSWORD
# 输入管理员密码
```

#### 第六步：验证部署

1. 访问 Worker URL（在 Cloudflare Dashboard → Workers & Pages 中查看）
2. 打开首页，确认极光粒子效果正常
3. 访问 `/admin/login`，使用 `admin` + 你设置的密码登录
4. 在管理后台创建第一篇文章

#### 后续更新

之后每次修改代码并 push，GitHub Actions 会自动部署：

```bash
# 修改代码后
git add .
git commit -m "feat: your changes"
git push
# 自动部署...
```

---

## 三种部署方式对比

| | Dashboard 直连 | Wrangler CLI | GitHub Actions |
|--|---------------|-------------|----------------|
| 配置位置 | Cloudflare Dashboard | 本地命令行 | GitHub Secrets + wrangler.jsonc |
| 部署触发 | push 到 main | 手动执行命令 | push 到 main |
| 绑定配置 | Dashboard UI | wrangler.jsonc | wrangler.jsonc |
| 密钥管理 | Dashboard Secrets | wrangler secret | Dashboard 或 wrangler secret |
| 数据库初始化 | 手动执行 SQL | CLI 命令 | 自动（deploy.yml） |
| 适合场景 | 快速上线 | 本地调试 | 自动化 CI/CD |
| 复杂度 | 低 | 中 | 中 |

---

## API 文档

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/auth/login` | 登录获取 JWT | 公开 |
| GET | `/api/posts` | 文章列表（分页） | 公开 |
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
| DELETE | `/api/tags/:id` | 删除标签 | 需认证 |
| POST | `/api/upload` | 上传图片 | 需认证 |

## 页面路由

| 页面 | 路由 | 说明 |
|------|------|------|
| 首页 | `/` | Hero 区 + 文章列表 |
| 文章详情 | `/post/:slug` | Markdown 渲染 + 评论 |
| 归档 | `/archive` | 按年月分组 + 标签云 |
| 关于 | `/about` | 关于页面 |
| 管理后台 | `/admin` | 仪表盘 |
| 文章管理 | `/admin/posts` | 文章列表 |
| 文章编辑 | `/admin/edit/:id?` | Markdown 编辑器 |
| 评论管理 | `/admin/comments` | 待审核评论 |

## 项目结构

```
aurora-blog/
├── .github/workflows/
│   └── deploy.yml            # GitHub Actions 自动部署
├── src/
│   ├── index.ts              # Worker 入口（Hono 路由）
│   ├── types.ts              # TypeScript 类型
│   ├── db.ts                 # D1 数据库操作
│   ├── auth.ts               # JWT 认证
│   ├── routes/               # REST API
│   │   ├── api-auth.ts
│   │   ├── api-posts.ts
│   │   ├── api-comments.ts
│   │   ├── api-tags.ts
│   │   └── api-upload.ts
│   ├── templates/            # HTML 页面模板
│   │   ├── layout.ts         # 布局（含粒子、主题、i18n）
│   │   ├── home.ts
│   │   ├── post-detail.ts
│   │   ├── archive.ts
│   │   ├── about.ts
│   │   └── admin.ts
│   └── migrations/
│       └── 001_init.sql      # D1 建表 SQL
├── wrangler.jsonc
├── package.json
├── tsconfig.json
└── README.md
```

## 默认管理员

- 首次登录时自动创建管理员账号
- 用户名：`admin`
- 密码：通过 `ADMIN_PASSWORD` 环境变量配置（本地开发默认 `admin123`）

## License

MIT
