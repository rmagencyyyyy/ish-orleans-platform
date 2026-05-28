import { isSupabaseConfigured } from './supabaseClient'
import * as supabaseProvider from './supabaseStorage'

const SUPABASE_CONFIGURATION_ERROR =
  'Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'

async function withSupabase(supabaseAction) {
  if (!isSupabaseConfigured) {
    throw new Error(SUPABASE_CONFIGURATION_ERROR)
  }

  return supabaseAction()
}

export function addRegistration(registration) {
  return withSupabase(() => supabaseProvider.addRegistration(registration))
}

export function getRegistrations() {
  return withSupabase(() => supabaseProvider.getRegistrations())
}

export function getRegistrationById(id) {
  return withSupabase(() => supabaseProvider.getRegistrationById(id))
}

export function updateRegistration(id, registrationData) {
  return withSupabase(() => supabaseProvider.updateRegistration(id, registrationData))
}

export function updateRegistrationStatus(id, status) {
  return withSupabase(() => supabaseProvider.updateRegistrationStatus(id, status))
}

export function deleteRegistration(id) {
  return withSupabase(() => supabaseProvider.deleteRegistration(id))
}

export function getSettings() {
  return withSupabase(() => supabaseProvider.getSettings())
}

export function updateSettings(settings) {
  return withSupabase(() => supabaseProvider.updateSettings(settings))
}

export function isRegistrationOpen() {
  return withSupabase(() => supabaseProvider.isRegistrationOpen())
}

export function setRegistrationOpen(isOpen) {
  return withSupabase(() => supabaseProvider.setRegistrationOpen(isOpen))
}

export async function getPreGroups() {
  return []
}
