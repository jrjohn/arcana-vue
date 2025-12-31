<script setup lang="ts">
const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://reqres.in/img/faces/1-image.jpg'
}
</script>

<template>
  <div class="user-panel">
    <div class="d-flex align-items-center gap-3">
      <img :src="user.avatar" :alt="user.name" class="avatar" />
      <div class="user-info">
        <div class="user-name">{{ user.name }}</div>
        <div class="user-email">{{ user.email }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
