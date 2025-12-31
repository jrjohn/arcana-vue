import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import FormInput from '@/presentation/components/form/FormInput.vue'

describe('FormInput', () => {
  describe('rendering', () => {
    it('should render form input wrapper', () => {
      const wrapper = mount(FormInput)
      expect(wrapper.find('.form-input-wrapper').exists()).toBe(true)
    })

    it('should render input element', () => {
      const wrapper = mount(FormInput)
      expect(wrapper.find('input').exists()).toBe(true)
    })

    it('should render label when provided', () => {
      const wrapper = mount(FormInput, {
        props: { label: 'Email Address' }
      })
      expect(wrapper.find('.form-label').exists()).toBe(true)
      expect(wrapper.find('.form-label').text()).toContain('Email Address')
    })

    it('should not render label when not provided', () => {
      const wrapper = mount(FormInput)
      expect(wrapper.find('.form-label').exists()).toBe(false)
    })

    it('should hide label when hideLabel is true', () => {
      const wrapper = mount(FormInput, {
        props: { label: 'Hidden Label', hideLabel: true }
      })
      expect(wrapper.find('.form-label').exists()).toBe(false)
    })

    it('should show required asterisk when required', () => {
      const wrapper = mount(FormInput, {
        props: { label: 'Required Field', required: true }
      })
      expect(wrapper.find('.text-danger').exists()).toBe(true)
      expect(wrapper.find('.text-danger').text()).toBe('*')
    })

    it('should not show asterisk when not required', () => {
      const wrapper = mount(FormInput, {
        props: { label: 'Optional Field', required: false }
      })
      expect(wrapper.find('.text-danger').exists()).toBe(false)
    })
  })

  describe('input types', () => {
    it('should default to text type', () => {
      const wrapper = mount(FormInput)
      expect(wrapper.find('input').attributes('type')).toBe('text')
    })

    it('should render email type', () => {
      const wrapper = mount(FormInput, {
        props: { type: 'email' }
      })
      expect(wrapper.find('input').attributes('type')).toBe('email')
    })

    it('should render password type', () => {
      const wrapper = mount(FormInput, {
        props: { type: 'password' }
      })
      expect(wrapper.find('input').attributes('type')).toBe('password')
    })

    it('should render number type', () => {
      const wrapper = mount(FormInput, {
        props: { type: 'number' }
      })
      expect(wrapper.find('input').attributes('type')).toBe('number')
    })

    it('should render tel type', () => {
      const wrapper = mount(FormInput, {
        props: { type: 'tel' }
      })
      expect(wrapper.find('input').attributes('type')).toBe('tel')
    })

    it('should render url type', () => {
      const wrapper = mount(FormInput, {
        props: { type: 'url' }
      })
      expect(wrapper.find('input').attributes('type')).toBe('url')
    })
  })

  describe('input attributes', () => {
    it('should apply placeholder', () => {
      const wrapper = mount(FormInput, {
        props: { placeholder: 'Enter your email' }
      })
      expect(wrapper.find('input').attributes('placeholder')).toBe('Enter your email')
    })

    it('should apply disabled state', () => {
      const wrapper = mount(FormInput, {
        props: { disabled: true }
      })
      expect(wrapper.find('input').attributes('disabled')).toBeDefined()
    })

    it('should apply readonly state', () => {
      const wrapper = mount(FormInput, {
        props: { readonly: true }
      })
      expect(wrapper.find('input').attributes('readonly')).toBeDefined()
    })

    it('should apply autocomplete attribute', () => {
      const wrapper = mount(FormInput, {
        props: { autocomplete: 'email' }
      })
      expect(wrapper.find('input').attributes('autocomplete')).toBe('email')
    })

    it('should apply maxlength attribute', () => {
      const wrapper = mount(FormInput, {
        props: { maxlength: 100 }
      })
      expect(wrapper.find('input').attributes('maxlength')).toBe('100')
    })

    it('should apply minlength attribute', () => {
      const wrapper = mount(FormInput, {
        props: { minlength: 2 }
      })
      expect(wrapper.find('input').attributes('minlength')).toBe('2')
    })

    it('should apply pattern attribute', () => {
      const wrapper = mount(FormInput, {
        props: { pattern: '[A-Za-z]+' }
      })
      expect(wrapper.find('input').attributes('pattern')).toBe('[A-Za-z]+')
    })

    it('should apply required attribute', () => {
      const wrapper = mount(FormInput, {
        props: { required: true }
      })
      expect(wrapper.find('input').attributes('required')).toBeDefined()
    })

    it('should use custom id when provided', () => {
      const wrapper = mount(FormInput, {
        props: { id: 'my-custom-id' }
      })
      expect(wrapper.find('input').attributes('id')).toBe('my-custom-id')
    })

    it('should generate random id when not provided', () => {
      const wrapper = mount(FormInput)
      const id = wrapper.find('input').attributes('id')
      expect(id).toMatch(/^input-[a-z0-9]+$/)
    })
  })

  describe('v-model', () => {
    it('should update model value on input', async () => {
      const wrapper = mount(FormInput)
      const input = wrapper.find('input')

      await input.setValue('test value')

      expect(wrapper.emitted('update:modelValue')).toBeTruthy()
      expect(wrapper.emitted('update:modelValue')![0]).toEqual(['test value'])
    })

    it('should reflect initial model value', async () => {
      const wrapper = mount(FormInput, {
        props: { modelValue: 'initial value' }
      })

      expect(wrapper.find('input').element.value).toBe('initial value')
    })
  })

  describe('error handling', () => {
    it('should show error message when error is set', () => {
      const wrapper = mount(FormInput, {
        props: { error: 'validation.required' }
      })
      expect(wrapper.find('.invalid-feedback').exists()).toBe(true)
    })

    it('should not show error when error is null', () => {
      const wrapper = mount(FormInput, {
        props: { error: null }
      })
      expect(wrapper.find('.invalid-feedback').exists()).toBe(false)
    })

    it('should not show error when error is empty string', () => {
      const wrapper = mount(FormInput, {
        props: { error: '' }
      })
      expect(wrapper.find('.invalid-feedback').exists()).toBe(false)
    })

    it('should add is-invalid class when error exists', () => {
      const wrapper = mount(FormInput, {
        props: { error: 'Some error' }
      })
      expect(wrapper.find('input').classes()).toContain('is-invalid')
    })

    it('should set aria-invalid when error exists', () => {
      const wrapper = mount(FormInput, {
        props: { error: 'Some error' }
      })
      expect(wrapper.find('input').attributes('aria-invalid')).toBe('true')
    })

    it('should set aria-describedby when error exists', () => {
      const wrapper = mount(FormInput, {
        props: { id: 'test-input', error: 'Some error' }
      })
      expect(wrapper.find('input').attributes('aria-describedby')).toBe('test-input-error')
    })

    it('should display translated error message', () => {
      const wrapper = mount(FormInput, {
        props: { error: 'Raw error message' }
      })
      expect(wrapper.find('.invalid-feedback').text()).toBe('Raw error message')
    })
  })

  describe('events', () => {
    it('should emit blur event', async () => {
      const wrapper = mount(FormInput)
      const input = wrapper.find('input')

      await input.trigger('blur')

      expect(wrapper.emitted('blur')).toBeTruthy()
    })

    it('should emit focus event', async () => {
      const wrapper = mount(FormInput)
      const input = wrapper.find('input')

      await input.trigger('focus')

      expect(wrapper.emitted('focus')).toBeTruthy()
    })
  })

  describe('label association', () => {
    it('should associate label with input via for/id', () => {
      const wrapper = mount(FormInput, {
        props: { id: 'email-input', label: 'Email' }
      })

      const label = wrapper.find('label')
      const input = wrapper.find('input')

      expect(label.attributes('for')).toBe('email-input')
      expect(input.attributes('id')).toBe('email-input')
    })
  })
})
