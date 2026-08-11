# v0.1 预发布验证记录

日期：2026-08-09

## 已通过的自动化检查

- 隔离临时目录中的 `npm ci --registry=https://registry.npmjs.org` 成功完成，验证当前 `package-lock.json` 可复现安装。
- `npm run lint` 通过。
- `npm test` 通过，覆盖本地模板删除/重置、组件确认事件、GitHub Pages 路径和打印 iframe 隔离等关键行为。
- `npm run test:performance` 通过，长表格分页预计算满足当前性能门槛。
- `npm run test:pages-build` 通过，GitHub Actions 环境下的构建产物使用项目 Pages 资源路径。
- `npm run build` 通过。
- `npm audit --omit=dev --audit-level=high --registry=https://registry.npmjs.org` 返回 0 个高危运行时漏洞。
- 源码扫描未发现 `0ldFive`、`Vue-Print-Designer`、`printdot`、`AGPL-3.0` 标识，也未发现 `eval` 或 `new Function` 执行入口。
- 本地 Markdown 链接检查与 `git diff --check` 通过。

## 已知非阻塞事项

- 项目已经移除 Element Plus 等第三方 UI 组件库依赖；编辑器 UI 由内部 primitives 提供。后续仍需持续关注编辑器代码块体积和运行时依赖体积。
- 当前工作区的直接 `npm ci` 可能因已有 esbuild 进程锁定 Windows 可执行文件而失败；隔离目录中的干净安装已通过。发布前请关闭本地开发服务器后再执行一次工作区 `npm ci`。

## 标签前仍需由维护者完成

- 在最终 GitHub 仓库启用 Pages 的 GitHub Actions 发布源，并确认 `Squirtles331/vue3-plugin-print` 地址；若所有者或仓库名不同，更新 `package.json` 和 README 中的链接。
- 在最新桌面版 Chrome 和 Edge 完成 [浏览器打印验收](browser-print-acceptance.md)，包含实际打印机纸张校准。
- 由有权审核者完成 [发布检查清单](release-checklist.md) 中的来源和许可证复核，然后创建 `v0.1.0` 标签与 GitHub Release。
