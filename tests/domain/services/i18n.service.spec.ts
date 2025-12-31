import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useI18n, translate, AVAILABLE_LANGUAGES, i18nPlugin, type Language } from '@/domain/services/i18n.service'

describe('i18n Service', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  describe('AVAILABLE_LANGUAGES', () => {
    it('should have 6 languages', () => {
      expect(AVAILABLE_LANGUAGES).toHaveLength(6)
    })

    it('should include English', () => {
      const en = AVAILABLE_LANGUAGES.find(l => l.code === 'en')
      expect(en).toBeDefined()
      expect(en?.name).toBe('English')
      expect(en?.nativeName).toBe('English')
    })

    it('should include Chinese Simplified', () => {
      const zh = AVAILABLE_LANGUAGES.find(l => l.code === 'zh')
      expect(zh).toBeDefined()
      expect(zh?.nativeName).toBe('简体中文')
    })

    it('should include Chinese Traditional', () => {
      const zhTW = AVAILABLE_LANGUAGES.find(l => l.code === 'zh-TW')
      expect(zhTW).toBeDefined()
      expect(zhTW?.nativeName).toBe('繁體中文')
    })

    it('should include Spanish', () => {
      const es = AVAILABLE_LANGUAGES.find(l => l.code === 'es')
      expect(es).toBeDefined()
      expect(es?.nativeName).toBe('Español')
    })

    it('should include French', () => {
      const fr = AVAILABLE_LANGUAGES.find(l => l.code === 'fr')
      expect(fr).toBeDefined()
      expect(fr?.nativeName).toBe('Français')
    })

    it('should include German', () => {
      const de = AVAILABLE_LANGUAGES.find(l => l.code === 'de')
      expect(de).toBeDefined()
      expect(de?.nativeName).toBe('Deutsch')
    })
  })

  describe('translate', () => {
    it('should translate common keys', () => {
      expect(translate('common.loading')).toBe('Loading...')
      expect(translate('common.save')).toBe('Save')
      expect(translate('common.cancel')).toBe('Cancel')
    })

    it('should translate navigation keys', () => {
      expect(translate('nav.home')).toBe('Home')
      expect(translate('nav.users')).toBe('Users')
      expect(translate('nav.settings')).toBe('Settings')
    })

    it('should translate user module keys', () => {
      expect(translate('user.list.title')).toBe('User Management')
      expect(translate('user.form.name')).toBe('Name')
      expect(translate('user.delete.confirm')).toContain('Are you sure')
    })

    it('should translate error keys', () => {
      expect(translate('error.network')).toContain('Network error')
      expect(translate('error.notFound')).toContain('not found')
    })

    it('should return key if translation not found', () => {
      expect(translate('non.existent.key')).toBe('non.existent.key')
    })

    it('should interpolate parameters', () => {
      const result = translate('user.list.showing', { start: 1, end: 10, total: 100 })
      expect(result).toBe('Showing 1 to 10 of 100 users')
    })

    it('should handle multiple parameters', () => {
      const result = translate('user.list.showing', { start: 5, end: 15, total: 50 })
      expect(result).toContain('5')
      expect(result).toContain('15')
      expect(result).toContain('50')
    })
  })

  describe('useI18n', () => {
    it('should return language as English by default', () => {
      const { language } = useI18n()
      expect(language.value).toBe('en')
    })

    it('should return language info', () => {
      const { languageInfo } = useI18n()
      expect(languageInfo.value.code).toBe('en')
      expect(languageInfo.value.name).toBe('English')
    })

    it('should provide availableLanguages', () => {
      const { availableLanguages } = useI18n()
      expect(availableLanguages).toHaveLength(6)
    })

    it('should change language with setLanguage', () => {
      const { language, setLanguage } = useI18n()

      setLanguage('zh')
      expect(language.value).toBe('zh')
      expect(localStorage.getItem('arcana_language')).toBe('zh')
    })

    it('should translate using t function', () => {
      const { t, setLanguage } = useI18n()
      setLanguage('en')
      expect(t('common.save')).toBe('Save')
    })

    it('should translate using translate function', () => {
      const i18n = useI18n()
      i18n.setLanguage('en')
      expect(i18n.translate('common.cancel')).toBe('Cancel')
    })

    it('should use stored language from localStorage', () => {
      const { language, setLanguage } = useI18n()
      setLanguage('fr')
      expect(language.value).toBe('fr')
    })
  })

  describe('Language switching', () => {
    it('should translate to Chinese Simplified', () => {
      const { setLanguage, t } = useI18n()
      setLanguage('zh')
      expect(t('common.loading')).toBe('加载中...')
      expect(t('nav.home')).toBe('首页')
    })

    it('should translate to Chinese Traditional', () => {
      const { setLanguage, t } = useI18n()
      setLanguage('zh-TW')
      expect(t('common.loading')).toBe('載入中...')
      expect(t('nav.home')).toBe('首頁')
    })

    it('should translate to Spanish', () => {
      const { setLanguage, t } = useI18n()
      setLanguage('es')
      expect(t('common.loading')).toBe('Cargando...')
      expect(t('nav.home')).toBe('Inicio')
    })

    it('should translate to French', () => {
      const { setLanguage, t } = useI18n()
      setLanguage('fr')
      expect(t('common.loading')).toBe('Chargement...')
      expect(t('nav.home')).toBe('Accueil')
    })

    it('should translate to German', () => {
      const { setLanguage, t } = useI18n()
      setLanguage('de')
      expect(t('common.loading')).toBe('Laden...')
      expect(t('nav.home')).toBe('Startseite')
    })

    it('should switch back to English', () => {
      const { setLanguage, t } = useI18n()
      setLanguage('zh')
      expect(t('common.save')).toBe('保存')

      setLanguage('en')
      expect(t('common.save')).toBe('Save')
    })
  })

  describe('i18nPlugin', () => {
    it('should have install method', () => {
      expect(i18nPlugin.install).toBeDefined()
      expect(typeof i18nPlugin.install).toBe('function')
    })

    it('should install $t function on app', () => {
      const mockApp = {
        config: {
          globalProperties: {} as Record<string, unknown>
        },
        provide: vi.fn()
      }

      i18nPlugin.install(mockApp as never)

      expect(mockApp.config.globalProperties.$t).toBeDefined()
      expect(mockApp.provide).toHaveBeenCalledWith('i18n', expect.any(Object))
    })
  })
})
