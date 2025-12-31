<script setup lang="ts">
/**
 * UserDetailPage Component
 *
 * Uses MVVM + Input/Output/Effect (I/O/E) architecture
 * with v-model support and Unidirectional Data Flow (UDF).
 */
import { onMounted, onUnmounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useUserDetailViewModel } from '@/presentation/view-models'
import { navGraph } from '@/router'
import { useI18n } from '@/domain/services/i18n.service'
import LoadingSpinner from '@/presentation/components/shared/LoadingSpinner.vue'
import ConfirmationDialog from '@/presentation/components/shared/ConfirmationDialog.vue'
import AlertMessage from '@/presentation/components/shared/AlertMessage.vue'

const { t } = useI18n()
const route = useRoute()

// ============================================================================
// VIEWMODEL SETUP
// ============================================================================

const vm = useUserDetailViewModel()
const { outputs, inputs } = vm

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
    case 'dialog':
      break
  }
})

function handleNavigation(payload: { route: 'list' | 'edit'; userId?: number }) {
  switch (payload.route) {
    case 'list':
      navGraph.users.toList()
      break
    case 'edit':
      if (payload.userId) navGraph.users.toEdit(payload.userId)
      break
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  const id = parseInt(route.params.id as string, 10)
  inputs.loadUser(id)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    const id = parseInt(newId as string, 10)
    inputs.loadUser(id)
  }
})

onUnmounted(() => {
  unsubscribe()
})
</script>

<template>
  <div class="user-detail-page">
    <!-- Header -->
    <div class="d-flex align-items-center gap-3 mb-4">
      <button class="btn btn-outline-secondary" @click="inputs.goBack">
        <i class="bi bi-arrow-left me-2"></i>
        {{ t('user.detail.back') }}
      </button>
      <h1 class="h3 mb-0">{{ t('user.detail.title') }}</h1>
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

    <!-- User Details -->
    <div v-else-if="outputs.hasUser.value" class="row">
      <div class="col-lg-4">
        <div class="card mb-4">
          <div class="card-body text-center">
            <img
              :src="outputs.user.value!.avatar"
              :alt="outputs.fullName.value"
              class="rounded-circle mb-3"
              width="120"
              height="120"
            />
            <h4 class="mb-1">{{ outputs.fullName.value }}</h4>
            <p class="text-muted mb-3">{{ outputs.user.value!.email }}</p>
            <div class="d-grid gap-2">
              <button
                class="btn btn-primary"
                :disabled="!outputs.canEdit.value"
                @click="inputs.editUser"
              >
                <i class="bi bi-pencil me-2"></i>
                {{ t('user.detail.editUser') }}
              </button>
              <button
                class="btn btn-outline-danger"
                :disabled="!outputs.canDelete.value"
                @click="inputs.confirmDelete"
              >
                <i class="bi bi-trash me-2"></i>
                {{ t('user.detail.deleteUser') }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-8">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">User Information</h5>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label text-muted">{{ t('user.detail.firstName') }}</label>
                <div class="fw-semibold">{{ outputs.user.value!.firstName }}</div>
              </div>
              <div class="col-md-6">
                <label class="form-label text-muted">{{ t('user.detail.lastName') }}</label>
                <div class="fw-semibold">{{ outputs.user.value!.lastName }}</div>
              </div>
              <div class="col-12">
                <label class="form-label text-muted">{{ t('user.detail.email') }}</label>
                <div class="fw-semibold">{{ outputs.user.value!.email }}</div>
              </div>
              <div class="col-12">
                <label class="form-label text-muted">User ID</label>
                <div class="fw-semibold">#{{ outputs.user.value!.id }}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Activity Card -->
        <div class="card mt-4">
          <div class="card-header">
            <h5 class="mb-0">Recent Activity</h5>
          </div>
          <div class="card-body">
            <div class="timeline">
              <div class="timeline-item d-flex gap-3 mb-3">
                <div class="timeline-icon bg-primary text-white rounded-circle p-2">
                  <i class="bi bi-person-check"></i>
                </div>
                <div>
                  <div class="fw-semibold">Profile Updated</div>
                  <small class="text-muted">2 hours ago</small>
                </div>
              </div>
              <div class="timeline-item d-flex gap-3 mb-3">
                <div class="timeline-icon bg-success text-white rounded-circle p-2">
                  <i class="bi bi-check-circle"></i>
                </div>
                <div>
                  <div class="fw-semibold">Task Completed</div>
                  <small class="text-muted">5 hours ago</small>
                </div>
              </div>
              <div class="timeline-item d-flex gap-3">
                <div class="timeline-icon bg-info text-white rounded-circle p-2">
                  <i class="bi bi-envelope"></i>
                </div>
                <div>
                  <div class="fw-semibold">Message Sent</div>
                  <small class="text-muted">1 day ago</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      :show="outputs.showDeleteDialog.value"
      :title="t('user.delete.title')"
      :message="t('user.delete.confirm')"
      :confirm-text="t('common.delete')"
      variant="danger"
      @confirm="inputs.executeDelete"
      @cancel="inputs.cancelDelete"
    />
  </div>
</template>

<style scoped>
.timeline-icon {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
</style>
