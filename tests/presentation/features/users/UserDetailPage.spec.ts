import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref, nextTick } from 'vue'
import UserDetailPage from '@/presentation/features/users/UserDetailPage.vue'
import { userService } from '@/domain/services/user.service'
import type { User } from '@/domain/entities/user.entity'

// Mock user service
vi.mock('@/domain/services/user.service', () => ({
  userService: {
    getUserById: vi.fn(),
    deleteUser: vi.fn()
  }
}))

// Mock router
const mockRouteParams = ref({ id: '1' })
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value
  })
}))

vi.mock('@/router', () => ({
  navGraph: {
    users: {
      toList: vi.fn(),
      toEdit: vi.fn()
    }
  }
}))

describe('UserDetailPage', () => {
  const mockUser: User = {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/avatar.jpg'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRouteParams.value = { id: '1' }
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    vi.mocked(userService.deleteUser).mockResolvedValue()
  })

  describe('rendering', () => {
    it('should render page title', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('User Details')
    })

    it('should render back button', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Back to Users')
    })

    it('should render user avatar', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      const avatar = wrapper.find('img.rounded-circle')
      expect(avatar.exists()).toBe(true)
      expect(avatar.attributes('src')).toBe('https://example.com/avatar.jpg')
    })

    it('should render user name', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('John Doe')
    })

    it('should render user email', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('john@example.com')
    })

    it('should render edit button', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Edit User')
    })

    it('should render delete button', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Delete User')
    })
  })

  describe('user information', () => {
    it('should fetch user on mount', async () => {
      mount(UserDetailPage)
      await flushPromises()

      expect(userService.getUserById).toHaveBeenCalledWith(1)
    })

    it('should display first name', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('John')
    })

    it('should display last name', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Doe')
    })

    it('should display user ID', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('#1')
    })
  })

  describe('activity section', () => {
    it('should render activity section', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Recent Activity')
    })

    it('should render activity items', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Profile Updated')
      expect(wrapper.text()).toContain('Task Completed')
      expect(wrapper.text()).toContain('Message Sent')
    })
  })

  describe('loading state', () => {
    it('should show loading spinner while fetching', async () => {
      vi.mocked(userService.getUserById).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      )

      const wrapper = mount(UserDetailPage)
      await nextTick() // Wait for onMounted to trigger loadUser

      expect(wrapper.find('.spinner-border').exists()).toBe(true)

      await flushPromises()
    })
  })

  describe('error handling', () => {
    it('should show error for invalid ID', async () => {
      mockRouteParams.value = { id: 'invalid' }

      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.findComponent({ name: 'AlertMessage' }).exists()).toBe(true)
    })

    it('should show error on fetch failure', async () => {
      vi.mocked(userService.getUserById).mockRejectedValue(new Error('Not found'))

      const wrapper = mount(UserDetailPage)
      await flushPromises()

      expect(wrapper.findComponent({ name: 'AlertMessage' }).exists()).toBe(true)
    })
  })

  describe('delete', () => {
    it('should show delete confirmation dialog', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      const deleteButton = wrapper.find('.btn-outline-danger')
      await deleteButton.trigger('click')

      expect(wrapper.findComponent({ name: 'ConfirmationDialog' }).props('show')).toBe(true)
    })

    it('should delete user on confirm', async () => {
      const wrapper = mount(UserDetailPage)
      await flushPromises()

      // Open dialog
      const deleteButton = wrapper.find('.btn-outline-danger')
      await deleteButton.trigger('click')

      // Find and click confirm in dialog
      const dialog = wrapper.findComponent({ name: 'ConfirmationDialog' })
      dialog.vm.$emit('confirm')
      await flushPromises()

      expect(userService.deleteUser).toHaveBeenCalledWith(1)
    })
  })
})
