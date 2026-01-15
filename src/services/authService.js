/**
 * Authentication Service Interface
 * 
 * This is an abstraction layer that defines the contract for authentication.
 * To replace Supabase with another backend, implement this interface with
 * a new service (e.g., authServiceFirebase.js, authServiceCustom.js)
 * and update the import in AuthContext.jsx
 */

/**
 * @typedef {Object} User
 * @property {string} id - User ID
 * @property {string} email - User email
 * @property {Object} user_metadata - Additional user metadata
 */

/**
 * @typedef {Object} AuthResponse
 * @property {User|null} user - Authenticated user
 * @property {Error|null} error - Error if authentication failed
 */

class AuthService {
  /**
   * Sign in with OAuth provider (Azure SSO, Google SSO, etc.)
   * @param {string} provider - OAuth provider name ('azure', 'google')
   * @param {Object} options - Additional options (redirectTo, etc.)
   * @returns {Promise<AuthResponse>}
   */
  async signInWithOAuth(provider, options = {}) {
    throw new Error('signInWithOAuth must be implemented')
  }

  /**
   * Sign out the current user
   * @returns {Promise<{error: Error|null}>}
   */
  async signOut() {
    throw new Error('signOut must be implemented')
  }

  /**
   * Get the current authenticated user
   * @returns {Promise<User|null>}
   */
  async getCurrentUser() {
    throw new Error('getCurrentUser must be implemented')
  }

  /**
   * Get the current session
   * @returns {Promise<Object|null>}
   */
  async getSession() {
    throw new Error('getSession must be implemented')
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function that receives (event, session)
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    throw new Error('onAuthStateChange must be implemented')
  }
}

export default AuthService
