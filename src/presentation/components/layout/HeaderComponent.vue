<script setup lang="ts">
import { ref } from 'vue'
import { useI18n, AVAILABLE_LANGUAGES, type Language } from '@/domain/services/i18n.service'

const emit = defineEmits<{
  (e: 'toggle-sidebar'): void
  (e: 'toggle-right-panel'): void
}>()

const { t, language, setLanguage } = useI18n()
const searchQuery = ref('')
const showLanguageDropdown = ref(false)

function handleSearch() {
  console.log('Search:', searchQuery.value)
}

function selectLanguage(lang: Language) {
  setLanguage(lang)
  showLanguageDropdown.value = false
}
</script>

<template>
  <header class="app-header d-flex align-items-center justify-content-between">
    <div class="d-flex align-items-center gap-3">
      <button class="btn btn-link text-dark p-0" @click="emit('toggle-sidebar')">
        <i class="bi bi-list fs-4"></i>
      </button>

      <div class="search-box position-relative">
        <i class="bi bi-search position-absolute top-50 translate-middle-y ms-3 text-muted"></i>
        <input
          v-model="searchQuery"
          type="text"
          class="form-control ps-5"
          :placeholder="t('header.search')"
          @keyup.enter="handleSearch"
        />
      </div>
    </div>

    <div class="d-flex align-items-center gap-3">
      <!-- Language Selector -->
      <div class="dropdown">
        <button
          class="btn btn-link text-dark p-0 position-relative"
          @click="showLanguageDropdown = !showLanguageDropdown"
        >
          <i class="bi bi-globe fs-5"></i>
        </button>
        <div
          v-if="showLanguageDropdown"
          class="dropdown-menu show position-absolute end-0"
          style="min-width: 180px;"
        >
          <button
            v-for="lang in AVAILABLE_LANGUAGES"
            :key="lang.code"
            class="dropdown-item d-flex align-items-center gap-2"
            :class="{ active: language === lang.code }"
            @click="selectLanguage(lang.code)"
          >
            <span>{{ lang.flag }}</span>
            <span>{{ lang.nativeName }}</span>
          </button>
        </div>
      </div>

      <!-- Notifications -->
      <button class="btn btn-link text-dark p-0 position-relative">
        <i class="bi bi-bell fs-5"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
          3
        </span>
      </button>

      <!-- Messages -->
      <button class="btn btn-link text-dark p-0 position-relative">
        <i class="bi bi-envelope fs-5"></i>
        <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
          5
        </span>
      </button>

      <!-- Right Panel Toggle -->
      <button class="btn btn-link text-dark p-0" @click="emit('toggle-right-panel')">
        <i class="bi bi-layout-sidebar-reverse fs-5"></i>
      </button>

      <!-- User Avatar -->
      <div class="dropdown">
        <button class="btn btn-link p-0">
          <img
            src="https://reqres.in/img/faces/1-image.jpg"
            alt="User"
            class="rounded-circle"
            width="36"
            height="36"
          />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped>
.search-box {
  width: 300px;
}

.search-box input {
  background-color: #f1f5f9;
  border: none;
}

.search-box input:focus {
  background-color: #fff;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item.active {
  background-color: #6366f1;
  color: #fff;
}
</style>
