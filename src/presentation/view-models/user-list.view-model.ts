/**
 * UserListViewModel
 *
 * Implements MVVM + Input/Output/Effect (I/O/E) architecture
 * with v-model support and Unidirectional Data Flow (UDF).
 *
 * Data Flow:
 * View ←→ Model (v-model) → State → Output → View
 *                    ↓
 *              Effect Emitter → Navigation/Toast/Dialog
 */

import { type Ref, type ComputedRef, watch } from 'vue'
import {
  createOutput,
  createState,
  createEffectEmitter,
  createLoadingState,
  createPaginationState,
  createSearchState,
  createDialogState,
  createSelectionState
} from './base.view-model'
import { userService } from '@/domain/services/user.service'
import { userRepository } from '@/data/repositories/user.repository'
import { useI18n } from '@/domain/services/i18n.service'
import type { User } from '@/domain/entities/user.entity'

// ============================================================================
// EFFECT TYPES
// ============================================================================

export type UserListEffect =
  | { type: 'navigation'; payload: { route: 'detail' | 'edit' | 'create'; userId?: number } }
  | { type: 'toast'; payload: { message: string; variant: 'success' | 'error' } }
  | { type: 'dialog'; payload: { action: 'openDelete' | 'closeDelete' } }

// ============================================================================
// VIEWMODEL TYPES
// ============================================================================

export interface UserListModels {
  searchQuery: Ref<string>
  currentPage: Ref<number>
}

export interface UserListOutputs {
  // Data
  users: Ref<User[]>
  selectedUser: Ref<User | null>

  // Loading
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Search
  isSearching: ComputedRef<boolean>

  // Pagination
  totalPages: Ref<number>
  total: Ref<number>
  perPage: Ref<number>
  showingStart: ComputedRef<number>
  showingEnd: ComputedRef<number>
  hasNextPage: ComputedRef<boolean>
  hasPrevPage: ComputedRef<boolean>

  // Dialog
  showDeleteDialog: Ref<boolean>

  // Computed
  hasUsers: ComputedRef<boolean>
  isEmpty: ComputedRef<boolean>
  successMessage: Ref<string>
}

export interface UserListInputs {
  // Data
  loadUsers: (page?: number) => Promise<void>
  refreshUsers: () => Promise<void>
  prefetchNextPage: () => Promise<void>

  // Search
  clearSearch: () => void

  // Pagination
  goToPage: (page: number) => void
  goToNextPage: () => void
  goToPrevPage: () => void

  // Navigation
  viewUser: (user: User) => void
  editUser: (user: User) => void
  createUser: () => void

  // Delete
  confirmDelete: (user: User) => void
  executeDelete: () => Promise<void>
  cancelDelete: () => void

  // Messages
  clearSuccessMessage: () => void
  clearError: () => void
}

// ============================================================================
// VIEWMODEL FACTORY
// ============================================================================

