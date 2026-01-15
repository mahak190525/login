import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'
import MSALLogin from './MSALLogin.jsx'
import './Login.css'

const Login = () => {
  const { signInWithOAuth, loading } = useAuth()
  const navigate = useNavigate()
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleOAuthSignIn = async (provider) => {
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signInWithOAuth(provider)
      if (error) {
        setError(error.message || 'Failed to sign in. Please try again.')
        setIsLoading(false)
      }
      // If successful, the user will be redirected to OAuth provider
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.')
      setIsLoading(false)
    }
  }

  // Handle successful MSAL login
  const handleMSALSuccess = (user) => {
    console.log('MSAL login successful, user:', user)
    // Navigate to dashboard after successful login
    navigate('/dashboard')
  }

  // Handle MSAL login error
  const handleMSALError = (errorMessage) => {
    console.error('MSAL login error:', errorMessage)
    setError(errorMessage)
  }

  if (loading) {
    return (
      <div className="login-container">
        <div className="login-card">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>CRM Portal</h1>
          <p>Sign in to continue</p>
        </div>

        {error && (
          <div className="error-message" role="alert">
            {error}
          </div>
        )}

        <div className="login-options">
          {/* Use MSAL for Microsoft login - this properly handles PKCE */}
          <MSALLogin 
            onSuccess={handleMSALSuccess} 
            onError={handleMSALError}
          />

          <button
            className="oauth-button google-button"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            type="button"
          >
            {isLoading ? (
              <span>Signing in...</span>
            ) : (
              <>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span>Sign in with Google</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Login
