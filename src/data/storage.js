const STORAGE_KEYS = {
  registrations: 'ish-orleans:registrations',
  classes: 'ish-orleans:classes',
  settings: 'ish-orleans:settings',
  events: 'ish-orleans:events',
  eventRegistrations: 'ish-orleans:event-registrations',
  galleryImages: 'ish-orleans:gallery-images',
  users: 'ish-orleans:users',
  studentNotes: 'ish-orleans:student-notes',
  studentGrades: 'ish-orleans:student-grades',
  attendance: 'ish-orleans:attendance',
}

const DEFAULT_ADMIN = {
  id: 'default_admin',
  firstName: 'Admin',
  lastName: 'ISH',
  email: 'admin@ishorleans.fr',
  password: 'admin123',
  role: 'admin',
  assignedClassIds: [],
  createdAt: '2025-01-01T00:00:00.000Z',
  isActive: true,
}

const DEFAULT_SETTINGS = {
  schoolYear: '2025 / 2026',
  registrationOpen: true,
}

function createId(prefix) {
  const randomId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  return `${prefix}_${randomId}`
}

function readValue(key, fallback) {
  try {
    const rawValue = localStorage.getItem(key)
    return rawValue ? JSON.parse(rawValue) : fallback
  } catch {
    return fallback
  }
}

function writeValue(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
  return value
}

function readCollection(key) {
  const value = readValue(key, [])
  return Array.isArray(value) ? value : []
}

function writeCollection(key, value) {
  return writeValue(key, value)
}

// Simulation locale remplaçable plus tard par Supabase Auth + Database.
function syncClassAssignmentsForUser(userId, assignedClassIds) {
  const assignedIds = assignedClassIds || []
  const classes = getClasses().map((classItem) => {
    if (assignedIds.includes(classItem.id)) {
      const user = getUserById(userId)
      return {
        ...classItem,
        teacherId: userId,
        teacher: user ? `${user.firstName} ${user.lastName}`.trim() : classItem.teacher,
      }
    }

    if (classItem.teacherId === userId) {
      return {
        ...classItem,
        teacherId: '',
        teacher: '',
      }
    }

    return classItem
  })

  writeCollection(STORAGE_KEYS.classes, classes)
}

export function addRegistration(registration) {
  const registrations = getRegistrations()
  const newRegistration = {
    id: createId('registration'),
    createdAt: new Date().toISOString(),
    status: 'En attente',
    ...registration,
  }

  writeCollection(STORAGE_KEYS.registrations, [newRegistration, ...registrations])
  return newRegistration
}

export function getRegistrations() {
  return readCollection(STORAGE_KEYS.registrations)
}

export function getRegistrationById(id) {
  return getRegistrations().find((registration) => registration.id === id) || null
}

export function updateRegistrationStatus(id, status) {
  let updatedRegistration = null
  const registrations = getRegistrations().map((registration) => {
    if (registration.id !== id) {
      return registration
    }

    updatedRegistration = {
      ...registration,
      status,
      updatedAt: new Date().toISOString(),
    }

    return updatedRegistration
  })

  writeCollection(STORAGE_KEYS.registrations, registrations)
  return updatedRegistration
}

export function updateRegistration(id, registrationData) {
  let updatedRegistration = null
  const registrations = getRegistrations().map((registration) => {
    if (registration.id !== id) {
      return registration
    }

    updatedRegistration = {
      ...registration,
      ...registrationData,
      id: registration.id,
      createdAt: registration.createdAt,
      updatedAt: new Date().toISOString(),
    }

    return updatedRegistration
  })

  writeCollection(STORAGE_KEYS.registrations, registrations)
  return updatedRegistration
}

export function deleteRegistration(id) {
  const registrations = getRegistrations()
  const nextRegistrations = registrations.filter(
    (registration) => registration.id !== id,
  )

  writeCollection(STORAGE_KEYS.registrations, nextRegistrations)
  return nextRegistrations.length !== registrations.length
}

