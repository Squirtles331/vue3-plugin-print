# Vue 3 打印设计器

一个从业务管理系统中独立迁出的可视化打印模板设计器，基于 Vue 3、Vite、Pinia 和 Element Plus 开发。

## 当前能力

- 页面尺寸、方向、边距和辅助线配置
- 文本、图片、表格、条码、二维码等元素模型
- 元素拖拽、缩放、吸附和图层管理
- 属性检查器、页面面板、数据绑定面板和历史面板
- 文本样式工具栏和表格代码编辑器
- 设计文档、视图状态、选择状态及撤销重做基础架构

> 保存、预览、打印和 PDF 导出目前保留了交互入口，后续可按实际业务接入持久化与渲染流程。

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址为 `http://localhost:5173`。

## 构建

```bash
npm run build
npm run preview
```

## 目录结构

```text
src/
├── print-designer/   # 打印设计器完整功能源码
├── styles/           # 独立项目全局样式
├── App.vue           # 应用入口组件
└── main.js           # Vue、Pinia、Element Plus 初始化
```

## 技术栈

- Vue 3
- Vite
- Pinia
- Element Plus
- CodeMirror 6
- Sass
