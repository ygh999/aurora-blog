# AGENTS.md — Aurora Blog

## 项目概述

基于 Cloudflare Workers 的轻量级个人博客系统。Worker 直出 HTML，无框架依赖，单文件部署。

## 技术栈

- Runtime: Cloudflare Workers
- 语言: TypeScript
- 构建: Wrangler v4+
- 前端: 内嵌 HTML + Canvas 粒子系统

## 编码约定

- 默认中文沟通，代码英文命名
- 最小改动原则，不做无关重构
- HTML 模板内嵌于 src/index.ts，通过模板字符串返回
- 样式变更需同步更新 BLOG_HTML 常量

## 部署

```bash
npx wrangler dev      # 本地开发
npx wrangler deploy   # 部署到 Cloudflare
```
