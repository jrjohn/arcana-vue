import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import HeaderComponent from '@/presentation/components/layout/HeaderComponent.vue'

describe('HeaderComponent', () => {
  describe('rendering', () => {
    it('should render header element', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.app-header').exists()).toBe(true)
    })

    it('should render search input', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('should render sidebar toggle button', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.bi-list').exists()).toBe(true)
    })

    it('should render language selector', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.bi-globe').exists()).toBe(true)
    })

    it('should render notification badge', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.bi-bell').exists()).toBe(true)
    })

    it('should render messages badge', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.bi-envelope').exists()).toBe(true)
    })

    it('should render right panel toggle', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.bi-layout-sidebar-reverse').exists()).toBe(true)
    })

    it('should render user avatar', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('img.rounded-circle').exists()).toBe(true)
    })
  })

  describe('events', () => {
    it('should emit toggle-sidebar on menu button click', async () => {
      const wrapper = mount(HeaderComponent)
      await wrapper.find('.bi-list').trigger('click')
      expect(wrapper.emitted('toggle-sidebar')).toBeTruthy()
    })

    it('should emit toggle-right-panel on panel button click', async () => {
      const wrapper = mount(HeaderComponent)
      await wrapper.find('.bi-layout-sidebar-reverse').trigger('click')
      expect(wrapper.emitted('toggle-right-panel')).toBeTruthy()
    })
  })

  describe('search', () => {
    it('should update search query on input', async () => {
      const wrapper = mount(HeaderComponent)
      const input = wrapper.find('input[type="text"]')

      await input.setValue('test search')

      expect((input.element as HTMLInputElement).value).toBe('test search')
    })

    it('should handle search on enter', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const wrapper = mount(HeaderComponent)
      const input = wrapper.find('input[type="text"]')

      await input.setValue('test query')
      await input.trigger('keyup.enter')

      expect(consoleSpy).toHaveBeenCalledWith('Search:', 'test query')
      consoleSpy.mockRestore()
    })
  })

  describe('language dropdown', () => {
    it('should toggle language dropdown on click', async () => {
      const wrapper = mount(HeaderComponent)

      // Initially closed
      expect(wrapper.find('.dropdown-menu.show').exists()).toBe(false)

      // Click to open
      await wrapper.find('.bi-globe').trigger('click')
      expect(wrapper.find('.dropdown-menu.show').exists()).toBe(true)

      // Click to close
      await wrapper.find('.bi-globe').trigger('click')
      expect(wrapper.find('.dropdown-menu.show').exists()).toBe(false)
    })

    it('should show all 6 languages in dropdown', async () => {
      const wrapper = mount(HeaderComponent)

      await wrapper.find('.bi-globe').trigger('click')

      const items = wrapper.findAll('.dropdown-item')
      expect(items.length).toBe(6)
    })

    it('should change language on selection', async () => {
      const wrapper = mount(HeaderComponent)

      await wrapper.find('.bi-globe').trigger('click')
      const items = wrapper.findAll('.dropdown-item')
      await items[1]?.trigger('click') // Select Chinese

      // Dropdown should close
      expect(wrapper.find('.dropdown-menu.show').exists()).toBe(false)
    })
  })
})
