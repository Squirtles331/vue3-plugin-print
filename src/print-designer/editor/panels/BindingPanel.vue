<template>
  <DataPanel :variables="variables" />
</template>

<script setup>
import DataPanel from "../../components/sidebar/DataPanel.vue";

defineProps({
  variables: {
    type: Array,
    default: () => [],
  },
});
</script>
