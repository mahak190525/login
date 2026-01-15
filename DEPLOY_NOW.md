# Deploy the Fixed Edge Function

## What Was Fixed

The error `supabaseAdmin.auth.admin.getUserByEmail is not a function` occurred because that method doesn't exist in the Supabase Admin API.

### Fixed Approach

Instead of checking if user exists first, we now:
1. **Try to create the user** with `createUser()`
2. **If user already exists**, the error message will indicate that
3. **Generate a session** using `generateLink()` (works for both new and existing users)
4. **Return session tokens** to the frontend

This approach is simpler and uses only the methods that actually exist in the Supabase Admin API.

## Deploy Command

Run this command from your project root:

```bash
supabase functions deploy exchange-azure-token
```

If you haven't linked your project yet:

```bash
# Link project first
supabase link --project-ref cglsdgdrixtgpnemyjhh

# Then deploy
supabase functions deploy exchange-azure-token
```

## What the Function Does Now

1. ✅ Receives Microsoft ID token from frontend
2. ✅ Decodes token to extract user info (email, name, etc.)
3. ✅ Attempts to create user in Supabase
   - If user doesn't exist → creates them
   - If user exists → continues (doesn't fail)
4. ✅ Generates a magic link session (works for both cases)
5. ✅ Extracts access_token and refresh_token from the magic link
6. ✅ Returns tokens to frontend
7. ✅ Frontend sets the session

## Test After Deployment

1. **Deploy the function:**
   ```bash
   supabase functions deploy exchange-azure-token
   ```

2. **Start your dev server:**
   ```bash
   npm run dev
   ```

3. **Test Microsoft login:**
   - Click "Sign in with Microsoft"
   - Complete authentication
   - Check browser console for success messages

4. **Verify in Supabase:**
   - Go to Supabase Dashboard → Authentication → Users
   - You should see your user with email from Microsoft

## Expected Console Output

```
[MSALLogin] Starting popup login...
[MSALLogin] Microsoft login successful
[MSALLogin] User: your-email@domain.com
[MSALLogin] Exchanging token with Supabase Edge Function...
[MSALLogin] Token exchange successful
[MSALLogin] Supabase session created successfully!
[MSALLogin] User ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[MSALLogin] User email: your-email@domain.com
```

## Troubleshooting

### Function Deploy Fails

**Error:** `supabase: command not found`

**Solution:**
```bash
npm install -g supabase
```

### Project Not Linked

**Error:** `No project linked`

**Solution:**
```bash
supabase link --project-ref cglsdgdrixtgpnemyjhh
```

### Function Returns Error

**Check logs:**
```bash
supabase functions logs exchange-azure-token
```

Or check in Supabase Dashboard → Edge Functions → exchange-azure-token → Logs

## Summary

The Edge Function is now fixed to use only the correct Supabase Admin API methods:
- ✅ `auth.admin.createUser()` - to create users
- ✅ `auth.admin.generateLink()` - to generate sessions
- ❌ Removed `getUserByEmail()` - doesn't exist

Deploy it and test Microsoft login - it should work now!
