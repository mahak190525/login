# Deploy Azure Token Exchange Edge Function

## Why This is Needed

Supabase's `signInWithIdToken()` has nonce validation issues when using MSAL-generated tokens. The nonce in the MSAL token doesn't match what Supabase expects, causing the error:

```
Passed nonce and nonce in id_token should either both exist or not
```

**Solution:** Use a Supabase Edge Function to handle the token exchange server-side, bypassing the nonce validation.

## What the Edge Function Does

1. Receives the Microsoft ID token from the frontend
2. Decodes the token to extract user information (email, name, etc.)
3. Uses Supabase Admin API to:
   - Check if user exists by email
   - Create new user if doesn't exist
   - Update user metadata if exists
4. Generates a Supabase session (access_token + refresh_token)
5. Returns the session tokens to the frontend
6. Frontend sets the session in Supabase client

**Result:** User is in `auth.users` table with a valid Supabase session!

## Deployment Steps

### 1. Install Supabase CLI

```bash
npm install -g supabase
```

### 2. Login to Supabase

```bash
supabase login
```

This will open a browser window to authenticate.

### 3. Link Your Project

```bash
supabase link --project-ref cglsdgdrixtgpnemyjhh
```

When prompted, enter your database password.

### 4. Deploy the Edge Function

```bash
supabase functions deploy exchange-azure-token
```

### 5. Verify Deployment

Go to Supabase Dashboard → Edge Functions → You should see `exchange-azure-token` listed.

### 6. Test the Function

```bash
curl -i --location --request POST \
  'https://cglsdgdrixtgpnemyjhh.supabase.co/functions/v1/exchange-azure-token' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"test": true}'
```

You should get a response (even if it's an error about missing idToken - that's fine, it means the function is deployed).

## How It Works in Your App

### Before (with nonce error):

```
MSAL login → Get token → signInWithIdToken() → ❌ Nonce mismatch error
```

### After (with Edge Function):

```
MSAL login → Get token → Edge Function → Creates user in auth.users → Returns session → ✅ Success
```

## Frontend Flow

1. User clicks "Sign in with Microsoft"
2. MSAL popup opens, user authenticates
3. MSAL returns ID token + access token
4. Frontend calls Edge Function with tokens
5. Edge Function:
   - Decodes token
   - Creates/updates user in Supabase
   - Generates session tokens
6. Frontend receives session tokens
7. Frontend calls `supabase.auth.setSession()`
8. User is logged in!

## Security Notes

- ✅ Edge Function runs server-side (secure)
- ✅ Uses Supabase Service Role Key (not exposed to frontend)
- ✅ Validates token format before processing
- ✅ Auto-confirms email (since Microsoft already verified it)
- ✅ Stores provider info in user_metadata

## Troubleshooting

### Function Not Found (404)

**Solution:** Make sure you deployed the function:
```bash
supabase functions deploy exchange-azure-token
```

### Unauthorized (401)

**Solution:** Check that you're passing the correct anon key in the Authorization header.

### "No email in token"

**Solution:** Ensure your Azure app has the `email` scope in API permissions.

### Function Times Out

**Solution:** Check Supabase Dashboard → Edge Functions → Logs for detailed error messages.

## Alternative: Local Testing

You can test the Edge Function locally before deploying:

```bash
# Start Supabase locally
supabase start

# Serve the function locally
supabase functions serve exchange-azure-token

# Test it
curl -i --location --request POST \
  'http://localhost:54321/functions/v1/exchange-azure-token' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"idToken": "your-test-token", "provider": "azure"}'
```

## Next Steps

1. Deploy the Edge Function (steps above)
2. Test Microsoft login in your app
3. Check Supabase Dashboard → Authentication → Users
4. User should appear with provider: "azure"

The nonce error should be completely gone!
