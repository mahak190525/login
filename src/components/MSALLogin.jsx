import { useState, useEffect } from 'react'
import { msalInstance, loginRequest } from '../lib/msalConfig.js'
import { supabase } from '../lib/supabase.js'

const MSALLogin = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)
  const [msalReady, setMsalReady] = useState(false)

  useEffect(() => {
    // Ensure MSAL is initialized before allowing login
    const initMSAL = async () => {
      try {
        await msalInstance.initialize()
        setMsalReady(true)
        console.log('[MSALLogin] MSAL initialized and ready')
      } catch (error) {
        console.error('[MSALLogin] MSAL initialization error:', error)
        if (onError) {
          onError('Failed to initialize Microsoft authentication')
        }
      }
    }
    initMSAL()
  }, [onError])

  const handleMSALLogin = async () => {
    if (!msalReady) {
      console.error('[MSALLogin] MSAL not ready yet')
      if (onError) {
        onError('Microsoft authentication is still initializing. Please try again.')
      }
      return
    }

    try {
      setLoading(true)
      
      console.log('[MSALLogin] Starting popup login...')
      
      // Step 1: Login with MSAL (this handles PKCE correctly)
      const response = await msalInstance.loginPopup(loginRequest)
      
      console.log('[MSALLogin] Microsoft login successful')
      console.log('[MSALLogin] User:', response.account?.username)
      
      // Step 2: Exchange Microsoft token for Supabase session
      // Using Edge Function to bypass nonce validation issues
      console.log('[MSALLogin] Exchanging token with Supabase Edge Function...')
      
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      
      // Call our custom Edge Function to handle token exchange
      const exchangeResponse = await fetch(`${supabaseUrl}/functions/v1/exchange-azure-token`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseAnonKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idToken: response.idToken,
          accessToken: response.accessToken,
          provider: 'azure',
        }),
      })
      
      if (!exchangeResponse.ok) {
        const errorData = await exchangeResponse.json()
        console.error('[MSALLogin] Token exchange failed:', errorData)
        throw new Error(errorData.error || 'Token exchange failed')
      }
      
      const sessionData = await exchangeResponse.json()
      console.log('[MSALLogin] Token exchange successful')
      
      // Set the session in Supabase client
      const { data, error } = await supabase.auth.setSession({
        access_token: sessionData.access_token,
        refresh_token: sessionData.refresh_token,
      })
      
      if (error) {
        console.error('[MSALLogin] Supabase token exchange error:', error)
        throw error
      }
      
      console.log('[MSALLogin] Supabase session created successfully!')
      console.log('[MSALLogin] User ID:', data.user?.id)
      console.log('[MSALLogin] User email:', data.user?.email)
      
      // Success! User is now in Supabase auth.users table
      if (onSuccess) {
        onSuccess(data.user)
      }
      
    } catch (error) {
      setLoading(false)
      console.error('[MSALLogin] Error:', error)
      
      let errorMessage = 'Microsoft login failed'
      
      // Handle specific MSAL errors
      if (error.errorCode === 'user_cancelled' || error.errorCode === 'popup_window_error') {
        errorMessage = 'Login was cancelled or popup was blocked. Please allow popups for this site.'
      } else if (error.errorCode === 'interaction_in_progress') {
        errorMessage = 'Another login is already in progress. Please wait.'
      } else if (error.message?.includes('signInWithIdToken')) {
        errorMessage = 'Failed to create Supabase session. Please ensure Azure provider is enabled in Supabase Dashboard.'
      } else if (error.message) {
        errorMessage = error.message
      }
      
      if (onError) {
        onError(errorMessage)
      }
    }
  }

  return (
    <button
      onClick={handleMSALLogin}
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

export default MSALLogin