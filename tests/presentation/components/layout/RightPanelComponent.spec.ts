import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import RightPanelComponent from '@/presentation/components/layout/RightPanelComponent.vue'

describe('RightPanelComponent', () => {
  describe('visibility', () => {
    it('should not have open class when closed', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: false }
      })
      expect(wrapper.find('.right-panel.open').exists()).toBe(false)
    })

    it('should have open class when open', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })
      expect(wrapper.find('.right-panel.open').exists()).toBe(true)
    })
  })

  describe('header', () => {
    it('should render panel header', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })
      expect(wrapper.find('.panel-header').exists()).toBe(true)
    })

    it('should render title', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })
      expect(wrapper.find('.panel-header h6').exists()).toBe(true)
    })

    it('should render close button', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })
      expect(wrapper.find('.bi-x-lg').exists()).toBe(true)
    })
  })

  describe('content', () => {
    it('should render activity list', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })
      expect(wrapper.find('.activity-list').exists()).toBe(true)
    })

    it('should render 4 activity items', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })
      const items = wrapper.findAll('.activity-item')
      expect(items.length).toBe(4)
    })

    it('should render activity avatars', () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })
      const avatars = wrapper.findAll('.activity-item img')
      expect(avatars.length).toBe(4)
    })
  })

  describe('events', () => {
    it('should emit close on close button click', async () => {
      const wrapper = mount(RightPanelComponent, {
        props: { open: true }
      })

      await wrapper.find('.bi-x-lg').trigger('click')

      expect(wrapper.emitted('close')).toBeTruthy()
    })
  })
})
