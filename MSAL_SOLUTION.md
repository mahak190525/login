# MSAL + Supabase Hybrid Authentication Solution

## The Problem

Supabase's built-in Azure OAuth provider has issues with PKCE (Proof Key for Code Exchange), causing the error:
```
AADSTS9002325: Proof Key for Code Exchange is required for cross-origin authorization code redemption
```

Despite configuring redirect URIs, manifests, and PKCE settings, Supabase's OAuth flow doesn't properly send PKCE parameters to Azure AD.

## The Solution

We use **MSAL (Microsoft Authentication Library)** to handle the Microsoft login, then **exchange the token with Supabase** to create a session. This gives us:

✅ **Users in Supabase `auth.users` table** - Full Supabase Auth integration  
✅ **Proper PKCE handling** - MSAL handles this natively  
✅ **Supabase session management** - Use all Supabase Auth features  
✅ **Maintains abstraction layer** - Backend can still be swapped  
✅ **Google SSO works as before** - No changes needed  

## How It Works

### Flow Diagram

```
User clicks "Sign in with Microsoft"
         ↓
MSAL opens popup → User authenticates with Microsoft
         ↓
MSAL returns ID token + Access token
         ↓
Call supabase.auth.signInWithIdToken()
         ↓
Supabase creates user in auth.users table
         ↓
User is logged in with full Supabase session
```

### Key Components

#### 1. MSAL Configuration (`src/lib/msalConfig.js`)

```javascript
import { PublicClientApplication } from '@azure/msal-browser'

export const msalConfig = {
  auth: {
    clientId: 'YOUR_AZURE_CLIENT_ID',
    authority: 'https://login.microsoftonline.com/YOUR_TENANT_ID/',
    redirectUri: window.location.origin + '/auth/callback',
  },
  cache: {
    cacheLocation: 'sessionStorage',
  }
}

export const loginRequest = {
  scopes: ['User.Read', 'openid', 'profile', 'email'],
  prompt: 'select_account',
}

export const msalInstance = new PublicClientApplication(msalConfig)
```

#### 2. MSAL Login Component (`src/components/MSALLogin.jsx`)

This component:
1. Initializes MSAL on mount
2. Opens Microsoft login popup
3. Gets ID token from Microsoft
4. Exchanges token with Supabase using `signInWithIdToken()`
5. Creates user in Supabase auth.users table

#### 3. Login Page (`src/components/Login.jsx`)

Uses `MSALLogin` component for Microsoft, and regular Supabase OAuth for Google:

```javascript
// Microsoft login - uses MSAL
<MSALLogin 
  onSuccess={handleMSALSuccess} 
  onError={handleMSALError}
/>

// Google login - uses Supabase OAuth (works fine)
<button onClick={() => handleOAuthSignIn('google')}>
  Sign in with Google
</button>
```

## Azure Portal Configuration

### Required Settings in Azure App Registration

1. **Platform Configuration:**
   - Type: Single-page application (SPA)
   - Redirect URI: `http://localhost:5173/auth/callback` (for dev)
   - Redirect URI: `https://yourdomain.com/auth/callback` (for prod)

2. **Manifest Settings:**
   ```json
   {
     "requestedAccessTokenVersion": 2,
     "spa": {
       "redirectUris": [
         "http://localhost:5173/auth/callback",
         "https://yourdomain.com/auth/callback"
       ]
     },
     "web": {
       "redirectUris": [],
       "implicitGrantSettings": {
         "enableAccessTokenIssuance": false,
         "enableIdTokenIssuance": false
       }
     }
   }
   ```

3. **API Permissions:**
   - Microsoft Graph → User.Read (Delegated)
   - Microsoft Graph → openid (Delegated)
   - Microsoft Graph → profile (Delegated)
   - Microsoft Graph → email (Delegated)

## Supabase Configuration

### Azure Provider Settings

In Supabase Dashboard → Authentication → Providers → Azure:

1. **Enable Azure provider:** ON
2. **Client ID:** Your Azure App Client ID
3. **Client Secret:** Your Azure App Client Secret
4. **Azure Tenant URL:** `https://login.microsoftonline.com/YOUR_TENANT_ID`

**Important:** Even though we're using MSAL for login, the Azure provider must be enabled in Supabase for `signInWithIdToken()` to work.

### Redirect URLs

Add these to Supabase Dashboard → Authentication → URL Configuration:

- `http://localhost:5173/auth/callback` (development)
- `https://yourdomain.com/auth/callback` (production)

## Testing the Solution

### 1. Install Dependencies

```bash
npm install @azure/msal-browser
```

### 2. Start Development Server

```bash
npm run dev
```

### 3. Test Microsoft Login

1. Click "Sign in with Microsoft"
2. Popup opens with Microsoft login
3. Select account and authenticate
4. Popup closes automatically
5. You're redirected to dashboard

### 4. Verify User in Supabase

Check Supabase Dashboard → Authentication → Users:
- User should appear with Microsoft email
- Provider should show "azure"
- User metadata should contain Microsoft profile info

## Troubleshooting

### Popup Blocked

**Error:** Login popup doesn't open

**Solution:** 
- Allow popups for your site
- Check browser console for popup blocker warnings

### MSAL Initialization Error

**Error:** "MSAL not ready yet"

**Solution:**
- Wait a moment and try again
- Check browser console for MSAL errors
- Verify Azure Client ID and Tenant ID are correct

### Supabase Token Exchange Error

**Error:** "Failed to create Supabase session"

**Solution:**
1. Ensure Azure provider is enabled in Supabase Dashboard
2. Verify Client ID and Secret are correct
3. Check that Azure Tenant URL is set correctly
4. Ensure API permissions are granted in Azure Portal

### User Not Appearing in Supabase

**Error:** Login succeeds but user not in auth.users

**Solution:**
- Check Supabase logs for errors
- Verify `signInWithIdToken()` is being called
- Ensure Azure provider is properly configured

## Advantages Over Pure MSAL

If you used MSAL alone without Supabase integration:

❌ No automatic user management  
❌ No session handling  
❌ No RLS (Row Level Security)  
❌ Manual token refresh  
❌ Custom backend endpoints needed  

With our hybrid approach:

✅ Users automatically in auth.users  
✅ Supabase handles sessions  
✅ RLS works out of the box  
✅ Automatic token refresh  
✅ No custom backend needed  

## Maintaining Abstraction Layer

The abstraction layer is maintained because:

1. **Login.jsx** doesn't know about Supabase internals
2. **MSALLogin.jsx** is a self-contained component
3. **AuthContext** still provides the same interface
4. To switch backends, you only need to:
   - Replace `MSALLogin` component implementation
   - Update `AuthContext` to use new backend
   - Keep the same props/callbacks

## Future Considerations

### If Supabase Fixes Azure OAuth

When/if Supabase fixes their Azure OAuth PKCE issues:

1. Remove MSAL dependency
2. Replace `MSALLogin` with standard OAuth button
3. No changes needed to AuthContext or other components

### If You Need to Switch Backends

1. Create new auth service implementation
2. Update `MSALLogin` to exchange token with new backend
3. Update `AuthContext` to use new service
4. Keep the same component interfaces

## Summary

This solution gives you the best of both worlds:
- **MSAL's reliable Microsoft authentication** with proper PKCE
- **Supabase's powerful auth system** with automatic user management

Users are properly stored in Supabase, sessions work correctly, and you maintain full access to Supabase Auth features like RLS, email verification, and more.
