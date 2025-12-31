import { vi } from 'vitest'
import { config } from '@vue/test-utils'
import 'fake-indexeddb/auto'

// Mock localStorage
const localStorageMock = {
  store: {} as Record<string, string>,
  getItem: vi.fn((key: string) => localStorageMock.store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => {
    localStorageMock.store[key] = value
  }),
  removeItem: vi.fn((key: string) => {
    delete localStorageMock.store[key]
  }),
  clear: vi.fn(() => {
    localStorageMock.store = {}
  })
}

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
})

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  value: true,
  writable: true
})

// Global stubs for Vue components
config.global.stubs = {
  RouterLink: {
    template: '<a><slot /></a>'
  },
  RouterView: {
    template: '<div><slot /></div>'
  },
  Teleport: {
    template: '<div><slot /></div>'
  }
}

// Reset mocks before each test
beforeEach(() => {
  localStorageMock.store = {}
  vi.clearAllMocks()
})
