import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { nextTick } from 'vue'
import { useUserListViewModel } from '@/presentation/view-models/user-list.view-model'

// Mock the dependencies
vi.mock('@/domain/services/user.service', () => ({
  userService: {
    getUsers: vi.fn(),
    searchUsers: vi.fn(),
    deleteUser: vi.fn()
  }
}))

vi.mock('@/data/repositories/user.repository', () => ({
  userRepository: {
    prefetchUsers: vi.fn()
  }
}))

import { userService } from '@/domain/services/user.service'
import { userRepository } from '@/data/repositories/user.repository'

describe('useUserListViewModel', () => {
  const mockUsers = [
    { id: 1, email: 'george.bluth@reqres.in', firstName: 'George', lastName: 'Bluth', avatar: 'https://reqres.in/img/faces/1-image.jpg' },
    { id: 2, email: 'janet.weaver@reqres.in', firstName: 'Janet', lastName: 'Weaver', avatar: 'https://reqres.in/img/faces/2-image.jpg' }
  ]

  const mockUsersResponse = {
    users: mockUsers,
    page: 1,
    perPage: 6,
    total: 12,
    totalPages: 2
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userService.getUsers).mockResolvedValue(mockUsersResponse)
    vi.mocked(userService.searchUsers).mockResolvedValue({ ...mockUsersResponse, total: 2, totalPages: 1 })
    vi.mocked(userService.deleteUser).mockResolvedValue(undefined)
    vi.mocked(userRepository.prefetchUsers).mockResolvedValue(undefined)
  })

  describe('initialization', () => {
    it('should create viewmodel with models, outputs, inputs, effects', () => {
      const vm = useUserListViewModel()

      expect(vm.models).toBeDefined()
      expect(vm.outputs).toBeDefined()
      expect(vm.inputs).toBeDefined()
      expect(vm.effects).toBeDefined()
    })

    it('should have search query model', () => {
      const vm = useUserListViewModel()
      expect(vm.models.searchQuery.value).toBe('')
    })

    it('should have current page model', () => {
      const vm = useUserListViewModel()
      expect(vm.models.currentPage.value).toBe(1)
    })

    it('should have empty users initially', () => {
      const vm = useUserListViewModel()
      expect(vm.outputs.users.value).toEqual([])
    })

    it('should not be loading initially', () => {
      const vm = useUserListViewModel()
      expect(vm.outputs.isLoading.value).toBe(false)
    })
  })

  describe('loadUsers', () => {
    it('should load users and update state', async () => {
      const vm = useUserListViewModel()

      await vm.inputs.loadUsers()

      expect(userService.getUsers).toHaveBeenCalledWith(1)
      expect(vm.outputs.users.value).toEqual(mockUsers)
      expect(vm.outputs.totalPages.value).toBe(2)
      expect(vm.outputs.total.value).toBe(12)
    })

    it('should set loading state while fetching', async () => {
      const vm = useUserListViewModel()

      let loadingDuringFetch = false
      vi.mocked(userService.getUsers).mockImplementation(async () => {
        loadingDuringFetch = vm.outputs.isLoading.value
        return mockUsersResponse
      })

      await vm.inputs.loadUsers()

      expect(loadingDuringFetch).toBe(true)
      expect(vm.outputs.isLoading.value).toBe(false)
    })

    it('should load specific page', async () => {
      const vm = useUserListViewModel()

      await vm.inputs.loadUsers(2)

      expect(userService.getUsers).toHaveBeenCalledWith(2)
    })

    it('should handle error', async () => {
      vi.mocked(userService.getUsers).mockRejectedValue(new Error('Network error'))
      const vm = useUserListViewModel()

      await vm.inputs.loadUsers()

      expect(vm.outputs.error.value).not.toBe(null)
      expect(vm.outputs.isLoading.value).toBe(false)
    })

    it('should emit toast effect on error', async () => {
      vi.mocked(userService.getUsers).mockRejectedValue(new Error('Network error'))
      const vm = useUserListViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      await vm.inputs.loadUsers()

      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })
  })

  describe('refreshUsers', () => {
    it('should refresh current page', async () => {
      // Mock response with page 2
      vi.mocked(userService.getUsers).mockResolvedValue({
        ...mockUsersResponse,
        page: 2
      })
      const vm = useUserListViewModel()

      await vm.inputs.loadUsers(2)
      expect(vm.models.currentPage.value).toBe(2)
      vi.clearAllMocks()

      await vm.inputs.refreshUsers()

      expect(userService.getUsers).toHaveBeenCalledWith(2)
    })
  })

  describe('prefetchNextPage', () => {
    it('should prefetch next page when available', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()

      await vm.inputs.prefetchNextPage()

      expect(userRepository.prefetchUsers).toHaveBeenCalledWith([2])
    })

    it('should not prefetch when on last page', async () => {
      vi.mocked(userService.getUsers).mockResolvedValue({
        ...mockUsersResponse,
        page: 2,
        totalPages: 2
      })
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers(2)

      await vm.inputs.prefetchNextPage()

      expect(userRepository.prefetchUsers).not.toHaveBeenCalled()
    })
  })

  describe('pagination', () => {
    it('should go to specific page', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()

      vm.inputs.goToPage(2)

      expect(userService.getUsers).toHaveBeenLastCalledWith(2)
    })

    it('should not go to invalid page', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()
      vi.clearAllMocks()

      vm.inputs.goToPage(0)
      vm.inputs.goToPage(10)

      expect(userService.getUsers).not.toHaveBeenCalled()
    })

    it('should go to next page', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()
      vi.clearAllMocks()

      vm.inputs.goToNextPage()

      expect(userService.getUsers).toHaveBeenCalledWith(2)
    })

    it('should not go to next page when on last page', async () => {
      vi.mocked(userService.getUsers).mockResolvedValue({
        ...mockUsersResponse,
        page: 2,
        totalPages: 2
      })
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers(2)
      vi.clearAllMocks()

      vm.inputs.goToNextPage()

      expect(userService.getUsers).not.toHaveBeenCalled()
    })

    it('should go to previous page', async () => {
      vi.mocked(userService.getUsers).mockResolvedValue({
        ...mockUsersResponse,
        page: 2
      })
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers(2)
      vi.clearAllMocks()

      vm.inputs.goToPrevPage()

      expect(userService.getUsers).toHaveBeenCalledWith(1)
    })

    it('should not go to previous page when on first page', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()
      vi.clearAllMocks()

      vm.inputs.goToPrevPage()

      expect(userService.getUsers).not.toHaveBeenCalled()
    })
  })

  describe('navigation effects', () => {
    it('should emit navigation effect for viewUser', () => {
      const vm = useUserListViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.viewUser(mockUsers[0])

      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'detail', userId: 1 }
      })
    })

    it('should emit navigation effect for editUser', () => {
      const vm = useUserListViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.editUser(mockUsers[0])

      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'edit', userId: 1 }
      })
    })

    it('should emit navigation effect for createUser', () => {
      const vm = useUserListViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.createUser()

      expect(effectHandler).toHaveBeenCalledWith({
        type: 'navigation',
        payload: { route: 'create' }
      })
    })
  })

  describe('delete', () => {
    it('should open delete dialog', () => {
      const vm = useUserListViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.confirmDelete(mockUsers[0])

      expect(vm.outputs.showDeleteDialog.value).toBe(true)
      expect(effectHandler).toHaveBeenCalledWith({
        type: 'dialog',
        payload: { action: 'openDelete' }
      })
    })

    it('should execute delete', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()

      vm.inputs.confirmDelete(mockUsers[0])
      await vm.inputs.executeDelete()

      expect(userService.deleteUser).toHaveBeenCalledWith(1)
      expect(vm.outputs.showDeleteDialog.value).toBe(false)
      expect(vm.outputs.successMessage.value).not.toBe('')
    })

    it('should not delete without confirmation', async () => {
      const vm = useUserListViewModel()

      await vm.inputs.executeDelete()

      expect(userService.deleteUser).not.toHaveBeenCalled()
    })

    it('should handle delete error', async () => {
      vi.mocked(userService.deleteUser).mockRejectedValue(new Error('Delete failed'))
      const vm = useUserListViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.confirmDelete(mockUsers[0])
      await vm.inputs.executeDelete()

      expect(vm.outputs.error.value).not.toBe(null)
      expect(effectHandler).toHaveBeenCalledWith(
        expect.objectContaining({ type: 'toast', payload: expect.objectContaining({ variant: 'error' }) })
      )
    })

    it('should cancel delete', () => {
      const vm = useUserListViewModel()
      const effectHandler = vi.fn()
      vm.effects.subscribe(effectHandler)

      vm.inputs.confirmDelete(mockUsers[0])
      vm.inputs.cancelDelete()

      expect(vm.outputs.showDeleteDialog.value).toBe(false)
      expect(effectHandler).toHaveBeenCalledWith({
        type: 'dialog',
        payload: { action: 'closeDelete' }
      })
    })
  })

  describe('search', () => {
    beforeEach(() => {
      vi.useFakeTimers()
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should clear search', async () => {
      const vm = useUserListViewModel()
      vm.models.searchQuery.value = 'test'

      vm.inputs.clearSearch()

      expect(vm.models.searchQuery.value).toBe('')
    })
  })

  describe('messages', () => {
    it('should clear success message', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()
      vm.inputs.confirmDelete(mockUsers[0])
      await vm.inputs.executeDelete()

      vm.inputs.clearSuccessMessage()

      expect(vm.outputs.successMessage.value).toBe('')
    })

    it('should clear error', async () => {
      vi.mocked(userService.getUsers).mockRejectedValue(new Error('Error'))
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()

      vm.inputs.clearError()

      expect(vm.outputs.error.value).toBe(null)
    })
  })

  describe('computed outputs', () => {
    it('should compute hasUsers', async () => {
      const vm = useUserListViewModel()

      expect(vm.outputs.hasUsers.value).toBe(false)

      await vm.inputs.loadUsers()

      expect(vm.outputs.hasUsers.value).toBe(true)
    })

    it('should compute isEmpty', async () => {
      const vm = useUserListViewModel()

      expect(vm.outputs.isEmpty.value).toBe(true)

      await vm.inputs.loadUsers()

      expect(vm.outputs.isEmpty.value).toBe(false)
    })

    it('should compute showingStart and showingEnd', async () => {
      const vm = useUserListViewModel()
      await vm.inputs.loadUsers()

      expect(vm.outputs.showingStart.value).toBe(1)
      expect(vm.outputs.showingEnd.value).toBe(6)
    })
  })

  describe('dispose', () => {
    it('should cleanup on dispose', () => {
      const vm = useUserListViewModel()
      vm.models.searchQuery.value = 'test'

      vm.dispose()

      expect(vm.models.searchQuery.value).toBe('')
    })
  })
})