export function addClass(classData) {
  const classes = getClasses()
  const newClass = {
    id: createId('class'),
    name: '',
    subject: '',
    level: '',
    publicType: '',
    availabilityType: '',
    days: [],
    preferredTime: '',
    day: '',
    startTime: '',
    endTime: '',
    teacher: '',
    teacherId: '',
    teacherName: '',
    room: '',
    maxStudents: '',
    students: [],
    sourcePreGroupKey: '',
    createdAt: new Date().toISOString(),
    creationMode: 'Manuel',
    ...classData,
  }

  writeCollection(STORAGE_KEYS.classes, [newClass, ...classes])
  return newClass
}

export function getClasses() {
  return readCollection(STORAGE_KEYS.classes)
}

export function getClassById(id) {
  return getClasses().find((classItem) => classItem.id === id) || null
}

function normalizeClassDays(classItem) {
  if (Array.isArray(classItem.days) && classItem.days.length > 0) {
    return classItem.days
  }

  if (classItem.day) {
    return String(classItem.day)
      .split(',')
      .map((day) => day.trim())
      .filter(Boolean)
  }

  return []
}

function classHasSchedule(classItem) {
  return normalizeClassDays(classItem).length > 0 && classItem.startTime && classItem.endTime
}

function scheduleEntryFromClass(classItem, day) {
  return {
    ...classItem,
    day,
    days: normalizeClassDays(classItem),
    teacherName: classItem.teacherName || classItem.teacher || '',
    studentCount: (classItem.students || []).length,
    hasSchedule: classHasSchedule(classItem),
  }
}

export function getGlobalSchedule() {
  return getClasses()
    .flatMap((classItem) =>
      normalizeClassDays(classItem).map((day) => scheduleEntryFromClass(classItem, day)),
    )
    .sort((first, second) => {
      return String(first.startTime || '').localeCompare(String(second.startTime || ''))
    })
}

export function getTeacherSchedule(teacherId) {
  return getGlobalSchedule().filter((entry) => entry.teacherId === teacherId)
}

export function getScheduleByDay(day) {
  return getGlobalSchedule().filter((entry) => entry.day === day)
}

export function getScheduleByClassId(classId) {
  return getGlobalSchedule().filter((entry) => entry.id === classId)
}

export function updateClassSchedule(classId, scheduleData) {
  const teacher = scheduleData.teacherId ? getUserById(scheduleData.teacherId) : null
  return updateClass(classId, {
    days: scheduleData.days || [],
    day: (scheduleData.days || []).join(', '),
    startTime: scheduleData.startTime || '',
    endTime: scheduleData.endTime || '',
    room: scheduleData.room || '',
    teacherId: scheduleData.teacherId || '',
    teacher: teacher
      ? `${teacher.firstName} ${teacher.lastName}`.trim()
      : scheduleData.teacher || '',
    teacherName: teacher
      ? `${teacher.firstName} ${teacher.lastName}`.trim()
      : scheduleData.teacherName || scheduleData.teacher || '',
  })
}

export function getClassesWithoutSchedule() {
  return getClasses().filter((classItem) => !classHasSchedule(classItem))
}

export function updateClass(id, classData) {
  let updatedClass = null
  const classes = getClasses().map((classItem) => {
    if (classItem.id !== id) {
      return classItem
    }

    updatedClass = {
      ...classItem,
      ...classData,
      students: classData.students || classItem.students || [],
      updatedAt: new Date().toISOString(),
    }

    return updatedClass
  })

  writeCollection(STORAGE_KEYS.classes, classes)
  return updatedClass
}

export function deleteClass(id) {
  const classes = getClasses()
  const nextClasses = classes.filter((classItem) => classItem.id !== id)

  writeCollection(STORAGE_KEYS.classes, nextClasses)
  return nextClasses.length !== classes.length
}

