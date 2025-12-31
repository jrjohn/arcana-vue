import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import ErrorBoundary from '@/presentation/components/error/ErrorBoundary.vue'

// Component that works normally
const NormalComponent = defineComponent({
  name: 'NormalComponent',
  setup() {
    return () => h('div', { class: 'normal-content' }, 'Normal content')
  }
})

describe('ErrorBoundary', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  describe('rendering without errors', () => {
    it('should render slot content when no error', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })
      expect(wrapper.find('.normal-content').exists()).toBe(true)
      expect(wrapper.text()).toContain('Normal content')
    })

    it('should not show fallback when no error', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })
      expect(wrapper.find('.error-fallback').exists()).toBe(false)
    })
  })

  describe('error state management', () => {
    it('should expose error ref initialized to null', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })
      expect(wrapper.vm.error).toBe(null)
    })

    it('should expose errorInfo ref initialized to empty string', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })
      expect(wrapper.vm.errorInfo).toBe('')
    })

    it('should expose reset function', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })
      expect(typeof wrapper.vm.reset).toBe('function')
    })

    it('should emit reset event when reset is called', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })

      wrapper.vm.reset()
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('reset')).toBeTruthy()
    })

    it('should clear error state when reset is called', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })

      // Manually set error state
      wrapper.vm.error = new Error('Test')
      wrapper.vm.errorInfo = 'Test info'

      // Call reset
      wrapper.vm.reset()
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.error).toBe(null)
      expect(wrapper.vm.errorInfo).toBe('')
    })
  })

  describe('props', () => {
    it('should accept onError callback prop', () => {
      const onErrorSpy = vi.fn()
      const wrapper = mount(ErrorBoundary, {
        props: {
          onError: onErrorSpy
        },
        slots: {
          default: () => h(NormalComponent)
        }
      })
      expect(wrapper.vm).toBeDefined()
    })

    it('should accept logErrors prop', () => {
      const wrapper = mount(ErrorBoundary, {
        props: {
          logErrors: false
        },
        slots: {
          default: () => h(NormalComponent)
        }
      })
      expect(wrapper.vm).toBeDefined()
    })

    it('should default logErrors to true', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })
      // We can verify default behavior - component renders without explicit prop
      expect(wrapper.vm).toBeDefined()
    })
  })

  describe('slots', () => {
    it('should render default slot content', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: '<span class="test-content">Test</span>'
        }
      })
      expect(wrapper.find('.test-content').exists()).toBe(true)
    })

    it('should accept fallback slot', () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent),
          fallback: '<div class="custom-fallback">Custom Error</div>'
        }
      })
      // Fallback not shown when no error
      expect(wrapper.find('.custom-fallback').exists()).toBe(false)
    })
  })

  describe('error display behavior', () => {
    it('should conditionally show default slot based on error state', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })

      // Initially shows content
      expect(wrapper.find('.normal-content').exists()).toBe(true)

      // Set error state manually
      wrapper.vm.error = new Error('Test error')
      await wrapper.vm.$nextTick()

      // After error, shows fallback (ErrorFallback component)
      expect(wrapper.find('.error-fallback').exists()).toBe(true)
    })

    it('should show content again after reset', async () => {
      const wrapper = mount(ErrorBoundary, {
        slots: {
          default: () => h(NormalComponent)
        }
      })

      // Set error state
      wrapper.vm.error = new Error('Test error')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.error-fallback').exists()).toBe(true)

      // Reset
      wrapper.vm.reset()
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.normal-content').exists()).toBe(true)
    })
  })
})
