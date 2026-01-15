# Setup Instructions

## Step 1: Create .env File

Create a `.env` file in the root directory with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://cglsdgdrixtgpnemyjhh.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNnbHNkZ2RyaXh0Z3BuZW15amhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgzMDg5ODUsImV4cCI6MjA4Mzg4NDk4NX0.WgpoXJJr7OtyGDDcKxIO1jIcMJvQ9wpAC4D8W5Lr59s
```

## Step 2: Configure OAuth Providers in Supabase

### Azure SSO Setup

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Authentication → Providers
2. Enable **Azure** provider
3. Configure your Azure AD App Registration:
   - **Application (client) ID**: `cabdbfaf-b291-4927-b676-6d96f3c189c3`
   - **Directory (tenant) ID**: `85707f27-830a-4b92-aa8c-3830bfb6c6f5`
   - **Client secret value**: (from your Azure app registration)
   - **Azure Tenant URL**: `https://login.microsoftonline.com/85707f27-830a-4b92-aa8c-3830bfb6c6f5/`
4. Set redirect URL: `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`
5. **IMPORTANT**: Also add your app's redirect URL in Supabase Dashboard → Authentication → URL Configuration:
   - `http://localhost:5173/auth/callback` (for local development)
   - Your production URL if applicable

### Google SSO Setup

1. Go to [Supabase Dashboard](https://app.supabase.com) → Your Project → Authentication → Providers
2. Enable **Google** provider
3. Configure your Google OAuth credentials:
   - Client ID (for OAuth)
   - Client secret (for OAuth)
4. Set redirect URL: `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`

## Step 3: Apply Database Migration

1. Go to Supabase Dashboard → SQL Editor
2. Copy the contents of `supabase/migrations/1_initial_setup.sql`
3. Paste and run the SQL

Alternatively, if you have Supabase CLI installed:
```bash
supabase db push
```

## Step 4: Install Dependencies and Run

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

## Troubleshooting

### "Missing Supabase environment variables" error
- Make sure your `.env` file exists in the root directory
- Check that variable names start with `VITE_`
- Restart the dev server after creating/updating `.env`

### OAuth redirect not working
- Verify redirect URLs are correctly configured in Supabase
- Check that redirect URLs match exactly (including protocol and port for localhost)
- For local development, you may need to add `http://localhost:5173/auth/callback` to allowed redirect URLs
