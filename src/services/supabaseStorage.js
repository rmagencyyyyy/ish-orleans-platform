import { supabase } from './supabaseClient'

const DEFAULT_SETTINGS = {
  schoolYear: '2025 / 2026',
  registrationOpen: true,
}

const REGISTRATIONS_KEY = 'ish-orleans:registrations'
const SETTINGS_KEY = 'ish-orleans:settings'

function courseGroupKey(course) {
  return [
    course.subject,
    course.level,
    course.publicType,
    course.availabilityType,
    course.preferredTime,
  ].join('|')
}

function personalInfoFromRow(row) {
  return {
    Nom: row.last_name || '',
    Prénom: row.first_name || '',
    'Date de naissance': row.birth_date || '',
    Âge: row.age || '',
    'Lieu de naissance': row.birth_place || '',
    Nationalité: row.nationality || '',
    'Responsable légal si mineur': row.legal_guardian || '',
    'Lien de parenté': row.relationship || '',
    Adresse: row.address || '',
    'Code postal': row.postal_code || '',
    Ville: row.city || '',
    'Téléphone portable 1': row.phone1 || '',
    'Portable 2': row.phone2 || '',
    Email: row.email || '',
  }
}

function registrationPayload(registration) {
  const info = registration.personalInformation || {}

  return {
    first_name: info.Prénom || '',
    last_name: info.Nom || '',
    birth_date: info['Date de naissance'] || null,
    age: info.Âge ? Number(info.Âge) : null,
    birth_place: info['Lieu de naissance'] || '',
    nationality: info.Nationalité || '',
    legal_guardian: info['Responsable légal si mineur'] || '',
    relationship: info['Lien de parenté'] || '',
    address: info.Adresse || '',
    postal_code: info['Code postal'] || '',
    city: info.Ville || '',
    phone1: info['Téléphone portable 1'] || '',
    phone2: info['Portable 2'] || '',
    email: info.Email || '',
    status: registration.status || 'En attente',
    assignment_status: registration.assignmentStatus || registration.assignment_status || 'Non affecté',
  }
}

function coursePayload(course, registrationId) {
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const normalizedCourse = {
    subject: course.subject || course.title || '',
    level: course.level || course.details?.Niveau || '',
    publicType: course.publicType || course.details?.Public || '',
    availabilityType:
      course.availabilityType || course.details?.['Disponibilité principale'] || '',
    availableDays: course.availableDays || [],
    preferredTime: course.preferredTime || course.details?.['Créneau souhaité'] || '',
    planning: course.planning || course.details?.['Planning jours / heure'] || '',
    assignmentStatus: course.assignmentStatus || 'Non affecté',
    assignedClassId: uuidPattern.test(course.assignedClassId || '')
      ? course.assignedClassId
      : null,
    assignedClassName: course.assignedClassName || '',
  }

  return {
    registration_id: registrationId,
    subject: normalizedCourse.subject,
    level: normalizedCourse.level,
    public_type: normalizedCourse.publicType,
    availability_type: normalizedCourse.availabilityType,
    available_days: normalizedCourse.availableDays,
    preferred_time: normalizedCourse.preferredTime,
    planning: normalizedCourse.planning,
    group_key: courseGroupKey(normalizedCourse),
    assignment_status: normalizedCourse.assignmentStatus,
    assigned_class_id: normalizedCourse.assignedClassId,
    assigned_class_name: normalizedCourse.assignedClassName,
  }
}

function mapCourse(row) {
  return {
    id: row.id,
    subject: row.subject || '',
    title: row.subject || '',
    level: row.level || '',
    publicType: row.public_type || '',
    availabilityType: row.availability_type || '',
    availableDays: Array.isArray(row.available_days) ? row.available_days : [],
    preferredTime: row.preferred_time || '',
    planning: row.planning || '',
    groupKey: row.group_key || '',
    assignmentStatus: row.assignment_status || 'Non affecté',
    assignedClassId: row.assigned_class_id || '',
    assignedClassName: row.assigned_class_name || '',
    options: [],
    details: {
      Niveau: row.level || '',
      Public: row.public_type || '',
      'Disponibilité principale': row.availability_type || '',
      'Jours disponibles': Array.isArray(row.available_days)
        ? row.available_days.join(', ')
        : '',
      'Créneau souhaité': row.preferred_time || '',
      'Planning jours / heure': row.planning || '',
      'Groupe provisoire': row.group_key || '',
      'Statut d’affectation': row.assignment_status || 'Non affecté',
      'Classe affectée': row.assigned_class_name || '-',
    },
  }
}

