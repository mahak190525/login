# Troubleshooting Azure SSO Login

## Error: AADSTS9002325 - PKCE Required

This error indicates that Azure AD requires PKCE (Proof Key for Code Exchange) for cross-origin authorization, but it's not being sent correctly.

### Solution Steps

#### 1. Verify Redirect URL in Supabase Dashboard

**CRITICAL:** The redirect URL must be added to Supabase's allowlist:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Navigate to **Authentication** → **URL Configuration**
3. Under **Redirect URLs**, add:
   - `http://localhost:5173/auth/callback` (for local development)
   - `https://yourdomain.com/auth/callback` (for production)
4. Click **Save**

#### 2. Verify Azure App Registration

In your Azure Portal:

1. Go to **Azure Active Directory** → **App registrations**
2. Select your app
3. Go to **Authentication**
4. Under **Redirect URIs**, ensure you have:
   - `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`
5. Under **Platform configurations**, make sure:
   - **Web** platform is selected
   - The redirect URI is listed

#### 3. Check Azure App Manifest

Azure AD may require specific settings in the app manifest:

1. In Azure Portal, go to your app registration
2. Go to **Manifest**
3. Ensure the manifest includes:
   ```json
   {
     "oauth2AllowImplicitFlow": false,
     "oauth2AllowIdTokenImplicitFlow": false
   }
   ```
4. Save the manifest

#### 4. Verify Supabase Azure Provider Configuration

In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Click on **Azure**
3. Verify:
   - Azure is **Enabled**
   - **Client ID** is correct
   - **Client Secret** is correct (not expired)
   - **Azure Tenant URL** is set (if using a specific tenant)

#### 5. Clear Browser Cache and Try Again

Sometimes cached OAuth state can cause issues:

1. Clear browser cache and cookies
2. Try logging in again in an incognito/private window

### Additional Notes

- Supabase should automatically use PKCE for browser-based OAuth flows
- The error suggests Azure AD is not receiving the PKCE parameters
- This is typically a configuration issue rather than a code issue
- Make sure both Supabase and Azure configurations match exactly

### If Still Not Working

1. Check Supabase logs: **Dashboard** → **Logs** → **Auth Logs**
2. Check browser console for additional errors
3. Verify the redirect URL is exactly: `http://localhost:5173/auth/callback` (no trailing slash)
4. Try using HTTPS for localhost (some OAuth providers require HTTPS)
