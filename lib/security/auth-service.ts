import { createClient } from '@/lib/supabase/server'
import {
  hashPassword,
  comparePassword,
  verifyAndMigratePassword,
  PasswordVerificationResult,
} from '@/lib/security/password'

export interface SignupCredentials {
  email: string
  password: string
  fullName: string
  username?: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface PasswordUpdateParams {
  userId: string
  newPassword: string
}

/**
 * Secure Authentication & Password Management Service.
 * Ensures passwords are hashed using bcrypt with salt rounds >= 12,
 * compares credentials in constant-time, and handles legacy hash migrations.
 */
export class AuthService {
  /**
   * Hashes password using bcrypt (12 salt rounds) before user creation.
   */
  static async prepareSignupPassword(password: string): Promise<string> {
    return hashPassword(password)
  }

  /**
   * Hashes new password using bcrypt (12 salt rounds) on password change or update.
   */
  static async preparePasswordUpdate(newPassword: string): Promise<string> {
    return hashPassword(newPassword)
  }

  /**
   * Verifies login credentials and handles automatic migration re-hashing
   * for legacy plain-text or weakly hashed passwords.
   */
  static async verifyAndMigrateLogin(
    plainTextPassword: string,
    storedHash: string
  ): Promise<PasswordVerificationResult> {
    // Uses constant-time comparison and auto-detects legacy MD5/SHA1/plain-text
    return verifyAndMigratePassword(plainTextPassword, storedHash)
  }

  /**
   * Migration utility: Updates user password hash in storage if re-hashing occurred.
   */
  static async applyHashMigration(
    userId: string,
    newBcryptHash: string
  ): Promise<boolean> {
    try {
      const supabase = await createClient()
      // Update stored user metadata/auth record with upgraded 12-round bcrypt hash
      const { error } = await supabase.auth.admin.updateUserById(userId, {
        user_metadata: {
          password_hash_v2: newBcryptHash,
          password_migrated_at: new Date().toISOString(),
        },
      })
      if (error) {
        console.error(`[HASH_MIGRATION_ERROR] Failed to persist migrated hash for user ${userId}:`, error.message)
        return false
      }
      console.log(`[HASH_MIGRATION_SUCCESS] Upgraded user password hash to 12-round bcrypt for user: ${userId}`)
      return true
    } catch (err) {
      console.error('[HASH_MIGRATION_EXCEPTION]', err)
      return false
    }
  }
}
