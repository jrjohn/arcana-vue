<script setup lang="ts">
/**
 * ErrorPage Component
 * Full-page error display for 404, 500, and other error routes
 */

import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from '@/domain/services/i18n.service'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()

const errorCode = computed(() => {
  return (route.params.code as string) || '404'
})

const errorTitle = computed(() => {
  switch (errorCode.value) {
    case '403':
      return t('error.page.403.title')
    case '404':
      return t('error.page.404.title')
    case '500':
      return t('error.page.500.title')
    default:
      return t('error.page.unknown.title')
  }
})

const errorMessage = computed(() => {
  switch (errorCode.value) {
    case '403':
      return t('error.page.403.message')
    case '404':
      return t('error.page.404.message')
    case '500':
      return t('error.page.500.message')
    default:
      return t('error.page.unknown.message')
  }
})

const errorIcon = computed(() => {
  switch (errorCode.value) {
    case '403':
      return 'bi-shield-lock'
    case '404':
      return 'bi-search'
    case '500':
      return 'bi-bug'
    default:
      return 'bi-exclamation-circle'
  }
})

function goBack(): void {
  router.back()
}

function goHome(): void {
  router.push('/')
}
</script>

<template>
  <div class="error-page">
    <div class="error-page__container">
      <div class="error-page__icon">
        <i :class="['bi', errorIcon]"></i>
      </div>

      <h1 class="error-page__code">
        {{ errorCode }}
      </h1>

      <h2 class="error-page__title">
        {{ errorTitle }}
      </h2>

      <p class="error-page__message">
        {{ errorMessage }}
      </p>

      <div class="error-page__actions">
        <button class="btn btn-outline-secondary" type="button" @click="goBack">
          <i class="bi bi-arrow-left me-2"></i>
          {{ t('error.page.goBack') }}
        </button>

        <button class="btn btn-primary" type="button" @click="goHome">
          <i class="bi bi-house me-2"></i>
          {{ t('error.page.goHome') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.error-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background: linear-gradient(135deg, var(--bs-light) 0%, var(--bs-white) 100%);

  &__container {
    max-width: 500px;
    text-align: center;
  }

  &__icon {
    font-size: 5rem;
    color: var(--bs-secondary);
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  &__code {
    font-size: 6rem;
    font-weight: 700;
    color: var(--bs-primary);
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--bs-dark);
  }

  &__message {
    font-size: 1.1rem;
    color: var(--bs-secondary);
    margin-bottom: 2rem;
  }

  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    justify-content: center;
  }
}
</style>
