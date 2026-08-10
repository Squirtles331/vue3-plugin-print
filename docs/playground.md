# 演示区

<script setup>
import { withBase } from "vitepress";

const demoUrl = withBase("/demo/");
</script>

这里嵌入的是完整的演示应用。文档站和演示现在会作为同一次 GitHub Pages 发布的一部分一起部署。

<div class="playground-shell">
  <iframe
    class="playground-frame"
    :src="demoUrl"
    title="打印模板工作台演示"
    loading="lazy"
  />
</div>

<p class="playground-link">
  <a :href="demoUrl">在新页面打开完整演示</a>
</p>
