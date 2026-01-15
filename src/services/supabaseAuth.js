import AuthService from './authService.js'
import { supabase } from '../lib/supabase.js'

/**
 * Supabase implementation of AuthService
 * This is the concrete implementation using Supabase.
 * To replace with another backend, create a new implementation
 * and update the import in AuthContext.jsx
 */
class SupabaseAuthService extends AuthService {
  /**
   * Sign in with OAuth provider
   * @param {string} provider - 'azure' or 'google'
   * @param {Object} options - { redirectTo?: string }
   * @returns {Promise<AuthResponse>}
   */
  async signInWithOAuth(provider, options = {}) {
    try {
      const oauthOptions = {
        redirectTo: options.redirectTo || window.location.origin,
        ...options
      }

      // Azure requires specific scopes and configuration
      if (provider === 'azure') {
        // Use the same scopes as your MSAL configuration
        oauthOptions.scopes = 'User.Read openid profile email'
        // Force PKCE flow and add additional parameters for Azure
        oauthOptions.queryParams = {
          prompt: 'select_account',
          response_mode: 'query', // Ensure query parameters instead of fragment
          code_challenge_method: 'S256' // Explicitly request PKCE
        }
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider === 'azure' ? 'azure' : 'google',
        options: oauthOptions
      })

      if (error) {
        return { user: null, error }
      }

      // OAuth redirects, so we return the URL
      return { user: null, error: null, url: data.url }
    } catch (error) {
      return { user: null, error }
    }
  }

  /**
   * Sign out the current user
   * @returns {Promise<{error: Error|null}>}
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut()
      return { error }
    } catch (error) {
      return { error }
    }
  }

  /**
   * Get the current authenticated user
   * @returns {Promise<User|null>}
   */
  async getCurrentUser() {
    try {
      // First check if there's a session to avoid unnecessary errors
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        return null
      }

      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) {
        // Only log non-session-missing errors
        if (error.name !== 'AuthSessionMissingError') {
          console.error('Error getting current user:', error)
        }
        return null
      }
      return user
    } catch (error) {
      // Silently handle session missing errors - this is expected when not logged in
      if (error.name !== 'AuthSessionMissingError') {
        console.error('Error getting current user:', error)
      }
      return null
    }
  }

  /**
   * Get the current session
   * @returns {Promise<Object|null>}
   */
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error
      return session
    } catch (error) {
      console.error('Error getting session:', error)
      return null
    }
  }

  /**
   * Listen to authentication state changes
   * @param {Function} callback - Callback function that receives (event, session)
   * @returns {Function} Unsubscribe function
   */
  onAuthStateChange(callback) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        callback(event, session)
      }
    )

    return () => {
      subscription?.unsubscribe()
    }
  }
}

export default new SupabaseAuthService()
