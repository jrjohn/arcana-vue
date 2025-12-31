/**
 * UserDetailViewModel
 *
 * Implements MVVM + Input/Output/Effect (I/O/E) architecture
 * with v-model support and Unidirectional Data Flow (UDF).
 *
 * Data Flow:
 * View ←→ Model (v-model) → State → Output → View
 *                    ↓
 *              Effect Emitter → Navigation/Toast/Dialog
 */

import { type Ref, type ComputedRef } from 'vue'
import {
  createOutput,
  createState,
  createEffectEmitter,
  createLoadingState,
  createDialogState
} from './base.view-model'
import { userService } from '@/domain/services/user.service'
import { useI18n } from '@/domain/services/i18n.service'
import { sanitizationService } from '@/domain/services/sanitization.service'
import type { User } from '@/domain/entities/user.entity'

// ============================================================================
// EFFECT TYPES
// ============================================================================

export type UserDetailEffect =
  | { type: 'navigation'; payload: { route: 'list' | 'edit'; userId?: number } }
  | { type: 'toast'; payload: { message: string; variant: 'success' | 'error' } }
  | { type: 'dialog'; payload: { action: 'openDelete' | 'closeDelete' } }

// ============================================================================
// VIEWMODEL TYPES
// ============================================================================

export interface UserDetailModels {
  // No editable models in detail view
}

export interface UserDetailOutputs {
  // User data
  user: Ref<User | null>
  showDeleteDialog: Ref<boolean>

  // Loading
  isLoading: Ref<boolean>
  error: Ref<string | null>

  // Computed
  hasUser: ComputedRef<boolean>
  fullName: ComputedRef<string>
  initials: ComputedRef<string>
  canEdit: ComputedRef<boolean>
  canDelete: ComputedRef<boolean>
}

export interface UserDetailInputs {
  loadUser: (id: number) => Promise<void>
  refreshUser: () => Promise<void>
  goBack: () => void
  editUser: () => void
  confirmDelete: () => void
  executeDelete: () => Promise<void>
  cancelDelete: () => void
  clearError: () => void
}

// ============================================================================
// VIEWMODEL FACTORY
// ============================================================================

export function useUserDetailViewModel() {
  const { t } = useI18n()

  // ---------------------------------------------------------------------------
  // STATE
  // ---------------------------------------------------------------------------

  const user = createState<User | null>(null)
  const loading = createLoadingState()
  const deleteDialog = createDialogState<User>()

  let currentUserId: number | null = null

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  const effects = createEffectEmitter<UserDetailEffect>()

  // ---------------------------------------------------------------------------
  // OUTPUTS (Read-only derived state)
  // ---------------------------------------------------------------------------

  const hasUser = createOutput(() => user.value !== null)

  const fullName = createOutput(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`
  })

  const initials = createOutput(() => {
    if (!user.value) return ''
    return `${user.value.firstName.charAt(0)}${user.value.lastName.charAt(0)}`.toUpperCase()
  })

  const canEdit = createOutput(() => user.value !== null && !loading.isLoading.value)
  const canDelete = createOutput(() => user.value !== null && !loading.isLoading.value)

  // ---------------------------------------------------------------------------
  // INPUTS (Action methods)
  // ---------------------------------------------------------------------------

  async function loadUser(id: number): Promise<void> {
    const sanitizedId = sanitizationService.sanitizeInteger(id, 1)
    if (sanitizedId === null) {
      loading.setError(t('error.invalidId'))
      effects.emit({ type: 'toast', payload: { message: t('error.invalidId'), variant: 'error' } })
      return
    }

    currentUserId = sanitizedId
    loading.setLoading(true)
    loading.clearError()

    try {
      const result = await userService.getUserById(sanitizedId)
      user.value = result
    } catch (error) {
      loading.setError(t('error.notFound'))
      effects.emit({ type: 'toast', payload: { message: t('error.notFound'), variant: 'error' } })
    } finally {
      loading.setLoading(false)
    }
  }

  async function refreshUser(): Promise<void> {
    if (currentUserId !== null) {
      await loadUser(currentUserId)
    }
  }

  function goBack(): void {
    effects.emit({ type: 'navigation', payload: { route: 'list' } })
  }

  function editUser(): void {
    if (user.value) {
      effects.emit({ type: 'navigation', payload: { route: 'edit', userId: user.value.id } })
    }
  }

  function confirmDelete(): void {
    if (user.value) {
      deleteDialog.open(user.value)
      effects.emit({ type: 'dialog', payload: { action: 'openDelete' } })
    }
  }

  async function executeDelete(): Promise<void> {
    if (!user.value) return

    loading.setLoading(true)

    try {
      await userService.deleteUser(user.value.id)
      deleteDialog.close()

      effects.emit({ type: 'toast', payload: { message: t('user.delete.success'), variant: 'success' } })
      effects.emit({ type: 'dialog', payload: { action: 'closeDelete' } })
      effects.emit({ type: 'navigation', payload: { route: 'list' } })
    } catch (error) {
      loading.setError(t('error.unknown'))
      effects.emit({ type: 'toast', payload: { message: t('error.unknown'), variant: 'error' } })
    } finally {
      loading.setLoading(false)
    }
  }

  function cancelDelete(): void {
    deleteDialog.close()
    effects.emit({ type: 'dialog', payload: { action: 'closeDelete' } })
  }

  function clearError(): void {
    loading.clearError()
  }

  // ---------------------------------------------------------------------------
  // RETURN: ViewModel with Models/Outputs/Inputs/Effects
  // ---------------------------------------------------------------------------

  return {
    // MODELS: v-model compatible refs (none for detail view)
    models: {} satisfies UserDetailModels,

    // OUTPUTS: Read-only state
    outputs: {
      user,
      showDeleteDialog: deleteDialog.isOpen,
      isLoading: loading.isLoading,
      error: loading.error,
      hasUser,
      fullName,
      initials,
      canEdit,
      canDelete
    } satisfies UserDetailOutputs,

    // INPUTS: Action methods
    inputs: {
      loadUser,
      refreshUser,
      goBack,
      editUser,
      confirmDelete,
      executeDelete,
      cancelDelete,
      clearError
    } satisfies UserDetailInputs,

    // EFFECTS: Side effect emitter
    effects
  }
}

export type UserDetailViewModel = ReturnType<typeof useUserDetailViewModel>
