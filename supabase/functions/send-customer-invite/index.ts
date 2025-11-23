import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

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
    // Create Supabase client with service role key
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

    // Get request body
    const { name, email, phone, company } = await req.json()

    // Validate required fields
    if (!name || !email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Name and email are required' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      )
    }

    // Generate a secure temporary password
    const tempPassword = generateSecurePassword()

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers()
    const userExists = existingUser?.users?.find((u: any) => u.email === email)

    let authData
    let isNewUser = false

    if (userExists) {
      // User exists, update their profile instead
      authData = { user: userExists }
      
      // Update existing profile
      const { error: updateError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: name,
          phone: phone || null,
          company: company || null,
          role: 'customer'
        })
        .eq('id', userExists.id)

      if (updateError) {
        console.error('Profile update error:', updateError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to update customer profile: ' + updateError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }

      // Update password for existing user
      const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
        userExists.id,
        { password: tempPassword }
      )

      if (passwordError) {
        console.error('Password update error:', passwordError)
      }
    } else {
      // Create new user
      isNewUser = true
      const { data: newAuthData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          full_name: name,
          role: 'customer'
        }
      })

      if (authError) {
        console.error('Auth error:', authError)
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: authError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          }
        )
      }

      authData = newAuthData

      // Wait a moment for the automatic trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 100))

      // Update the profile with additional details (trigger creates basic profile)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update({
          full_name: name,
          role: 'customer',
          phone: phone || null,
          company: company || null
        })
        .eq('id', authData.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
        // Try to clean up the auth user if profile update failed
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
        
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: 'Failed to update customer profile: ' + profileError.message 
          }),
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          }
        )
      }
    }

    // Return success with credentials
    return new Response(
      JSON.stringify({ 
        success: true,
        data: {
          userId: authData.user.id,
          username: email,
          tempPassword: tempPassword,
          message: 'Customer account created successfully'
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error: any) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error?.message || 'An unexpected error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})

// Generate a secure random password
function generateSecurePassword(): string {
  const length = 12
  const charset = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
  let password = ''
  
  // Use crypto.getRandomValues for secure random generation
  const randomValues = new Uint32Array(length)
  crypto.getRandomValues(randomValues)
  
  for (let i = 0; i < length; i++) {
    password += charset[randomValues[i] % charset.length]
  }
  
  return password
}
