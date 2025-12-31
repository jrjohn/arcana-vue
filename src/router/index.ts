import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

/**
 * Route definitions
 */
const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/presentation/layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'home',
        component: () => import('@/presentation/features/home/HomePage.vue'),
        meta: { title: 'Home' }
      },
      {
        path: 'users',
        name: 'users',
        component: () => import('@/presentation/features/users/UserListPage.vue'),
        meta: { title: 'Users' }
      },
      {
        path: 'users/new',
        name: 'user-create',
        component: () => import('@/presentation/features/users/UserFormPage.vue'),
        meta: { title: 'Create User' }
      },
      {
        path: 'users/:id',
        name: 'user-detail',
        component: () => import('@/presentation/features/users/UserDetailPage.vue'),
        meta: { title: 'User Detail' }
      },
      {
        path: 'users/:id/edit',
        name: 'user-edit',
        component: () => import('@/presentation/features/users/UserFormPage.vue'),
        meta: { title: 'Edit User' }
      }
    ]
  },
  {
    path: '/error/:code',
    name: 'error',
    component: () => import('@/presentation/features/error/ErrorPage.vue'),
    meta: { title: 'Error' }
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'not-found',
    component: () => import('@/presentation/features/error/ErrorPage.vue'),
    meta: { title: 'Page Not Found' }
  }
]

/**
 * Router instance
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    }
    return { top: 0 }
  }
})

/**
 * Navigation guards
 */
router.beforeEach((to, _from, next) => {
  // Update document title
  const title = to.meta.title as string | undefined
  document.title = title ? `${title} | Arcana Vue` : 'Arcana Vue'
  next()
})

export default router

/**
 * Type-safe navigation helper
 */
export const navGraph = {
  home: {
    path: '/home',
    navigate: () => router.push('/home')
  },
  users: {
    path: '/users',
    toList: () => router.push('/users'),
    toCreate: () => router.push('/users/new'),
    toDetail: (id: number) => router.push(`/users/${id}`),
    toEdit: (id: number) => router.push(`/users/${id}/edit`)
  },
  error: {
    path: '/error',
    to403: () => router.push('/error/403'),
    to404: () => router.push('/error/404'),
    to500: () => router.push('/error/500'),
    toError: (code: string | number) => router.push(`/error/${code}`)
  }
}
