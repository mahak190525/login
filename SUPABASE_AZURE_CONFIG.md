# Supabase Azure Configuration Fix

## The Problem

Supabase's Azure OAuth implementation may not be sending PKCE parameters correctly, causing the `AADSTS9002325` error. This is a known issue with some Supabase configurations.

## Solution 1: Update Supabase Azure Configuration

### In Supabase Dashboard:

1. Go to **Authentication** → **Providers** → **Azure**
2. Configure these exact settings:
   - **Azure Enabled**: ON
   - **Azure Client ID**: `b8cc1688-3739-44d1-9f87-5040dc3d2071` (from your manifest)
   - **Azure Client Secret**: (from Azure Portal → Certificates & secrets)
   - **Azure Tenant URL**: `https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/`
     - ⚠️ **CRITICAL**: Must include the trailing slash `/`

### In Supabase URL Configuration:

1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `http://localhost:5173/auth/callback`
   - `http://localhost:3000/auth/callback` (if using port 3000)

## Solution 2: Force PKCE Parameters (Code Update)

Update your Microsoft login function to explicitly request PKCE:

```javascript
const handleMicrosoftLogin = async () => {
  try {
    setSsoLoading(true)
    
    const redirectUrl = `${window.location.origin}/auth/callback`
    
    const oauthOptions = {
      scopes: 'User.Read openid profile email',
      redirectTo: redirectUrl,
      queryParams: {
        prompt: 'select_account',
        response_mode: 'query', // Force query parameters
        code_challenge_method: 'S256', // Explicitly request PKCE
        domain_hint: '85707f27-830a-4b92-aa8c-3830bfb6c6f5' // Your tenant ID
      }
    }
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'azure',
      options: oauthOptions,
    })

    if (error) throw error
  } catch (err) {
    // Handle error
  }
}
```

## Solution 3: Verify Azure App Registration

### Check Platform Configuration:

1. Go to Azure Portal → App registrations → Your app
2. Go to **Authentication**
3. Ensure you have **both** platforms configured:

   **Web Platform:**
   - Redirect URI: `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`
   - Access tokens: ✓ (checked)
   - ID tokens: ✓ (checked)

   **Single-page application Platform:**
   - Redirect URI: `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`

### Verify Manifest Settings:

Ensure your manifest has:
```json
{
  "api": {
    "requestedAccessTokenVersion": 2
  },
  "web": {
    "redirectUris": [
      "https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback"
    ],
    "implicitGrantSettings": {
      "enableAccessTokenIssuance": false,
      "enableIdTokenIssuance": false
    }
  }
}
```

## Solution 4: Alternative - Use MSAL Directly

If Supabase continues to have issues, implement MSAL directly:

```javascript
import { PublicClientApplication } from '@azure/msal-browser'

const msalConfig = {
  auth: {
    clientId: 'b8cc1688-3739-44d1-9f87-5040dc3d2071',
    authority: 'https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/',
    redirectUri: window.location.origin + '/auth/callback'
  }
}

const msalInstance = new PublicClientApplication(msalConfig)

const handleMSALLogin = async () => {
  try {
    const response = await msalInstance.loginPopup({
      scopes: ['User.Read', 'openid', 'profile', 'email']
    })
    
    // Create Supabase session with the Azure token
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'azure',
      token: response.idToken,
      access_token: response.accessToken
    })
    
    if (error) throw error
  } catch (error) {
    console.error('MSAL login error:', error)
  }
}
```

## Debugging Steps

1. **Check Supabase Logs:**
   - Dashboard → Logs → Auth Logs
   - Look for detailed error messages

2. **Verify Network Requests:**
   - Open browser DevTools → Network tab
   - Look for the OAuth request to Azure
   - Check if `code_challenge` and `code_challenge_method` parameters are present

3. **Test with Different Browser:**
   - Try incognito mode
   - Clear all cookies and cache

## Priority Order

Try solutions in this order:
1. **Solution 1**: Update Supabase configuration (most likely fix)
2. **Solution 2**: Force PKCE parameters in code
3. **Solution 3**: Verify Azure app registration
4. **Solution 4**: Use MSAL directly (if Supabase continues to fail)

The issue is most likely that Supabase isn't configured with the correct Azure Tenant URL or the Azure app registration needs both Web and SPA platforms configured.