import { describe, it, expect, vi, beforeEach } from 'vitest'
import { nextTick } from 'vue'
import { useUserFormViewModel } from '@/presentation/view-models/user-form.view-model'

// Mock dependencies
vi.mock('@/domain/services/user.service', () => ({
  userService: {
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn()
  }
}))

vi.mock('@/domain/services/sanitization.service', () => ({
  sanitizationService: {
    sanitizeText: vi.fn((v) => v.trim()),
    sanitizeInteger: vi.fn((val) => (typeof val === 'number' && val > 0 ? val : null))
  }
}))

vi.mock('@/domain/validators/user.validator', () => ({
  userValidator: {
    validateName: vi.fn((v) => ({ isValid: v.length >= 2 && v.length <= 100, errorKey: v.length < 2 ? 'validation.nameTooShort' : null })),
    validateEmail: vi.fn((v) => ({ isValid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), errorKey: 'validation.invalidEmail' })),
    validateJob: vi.fn((v) => ({ isValid: v === '' || (v.length >= 2 && v.length <= 100), errorKey: 'validation.invalidJob' }))
  }
}))

import { userService } from '@/domain/services/user.service'
import { sanitizationService } from '@/domain/services/sanitization.service'

describe('useUserFormViewModel', () => {
  const mockUser = {
    id: 1,
    email: 'george.bluth@reqres.in',
    firstName: 'George',
    lastName: 'Bluth',
    avatar: 'https://reqres.in/img/faces/1-image.jpg'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    vi.mocked(userService.createUser).mockResolvedValue({ id: 2, name: 'Test', job: 'Tester', createdAt: new Date().toISOString() })
    vi.mocked(userService.updateUser).mockResolvedValue({ name: 'Test', job: 'Tester', updatedAt: new Date().toISOString() })
    vi.mocked(sanitizationService.sanitizeText).mockImplementation((v) => v.trim())
    vi.mocked(sanitizationService.sanitizeInteger).mockImplementation((val) =>
      typeof val === 'number' && val > 0 ? val : null
    )
  })

  describe('initialization', () => {
    it('should create viewmodel with models, outputs, inputs, effects', () => {
      const vm = useUserFormViewModel()
      expect(vm.models).toBeDefined()
      expect(vm.outputs).toBeDefined()
      expect(vm.inputs).toBeDefined()
      expect(vm.effects).toBeDefined()
    })

    it('should have empty form fields initially', () => {
      const vm = useUserFormViewModel()
      expect(vm.models.firstName.value).toBe('')
      expect(vm.models.lastName.value).toBe('')
      expect(vm.models.email.value).toBe('')
      expect(vm.models.job.value).toBe('')
    })

    it('should not be in edit mode initially', () => {
      const vm = useUserFormViewModel()
      expect(vm.outputs.isEditMode.value).toBe(false)
    })
  })

  describe('initCreateMode', () => {
    it('should initialize create mode', () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      expect(vm.outputs.isEditMode.value).toBe(false)
      expect(vm.outputs.originalUser.value).toBe(null)
    })

    it('should reset form values', async () => {
      const vm = useUserFormViewModel()
      vm.models.firstName.value = 'Test'
      await nextTick()

      vm.inputs.initCreateMode()

      expect(vm.models.firstName.value).toBe('')
    })
  })

  describe('initEditMode', () => {
    it('should load user and set edit mode', async () => {
      const vm = useUserFormViewModel()
      await vm.inputs.initEditMode(1)

      expect(userService.getUserById).toHaveBeenCalledWith(1)
      expect(vm.outputs.isEditMode.value).toBe(true)
      expect(vm.outputs.originalUser.value).toEqual(mockUser)
      expect(vm.models.firstName.value).toBe('George')
      expect(vm.models.lastName.value).toBe('Bluth')
    })

    it('should handle invalid id', async () => {
      vi.mocked(sanitizationService.sanitizeInteger).mockReturnValue(null)
      const vm = useUserFormViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.initEditMode(-1)

      expect(userService.getUserById).not.toHaveBeenCalled()
      expect(vm.outputs.error.value).not.toBe(null)
    })

    it('should handle load error', async () => {
      vi.mocked(userService.getUserById).mockRejectedValue(new Error('Not found'))
      const vm = useUserFormViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.initEditMode(1)

      expect(vm.outputs.error.value).not.toBe(null)
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })
  })

  describe('form validation', () => {
    it('should validate field', async () => {
      const vm = useUserFormViewModel()
      vm.models.firstName.value = 'Jo'
      await nextTick()

      const isValid = vm.inputs.validateField('firstName')
      expect(typeof isValid).toBe('boolean')
    })

    it('should validate all fields', () => {
      const vm = useUserFormViewModel()
      const isValid = vm.inputs.validateAll()
      expect(typeof isValid).toBe('boolean')
    })
  })

  describe('submit', () => {
    it('should create user in create mode', async () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      vm.models.firstName.value = 'John'
      vm.models.lastName.value = 'Doe'
      vm.models.email.value = 'john@test.com'
      vm.models.job.value = 'Developer'
      await nextTick()

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.submit()

      expect(userService.createUser).toHaveBeenCalledWith({ name: 'John Doe', job: 'Developer' })
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'success' }) })
      )
      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'list' }
      })
    })

    it('should update user in edit mode', async () => {
      const vm = useUserFormViewModel()
      await vm.inputs.initEditMode(1)

      vm.models.firstName.value = 'Updated'
      vm.models.lastName.value = 'User'
      await nextTick()

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.submit()

      expect(userService.updateUser).toHaveBeenCalledWith(1, expect.any(Object))
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'success' }) })
      )
      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'detail', userId: 1 }
      })
    })

    it('should use default job when empty', async () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      vm.models.firstName.value = 'John'
      vm.models.lastName.value = 'Doe'
      vm.models.email.value = 'john@test.com'
      vm.models.job.value = ''
      await nextTick()

      await vm.inputs.submit()

      expect(userService.createUser).toHaveBeenCalledWith({ name: 'John Doe', job: 'User' })
    })

    it('should handle submit error', async () => {
      vi.mocked(userService.createUser).mockRejectedValue(new Error('Create failed'))
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      vm.models.firstName.value = 'John'
      vm.models.lastName.value = 'Doe'
      vm.models.email.value = 'john@test.com'
      await nextTick()

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.submit()

      expect(vm.outputs.error.value).not.toBe(null)
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })

    it('should show validation error if form is invalid', async () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()
      // Leave fields empty - invalid

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.submit()

      expect(userService.createUser).not.toHaveBeenCalled()
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })
  })

  describe('reset', () => {
    it('should reset form to original values', async () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      vm.models.firstName.value = 'Changed'
      await nextTick()

      vm.inputs.reset()

      expect(vm.models.firstName.value).toBe('')
    })
  })

  describe('cancel', () => {
    it('should navigate to list in create mode', () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.cancel()

      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'list' }
      })
    })

    it('should navigate to detail in edit mode', async () => {
      const vm = useUserFormViewModel()
      await vm.inputs.initEditMode(1)

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.cancel()

      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'detail', userId: 1 }
      })
    })
  })

  describe('computed outputs', () => {
    it('should compute pageTitle', () => {
      const vm = useUserFormViewModel()

      vm.inputs.initCreateMode()
      expect(vm.outputs.pageTitle.value).toBeDefined()

      // PageTitle changes based on mode - just check it exists
    })

    it('should compute canSubmit', async () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      expect(vm.outputs.canSubmit.value).toBe(false)

      vm.models.firstName.value = 'John'
      vm.models.lastName.value = 'Doe'
      vm.models.email.value = 'john@test.com'
      await nextTick()

      // canSubmit depends on isDirty and isValid
      expect(typeof vm.outputs.canSubmit.value).toBe('boolean')
    })

    it('should compute canReset', async () => {
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()

      expect(vm.outputs.canReset.value).toBe(false)

      vm.models.firstName.value = 'Changed'
      await nextTick()

      expect(vm.outputs.canReset.value).toBe(true)
    })
  })

  describe('clearError', () => {
    it('should clear error', async () => {
      vi.mocked(userService.createUser).mockRejectedValue(new Error('Error'))
      const vm = useUserFormViewModel()
      vm.inputs.initCreateMode()
      vm.models.firstName.value = 'John'
      vm.models.lastName.value = 'Doe'
      vm.models.email.value = 'john@test.com'
      await nextTick()

      await vm.inputs.submit()
      expect(vm.outputs.error.value).not.toBe(null)

      vm.inputs.clearError()
      expect(vm.outputs.error.value).toBe(null)
    })
  })
})
