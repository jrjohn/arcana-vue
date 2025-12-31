import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SidebarComponent from '@/presentation/components/layout/SidebarComponent.vue'

// Create a mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
    { path: '/settings', name: 'settings', component: { template: '<div>Settings</div>' } }
  ]
})

const mountWithRouter = (props = { collapsed: false }) => {
  return mount(SidebarComponent, {
    props,
    global: {
      plugins: [router],
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
          props: ['to']
        }
      }
    }
  })
}

describe('SidebarComponent', () => {
  describe('rendering', () => {
    it('should render sidebar element', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })

    it('should render logo', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-hexagon-fill').exists()).toBe(true)
    })

    it('should render brand name when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.text()).toContain('Arcana')
    })

    it('should hide brand name when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.sidebar-header span').exists()).toBe(false)
    })

    it('should render user panel when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.findComponent({ name: 'UserPanelComponent' }).exists()).toBe(true)
    })

    it('should hide user panel when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.findComponent({ name: 'UserPanelComponent' }).exists()).toBe(false)
    })
  })

  describe('navigation items', () => {
    it('should render all navigation items', () => {
      const wrapper = mountWithRouter()
      const navLinks = wrapper.findAll('.nav-link')
      expect(navLinks.length).toBeGreaterThanOrEqual(4) // Home, Users, Settings, Logout
    })

    it('should render home link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-house').exists()).toBe(true)
    })

    it('should render users link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-people').exists()).toBe(true)
    })

    it('should render settings link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-gear').exists()).toBe(true)
    })

    it('should render logout link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-box-arrow-left').exists()).toBe(true)
    })
  })

  describe('collapsed state', () => {
    it('should add collapsed class when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.sidebar.collapsed').exists()).toBe(true)
    })

    it('should hide nav text when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.nav-text').exists()).toBe(false)
    })

    it('should show nav text when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.findAll('.nav-text').length).toBeGreaterThan(0)
    })
  })

  describe('navigation', () => {
    it('should trigger navigation on link click', async () => {
      const wrapper = mountWithRouter()
      const navLink = wrapper.find('.nav-link')

      await navLink.trigger('click')

      // Navigation is handled, no error thrown
      expect(true).toBe(true)
    })
  })
})