export function assignStudentToClass(classId, studentId) {
  const classItem = getClassById(classId)
  const registration = getRegistrationById(studentId)

  if (!classItem || !registration) {
    return { error: 'NOT_FOUND' }
  }

  const students = classItem.students || []
  const maxStudents = Number(classItem.maxStudents) || 0

  if (!students.includes(studentId) && maxStudents > 0 && students.length >= maxStudents) {
    return { error: 'CLASS_FULL' }
  }

  const classes = getClasses().map((currentClass) => {
    const currentStudents = currentClass.students || []

    if (currentClass.id === classId) {
      return {
        ...currentClass,
        students: currentStudents.includes(studentId)
          ? currentStudents
          : [...currentStudents, studentId],
        updatedAt: new Date().toISOString(),
      }
    }

    return {
      ...currentClass,
      students: currentStudents.filter((currentStudentId) => {
        return currentStudentId !== studentId
      }),
    }
  })

  writeCollection(STORAGE_KEYS.classes, classes)

  let updatedRegistration = null
  const registrations = getRegistrations().map((currentRegistration) => {
    if (currentRegistration.id !== studentId) {
      return currentRegistration
    }

    updatedRegistration = {
      ...currentRegistration,
      assignedClassId: classItem.id,
      assignedClassName: classItem.name,
      updatedAt: new Date().toISOString(),
    }

    return updatedRegistration
  })

  writeCollection(STORAGE_KEYS.registrations, registrations)

  return {
    classItem: getClassById(classId),
    registration: updatedRegistration,
  }
}

export function getSettings() {
  return {
    ...DEFAULT_SETTINGS,
    ...readValue(STORAGE_KEYS.settings, DEFAULT_SETTINGS),
  }
}

export function updateSettings(settings) {
  const nextSettings = {
    ...getSettings(),
    ...settings,
    updatedAt: new Date().toISOString(),
  }

  return writeValue(STORAGE_KEYS.settings, nextSettings)
}

export function isRegistrationOpen() {
  return Boolean(getSettings().registrationOpen)
}

export function setRegistrationOpen(isOpen) {
  return updateSettings({ registrationOpen: Boolean(isOpen) })
}

function courseGroupKey(course) {
  return [
    course.subject,
    course.level,
    course.publicType,
    course.availabilityType,
    course.preferredTime,
  ].join('|')
}

function updateCourseAssignment(studentId, courseId, classItem) {
  const registrations = getRegistrations().map((registration) => {
    if (registration.id !== studentId) {
      return registration
    }

    return {
      ...registration,
      coursesWanted: (registration.coursesWanted || []).map((course) => {
        if (course.id !== courseId) {
          return course
        }

        return {
          ...course,
          assignmentStatus: classItem ? 'Affecté à une classe' : 'Pré-groupé',
          assignedClassId: classItem?.id || '',
          assignedClassName: classItem?.name || '',
        }
      }),
      updatedAt: new Date().toISOString(),
    }
  })

  writeCollection(STORAGE_KEYS.registrations, registrations)
}

export function getPreGroups() {
  const groups = new Map()

  getRegistrations().forEach((registration) => {
    ;(registration.coursesWanted || []).forEach((course) => {
      const key = course.groupKey || courseGroupKey(course)
      const currentGroup = groups.get(key) || {
        key,
        subject: course.subject,
        level: course.level,
        publicType: course.publicType,
        availabilityType: course.availabilityType,
        preferredTime: course.preferredTime,
        students: [],
      }

      currentGroup.students.push({
        registration,
        course,
      })
      groups.set(key, currentGroup)
    })
  })

  return Array.from(groups.values())
}

export function getPreGroupByKey(key) {
  return getPreGroups().find((group) => group.key === key) || null
}

export function getStudentsByPreGroup(key) {
  return getPreGroupByKey(key)?.students || []
}

export function regeneratePreGroups() {
  const registrations = getRegistrations().map((registration) => ({
    ...registration,
    coursesWanted: (registration.coursesWanted || []).map((course) => ({
      ...course,
      groupKey: course.groupKey || courseGroupKey(course),
      assignmentStatus: course.assignedClassId ? 'Affecté à une classe' : 'Pré-groupé',
    })),
  }))

  writeCollection(STORAGE_KEYS.registrations, registrations)
  return getPreGroups()
}

