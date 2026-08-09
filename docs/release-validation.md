# v0.1 预发布验证记录

日期：2026-08-09

## 已通过的自动化检查

- 隔离临时目录中的 `npm ci --registry=https://registry.npmjs.org` 成功完成，验证当前 `package-lock.json` 可复现安装。
- `npm run lint` 通过。
- `npm test` 通过：15 个测试文件、45 个测试，包括本地模板删除/重置、组件确认事件、GitHub Pages 路径和打印 iframe 隔离。
- `npm run test:performance` 通过：2,000 行表格分页低于 1 秒预算。
- `npm run test:pages-build` 通过：GitHub Actions 环境下的构建产物使用项目 Pages 资源路径。
- `npm run build` 通过。
- `npm audit --omit=dev --audit-level=high --registry=https://registry.npmjs.org` 返回 0 个漏洞。
- 源码扫描未发现 `0ldFive`、`Vue-Print-Designer`、`printdot`、`AGPL-3.0` 标识，也未发现 `eval` 或 `new Function` 执行入口。
- 本地 Markdown 链接检查与 `git diff --check` 通过。

## 已知非阻塞事项

- 构建仍报告第三方 `@vueuse/core` 的 PURE 注释提示，以及 `element-plus` 和编辑器代码块大于 500 kB；这不阻塞桌面 v0.1，但应在后续性能变更中处理。
- 当前工作区的直接 `npm ci` 因已有 esbuild 进程锁定 Windows 可执行文件而失败；隔离目录中的干净安装已通过。发布前请关闭本地开发服务器后再执行一次工作区 `npm ci`。

## 标签前仍需由维护者完成

- 在最终 GitHub 仓库启用 Pages 的 GitHub Actions 发布源，并确认 `songtonngxue/vue3-plugin-print` 地址；若所有者或仓库名不同，更新 `package.json` 和 README 中的链接。
- 在最新桌面 Chrome 和 Edge 完成 [浏览器打印验收](browser-print-acceptance.md)，包含实际打印机纸张校准。
- 由有权审核者完成 [发布检查清单](release-checklist.md) 中的来源和许可证复核，然后创建 `v0.1.0` 标签与 GitHub Release。
