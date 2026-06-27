# 问题与风险

## 已知问题

- `npx tsc --noEmit` 当前仍有既存类型错误，主要集中在 Hono context 变量类型、D1 查询结果类型断言、路由参数可能为 `undefined`。这些不是本次 CI JSONC 修复引入，未在本次任务中扩大处理。

## 已修复

- GitHub Actions 不再使用 `JSON.parse()` 解析带注释的 JSONC 配置，改为 `sed` 替换 CI 模板占位符。
- 提交版 `wrangler.jsonc` 不再包含 D1/R2/KV 无效占位符，降低 Cloudflare Dashboard Pages 直连构建失败风险。

## 待验证事项

- GitHub Actions 云端部署是否通过。
- Cloudflare Dashboard Pages 直连部署是否继续成功。
