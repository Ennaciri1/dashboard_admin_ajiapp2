import { describe, it, expect } from 'vitest'
import { getAccessToken, setTokens, clearTokens } from '../lib/auth'

describe('Auth utilities', () => {
  it('should store and retrieve access token', () => {
    setTokens('test-access-token', 'test-refresh-token')
    expect(getAccessToken()).toBe('test-access-token')
    clearTokens()
    expect(getAccessToken()).toBe(null)
  })
})
