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
const showUserDropdown = ref(false)

const currentUser = {
  name: 'George Bluth',
  email: 'george.bluth@reqres.in',
  role: 'Administrator',
  avatar: 'https://reqres.in/img/faces/1-image.jpg'
}

const userMenuActions = [
  { icon: 'bi-person', label: t('nav.profile'), action: 'profile' },
  { icon: 'bi-gear', label: t('nav.settings'), action: 'settings' },
  { icon: 'bi-question-circle', label: t('nav.help'), action: 'help' },
  { icon: 'bi-box-arrow-right', label: t('nav.logout'), action: 'logout', danger: true, divider: true }
]

function handleSearch() {
  console.log('Search:', searchQuery.value)
}

function selectLanguage(lang: Language) {
  setLanguage(lang)
  showLanguageDropdown.value = false
}

function handleUserMenuAction(action: string) {
  showUserDropdown.value = false
  console.log('User menu action:', action)
}

function closeDropdowns(event: MouseEvent) {
  const target = event.target as Element
  if (!target.closest('.language-dropdown-wrapper')) {
    showLanguageDropdown.value = false
  }
  if (!target.closest('.user-dropdown-wrapper')) {
    showUserDropdown.value = false
  }
}
</script>

<template>
  <header class="app-header" @click="closeDropdowns">
    <div class="header-container">
      <!-- Left Section: Menu Toggle & Brand -->
      <div class="header-left">
        <button
          type="button"
          class="sidebar-toggle"
          @click.stop="emit('toggle-sidebar')"
          aria-label="Toggle sidebar"
        >
          <i class="bi bi-list"></i>
        </button>
        <a href="/" class="brand">
          <i class="bi bi-hexagon-fill text-primary me-2"></i>
          <span class="brand-text">Arcana</span>
        </a>
      </div>

      <!-- Center Section: Search -->
      <div class="header-center d-none d-md-flex">
        <div class="search-box">
          <i class="bi bi-search search-icon"></i>
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            :placeholder="t('header.search')"
            @keyup.enter="handleSearch"
          />
          <button type="button" class="search-button" aria-label="Search" @click="handleSearch">
            <i class="bi bi-search"></i>
          </button>
        </div>
      </div>

      <!-- Right Section: Actions -->
      <div class="header-right">
        <!-- Language Selector -->
        <div class="language-dropdown-wrapper position-relative">
          <button
            type="button"
            class="header-action language-selector"
            @click.stop="showLanguageDropdown = !showLanguageDropdown"
            aria-label="Select language"
          >
            <span class="language-flag">{{ AVAILABLE_LANGUAGES.find(l => l.code === language)?.flag }}</span>
            <span class="language-name d-none d-sm-inline ms-1">
              {{ AVAILABLE_LANGUAGES.find(l => l.code === language)?.name }}
            </span>
          </button>
          <div
            v-if="showLanguageDropdown"
            class="dropdown-menu show language-dropdown position-absolute end-0"
          >
            <h6 class="dropdown-header">Select Language</h6>
            <button
              v-for="lang in AVAILABLE_LANGUAGES"
              :key="lang.code"
              type="button"
              class="dropdown-item d-flex align-items-center"
              :class="{ active: lang.code === language }"
              @click="selectLanguage(lang.code)"
            >
              <span class="me-2">{{ lang.flag }}</span>
              {{ lang.name }}
              <i v-if="lang.code === language" class="bi bi-check ms-auto text-primary"></i>
            </button>
          </div>
        </div>

        <!-- Notifications -->
        <button
          type="button"
          class="header-action position-relative"
          aria-label="Notifications"
        >
          <i class="bi bi-bell"></i>
          <span class="badge-notification">3</span>
        </button>

        <!-- Right Panel Toggle -->
        <button
          type="button"
          class="header-action d-none d-lg-inline-block"
          @click.stop="emit('toggle-right-panel')"
          aria-label="Toggle right panel"
        >
          <i class="bi bi-layout-sidebar-inset-reverse"></i>
        </button>

        <!-- User Menu -->
        <div class="user-dropdown-wrapper position-relative">
          <button
            type="button"
            class="header-action user-menu-toggle"
            @click.stop="showUserDropdown = !showUserDropdown"
          >
            <img
              :src="currentUser.avatar"
              :alt="currentUser.name"
              class="user-avatar-header"
            />
            <span class="d-none d-md-inline ms-2">{{ currentUser.name }}</span>
            <i class="bi bi-chevron-down ms-1 d-none d-md-inline"></i>
          </button>
          <div
            v-if="showUserDropdown"
            class="dropdown-menu show user-dropdown position-absolute end-0"
          >
            <!-- User Info -->
            <div class="user-dropdown-header">
              <img
                :src="currentUser.avatar"
                :alt="currentUser.name"
                class="user-avatar-large"
              />
              <div class="user-details">
                <div class="user-name">{{ currentUser.name }}</div>
                <div class="user-email">{{ currentUser.email }}</div>
                <span class="badge bg-primary">{{ currentUser.role }}</span>
              </div>
            </div>
            <div class="dropdown-divider"></div>
            <!-- Menu Actions -->
            <template v-for="item in userMenuActions" :key="item.action">
              <div v-if="item.divider" class="dropdown-divider"></div>
              <button
                type="button"
                class="dropdown-item"
                :class="{ 'text-danger': item.danger }"
                @click="handleUserMenuAction(item.action)"
              >
                <i :class="[item.icon, 'me-2']"></i>
                {{ item.label }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.dropdown-menu.show {
  display: block;
  margin-top: 0.5rem;
}

.dropdown-divider {
  margin: 0.5rem 0;
  border-top: 1px solid #e0e0e0;
}
</style>
