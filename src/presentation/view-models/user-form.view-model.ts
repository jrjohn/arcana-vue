/**
 * UserFormViewModel
 *
 * Implements MVVM + Input/Output/Effect (I/O/E) architecture
 * with v-model support and Unidirectional Data Flow (UDF).
 *
 * Data Flow:
 * View ←→ Model (v-model) → Validation → State → Output → View
 *                    ↓
 *              Effect Emitter → Navigation/Toast
 */

import { type Ref, type ComputedRef } from 'vue'
import {
  createFormModels,
  createOutput,
  createState,
  createEffectEmitter,
  createLoadingState
} from './base.view-model'
import { userService } from '@/domain/services/user.service'
import { userValidator } from '@/domain/validators/user.validator'
import { useI18n } from '@/domain/services/i18n.service'
import { sanitizationService } from '@/domain/services/sanitization.service'
import type { User } from '@/domain/entities/user.entity'

// ============================================================================
// EFFECT TYPES
// ============================================================================

export type UserFormEffect =
  | { type: 'navigation'; payload: { route: 'list' | 'detail'; userId?: number } }
  | { type: 'toast'; payload: { message: string; variant: 'success' | 'error' } }

// ============================================================================
// FORM DATA TYPE
// ============================================================================

export interface UserFormData {
  firstName: string
  lastName: string
  email: string
  job: string
}

const initialFormData: UserFormData = {
  firstName: '',
  lastName: '',
  email: '',
  job: ''
}

// ============================================================================
// VIEWMODEL TYPES
// ============================================================================

export interface UserFormModels {
  firstName: Ref<string>
  lastName: Ref<string>
  email: Ref<string>
  job: Ref<string>
}

export interface UserFormOutputs {
  // Form state
  formValues: ComputedRef<UserFormData>
  originalUser: Ref<User | null>

  // Errors
  errors: {
    firstName: Ref<string | null>
    lastName: Ref<string | null>
    email: Ref<string | null>
    job: Ref<string | null>
  }

  // Mode
  isEditMode: Ref<boolean>
  pageTitle: ComputedRef<string>

  // Loading
  isLoading: Ref<boolean>
  isSaving: Ref<boolean>
  error: Ref<string | null>

  // Validation
  isDirty: ComputedRef<boolean>
  isValid: ComputedRef<boolean>
  hasErrors: ComputedRef<boolean>

  // Computed
  canSubmit: ComputedRef<boolean>
  canReset: ComputedRef<boolean>
}

export interface UserFormInputs {
  initCreateMode: () => void
  initEditMode: (userId: number) => Promise<void>
  submit: () => Promise<void>
  reset: () => void
  cancel: () => void
  validateField: (field: keyof UserFormData) => boolean
  validateAll: () => boolean
  clearError: () => void
}

// ============================================================================
// VIEWMODEL FACTORY
// ============================================================================

