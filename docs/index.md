---
layout: home

hero:
  name: "打印模板工作台"
  text: "一个基于 Vue 3 的可视化打印模板设计器"
  tagline: 内置 UI primitives、JSON 数据绑定和浏览器原生打印运行时，适合嵌入业务系统。
  image:
    src: /home-hero.svg
    alt: 打印模板工作台
  actions:
    - theme: brand
      text: 开始使用
      link: /guide/quick-start
    - theme: alt
      text: GitHub
      link: https://github.com/Squirtles331/vue3-plugin-print

features:
  - title: Vue 3 可嵌入
    details: 面向 Vue 3.5+ 应用，提供完整设计器组件、模板文档模型和浏览器打印流程。
  - title: 无第三方 UI 组件库依赖
    details: 编辑器按钮、弹窗、标签页、输入控件、反馈提示和图标均由项目内部 primitives 实现，宿主无需安装 Element Plus 等组件库。
  - title: 模板与运行时统一
    details: 使用 TemplateDocument v1 保存模板，预览与打印共用运行时渲染、分页和预检结果。
---
