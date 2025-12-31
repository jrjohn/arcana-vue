/**
 * ViewModels Index
 *
 * MVVM + Input/Output/Effect (I/O/E) Architecture
 * with v-model support and Unidirectional Data Flow (UDF)
 *
 * Pattern Summary:
 * ================
 *
 * MODELS (v-model compatible):
 * - Two-way bindable refs for form inputs
 * - Automatic validation and sanitization
 * - Use with v-model directive directly
 *
 * OUTPUTS (Read-only State):
 * - Components can only READ, never WRITE
 * - Computed derived values (isValid, canSubmit)
 * - Access with .value in template
 *
 * INPUTS (Action Methods):
 * - Explicit user actions (submit, delete, cancel)
 * - Named with action verbs
 * - Trigger side effects
 *
 * EFFECTS (Side Effects):
 * - Navigation, toasts, dialogs
 * - Subscribe in component setup
 * - Unsubscribe on unmount
 *
 * Data Flow:
 * View ←→ Model (v-model) → Validation → State → Output → View
 *                   ↓
 *             Effect Emitter → Side Effects
 */

// Base ViewModel utilities
export * from './base.view-model'

// Feature ViewModels
export * from './user-list.view-model'
export * from './user-detail.view-model'
export * from './user-form.view-model'
