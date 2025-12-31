import { describe, it, expect, beforeEach, vi } from 'vitest'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import { apiService } from '@/data/api/api.service'

describe('API Service', () => {
  let mock: MockAdapter

  beforeEach(() => {
    mock = new MockAdapter(apiService.getClient())
  })

  afterEach(() => {
    mock.restore()
  })

  describe('get', () => {
    it('should make GET request', async () => {
      const responseData = { data: { id: 1, name: 'Test' } }
      mock.onGet('/users/1').reply(200, responseData)

      const result = await apiService.get('/users/1')

      expect(result).toEqual(responseData)
    })

    it('should pass config options', async () => {
      mock.onGet('/users').reply(config => {
        expect(config.params).toEqual({ page: 1 })
        return [200, { data: [] }]
      })

      await apiService.get('/users', { params: { page: 1 } })
    })

    it('should throw on error', async () => {
      mock.onGet('/error').reply(500, { message: 'Server Error' })

      await expect(apiService.get('/error')).rejects.toThrow()
    })
  })

  describe('post', () => {
    it('should make POST request', async () => {
      const requestData = { name: 'John', job: 'Developer' }
      const responseData = { id: '123', ...requestData, createdAt: '2024-01-01' }

      mock.onPost('/users').reply(201, responseData)

      const result = await apiService.post('/users', requestData)

      expect(result).toEqual(responseData)
    })

    it('should send data in request body', async () => {
      mock.onPost('/users').reply(config => {
        const data = JSON.parse(config.data)
        expect(data.name).toBe('Test')
        return [201, { id: '1' }]
      })

      await apiService.post('/users', { name: 'Test' })
    })

    it('should handle empty data', async () => {
      mock.onPost('/empty').reply(200, { success: true })

      const result = await apiService.post('/empty')

      expect(result).toEqual({ success: true })
    })
  })

  describe('put', () => {
    it('should make PUT request', async () => {
      const requestData = { name: 'Jane', job: 'Designer' }
      const responseData = { ...requestData, updatedAt: '2024-01-02' }

      mock.onPut('/users/1').reply(200, responseData)

      const result = await apiService.put('/users/1', requestData)

      expect(result).toEqual(responseData)
    })

    it('should send data in request body', async () => {
      mock.onPut('/users/1').reply(config => {
        const data = JSON.parse(config.data)
        expect(data.name).toBe('Updated')
        return [200, { success: true }]
      })

      await apiService.put('/users/1', { name: 'Updated' })
    })
  })

  describe('patch', () => {
    it('should make PATCH request', async () => {
      const requestData = { name: 'Patched' }
      const responseData = { ...requestData, updatedAt: '2024-01-03' }

      mock.onPatch('/users/1').reply(200, responseData)

      const result = await apiService.patch('/users/1', requestData)

      expect(result).toEqual(responseData)
    })
  })

  describe('delete', () => {
    it('should make DELETE request', async () => {
      mock.onDelete('/users/1').reply(204, '')

      const result = await apiService.delete('/users/1')

      expect(result).toBe('')
    })

    it('should handle 204 No Content', async () => {
      mock.onDelete('/users/1').reply(204)

      await expect(apiService.delete('/users/1')).resolves.not.toThrow()
    })
  })

  describe('getClient', () => {
    it('should return axios instance', () => {
      const client = apiService.getClient()

      expect(client).toBeDefined()
      expect(client.defaults.baseURL).toBe('https://reqres.in/api')
    })

    it('should have correct timeout', () => {
      const client = apiService.getClient()

      expect(client.defaults.timeout).toBe(30000)
    })

    it('should have correct headers', () => {
      const client = apiService.getClient()

      expect(client.defaults.headers['Content-Type']).toBe('application/json')
      expect(client.defaults.headers['Accept']).toBe('application/json')
    })
  })
})
