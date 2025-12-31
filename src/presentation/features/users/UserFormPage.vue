<script setup lang="ts">
/**
 * UserFormPage Component
 *
 * Uses MVVM + Input/Output/Effect (I/O/E) architecture
 * with Vue 3.4+ defineModel() components for v-model support.
 */
import { onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useUserFormViewModel } from '@/presentation/view-models'
import { navGraph } from '@/router'
import { useI18n } from '@/domain/services/i18n.service'
import LoadingSpinner from '@/presentation/components/shared/LoadingSpinner.vue'
import AlertMessage from '@/presentation/components/shared/AlertMessage.vue'
import { FormInput } from '@/presentation/components/form'

const { t } = useI18n()
const route = useRoute()

// ============================================================================
// VIEWMODEL SETUP
// ============================================================================

const vm = useUserFormViewModel()
const { models, outputs, inputs } = vm

// ============================================================================
// EFFECT HANDLING
// ============================================================================

const unsubscribe = vm.effects.subscribe((effect) => {
  switch (effect.type) {
    case 'navigation':
      handleNavigation(effect.payload)
      break
    case 'toast':
      console.log(`Toast: ${effect.payload.message} (${effect.payload.variant})`)
      break
  }
})

function handleNavigation(payload: { route: 'list' | 'detail'; userId?: number }) {
  switch (payload.route) {
    case 'list':
      navGraph.users.toList()
      break
    case 'detail':
      if (payload.userId) navGraph.users.toDetail(payload.userId)
      break
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  const id = route.params.id ? parseInt(route.params.id as string, 10) : null
  if (id) {
    inputs.initEditMode(id)
  } else {
    inputs.initCreateMode()
  }
})

onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <div class="user-form-page">
    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <button class="btn btn-outline-secondary" @click="inputs.cancel">
        <i class="bi bi-arrow-left me-2"></i>
        {{ t('common.back') }}
      </button>
      <h1 class="h3 mb-0">{{ outputs.pageTitle.value }}</h1>
    </div>

    <!-- Alerts -->
    <AlertMessage
      v-if="outputs.error.value"
      type="danger"
      :message="outputs.error.value"
      dismissible
      @dismiss="inputs.clearError"
    />

    <!-- Loading -->
    <LoadingSpinner v-if="outputs.isLoading.value" />

    <!-- Form -->
    <div v-else class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="inputs.submit">
              <div class="row g-3">
                <!-- First Name -->
                <div class="col-md-6">
                  <FormInput
                    id="firstName"
                    v-model="models.firstName.value"
                    v-model:error="outputs.errors.firstName.value"
                    :label="t('user.form.firstName')"
                    :placeholder="t('user.form.firstNamePlaceholder')"
                    required
                    @blur="inputs.validateField('firstName')"
                  />
                </div>

                <!-- Last Name -->
                <div class="col-md-6">
                  <FormInput
                    id="lastName"
                    v-model="models.lastName.value"
                    v-model:error="outputs.errors.lastName.value"
                    :label="t('user.form.lastName')"
                    :placeholder="t('user.form.lastNamePlaceholder')"
                    required
                    @blur="inputs.validateField('lastName')"
                  />
                </div>

                <!-- Email -->
                <div class="col-12">
                  <FormInput
                    id="email"
                    v-model="models.email.value"
                    v-model:error="outputs.errors.email.value"
                    type="email"
                    :label="t('user.form.email')"
                    :placeholder="t('user.form.emailPlaceholder')"
                    required
                    @blur="inputs.validateField('email')"
                  />
                </div>

                <!-- Job -->
                <div class="col-12">
                  <FormInput
                    id="job"
                    v-model="models.job.value"
                    v-model:error="outputs.errors.job.value"
                    :label="t('user.form.job')"
                    :placeholder="t('user.form.jobPlaceholder')"
                    required
                    @blur="inputs.validateField('job')"
                  />
                </div>
              </div>

              <div class="d-flex gap-2 mt-4">
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="!outputs.canSubmit.value || outputs.isSaving.value"
                >
                  <span v-if="outputs.isSaving.value">
                    <span class="spinner-border spinner-border-sm me-2"></span>
                    {{ t('common.loading') }}
                  </span>
                  <span v-else>
                    <i class="bi bi-check-lg me-2"></i>
                    {{ t('common.save') }}
                  </span>
                </button>
                <button
                  type="button"
                  class="btn btn-outline-secondary"
                  :disabled="!outputs.canReset.value"
                  @click="inputs.reset"
                >
                  <i class="bi bi-arrow-counterclockwise me-2"></i>
                  {{ t('common.reset') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h6 class="mb-0">{{ t('user.form.tips') }}</h6>
          </div>
          <div class="card-body">
            <ul class="list-unstyled mb-0">
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                {{ t('user.form.tipName') }}
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                {{ t('user.form.tipEmail') }}
              </li>
              <li class="mb-2">
                <i class="bi bi-check-circle text-success me-2"></i>
                {{ t('user.form.tipJob') }}
              </li>
              <li>
                <i class="bi bi-info-circle text-info me-2"></i>
                {{ t('user.form.tipApi') }}
              </li>
            </ul>
          </div>
        </div>

        <!-- Form Status -->
        <div class="card mt-3">
          <div class="card-header">
            <h6 class="mb-0">Status</h6>
          </div>
          <div class="card-body">
            <div class="d-flex align-items-center gap-2 mb-2">
              <span :class="outputs.isDirty.value ? 'badge bg-warning' : 'badge bg-secondary'">
                {{ outputs.isDirty.value ? 'Modified' : 'Unchanged' }}
              </span>
              <span :class="outputs.isValid.value ? 'badge bg-success' : 'badge bg-danger'">
                {{ outputs.isValid.value ? 'Valid' : 'Invalid' }}
              </span>
            </div>
            <small class="text-muted">
              {{ outputs.isDirty.value ? 'You have unsaved changes' : 'No changes made' }}
            </small>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
