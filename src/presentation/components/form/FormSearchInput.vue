<script setup lang="ts">
/**
 * FormSearchInput Component
 *
 * Search input with icon using Vue 3.4+ defineModel().
 */

// ============================================================================
// PROPS
// ============================================================================

interface Props {
  placeholder?: string
  disabled?: boolean
}

withDefaults(defineProps<Props>(), {
  disabled: false
})

// ============================================================================
// MODELS
// ============================================================================

const model = defineModel<string>({ default: '' })

// ============================================================================
// EMITS
// ============================================================================

const emit = defineEmits<{
  search: [query: string]
  clear: []
}>()

// ============================================================================
// HANDLERS
// ============================================================================

function handleClear() {
  model.value = ''
  emit('clear')
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    emit('search', model.value)
  }
  if (event.key === 'Escape') {
    handleClear()
  }
}
</script>

<template>
  <div class="search-input-wrapper position-relative">
    <i class="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
    <input
      v-model="model"
      type="text"
      class="form-control ps-5"
      :class="{ 'pe-5': model.length > 0 }"
      :placeholder="placeholder"
      :disabled="disabled"
      @keydown="handleKeydown"
    />
    <button
      v-if="model.length > 0"
      type="button"
      class="btn btn-link position-absolute top-50 translate-middle-y end-0 me-2 p-0 text-muted"
      @click="handleClear"
    >
      <i class="bi bi-x-lg"></i>
    </button>
  </div>
</template>

<style scoped>
.search-input-wrapper {
  width: 100%;
}

.search-input-wrapper .btn-link {
  text-decoration: none;
}

.search-input-wrapper .btn-link:hover {
  color: var(--bs-dark) !important;
}
</style>
