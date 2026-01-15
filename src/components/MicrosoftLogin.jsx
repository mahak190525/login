import { useState } from 'react'
import { supabase } from '../lib/supabase.js'

const MicrosoftLogin = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)

  const handleMicrosoftLogin = async () => {
    try {
      setLoading(true)
      
      // Get the current origin for redirect URL
      const redirectUrl = `${window.location.origin}/auth/callback`
      
      console.log('Initiating Microsoft OAuth with redirect URL:', redirectUrl)
      
      const oauthOptions = {
        // Use the same scopes as your MSAL configuration
        scopes: 'User.Read openid profile email',
        redirectTo: redirectUrl,
        // Force specific OAuth parameters for Azure PKCE compatibility
        queryParams: {
          prompt: 'select_account',
          response_mode: 'query', // Use query parameters instead of fragment
          code_challenge_method: 'S256', // Explicitly request PKCE
          // Add domain hint if using specific tenant
          domain_hint: '85707f27-830a-4b92-aa8c-3830bfb6c6f5'
        }
      }
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: oauthOptions,
      })

      if (error) {
        console.error('Microsoft OAuth error:', error)
        throw error
      }

      console.log('Microsoft OAuth initiated successfully')
      // The redirect will happen automatically
      
    } catch (err) {
      setLoading(false)
      console.error('Microsoft login error:', err)
      
      // Provide specific error messages for common Azure issues
      let errorMessage = 'Failed to initiate Microsoft login'
      
      if (err.message?.includes('AADSTS9002325') || err.message?.includes('PKCE')) {
        errorMessage = 'PKCE authentication error. This may be a configuration issue with Azure or Supabase.'
      } else if (err.message?.includes('AADSTS50194') || err.message?.includes('multi-tenant')) {
        errorMessage = 'Azure tenant configuration error. Please check your Azure app registration.'
      } else if (err.message) {
        errorMessage = err.message
      }
      
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  return (
    <button
      onClick={handleMicrosoftLogin}
      disabled={loading}
      className="oauth-button azure-button"
      type="button"
    >
      {loading ? (
        <span>Signing in...</span>
      ) : (
        <>
          <svg
            width="20"
            height="20"
            viewBox="0 0 23 23"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M11.5 0L22.5 6.5V16.5L11.5 23L0.5 16.5V6.5L11.5 0Z"
              fill="#0078D4"
            />
            <path
              d="M11.5 0L22.5 6.5V11.5L11.5 18L0.5 11.5V6.5L11.5 0Z"
              fill="#0078D4"
            />
            <path
              d="M11.5 12L22.5 5.5V11.5L11.5 18L0.5 11.5V5.5L11.5 12Z"
              fill="#40A9FF"
            />
          </svg>
          <span>Sign in with Microsoft</span>
        </>
      )}
    </button>
  )
}

export default MicrosoftLogin