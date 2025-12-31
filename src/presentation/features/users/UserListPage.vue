<script setup lang="ts">
/**
 * UserListPage Component
 *
 * Uses MVVM + Input/Output/Effect (I/O/E) architecture
 * with Vue 3.4+ defineModel() components for v-model support.
 */
import { onMounted, onUnmounted } from 'vue'
import { useUserListViewModel } from '@/presentation/view-models'
import { navGraph } from '@/router'
import { useI18n } from '@/domain/services/i18n.service'
import LoadingSpinner from '@/presentation/components/shared/LoadingSpinner.vue'
import ConfirmationDialog from '@/presentation/components/shared/ConfirmationDialog.vue'
import AlertMessage from '@/presentation/components/shared/AlertMessage.vue'
import { FormSearchInput } from '@/presentation/components/form'

const { t } = useI18n()

// ============================================================================
// VIEWMODEL SETUP
// ============================================================================

const vm = useUserListViewModel()
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
    case 'dialog':
      break
  }
})

function handleNavigation(payload: { route: 'detail' | 'edit' | 'create'; userId?: number }) {
  switch (payload.route) {
    case 'detail':
      if (payload.userId) navGraph.users.toDetail(payload.userId)
      break
    case 'edit':
      if (payload.userId) navGraph.users.toEdit(payload.userId)
      break
    case 'create':
      navGraph.users.toCreate()
      break
  }
}

// ============================================================================
// LIFECYCLE
// ============================================================================

onMounted(() => {
  inputs.loadUsers()
})

onUnmounted(() => {
  unsubscribe()
  vm.dispose()
})
</script>

<template>
  <div class="user-list-page">
    <!-- Header -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
      <div>
        <h1 class="h3 mb-1">{{ t('user.list.title') }}</h1>
        <p class="text-muted mb-0">{{ t('user.list.subtitle') }}</p>
      </div>
      <button class="btn btn-primary" @click="inputs.createUser">
        <i class="bi bi-person-plus me-2"></i>
        {{ t('user.list.addNew') }}
      </button>
    </div>

    <!-- Alerts -->
    <AlertMessage
      v-if="outputs.successMessage.value"
      type="success"
      :message="outputs.successMessage.value"
      dismissible
      @dismiss="inputs.clearSuccessMessage"
    />
    <AlertMessage
      v-if="outputs.error.value"
      type="danger"
      :message="outputs.error.value"
      dismissible
      @dismiss="inputs.clearError"
    />

    <!-- Search & Filters -->
    <div class="card mb-4">
      <div class="card-body">
        <div class="row g-3">
          <div class="col-md-6">
            <!-- Using FormSearchInput with defineModel -->
            <FormSearchInput
              v-model="models.searchQuery.value"
              :placeholder="t('user.list.searchPlaceholder')"
              @clear="inputs.clearSearch"
            />
          </div>
          <div class="col-md-6 text-md-end">
            <button class="btn btn-outline-secondary" @click="inputs.refreshUsers">
              <i class="bi bi-arrow-clockwise me-2"></i>
              {{ t('common.refresh') }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <LoadingSpinner v-if="outputs.isLoading.value" />

    <!-- Users Table -->
    <div v-else-if="outputs.hasUsers.value" class="card">
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th style="width: 60px;">ID</th>
                <th>User</th>
                <th>{{ t('user.detail.email') }}</th>
                <th style="width: 150px;">{{ t('common.actions') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in outputs.users.value" :key="user.id">
                <td class="text-muted">#{{ user.id }}</td>
                <td>
                  <div class="d-flex align-items-center gap-3">
                    <img
                      :src="user.avatar"
                      :alt="`${user.firstName} ${user.lastName}`"
                      class="rounded-circle"
                      width="40"
                      height="40"
                    />
                    <div>
                      <div class="fw-semibold">{{ user.firstName }} {{ user.lastName }}</div>
                    </div>
                  </div>
                </td>
                <td>{{ user.email }}</td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button
                      class="btn btn-outline-primary"
                      :title="t('common.view')"
                      @click="inputs.viewUser(user)"
                    >
                      <i class="bi bi-eye"></i>
                    </button>
                    <button
                      class="btn btn-outline-secondary"
                      :title="t('common.edit')"
                      @click="inputs.editUser(user)"
                    >
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button
                      class="btn btn-outline-danger"
                      :title="t('common.delete')"
                      @click="inputs.confirmDelete(user)"
                    >
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Pagination -->
      <div class="card-footer d-flex flex-wrap justify-content-between align-items-center">
        <div class="text-muted small">
          {{ t('user.list.showing', { start: outputs.showingStart.value, end: outputs.showingEnd.value, total: outputs.total.value }) }}
        </div>
        <nav>
          <ul class="pagination pagination-sm mb-0">
            <li class="page-item" :class="{ disabled: !outputs.hasPrevPage.value }">
              <button class="page-link" @click="inputs.goToPrevPage">
                <i class="bi bi-chevron-left"></i>
              </button>
            </li>
            <li
              v-for="page in outputs.totalPages.value"
              :key="page"
              class="page-item"
              :class="{ active: page === models.currentPage.value }"
            >
              <button class="page-link" @click="inputs.goToPage(page)">{{ page }}</button>
            </li>
            <li class="page-item" :class="{ disabled: !outputs.hasNextPage.value }">
              <button class="page-link" @click="inputs.goToNextPage">
                <i class="bi bi-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="card">
      <div class="card-body text-center py-5">
        <i class="bi bi-people text-muted" style="font-size: 3rem;"></i>
        <p class="text-muted mt-3 mb-0">{{ t('user.list.noUsers') }}</p>
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
</style>
