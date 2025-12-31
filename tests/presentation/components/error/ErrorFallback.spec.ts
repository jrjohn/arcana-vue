import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ErrorFallback from '@/presentation/components/error/ErrorFallback.vue'

describe('ErrorFallback', () => {
  const mockError = new Error('Test error message')
  mockError.stack = 'Error: Test error message\n    at test.ts:1:1'

  let originalLocation: Location

  beforeEach(() => {
    originalLocation = window.location
    // @ts-expect-error - mocking location
    delete window.location
    window.location = {
      ...originalLocation,
      reload: vi.fn(),
      href: ''
    } as unknown as Location
  })

  afterEach(() => {
    window.location = originalLocation
  })

  describe('rendering', () => {
    it('should render error fallback container', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      expect(wrapper.find('.error-fallback').exists()).toBe(true)
    })

    it('should render error icon', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      expect(wrapper.find('.bi-exclamation-triangle-fill').exists()).toBe(true)
    })

    it('should render title', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      expect(wrapper.find('.error-fallback__title').exists()).toBe(true)
    })

    it('should render message', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      expect(wrapper.find('.error-fallback__message').exists()).toBe(true)
    })

    it('should render action buttons', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      const buttons = wrapper.findAll('button')
      expect(buttons.length).toBe(3) // Retry, Reload, Home
    })
  })

  describe('error details', () => {
    it('should show details when showDetails is true', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError, showDetails: true }
      })
      expect(wrapper.find('.error-fallback__details').exists()).toBe(true)
    })

    it('should hide details when showDetails is false', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError, showDetails: false }
      })
      expect(wrapper.find('.error-fallback__details').exists()).toBe(false)
    })

    it('should display error message in details', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError, showDetails: true }
      })
      expect(wrapper.find('.error-fallback__error-message').text()).toContain('Test error message')
    })

    it('should display error info when provided', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError, errorInfo: 'Component lifecycle', showDetails: true }
      })
      expect(wrapper.find('.error-fallback__error-info').text()).toContain('Component lifecycle')
    })

    it('should display stack trace when available', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError, showDetails: true }
      })
      expect(wrapper.find('.error-fallback__stack').text()).toContain('at test.ts:1:1')
    })

    it('should handle error without stack trace', () => {
      const errorWithoutStack = new Error('No stack')
      errorWithoutStack.stack = undefined
      const wrapper = mount(ErrorFallback, {
        props: { error: errorWithoutStack, showDetails: true }
      })
      expect(wrapper.find('.error-fallback__stack').exists()).toBe(false)
    })

    it('should use fallback message for error without message', () => {
      const emptyError = new Error('')
      const wrapper = mount(ErrorFallback, {
        props: { error: emptyError, showDetails: true }
      })
      // Should show fallback translation key
      expect(wrapper.find('.error-fallback__error-message').exists()).toBe(true)
    })
  })

  describe('actions', () => {
    it('should emit retry event when retry button is clicked', async () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })

      await wrapper.find('.btn-primary').trigger('click')

      expect(wrapper.emitted('retry')).toBeTruthy()
      expect(wrapper.emitted('retry')?.length).toBe(1)
    })

    it('should reload page when reload button is clicked', async () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })

      const reloadButton = wrapper.findAll('button')[1]
      await reloadButton.trigger('click')

      expect(window.location.reload).toHaveBeenCalled()
    })

    it('should navigate home when home button is clicked', async () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })

      const homeButton = wrapper.findAll('button')[2]
      await homeButton.trigger('click')

      expect(window.location.href).toBe('/')
    })
  })

  describe('button icons', () => {
    it('should render retry icon', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      expect(wrapper.find('.bi-arrow-clockwise').exists()).toBe(true)
    })

    it('should render reload icon', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      expect(wrapper.find('.bi-arrow-repeat').exists()).toBe(true)
    })

    it('should render home icon', () => {
      const wrapper = mount(ErrorFallback, {
        props: { error: mockError }
      })
      expect(wrapper.find('.bi-house').exists()).toBe(true)
    })
  })
})