export function getUngroupedRegistrations() {
  return getRegistrations().filter((registration) => {
    return !registration.coursesWanted || registration.coursesWanted.length === 0
  })
}

export function moveStudentToClass(studentId, classId, courseId) {
  const classItem = getClassById(classId)
  const registration = getRegistrationById(studentId)

  if (!classItem || !registration) {
    return { error: 'NOT_FOUND' }
  }

  const course =
    (registration.coursesWanted || []).find((item) => item.id === courseId) ||
    (registration.coursesWanted || []).find((item) => {
      return item.subject === classItem.subject && item.level === classItem.level
    })

  if (!course) {
    return { error: 'COURSE_NOT_FOUND' }
  }

  const alreadyAssignedToTarget = (classItem.students || []).includes(studentId)
  if (alreadyAssignedToTarget && course.assignedClassId === classId) {
    return { classItem, registration }
  }

  if (alreadyAssignedToTarget) {
    return { error: 'DUPLICATE_COURSE' }
  }

  const maxStudents = Number(classItem.maxStudents) || 0
  if (maxStudents > 0 && (classItem.students || []).length >= maxStudents) {
    return { error: 'CLASS_FULL' }
  }

  const classes = getClasses().map((currentClass) => {
    const currentStudents = currentClass.students || []

    if (currentClass.id === classId) {
      return {
        ...currentClass,
        students: currentStudents.includes(studentId)
          ? currentStudents
          : [...currentStudents, studentId],
        updatedAt: new Date().toISOString(),
      }
    }

    if (
      currentClass.subject === classItem.subject &&
      currentClass.level === classItem.level
    ) {
      return {
        ...currentClass,
        students: currentStudents.filter((currentStudentId) => {
          return currentStudentId !== studentId
        }),
        updatedAt: new Date().toISOString(),
      }
    }

    return currentClass
  })

  writeCollection(STORAGE_KEYS.classes, classes)
  const updatedClass = getClassById(classId)
  updateCourseAssignment(studentId, course.id, updatedClass)
  return { classItem: updatedClass, registration: getRegistrationById(studentId) }
}

export function removeStudentFromClass(studentId, classId) {
  const classItem = getClassById(classId)
  if (!classItem) {
    return { error: 'NOT_FOUND' }
  }

  updateClass(classId, {
    students: (classItem.students || []).filter((id) => id !== studentId),
  })

  const registration = getRegistrationById(studentId)
  ;(registration?.coursesWanted || []).forEach((course) => {
    if (course.assignedClassId === classId) {
      updateCourseAssignment(studentId, course.id, null)
    }
  })

  return { classItem: getClassById(classId) }
}

export function createClassFromPreGroup(key, options = {}) {
  const group = getPreGroupByKey(key)
  if (!group) {
    return null
  }

  const maxStudents = Number(options.maxStudents) || 15
  const selectedStudents = (options.students || group.students).slice(0, maxStudents)
  const newClass = addClass({
    name:
      options.name ||
      `${group.subject} ${group.level} ${group.publicType} ${group.availabilityType} ${group.preferredTime}`,
    subject: group.subject,
    level: group.level,
    publicType: group.publicType,
    availabilityType: group.availabilityType,
    days: options.days || [],
    day: (options.days || [])[0] || '',
    preferredTime: group.preferredTime,
    startTime: options.startTime || '',
    endTime: options.endTime || '',
    teacherId: options.teacherId || '',
    teacher: options.teacher || '',
    maxStudents,
    students: [],
    sourcePreGroupKey: key,
    creationMode: options.creationMode || 'Manuel',
  })

  selectedStudents.forEach(({ registration, course }) => {
    moveStudentToClass(registration.id, newClass.id, course.id)
  })

  return getClassById(newClass.id)
}

