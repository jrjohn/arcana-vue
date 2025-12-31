import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ConfirmationDialog from '@/presentation/components/shared/ConfirmationDialog.vue'

describe('ConfirmationDialog', () => {
  const defaultProps = {
    show: true,
    title: 'Confirm Action',
    message: 'Are you sure?'
  }

  describe('visibility', () => {
    it('should not render when show is false', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: { ...defaultProps, show: false }
      })

      expect(wrapper.find('.modal').exists()).toBe(false)
    })

    it('should render when show is true', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      expect(wrapper.find('.modal').exists()).toBe(true)
    })

    it('should render backdrop when shown', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-backdrop').exists()).toBe(true)
    })
  })

  describe('content', () => {
    it('should display title', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-title').text()).toBe('Confirm Action')
    })

    it('should display message', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      expect(wrapper.find('.modal-body').text()).toBe('Are you sure?')
    })
  })

  describe('buttons', () => {
    it('should use default button texts', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      expect(wrapper.find('.btn-secondary').text()).toContain('Cancel')
      expect(wrapper.find('.btn-primary').text()).toContain('Confirm')
    })

    it('should use custom button texts', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: {
          ...defaultProps,
          confirmText: 'Yes, delete',
          cancelText: 'No, keep it'
        }
      })

      expect(wrapper.find('.btn-secondary').text()).toBe('No, keep it')
      expect(wrapper.find('.btn-primary, .btn-danger').text()).toBe('Yes, delete')
    })
  })

  describe('variants', () => {
    it('should use primary variant by default', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      expect(wrapper.find('.btn-primary').exists()).toBe(true)
    })

    it('should use danger variant', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: { ...defaultProps, variant: 'danger' }
      })

      expect(wrapper.find('.btn-danger').exists()).toBe(true)
    })

    it('should use warning variant', () => {
      const wrapper = mount(ConfirmationDialog, {
        props: { ...defaultProps, variant: 'warning' }
      })

      expect(wrapper.find('.btn-warning').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('should emit confirm on confirm button click', async () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      await wrapper.find('.btn-primary').trigger('click')

      expect(wrapper.emitted('confirm')).toBeTruthy()
    })

    it('should emit cancel on cancel button click', async () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      await wrapper.find('.btn-secondary').trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('should emit cancel on close button click', async () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      await wrapper.find('.btn-close').trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })

    it('should emit cancel on backdrop click', async () => {
      const wrapper = mount(ConfirmationDialog, {
        props: defaultProps
      })

      await wrapper.find('.modal').trigger('click')

      expect(wrapper.emitted('cancel')).toBeTruthy()
    })
  })
})
