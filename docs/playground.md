# 演示区

<script setup>
import { withBase } from "vitepress";

const demoUrl = withBase("/demo/");
</script>

这里不再嵌入演示画面。点击下面的链接，会在新页面中打开完整演示应用。

<p class="playground-link">
  <a :href="demoUrl" target="_blank" rel="noreferrer">在新页面打开完整演示</a>
</p>

<p>
  完整演示包含实际的编辑器界面、属性面板、预览和打印流程，适合单独查看和操作。
</p>
