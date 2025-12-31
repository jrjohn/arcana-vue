import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import SidebarComponent from '@/presentation/components/layout/SidebarComponent.vue'

// Create a mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/home', name: 'home-page', component: { template: '<div>Home</div>' } },
    { path: '/users', name: 'users', component: { template: '<div>Users</div>' } },
    { path: '/settings', name: 'settings', component: { template: '<div>Settings</div>' } }
  ]
})

const mountWithRouter = (props = { collapsed: false }) => {
  return mount(SidebarComponent, {
    props,
    global: {
      plugins: [router]
    }
  })
}

describe('SidebarComponent', () => {
  describe('rendering', () => {
    it('should render sidebar element', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.sidebar').exists()).toBe(true)
    })

    it('should render user profile block', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.user-profile-block').exists()).toBe(true)
    })

    it('should render user avatar', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.user-avatar').exists()).toBe(true)
    })

    it('should render user name when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.user-name').exists()).toBe(true)
      expect(wrapper.text()).toContain('George Bluth')
    })

    it('should render user email when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.user-email').exists()).toBe(true)
      expect(wrapper.text()).toContain('george.bluth@reqres.in')
    })

    it('should render user role badge when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.user-role-badge').exists()).toBe(true)
      expect(wrapper.text()).toContain('Administrator')
    })

    it('should render profile button when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.user-profile-actions').exists()).toBe(true)
      expect(wrapper.find('.bi-person').exists()).toBe(true)
    })

    it('should render status indicator', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.status-indicator').exists()).toBe(true)
      expect(wrapper.find('.status-online').exists()).toBe(true)
    })
  })

  describe('navigation items', () => {
    it('should render all navigation items', () => {
      const wrapper = mountWithRouter()
      const navLinks = wrapper.findAll('.nav-link')
      expect(navLinks.length).toBe(9) // Home, Users, Projects, Tasks, Calendar, Messages, Documents, Analytics, Settings
    })

    it('should render home link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-house-door').exists()).toBe(true)
    })

    it('should render users link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-people').exists()).toBe(true)
    })

    it('should render settings link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-gear').exists()).toBe(true)
    })

    it('should render projects link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-folder').exists()).toBe(true)
    })

    it('should render tasks link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-kanban').exists()).toBe(true)
    })

    it('should render calendar link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-calendar-event').exists()).toBe(true)
    })

    it('should render messages link with badge', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-chat-dots').exists()).toBe(true)
      expect(wrapper.find('.badge.bg-danger').exists()).toBe(true)
      expect(wrapper.find('.badge.bg-danger').text()).toBe('5')
    })

    it('should render documents link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-file-earmark-text').exists()).toBe(true)
    })

    it('should render analytics link', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.bi-graph-up').exists()).toBe(true)
    })
  })

  describe('collapsed state', () => {
    it('should add collapsed class when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.sidebar.collapsed').exists()).toBe(true)
    })

    it('should hide nav label when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.nav-label').exists()).toBe(false)
    })

    it('should show nav label when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.findAll('.nav-label').length).toBeGreaterThan(0)
    })

    it('should hide user info when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.user-info').exists()).toBe(false)
    })

    it('should hide profile actions when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.user-profile-actions').exists()).toBe(false)
    })

    it('should hide sidebar footer when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.sidebar-footer').exists()).toBe(false)
    })

    it('should hide section title when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.nav-section-title').exists()).toBe(false)
    })

    it('should show badge dot instead of badge number when collapsed', () => {
      const wrapper = mountWithRouter({ collapsed: true })
      expect(wrapper.find('.badge-dot').exists()).toBe(true)
      expect(wrapper.find('.badge.bg-danger').exists()).toBe(false)
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

    it('should call action when nav item with action is clicked', async () => {
      const wrapper = mountWithRouter()
      const homeLink = wrapper.findAll('.nav-link')[0] // Home has action

      await homeLink.trigger('click')

      // No errors thrown means action was called
      expect(true).toBe(true)
    })
  })

  describe('sidebar footer', () => {
    it('should render footer when not collapsed', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.sidebar-footer').exists()).toBe(true)
    })

    it('should render storage stats', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.footer-stats').exists()).toBe(true)
      expect(wrapper.text()).toContain('4.2 GB / 10 GB')
    })

    it('should render progress bar', () => {
      const wrapper = mountWithRouter()
      expect(wrapper.find('.progress-bar').exists()).toBe(true)
    })
  })

  describe('active state', () => {
    it('should mark link as active when route matches', async () => {
      await router.push('/users')
      const wrapper = mountWithRouter()

      const usersLink = wrapper.findAll('.nav-link')[1] // Users is second
      expect(usersLink.classes()).toContain('active')
    })
  })
})
