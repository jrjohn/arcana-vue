/**
 * Base ViewModel Types and Utilities
 *
 * Implements MVVM + Input/Output/Effect (I/O/E) architecture
 * with v-model support and Unidirectional Data Flow (UDF):
 *
 * View ←→ Model (v-model) → Validation → State Update → Output Signal → View
 *        ↓
 *     Effect Emitter → Side Effects (navigation, toasts, etc.)
 *
 * Key concepts:
 * - MODELS: Two-way bindable refs with built-in validation (v-model compatible)
 * - OUTPUTS: Read-only computed state derived from models
 * - INPUTS: Explicit action methods (submit, reset, delete, etc.)
 * - EFFECTS: Event emitters for side effects
 */

import { ref, computed, watch, type Ref, type ComputedRef } from 'vue'

// ============================================================================
// EFFECT TYPES
// ============================================================================

export type EffectType = 'navigation' | 'toast' | 'dialog' | 'custom'

export interface Effect<T = unknown> {
  type: EffectType
  payload: T
}

export interface NavigationEffect {
  type: 'navigation'
  payload: {
    route: string
    params?: Record<string, unknown>
  }
}

export interface ToastEffect {
  type: 'toast'
  payload: {
    message: string
    variant: 'success' | 'error' | 'warning' | 'info'
    duration?: number
  }
}

export interface DialogEffect {
  type: 'dialog'
  payload: {
    action: 'open' | 'close'
    dialogId?: string
  }
}

// ============================================================================
// MODEL CREATORS (v-model compatible with UDF)
// ============================================================================

export interface ModelOptions<T> {
  /** Transform value before setting (sanitization) */
  transform?: (value: T) => T
  /** Validate value, return error message or null */
  validate?: (value: T) => string | null
  /** Called after value changes */
  onChange?: (value: T, oldValue: T) => void
}

/**
 * Creates a v-model compatible ref with optional validation and transformation.
 * Maintains UDF by processing all changes through transform/validate pipeline.
 */
export function createModel<T>(
  initialValue: T,
  options: ModelOptions<T> = {}
): {
  model: Ref<T>
  error: Ref<string | null>
  isDirty: Ref<boolean>
  reset: () => void
  validate: () => boolean
  setAsOriginal: () => void
} {
  const { transform, validate, onChange } = options

  const internalValue = ref(initialValue) as Ref<T>
  const error = ref<string | null>(null)
  const isDirty = ref(false)
  const originalValue = ref(initialValue) as Ref<T>

  // Watch for changes and apply validation
  watch(internalValue, (newVal, oldVal) => {
    isDirty.value = newVal !== originalValue.value

    if (validate) {
      error.value = validate(newVal)
    }

    if (onChange) {
      onChange(newVal, oldVal)
    }
  }, { deep: true })

  return {
    model: computed({
      get: () => internalValue.value,
      set: (value: T) => {
        const transformed = transform ? transform(value) : value
        internalValue.value = transformed
      }
    }) as Ref<T>,
    error,
    isDirty,
    reset: () => {
      internalValue.value = originalValue.value
      error.value = null
      isDirty.value = false
    },
    validate: () => {
      if (validate) {
        error.value = validate(internalValue.value)
        return error.value === null
      }
      return true
    },
    setAsOriginal: () => {
      originalValue.value = internalValue.value
      isDirty.value = false
      error.value = null
    }
  }
}

/**
 * Creates a form with multiple v-model compatible fields.
 * Each field has its own validation and transformation.
 */
