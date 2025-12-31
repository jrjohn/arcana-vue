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
      expect(wrapper.find('.language-selector').exists()).toBe(true)
    })

    it('should render notification badge', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.bi-bell').exists()).toBe(true)
    })

    it('should render right panel toggle', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.bi-layout-sidebar-inset-reverse').exists()).toBe(true)
    })

    it('should render user avatar', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.user-avatar-header').exists()).toBe(true)
    })

    it('should render brand name', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.brand-text').exists()).toBe(true)
      expect(wrapper.text()).toContain('Arcana')
    })

    it('should render notification count', () => {
      const wrapper = mount(HeaderComponent)
      expect(wrapper.find('.badge-notification').exists()).toBe(true)
      expect(wrapper.find('.badge-notification').text()).toBe('3')
    })
  })

  describe('events', () => {
    it('should emit toggle-sidebar on menu button click', async () => {
      const wrapper = mount(HeaderComponent)
      await wrapper.find('.sidebar-toggle').trigger('click')
      expect(wrapper.emitted('toggle-sidebar')).toBeTruthy()
    })

    it('should emit toggle-right-panel on panel button click', async () => {
      const wrapper = mount(HeaderComponent)
      const button = wrapper.find('.bi-layout-sidebar-inset-reverse')
      await button.element.parentElement?.click()
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

    it('should handle search on button click', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const wrapper = mount(HeaderComponent)
      const input = wrapper.find('input[type="text"]')

      await input.setValue('button search')
      await wrapper.find('.search-button').trigger('click')

      expect(consoleSpy).toHaveBeenCalledWith('Search:', 'button search')
      consoleSpy.mockRestore()
    })
  })

  describe('language dropdown', () => {
    it('should toggle language dropdown on click', async () => {
      const wrapper = mount(HeaderComponent)

      // Initially closed
      expect(wrapper.find('.language-dropdown.show').exists()).toBe(false)

      // Click to open
      await wrapper.find('.language-selector').trigger('click')
      expect(wrapper.find('.language-dropdown.show').exists()).toBe(true)

      // Click to close
      await wrapper.find('.language-selector').trigger('click')
      expect(wrapper.find('.language-dropdown.show').exists()).toBe(false)
    })

    it('should show all 6 languages in dropdown', async () => {
      const wrapper = mount(HeaderComponent)

      await wrapper.find('.language-selector').trigger('click')

      const items = wrapper.findAll('.language-dropdown .dropdown-item')
      expect(items.length).toBe(6)
    })

    it('should change language on selection', async () => {
      const wrapper = mount(HeaderComponent)

      await wrapper.find('.language-selector').trigger('click')
      const items = wrapper.findAll('.language-dropdown .dropdown-item')
      await items[1]?.trigger('click') // Select Chinese

      // Dropdown should close
      expect(wrapper.find('.language-dropdown.show').exists()).toBe(false)
    })
  })

  describe('user dropdown', () => {
    it('should toggle user dropdown on click', async () => {
      const wrapper = mount(HeaderComponent)

      // Initially closed
      expect(wrapper.find('.user-dropdown.show').exists()).toBe(false)

      // Click to open
      await wrapper.find('.user-menu-toggle').trigger('click')
      expect(wrapper.find('.user-dropdown.show').exists()).toBe(true)

      // Click to close
      await wrapper.find('.user-menu-toggle').trigger('click')
      expect(wrapper.find('.user-dropdown.show').exists()).toBe(false)
    })

    it('should display user info in dropdown', async () => {
      const wrapper = mount(HeaderComponent)

      await wrapper.find('.user-menu-toggle').trigger('click')

      expect(wrapper.find('.user-dropdown-header').exists()).toBe(true)
      expect(wrapper.text()).toContain('George Bluth')
      expect(wrapper.text()).toContain('george.bluth@reqres.in')
    })

    it('should render user menu actions', async () => {
      const wrapper = mount(HeaderComponent)

      await wrapper.find('.user-menu-toggle').trigger('click')

      const menuItems = wrapper.findAll('.user-dropdown .dropdown-item')
      expect(menuItems.length).toBe(4) // Profile, Settings, Help, Logout
    })

    it('should handle user menu action', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
      const wrapper = mount(HeaderComponent)

      await wrapper.find('.user-menu-toggle').trigger('click')
      const menuItems = wrapper.findAll('.user-dropdown .dropdown-item')
      await menuItems[0]?.trigger('click')

      expect(consoleSpy).toHaveBeenCalledWith('User menu action:', 'profile')
      consoleSpy.mockRestore()
    })
  })

  describe('click outside to close', () => {
    it('should close dropdowns when clicking outside', async () => {
      const wrapper = mount(HeaderComponent)

      // Open language dropdown
      await wrapper.find('.language-selector').trigger('click')
      expect(wrapper.find('.language-dropdown.show').exists()).toBe(true)

      // Click on header (outside dropdown wrapper)
      await wrapper.find('.header-left').trigger('click')
      expect(wrapper.find('.language-dropdown.show').exists()).toBe(false)
    })
  })
})
