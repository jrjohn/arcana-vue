import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserPanelComponent from '@/presentation/components/layout/UserPanelComponent.vue'

describe('UserPanelComponent', () => {
  describe('rendering', () => {
    it('should render user panel', () => {
      const wrapper = mount(UserPanelComponent)
      expect(wrapper.find('.user-panel').exists()).toBe(true)
    })

    it('should render user avatar', () => {
      const wrapper = mount(UserPanelComponent)
      expect(wrapper.find('.avatar').exists()).toBe(true)
    })

    it('should render user name', () => {
      const wrapper = mount(UserPanelComponent)
      expect(wrapper.find('.user-name').exists()).toBe(true)
      expect(wrapper.find('.user-name').text()).toBe('John Doe')
    })

    it('should render user email', () => {
      const wrapper = mount(UserPanelComponent)
      expect(wrapper.find('.user-email').exists()).toBe(true)
      expect(wrapper.find('.user-email').text()).toBe('john.doe@example.com')
    })

    it('should have correct avatar src', () => {
      const wrapper = mount(UserPanelComponent)
      const avatar = wrapper.find('.avatar')
      expect(avatar.attributes('src')).toBe('https://reqres.in/img/faces/1-image.jpg')
    })

    it('should have correct avatar alt text', () => {
      const wrapper = mount(UserPanelComponent)
      const avatar = wrapper.find('.avatar')
      expect(avatar.attributes('alt')).toBe('John Doe')
    })
  })

  describe('structure', () => {
    it('should have flex container', () => {
      const wrapper = mount(UserPanelComponent)
      expect(wrapper.find('.d-flex').exists()).toBe(true)
    })

    it('should have user info section', () => {
      const wrapper = mount(UserPanelComponent)
      expect(wrapper.find('.user-info').exists()).toBe(true)
    })
  })
})