export function createFormModels<T extends object>(
  initialValues: T,
  fieldOptions: Partial<{ [K in keyof T]: ModelOptions<T[K]> }> = {}
): {
  models: { [K in keyof T]: Ref<T[K]> }
  errors: { [K in keyof T]: Ref<string | null> }
  values: ComputedRef<T>
  isDirty: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  hasErrors: ComputedRef<boolean>
  reset: () => void
  resetField: (field: keyof T) => void
  validate: () => boolean
  validateField: (field: keyof T) => boolean
  setValues: (values: Partial<T>) => void
  setOriginalValues: (values: Partial<T>) => void
} {
  const fields: Record<string, ReturnType<typeof createModel<unknown>>> = {}

  // Create model for each field
  for (const key of Object.keys(initialValues) as Array<keyof T>) {
    const options = fieldOptions[key] as ModelOptions<unknown> | undefined
    fields[key as string] = createModel(initialValues[key], options || {})
  }

  // Build models object
  const models = {} as { [K in keyof T]: Ref<T[K]> }
  const errors = {} as { [K in keyof T]: Ref<string | null> }

  for (const key of Object.keys(fields)) {
    const field = fields[key]
    if (field) {
      models[key as keyof T] = field.model as Ref<T[keyof T]>
      errors[key as keyof T] = field.error as Ref<string | null>
    }
  }

  // Computed values
  const values = computed(() => {
    const result = {} as T
    for (const key of Object.keys(fields)) {
      const field = fields[key]
      if (field) {
        result[key as keyof T] = field.model.value as T[keyof T]
      }
    }
    return result
  })

  const isDirty = computed(() =>
    Object.values(fields).some(f => f.isDirty.value)
  )

  const isValid = computed(() =>
    Object.values(fields).every(f => f.error.value === null)
  )

  const hasErrors = computed(() =>
    Object.values(fields).some(f => f.error.value !== null)
  )

  return {
    models,
    errors,
    values,
    isDirty,
    isValid,
    hasErrors,
    reset: () => {
      Object.values(fields).forEach(f => f.reset())
    },
    resetField: (field: keyof T) => {
      fields[field as string]?.reset()
    },
    validate: () => {
      let valid = true
      for (const f of Object.values(fields)) {
        if (!f.validate()) valid = false
      }
      return valid
    },
    validateField: (field: keyof T) => {
      return fields[field as string]?.validate() ?? true
    },
    setValues: (newValues: Partial<T>) => {
      for (const [key, value] of Object.entries(newValues)) {
        if (fields[key]) {
          fields[key].model.value = value
        }
      }
    },
    setOriginalValues: (newValues: Partial<T>) => {
      for (const [key, value] of Object.entries(newValues)) {
        const field = fields[key]
        if (field) {
          field.model.value = value
          field.setAsOriginal()
        }
      }
    }
  }
}

// ============================================================================
// OUTPUT CREATORS (Read-only derived state)
// ============================================================================

/**
 * Creates a read-only computed output
 */
export function createOutput<T>(getter: () => T): ComputedRef<T> {
  return computed(getter)
}

/**
 * Creates a simple reactive state (for internal ViewModel use)
 */
export function createState<T>(initialValue: T): Ref<T> {
  return ref(initialValue) as Ref<T>
}

// ============================================================================
// EFFECT EMITTER
// ============================================================================

export type EffectHandler<T extends Effect> = (effect: T) => void
export type Unsubscribe = () => void

export interface EffectEmitter<T extends Effect = Effect> {
  emit: (effect: T) => void
  subscribe: (handler: EffectHandler<T>) => Unsubscribe
}

/**
 * Creates an effect emitter for side effects (navigation, toasts, dialogs)
 */
export function createEffectEmitter<T extends Effect = Effect>(): EffectEmitter<T> {
  const handlers: Array<EffectHandler<T>> = []

  return {
    emit(effect: T) {
      handlers.forEach(handler => handler(effect))
    },
    subscribe(handler: EffectHandler<T>): Unsubscribe {
      handlers.push(handler)
      return () => {
        const index = handlers.indexOf(handler)
        if (index > -1) handlers.splice(index, 1)
      }
    }
  }
}

// ============================================================================
// LOADING STATE HELPER
// ============================================================================

export interface LoadingStateResult {
  isLoading: Ref<boolean>
  error: Ref<string | null>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  withLoading: <T>(fn: () => Promise<T>) => Promise<T>
}

export function createLoadingState(): LoadingStateResult {
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  return {
    isLoading,
    error,
    setLoading: (loading: boolean) => { isLoading.value = loading },
    setError: (err: string | null) => { error.value = err },
    clearError: () => { error.value = null },
    async withLoading<T>(fn: () => Promise<T>): Promise<T> {
      isLoading.value = true
      error.value = null
      try {
        return await fn()
      } finally {
        isLoading.value = false
      }
    }
  }
}

// ============================================================================
// PAGINATION STATE HELPER
// ============================================================================

export interface PaginationConfig {
  currentPage: number
  totalPages: number
  total: number
  perPage: number
}

export interface PaginationStateResult {
  // Models (v-model compatible)
  currentPage: Ref<number>

  // Outputs (read-only)
  totalPages: Ref<number>
  total: Ref<number>
  perPage: Ref<number>
  showingStart: ComputedRef<number>
  showingEnd: ComputedRef<number>
  hasNextPage: ComputedRef<boolean>
  hasPrevPage: ComputedRef<boolean>

