import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const BCRYPT_SALT_ROUNDS = 12

/**
 * Hashes a plain-text password using bcrypt with a salt round cost of 12.
 */
export async function hashPassword(password: string): Promise<string> {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string')
  }
  return bcrypt.hash(password, BCRYPT_SALT_ROUNDS)
}

/**
 * Compares a plain-text password with a hashed password using constant-time comparison.
 * Returns true if matching, false otherwise.
 */
export async function comparePassword(
  plainText: string,
  hashedPassword: string
): Promise<boolean> {
  if (!plainText || !hashedPassword) return false

  try {
    // Standard bcrypt comparison is constant-time for bcrypt hashes
    return await bcrypt.compare(plainText, hashedPassword)
  } catch {
    return false
  }
}

/**
 * Constant-time string comparison using Node.js crypto.timingSafeEqual
 * to prevent timing side-channel attacks when checking raw strings or legacy hashes.
 */
export function safeTimingCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf8')
    const bufB = Buffer.from(b, 'utf8')

    if (bufA.length !== bufB.length) {
      // Execute dummy comparison to maintain constant time execution curve
      crypto.timingSafeEqual(bufA, bufA)
      return false
    }

    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

/**
 * Identifies if a stored password string is plain-text or a legacy weak hash (MD5, SHA1, SHA256, or bcrypt < 12 rounds).
 */
export function isLegacyHash(storedPassword: string): boolean {
  if (!storedPassword) return false

  // Check if bcrypt hash format ($2a$, $2b$, $2y$)
  if (/^\$2[aby]\$\d{2}\$/.test(storedPassword)) {
    const rounds = parseInt(storedPassword.split('$')[2] || '0', 10)
    // Needs rehash if salt rounds < 12
    return isNaN(rounds) || rounds < BCRYPT_SALT_ROUNDS
  }

  // Plain-text, MD5 (32 hex), SHA-1 (40 hex), SHA-256 (64 hex) are legacy formats
  return true
}

export interface PasswordVerificationResult {
  isValid: boolean
  needsRehash: boolean
  newHash?: string
}

/**
 * Verifies password against stored password string.
 * If password matches but legacy/weak format (plain-text, MD5, SHA-1, low-round bcrypt),
 * automatically generates a new 12-round bcrypt hash for inline database migration on next login.
 */
export async function verifyAndMigratePassword(
  plainText: string,
  storedPassword: string
): Promise<PasswordVerificationResult> {
  if (!plainText || !storedPassword) {
    return { isValid: false, needsRehash: false }
  }

  // Case A: Modern bcrypt hash
  if (/^\$2[aby]\$\d{2}\$/.test(storedPassword)) {
    const rounds = parseInt(storedPassword.split('$')[2] || '0', 10)
    const isValid = await comparePassword(plainText, storedPassword)

    if (isValid && rounds < BCRYPT_SALT_ROUNDS) {
      const newHash = await hashPassword(plainText)
      return { isValid: true, needsRehash: true, newHash }
    }

    return { isValid, needsRehash: false }
  }

  // Case B: Legacy MD5 (32 hex characters)
  if (/^[a-fA-F0-9]{32}$/.test(storedPassword)) {
    const candidateHash = crypto.createHash('md5').update(plainText).digest('hex')
    const isValid = safeTimingCompare(candidateHash.toLowerCase(), storedPassword.toLowerCase())
    if (isValid) {
      const newHash = await hashPassword(plainText)
      return { isValid: true, needsRehash: true, newHash }
    }
    return { isValid: false, needsRehash: false }
  }

  // Case C: Legacy SHA-1 (40 hex characters)
  if (/^[a-fA-F0-9]{40}$/.test(storedPassword)) {
    const candidateHash = crypto.createHash('sha1').update(plainText).digest('hex')
    const isValid = safeTimingCompare(candidateHash.toLowerCase(), storedPassword.toLowerCase())
    if (isValid) {
      const newHash = await hashPassword(plainText)
      return { isValid: true, needsRehash: true, newHash }
    }
    return { isValid: false, needsRehash: false }
  }

  // Case D: Legacy SHA-256 (64 hex characters)
  if (/^[a-fA-F0-9]{64}$/.test(storedPassword)) {
    const candidateHash = crypto.createHash('sha256').update(plainText).digest('hex')
    const isValid = safeTimingCompare(candidateHash.toLowerCase(), storedPassword.toLowerCase())
    if (isValid) {
      const newHash = await hashPassword(plainText)
      return { isValid: true, needsRehash: true, newHash }
    }
    return { isValid: false, needsRehash: false }
  }

  // Case E: Plain-text legacy password
  const isValid = safeTimingCompare(plainText, storedPassword)
  if (isValid) {
    const newHash = await hashPassword(plainText)
    return { isValid: true, needsRehash: true, newHash }
  }

  return { isValid: false, needsRehash: false }
}
