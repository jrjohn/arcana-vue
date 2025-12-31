import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import MainLayout from '@/presentation/layouts/MainLayout.vue'

// Create a mock router
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
    { path: '/users', name: 'users', component: { template: '<div>Users</div>' } }
  ]
})

const mountLayout = () => {
  return mount(MainLayout, {
    global: {
      plugins: [router],
      stubs: {
        RouterLink: {
          template: '<a><slot /></a>',
          props: ['to']
        },
        RouterView: {
          template: '<div class="router-view-stub"></div>'
        }
      }
    }
  })
}

describe('MainLayout', () => {
  describe('rendering', () => {
    it('should render layout container', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.app-layout').exists()).toBe(true)
    })

    it('should render sidebar', () => {
      const wrapper = mountLayout()
      expect(wrapper.findComponent({ name: 'SidebarComponent' }).exists()).toBe(true)
    })

    it('should render header', () => {
      const wrapper = mountLayout()
      expect(wrapper.findComponent({ name: 'HeaderComponent' }).exists()).toBe(true)
    })

    it('should render main content area', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.main-content').exists()).toBe(true)
    })

    it('should render page content area', () => {
      const wrapper = mountLayout()
      expect(wrapper.find('.page-content').exists()).toBe(true)
    })

    it('should render right panel', () => {
      const wrapper = mountLayout()
      expect(wrapper.findComponent({ name: 'RightPanelComponent' }).exists()).toBe(true)
    })
  })

  describe('sidebar toggle', () => {
    it('should start with sidebar expanded', () => {
      const wrapper = mountLayout()
      const sidebar = wrapper.findComponent({ name: 'SidebarComponent' })
      expect(sidebar.props('collapsed')).toBe(false)
    })

    it('should toggle sidebar on header event', async () => {
      const wrapper = mountLayout()
      const header = wrapper.findComponent({ name: 'HeaderComponent' })

      header.vm.$emit('toggle-sidebar')
      await wrapper.vm.$nextTick()

      const sidebar = wrapper.findComponent({ name: 'SidebarComponent' })
      expect(sidebar.props('collapsed')).toBe(true)
    })

    it('should add collapsed class to main content', async () => {
      const wrapper = mountLayout()
      const header = wrapper.findComponent({ name: 'HeaderComponent' })

      header.vm.$emit('toggle-sidebar')
      await wrapper.vm.$nextTick()

      expect(wrapper.find('.main-content.sidebar-collapsed').exists()).toBe(true)
    })
  })

  describe('right panel toggle', () => {
    it('should start with right panel closed', () => {
      const wrapper = mountLayout()
      const rightPanel = wrapper.findComponent({ name: 'RightPanelComponent' })
      expect(rightPanel.props('open')).toBe(false)
    })

    it('should toggle right panel on header event', async () => {
      const wrapper = mountLayout()
      const header = wrapper.findComponent({ name: 'HeaderComponent' })

      header.vm.$emit('toggle-right-panel')
      await wrapper.vm.$nextTick()

      const rightPanel = wrapper.findComponent({ name: 'RightPanelComponent' })
      expect(rightPanel.props('open')).toBe(true)
    })

    it('should close right panel on close event', async () => {
      const wrapper = mountLayout()
      const header = wrapper.findComponent({ name: 'HeaderComponent' })

      // Open panel
      header.vm.$emit('toggle-right-panel')
      await wrapper.vm.$nextTick()

      // Close panel
      const rightPanel = wrapper.findComponent({ name: 'RightPanelComponent' })
      rightPanel.vm.$emit('close')
      await wrapper.vm.$nextTick()

      expect(rightPanel.props('open')).toBe(false)
    })
  })
})
