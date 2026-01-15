# Azure Manifest Fix Instructions

## Critical Changes Needed

Your Azure app manifest is missing the key setting for PKCE support. Here's what to change:

### 1. Add `requestedAccessTokenVersion: 2`

In the `api` section, change:
```json
"api": {
    "requestedAccessTokenVersion": null,  // ❌ WRONG
    ...
}
```

To:
```json
"api": {
    "requestedAccessTokenVersion": 2,  // ✅ CORRECT
    ...
}
```

### 2. Add Redirect URI to `web` Section

Your redirect URI is only in the `spa` section. It also needs to be in the `web` section:

Change:
```json
"web": {
    "redirectUris": [],  // ❌ EMPTY
    ...
}
```

To:
```json
"web": {
    "redirectUris": [
        "https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback"
    ],
    ...
}
```

### 3. Disable Implicit Grant (Recommended)

For better security with PKCE, disable implicit grant:

Change:
```json
"implicitGrantSettings": {
    "enableAccessTokenIssuance": true,  // ❌
    "enableIdTokenIssuance": true        // ❌
}
```

To:
```json
"implicitGrantSettings": {
    "enableAccessTokenIssuance": false,  // ✅
    "enableIdTokenIssuance": false       // ✅
}
```

## Step-by-Step Instructions

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Select your app: **Mechlin Client Portal** (App ID: `b8cc1688-3739-44d1-9f87-5040dc3d2071`)
4. Click on **Manifest** in the left sidebar
5. Click **Edit** (or just edit the JSON directly)
6. Make the three changes listed above
7. Click **Save**

## Complete Fixed Manifest

I've created `AZURE_MANIFEST_FIX.json` with all the correct settings. You can:
- Copy the entire file and paste it into the Azure manifest editor, OR
- Make the three specific changes listed above

## After Saving

1. Wait 1-2 minutes for Azure to propagate the changes
2. Clear your browser cache/cookies
3. Try logging in with Azure SSO again
4. The PKCE error should be resolved!

## Why These Changes Matter

- **`requestedAccessTokenVersion: 2`**: Enables OAuth 2.0 with PKCE support (required for cross-origin flows)
- **Redirect URI in `web` section**: Supabase uses the web platform for OAuth, not just SPA
- **Disable implicit grant**: Forces use of authorization code flow with PKCE (more secure)

## Verification

After making changes, verify:
1. The manifest saved successfully
2. In **Authentication** → **Platform configurations**, you should see:
   - **Web** platform with the redirect URI
   - **Single-page application** platform with redirect URIs
