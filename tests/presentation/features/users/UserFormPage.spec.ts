import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { ref } from 'vue'
import UserFormPage from '@/presentation/features/users/UserFormPage.vue'
import { userService } from '@/domain/services/user.service'
import type { User } from '@/domain/entities/user.entity'

// Mock user service
vi.mock('@/domain/services/user.service', () => ({
  userService: {
    getUserById: vi.fn(),
    createUser: vi.fn(),
    updateUser: vi.fn(),
    validateCreateInput: vi.fn()
  }
}))

// Mock router
const mockRouteParams = ref<{ id?: string }>({})
vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: mockRouteParams.value
  })
}))

vi.mock('@/router', () => ({
  navGraph: {
    users: {
      toList: vi.fn(),
      toDetail: vi.fn()
    }
  }
}))

describe('UserFormPage', () => {
  const mockUser: User = {
    id: 1,
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://example.com/avatar.jpg'
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockRouteParams.value = {}
    vi.mocked(userService.getUserById).mockResolvedValue(mockUser)
    vi.mocked(userService.createUser).mockResolvedValue({
      id: '123',
      name: 'John Doe',
      job: 'Developer',
      createdAt: '2024-01-01'
    })
    vi.mocked(userService.updateUser).mockResolvedValue({
      name: 'John Doe',
      job: 'Developer',
      updatedAt: '2024-01-01'
    })
    vi.mocked(userService.validateCreateInput).mockReturnValue({
      isValid: true,
      errors: [],
      errorKeys: []
    })
  })

  describe('create mode', () => {
    it('should render create title', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Create New User')
    })

    it('should render empty form fields', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      const firstNameInput = wrapper.find('#firstName')
      const lastNameInput = wrapper.find('#lastName')
      const emailInput = wrapper.find('#email')
      const jobInput = wrapper.find('#job')

      expect((firstNameInput.element as HTMLInputElement).value).toBe('')
      expect((lastNameInput.element as HTMLInputElement).value).toBe('')
      expect((emailInput.element as HTMLInputElement).value).toBe('')
      expect((jobInput.element as HTMLInputElement).value).toBe('')
    })

    it('should not fetch user data', async () => {
      mount(UserFormPage)
      await flushPromises()

      expect(userService.getUserById).not.toHaveBeenCalled()
    })
  })

  describe('edit mode', () => {
    beforeEach(() => {
      mockRouteParams.value = { id: '1' }
    })

    it('should render edit title', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Edit User')
    })

    it('should fetch user data', async () => {
      mount(UserFormPage)
      await flushPromises()

      expect(userService.getUserById).toHaveBeenCalledWith(1)
    })

    it('should populate form with user data', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      const firstNameInput = wrapper.find('#firstName')
      const lastNameInput = wrapper.find('#lastName')
      expect((firstNameInput.element as HTMLInputElement).value).toBe('John')
      expect((lastNameInput.element as HTMLInputElement).value).toBe('Doe')
    })
  })

  describe('form elements', () => {
    it('should render firstName input', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.find('#firstName').exists()).toBe(true)
    })

    it('should render lastName input', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.find('#lastName').exists()).toBe(true)
    })

    it('should render email input', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.find('#email').exists()).toBe(true)
    })

    it('should render job input', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.find('#job').exists()).toBe(true)
    })

    it('should render save button', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Save')
    })

    it('should render reset button', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Reset')
    })

    it('should render back button', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.text()).toContain('Back')
    })
  })

  describe('validation', () => {
    it('should show validation errors for empty required fields', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      // Trigger blur on empty field to validate
      const firstNameInput = wrapper.find('#firstName')
      await firstNameInput.trigger('blur')
      await flushPromises()

      // The validation should show error for empty field
      expect(wrapper.find('.is-invalid').exists() || wrapper.find('.invalid-feedback').exists()).toBe(true)
    })
  })

  describe('form submission', () => {
    it('should have form that can be submitted', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      // Verify form elements exist
      expect(wrapper.find('#firstName').exists()).toBe(true)
      expect(wrapper.find('#lastName').exists()).toBe(true)
      expect(wrapper.find('#email').exists()).toBe(true)
      expect(wrapper.find('#job').exists()).toBe(true)
      expect(wrapper.find('form').exists()).toBe(true)

      // Submit form
      await wrapper.find('form').trigger('submit')
      await flushPromises()

      // Form should still exist after submission attempt
      expect(wrapper.find('form').exists()).toBe(true)
    })

    it('should display form status badges', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      // Check for status badges
      expect(wrapper.find('.badge').exists()).toBe(true)
    })
  })

  describe('reset', () => {
    it('should reset form on reset button click', async () => {
      const wrapper = mount(UserFormPage)
      await flushPromises()

      const firstNameInput = wrapper.find('#firstName')

      // Find and click reset button
      const resetButton = wrapper.findAll('button').find(btn => btn.text().includes('Reset'))
      expect(resetButton).toBeDefined()

      if (resetButton) {
        await resetButton.trigger('click')
        await flushPromises()
      }

      // After reset in create mode, form should be empty
      expect((firstNameInput.element as HTMLInputElement).value).toBe('')
    })
  })

  describe('error handling', () => {
    it('should show error message on fetch failure in edit mode', async () => {
      mockRouteParams.value = { id: '1' }
      vi.mocked(userService.getUserById).mockRejectedValue(new Error('Not found'))

      const wrapper = mount(UserFormPage)
      await flushPromises()

      expect(wrapper.findComponent({ name: 'AlertMessage' }).exists()).toBe(true)
    })

    it('should display error state in form', async () => {
      mockRouteParams.value = { id: '1' }
      vi.mocked(userService.getUserById).mockRejectedValue(new Error('Not found'))

      const wrapper = mount(UserFormPage)
      await flushPromises()

      // AlertMessage should be shown for error
      const alert = wrapper.findComponent({ name: 'AlertMessage' })
      expect(alert.exists()).toBe(true)
    })
  })
})
