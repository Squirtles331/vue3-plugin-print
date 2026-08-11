# v0.2 预发布验证记录

日期：2026-08-11

## 本地自动化证据

以下命令由本次发布候选在本地执行；发布前必须在干净 CI 环境复核。

- `npm run lint`
- `npm test`
- `npm run test:performance`
- `npm run test:pages-build`
- `npm run build:demo`
- `npm run build:library`
- `npm run test:package`
- `npm run test:consumer`
- `npm run docs:build`
- `npm run verify`
- `RELEASE_TAG=v0.2.0 npm run verify:release-tag`

结果：以上命令于 2026-08-11 在本工作区通过。`npm run verify` 的生产依赖审计报告 0 个漏洞；打包消费者检查会安装生成的 tarball，并验证 ESM、CommonJS、样式及类型声明入口。构建会提示编辑器代码块超过 500 kB，但不影响构建、打包或消费者安装；这是一项后续性能优化，不是本次发布阻塞。

发布工作流在调用 `npm publish` 前执行同一版本标签校验；另已确认错误标签会在发布前被拒绝。

## 本次升级要点

- 默认打印预检现在会阻止缺失数据绑定、越过模板安全区、空机器码和不可加载图片；旧模板必须修复问题，或仅在明确接受不完整输出时使用 `printPolicy: { allowIncomplete: true }`。
- 打印 CSS 采用模板纸张尺寸；模板边距作为作者安全区，不能消除打印机物理不可打印边距。
- 数据面板会展示运行时数据路径，可直接绑定到当前选中元素；预览问题可定位到对应元素。
- 多页表格只会重复标记了 `repeatPerPage` 的元素，并会跳过没有行的后续表格片段。

## 发布前仍需由维护者完成

- 在待发布提交的 GitHub Actions 中确认 CI、Pages 和 npm 发布工作流权限配置。
- 依照 [浏览器与打印机验收](browser-print-acceptance.md) 在当前桌面 Chrome、Edge 和代表性物理打印机完成验收；本地单元测试不能替代这一步。
- 完成 [发布检查清单](release-checklist.md) 的来源、许可证、npm 权限、标签、GitHub Release 和发布后空项目安装检查。

未完成上述人工事项前，本版本仅是“代码与自动化发布就绪”，尚不可声称已完成对外发布。
