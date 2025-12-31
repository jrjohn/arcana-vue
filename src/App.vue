<script setup lang="ts">
import { RouterView } from 'vue-router'
import ErrorBoundary from '@/presentation/components/error/ErrorBoundary.vue'
</script>

<template>
  <ErrorBoundary>
    <RouterView />
  </ErrorBoundary>
</template>

<style scoped>
</style>
