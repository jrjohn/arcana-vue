<script setup lang="ts">
/**
 * FormInput Component
 *
 * Reusable form input with v-model support using Vue 3.4+ defineModel().
 * Supports validation error display and Bootstrap styling.
 */
import { computed } from 'vue'
import { useI18n } from '@/domain/services/i18n.service'

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  id?: string
  label?: string
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  placeholder?: string
  required?: boolean
  disabled?: boolean
  readonly?: boolean
  autocomplete?: string
  maxlength?: number
  minlength?: number
  pattern?: string
  hideLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  disabled: false,
  readonly: false,
  hideLabel: false
})

// ============================================================================
// MODELS (Vue 3.4+ defineModel)
// ============================================================================

// Main v-model for input value
const model = defineModel<string>({ default: '' })

// Named v-model for error message
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

const inputId = computed(() => props.id || `input-${Math.random().toString(36).slice(2, 9)}`)

const hasError = computed(() => error.value !== null && error.value !== '')

const translatedError = computed(() => {
  if (!error.value) return ''
  // Try to translate, fallback to raw message
  const translated = t(error.value)
  return translated !== error.value ? translated : error.value
})

// ============================================================================
// HANDLERS
// ============================================================================

function handleBlur(event: FocusEvent) {
  emit('blur', event)
}

function handleFocus(event: FocusEvent) {
  emit('focus', event)
}
</script>

<template>
  <div class="form-input-wrapper">
    <label
      v-if="label && !hideLabel"
      :for="inputId"
      class="form-label"
    >
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>

    <input
      :id="inputId"
      v-model="model"
      :type="type"
      class="form-control"
      :class="{ 'is-invalid': hasError }"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      :readonly="readonly"
      :autocomplete="autocomplete"
      :maxlength="maxlength"
      :minlength="minlength"
      :pattern="pattern"
      :aria-invalid="hasError"
      :aria-describedby="hasError ? `${inputId}-error` : undefined"
      @blur="handleBlur"
      @focus="handleFocus"
    />

    <div
      v-if="hasError"
      :id="`${inputId}-error`"
      class="invalid-feedback"
    >
      {{ translatedError }}
    </div>
  </div>
</template>

<style scoped>
.form-input-wrapper {
  width: 100%;
}
</style>