export function useUserListViewModel() {
  const { t } = useI18n()

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  const users = createState<User[]>([])
  const successMessage = createState('')
  const loading = createLoadingState()
  const pagination = createPaginationState(6)
  const search = createSearchState(300)
  const deleteDialog = createDialogState<User>()
  const selection = createSelectionState<User>()

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  const effects = createEffectEmitter<UserListEffect>()

  // ---------------------------------------------------------------------------
  // OUTPUTS (Read-only derived state)
  // ---------------------------------------------------------------------------

  const hasUsers = createOutput(() => users.value.length > 0)
  const isEmpty = createOutput(() => !loading.isLoading.value && users.value.length === 0)

  // ---------------------------------------------------------------------------
  // WATCH: Auto-search on debounced query change
  // ---------------------------------------------------------------------------

  watch(search.debouncedQuery, (query) => {
    if (query === '') {
      loadUsers(1)
    } else {
      executeSearch()
    }
  })

  // ---------------------------------------------------------------------------
  // INPUTS (Action methods)
  // ---------------------------------------------------------------------------

  async function loadUsers(page: number = 1): Promise<void> {
    loading.setLoading(true)
    loading.clearError()

    try {
      const result = await userService.getUsers(page)
      users.value = result.users
      pagination.update({
        currentPage: result.page,
        totalPages: result.totalPages,
        total: result.total,
        perPage: result.perPage
      })
    } catch (error) {
      loading.setError(t('error.network'))
      effects.emit({ type: 'toast', payload: { message: t('error.network'), variant: 'error' } })
    } finally {
      loading.setLoading(false)
    }
  }

  async function refreshUsers(): Promise<void> {
    await loadUsers(pagination.currentPage.value)
  }

  async function prefetchNextPage(): Promise<void> {
    if (pagination.hasNextPage.value) {
      await userRepository.prefetchUsers([pagination.currentPage.value + 1])
    }
  }

  async function executeSearch(): Promise<void> {
    const query = search.debouncedQuery.value
    if (!query) {
      await loadUsers(1)
      return
    }

    loading.setLoading(true)
    loading.clearError()

    try {
      const result = await userService.searchUsers(query, 1)
      users.value = result.users
      pagination.update({
        currentPage: 1,
        totalPages: 1,
        total: result.total,
        perPage: result.perPage
      })
    } catch (error) {
      loading.setError(t('error.network'))
    } finally {
      loading.setLoading(false)
    }
  }

  function clearSearch(): void {
    search.clear()
    loadUsers(1)
  }

  function goToPage(page: number): void {
    if (page >= 1 && page <= pagination.totalPages.value) {
      loadUsers(page)
    }
  }

  function goToNextPage(): void {
    if (pagination.hasNextPage.value) {
      goToPage(pagination.currentPage.value + 1)
    }
  }

  function goToPrevPage(): void {
    if (pagination.hasPrevPage.value) {
      goToPage(pagination.currentPage.value - 1)
    }
  }

  function viewUser(user: User): void {
    effects.emit({ type: 'navigation', payload: { route: 'detail', userId: user.id } })
  }

  function editUser(user: User): void {
    effects.emit({ type: 'navigation', payload: { route: 'edit', userId: user.id } })
  }

  function createUser(): void {
    effects.emit({ type: 'navigation', payload: { route: 'create' } })
  }

  function confirmDelete(user: User): void {
    selection.select(user)
    deleteDialog.open(user)
    effects.emit({ type: 'dialog', payload: { action: 'openDelete' } })
  }

  async function executeDelete(): Promise<void> {
    const user = deleteDialog.data.value
    if (!user) return

    loading.setLoading(true)

    try {
      await userService.deleteUser(user.id)
      successMessage.value = t('user.delete.success')
      deleteDialog.close()
      selection.clear()

      effects.emit({ type: 'toast', payload: { message: t('user.delete.success'), variant: 'success' } })
      effects.emit({ type: 'dialog', payload: { action: 'closeDelete' } })

      await loadUsers(pagination.currentPage.value)
    } catch (error) {
      loading.setError(t('error.unknown'))
      effects.emit({ type: 'toast', payload: { message: t('error.unknown'), variant: 'error' } })
    } finally {
      loading.setLoading(false)
    }
  }

  function cancelDelete(): void {
    deleteDialog.close()
    selection.clear()
    effects.emit({ type: 'dialog', payload: { action: 'closeDelete' } })
  }

  function clearSuccessMessage(): void {
    successMessage.value = ''
  }

  function clearError(): void {
    loading.clearError()
  }

  // ---------------------------------------------------------------------------
  // LIFECYCLE
  // ---------------------------------------------------------------------------

  function dispose(): void {
    search.clear()
  }

  // ---------------------------------------------------------------------------
  // RETURN: ViewModel with Models/Outputs/Inputs/Effects
  // ---------------------------------------------------------------------------

  return {
    // MODELS: v-model compatible refs
    models: {
      searchQuery: search.query,
      currentPage: pagination.currentPage
    } satisfies UserListModels,

    // OUTPUTS: Read-only state
    outputs: {
      users,
      selectedUser: selection.selected,
      isLoading: loading.isLoading,
      error: loading.error,
      isSearching: search.isSearching,
      totalPages: pagination.totalPages,
      total: pagination.total,
      perPage: pagination.perPage,
      showingStart: pagination.showingStart,
      showingEnd: pagination.showingEnd,
      hasNextPage: pagination.hasNextPage,
      hasPrevPage: pagination.hasPrevPage,
      showDeleteDialog: deleteDialog.isOpen,
      hasUsers,
      isEmpty,
      successMessage
    } satisfies UserListOutputs,

    // INPUTS: Action methods
    inputs: {
      loadUsers,
      refreshUsers,
      prefetchNextPage,
      clearSearch,
      goToPage,
      goToNextPage,
      goToPrevPage,
      viewUser,
      editUser,
      createUser,
      confirmDelete,
      executeDelete,
      cancelDelete,
      clearSuccessMessage,
      clearError
    } satisfies UserListInputs,

    // EFFECTS: Side effect emitter
    effects,

    // Lifecycle
    dispose
  }
}

export type UserListViewModel = ReturnType<typeof useUserListViewModel>
