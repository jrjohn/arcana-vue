<script setup lang="ts">
/**
 * FormTextarea Component
 *
 * Reusable textarea with v-model support using Vue 3.4+ defineModel().
 */
import { computed } from 'vue'
import { useI18n } from '@/domain/services/i18n.service'

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  id?: string
  label?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  rows?: number
  maxlength?: number
  hideLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  required: false,
  disabled: false,
  readonly: false,
  rows: 3,
  hideLabel: false
})

// ============================================================================
// MODELS
// ============================================================================

const model = defineModel<string>({ default: '' })
const error = defineModel<string | null>('error', { default: null })

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits<{
  blur: [event: FocusEvent]
  focus: [event: FocusEvent]
}>()

// ============================================================================
// COMPUTED
// ============================================================================

const { t } = useI18n()

const inputId = computed(() => props.id || `textarea-${Math.random().toString(36).slice(2, 9)}`)
const hasError = computed(() => error.value !== null && error.value !== '')
const translatedError = computed(() => {
  if (!error.value) return ''
  const translated = t(error.value)
  return translated !== error.value ? translated : error.value
})
</script>

<template>
  <div class="form-textarea-wrapper">
    <label
      v-if="label && !hideLabel"
      :for="inputId"
      class="form-label"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <textarea
      :id="inputId"
      v-model="model"
      class="form-control"
      :class="{ 'is-invalid': hasError }"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :rows="rows"
      :maxlength="maxlength"
      @blur="emit('blur', $event)"
      @focus="emit('focus', $event)"
    />

    <div v-if="hasError" class="invalid-feedback">
      {{ translatedError }}
    </div>
  </div>
</template>

<style scoped>
.form-textarea-wrapper {
  width: 100%;
}
</style>
