import { isSupabaseConfigured } from './supabaseClient'
import * as localStorageProvider from '../data/storage'
import * as supabaseProvider from './supabaseStorage'

function warnAndFallback(operation, error) {
  console.warn(`Supabase ${operation} failed. Falling back to localStorage.`, error)
}

async function withFallback(operation, supabaseAction, localAction) {
  if (!isSupabaseConfigured) {
    return localAction()
  }

  try {
    return await supabaseAction()
  } catch (error) {
    warnAndFallback(operation, error)
    return localAction()
  }
}

export function addRegistration(registration) {
  return withFallback(
    'addRegistration',
    () => supabaseProvider.addRegistration(registration),
    () => localStorageProvider.addRegistration(registration),
  )
}

export function getRegistrations() {
  return withFallback(
    'getRegistrations',
    () => supabaseProvider.getRegistrations(),
    () => localStorageProvider.getRegistrations(),
  )
}

export function getRegistrationById(id) {
  return withFallback(
    'getRegistrationById',
    () => supabaseProvider.getRegistrationById(id),
    () => localStorageProvider.getRegistrationById(id),
  )
}

export function updateRegistration(id, registrationData) {
  return withFallback(
    'updateRegistration',
    () => supabaseProvider.updateRegistration(id, registrationData),
    () => localStorageProvider.updateRegistration(id, registrationData),
  )
}

export function updateRegistrationStatus(id, status) {
  return withFallback(
    'updateRegistrationStatus',
    () => supabaseProvider.updateRegistrationStatus(id, status),
    () => localStorageProvider.updateRegistrationStatus(id, status),
  )
}

export function deleteRegistration(id) {
  return withFallback(
    'deleteRegistration',
    () => supabaseProvider.deleteRegistration(id),
    () => localStorageProvider.deleteRegistration(id),
  )
}

export function getSettings() {
  return withFallback(
    'getSettings',
    () => supabaseProvider.getSettings(),
    () => localStorageProvider.getSettings(),
  )
}

export function updateSettings(settings) {
  return withFallback(
    'updateSettings',
    () => supabaseProvider.updateSettings(settings),
    () => localStorageProvider.updateSettings(settings),
  )
}

export function isRegistrationOpen() {
  return withFallback(
    'isRegistrationOpen',
    () => supabaseProvider.isRegistrationOpen(),
    () => localStorageProvider.isRegistrationOpen(),
  )
}

export function setRegistrationOpen(isOpen) {
  return withFallback(
    'setRegistrationOpen',
    () => supabaseProvider.setRegistrationOpen(isOpen),
    () => localStorageProvider.setRegistrationOpen(isOpen),
  )
}

export async function getPreGroups() {
  await getRegistrations()
  return localStorageProvider.getPreGroups()
}
