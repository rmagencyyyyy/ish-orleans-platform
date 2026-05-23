import { isSupabaseConfigured, supabase } from './supabaseClient'
import * as localStorageProvider from '../data/storage'

console.log(
  `Mode données utilisé : ${isSupabaseConfigured ? 'Supabase' : 'localStorage'}`,
)

const EMPTY_ARRAY = []

function createLocalId(prefix) {
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}_${randomId}`
}

function alertSupabaseError(action, error) {
  console.error(`Erreur Supabase (${action})`, error)
  alert(
    `Action impossible pour le moment. Détail Supabase : ${
      error?.message || 'erreur inconnue'
    }`,
  )
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
  }
}

function mapEventRegistration(row) {
  return {
    id: row.id,
    eventId: row.event_id || '',
    firstName: row.first_name || '',
    lastName: row.last_name || '',
    age: row.age || '',
    createdAt: row.created_at,
  }
}

function eventRegistrationPayload(registration) {
  return {
    event_id: registration.eventId,
    first_name: registration.firstName || '',
    last_name: registration.lastName || '',
    age: Number(registration.age) || null,
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
  }
}

function mapProgram(row) {
  return {
    id: row.id,
    badge: row.badge || '',
    title: row.title || '',
    text: row.description || row.text || '',
    description: row.description || row.text || '',
    isPublished: Boolean(row.is_published),
    sortOrder: row.sort_order || 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function programPayload(program) {
  return {
    badge: program.badge || '',
    title: program.title || '',
    description: program.description || program.text || '',
    is_published: program.isPublished !== false,
    sort_order: Number(program.sortOrder) || 0,
  }
}

function localPrograms() {
  return [
    {
      id: 'local_program_children',
      badge: '6-12 ans',
      title: 'Programme Enfants',
      text: 'Initiation ludique à la langue arabe et aux bases des sciences islamiques.',
      description:
        'Initiation ludique à la langue arabe et aux bases des sciences islamiques.',
      isPublished: true,
      sortOrder: 1,
    },
    {
      id: 'local_program_teens',
      badge: '13-17 ans',
      title: 'Programme Adolescents',
      text: 'Approfondissement de la langue arabe, lecture et compréhension des textes.',
      description:
        'Approfondissement de la langue arabe, lecture et compréhension des textes.',
      isPublished: true,
      sortOrder: 2,
    },
    {
      id: 'local_program_adults',
      badge: '18+ ans',
      title: 'Programme Adultes',
      text: 'Cours intensifs de langue arabe et d’études islamiques pour adultes.',
      description: 'Cours intensifs de langue arabe et d’études islamiques pour adultes.',
      isPublished: true,
      sortOrder: 3,
    },
  ]
}

async function selectRows(table, mapper, queryBuilder, successMessage) {
  if (!isSupabaseConfigured) {
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

async function deleteRow(table, id, action) {
  const { error } = await supabase.from(table).delete().eq('id', id)

  if (error) {
    alertSupabaseError(action, error)
    throw error
  }

  return true
}

export async function getNews() {
  if (!isSupabaseConfigured) {
    return localStorageProvider
      .getEvents()
      .filter((eventItem) => eventItem.contentType === 'Actualité')
  }

  return selectRows(
    'news',
    mapNews,
    (query) => query.order('published_at', { ascending: false }),
    'Actualités chargées depuis Supabase',
  )
}

export async function getPublishedNews() {
  if (!isSupabaseConfigured) {
    return (await getNews()).filter((news) => news.status === 'Publiée')
  }

  return selectRows(
    'news',
    mapNews,
    (query) =>
      query.eq('status', 'Publiée').order('published_at', { ascending: false }),
    'Actualités chargées depuis Supabase',
  )
}

export async function addNews(news) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.addEvent({ ...news, contentType: 'Actualité' })
  }

  return insertRow('news', newsPayload(news), mapNews, 'ajout actualité')
}

export async function updateNews(id, news) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.updateEvent(id, { ...news, contentType: 'Actualité' })
  }

  return updateRow('news', id, newsPayload(news), mapNews, 'modification actualité')
}

export async function deleteNews(id) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.deleteEvent(id)
  }

  return deleteRow('news', id, 'suppression actualité')
}

export async function getEvents() {
  if (!isSupabaseConfigured) {
    return localStorageProvider
      .getEvents()
      .filter((eventItem) => eventItem.contentType !== 'Actualité')
  }

  return selectRows(
    'events',
    mapEvent,
    (query) => query.order('date', { ascending: true }),
    'Événements chargés depuis Supabase',
  )
}

export async function getPublishedEvents() {
  if (!isSupabaseConfigured) {
    return (await getEvents()).filter((eventItem) => eventItem.status === 'Ouvert')
  }

  return selectRows(
    'events',
    mapEvent,
    (query) => query.eq('status', 'Ouvert').order('date', { ascending: true }),
    'Événements chargés depuis Supabase',
  )
}

export async function addEvent(eventItem) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.addEvent({ ...eventItem, contentType: 'Événement' })
  }

  return insertRow('events', eventPayload(eventItem), mapEvent, 'ajout événement')
}

export async function updateEvent(id, eventItem) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.updateEvent(id, {
      ...eventItem,
      contentType: 'Événement',
    })
  }

  return updateRow(
    'events',
    id,
    eventPayload(eventItem),
    mapEvent,
    'modification événement',
  )
}

export async function deleteEvent(id) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.deleteEvent(id)
  }

  return deleteRow('events', id, 'suppression événement')
}

export async function addEventRegistration(registration) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.addEventRegistration(registration)
  }

  return insertRow(
    'event_registrations',
    eventRegistrationPayload(registration),
    mapEventRegistration,
    'inscription événement',
    'Inscription événement enregistrée dans Supabase',
  )
}

export async function getEventRegistrations() {
  if (!isSupabaseConfigured) {
    return localStorageProvider.getEventRegistrations()
  }

  return selectRows('event_registrations', mapEventRegistration, (query) =>
    query.order('created_at', { ascending: false }),
  )
}

export async function getEventRegistrationsByEventId(eventId) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.getEventRegistrationsByEventId(eventId)
  }

  return selectRows('event_registrations', mapEventRegistration, (query) =>
    query.eq('event_id', eventId).order('created_at', { ascending: false }),
  )
}

export async function deleteEventRegistration(id) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.deleteEventRegistration(id)
  }

  return deleteRow('event_registrations', id, 'suppression inscription événement')
}

export async function getGalleryImages() {
  if (!isSupabaseConfigured) {
    return localStorageProvider.getGalleryImages()
  }

  return selectRows(
    'gallery_images',
    mapGalleryImage,
    (query) => query.order('created_at', { ascending: false }),
    'Galerie chargée depuis Supabase',
  )
}

export async function getPublishedGalleryImages() {
  if (!isSupabaseConfigured) {
    return localStorageProvider
      .getGalleryImages()
      .filter((image) => image.isPublished)
  }

  return selectRows(
    'gallery_images',
    mapGalleryImage,
    (query) =>
      query.eq('is_published', true).order('created_at', { ascending: false }),
    'Galerie chargée depuis Supabase',
  )
}

export async function addGalleryImage(image) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.addGalleryImage(image)
  }

  return insertRow(
    'gallery_images',
    galleryPayload(image),
    mapGalleryImage,
    'ajout image galerie',
  )
}

export async function updateGalleryImage(id, image) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.updateGalleryImage(id, image)
  }

  return updateRow(
    'gallery_images',
    id,
    galleryPayload(image),
    mapGalleryImage,
    'modification image galerie',
  )
}

export async function deleteGalleryImage(id) {
  if (!isSupabaseConfigured) {
    return localStorageProvider.deleteGalleryImage(id)
  }

  return deleteRow('gallery_images', id, 'suppression image galerie')
}

export async function getPrograms() {
  if (!isSupabaseConfigured) {
    return localPrograms()
  }

  return selectRows(
    'programs',
    mapProgram,
    (query) => query.order('sort_order', { ascending: true }),
    'Programmes chargés depuis Supabase',
  )
}

export async function getPublishedPrograms() {
  if (!isSupabaseConfigured) {
    return localPrograms().filter((program) => program.isPublished)
  }

  return selectRows(
    'programs',
    mapProgram,
    (query) =>
      query.eq('is_published', true).order('sort_order', { ascending: true }),
    'Programmes chargés depuis Supabase',
  )
}

export async function addProgram(program) {
  if (!isSupabaseConfigured) {
    return {
      id: createLocalId('program'),
      createdAt: new Date().toISOString(),
      isPublished: true,
      ...program,
    }
  }

  return insertRow('programs', programPayload(program), mapProgram, 'ajout programme')
}

export async function updateProgram(id, program) {
  if (!isSupabaseConfigured) {
    return { id, updatedAt: new Date().toISOString(), ...program }
  }

  return updateRow(
    'programs',
    id,
    programPayload(program),
    mapProgram,
    'modification programme',
  )
}

export async function deleteProgram(id) {
  if (!isSupabaseConfigured) {
    return Boolean(id)
  }

  return deleteRow('programs', id, 'suppression programme')
}
