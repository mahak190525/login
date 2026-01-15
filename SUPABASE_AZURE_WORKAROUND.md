# Supabase Azure PKCE Issue - Workarounds

## The Problem

Even after fixing the Azure manifest, the PKCE error persists. This indicates that **Supabase's backend is not sending PKCE parameters** to Azure AD correctly. This is a known issue with some Supabase configurations.

## Solution 1: Contact Supabase Support (Recommended)

This appears to be a Supabase backend issue. Contact Supabase support with:

- **Project Reference**: `cglsdgdrixtgpnemyjhh`
- **Error Code**: `AADSTS9002325`
- **Azure Tenant ID**: `85707f27-830a-4b92-aa8c-3830bfb6c6f5`
- **Azure Client ID**: `b8cc1688-3739-44d1-9f87-5040dc3d2071`
- **Issue**: Supabase not sending PKCE parameters to Azure AD

## Solution 2: Implement MSAL Directly (Immediate Fix)

Since Supabase's Azure OAuth has issues, implement Microsoft login using MSAL directly:

### Step 1: Install MSAL

```bash
npm install @azure/msal-browser
```

### Step 2: Create MSAL Configuration

Create `src/lib/msalConfig.js`:

```javascript
import { PublicClientApplication, LogLevel } from '@azure/msal-browser'

export const msalConfig = {
  auth: {
    clientId: 'b8cc1688-3739-44d1-9f87-5040dc3d2071',
    authority: 'https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/',
    redirectUri: window.location.origin + '/auth/callback',
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return
        switch (level) {
          case LogLevel.Error:
            console.error(message)
            return
          case LogLevel.Info:
            console.info(message)
            return
          case LogLevel.Verbose:
            console.debug(message)
            return
          case LogLevel.Warning:
            console.warn(message)
            return
        }
      },
    },
  },
}

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
}

export const msalInstance = new PublicClientApplication(msalConfig)
```

### Step 3: Create MSAL Login Component

Create `src/components/MSALLogin.jsx`:

```javascript
import { useState } from 'react'
import { msalInstance, loginRequest } from '../lib/msalConfig.js'
import { supabase } from '../lib/supabase.js'

const MSALLogin = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false)

  const handleMSALLogin = async () => {
    try {
      setLoading(true)
      
      // Step 1: Login with MSAL (this handles PKCE correctly)
      const response = await msalInstance.loginPopup(loginRequest)
      
      console.log('MSAL login successful:', response)
      
      // Step 2: Create Supabase session using the Azure token
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'azure',
        token: response.idToken,
        access_token: response.accessToken,
      })
      
      if (error) {
        console.error('Supabase session creation error:', error)
        throw error
      }
      
      console.log('Supabase session created:', data)
      
      if (onSuccess) {
        onSuccess(data.user)
      }
      
    } catch (error) {
      setLoading(false)
      console.error('MSAL login error:', error)
      
      let errorMessage = 'Microsoft login failed'
      if (error.errorCode === 'user_cancelled') {
        errorMessage = 'Login was cancelled'
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
```

### Step 4: Update Your Login Component

Replace your Microsoft login button with the MSAL component:

```javascript
import MSALLogin from './MSALLogin.jsx'

// In your login component:
<MSALLogin
  onSuccess={(user) => {
    console.log('Login successful:', user)
    // Handle successful login
  }}
  onError={(error) => {
    console.error('Login failed:', error)
    // Handle login error
  }}
/>
```

### Step 5: Initialize MSAL

Add this to your `src/main.jsx` or app initialization:

```javascript
import { msalInstance } from './lib/msalConfig.js'

// Initialize MSAL
msalInstance.initialize().then(() => {
  console.log('MSAL initialized')
}).catch((error) => {
  console.error('MSAL initialization failed:', error)
})
```

## Solution 3: Alternative Supabase Configuration

Try this alternative Supabase configuration in your existing code:

```javascript
const handleMicrosoftLogin = async () => {
  try {
    setSsoLoading(true)
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: {
        scopes: 'openid profile email User.Read',
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
          response_type: 'code',
          response_mode: 'query',
          code_challenge_method: 'S256',
          domain_hint: '85707f27-830a-4b92-aa8c-3830bfb6c6f5'
        }
      },
    })

    if (error) throw error
  } catch (err) {
    setSsoLoading(false)
    // Handle error
  }
}
```

## Recommendation

**Use Solution 2 (MSAL Direct)** for immediate results. MSAL handles PKCE correctly and will work reliably. You can always switch back to Supabase's built-in Azure OAuth once they fix the PKCE issue.

The MSAL approach:
- ✅ Handles PKCE correctly
- ✅ Works with your existing Azure configuration
- ✅ Creates a proper Supabase session
- ✅ Maintains the same user experience

## Why This Happens

Supabase's Azure OAuth implementation may not be sending the required PKCE parameters (`code_challenge` and `code_challenge_method`) to Azure AD, even though PKCE is enabled on the client side. This is a backend issue that requires Supabase to fix their Azure OAuth integration.