import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormSearchInput from '@/presentation/components/form/FormSearchInput.vue'

describe('FormSearchInput', () => {
  describe('rendering', () => {
    it('should render search input wrapper', () => {
      const wrapper = mount(FormSearchInput)
      expect(wrapper.find('.search-input-wrapper').exists()).toBe(true)
    })

    it('should render search icon', () => {
      const wrapper = mount(FormSearchInput)
      expect(wrapper.find('.bi-search').exists()).toBe(true)
    })

    it('should render text input', () => {
      const wrapper = mount(FormSearchInput)
      expect(wrapper.find('input[type="text"]').exists()).toBe(true)
    })

    it('should apply placeholder when provided', () => {
      const wrapper = mount(FormSearchInput, {
        props: { placeholder: 'Search users...' }
      })
      expect(wrapper.find('input').attributes('placeholder')).toBe('Search users...')
    })

    it('should be disabled when disabled prop is true', () => {
      const wrapper = mount(FormSearchInput, {
        props: { disabled: true }
      })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    it('should not be disabled by default', () => {
      const wrapper = mount(FormSearchInput)
      expect(wrapper.find('input').attributes('disabled')).toBeUndefined()
    })
  })

  describe('v-model', () => {
    it('should update model value on input', async () => {
      const wrapper = mount(FormSearchInput)
      const input = wrapper.find('input')

      await input.setValue('test search')

      expect(wrapper.vm.model).toBe('test search')
    })

    it('should reflect initial model value', async () => {
      const wrapper = mount(FormSearchInput, {
        props: {
          modelValue: 'initial value'
        }
      })

      expect(wrapper.find('input').element.value).toBe('initial value')
    })

    it('should emit update:modelValue on input', async () => {
      const wrapper = mount(FormSearchInput)
      const input = wrapper.find('input')

      await input.setValue('new value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['new value'])
    })
  })

  describe('clear button', () => {
    it('should not show clear button when input is empty', () => {
      const wrapper = mount(FormSearchInput)
      expect(wrapper.find('.bi-x-lg').exists()).toBe(false)
    })

    it('should show clear button when input has value', async () => {
      const wrapper = mount(FormSearchInput, {
        props: { modelValue: 'some text' }
      })
      expect(wrapper.find('.bi-x-lg').exists()).toBe(true)
    })

    it('should clear input when clear button is clicked', async () => {
      const wrapper = mount(FormSearchInput, {
        props: { modelValue: 'some text' }
      })

      await wrapper.find('.btn-link').trigger('click')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')!.pop()).toEqual([''])
    })

    it('should emit clear event when clear button is clicked', async () => {
      const wrapper = mount(FormSearchInput, {
        props: { modelValue: 'some text' }
      })

      await wrapper.find('.btn-link').trigger('click')

      expect(wrapper.emitted('clear')).toBeTruthy()
    })

    it('should add padding class when input has value', async () => {
      const wrapper = mount(FormSearchInput, {
        props: { modelValue: 'some text' }
      })

      expect(wrapper.find('input').classes()).toContain('pe-5')
    })

    it('should not have padding class when input is empty', async () => {
      const wrapper = mount(FormSearchInput)

      expect(wrapper.find('input').classes()).not.toContain('pe-5')
    })
  })

  describe('keyboard events', () => {
    it('should emit search event on Enter key', async () => {
      const wrapper = mount(FormSearchInput, {
        props: { modelValue: 'search query' }
      })
      const input = wrapper.find('input')

      await input.trigger('keydown', { key: 'Enter' })

      expect(wrapper.emitted('search')).toBeTruthy()
      expect(wrapper.emitted('search')![0]).toEqual(['search query'])
    })

    it('should clear input and emit clear on Escape key', async () => {
      const wrapper = mount(FormSearchInput, {
        props: { modelValue: 'some text' }
      })
      const input = wrapper.find('input')

      await input.trigger('keydown', { key: 'Escape' })

      expect(wrapper.emitted('clear')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')!.pop()).toEqual([''])
    })

    it('should not emit search on other keys', async () => {
      const wrapper = mount(FormSearchInput, {
        props: { modelValue: 'test' }
      })
      const input = wrapper.find('input')

      await input.trigger('keydown', { key: 'a' })

      expect(wrapper.emitted('search')).toBeFalsy()
    })
  })
})
