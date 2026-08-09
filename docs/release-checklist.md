# v0.1 发布检查清单

## 源码与合规

- [ ] 维护者已完成提交历史和来源复核，并确认仓库没有参考项目的源码、模板 JSON、文案、Logo、截图或其他品牌资产。
- [ ] `LICENSE`、`package.json` 的仓库地址和 GitHub Pages 地址已在迁移后的 GitHub 仓库中复核；若 GitHub 所有者不是 `songtonngxue`，先更新这些地址。
- [ ] 新增依赖已记录在 `THIRD_PARTY_NOTICES.md`，并完成许可证检查。

## 自动化检查

- [ ] `npm ci`
- [ ] `npm run verify`
- [ ] GitHub Actions 的 Continuous Integration 工作流通过。
- [ ] GitHub Actions 的 Deploy GitHub Pages 工作流通过，且仓库 Settings 中 Pages 的发布源设为 GitHub Actions。

## 手工验收与发布

- [ ] 按 [浏览器打印验收](browser-print-acceptance.md) 在 Chrome 和 Edge 完成验证。
- [ ] 更新 `CHANGELOG.md` 的发布日期与 GitHub Release 说明。
- [ ] 创建并推送 `v0.1.0` 标签，发布 GitHub Release，附上演示链接、支持范围、已知限制和反馈入口。
