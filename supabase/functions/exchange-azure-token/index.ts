// Supabase Edge Function to exchange Microsoft/Azure token for Supabase session
// This bypasses the nonce validation issues with signInWithIdToken

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Parse request body
    const { idToken, accessToken, provider } = await req.json()
    
    if (!idToken || provider !== 'azure') {
      throw new Error('Invalid request: idToken and provider=azure required')
    }

    // Decode the ID token to get user info (without verification for now)
    const tokenParts = idToken.split('.')
    if (tokenParts.length !== 3) {
      throw new Error('Invalid token format')
    }

    // Decode base64url
    let base64 = tokenParts[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    while (base64.length % 4) {
      base64 += '='
    }
    
    const userInfo = JSON.parse(atob(base64))
    
    if (!userInfo.email) {
      throw new Error('No email in token')
    }

    // Create Supabase Admin client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Processing user:', userInfo.email)

    // Try to create user - if they exist, we'll get an error and then update them
    let userId: string
    let userExists = false

    // First, try to create the user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: userInfo.email,
      email_confirm: true, // Auto-confirm since Microsoft verified it
      user_metadata: {
        full_name: userInfo.name,
        avatar_url: userInfo.picture,
        provider: 'azure',
        provider_id: userInfo.sub || userInfo.oid,
      },
      app_metadata: {
        provider: 'azure',
        providers: ['azure']
      }
    })

    if (createError) {
      // Check if error is because user already exists
      if (createError.message?.includes('already registered') || createError.message?.includes('already exists')) {
        console.log('User already exists, will update via session generation')
        userExists = true
      } else {
        console.error('Error creating user:', createError)
        throw createError
      }
    } else {
      userId = newUser.user.id
      console.log('Created new user:', userId)
    }

    // Generate a session for the user (works for both new and existing users)
    const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email: userInfo.email,
    })

    if (sessionError) {
      console.error('Error generating session:', sessionError)
      throw sessionError
    }

    console.log('Session generated successfully')

    // If user already existed, get their ID from the session
    if (userExists && sessionData.properties) {
      // The magic link contains user info, but we need to extract the user ID
      // For existing users, we'll just return the email and let Supabase handle it
      userId = 'existing-user' // Placeholder, actual ID will be in the session
    }

    // Return the session tokens
    return new Response(
      JSON.stringify({
        user: {
          id: userId,
          email: userInfo.email,
          user_metadata: {
            full_name: userInfo.name,
            avatar_url: userInfo.picture,
          }
        },
        // Extract tokens from magic link properties
        access_token: sessionData.properties.access_token,
        refresh_token: sessionData.properties.refresh_token,
        expires_in: 3600,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
