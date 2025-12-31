import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import AlertMessage from '@/presentation/components/shared/AlertMessage.vue'

describe('AlertMessage', () => {
  describe('types', () => {
    it('should render success alert', () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'success', message: 'Success message' }
      })

      expect(wrapper.find('.alert-success').exists()).toBe(true)
      expect(wrapper.find('.bi-check-circle-fill').exists()).toBe(true)
    })

    it('should render danger alert', () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'danger', message: 'Error message' }
      })

      expect(wrapper.find('.alert-danger').exists()).toBe(true)
      expect(wrapper.find('.bi-exclamation-triangle-fill').exists()).toBe(true)
    })

    it('should render warning alert', () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'warning', message: 'Warning message' }
      })

      expect(wrapper.find('.alert-warning').exists()).toBe(true)
      expect(wrapper.find('.bi-exclamation-triangle-fill').exists()).toBe(true)
    })

    it('should render info alert', () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'info', message: 'Info message' }
      })

      expect(wrapper.find('.alert-info').exists()).toBe(true)
      expect(wrapper.find('.bi-info-circle-fill').exists()).toBe(true)
    })
  })

  describe('message', () => {
    it('should display the message', () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'success', message: 'Test message content' }
      })

      expect(wrapper.text()).toContain('Test message content')
    })
  })

  describe('dismissible', () => {
    it('should not show close button by default', () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'success', message: 'Message' }
      })

      expect(wrapper.find('.btn-close').exists()).toBe(false)
    })

    it('should show close button when dismissible', () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'success', message: 'Message', dismissible: true }
      })

      expect(wrapper.find('.btn-close').exists()).toBe(true)
      expect(wrapper.find('.alert-dismissible').exists()).toBe(true)
    })

    it('should emit dismiss on close button click', async () => {
      const wrapper = mount(AlertMessage, {
        props: { type: 'success', message: 'Message', dismissible: true }
      })

      await wrapper.find('.btn-close').trigger('click')

      expect(wrapper.emitted('dismiss')).toBeTruthy()
    })
  })
})
