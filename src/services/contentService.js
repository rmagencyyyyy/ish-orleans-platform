import { isSupabaseConfigured, supabase } from './supabaseClient'

console.log('Mode stockage : Supabase uniquement')

const EMPTY_ARRAY = []
const SUPABASE_CONFIGURATION_ERROR =
  'Supabase n’est pas configuré. Vérifiez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.'
const TABLES = {
  news: 'news',
  events: 'events',
  eventRegistrations: 'event_registrations',
  galleryImages: 'gallery_images',
  programs: 'programs',
}

function alertSupabaseError(action, error) {
  console.error(`Erreur Supabase (${action})`, error)
  alert(
    `Action impossible pour le moment. Détail Supabase : ${
      error?.message || 'erreur inconnue'
    }`,
  )
}

function reportMissingSupabase() {
  const error = new Error(SUPABASE_CONFIGURATION_ERROR)
  console.error(error.message)
  alert(error.message)
  return error
}

function ensureSupabaseConfigured() {
  if (isSupabaseConfigured && supabase) {
    return true
  }

  reportMissingSupabase()
  return false
}

function requireSupabaseConfigured() {
  if (isSupabaseConfigured && supabase) {
    return
  }

  throw reportMissingSupabase()
}

function toDateValue(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 10)
}

function toTimeValue(value) {
  if (!value) {
    return ''
  }

  return String(value).slice(0, 5)
}

