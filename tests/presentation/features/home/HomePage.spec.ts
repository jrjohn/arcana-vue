import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import HomePage from '@/presentation/features/home/HomePage.vue'
import { userService } from '@/domain/services/user.service'
import type { UserListResult } from '@/domain/entities/user.entity'

// Mock user service
vi.mock('@/domain/services/user.service', () => ({
  userService: {
    getUsers: vi.fn()
  }
}))

describe('HomePage', () => {
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
  })

  describe('rendering', () => {
    it('should render welcome message', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('Welcome')
    })

    it('should render stats cards', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.findAll('.card').length).toBeGreaterThanOrEqual(4)
    })

    it('should render total users stat', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('12') // Total users
    })

    it('should render active projects stat', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('12') // Active projects
    })

    it('should render pending tasks stat', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('28') // Pending tasks
    })

    it('should render messages stat', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('156') // Messages
    })
  })

  describe('recent users', () => {
    it('should fetch users on mount', async () => {
      mount(HomePage)
      await flushPromises()

      expect(userService.getUsers).toHaveBeenCalledWith(1)
    })

    it('should display recent users', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('John Doe')
      expect(wrapper.text()).toContain('Jane Smith')
    })

    it('should display user emails', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('test1@example.com')
      expect(wrapper.text()).toContain('test2@example.com')
    })

    it('should show max 5 users', async () => {
      const manyUsers: UserListResult = {
        ...mockUserListResult,
        users: Array(10).fill(null).map((_, i) => ({
          id: i + 1,
          email: `user${i}@example.com`,
          firstName: `User`,
          lastName: `${i}`,
          avatar: ''
        }))
      }
      vi.mocked(userService.getUsers).mockResolvedValue(manyUsers)

      const wrapper = mount(HomePage)
      await flushPromises()

      const tableRows = wrapper.findAll('tbody tr')
      expect(tableRows.length).toBeLessThanOrEqual(5)
    })
  })

  describe('quick actions', () => {
    it('should render add new user button', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('Add New User')
    })

    it('should render create project button', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('Create Project')
    })

    it('should render add task button', async () => {
      const wrapper = mount(HomePage)
      await flushPromises()

      expect(wrapper.text()).toContain('Add Task')
    })
  })

  describe('error handling', () => {
    it('should handle API errors gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      vi.mocked(userService.getUsers).mockRejectedValue(new Error('Network error'))

      const wrapper = mount(HomePage)
      await flushPromises()

      expect(consoleSpy).toHaveBeenCalledWith('Failed to load users:', expect.any(Error))
      consoleSpy.mockRestore()
    })
  })
})
