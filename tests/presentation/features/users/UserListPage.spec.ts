import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { nextTick } from 'vue'
import UserListPage from '@/presentation/features/users/UserListPage.vue'
import { userService } from '@/domain/services/user.service'
import type { UserListResult } from '@/domain/entities/user.entity'

// Mock user service
vi.mock('@/domain/services/user.service', () => ({
  userService: {
    getUsers: vi.fn(),
    searchUsers: vi.fn(),
    deleteUser: vi.fn()
  }
}))

// Mock router
vi.mock('@/router', () => ({
  navGraph: {
    users: {
      toList: vi.fn(),
      toCreate: vi.fn(),
      toDetail: vi.fn(),
      toEdit: vi.fn()
    }
  }
}))

describe('UserListPage', () => {
  const mockUserListResult: UserListResult = {
    users: [
      { id: 1, email: 'test1@example.com', firstName: 'John', lastName: 'Doe', avatar: 'https://example.com/1.jpg' },
      { id: 2, email: 'test2@example.com', firstName: 'Jane', lastName: 'Smith', avatar: 'https://example.com/2.jpg' }
    ],
    page: 1,
    perPage: 6,
    total: 12,
    totalPages: 2
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(userService.getUsers).mockResolvedValue(mockUserListResult)
    vi.mocked(userService.searchUsers).mockResolvedValue(mockUserListResult)
    vi.mocked(userService.deleteUser).mockResolvedValue()
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.text()).toContain('User Management')
    })

    it('should render add new user button', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Add New User')
    })

    it('should render search input', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('should render refresh button', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Refresh')
    })
  })

  describe('users table', () => {
    it('should fetch users on mount', async () => {
      mount(UserListPage)
      await flushPromises()

      expect(userService.getUsers).toHaveBeenCalledWith(1)
    })

    it('should display users in table', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.text()).toContain('John')
      expect(wrapper.text()).toContain('Doe')
      expect(wrapper.text()).toContain('Jane')
      expect(wrapper.text()).toContain('Smith')
    })

    it('should display user emails', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.text()).toContain('test1@example.com')
      expect(wrapper.text()).toContain('test2@example.com')
    })

    it('should display pagination info', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.text()).toContain('1')
      expect(wrapper.text()).toContain('12')
    })
  })

  describe('empty state', () => {
    it('should show empty state when no users', async () => {
      vi.mocked(userService.getUsers).mockResolvedValue({
        ...mockUserListResult,
        users: [],
        total: 0
      })

      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.text()).toContain('No users found')
    })
  })

  describe('loading state', () => {
    it('should show loading spinner while fetching', async () => {
      vi.mocked(userService.getUsers).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUserListResult), 100))
      )

      const wrapper = mount(UserListPage)
      await nextTick() // Wait for onMounted to trigger loadUsers

      expect(wrapper.find('.spinner-border').exists()).toBe(true)

      await flushPromises()
    })
  })

  describe('pagination', () => {
    it('should render pagination buttons', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.find('.pagination').exists()).toBe(true)
    })

    it('should fetch next page on pagination click', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      const pageButtons = wrapper.findAll('.page-link')
      const page2Button = pageButtons.find(btn => btn.text() === '2')

      if (page2Button) {
        await page2Button.trigger('click')
        await flushPromises()

        expect(userService.getUsers).toHaveBeenCalledWith(2)
      }
    })
  })

  describe('search', () => {
    it('should search users on input', async () => {
      vi.useFakeTimers()
      const wrapper = mount(UserListPage)
      await flushPromises()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('John')

      vi.advanceTimersByTime(400) // Wait for debounce
      await flushPromises()

      expect(userService.searchUsers).toHaveBeenCalledWith('John', 1)

      vi.useRealTimers()
    })

    it('should fetch all users when search is cleared', async () => {
      vi.useFakeTimers()
      const wrapper = mount(UserListPage)
      await flushPromises()

      const input = wrapper.find('input[type="text"]')
      await input.setValue('test')
      vi.advanceTimersByTime(400)
      await flushPromises()

      await input.setValue('')
      vi.advanceTimersByTime(100)
      await flushPromises()

      expect(userService.getUsers).toHaveBeenCalled()

      vi.useRealTimers()
    })
  })

  describe('actions', () => {
    it('should render action buttons for each user', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      const rows = wrapper.findAll('tbody tr')
      rows.forEach(row => {
        expect(row.find('.bi-eye').exists()).toBe(true)
        expect(row.find('.bi-pencil').exists()).toBe(true)
        expect(row.find('.bi-trash').exists()).toBe(true)
      })
    })

    it('should show delete confirmation dialog', async () => {
      const wrapper = mount(UserListPage)
      await flushPromises()

      const deleteButton = wrapper.find('.bi-trash')
      await deleteButton.trigger('click')

      expect(wrapper.findComponent({ name: 'ConfirmationDialog' }).props('show')).toBe(true)
    })
  })

  describe('error handling', () => {
    it('should show error message on fetch failure', async () => {
      vi.mocked(userService.getUsers).mockRejectedValue(new Error('Network error'))

      const wrapper = mount(UserListPage)
      await flushPromises()

      expect(wrapper.findComponent({ name: 'AlertMessage' }).exists()).toBe(true)
    })
  })
})
