# Quick Start: MSAL Microsoft Login

## What Changed?

We've switched from Supabase's built-in Azure OAuth (which has PKCE issues) to **MSAL + Supabase hybrid authentication**.

**Key Point:** Your users **WILL** be stored in Supabase's `auth.users` table. This is NOT pure MSAL - we exchange the Microsoft token with Supabase to create a proper Supabase session.

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

This will install `@azure/msal-browser` which is now in package.json.

### 2. Verify Azure Configuration

Your MSAL config is already set up in `src/lib/msalConfig.js`:

```javascript
clientId: 'b8cc1688-3739-44d1-9f87-5040dc3d2071'
authority: 'https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/'
```

### 3. Configure Azure Portal

**CRITICAL:** Your Azure app must be configured as a **Single-Page Application (SPA)**:

1. Go to Azure Portal → App registrations → "Mechlin Client Portal"
2. Click **Authentication** in left menu
3. Under **Platform configurations**, ensure you have **Single-page application**
4. Add redirect URI: `http://localhost:5173/auth/callback`
5. **DO NOT** use "Web" platform - use "Single-page application"

### 4. Verify Supabase Configuration

In Supabase Dashboard → Authentication → Providers → Azure:

- ✅ **Enable Azure provider:** ON (required for token exchange)
- ✅ **Client ID:** `b8cc1688-3739-44d1-9f87-5040dc3d2071`
- ✅ **Client Secret:** Your Azure client secret
- ✅ **Azure Tenant URL:** `https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5`

### 5. Start Development Server

```bash
npm run dev
```

### 6. Test Microsoft Login

1. Open `http://localhost:5173`
2. Click "Sign in with Microsoft"
3. A popup will open with Microsoft login
4. Select your account
5. Popup closes automatically
6. You're redirected to dashboard

## How to Verify It's Working

### Check Browser Console

You should see these logs:

```
[MSAL] Initialized successfully
[MSALLogin] MSAL initialized and ready
[MSALLogin] Starting popup login...
[MSALLogin] Microsoft login successful
[MSALLogin] User: your-email@domain.com
[MSALLogin] Exchanging token with Supabase...
[MSALLogin] Supabase session created successfully!
[MSALLogin] User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[MSALLogin] User email: your-email@domain.com
```

### Check Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. You should see your user with:
   - Email from Microsoft
   - Provider: "azure"
   - Created timestamp

### Check Network Tab

1. Open DevTools → Network tab
2. During login, you should see:
   - Call to `login.microsoftonline.com` (MSAL)
   - Call to Supabase API with `signInWithIdToken`
   - No PKCE errors!

## Troubleshooting

### Popup Blocked

**Symptom:** Nothing happens when clicking "Sign in with Microsoft"

**Solution:**
- Check browser console for "popup blocked" message
- Allow popups for `localhost:5173`
- Try again

### "MSAL not ready yet"

**Symptom:** Error message appears immediately

**Solution:**
- Wait 1-2 seconds after page load
- MSAL is still initializing
- Try again

### "Failed to create Supabase session"

**Symptom:** Microsoft login succeeds but Supabase session fails

**Solution:**
1. Verify Azure provider is **enabled** in Supabase Dashboard
2. Check Client ID and Secret are correct
3. Ensure Tenant URL is set
4. Check Supabase logs for detailed error

### User Not in Supabase

**Symptom:** Login succeeds but user not in auth.users table

**Solution:**
- Check browser console for `signInWithIdToken` errors
- Verify Azure provider is enabled in Supabase
- Check Supabase logs in Dashboard → Logs

## What About Google Login?

Google login still uses Supabase's built-in OAuth (it works fine, no PKCE issues). Only Microsoft login uses MSAL.

## Files Changed

- ✅ `src/lib/msalConfig.js` - MSAL configuration
- ✅ `src/components/MSALLogin.jsx` - MSAL login component
- ✅ `src/components/Login.jsx` - Uses MSALLogin for Microsoft
- ✅ `package.json` - Added @azure/msal-browser

## Next Steps

1. Test Microsoft login locally
2. Verify user appears in Supabase
3. Test Google login (should still work)
4. When ready for production:
   - Add production redirect URI to Azure Portal
   - Add production redirect URI to Supabase Dashboard
   - Update environment variables

## Need Help?

See `MSAL_SOLUTION.md` for detailed explanation of how this works.
