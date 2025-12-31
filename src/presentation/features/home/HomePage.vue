<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from '@/domain/services/i18n.service'
import { userService } from '@/domain/services/user.service'

const { t } = useI18n()

const stats = ref({
  totalUsers: 0,
  activeProjects: 12,
  pendingTasks: 28,
  messages: 156
})

const recentUsers = ref<Array<{
  id: number
  name: string
  email: string
  avatar: string
}>>([])

onMounted(async () => {
  try {
    const result = await userService.getUsers(1)
    stats.value.totalUsers = result.total
    recentUsers.value = result.users.slice(0, 5).map(user => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      email: user.email,
      avatar: user.avatar
    }))
  } catch (error) {
    console.error('Failed to load users:', error)
  }
})
</script>

<template>
  <div class="home-page">
    <!-- Welcome Section -->
    <div class="mb-4">
      <h1 class="h3 mb-1">{{ t('home.welcome') }}</h1>
      <p class="text-muted mb-0">{{ t('home.subtitle') }}</p>
    </div>

    <!-- Stats Cards -->
    <div class="row g-4 mb-4">
      <div class="col-md-6 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-primary bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-people text-primary fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h2 class="h4 mb-0">{{ stats.totalUsers }}</h2>
                <p class="text-muted small mb-0">{{ t('home.totalUsers') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-success bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-folder text-success fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h2 class="h4 mb-0">{{ stats.activeProjects }}</h2>
                <p class="text-muted small mb-0">{{ t('home.activeProjects') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-warning bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-list-task text-warning fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h2 class="h4 mb-0">{{ stats.pendingTasks }}</h2>
                <p class="text-muted small mb-0">{{ t('home.pendingTasks') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 col-lg-3">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex align-items-center">
              <div class="flex-shrink-0">
                <div class="bg-info bg-opacity-10 rounded-3 p-3">
                  <i class="bi bi-envelope text-info fs-4"></i>
                </div>
              </div>
              <div class="flex-grow-1 ms-3">
                <h2 class="h4 mb-0">{{ stats.messages }}</h2>
                <p class="text-muted small mb-0">{{ t('home.messages') }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Users -->
    <div class="row">
      <div class="col-lg-8">
        <div class="card">
          <div class="card-header d-flex align-items-center justify-content-between">
            <h5 class="mb-0">Recent Users</h5>
            <RouterLink to="/users" class="btn btn-sm btn-outline-primary">
              View All
            </RouterLink>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover mb-0">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="user in recentUsers" :key="user.id">
                    <td>
                      <div class="d-flex align-items-center gap-2">
                        <img
                          :src="user.avatar"
                          :alt="user.name"
                          class="rounded-circle"
                          width="32"
                          height="32"
                        />
                        <span>{{ user.name }}</span>
                      </div>
                    </td>
                    <td>{{ user.email }}</td>
                    <td>
                      <RouterLink
                        :to="`/users/${user.id}`"
                        class="btn btn-sm btn-outline-primary"
                      >
                        <i class="bi bi-eye"></i>
                      </RouterLink>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Quick Actions</h5>
          </div>
          <div class="card-body">
            <div class="d-grid gap-2">
              <RouterLink to="/users/new" class="btn btn-primary">
                <i class="bi bi-person-plus me-2"></i>
                Add New User
              </RouterLink>
              <button class="btn btn-outline-secondary">
                <i class="bi bi-folder-plus me-2"></i>
                Create Project
              </button>
              <button class="btn btn-outline-secondary">
                <i class="bi bi-plus-square me-2"></i>
                Add Task
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