export function useUserFormViewModel() {
  const { t } = useI18n()

  // ---------------------------------------------------------------------------
  // VALIDATION FUNCTIONS
  // ---------------------------------------------------------------------------

  const validateFirstName = (value: string): string | null => {
    const result = userValidator.validateName(value)
    return result.isValid ? null : (result.errorKey || 'validation.invalidName')
  }

  const validateLastName = (value: string): string | null => {
    const result = userValidator.validateName(value)
    return result.isValid ? null : (result.errorKey || 'validation.invalidName')
  }

  const validateEmail = (value: string): string | null => {
    const result = userValidator.validateEmail(value)
    return result.isValid ? null : (result.errorKey || 'validation.invalidEmail')
  }

  const validateJob = (value: string): string | null => {
    const result = userValidator.validateJob(value)
    return result.isValid ? null : (result.errorKey || 'validation.invalidJob')
  }

  // ---------------------------------------------------------------------------
  // FORM MODELS (v-model compatible with validation)
  // ---------------------------------------------------------------------------

  const form = createFormModels<UserFormData>(
    { ...initialFormData },
    {
      firstName: {
        transform: (v) => sanitizationService.sanitizeText(v),
        validate: validateFirstName
      },
      lastName: {
        transform: (v) => sanitizationService.sanitizeText(v),
        validate: validateLastName
      },
      email: {
        transform: (v) => v.trim().toLowerCase(),
        validate: validateEmail
      },
      job: {
        transform: (v) => sanitizationService.sanitizeText(v),
        validate: validateJob
      }
    }
  )

  // ---------------------------------------------------------------------------
  // INTERNAL STATE
  // ---------------------------------------------------------------------------

  const originalUser = createState<User | null>(null)
  const isEditMode = createState(false)
  const isSaving = createState(false)
  const loading = createLoadingState()

  // ---------------------------------------------------------------------------
  // EFFECTS
  // ---------------------------------------------------------------------------

  const effects = createEffectEmitter<UserFormEffect>()

  // ---------------------------------------------------------------------------
  // OUTPUTS (Read-only derived state)
  // ---------------------------------------------------------------------------

  const pageTitle = createOutput(() =>
    isEditMode.value ? t('user.form.editTitle') : t('user.form.createTitle')
  )

  const canSubmit = createOutput(() =>
    form.isDirty.value &&
    form.isValid.value &&
    !loading.isLoading.value &&
    !isSaving.value
  )

  const canReset = createOutput(() =>
    form.isDirty.value && !isSaving.value
  )

  // ---------------------------------------------------------------------------
  // INPUTS (Action methods)
  // ---------------------------------------------------------------------------

  function initCreateMode(): void {
    isEditMode.value = false
    originalUser.value = null
    form.setOriginalValues({ ...initialFormData })
    loading.clearError()
  }

  async function initEditMode(userId: number): Promise<void> {
    const sanitizedId = sanitizationService.sanitizeInteger(userId, 1)
    if (sanitizedId === null) {
      loading.setError(t('error.invalidId'))
      effects.emit({ type: 'toast', payload: { message: t('error.invalidId'), variant: 'error' } })
      return
    }

    isEditMode.value = true
    loading.setLoading(true)
    loading.clearError()

    try {
      const user = await userService.getUserById(sanitizedId)
      originalUser.value = user
      form.setOriginalValues({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        job: ''
      })
    } catch (error) {
      loading.setError(t('error.notFound'))
      effects.emit({ type: 'toast', payload: { message: t('error.notFound'), variant: 'error' } })
    } finally {
      loading.setLoading(false)
    }
  }

  async function submit(): Promise<void> {
    if (!form.validate()) {
      effects.emit({ type: 'toast', payload: { message: t('error.validation'), variant: 'error' } })
      return
    }

    isSaving.value = true
    loading.clearError()

    try {
      const values = form.values.value
      const name = `${values.firstName} ${values.lastName}`
      const job = values.job || 'User'

      if (isEditMode.value && originalUser.value) {
        await userService.updateUser(originalUser.value.id, { name, job })
        effects.emit({ type: 'toast', payload: { message: t('user.form.updateSuccess'), variant: 'success' } })
        effects.emit({ type: 'navigation', payload: { route: 'detail', userId: originalUser.value.id } })
      } else {
        await userService.createUser({ name, job })
        effects.emit({ type: 'toast', payload: { message: t('user.form.createSuccess'), variant: 'success' } })
        effects.emit({ type: 'navigation', payload: { route: 'list' } })
      }
    } catch (error) {
      loading.setError(t('error.unknown'))
      effects.emit({ type: 'toast', payload: { message: t('error.unknown'), variant: 'error' } })
    } finally {
      isSaving.value = false
    }
  }

  function reset(): void {
    form.reset()
  }

  function cancel(): void {
    if (isEditMode.value && originalUser.value) {
      effects.emit({ type: 'navigation', payload: { route: 'detail', userId: originalUser.value.id } })
    } else {
      effects.emit({ type: 'navigation', payload: { route: 'list' } })
    }
  }

  function validateField(field: keyof UserFormData): boolean {
    return form.validateField(field)
  }

  function validateAll(): boolean {
    return form.validate()
  }

  function clearError(): void {
    loading.clearError()
  }

  // ---------------------------------------------------------------------------
  // RETURN: ViewModel with Models/Outputs/Inputs/Effects
  // ---------------------------------------------------------------------------

  return {
    // MODELS: v-model compatible refs
    models: {
      firstName: form.models.firstName,
      lastName: form.models.lastName,
      email: form.models.email,
      job: form.models.job
    } satisfies UserFormModels,

    // OUTPUTS: Read-only state
    outputs: {
      formValues: form.values,
      originalUser,
      errors: form.errors,
      isEditMode,
      pageTitle,
      isLoading: loading.isLoading,
      isSaving,
      error: loading.error,
      isDirty: form.isDirty,
      isValid: form.isValid,
      hasErrors: form.hasErrors,
      canSubmit,
      canReset
    } satisfies UserFormOutputs,

    // INPUTS: Action methods
    inputs: {
      initCreateMode,
      initEditMode,
      submit,
      reset,
      cancel,
      validateField,
      validateAll,
      clearError
    } satisfies UserFormInputs,

    // EFFECTS: Side effect emitter
    effects
  }
}

export type UserFormViewModel = ReturnType<typeof useUserFormViewModel>