  // Inputs (actions)
  update: (config: Partial<PaginationConfig>) => void
  nextPage: () => void
  prevPage: () => void
  goToPage: (page: number) => void
}

export function createPaginationState(initialPerPage = 6): PaginationStateResult {
  const currentPage = ref(1)
  const totalPages = ref(1)
  const total = ref(0)
  const perPage = ref(initialPerPage)

  const showingStart = computed(() =>
    total.value === 0 ? 0 : (currentPage.value - 1) * perPage.value + 1
  )

  const showingEnd = computed(() =>
    Math.min(currentPage.value * perPage.value, total.value)
  )

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPrevPage = computed(() => currentPage.value > 1)

  return {
    currentPage,
    totalPages,
    total,
    perPage,
    showingStart,
    showingEnd,
    hasNextPage,
    hasPrevPage,
    update: (config: Partial<PaginationConfig>) => {
      if (config.currentPage !== undefined) currentPage.value = config.currentPage
      if (config.totalPages !== undefined) totalPages.value = config.totalPages
      if (config.total !== undefined) total.value = config.total
      if (config.perPage !== undefined) perPage.value = config.perPage
    },
    nextPage: () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
      }
    },
    prevPage: () => {
      if (currentPage.value > 1) {
        currentPage.value--
      }
    },
    goToPage: (page: number) => {
      if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
      }
    }
  }
}

// ============================================================================
// DIALOG STATE HELPER
// ============================================================================

export interface DialogStateResult<T = unknown> {
  isOpen: Ref<boolean>
  data: Ref<T | null>
  open: (data?: T) => void
  close: () => void
  confirm: () => T | null
}

export function createDialogState<T = unknown>(): DialogStateResult<T> {
  const isOpen = ref(false)
  const data = ref<T | null>(null) as Ref<T | null>

  return {
    isOpen,
    data,
    open: (newData?: T) => {
      data.value = newData ?? null
      isOpen.value = true
    },
    close: () => {
      isOpen.value = false
      data.value = null
    },
    confirm: () => {
      const result = data.value
      isOpen.value = false
      data.value = null
      return result
    }
  }
}

// ============================================================================
// SEARCH STATE HELPER
// ============================================================================

export interface SearchStateResult {
  query: Ref<string>
  isSearching: ComputedRef<boolean>
  debouncedQuery: Ref<string>
  clear: () => void
}

export function createSearchState(debounceMs = 300): SearchStateResult {
  const query = ref('')
  const debouncedQuery = ref('')
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  watch(query, (newQuery) => {
    if (timeoutId) clearTimeout(timeoutId)

    if (newQuery === '') {
      debouncedQuery.value = ''
    } else {
      timeoutId = setTimeout(() => {
        debouncedQuery.value = newQuery
      }, debounceMs)
    }
  })

  const isSearching = computed(() => query.value.length > 0)

  return {
    query,
    isSearching,
    debouncedQuery,
    clear: () => {
      query.value = ''
      debouncedQuery.value = ''
      if (timeoutId) clearTimeout(timeoutId)
    }
  }
}

// ============================================================================
// SELECTION STATE HELPER
// ============================================================================

export interface SelectionStateResult<T> {
  selected: Ref<T | null>
  select: (item: T) => void
  clear: () => void
  isSelected: (item: T) => boolean
}

export function createSelectionState<T>(): SelectionStateResult<T> {
  const selected = ref<T | null>(null) as Ref<T | null>

  return {
    selected,
    select: (item: T) => { selected.value = item },
    clear: () => { selected.value = null },
    isSelected: (item: T) => selected.value === item
  }
}

// ============================================================================
// BASE VIEWMODEL INTERFACE
// ============================================================================

/**
 * Base interface for ViewModels with I/O/E pattern + v-model support
 */
export interface BaseViewModel<
  TModels extends Record<string, Ref<unknown>> = Record<string, Ref<unknown>>,
  TOutputs extends Record<string, ComputedRef<unknown> | Ref<unknown>> = Record<string, ComputedRef<unknown>>,
  TInputs extends Record<string, (...args: unknown[]) => unknown> = Record<string, (...args: unknown[]) => unknown>,
  TEffects extends Effect = Effect
> {
  /** Two-way bindable state (v-model compatible) */
  models: TModels

  /** Read-only derived state */
  outputs: TOutputs

  /** Action methods */
  inputs: TInputs

  /** Side effect emitter */
  effects: EffectEmitter<TEffects>

  /** Cleanup function */
  dispose?: () => void
}
