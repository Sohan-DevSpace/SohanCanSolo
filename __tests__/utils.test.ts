import { sanitizeString, sanitizeObject } from '../lib/security/sanitizer'
import { checkRateLimit } from '../lib/security/rateLimiter'

declare const describe: any
declare const test: any
declare const expect: any

describe('Security Utilities', () => {
  test('sanitizeString strips script tags and HTML elements', () => {
    const dirty = '<script>alert("xss")</script><b>Hello World</b>'
    const clean = sanitizeString(dirty)
    expect(clean).toBe('Hello World')
  })

  test('sanitizeObject recursively cleans nested properties', () => {
    const dirtyObj = {
      name: '<b>Alpona</b>',
      bio: '<script>evil()</script>Custom apparel',
      tags: ['<i>POD</i>', 'Fashion'],
    }
    const cleanObj = sanitizeObject(dirtyObj)
    expect(cleanObj.name).toBe('Alpona')
    expect(cleanObj.bio).toBe('Custom apparel')
    expect(cleanObj.tags).toEqual(['POD', 'Fashion'])
  })

  test('checkRateLimit restricts excess requests within window', () => {
    const ip = 'test-ip-123'
    const res1 = checkRateLimit(ip, 2, 1000)
    expect(res1.success).toBe(true)

    const res2 = checkRateLimit(ip, 2, 1000)
    expect(res2.success).toBe(true)

    const res3 = checkRateLimit(ip, 2, 1000)
    expect(res3.success).toBe(false)
  })
})
