import { createContext, useContext, useEffect, useState } from 'react'
import authService from '../services/supabaseAuth.js'

const AuthContext = createContext(null)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const currentSession = await authService.getSession()
        setSession(currentSession)
        
        // Only get user if we have a session
        if (currentSession) {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        setSession(null)
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen to auth state changes
    const unsubscribe = authService.onAuthStateChange(async (event, session) => {
      setSession(session)
      if (session) {
        try {
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          // If getting user fails, clear user but keep session for retry
          console.error('Error getting user in auth state change:', error)
          setUser(null)
        }
      } else {
        setUser(null)
      }

      // Handle specific events
      if (event === 'SIGNED_OUT') {
        setUser(null)
        setSession(null)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const signInWithOAuth = async (provider) => {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error, url } = await authService.signInWithOAuth(provider, {
        redirectTo
      })

      if (error) {
        console.error('OAuth sign in error:', error)
        return { error }
      }

      // Redirect to OAuth provider
      if (url) {
        window.location.href = url
      }

      return { error: null }
    } catch (error) {
      console.error('OAuth sign in error:', error)
      return { error }
    }
  }

  const signOut = async () => {
    const { error } = await authService.signOut()
    if (error) {
      console.error('Sign out error:', error)
    }
    return { error }
  }

  const value = {
    user,
    session,
    loading,
    signInWithOAuth,
    signOut,
    isAuthenticated: !!user
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
