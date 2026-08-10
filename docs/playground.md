# 演示区

<script setup>
import { withBase } from "vitepress";

const demoUrl = withBase("/demo/");

function openDemo() {
  window.open(demoUrl, "_blank", "noopener,noreferrer");
}
</script>

这里不再嵌入演示画面。点击下面的按钮，会在新的标签页中打开完整演示应用。

<p class="playground-link">
  <button type="button" class="playground-button" @click="openDemo">
    在新标签页打开完整演示
  </button>
</p>

<p>
  完整演示包含实际的编辑器界面、属性面板、预览和打印流程，适合单独查看和操作。
</p>