function mapRegistration(row) {
  const coursesWanted = (row.registration_courses || []).map(mapCourse)

  return {
    id: row.id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    status: row.status || 'En attente',
    assignmentStatus: row.assignment_status || 'Non affecté',
    personalInformation: personalInfoFromRow(row),
    coursesWanted,
    selectedCourses: coursesWanted.map((course) => ({
      title: course.subject,
      options: [],
      details: course.details,
    })),
    validation: {},
    registrationType: [],
  }
}

function syncLocalRegistrations(registrations) {
  localStorage.setItem(REGISTRATIONS_KEY, JSON.stringify(registrations))
}

function syncLocalSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
}

async function fetchRegistrationRows() {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, registration_courses(*)')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

export async function addRegistration(registration) {
  const id =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`
  const createdAt = new Date().toISOString()
  const { error } = await supabase
    .from('registrations')
    .insert({ id, ...registrationPayload(registration) })

  if (error) {
    throw error
  }

  const courses = registration.coursesWanted || []
  if (courses.length > 0) {
    const { error: coursesError } = await supabase
      .from('registration_courses')
      .insert(courses.map((course) => coursePayload(course, id)))

    if (coursesError) {
      throw coursesError
    }
  }

  const created = {
    ...registration,
    id,
    createdAt,
    status: registration.status || 'En attente',
    coursesWanted: courses.map((course) => ({
      ...course,
      groupKey: course.groupKey || courseGroupKey(course),
    })),
  }
  syncLocalRegistrations([created, ...JSON.parse(localStorage.getItem(REGISTRATIONS_KEY) || '[]')])
  return created
}

export async function getRegistrations() {
  const rows = await fetchRegistrationRows()
  const registrations = rows.map(mapRegistration)
  syncLocalRegistrations(registrations)
  return registrations
}

export async function getRegistrationById(id) {
  const { data, error } = await supabase
    .from('registrations')
    .select('*, registration_courses(*)')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return mapRegistration(data)
}

export async function updateRegistration(id, registrationData) {
  const { error } = await supabase
    .from('registrations')
    .update(registrationPayload(registrationData))
    .eq('id', id)

  if (error) {
    throw error
  }

  const courses = registrationData.coursesWanted || []
  const { error: deleteError } = await supabase
    .from('registration_courses')
    .delete()
    .eq('registration_id', id)

  if (deleteError) {
    throw deleteError
  }

  if (courses.length > 0) {
    const { error: insertError } = await supabase
      .from('registration_courses')
      .insert(courses.map((course) => coursePayload(course, id)))

    if (insertError) {
      throw insertError
    }
  }

  const updated = await getRegistrationById(id)
  await getRegistrations()
  return updated
}

export async function updateRegistrationStatus(id, status) {
  const { error } = await supabase
    .from('registrations')
    .update({ status })
    .eq('id', id)

  if (error) {
    throw error
  }

  const updated = await getRegistrationById(id)
  await getRegistrations()
  return updated
}

export async function deleteRegistration(id) {
  const { error } = await supabase.from('registrations').delete().eq('id', id)

  if (error) {
    throw error
  }

  await getRegistrations()
  return true
}

export async function getSettings() {
  const { data, error } = await supabase.from('settings').select('*')

  if (error) {
    throw error
  }

  const settings = (data || []).reduce(
    (currentSettings, setting) => ({
      ...currentSettings,
      [setting.key]: setting.value,
    }),
    DEFAULT_SETTINGS,
  )

  syncLocalSettings(settings)
  return settings
}

export async function updateSettings(settings) {
  const rows = Object.entries(settings).map(([key, value]) => ({
    key,
    value,
  }))

  const { error } = await supabase.from('settings').upsert(rows, {
    onConflict: 'key',
  })

  if (error) {
    throw error
  }

  return getSettings()
}

export async function isRegistrationOpen() {
  const settings = await getSettings()
  return Boolean(settings.registrationOpen)
}

export async function setRegistrationOpen(isOpen) {
  return updateSettings({ registrationOpen: Boolean(isOpen) })
}
