<template>
  <div class="pd-image-element" :style="frameStyle">
    <img
      v-if="object.props?.src"
      class="pd-image-element__image"
      :src="object.props.src"
      alt=""
      :style="imageStyle"
    />
    <div v-else class="pd-image-element__placeholder">
      <span class="pd-image-element__art" aria-hidden="true">
        <i></i><b></b>
      </span>
      <strong>图片</strong>
      <small>{{ placeholder }}</small>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { imageObjectPosition } from "../../runtime/propertySemantics.js";
import { bindingLabel, previewPanelStyle } from "./elementPreview.js";

const props = defineProps({
  object: {
    type: Object,
    required: true,
  },
});

const frameStyle = computed(() => previewPanelStyle(props.object, "#f8fafc"));
const imageStyle = computed(() => ({
  objectFit: props.object.style?.objectFit || "contain",
  objectPosition: imageObjectPosition(props.object.style),
}));
const placeholder = computed(() => bindingLabel(props.object) || props.object.props?.placeholder || "未绑定图片");
</script>

<style scoped lang="scss">
.pd-image-element {
  position: relative;
  overflow: hidden;
}

.pd-image-element__image {
  display: block;
  width: 100%;
  height: 100%;
}

.pd-image-element__placeholder {
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  border: 1px dashed #cbd5e1;
  color: #64748b;
  background:
    linear-gradient(45deg, rgba(226, 232, 240, 0.32) 25%, transparent 25%) 0 0 / 12px 12px,
    linear-gradient(-45deg, rgba(226, 232, 240, 0.32) 25%, transparent 25%) 0 0 / 12px 12px,
    #f8fafc;
}

.pd-image-element__placeholder strong {
  color: #475569;
  font-size: 12px;
  font-weight: 700;
}

.pd-image-element__placeholder small {
  max-width: calc(100% - 18px);
  overflow: hidden;
  color: #94a3b8;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pd-image-element__art {
  position: relative;
  display: block;
  width: 28px;
  height: 22px;
  border: 1.5px solid #94a3b8;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.86);
}

.pd-image-element__art i {
  position: absolute;
  top: 4px;
  right: 5px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #94a3b8;
}

.pd-image-element__art b {
  position: absolute;
  right: 3px;
  bottom: 3px;
  left: 3px;
  height: 9px;
  clip-path: polygon(0 100%, 34% 35%, 54% 67%, 72% 22%, 100% 100%);
  background: #94a3b8;
}
</style>
