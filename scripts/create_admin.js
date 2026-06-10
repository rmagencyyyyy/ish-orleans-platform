#!/usr/bin/env node
import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, { auth: { persistSession: false } })

const email = 'ishorleans@gmail.com'
const password = '2sh_0rleans!!'

async function run() {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    })

    if (error) {
      console.error('Error creating auth user:', error)
      process.exit(1)
    }

    // supabase-js may return user directly under data or data.user depending on version
    const user = (data && (data.user || data))
    const id = user?.id

    if (!id) {
      console.error('Could not determine created user id:', data)
      process.exit(1)
    }

    const { error: profileError } = await supabase.from('profiles').upsert({
      id,
      email,
      first_name: 'Admin',
      last_name: '',
      role: 'admin',
      is_active: true,
    })

    if (profileError) {
      console.error('Error upserting profile:', profileError)
      process.exit(1)
    }

    console.log('Admin account created:', email)
    console.log('User id:', id)
  } catch (err) {
    console.error('Unexpected error:', err)
    process.exit(1)
  }
}

run()
