import { describe, it, expect, beforeEach, vi } from 'vitest'
import router, { navGraph } from '@/router'

describe('Router', () => {
  beforeEach(() => {
    // Reset router to initial state
    router.push('/')
  })

  describe('routes', () => {
    it('should have root route', () => {
      const routes = router.getRoutes()
      const rootRoute = routes.find(r => r.path === '/')
      expect(rootRoute).toBeDefined()
    })

    it('should have home route', () => {
      const routes = router.getRoutes()
      const homeRoute = routes.find(r => r.name === 'home')
      expect(homeRoute).toBeDefined()
      expect(homeRoute?.path).toBe('/home')
    })

    it('should have users list route', () => {
      const routes = router.getRoutes()
      const usersRoute = routes.find(r => r.name === 'users')
      expect(usersRoute).toBeDefined()
      expect(usersRoute?.path).toBe('/users')
    })

    it('should have user create route', () => {
      const routes = router.getRoutes()
      const createRoute = routes.find(r => r.name === 'user-create')
      expect(createRoute).toBeDefined()
      expect(createRoute?.path).toBe('/users/new')
    })

    it('should have user detail route', () => {
      const routes = router.getRoutes()
      const detailRoute = routes.find(r => r.name === 'user-detail')
      expect(detailRoute).toBeDefined()
      expect(detailRoute?.path).toBe('/users/:id')
    })

    it('should have user edit route', () => {
      const routes = router.getRoutes()
      const editRoute = routes.find(r => r.name === 'user-edit')
      expect(editRoute).toBeDefined()
      expect(editRoute?.path).toBe('/users/:id/edit')
    })

    it('should have error route', () => {
      const routes = router.getRoutes()
      const errorRoute = routes.find(r => r.name === 'error')
      expect(errorRoute).toBeDefined()
      expect(errorRoute?.path).toBe('/error/:code')
    })

    it('should have not-found catch-all route', () => {
      const routes = router.getRoutes()
      const catchAllRoute = routes.find(r => r.name === 'not-found')
      expect(catchAllRoute).toBeDefined()
      expect(catchAllRoute?.path).toBe('/:pathMatch(.*)*')
    })
  })

  describe('navigation guards', () => {
    it('should update document title on navigation', async () => {
      await router.push('/home')
      expect(document.title).toContain('Home')
    })

    it('should set default title for routes without meta', async () => {
      await router.push('/')
      expect(document.title).toContain('Arcana Vue')
    })
  })

  describe('navGraph', () => {
    describe('home', () => {
      it('should have correct path', () => {
        expect(navGraph.home.path).toBe('/home')
      })

      it('should navigate to home', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.home.navigate()
        expect(pushSpy).toHaveBeenCalledWith('/home')
      })
    })

    describe('users', () => {
      it('should have correct path', () => {
        expect(navGraph.users.path).toBe('/users')
      })

      it('should navigate to list', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.users.toList()
        expect(pushSpy).toHaveBeenCalledWith('/users')
      })

      it('should navigate to create', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.users.toCreate()
        expect(pushSpy).toHaveBeenCalledWith('/users/new')
      })

      it('should navigate to detail', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.users.toDetail(123)
        expect(pushSpy).toHaveBeenCalledWith('/users/123')
      })

      it('should navigate to edit', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.users.toEdit(456)
        expect(pushSpy).toHaveBeenCalledWith('/users/456/edit')
      })
    })

    describe('error', () => {
      it('should have correct path', () => {
        expect(navGraph.error.path).toBe('/error')
      })

      it('should navigate to 403', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.error.to403()
        expect(pushSpy).toHaveBeenCalledWith('/error/403')
      })

      it('should navigate to 404', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.error.to404()
        expect(pushSpy).toHaveBeenCalledWith('/error/404')
      })

      it('should navigate to 500', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.error.to500()
        expect(pushSpy).toHaveBeenCalledWith('/error/500')
      })

      it('should navigate to custom error code', async () => {
        const pushSpy = vi.spyOn(router, 'push')
        await navGraph.error.toError(418)
        expect(pushSpy).toHaveBeenCalledWith('/error/418')
      })
    })
  })

  describe('scroll behavior', () => {
    it('should scroll to top on new navigation', () => {
      const scrollBehavior = router.options.scrollBehavior
      if (scrollBehavior) {
        const result = scrollBehavior(
          { fullPath: '/users' } as never,
          { fullPath: '/home' } as never,
          null
        )
        expect(result).toEqual({ top: 0 })
      }
    })

    it('should restore saved position when available', () => {
      const scrollBehavior = router.options.scrollBehavior
      if (scrollBehavior) {
        const savedPosition = { left: 0, top: 100 }
        const result = scrollBehavior(
          { fullPath: '/home' } as never,
          { fullPath: '/users' } as never,
          savedPosition
        )
        expect(result).toEqual(savedPosition)
      }
    })
  })
})
