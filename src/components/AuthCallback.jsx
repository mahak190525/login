import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabase.js'
import './AuthCallback.css'

const AuthCallback = () => {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState(null)
  const [processing, setProcessing] = useState(true)

  useEffect(() => {
    // Check for error in URL parameters
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (errorParam) {
      setError(errorDescription || 'Authentication failed. Please try again.')
      setProcessing(false)
      setTimeout(() => {
        navigate('/', { replace: true })
      }, 3000)
      return
    }

    // Process the OAuth callback
    const handleCallback = async () => {
      try {
        // Wait a moment for Supabase to process the URL hash
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Get the session - Supabase should have processed the URL hash by now
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          // Only log non-session-missing errors
          if (sessionError.name !== 'AuthSessionMissingError') {
            console.error('Session error:', sessionError)
          }
        }

        if (session) {
          // Session found, wait a moment for auth context to update
          setTimeout(() => {
            navigate('/dashboard', { replace: true })
          }, 300)
        } else {
          // No session found yet, wait a bit more and retry
          setTimeout(async () => {
            const { data: { session: retrySession }, error: retryError } = await supabase.auth.getSession()
            
            if (retryError && retryError.name !== 'AuthSessionMissingError') {
              console.error('Retry session error:', retryError)
            }
            
            if (retrySession) {
              navigate('/dashboard', { replace: true })
            } else {
              // Check if there's a code in the URL (PKCE flow)
              const code = searchParams.get('code')
              if (code) {
                // Try to exchange code for session
                try {
                  const { data: { session: exchangedSession }, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
                  if (exchangedSession) {
                    navigate('/dashboard', { replace: true })
                    return
                  }
                  if (exchangeError) {
                    console.error('Code exchange error:', exchangeError)
                  }
                } catch (exchangeErr) {
                  console.error('Code exchange exception:', exchangeErr)
                }
              }
              
              setError('Authentication failed. Please try again.')
              setProcessing(false)
              setTimeout(() => {
                navigate('/', { replace: true })
              }, 3000)
            }
          }, 1500)
        }
      } catch (err) {
        console.error('Callback error:', err)
        setError('An error occurred during authentication.')
        setProcessing(false)
        setTimeout(() => {
          navigate('/', { replace: true })
        }, 3000)
      }
    }

    handleCallback()
  }, [navigate, searchParams])

  // Also watch for user state changes from AuthContext
  useEffect(() => {
    if (!loading && !processing && user) {
      navigate('/dashboard', { replace: true })
    } else if (!loading && !processing && !user && !error) {
      // Give it a bit more time if still processing
      const timeout = setTimeout(() => {
        if (!user) {
          setError('Authentication failed. Please try again.')
          setProcessing(false)
          setTimeout(() => {
            navigate('/', { replace: true })
          }, 3000)
        }
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [user, loading, navigate, processing, error])

  if (loading || processing) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-card">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Completing sign in...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="auth-callback-container">
        <div className="auth-callback-card">
          <div className="error-state">
            <p>{error}</p>
            <p className="redirect-message">Redirecting to login...</p>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default AuthCallback