export function autoCreateClassesFromPreGroups(maxStudents = 15) {
  const createdClasses = []

  getPreGroups().forEach((group) => {
    const unassignedStudents = group.students.filter(({ course }) => {
      return course.assignmentStatus !== 'Affecté à une classe'
    })

    for (let index = 0; index < unassignedStudents.length; index += maxStudents) {
      const chunk = unassignedStudents.slice(index, index + maxStudents)
      const classNumber = Math.floor(index / maxStudents) + 1
      const createdClass = createClassFromPreGroup(group.key, {
        name: `${group.subject} ${group.level} ${group.publicType} ${group.availabilityType} ${group.preferredTime} - Classe ${classNumber}`,
        maxStudents,
        students: chunk,
        creationMode: 'Automatique',
      })
      if (createdClass) {
        createdClasses.push(createdClass)
      }
    }
  })

  return createdClasses
}

export function manualCreateClassFromStudents(classData, students = []) {
  const newClass = addClass({
    ...classData,
    students: [],
    creationMode: 'Manuel',
  })

  students.forEach(({ registrationId, courseId }) => {
    moveStudentToClass(registrationId, newClass.id, courseId)
  })

  return getClassById(newClass.id)
}

export function splitPreGroupIntoClasses(key, maxStudents = 15) {
  const group = getPreGroupByKey(key)
  if (!group) {
    return []
  }

  const createdClasses = []
  const students = group.students.filter(({ course }) => {
    return course.assignmentStatus !== 'Affecté à une classe'
  })

  for (let index = 0; index < students.length; index += maxStudents) {
    const createdClass = createClassFromPreGroup(key, {
      name: `${group.subject} ${group.level} ${group.publicType} - Classe ${
        Math.floor(index / maxStudents) + 1
      }`,
      maxStudents,
      students: students.slice(index, index + maxStudents),
      creationMode: 'Automatique',
    })
    if (createdClass) {
      createdClasses.push(createdClass)
    }
  }

  return createdClasses
}

export function addEvent(eventData) {
  const events = getEvents()
  const newEvent = {
    id: createId('event'),
    title: '',
    description: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    maxParticipants: '',
    status: 'Ouvert',
    createdAt: new Date().toISOString(),
    ...eventData,
  }

  writeCollection(STORAGE_KEYS.events, [newEvent, ...events])
  return newEvent
}

export function getEvents() {
  return readCollection(STORAGE_KEYS.events)
}

export function getEventById(id) {
  return getEvents().find((eventItem) => eventItem.id === id) || null
}

export function updateEvent(id, eventData) {
  let updatedEvent = null
  const events = getEvents().map((eventItem) => {
    if (eventItem.id !== id) {
      return eventItem
    }

    updatedEvent = {
      ...eventItem,
      ...eventData,
      updatedAt: new Date().toISOString(),
    }

    return updatedEvent
  })

  writeCollection(STORAGE_KEYS.events, events)
  return updatedEvent
}

export function deleteEvent(id) {
  const events = getEvents()
  const nextEvents = events.filter((eventItem) => eventItem.id !== id)
  const nextRegistrations = getEventRegistrations().filter((registration) => {
    return registration.eventId !== id
  })

  writeCollection(STORAGE_KEYS.events, nextEvents)
  writeCollection(STORAGE_KEYS.eventRegistrations, nextRegistrations)
  return nextEvents.length !== events.length
}

export function addEventRegistration(registrationData) {
  const registrations = getEventRegistrations()
  const newRegistration = {
    id: createId('event_registration'),
    eventId: '',
    firstName: '',
    lastName: '',
    age: '',
    createdAt: new Date().toISOString(),
    ...registrationData,
  }

  writeCollection(STORAGE_KEYS.eventRegistrations, [
    newRegistration,
    ...registrations,
  ])

  return newRegistration
}

export function getEventRegistrations() {
  return readCollection(STORAGE_KEYS.eventRegistrations)
}

export function getEventRegistrationsByEventId(eventId) {
  return getEventRegistrations().filter((registration) => {
    return registration.eventId === eventId
  })
}

export function deleteEventRegistration(id) {
  const registrations = getEventRegistrations()
  const nextRegistrations = registrations.filter((registration) => {
    return registration.id !== id
  })

  writeCollection(STORAGE_KEYS.eventRegistrations, nextRegistrations)
  return nextRegistrations.length !== registrations.length
}

