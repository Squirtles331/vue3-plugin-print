<script setup lang="ts">
import PdIcon from './PdIcon.vue'

defineOptions({ inheritAttrs: false })
const props = defineProps({
  'modelValue': { type: [String, Number], default: '' },
  'type': { type: String, default: 'text' },
  'size': { type: String, default: 'default' },
  'rows': { type: [Number, String], default: 3 },
  'clearable': { type: Boolean, default: false },
  'prefixIcon': { type: [String, Object, Function], default: '' },
  'disabled': { type: Boolean, default: false },
  'placeholder': { type: String, default: '' },
  'maxlength': { type: [Number, String], default: undefined },
  'spellcheck': { type: [Boolean, String], default: undefined },
  'aria-label': { type: String, default: undefined },
})
const emit = defineEmits(['update:modelValue', 'input', 'change', 'clear', 'click', 'blur'])
const attrs = useAttrs()
const isTextarea = computed(() => props.type === 'textarea')
const inputClass = computed(() => [
  'pd-input',
  `pd-input--${props.size}`,
  {
    'pd-input--textarea': isTextarea.value,
    'pd-input--with-prefix': props.prefixIcon,
    'pd-input--clearable': props.clearable,
  },
])
function emitValue(event, eventName) {
  const value = event.target.value
  emit('update:modelValue', value)
  emit(eventName, value)
}
function clearValue() {
  emit('update:modelValue', '')
  emit('input', '')
  emit('change', '')
  emit('clear')
}
</script>

<template>
  <label :class="inputClass">
    <span v-if="prefixIcon" class="pd-input__prefix">
      <component :is="prefixIcon" v-if="typeof prefixIcon !== 'string'" />
      <PdIcon v-else :name="prefixIcon" />
    </span>
    <textarea
      v-if="isTextarea"
      v-bind="attrs"
      class="pd-input__control pd-input__control--textarea"
      :value="modelValue"
      :rows="rows"
      :disabled="disabled"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :spellcheck="spellcheck"
      :aria-label="props['aria-label']"
      @input="emitValue($event, 'input')"
      @change="emitValue($event, 'change')"
      @click="emit('click', $event)"
      @blur="emit('blur', $event)"
    />
    <input
      v-else
      v-bind="attrs"
      class="pd-input__control"
      :type="type"
      :value="modelValue"
      :disabled="disabled"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :spellcheck="spellcheck"
      :aria-label="props['aria-label']"
      @input="emitValue($event, 'input')"
      @change="emitValue($event, 'change')"
      @click="emit('click', $event)"
      @blur="emit('blur', $event)"
    >
    <button v-if="clearable && modelValue" type="button" class="pd-input__clear" :disabled="disabled" @click="clearValue">x</button>
  </label>
</template>
