# Changelog

本项目遵循语义化版本。重大不兼容变更、功能、修复和安全更新会记录在此。

## [0.1.0] - Unreleased

### Added

- 独立 Vue 3 浏览器打印模板设计器，包含十类元素、属性编辑、JSON 数据绑定和运行时预览/打印。
- `TemplateDocument v1`、本地模板库、导入导出、起始模板和元素预设。
- 本地模板删除与清空操作、GitHub Pages 构建支持、CI、浏览器打印隔离回归测试和发布验收文档。

### Security

- 升级 `nanoid` 至 3.3.18、`postcss` 至 8.5.26，修复审计发现的间接依赖问题。

### Deferred

- PDF/图片导出、静默/云打印、设备级打印控制、服务端渲染、协作、npm 组件包和 Web Component。