export function addGalleryImage(imageData) {
  const images = getGalleryImages()
  const newImage = {
    id: createId('gallery_image'),
    title: '',
    description: '',
    category: 'Institut',
    imageUrl: '',
    createdAt: new Date().toISOString(),
    isPublished: true,
    ...imageData,
  }

  writeCollection(STORAGE_KEYS.galleryImages, [newImage, ...images])
  return newImage
}

export function getGalleryImages() {
  return readCollection(STORAGE_KEYS.galleryImages)
}

export function getGalleryImageById(id) {
  return getGalleryImages().find((image) => image.id === id) || null
}

export function updateGalleryImage(id, imageData) {
  let updatedImage = null
  const images = getGalleryImages().map((image) => {
    if (image.id !== id) {
      return image
    }

    updatedImage = {
      ...image,
      ...imageData,
      updatedAt: new Date().toISOString(),
    }

    return updatedImage
  })

  writeCollection(STORAGE_KEYS.galleryImages, images)
  return updatedImage
}

export function deleteGalleryImage(id) {
  const images = getGalleryImages()
  const nextImages = images.filter((image) => image.id !== id)

  writeCollection(STORAGE_KEYS.galleryImages, nextImages)
  return nextImages.length !== images.length
}

export function addUser(userData) {
  const users = getUsers()
  const newUser = {
    id: createId('user'),
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'teacher',
    assignedClassIds: [],
    createdAt: new Date().toISOString(),
    isActive: true,
    ...userData,
  }

  writeCollection(STORAGE_KEYS.users, [newUser, ...users])
  if (newUser.role === 'teacher') {
    syncClassAssignmentsForUser(newUser.id, newUser.assignedClassIds)
  }
  return newUser
}

export function getUsers() {
  const users = readCollection(STORAGE_KEYS.users)
  return users.length > 0 ? users : [DEFAULT_ADMIN]
}

export function getUserById(id) {
  return getUsers().find((user) => user.id === id) || null
}

export function getUserByEmail(email) {
  return (
    getUsers().find((user) => user.email.toLowerCase() === email.toLowerCase()) ||
    null
  )
}

export function updateUser(id, userData) {
  const existingUsers = readCollection(STORAGE_KEYS.users)
  const users = existingUsers.length > 0 ? existingUsers : [DEFAULT_ADMIN]
  let updatedUser = null
  const nextUsers = users.map((user) => {
    if (user.id !== id) {
      return user
    }

    updatedUser = {
      ...user,
      ...userData,
      assignedClassIds: userData.assignedClassIds || user.assignedClassIds || [],
      updatedAt: new Date().toISOString(),
    }
    return updatedUser
  })

  writeCollection(STORAGE_KEYS.users, nextUsers)
  if (updatedUser?.role === 'teacher') {
    syncClassAssignmentsForUser(updatedUser.id, updatedUser.assignedClassIds)
  }
  return updatedUser
}

export function deleteUser(id) {
  const users = getUsers()
  const nextUsers = users.filter((user) => user.id !== id)

  writeCollection(STORAGE_KEYS.users, nextUsers)
  syncClassAssignmentsForUser(id, [])
  return nextUsers.length !== users.length
}

export function authenticateUser(email, password) {
  const user = getUserByEmail(email)

  if (!user || !user.isActive || user.password !== password) {
    return null
  }

  return user
}

export function addStudentNote(noteData) {
  const notes = getStudentNotes()
  const newNote = {
    id: createId('student_note'),
    studentId: '',
    classId: '',
    teacherId: '',
    title: '',
    score: '',
    maxScore: '',
    appreciation: '',
    date: '',
    createdAt: new Date().toISOString(),
    ...noteData,
  }

  writeCollection(STORAGE_KEYS.studentNotes, [newNote, ...notes])
  return newNote
}

export function getStudentNotes() {
  return readCollection(STORAGE_KEYS.studentNotes)
}

export function getStudentNotesByStudentId(studentId) {
  return getStudentNotes().filter((note) => note.studentId === studentId)
}

