import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useUserDetailViewModel } from '@/presentation/view-models/user-detail.view-model'

// Mock dependencies
vi.mock('@/domain/services/user.service', () => ({
  userService: {
    getUserById: vi.fn(),
    deleteUser: vi.fn()
  }
}))

vi.mock('@/domain/services/sanitization.service', () => ({
  sanitizationService: {
    sanitizeInteger: vi.fn((val) => (typeof val === 'number' && val > 0 ? val : null))
  }
}))

import { userService } from '@/domain/services/user.service'
import { sanitizationService } from '@/domain/services/sanitization.service'

describe('useUserDetailViewModel', () => {
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
    vi.mocked(userService.deleteUser).mockResolvedValue(undefined)
    vi.mocked(sanitizationService.sanitizeInteger).mockImplementation((val) =>
      typeof val === 'number' && val > 0 ? val : null
    )
  })

  describe('initialization', () => {
    it('should create viewmodel with models, outputs, inputs, effects', () => {
      const vm = useUserDetailViewModel()
      expect(vm.models).toBeDefined()
      expect(vm.outputs).toBeDefined()
      expect(vm.inputs).toBeDefined()
      expect(vm.effects).toBeDefined()
    })

    it('should have null user initially', () => {
      const vm = useUserDetailViewModel()
      expect(vm.outputs.user.value).toBe(null)
    })

    it('should not be loading initially', () => {
      const vm = useUserDetailViewModel()
      expect(vm.outputs.isLoading.value).toBe(false)
    })

    it('should have empty fullName initially', () => {
      const vm = useUserDetailViewModel()
      expect(vm.outputs.fullName.value).toBe('')
    })

    it('should have empty initials initially', () => {
      const vm = useUserDetailViewModel()
      expect(vm.outputs.initials.value).toBe('')
    })
  })

  describe('loadUser', () => {
    it('should load user by id', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      expect(userService.getUserById).toHaveBeenCalledWith(1)
      expect(vm.outputs.user.value).toEqual(mockUser)
    })

    it('should set loading state while fetching', async () => {
      const vm = useUserDetailViewModel()
      let loadingDuringFetch = false

      vi.mocked(userService.getUserById).mockImplementation(async () => {
        loadingDuringFetch = vm.outputs.isLoading.value
        return mockUser
      })

      await vm.inputs.loadUser(1)
      expect(loadingDuringFetch).toBe(true)
      expect(vm.outputs.isLoading.value).toBe(false)
    })

    it('should handle invalid id', async () => {
      vi.mocked(sanitizationService.sanitizeInteger).mockReturnValue(null)
      const vm = useUserDetailViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.loadUser(-1)

      expect(userService.getUserById).not.toHaveBeenCalled()
      expect(vm.outputs.error.value).not.toBe(null)
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })

    it('should handle load error', async () => {
      vi.mocked(userService.getUserById).mockRejectedValue(new Error('Not found'))
      const vm = useUserDetailViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.loadUser(1)

      expect(vm.outputs.error.value).not.toBe(null)
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })
  })

  describe('refreshUser', () => {
    it('should refresh current user', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)
      vi.clearAllMocks()

      await vm.inputs.refreshUser()

      expect(userService.getUserById).toHaveBeenCalledWith(1)
    })

    it('should not refresh if no user loaded', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.refreshUser()

      expect(userService.getUserById).not.toHaveBeenCalled()
    })
  })

  describe('computed outputs', () => {
    it('should compute hasUser', async () => {
      const vm = useUserDetailViewModel()
      expect(vm.outputs.hasUser.value).toBe(false)

      await vm.inputs.loadUser(1)
      expect(vm.outputs.hasUser.value).toBe(true)
    })

    it('should compute fullName', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      expect(vm.outputs.fullName.value).toBe('George Bluth')
    })

    it('should compute initials', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      expect(vm.outputs.initials.value).toBe('GB')
    })

    it('should compute canEdit', async () => {
      const vm = useUserDetailViewModel()
      expect(vm.outputs.canEdit.value).toBe(false)

      await vm.inputs.loadUser(1)
      expect(vm.outputs.canEdit.value).toBe(true)
    })

    it('should compute canDelete', async () => {
      const vm = useUserDetailViewModel()
      expect(vm.outputs.canDelete.value).toBe(false)

      await vm.inputs.loadUser(1)
      expect(vm.outputs.canDelete.value).toBe(true)
    })
  })

  describe('navigation', () => {
    it('should emit goBack navigation effect', () => {
      const vm = useUserDetailViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.goBack()

      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'list' }
      })
    })

    it('should emit editUser navigation effect', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.editUser()

      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'edit', userId: 1 }
      })
    })

    it('should not emit editUser effect when no user', () => {
      const vm = useUserDetailViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.editUser()

      expect(effectHandler).not.toHaveBeenCalled()
    })
  })

  describe('delete', () => {
    it('should open delete dialog', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.confirmDelete()

      expect(vm.outputs.showDeleteDialog.value).toBe(true)
      expect(effectHandler).toHaveBeenCalledWith({
        type: 'dialog',
        payload: { action: 'openDelete' }
      })
    })

    it('should not open dialog when no user', () => {
      const vm = useUserDetailViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.confirmDelete()

      expect(vm.outputs.showDeleteDialog.value).toBe(false)
      expect(effectHandler).not.toHaveBeenCalled()
    })

    it('should execute delete', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.executeDelete()

      expect(userService.deleteUser).toHaveBeenCalledWith(1)
      expect(vm.outputs.showDeleteDialog.value).toBe(false)
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'success' }) })
      )
      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'list' }
      })
    })

    it('should not delete when no user', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.executeDelete()

      expect(userService.deleteUser).not.toHaveBeenCalled()
    })

    it('should handle delete error', async () => {
      vi.mocked(userService.deleteUser).mockRejectedValue(new Error('Delete failed'))
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.executeDelete()

      expect(vm.outputs.error.value).not.toBe(null)
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })

    it('should cancel delete', async () => {
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)
      vm.inputs.confirmDelete()

      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.cancelDelete()

      expect(vm.outputs.showDeleteDialog.value).toBe(false)
      expect(effectHandler).toHaveBeenCalledWith({
        type: 'dialog',
        payload: { action: 'closeDelete' }
      })
    })
  })

  describe('clearError', () => {
    it('should clear error', async () => {
      vi.mocked(userService.getUserById).mockRejectedValue(new Error('Error'))
      const vm = useUserDetailViewModel()
      await vm.inputs.loadUser(1)

      expect(vm.outputs.error.value).not.toBe(null)

      vm.inputs.clearError()
      expect(vm.outputs.error.value).toBe(null)
    })
  })
})
