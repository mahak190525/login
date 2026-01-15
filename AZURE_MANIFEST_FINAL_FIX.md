# Azure Manifest - Final Fix Required

## Critical Issues Found

Your manifest is still missing the key settings that enable PKCE. Here are the **exact changes** needed:

### 1. ❌ Missing `requestedAccessTokenVersion: 2`

**Current (WRONG):**
```json
"api": {
    "requestedAccessTokenVersion": null,  // ❌ This is NULL
    ...
}
```

**Must be changed to:**
```json
"api": {
    "requestedAccessTokenVersion": 2,  // ✅ CRITICAL FIX
    ...
}
```

### 2. ❌ Missing Redirect URI in `web` section

**Current (WRONG):**
```json
"web": {
    "redirectUris": [],  // ❌ EMPTY ARRAY
    ...
}
```

**Must be changed to:**
```json
"web": {
    "redirectUris": [
        "https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback"
    ],
    ...
}
```

### 3. ❌ Implicit Grant Still Enabled (Should be disabled)

**Current (WRONG):**
```json
"implicitGrantSettings": {
    "enableAccessTokenIssuance": true,  // ❌ Should be false
    "enableIdTokenIssuance": true       // ❌ Should be false
}
```

**Must be changed to:**
```json
"implicitGrantSettings": {
    "enableAccessTokenIssuance": false,  // ✅ Disable implicit flow
    "enableIdTokenIssuance": false       // ✅ Force authorization code flow
}
```

### 4. ❌ Wrong Redirect URI in SPA section

**Current (WRONG):**
```json
"spa": {
    "redirectUris": [
        "http://localhost:5173/",  // ❌ Missing /auth/callback
        "https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback"
    ]
}
```

**Should be:**
```json
"spa": {
    "redirectUris": [
        "http://localhost:5173/auth/callback",  // ✅ Add /auth/callback
        "https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback"
    ]
}
```

## Step-by-Step Fix Instructions

1. **Go to Azure Portal** → **Azure Active Directory** → **App registrations**
2. **Select your app**: "Mechlin Client Portal"
3. **Click "Manifest"** in the left sidebar
4. **Make these 4 changes** in the JSON:
   - Set `api.requestedAccessTokenVersion` to `2`
   - Add Supabase callback to `web.redirectUris` array
   - Set both `implicitGrantSettings` to `false`
   - Fix the localhost redirect URI to include `/auth/callback`
5. **Click "Save"**

## Complete Fixed Manifest Section

Here's exactly what the key sections should look like:

```json
{
  "api": {
    "acceptMappedClaims": null,
    "knownClientApplications": [],
    "requestedAccessTokenVersion": 2,  // ✅ CHANGED FROM null TO 2
    "oauth2PermissionScopes": [],
    "preAuthorizedApplications": []
  },
  "web": {
    "homePageUrl": null,
    "logoutUrl": null,
    "redirectUris": [
      "https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback"  // ✅ ADDED
    ],
    "implicitGrantSettings": {
      "enableAccessTokenIssuance": false,  // ✅ CHANGED FROM true TO false
      "enableIdTokenIssuance": false       // ✅ CHANGED FROM true TO false
    },
    "redirectUriSettings": []
  },
  "spa": {
    "redirectUris": [
      "http://localhost:5173/auth/callback",  // ✅ FIXED - added /auth/callback
      "https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback"
    ]
  }
}
```

## Why These Changes Fix PKCE

- **`requestedAccessTokenVersion: 2`**: Enables OAuth 2.0 with PKCE support
- **Web redirect URI**: Supabase uses the "web" platform for server-side OAuth
- **Disable implicit grant**: Forces Azure to use authorization code flow (which supports PKCE)
- **Correct redirect URIs**: Ensures the OAuth flow can complete properly

## After Making Changes

1. **Save the manifest** in Azure Portal
2. **Wait 2-3 minutes** for Azure to propagate changes
3. **Clear browser cache/cookies**
4. **Try Microsoft login again**

The PKCE error should be resolved after these changes.

## Verification

After saving, you can verify the changes worked by:
1. Going to **Authentication** in your Azure app
2. You should see both **Web** and **Single-page application** platforms listed
3. Both should have the correct redirect URIs