# Azure SSO Configuration Guide

Based on your MSAL configuration, here are the exact steps to configure Azure SSO in Supabase:

## Supabase Dashboard Configuration

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → **Authentication** → **Providers**

2. Click on **Azure** to expand the configuration

3. Fill in the following details:
   - **Azure Enabled**: Toggle ON
   - **Azure Client ID**: `cabdbfaf-b291-4927-b676-6d96f3c189c3`
   - **Azure Client Secret**: (Get this from Azure Portal → Your App → Certificates & secrets)
   - **Azure Tenant URL**: `https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/`
     - ⚠️ **IMPORTANT**: Include the trailing slash `/` at the end

4. Click **Save**

## Redirect URL Configuration

### In Supabase:
1. Go to **Authentication** → **URL Configuration**
2. Under **Redirect URLs**, add:
   - `http://localhost:5173/auth/callback` (for local development)
   - Your production URL if applicable (e.g., `https://mechlinhrms.netlify.app/auth/callback`)

### In Azure Portal:
1. Go to [Azure Portal](https://portal.azure.com) → **Azure Active Directory** → **App registrations**
2. Select your app (Client ID: `cabdbfaf-b291-4927-b676-6d96f3c189c3`)
3. Go to **Authentication**
4. Under **Redirect URIs**, ensure you have:
   - `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`
5. Click **Save**

## Verify Azure App Registration

1. In Azure Portal, go to your app registration
2. Check **API permissions**:
   - Should have `User.Read` permission (Microsoft Graph)
   - Status should be "Granted for [your organization]"

3. Check **Certificates & secrets**:
   - Ensure you have a valid client secret
   - Copy the **Value** (not the Secret ID) to Supabase

4. **CRITICAL - Check Manifest for PKCE Support**:
   - Go to **Manifest** in Azure Portal
   - Look for `accessTokenAcceptedVersion` in the JSON
   - **Must be set to `2`** (not `null` or `1`)
   - If it's not 2, change it to 2 and save:
     ```json
     {
       "accessTokenAcceptedVersion": 2
     }
     ```
   - This enables OAuth 2.0 with PKCE support

## Testing

After configuration:
1. Clear browser cache/cookies
2. Try logging in with Azure SSO
3. You should be redirected to Microsoft login page
4. After successful login, you'll be redirected back to your app

## Troubleshooting

If you still get PKCE errors:
1. Verify the **Azure Tenant URL** in Supabase has the trailing slash: `https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/`
2. Check that the redirect URL is added in both Supabase and Azure
3. Verify the client secret hasn't expired
4. Check Supabase logs: **Dashboard** → **Logs** → **Auth Logs**
