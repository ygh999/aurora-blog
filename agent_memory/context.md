# 项目上下文

## 项目目标

- 基于 Cloudflare Workers 构建全功能个人博客
- 参照 Rin 项目功能完整度
- 极光粒子 + 流星视觉效果
- 明暗主题 + 中英文 i18n

## 关键约束

- 单 Worker 部署（Hono 框架）
- D1 数据库存储（raw SQL，无 ORM）
- R2 对象存储（图片上传）
- 单管理员 JWT 认证
- 客户端 Markdown 渲染（marked.js）
- 不使用前端构建工具，HTML 内嵌 Worker

## 重要路径

- src/index.ts — Worker 入口，Hono 路由
- src/db.ts — D1 数据库操作
- src/auth.ts — JWT 认证
- src/templates/ — HTML 模板
- src/routes/ — API 路由
- src/migrations/001_init.sql — 数据库 Schema

## 约定与偏好

- 中文沟通，英文代码命名
- 最小改动原则
- 视觉风格：深空极光 + 流星
- 技能参考：impeccable + ui-ux-pro-max
