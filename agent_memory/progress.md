# 当前进度

## 当前任务

- 修复 GitHub Actions 部署中 JSONC 配置处理问题：`wrangler.jsonc` 带注释，不能用 `JSON.parse()` 解析。

## 已完成

- [x] 提交版 `wrangler.jsonc` 改为基础配置，不包含 D1/R2/KV 占位绑定，避免 Dashboard Pages 直连构建被无效占位符校验失败。
- [x] 新增 `wrangler.ci.jsonc`，作为 GitHub Actions 专用部署模板，保留 D1/R2/KV 占位符。
- [x] `.github/workflows/deploy.yml` 改为复制 `wrangler.ci.jsonc` 到 `wrangler.jsonc`，再用 `sed` 替换 `D1_DATABASE_ID`、`R2_BUCKET_NAME`、`KV_NAMESPACE_ID`。
- [x] README 补充 GitHub Actions 的 7 个 Secrets、`sed` 注入流程，以及不能 `JSON.parse()` JSONC 的原因。
- [x] `package.json` build 入口改为 `./src/index.ts`，避免 esbuild 将入口当作包名解析。

## 验证状态

- `npm run build`：通过（提权后运行，输出 `dist/_worker.js 119.5kb`）。
- `rg` 检查：提交版 `wrangler.jsonc` 中无 `__...__` 占位符。

## 下一步

- 提交并推送本次修复。
- 让 GitHub Actions 重新运行部署，确认 Cloudflare 端部署成功。
