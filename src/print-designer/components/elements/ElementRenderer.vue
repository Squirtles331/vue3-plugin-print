<template>
  <component :is="component" :object="object" @start-object-drag="emit('start-object-drag', $event)" />
</template>

<script setup>
import { computed } from "vue";
import BarcodeElement from "./BarcodeElement.vue";
import CircleElement from "./CircleElement.vue";
import ImageElement from "./ImageElement.vue";
import LineElement from "./LineElement.vue";
import MultiLabelElement from "./MultiLabelElement.vue";
import PageNumberElement from "./PageNumberElement.vue";
import QRCodeElement from "./QRCodeElement.vue";
import RectElement from "./RectElement.vue";
import TableElement from "./TableElement.vue";
import TextElement from "./TextElement.vue";

const props = defineProps({
  object: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["start-object-drag"]);

const components = {
  text: TextElement,
  image: ImageElement,
  table: TableElement,
  pageNumber: PageNumberElement,
  barcode: BarcodeElement,
  qrcode: QRCodeElement,
  line: LineElement,
  rect: RectElement,
  circle: CircleElement,
  multiLabel: MultiLabelElement,
};

const component = computed(() => components[props.object?.type] || TextElement);
</script>