export function getStudentNotesByClassId(classId) {
  return getStudentNotes().filter((note) => note.classId === classId)
}

export function updateStudentNote(id, noteData) {
  let updatedNote = null
  const notes = getStudentNotes().map((note) => {
    if (note.id !== id) {
      return note
    }

    updatedNote = { ...note, ...noteData, updatedAt: new Date().toISOString() }
    return updatedNote
  })

  writeCollection(STORAGE_KEYS.studentNotes, notes)
  return updatedNote
}

export function deleteStudentNote(id) {
  const notes = getStudentNotes()
  const nextNotes = notes.filter((note) => note.id !== id)
  writeCollection(STORAGE_KEYS.studentNotes, nextNotes)
  return nextNotes.length !== notes.length
}

export function addStudentGrade(gradeData) {
  const grades = getStudentGrades()
  const newGrade = {
    id: createId('student_grade'),
    studentId: '',
    studentName: '',
    classId: '',
    className: '',
    teacherId: '',
    subject: '',
    evaluationTitle: '',
    grade: '',
    maxGrade: '',
    coefficient: 1,
    appreciation: '',
    date: '',
    createdAt: new Date().toISOString(),
    updatedAt: '',
    ...gradeData,
  }

  writeCollection(STORAGE_KEYS.studentGrades, [newGrade, ...grades])
  return newGrade
}

export function getStudentGrades() {
  return readCollection(STORAGE_KEYS.studentGrades)
}

export function getStudentGradesByStudentId(studentId) {
  return getStudentGrades().filter((grade) => grade.studentId === studentId)
}

export function getStudentGradesByClassId(classId) {
  return getStudentGrades().filter((grade) => grade.classId === classId)
}

export function getStudentGradesByTeacherId(teacherId) {
  return getStudentGrades().filter((grade) => grade.teacherId === teacherId)
}

export function updateStudentGrade(id, gradeData) {
  let updatedGrade = null
  const grades = getStudentGrades().map((grade) => {
    if (grade.id !== id) {
      return grade
    }

    updatedGrade = {
      ...grade,
      ...gradeData,
      id: grade.id,
      createdAt: grade.createdAt,
      updatedAt: new Date().toISOString(),
    }

    return updatedGrade
  })

  writeCollection(STORAGE_KEYS.studentGrades, grades)
  return updatedGrade
}

export function deleteStudentGrade(id) {
  const grades = getStudentGrades()
  const nextGrades = grades.filter((grade) => grade.id !== id)
  writeCollection(STORAGE_KEYS.studentGrades, nextGrades)
  return nextGrades.length !== grades.length
}

export function addAttendance(attendanceData) {
  const attendance = getAttendance()
  const newAttendance = {
    id: createId('attendance'),
    studentId: '',
    classId: '',
    teacherId: '',
    date: '',
    status: 'Présent',
    comment: '',
    createdAt: new Date().toISOString(),
    ...attendanceData,
  }

  writeCollection(STORAGE_KEYS.attendance, [newAttendance, ...attendance])
  return newAttendance
}

export function getAttendance() {
  return readCollection(STORAGE_KEYS.attendance)
}

export function getAttendanceByClassId(classId) {
  return getAttendance().filter((entry) => entry.classId === classId)
}

export function getAttendanceByStudentId(studentId) {
  return getAttendance().filter((entry) => entry.studentId === studentId)
}

export function updateAttendance(id, attendanceData) {
  let updatedAttendance = null
  const attendance = getAttendance().map((entry) => {
    if (entry.id !== id) {
      return entry
    }

    updatedAttendance = {
      ...entry,
      ...attendanceData,
      updatedAt: new Date().toISOString(),
    }
    return updatedAttendance
  })

  writeCollection(STORAGE_KEYS.attendance, attendance)
  return updatedAttendance
}

export function deleteAttendance(id) {
  const attendance = getAttendance()
  const nextAttendance = attendance.filter((entry) => entry.id !== id)
  writeCollection(STORAGE_KEYS.attendance, nextAttendance)
  return nextAttendance.length !== attendance.length
}
