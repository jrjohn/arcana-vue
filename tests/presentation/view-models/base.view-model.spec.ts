import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import {
  createModel,
  createFormModels,
  createOutput,
  createState,
  createEffectEmitter,
  createLoadingState,
  createPaginationState,
  createDialogState,
  createSearchState,
  createSelectionState
} from '@/presentation/view-models/base.view-model'

describe('base.view-model', () => {
  describe('createModel', () => {
    it('should create model with initial value', () => {
      const { model } = createModel('initial')
      expect(model.value).toBe('initial')
    })

    it('should allow setting value', () => {
      const { model } = createModel('initial')
      model.value = 'updated'
      expect(model.value).toBe('updated')
    })

    it('should track dirty state', async () => {
      const { model, isDirty } = createModel('initial')
      expect(isDirty.value).toBe(false)

      model.value = 'changed'
      await nextTick()

      expect(isDirty.value).toBe(true)
    })

    it('should not be dirty if value is same as original', async () => {
      const { model, isDirty } = createModel('initial')
      model.value = 'changed'
      await nextTick()
      expect(isDirty.value).toBe(true)

      model.value = 'initial'
      await nextTick()
      expect(isDirty.value).toBe(false)
    })

    it('should apply transform function', () => {
      const { model } = createModel('', {
        transform: (v) => v.trim().toUpperCase()
      })
      model.value = '  test  '
      expect(model.value).toBe('TEST')
    })

    it('should apply validation function', async () => {
      const { model, error, validate } = createModel('', {
        validate: (v) => v.length < 3 ? 'Too short' : null
      })

      model.value = 'ab'
      await nextTick()
      expect(error.value).toBe('Too short')

      model.value = 'abc'
      await nextTick()
      expect(error.value).toBe(null)
    })

    it('should call onChange callback', async () => {
      const onChange = vi.fn()
      const { model } = createModel('initial', { onChange })

      model.value = 'changed'
      await nextTick()

      expect(onChange).toHaveBeenCalledWith('changed', 'initial')
    })

    it('should reset to original value', async () => {
      const { model, isDirty, error, reset } = createModel('original', {
        validate: (v) => v === '' ? 'Required' : null
      })

      model.value = ''
      await nextTick()
      expect(isDirty.value).toBe(true)
      expect(error.value).toBe('Required')

      reset()
      expect(model.value).toBe('original')
      expect(isDirty.value).toBe(false)
      expect(error.value).toBe(null)
    })

    it('should validate manually', () => {
      const { model, validate, error } = createModel('', {
        validate: (v) => v === '' ? 'Required' : null
      })

      const isValid = validate()
      expect(isValid).toBe(false)
      expect(error.value).toBe('Required')

      model.value = 'test'
      const isValid2 = validate()
      expect(isValid2).toBe(true)
    })

    it('should return true when no validation function', () => {
      const { validate } = createModel('test')
      expect(validate()).toBe(true)
    })

    it('should set current value as original', async () => {
      const { model, isDirty, setAsOriginal } = createModel('initial')

      model.value = 'changed'
      await nextTick()
      expect(isDirty.value).toBe(true)

      setAsOriginal()
      expect(isDirty.value).toBe(false)

      // Now 'changed' is the new original
      model.value = 'changed'
      await nextTick()
      expect(isDirty.value).toBe(false)
    })
  })

  describe('createFormModels', () => {
    it('should create models for each field', () => {
      const form = createFormModels({ name: '', email: '' })
      expect(form.models.name.value).toBe('')
      expect(form.models.email.value).toBe('')
    })

    it('should create errors for each field', () => {
      const form = createFormModels({ name: '', email: '' })
      expect(form.errors.name.value).toBe(null)
      expect(form.errors.email.value).toBe(null)
    })

    it('should compute values', () => {
      const form = createFormModels({ name: 'John', email: 'john@test.com' })
      expect(form.values.value).toEqual({ name: 'John', email: 'john@test.com' })
    })

    it('should track isDirty across all fields', async () => {
      const form = createFormModels({ name: '', email: '' })
      expect(form.isDirty.value).toBe(false)

      form.models.name.value = 'John'
      await nextTick()
      expect(form.isDirty.value).toBe(true)
    })

    it('should track isValid across all fields', async () => {
      const form = createFormModels(
        { name: '', email: '' },
        {
          name: { validate: (v) => v === '' ? 'Required' : null },
          email: { validate: (v) => v === '' ? 'Required' : null }
        }
      )

      form.models.name.value = 'John'
      form.models.email.value = 'john@test.com'
      await nextTick()

      expect(form.isValid.value).toBe(true)
    })

    it('should track hasErrors', async () => {
      const form = createFormModels(
        { name: '' },
        { name: { validate: (v) => v === '' ? 'Required' : null } }
      )

      expect(form.hasErrors.value).toBe(false)

      form.validate()
      expect(form.hasErrors.value).toBe(true)
    })

    it('should reset all fields', async () => {
      const form = createFormModels({ name: 'original', email: 'original@test.com' })
      form.models.name.value = 'changed'
      form.models.email.value = 'changed@test.com'
      await nextTick()

      form.reset()
      expect(form.models.name.value).toBe('original')
      expect(form.models.email.value).toBe('original@test.com')
    })

    it('should reset single field', async () => {
      const form = createFormModels({ name: 'original', email: 'original@test.com' })
      form.models.name.value = 'changed'
      form.models.email.value = 'changed@test.com'
      await nextTick()

      form.resetField('name')
      expect(form.models.name.value).toBe('original')
      expect(form.models.email.value).toBe('changed@test.com')
    })

    it('should validate all fields', () => {
      const form = createFormModels(
        { name: '', email: '' },
        {
          name: { validate: (v) => v === '' ? 'Required' : null },
          email: { validate: (v) => v === '' ? 'Required' : null }
        }
      )

      const isValid = form.validate()
      expect(isValid).toBe(false)
      expect(form.errors.name.value).toBe('Required')
      expect(form.errors.email.value).toBe('Required')
    })

    it('should validate single field', () => {
      const form = createFormModels(
        { name: '', email: '' },
        { name: { validate: (v) => v === '' ? 'Required' : null } }
      )

      const isValid = form.validateField('name')
      expect(isValid).toBe(false)

      const isValidEmail = form.validateField('email')
      expect(isValidEmail).toBe(true)
    })

    it('should set multiple values', () => {
      const form = createFormModels({ name: '', email: '' })
      form.setValues({ name: 'John', email: 'john@test.com' })

      expect(form.models.name.value).toBe('John')
      expect(form.models.email.value).toBe('john@test.com')
    })

    it('should set original values', async () => {
      const form = createFormModels({ name: '', email: '' })
      form.setOriginalValues({ name: 'John', email: 'john@test.com' })
      await nextTick()

      expect(form.models.name.value).toBe('John')
      expect(form.isDirty.value).toBe(false)
    })
  })

  describe('createOutput', () => {
    it('should create computed output', () => {
      const count = createState(5)
      const doubled = createOutput(() => count.value * 2)

      expect(doubled.value).toBe(10)
      count.value = 10
      expect(doubled.value).toBe(20)
    })
  })

  describe('createState', () => {
    it('should create reactive state', () => {
      const state = createState({ count: 0 })
      expect(state.value.count).toBe(0)

      state.value.count = 5
      expect(state.value.count).toBe(5)
    })
  })

  describe('createEffectEmitter', () => {
    it('should emit effects to subscribers', () => {
      const emitter = createEffectEmitter()
      const handler = vi.fn()

      emitter.subscribe(handler)
      emitter.emit({ type: 'toast', payload: { message: 'Test' } })

      expect(handler).toHaveBeenCalledWith({ type: 'toast', payload: { message: 'Test' } })
    })

    it('should allow unsubscribing', () => {
      const emitter = createEffectEmitter()
      const handler = vi.fn()

      const unsubscribe = emitter.subscribe(handler)
      unsubscribe()
      emitter.emit({ type: 'toast', payload: {} })

      expect(handler).not.toHaveBeenCalled()
    })

    it('should support multiple subscribers', () => {
      const emitter = createEffectEmitter()
      const handler1 = vi.fn()
      const handler2 = vi.fn()

      emitter.subscribe(handler1)
      emitter.subscribe(handler2)
      emitter.emit({ type: 'toast', payload: { message: 'Test' } })

      expect(handler1).toHaveBeenCalled()
      expect(handler2).toHaveBeenCalled()
    })
  })

  describe('createLoadingState', () => {
    it('should initialize with loading false', () => {
      const loading = createLoadingState()
      expect(loading.isLoading.value).toBe(false)
      expect(loading.error.value).toBe(null)
    })

    it('should set loading state', () => {
      const loading = createLoadingState()
      loading.setLoading(true)
      expect(loading.isLoading.value).toBe(true)
    })

    it('should set error', () => {
      const loading = createLoadingState()
      loading.setError('Network error')
      expect(loading.error.value).toBe('Network error')
    })

    it('should clear error', () => {
      const loading = createLoadingState()
      loading.setError('Error')
      loading.clearError()
      expect(loading.error.value).toBe(null)
    })

    it('should handle withLoading success', async () => {
      const loading = createLoadingState()
      const result = await loading.withLoading(async () => {
        expect(loading.isLoading.value).toBe(true)
        return 'success'
      })

      expect(result).toBe('success')
      expect(loading.isLoading.value).toBe(false)
    })

    it('should handle withLoading error', async () => {
      const loading = createLoadingState()

      await expect(
        loading.withLoading(async () => {
          throw new Error('Failed')
        })
      ).rejects.toThrow('Failed')

      expect(loading.isLoading.value).toBe(false)
    })
  })

  describe('createPaginationState', () => {
    it('should initialize with default values', () => {
      const pagination = createPaginationState()
      expect(pagination.currentPage.value).toBe(1)
      expect(pagination.totalPages.value).toBe(1)
      expect(pagination.total.value).toBe(0)
      expect(pagination.perPage.value).toBe(6)
    })

    it('should calculate showingStart and showingEnd', () => {
      const pagination = createPaginationState(10)
      pagination.update({ total: 50, totalPages: 5 })

      expect(pagination.showingStart.value).toBe(1)
      expect(pagination.showingEnd.value).toBe(10)

      pagination.goToPage(2)
      expect(pagination.showingStart.value).toBe(11)
      expect(pagination.showingEnd.value).toBe(20)
    })

    it('should return 0 for showingStart when total is 0', () => {
      const pagination = createPaginationState()
      expect(pagination.showingStart.value).toBe(0)
    })

    it('should calculate hasNextPage and hasPrevPage', () => {
      const pagination = createPaginationState()
      pagination.update({ totalPages: 3 })

      expect(pagination.hasPrevPage.value).toBe(false)
      expect(pagination.hasNextPage.value).toBe(true)

      pagination.goToPage(3)
      expect(pagination.hasPrevPage.value).toBe(true)
      expect(pagination.hasNextPage.value).toBe(false)
    })

    it('should go to next page', () => {
      const pagination = createPaginationState()
      pagination.update({ totalPages: 3 })

      pagination.nextPage()
      expect(pagination.currentPage.value).toBe(2)
    })

    it('should not go past last page', () => {
      const pagination = createPaginationState()
      pagination.update({ totalPages: 2 })
      pagination.goToPage(2)

      pagination.nextPage()
      expect(pagination.currentPage.value).toBe(2)
    })

    it('should go to prev page', () => {
      const pagination = createPaginationState()
      pagination.update({ totalPages: 3 })
      pagination.goToPage(2)

      pagination.prevPage()
      expect(pagination.currentPage.value).toBe(1)
    })

    it('should not go before first page', () => {
      const pagination = createPaginationState()
      pagination.prevPage()
      expect(pagination.currentPage.value).toBe(1)
    })

    it('should go to specific page', () => {
      const pagination = createPaginationState()
      pagination.update({ totalPages: 5 })

      pagination.goToPage(3)
      expect(pagination.currentPage.value).toBe(3)
    })

    it('should not go to invalid page', () => {
      const pagination = createPaginationState()
      pagination.update({ totalPages: 3 })

      pagination.goToPage(0)
      expect(pagination.currentPage.value).toBe(1)

      pagination.goToPage(10)
      expect(pagination.currentPage.value).toBe(1)
    })

    it('should update all values', () => {
      const pagination = createPaginationState()
      pagination.update({
        currentPage: 2,
        totalPages: 10,
        total: 100,
        perPage: 10
      })

      expect(pagination.currentPage.value).toBe(2)
      expect(pagination.totalPages.value).toBe(10)
      expect(pagination.total.value).toBe(100)
      expect(pagination.perPage.value).toBe(10)
    })
  })

  describe('createDialogState', () => {
    it('should initialize closed with no data', () => {
      const dialog = createDialogState()
      expect(dialog.isOpen.value).toBe(false)
      expect(dialog.data.value).toBe(null)
    })

    it('should open dialog', () => {
      const dialog = createDialogState()
      dialog.open()
      expect(dialog.isOpen.value).toBe(true)
    })

    it('should open dialog with data', () => {
      const dialog = createDialogState<{ id: number }>()
      dialog.open({ id: 1 })
      expect(dialog.isOpen.value).toBe(true)
      expect(dialog.data.value).toEqual({ id: 1 })
    })

    it('should close dialog and clear data', () => {
      const dialog = createDialogState<{ id: number }>()
      dialog.open({ id: 1 })
      dialog.close()

      expect(dialog.isOpen.value).toBe(false)
      expect(dialog.data.value).toBe(null)
    })

    it('should confirm and return data', () => {
      const dialog = createDialogState<{ id: number }>()
      dialog.open({ id: 1 })

      const result = dialog.confirm()
      expect(result).toEqual({ id: 1 })
      expect(dialog.isOpen.value).toBe(false)
      expect(dialog.data.value).toBe(null)
    })
  })

  describe('createSearchState', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should initialize with empty query', () => {
      const search = createSearchState()
      expect(search.query.value).toBe('')
      expect(search.debouncedQuery.value).toBe('')
      expect(search.isSearching.value).toBe(false)
    })

    it('should update isSearching when query changes', async () => {
      const search = createSearchState()
      search.query.value = 'test'
      await nextTick()

      expect(search.isSearching.value).toBe(true)
    })

    it('should debounce query changes', async () => {
      const search = createSearchState(300)
      search.query.value = 'test'
      await nextTick()

      expect(search.debouncedQuery.value).toBe('')

      vi.advanceTimersByTime(300)
      await nextTick()
      expect(search.debouncedQuery.value).toBe('test')
    })

    it('should immediately set debouncedQuery to empty when cleared', async () => {
      const search = createSearchState(300)
      search.query.value = 'test'
      await nextTick()
      vi.advanceTimersByTime(300)
      await nextTick()
      expect(search.debouncedQuery.value).toBe('test')

      search.query.value = ''
      await nextTick()
      expect(search.debouncedQuery.value).toBe('')
    })

    it('should clear search state', () => {
      const search = createSearchState()
      search.query.value = 'test'
      search.clear()

      expect(search.query.value).toBe('')
      expect(search.debouncedQuery.value).toBe('')
    })
  })

  describe('createSelectionState', () => {
    it('should initialize with null selection', () => {
      const selection = createSelectionState<{ id: number }>()
      expect(selection.selected.value).toBe(null)
    })

    it('should select item', () => {
      const selection = createSelectionState<{ id: number }>()
      const item = { id: 1 }
      selection.select(item)

      expect(selection.selected.value).toEqual(item)
    })

    it('should clear selection', () => {
      const selection = createSelectionState<{ id: number }>()
      selection.select({ id: 1 })
      selection.clear()

      expect(selection.selected.value).toBe(null)
    })

    it('should check if item is selected', () => {
      const selection = createSelectionState<{ id: number }>()
      const item = { id: 1 }
      selection.select(item)

      // Verify selected value
      expect(selection.selected.value).toStrictEqual(item)
    })
  })
})
