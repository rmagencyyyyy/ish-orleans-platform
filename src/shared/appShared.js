const personalFields = [
  'Nom',
  'Prénom',
  'Date de naissance',
  'Âge',
  'Lieu de naissance',
  'Nationalité',
  'Responsable légal si mineur',
  'Lien de parenté',
  'Adresse',
  'Code postal',
  'Ville',
  'Téléphone portable 1',
  'Portable 2',
  'Email',
]

const courseGroups = [
  {
    title: 'Langue Arabe',
    options: [
      'Adultes 2h/semaine',
      'Adultes intensif 3h/semaine',
      'Enfants 2h > 6 ans Arabe & Éveil Religieux',
      'Enfants 3h > 10 ans Arabe & Éveil Religieux',
    ],
    fields: ['Niveau', 'Planning jours / heure'],
  },
  { title: 'Coran / Tajwid', options: ['Adultes', 'Ados / Enfants'], fields: ['Niveau', 'Planning jours / heure'] },
  {
    title: 'Théologie musulmane',
    options: ['Adultes', 'Ados', 'Arabe', 'Français', 'Initiation à l’Islam pour les convertis'],
    fields: ['Planning jours / heure'],
  },
  { title: 'Initiation à l’Islam', options: ['Convertis', 'Adultes', 'Ados'], fields: ['Planning jours / heure'] },
  { title: 'Français', options: ['Adultes', 'Ados / Enfants'], fields: ['Niveau', 'Planning jours / heure'] },
  { title: 'Anglais', options: ['Adultes', 'Ados / Enfants'], fields: ['Niveau', 'Planning jours / heure'] },
  { title: 'Soutien scolaire', options: ['Primaire', 'Collège', 'Lycée'], fields: ['Planning jours / heure'] },
]

const levelOptions = ['Débutant', 'Intermédiaire', 'Avancé']
const publicTypeOptions = ['Enfant', 'Ado', 'Adulte']
const availabilityOptions = ['Semaine', 'Week-end', 'Les deux']
const dayOptions = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche']
const preferredTimeOptions = ['Matin', 'Après-midi', 'Soir', 'Peu importe']
const scheduleHours = Array.from({ length: 12 }, (_, index) => 8 + index)
const scheduleStartHour = 8
const scheduleEndHour = 20
const scheduleRowHeight = 72

const requiredDocuments = [
  'Fiche d’inscription ISH complétée, datée et signée + 1 photo à coller',
  'Règlement intérieur signé',
  'Copie de certificat d’assurance scolaire',
  'Frais d’inscription par chèque à l’ordre de “ISH Orléans” ou par virement',
]

const emptyClassForm = {
  name: '', subject: 'Arabe', level: '', publicType: 'Adultes', availabilityType: '', days: [],
  day: '', startTime: '', endTime: '', teacher: '', teacherId: '', room: '', maxStudents: '',
}

const emptyUserForm = {
  firstName: '', lastName: '', email: '', password: '', role: 'teacher', assignedClassIds: [], isActive: true,
}

const emptyNoteForm = { title: '', score: '', maxScore: '', date: '', appreciation: '' }
const emptyGradeForm = { evaluationTitle: '', grade: '', maxGrade: '20', coefficient: '1', date: '', appreciation: '' }
const emptyAttendanceForm = { date: '', status: 'Présent', comment: '' }
const emptyEventForm = {
  contentType: 'Événement',
  title: '',
  description: '',
  imageUrl: '',
  publishedAt: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  maxParticipants: '',
  status: 'Ouvert',
}
const galleryCategories = ['Institut', 'Événement', 'Cours', 'Activité', 'Autre']
const emptyGalleryForm = { title: '', description: '', category: 'Institut', imageUrl: '', isPublished: true }

const CURRENT_USER_KEY = 'ish-orleans:current-user'

function inputType(label) {
  if (label === 'Date de naissance' || label === 'Date') return 'date'
  if (label === 'Âge') return 'number'
  if (label === 'Email') return 'email'
  if (label.toLowerCase().includes('téléphone') || label.includes('Portable')) return 'tel'
  return 'text'
}

function slugify(label) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem(CURRENT_USER_KEY)) || null
  } catch {
    return null
  }
}

function createUserSession(user) {
  localStorage.setItem(
    CURRENT_USER_KEY,
    JSON.stringify({ currentUser: user, role: user.role, isAuthenticated: true }),
  )
}

function clearUserSession() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

function userIsAuthenticated(role) {
  const session = getCurrentUser()
  if (!session?.isAuthenticated) return false
  return role ? session.role === role : true
}

function readFileAsDataUrl(file, options = {}) {
  if (!file || !String(file.type || '').startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const {
    maxWidth = 1200,
    quality = 0.78,
    outputType = 'image/jpeg',
  } = options

  return new Promise((resolve, reject) => {
    const reader = new FileReader()

    reader.onload = () => {
      const image = new Image()

      image.onload = () => {
        const width = image.width || 0
        const height = image.height || 0

        if (!width || !height) {
          resolve(reader.result)
          return
        }

        const ratio = Math.min(1, maxWidth / width)
        const targetWidth = Math.max(1, Math.round(width * ratio))
        const targetHeight = Math.max(1, Math.round(height * ratio))
        const canvas = document.createElement('canvas')

        canvas.width = targetWidth
        canvas.height = targetHeight

        const context = canvas.getContext('2d')
        if (!context) {
          resolve(reader.result)
          return
        }

        context.drawImage(image, 0, 0, targetWidth, targetHeight)

        try {
          const compressed = canvas.toDataURL(outputType, quality)
          resolve(compressed || reader.result)
        } catch (error) {
          reject(error)
        }
      }

      image.onerror = () => resolve(reader.result)
      image.src = String(reader.result || '')
    }

    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

export {
  availabilityOptions,
  clearUserSession,
  courseGroups,
  createUserSession,
  dayOptions,
  emptyAttendanceForm,
  emptyClassForm,
  emptyEventForm,
  emptyGalleryForm,
  emptyGradeForm,
  emptyNoteForm,
  emptyUserForm,
  galleryCategories,
  getCurrentUser,
  inputType,
  levelOptions,
  personalFields,
  preferredTimeOptions,
  publicTypeOptions,
  readFileAsDataUrl,
  requiredDocuments,
  scheduleEndHour,
  scheduleHours,
  scheduleRowHeight,
  scheduleStartHour,
  slugify,
  userIsAuthenticated,
}