function mapNews(row) {
  return {
    id: row.id,
    contentType: 'Actualité',
    title: row.title || '',
    description: row.description || '',
    imageUrl: row.image_url || '',
    publishedAt: toDateValue(row.published_at || row.created_at),
    status: row.status || 'Publiée',
    isPublished: row.is_published !== false,
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function newsPayload(news) {
  return {
    title: news.title || '',
    description: news.description || '',
    image_url: news.imageUrl || '',
    published_at: news.publishedAt || null,
    status: news.status || 'Publiée',
    is_published: news.isPublished !== false,
    sort_order: Number(news.sortOrder) || 0,
  }
}

function mapEvent(row) {
  return {
    id: row.id,
    contentType: 'Événement',
    title: row.title || '',
    description: row.description || '',
    imageUrl: row.image_url || '',
    date: toDateValue(row.date),
    startTime: toTimeValue(row.start_time),
    endTime: toTimeValue(row.end_time),
    location: row.location || '',
    maxParticipants: row.max_participants || '',
    status: row.status || 'Ouvert',
    isPublished: row.is_published !== false,
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function eventPayload(eventItem) {
  return {
    title: eventItem.title || '',
    description: eventItem.description || '',
    image_url: eventItem.imageUrl || '',
    date: eventItem.date || null,
    start_time: eventItem.startTime || null,
    end_time: eventItem.endTime || null,
    location: eventItem.location || '',
    max_participants: Number(eventItem.maxParticipants) || 0,
    status: eventItem.status || 'Ouvert',
    is_published: eventItem.isPublished !== false,
    sort_order: Number(eventItem.sortOrder) || 0,
  }
}

function mapEventRegistration(row) {
  return {
    id: row.id,
    eventId: row.event_id || '',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    age: row.age || '',
    phone: row.phone || '',
    email: row.email || '',
    createdAt: row.created_at,
  }
}

function eventRegistrationPayload(registration) {
  return {
    event_id: registration.eventId,
    first_name: registration.firstName || '',
    last_name: registration.lastName || '',
    age: Number(registration.age) || null,
    phone: registration.phone || '',
    email: registration.email || '',
  }
}

function mapGalleryImage(row) {
  return {
    id: row.id,
    title: row.title || '',
    description: row.description || '',
    category: row.category || 'Institut',
    imageUrl: row.image_url || '',
    isPublished: Boolean(row.is_published),
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function galleryPayload(image) {
  return {
    title: image.title || '',
    description: image.description || '',
    category: image.category || 'Institut',
    image_url: image.imageUrl || '',
    is_published: Boolean(image.isPublished),
    sort_order: Number(image.sortOrder) || 0,
  }
}

function mapProgram(row) {
  return {
    id: row.id,
    badge: row.age_range || '',
    ageRange: row.age_range || '',
    title: row.title || '',
    text: row.description || '',
    description: row.description || '',
    isPublished: Boolean(row.is_published),
    sortOrder: row.sort_order || 0,
    orderIndex: row.order_index || row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function programPayload(program) {
  return {
    title: program.title || '',
    description: program.description || program.text || '',
    age_range: program.ageRange || program.badge || '',
    sort_order: Number(program.sortOrder) || 0,
    order_index: Number(program.orderIndex || program.sortOrder) || 0,
    is_published: program.isPublished !== false,
  }
}

async function selectRows(table, mapper, queryBuilder, successMessage) {
  if (!ensureSupabaseConfigured()) {
    return EMPTY_ARRAY
  }

  let query = supabase.from(table).select('*')
  if (queryBuilder) {
    query = queryBuilder(query)
  }

  const { data, error } = await query

  if (error) {
    alertSupabaseError(`chargement ${table}`, error)
    return EMPTY_ARRAY
  }

  if (successMessage) {
    console.log(successMessage)
  }

  return (data || []).map(mapper)
}

async function insertRow(table, payload, mapper, action, successMessage) {
  requireSupabaseConfigured()

  const { data, error } = await supabase
    .from(table)
    .insert(payload)
    .select()
    .single()

  if (error) {
    alertSupabaseError(action, error)
    throw error
  }

  if (successMessage) {
    console.log(successMessage)
  }

  return mapper(data)
}

async function updateRow(table, id, payload, mapper, action) {
  requireSupabaseConfigured()

  const { data, error } = await supabase
    .from(table)
    .update(payload)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    alertSupabaseError(action, error)
    throw error
  }

  return mapper(data)
}

async function countRows(table, queryBuilder, action) {
  requireSupabaseConfigured()

  let query = supabase.from(table).select('*', {
    count: 'exact',
    head: true,
  })
  if (queryBuilder) {
    query = queryBuilder(query)
  }

  const { count, error } = await query

  if (error) {
    alertSupabaseError(action, error)
    throw error
  }

  return count || 0
}

async function deleteRow(table, id, action) {
  requireSupabaseConfigured()

  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) {
    alertSupabaseError(action, error)
    throw error
  }

  return true
}

export async function getNews() {
  return selectRows(
    TABLES.news,
    mapNews,
    (query) =>
      query
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false }),
    'Actualités chargées depuis Supabase',
  )
}

export async function getPublishedNews() {
  return selectRows(
    TABLES.news,
    mapNews,
    (query) =>
      query
        .eq('is_published', true)
        .eq('status', 'Publiée')
        .order('sort_order', { ascending: true })
        .order('published_at', { ascending: false }),
    'Actualités chargées depuis Supabase',
  )
}

export async function addNews(news) {
  return insertRow(
    TABLES.news,
    newsPayload(news),
    mapNews,
    'ajout actualité',
    'Actualité envoyée dans Supabase table news',
  )
}

export async function updateNews(id, news) {
  const updatedNews = await updateRow(
    TABLES.news,
    id,
    newsPayload(news),
    mapNews,
    'modification actualité',
  )
  console.log('Actualité modifiée dans Supabase')
  return updatedNews
}

export async function deleteNews(id) {
  return deleteRow(TABLES.news, id, 'suppression actualité')
}

export async function getEvents() {
  return selectRows(
    TABLES.events,
    mapEvent,
    (query) =>
      query.order('sort_order', { ascending: true }).order('date', { ascending: true }),
    'Événements chargés depuis Supabase',
  )
}

export async function getPublishedEvents() {
  return selectRows(
    TABLES.events,
    mapEvent,
    (query) =>
      query
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('date', { ascending: true }),
    'Événements chargés depuis Supabase',
  )
}

export async function addEvent(eventItem) {
  return insertRow(
    TABLES.events,
    eventPayload(eventItem),
    mapEvent,
    'ajout événement',
    'Événement envoyé dans Supabase table events',
  )
}

export async function updateEvent(id, eventItem) {
  const updatedEvent = await updateRow(
    TABLES.events,
    id,
    eventPayload(eventItem),
    mapEvent,
    'modification événement',
  )
  console.log('Événement modifié dans Supabase')
  return updatedEvent
}

export async function deleteEvent(id) {
  return deleteRow(TABLES.events, id, 'suppression événement')
}

export async function addEventRegistration(registration) {
  return insertRow(
    TABLES.eventRegistrations,
    eventRegistrationPayload(registration),
    mapEventRegistration,
    'inscription événement',
    'Inscription événement envoyée dans Supabase table event_registrations',
  )
}

export async function getEventRegistrations() {
  return selectRows(
    TABLES.eventRegistrations,
    mapEventRegistration,
    (query) => query.order('created_at', { ascending: false }),
    'Inscrits événement chargés depuis Supabase',
  )
}

export async function getEventRegistrationsByEventId(eventId) {
  return selectRows(
    TABLES.eventRegistrations,
    mapEventRegistration,
    (query) => query.eq('event_id', eventId).order('created_at', { ascending: false }),
    'Inscrits événement chargés depuis Supabase',
  )
}

export async function getEventRegistrationCount(eventId) {
  const count = await countRows(
    TABLES.eventRegistrations,
    (query) => query.eq('event_id', eventId),
    'comptage inscrits événement',
  )
  console.log('Inscrits événement chargés depuis Supabase')
  return count
}

export async function deleteEventRegistration(id) {
  return deleteRow(
    TABLES.eventRegistrations,
    id,
    'suppression inscription événement',
  )
}

export async function getGalleryImages() {
  return selectRows(
    TABLES.galleryImages,
    mapGalleryImage,
    (query) =>
      query
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
    'Galerie chargée depuis Supabase',
  )
}

export async function getPublishedGalleryImages() {
  return selectRows(
    TABLES.galleryImages,
    mapGalleryImage,
    (query) =>
      query
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false }),
    'Galerie chargée depuis Supabase',
  )
}

export async function addGalleryImage(image) {
  return insertRow(
    TABLES.galleryImages,
    galleryPayload(image),
    mapGalleryImage,
    'ajout image galerie',
    'Image envoyée dans Supabase table gallery_images',
  )
}

export async function updateGalleryImage(id, image) {
  return updateRow(
    TABLES.galleryImages,
    id,
    galleryPayload(image),
    mapGalleryImage,
    'modification image galerie',
  )
}

export async function deleteGalleryImage(id) {
  return deleteRow(TABLES.galleryImages, id, 'suppression image galerie')
}

export async function getPrograms() {
  return selectRows(
    TABLES.programs,
    mapProgram,
    (query) =>
      query
        .order('sort_order', { ascending: true })
        .order('order_index', { ascending: true }),
    'Programmes chargés depuis Supabase',
  )
}

export async function getPublishedPrograms() {
  return selectRows(
    TABLES.programs,
    mapProgram,
    (query) =>
      query
        .eq('is_published', true)
        .order('sort_order', { ascending: true })
        .order('order_index', { ascending: true }),
    'Programmes chargés depuis Supabase',
  )
}

export async function addProgram(program) {
  return insertRow(
    TABLES.programs,
    programPayload(program),
    mapProgram,
    'ajout programme',
    'Programme envoyé dans Supabase table programs',
  )
}

export async function updateProgram(id, program) {
  const updatedProgram = await updateRow(
    TABLES.programs,
    id,
    programPayload(program),
    mapProgram,
    'modification programme',
  )
  console.log('Programme modifié dans Supabase')
  return updatedProgram
}

export async function deleteProgram(id) {
  return deleteRow(TABLES.programs, id, 'suppression programme')
}
