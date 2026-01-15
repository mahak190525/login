# CRM Portal Demo

A modern CRM application built with React, Vite, and Supabase, featuring Azure SSO and Google SSO authentication.

## Features

- 🔐 **Authentication**: Azure SSO and Google SSO via Supabase Auth
- 🏗️ **Architecture**: Abstraction layer for easy backend replacement
- 🎨 **Modern UI**: Clean, responsive design
- 🔒 **Security**: Row Level Security (RLS) policies
- 📦 **Migrations**: Intelligently named migrations (1_title, 2_title, etc.)

## Setup

### 1. Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
VITE_SUPABASE_URL=https://cglsdgdrixtgpnemyjhh.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

**Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Supabase Authentication Providers

Before running the application, you need to configure Azure SSO and Google SSO in your Supabase dashboard:

1. Go to your Supabase Dashboard → Authentication → Providers
2. Enable **Azure** provider:
   - Configure your Azure AD app registration
   - Set the redirect URL to: `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`
3. Enable **Google** provider:
   - Configure your Google OAuth credentials
   - Set the redirect URL to: `https://cglsdgdrixtgpnemyjhh.supabase.co/auth/v1/callback`

### 4. Run Database Migrations

Apply the initial migration to set up the database schema:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or apply manually via Supabase Dashboard → SQL Editor
# Copy and paste the contents of supabase/migrations/1_initial_setup.sql
```

### 5. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Project Structure

```
src/
├── components/          # React components
│   ├── Login.jsx       # Login page with SSO buttons
│   ├── Dashboard.jsx   # Protected dashboard
│   └── AuthCallback.jsx # OAuth callback handler
├── contexts/           # React contexts
│   └── AuthContext.jsx # Authentication context
├── lib/               # Library configurations
│   └── supabase.js    # Supabase client setup
└── services/          # API abstraction layer
    ├── authService.js      # Auth service interface
    └── supabaseAuth.js     # Supabase implementation
```

## Architecture: Backend Abstraction Layer

The project uses an abstraction layer pattern to make backend replacement easy:

### Current Implementation
- **Interface**: `src/services/authService.js` - Defines the contract
- **Implementation**: `src/services/supabaseAuth.js` - Supabase-specific code

### To Replace Supabase with Another Backend

1. Create a new service file (e.g., `src/services/customAuth.js`)
2. Implement the `AuthService` interface methods
3. Update the import in `src/contexts/AuthContext.jsx`:
   ```jsx
   // Change from:
   import authService from '../services/supabaseAuth.js'
   // To:
   import authService from '../services/customAuth.js'
   ```

All API calls go through the service layer, so you only need to change the implementation, not the components.

## Migrations

Migrations are stored in `supabase/migrations/` and follow a naming convention:
- `1_initial_setup.sql`
- `2_add_customers_table.sql`
- `3_add_contacts_table.sql`
- etc.

This makes it easy to understand the migration order and purpose.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Authentication Flow

1. User clicks "Sign in with Azure" or "Sign in with Google"
2. User is redirected to the OAuth provider
3. After authentication, user is redirected to `/auth/callback`
4. The callback handler processes the session
5. User is redirected to `/dashboard` if successful

## Security

- Row Level Security (RLS) is enabled on all tables
- Users can only access their own data
- Environment variables are not committed to version control
- Supabase handles token refresh automatically

## License

MIT
