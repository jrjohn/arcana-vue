import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import LoadingSpinner from '@/presentation/components/shared/LoadingSpinner.vue'

describe('LoadingSpinner', () => {
  describe('default rendering', () => {
    it('should render spinner without overlay', () => {
      const wrapper = mount(LoadingSpinner)

      expect(wrapper.find('.loading-overlay').exists()).toBe(false)
      expect(wrapper.find('.spinner-border').exists()).toBe(true)
    })

    it('should have visually hidden loading text', () => {
      const wrapper = mount(LoadingSpinner)

      expect(wrapper.find('.visually-hidden').exists()).toBe(true)
    })
  })

  describe('overlay mode', () => {
    it('should render with overlay when prop is true', () => {
      const wrapper = mount(LoadingSpinner, {
        props: { overlay: true }
      })

      expect(wrapper.find('.loading-overlay').exists()).toBe(true)
    })

    it('should show loading text in overlay mode', () => {
      const wrapper = mount(LoadingSpinner, {
        props: { overlay: true }
      })

      expect(wrapper.text()).toContain('Loading')
    })
  })

  describe('sizes', () => {
    it('should apply small size class', () => {
      const wrapper = mount(LoadingSpinner, {
        props: { size: 'sm' }
      })

      expect(wrapper.find('.spinner-border-sm').exists()).toBe(true)
    })

    it('should apply large size class', () => {
      const wrapper = mount(LoadingSpinner, {
        props: { size: 'lg' }
      })

      expect(wrapper.find('.spinner-border-lg').exists()).toBe(true)
    })

    it('should not apply size class for medium', () => {
      const wrapper = mount(LoadingSpinner, {
        props: { size: 'md' }
      })

      expect(wrapper.find('.spinner-border-sm').exists()).toBe(false)
      expect(wrapper.find('.spinner-border-lg').exists()).toBe(false)
    })
  })
})
