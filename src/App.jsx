import { useState } from 'react'
import {
  Link,
  Navigate,
  NavLink,
  Outlet,
  Route,
  Routes,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import {
  addEvent,
  addGalleryImage,
  addAttendance,
  addStudentGrade,
  addStudentNote,
  authenticateUser,
  deleteEvent,
  deleteGalleryImage,
  deleteAttendance,
  deleteStudentGrade,
  deleteStudentNote,
  getAttendanceByStudentId,
  getClasses,
  getEvents,
  getEventRegistrations,
  getGalleryImages,
  getRegistrations as getLocalRegistrations,
  getTeacherSchedule,
  getStudentNotesByStudentId,
  getStudentGradesByClassId,
  getStudentGradesByStudentId,
  getStudentGradesByTeacherId,
  getUsers,
  updateEvent,
  updateGalleryImage,
  updateStudentGrade,
  updateStudentNote,
} from './data/storage'
import { getSubjectColor, subjectColors } from './config/subjectColors'
import {
  AboutPage,
  ContactPage,
  EventsPublicPage,
  FAQPage,
  FormationsPage,
  GalleryPublicPage,
  HomePage,
  InscriptionPage,
  PublicLayout,
} from './pages/PublicPages'
import {
  clearUserSession,
  createUserSession,
  dayOptions,
  emptyAttendanceForm,
  emptyEventForm,
  emptyGalleryForm,
  emptyGradeForm,
  emptyNoteForm,
  galleryCategories,
  getCurrentUser,
  personalFields,
  readFileAsDataUrl,
  scheduleEndHour,
  scheduleHours,
  scheduleRowHeight,
  scheduleStartHour,
  userIsAuthenticated,
} from './shared/appShared'
import './App.css'

const adminNavItems = [
  { label: 'Tableau de bord', path: '/admin/dashboard' },
  { label: 'Actualités / Événements', path: '/admin/events' },
  { label: 'Galerie', path: '/admin/gallery' },
]

function ProtectedRoute({ allowedRole }) {
  const session = getCurrentUser()

  if (!session?.isAuthenticated) {
    return <Navigate replace to="/admin/login" />
  }

  if (allowedRole && session.role !== allowedRole) {
    return (
      <Navigate
        replace
        to={session.role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard'}
      />
    )
  }

  return <Outlet />
}

function AdminSidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    clearUserSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="admin-sidebar">
      <Link className="admin-brand" to="/admin/dashboard">
        ISH Admin
      </Link>
      <nav aria-label="Navigation admin">
        {adminNavItems.map((item) => (
          <NavLink key={item.path} to={item.path}>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <button className="admin-logout-button" onClick={handleLogout} type="button">
        Déconnexion
      </button>
      <Link className="admin-back-link" to="/">
        Retour au site
      </Link>
    </aside>
  )
}

function AdminLayout() {
  return (
    <main className="admin-page">
      <AdminSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>Espace administrateur</span>
            <strong>ISH Orléans</strong>
          </div>
          <Link to="/">Voir le site public</Link>
        </header>
        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </main>
  )
}

function AdminPageHeader({ title, description }) {
  return (
    <div className="admin-heading">
      <p className="section-kicker">Administration</p>
      <h1>{title}</h1>
      <p>{description}</p>
    </div>
  )
}

function formatDate(date) {
  if (!date) {
    return '-'
  }

  return new Date(date).toLocaleDateString('fr-FR')
}

function Login() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  function handleLogin(event) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const email = String(formData.get('admin-email') || '').trim()
    const password = String(formData.get('admin-password') || '')
    const user = authenticateUser(email, password)

    if (!user) {
      setErrorMessage('Email ou mot de passe incorrect.')
      return
    }

    createUserSession(user)
    navigate(user.role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard', {
      replace: true,
    })
  }

  if (userIsAuthenticated()) {
    const session = getCurrentUser()
    return (
      <Navigate
        replace
        to={session.role === 'teacher' ? '/teacher/dashboard' : '/admin/dashboard'}
      />
    )
  }

  return (
    <main className="admin-login-page">
      <form className="admin-login-card" onSubmit={handleLogin}>
        <Link className="brand" to="/">
          <span className="brand-mark">ISH</span>
          <span>ISH Orléans</span>
        </Link>
        <div>
          <p className="section-kicker">Administration</p>
          <h1>Connexion admin</h1>
          <p>Accédez à l’espace de gestion de l’ISH Orléans.</p>
        </div>
        {errorMessage ? (
          <div className="login-error" role="alert">
            {errorMessage}
          </div>
        ) : null}
        <label className="form-field" htmlFor="admin-email">
          <span>Email</span>
          <input id="admin-email" name="admin-email" type="email" />
        </label>
        <label className="form-field" htmlFor="admin-password">
          <span>Mot de passe</span>
          <input id="admin-password" name="admin-password" type="password" />
        </label>
        <button className="btn btn-primary submit-btn" type="submit">
          Se connecter
        </button>
      </form>
    </main>
  )
}

function getSessionUser() {
  return getCurrentUser()?.currentUser || null
}

function classesForTeacher(teacherId) {
  const user = getUsers().find((currentUser) => currentUser.id === teacherId)
  const assignedClassIds = user?.assignedClassIds || []
  return getClasses().filter((classItem) => assignedClassIds.includes(classItem.id))
}

function studentsForClassById(classId) {
  const classItem = getClasses().find((currentClass) => currentClass.id === classId)
  return (classItem?.students || [])
    .map((studentId) =>
      getLocalRegistrations().find((registration) => registration.id === studentId),
    )
    .filter(Boolean)
}

function studentDisplayName(student) {
  const info = student?.personalInformation || {}
  return `${info.Prénom || ''} ${info.Nom || ''}`.trim() || 'Élève'
}

function calculateGradeAverage(grades) {
  const weightedGrades = grades.reduce(
    (result, grade) => {
      const score = Number(grade.grade)
      const maxScore = Number(grade.maxGrade)
      const coefficient = Number(grade.coefficient) || 1

      if (!Number.isFinite(score) || !Number.isFinite(maxScore) || maxScore <= 0) {
        return result
      }

      return {
        total: result.total + (score / maxScore) * 20 * coefficient,
        coefficients: result.coefficients + coefficient,
      }
    },
    { total: 0, coefficients: 0 },
  )

  if (weightedGrades.coefficients === 0) {
    return null
  }

  return weightedGrades.total / weightedGrades.coefficients
}

function formatAverage(grades) {
  const average = calculateGradeAverage(grades)
  return average === null ? 'Aucune note pour le moment.' : `Moyenne : ${average.toFixed(1).replace('.', ',')} / 20`
}

function teacherCanAccessStudentClass(teacherId, classId, studentId) {
  return classesForTeacher(teacherId).some((classItem) => {
    return classItem.id === classId && (classItem.students || []).includes(studentId)
  })
}

function classDays(classItem) {
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

function teacherNameForClass(classItem) {
  return classItem.teacherName || classItem.teacher || '-'
}

function nextScheduledClass(entries) {
  const todayIndex = new Date().getDay()
  const frenchDayIndex = todayIndex === 0 ? 6 : todayIndex - 1

  return [...entries]
    .filter((entry) => entry.startTime)
    .sort((first, second) => {
      const firstDistance =
        (dayOptions.indexOf(first.day) - frenchDayIndex + 7) % 7
      const secondDistance =
        (dayOptions.indexOf(second.day) - frenchDayIndex + 7) % 7

      if (firstDistance !== secondDistance) {
        return firstDistance - secondDistance
      }

      return String(first.startTime).localeCompare(String(second.startTime))
    })[0]
}

function timeToMinutes(time) {
  const [hours = '0', minutes = '0'] = String(time || '').split(':')
  return Number(hours) * 60 + Number(minutes)
}

function scheduleBlockStyle(entry) {
  const startMinutes = Math.max(timeToMinutes(entry.startTime), scheduleStartHour * 60)
  const endMinutes = Math.min(timeToMinutes(entry.endTime), scheduleEndHour * 60)
  const top = ((startMinutes - scheduleStartHour * 60) / 60) * scheduleRowHeight
  const height = Math.max(((endMinutes - startMinutes) / 60) * scheduleRowHeight, 54)
  const color = getSubjectColor(entry.subject)

  return {
    top: `${top}px`,
    height: `${height}px`,
    background: color.background,
    borderColor: color.border,
    color: color.text,
  }
}

function SubjectLegend() {
  return (
    <div className="subject-legend" aria-label="Légende des matières">
      {Object.entries(subjectColors).map(([subject, color]) => (
        <span key={subject}>
          <i style={{ background: color.background, borderColor: color.border }} />
          {subject}
        </span>
      ))}
    </div>
  )
}

function ScheduleBlock({ entry, onSelect }) {
  return (
    <button
      className="schedule-block"
      onClick={() => onSelect?.(entry)}
      style={scheduleBlockStyle(entry)}
      type="button"
    >
      <strong>{entry.name || 'Classe sans nom'}</strong>
      <span>{entry.subject || '-'} · {entry.level || '-'}</span>
      <span>
        {entry.startTime || '--:--'} - {entry.endTime || '--:--'}
      </span>
      <span>Prof. {teacherNameForClass(entry)}</span>
      {entry.room ? <span>Salle {entry.room}</span> : null}
    </button>
  )
}

function ScheduleGrid({ entries, onSelect }) {
  return (
    <div className="school-schedule-wrap">
      <div className="school-schedule-grid">
        <div className="schedule-corner">Horaires</div>
        {dayOptions.map((day) => (
          <div className="schedule-day-head" key={day}>{day}</div>
        ))}
        <div className="schedule-time-column">
          {scheduleHours.map((hour) => (
            <div className="schedule-time-slot" key={hour}>
              {String(hour).padStart(2, '0')}:00 - {String(hour + 1).padStart(2, '0')}:00
            </div>
          ))}
        </div>
        {dayOptions.map((day) => {
          const dayEntries = entries.filter((entry) => {
            return entry.day === day && entry.startTime && entry.endTime
          })

          return (
            <div
              className="schedule-day-body"
              key={day}
              style={{ minHeight: `${scheduleHours.length * scheduleRowHeight}px` }}
            >
              {scheduleHours.map((hour) => (
                <div
                  className="schedule-grid-line"
                  key={hour}
                  style={{ top: `${(hour - scheduleStartHour) * scheduleRowHeight}px` }}
                />
              ))}
              {dayEntries.map((entry) => (
                <ScheduleBlock entry={entry} key={`${entry.id}-${day}`} onSelect={onSelect} />
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ScheduleDetailsModal({
  canEdit = false,
  entry,
  onClose,
  onEdit,
  showClassLink = false,
}) {
  if (!entry) {
    return null
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="schedule-details-title"
        aria-modal="true"
        className="registration-modal schedule-edit-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="section-kicker">Cours planifié</p>
            <h2 id="schedule-details-title">{entry.name}</h2>
          </div>
          <button onClick={onClose} type="button">Fermer</button>
        </div>
        <section className="detail-block">
          <dl>
            <div><dt>Matière</dt><dd>{entry.subject || '-'}</dd></div>
            <div><dt>Niveau</dt><dd>{entry.level || '-'}</dd></div>
            <div><dt>Public</dt><dd>{entry.publicType || '-'}</dd></div>
            <div><dt>Professeur</dt><dd>{teacherNameForClass(entry)}</dd></div>
            <div><dt>Jours</dt><dd>{classDays(entry).join(', ') || entry.day || '-'}</dd></div>
            <div><dt>Horaire</dt><dd>{entry.startTime || '--:--'} - {entry.endTime || '--:--'}</dd></div>
            <div><dt>Salle</dt><dd>{entry.room || '-'}</dd></div>
            <div><dt>Élèves</dt><dd>{(entry.students || []).length} / {entry.maxStudents || '∞'}</dd></div>
          </dl>
        </section>
        <div className="modal-actions">
          {canEdit ? (
            <button className="btn btn-primary" onClick={() => onEdit?.(entry)} type="button">
              Modifier l’horaire
            </button>
          ) : null}
          {showClassLink ? (
            <Link className="btn btn-primary" to={`/teacher/classes/${entry.id}`}>
              Voir la classe
            </Link>
          ) : null}
        </div>
      </section>
    </div>
  )
}

function TeacherSidebar() {
  const navigate = useNavigate()

  function handleLogout() {
    clearUserSession()
    navigate('/admin/login', { replace: true })
  }

  return (
    <aside className="teacher-sidebar">
      <Link className="admin-brand" to="/teacher/dashboard">
        ISH Professeur
      </Link>
      <nav aria-label="Navigation professeur">
        <NavLink to="/teacher/dashboard">Tableau de bord</NavLink>
        <NavLink to="/teacher/classes">Mes classes</NavLink>
        <NavLink to="/teacher/schedule">Mon emploi du temps</NavLink>
        <NavLink to="/teacher/grades">Notes</NavLink>
      </nav>
      <button className="admin-logout-button" onClick={handleLogout} type="button">
        Déconnexion
      </button>
    </aside>
  )
}

function TeacherLayout() {
  const user = getSessionUser()
  return (
    <main className="teacher-page">
      <TeacherSidebar />
      <div className="admin-main">
        <header className="admin-topbar">
          <div>
            <span>Espace professeur</span>
            <strong>{user ? `${user.firstName} ${user.lastName}` : 'Professeur'}</strong>
          </div>
          <Link to="/">Voir le site public</Link>
        </header>
        <section className="admin-content">
          <Outlet />
        </section>
      </div>
    </main>
  )
}

function TeacherDashboard() {
  const user = getSessionUser()
  const assignedClasses = classesForTeacher(user?.id)
  const teacherSchedule = getTeacherSchedule(user?.id)
  const nextClass = nextScheduledClass(teacherSchedule)
  const studentCount = assignedClasses.reduce(
    (total, classItem) => total + (classItem.students?.length || 0),
    0,
  )

  return (
    <>
      <AdminPageHeader
        title={`Bonjour ${user?.firstName || ''}`}
        description="Retrouvez vos classes, vos élèves et vos prochains cours."
      />
      <div className="admin-card-grid">
        <article className="admin-card">
          <span>Classes assignées</span>
          <strong>{assignedClasses.length}</strong>
          <p>Groupes visibles dans votre espace.</p>
        </article>
        <article className="admin-card">
          <span>Élèves</span>
          <strong>{studentCount}</strong>
          <p>Total des élèves dans vos classes.</p>
        </article>
        <article className="admin-card">
          <span>Prochains cours</span>
          <strong>{teacherSchedule.length}</strong>
          <p>Classes avec un jour planifié.</p>
        </article>
      </div>
      <section className="admin-quick-actions">
        <div>
          <p className="section-kicker">Mon prochain cours</p>
          <h2>{nextClass ? nextClass.name : 'Votre emploi du temps n’est pas encore défini.'}</h2>
          {nextClass ? (
            <p>
              {nextClass.day} · {nextClass.startTime || '--:--'} -{' '}
              {nextClass.endTime || '--:--'} · Salle {nextClass.room || '-'}
            </p>
          ) : null}
        </div>
        <Link className="btn btn-primary submit-btn" to="/teacher/schedule">
          Voir mon emploi du temps
        </Link>
      </section>
      <section className="admin-quick-actions">
        <div>
          <p className="section-kicker">Accès rapide</p>
          <h2>Vos cours</h2>
        </div>
        <div className="quick-action-grid">
          <Link className="quick-action-card" to="/teacher/classes">
            <span>Voir mes classes</span>
            <strong>Accéder aux élèves et au suivi</strong>
          </Link>
        </div>
      </section>
    </>
  )
}

function TeacherSchedulePage() {
  const user = getSessionUser()
  const entries = getTeacherSchedule(user?.id)
  const assignedClasses = classesForTeacher(user?.id)
  const studentCount = assignedClasses.reduce(
    (total, classItem) => total + (classItem.students?.length || 0),
    0,
  )
  const nextClass = nextScheduledClass(entries)
  const [selectedEntry, setSelectedEntry] = useState(null)

  return (
    <>
      <AdminPageHeader
        title="Mon emploi du temps"
        description="Retrouvez vos classes, horaires et élèves assignés."
      />
      <div className="admin-card-grid">
        <article className="admin-card">
          <span>Classes assignées</span>
          <strong>{assignedClasses.length}</strong>
          <p>Uniquement vos groupes.</p>
        </article>
        <article className="admin-card">
          <span>Élèves</span>
          <strong>{studentCount}</strong>
          <p>Total dans vos classes.</p>
        </article>
        <article className="admin-card">
          <span>Prochain cours</span>
          <strong>{nextClass ? nextClass.day : '-'}</strong>
          <p>
            {nextClass
              ? `${nextClass.name} · ${nextClass.startTime || '--:--'}`
              : 'Votre emploi du temps n’est pas encore défini.'}
          </p>
        </article>
      </div>
      <SubjectLegend />
      <ScheduleGrid entries={entries} onSelect={setSelectedEntry} />
      <ScheduleDetailsModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        showClassLink
      />
    </>
  )
}

function StudentGradesModal({ classItem, onClose, student, teacher }) {
  const [grades, setGrades] = useState(() =>
    getStudentGradesByStudentId(student.id).filter((grade) => {
      return grade.classId === classItem.id
    }),
  )
  const [gradeForm, setGradeForm] = useState(emptyGradeForm)
  const [editingGradeId, setEditingGradeId] = useState(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const latestGrade = grades[0]
  const average = calculateGradeAverage(grades)

  function refreshGrades() {
    setGrades(
      getStudentGradesByStudentId(student.id).filter((grade) => {
        return grade.classId === classItem.id
      }),
    )
  }

  function updateGradeField(event) {
    const { name, value } = event.currentTarget
    setGradeForm((current) => ({ ...current, [name]: value }))
  }

  function resetGradeForm() {
    setGradeForm(emptyGradeForm)
    setEditingGradeId(null)
  }

  function validateGradeForm() {
    const grade = Number(gradeForm.grade)
    const maxGrade = Number(gradeForm.maxGrade)

    if (!gradeForm.evaluationTitle.trim()) {
      return 'Le titre de l’évaluation est obligatoire.'
    }

    if (!gradeForm.date) {
      return 'La date est obligatoire.'
    }

    if (!Number.isFinite(maxGrade) || maxGrade <= 0) {
      return 'La note maximale doit être supérieure à 0.'
    }

    if (!Number.isFinite(grade) || grade > maxGrade) {
      return 'La note obtenue ne peut pas être supérieure à la note maximale.'
    }

    return ''
  }

  function handleGradeSubmit(event) {
    event.preventDefault()
    setError('')
    setMessage('')

    if (!teacherCanAccessStudentClass(teacher.id, classItem.id, student.id)) {
      setError('Accès refusé pour cet élève.')
      return
    }

    const validationError = validateGradeForm()
    if (validationError) {
      setError(validationError)
      return
    }

    const payload = {
      ...gradeForm,
      studentId: student.id,
      studentName: studentDisplayName(student),
      classId: classItem.id,
      className: classItem.name,
      teacherId: teacher.id,
      subject: classItem.subject,
      grade: Number(gradeForm.grade),
      maxGrade: Number(gradeForm.maxGrade),
      coefficient: Number(gradeForm.coefficient) || 1,
    }

    if (editingGradeId) {
      const existingGrade = grades.find((grade) => grade.id === editingGradeId)
      if (existingGrade?.teacherId !== teacher.id) {
        setError('Vous ne pouvez modifier que les notes que vous avez créées.')
        return
      }
      updateStudentGrade(editingGradeId, payload)
      setMessage('La note a bien été modifiée.')
    } else {
      addStudentGrade(payload)
      setMessage('La note a bien été ajoutée.')
    }

    resetGradeForm()
    refreshGrades()
  }

  function handleEditGrade(grade) {
    if (grade.teacherId !== teacher.id) {
      setError('Vous ne pouvez modifier que les notes que vous avez créées.')
      return
    }

    setEditingGradeId(grade.id)
    setGradeForm({
      evaluationTitle: grade.evaluationTitle || '',
      grade: String(grade.grade || ''),
      maxGrade: String(grade.maxGrade || '20'),
      coefficient: String(grade.coefficient || '1'),
      date: grade.date || '',
      appreciation: grade.appreciation || '',
    })
  }

  function handleDeleteGrade(grade) {
    if (grade.teacherId !== teacher.id) {
      setError('Vous ne pouvez supprimer que les notes que vous avez créées.')
      return
    }

    deleteStudentGrade(grade.id)
    refreshGrades()
    setMessage('La note a bien été supprimée.')
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="student-grades-title"
        aria-modal="true"
        className="registration-modal grades-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="section-kicker">Notes élève</p>
            <h2 id="student-grades-title">{studentDisplayName(student)}</h2>
            <p>{classItem.name} · {classItem.subject}</p>
          </div>
          <button onClick={onClose} type="button">Fermer</button>
        </div>

        <div className="grade-summary-grid">
          <article className="grade-average-card">
            <span>Moyenne de l’élève</span>
            <strong>
              {average === null ? 'Aucune note' : `${average.toFixed(1).replace('.', ',')} / 20`}
            </strong>
          </article>
          <article><span>Évaluations</span><strong>{grades.length}</strong></article>
          <article><span>Dernière note</span><strong>{latestGrade ? `${latestGrade.grade}/${latestGrade.maxGrade}` : '-'}</strong></article>
        </div>

        {message ? <div className="success-message assignment-message">{message}</div> : null}
        {error ? <div className="login-error assignment-message">{error}</div> : null}

        <div className="grades-workspace">
        <form className="grade-quick-form" onSubmit={handleGradeSubmit}>
          <div className="grade-panel-header">
            <div>
              <p className="section-kicker">{editingGradeId ? 'Modification' : 'Ajout rapide'}</p>
              <h2>{editingGradeId ? 'Modifier la note' : 'Ajouter une note'}</h2>
            </div>
            {editingGradeId ? <span className="status-pill">Édition</span> : null}
          </div>
          <div className="grade-form-grid">
            <label className="form-field"><span>Titre de l’évaluation</span><input name="evaluationTitle" onChange={updateGradeField} required value={gradeForm.evaluationTitle} /></label>
            <label className="form-field"><span>Note obtenue</span><input min="0" name="grade" onChange={updateGradeField} type="number" step="0.25" value={gradeForm.grade} /></label>
            <label className="form-field"><span>Note maximale</span><input min="1" name="maxGrade" onChange={updateGradeField} type="number" step="0.25" value={gradeForm.maxGrade} /></label>
            <label className="form-field"><span>Coefficient</span><input min="0.1" name="coefficient" onChange={updateGradeField} type="number" step="0.1" value={gradeForm.coefficient} /></label>
            <label className="form-field"><span>Date</span><input name="date" onChange={updateGradeField} required type="date" value={gradeForm.date} /></label>
            <label className="form-field field-wide"><span>Appréciation / commentaire</span><textarea name="appreciation" onChange={updateGradeField} value={gradeForm.appreciation} /></label>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" type="submit">Enregistrer la note</button>
            <button onClick={resetGradeForm} type="button">Annuler</button>
          </div>
        </form>

        <section className="grade-history-panel">
          <div className="grade-panel-header">
            <div>
              <p className="section-kicker">Historique</p>
              <h2>Notes enregistrées</h2>
            </div>
          </div>
        <div className="admin-table-wrap grade-history-table">
          <table className="admin-table">
            <thead><tr><th>Date</th><th>Évaluation</th><th>Note</th><th>Coefficient</th><th>Appréciation</th><th>Actions</th></tr></thead>
            <tbody>
              {grades.length === 0 ? (
                <tr><td colSpan="6">Aucune note pour le moment.</td></tr>
              ) : grades.map((grade) => (
                <tr key={grade.id}>
                  <td>{formatDate(grade.date)}</td>
                  <td>{grade.evaluationTitle}</td>
                  <td>{grade.grade} / {grade.maxGrade}</td>
                  <td>{grade.coefficient || 1}</td>
                  <td>{grade.appreciation || '-'}</td>
                  <td><div className="table-actions"><button onClick={() => handleEditGrade(grade)} type="button">Modifier</button><button className="danger-action" onClick={() => handleDeleteGrade(grade)} type="button">Supprimer</button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </section>
        </div>
      </section>
    </div>
  )
}

function TeacherClasses() {
  const user = getSessionUser()
  const assignedClasses = classesForTeacher(user?.id)

  return (
    <>
      <AdminPageHeader
        title="Mes classes"
        description="Vous voyez uniquement les classes qui vous sont assignées."
      />
      {assignedClasses.length === 0 ? (
        <div className="admin-empty-state">
          <h2>Aucune classe assignée</h2>
          <p>Contactez l’administration si une classe devrait apparaître ici.</p>
        </div>
      ) : (
        <div className="classes-grid">
          {assignedClasses.map((classItem) => (
            <article className="class-card" key={classItem.id}>
              <div className="class-card-header">
                <div>
                  <span>{classItem.subject}</span>
                  <h2>{classItem.name}</h2>
                  <p>{classItem.publicType} · Niveau {classItem.level || '-'}</p>
                </div>
                <strong>{classItem.students?.length || 0}</strong>
              </div>
              <dl className="class-meta">
                <div><dt>Jours</dt><dd>{classDays(classItem).join(', ') || '-'}</dd></div>
                <div><dt>Heure</dt><dd>{classItem.startTime || '--:--'} - {classItem.endTime || '--:--'}</dd></div>
                <div><dt>Public</dt><dd>{classItem.publicType || '-'}</dd></div>
                <div><dt>Salle</dt><dd>{classItem.room || '-'}</dd></div>
                <div><dt>Élèves</dt><dd>{classItem.students?.length || 0}</dd></div>
              </dl>
              <Link className="btn btn-primary submit-btn" to={`/teacher/classes/${classItem.id}`}>Voir la classe</Link>
            </article>
          ))}
        </div>
      )}
    </>
  )
}

function TeacherClassDetails() {
  const { id } = useParams()
  const user = getSessionUser()
  const classItem = classesForTeacher(user?.id).find((item) => item.id === id)
  const [selectedGradeStudent, setSelectedGradeStudent] = useState(null)

  if (!classItem) {
    return <div className="admin-empty-state"><h2>Accès refusé</h2><p>Cette classe ne vous est pas assignée.</p></div>
  }

  const students = studentsForClassById(classItem.id)

  return (
    <>
      <AdminPageHeader title={classItem.name} description={`${classItem.subject} · Niveau ${classItem.level || '-'}`} />
      <div className="class-card">
        <dl className="class-meta">
          <div><dt>Matière</dt><dd>{classItem.subject}</dd></div>
          <div><dt>Jours</dt><dd>{classDays(classItem).join(', ') || '-'}</dd></div>
          <div><dt>Heure</dt><dd>{classItem.startTime || '--:--'} - {classItem.endTime || '--:--'}</dd></div>
          <div><dt>Salle</dt><dd>{classItem.room || '-'}</dd></div>
          <div><dt>Élèves</dt><dd>{students.length}</dd></div>
        </dl>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Nom</th><th>Prénom</th><th>Âge</th><th>Téléphone</th><th>Email</th><th>Statut</th><th>Notes</th><th>Action</th></tr></thead>
          <tbody>
            {students.map((student) => {
              const info = student.personalInformation || {}
              const gradeCount = getStudentGradesByClassId(classItem.id).filter((grade) => {
                return grade.studentId === student.id
              }).length
              return (
                <tr key={student.id}>
                  <td>{info.Nom || '-'}</td>
                  <td>{info.Prénom || '-'}</td>
                  <td>{info.Âge || '-'}</td>
                  <td>{info['Téléphone portable 1'] || '-'}</td>
                  <td>{info.Email || '-'}</td>
                  <td>{student.status}</td>
                  <td><button className="grade-manage-button" onClick={() => setSelectedGradeStudent(student)} type="button"><strong>Notes</strong><span>{gradeCount}</span></button></td>
                  <td><Link to={`/teacher/students/${student.id}`}>Voir / noter</Link></td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      {selectedGradeStudent ? (
        <StudentGradesModal
          classItem={classItem}
          onClose={() => setSelectedGradeStudent(null)}
          student={selectedGradeStudent}
          teacher={user}
        />
      ) : null}
    </>
  )
}

function TeacherStudentDetails() {
  const { id } = useParams()
  const user = getSessionUser()
  const assignedClasses = classesForTeacher(user?.id)
  const studentClass = assignedClasses.find((classItem) =>
    (classItem.students || []).includes(id),
  )
  const student = getLocalRegistrations().find((registration) => registration.id === id)
  const [noteForm, setNoteForm] = useState(emptyNoteForm)
  const [attendanceForm, setAttendanceForm] = useState(emptyAttendanceForm)
  const [notes, setNotes] = useState(() => getStudentNotesByStudentId(id))
  const [attendance, setAttendance] = useState(() => getAttendanceByStudentId(id))
  const studentGrades = studentClass
    ? getStudentGradesByStudentId(id).filter((grade) => grade.classId === studentClass.id)
    : []

  if (!student || !studentClass) {
    return <div className="admin-empty-state"><h2>Accès refusé</h2><p>Cet élève n’appartient pas à vos classes.</p></div>
  }

  function refreshStudentTracking() {
    setNotes(getStudentNotesByStudentId(id))
    setAttendance(getAttendanceByStudentId(id))
  }

  function handleNoteSubmit(event) {
    event.preventDefault()
    addStudentNote({ ...noteForm, studentId: id, classId: studentClass.id, teacherId: user.id })
    setNoteForm(emptyNoteForm)
    refreshStudentTracking()
  }

  function handleAttendanceSubmit(event) {
    event.preventDefault()
    addAttendance({ ...attendanceForm, studentId: id, classId: studentClass.id, teacherId: user.id })
    setAttendanceForm(emptyAttendanceForm)
    refreshStudentTracking()
  }

  const info = student.personalInformation || {}

  return (
    <>
      <AdminPageHeader title={`${info.Prénom || ''} ${info.Nom || ''}`} description={`Classe : ${studentClass.name}`} />
      <div className="modal-section-grid">
        <section className="detail-block"><h3>Informations élève</h3><dl>{personalFields.slice(0, 14).map((field) => <div key={field}><dt>{field}</dt><dd>{info[field] || '-'}</dd></div>)}</dl></section>
        <section className="detail-block"><h3>Ajouter une note</h3><form className="teacher-mini-form" onSubmit={handleNoteSubmit}>
          <input placeholder="Titre" value={noteForm.title} onChange={(event) => setNoteForm((current) => ({ ...current, title: event.currentTarget.value }))} />
          <input placeholder="Note obtenue" value={noteForm.score} onChange={(event) => setNoteForm((current) => ({ ...current, score: event.currentTarget.value }))} />
          <input placeholder="Note maximale" value={noteForm.maxScore} onChange={(event) => setNoteForm((current) => ({ ...current, maxScore: event.currentTarget.value }))} />
          <input type="date" value={noteForm.date} onChange={(event) => setNoteForm((current) => ({ ...current, date: event.currentTarget.value }))} />
          <textarea placeholder="Appréciation" value={noteForm.appreciation} onChange={(event) => setNoteForm((current) => ({ ...current, appreciation: event.currentTarget.value }))} />
          <button className="btn btn-primary submit-btn" type="submit">Ajouter la note</button>
        </form></section>
      </div>
      <section className="detail-block"><h3>Présence</h3><form className="teacher-mini-form" onSubmit={handleAttendanceSubmit}>
        <input type="date" value={attendanceForm.date} onChange={(event) => setAttendanceForm((current) => ({ ...current, date: event.currentTarget.value }))} />
        <select value={attendanceForm.status} onChange={(event) => setAttendanceForm((current) => ({ ...current, status: event.currentTarget.value }))}><option>Présent</option><option>Absent</option><option>Retard</option></select>
        <input placeholder="Commentaire" value={attendanceForm.comment} onChange={(event) => setAttendanceForm((current) => ({ ...current, comment: event.currentTarget.value }))} />
        <button className="btn btn-primary submit-btn" type="submit">Ajouter la présence</button>
      </form></section>
      <section className="detail-block"><h3>Historique des notes</h3>{notes.map((note) => <p key={note.id}><strong>{note.title}</strong> · {note.score}/{note.maxScore} · {note.date} <button onClick={() => { const appreciation = prompt('Nouvelle appréciation', note.appreciation); if (appreciation !== null) { updateStudentNote(note.id, { appreciation }); refreshStudentTracking() } }} type="button">Modifier</button> <button onClick={() => { deleteStudentNote(note.id); refreshStudentTracking() }} type="button">Supprimer</button></p>)}</section>
      <section className="detail-block">
        <h3>Notes</h3>
        <p><strong>{formatAverage(studentGrades)}</strong></p>
        {studentGrades.length === 0 ? (
          <p>Aucune note pour le moment.</p>
        ) : (
          <div className="admin-table-wrap compact-table">
            <table className="admin-table">
              <thead><tr><th>Date</th><th>Évaluation</th><th>Note</th><th>Appréciation</th></tr></thead>
              <tbody>
                {studentGrades.map((grade) => (
                  <tr key={grade.id}><td>{formatDate(grade.date)}</td><td>{grade.evaluationTitle}</td><td>{grade.grade}/{grade.maxGrade}</td><td>{grade.appreciation || '-'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <section className="detail-block"><h3>Historique de présence</h3>{attendance.map((entry) => <p key={entry.id}><strong>{entry.status}</strong> · {entry.date} · {entry.comment} <button onClick={() => { deleteAttendance(entry.id); refreshStudentTracking() }} type="button">Supprimer</button></p>)}</section>
    </>
  )
}

function TeacherGradesPage() {
  const user = getSessionUser()
  const assignedClasses = classesForTeacher(user?.id)
  const allowedClassIds = assignedClasses.map((classItem) => classItem.id)
  const [grades, setGrades] = useState(() =>
    getStudentGradesByTeacherId(user?.id).filter((grade) =>
      allowedClassIds.includes(grade.classId),
    ),
  )
  const [classFilter, setClassFilter] = useState('Toutes')
  const [studentFilter, setStudentFilter] = useState('')
  const [dateFilter, setDateFilter] = useState('')
  const [subjectFilter, setSubjectFilter] = useState('Toutes')

  function refreshGrades() {
    setGrades(
      getStudentGradesByTeacherId(user?.id).filter((grade) =>
        allowedClassIds.includes(grade.classId),
      ),
    )
  }

  function handleEditGrade(grade) {
    if (grade.teacherId !== user.id) {
      return
    }

    const nextValue = prompt('Nouvelle note obtenue', String(grade.grade))
    if (nextValue === null) {
      return
    }

    const nextGrade = Number(nextValue)
    if (!Number.isFinite(nextGrade) || nextGrade > Number(grade.maxGrade)) {
      alert('La note obtenue ne peut pas être supérieure à la note maximale.')
      return
    }

    const appreciation = prompt('Appréciation', grade.appreciation || '')
    updateStudentGrade(grade.id, {
      grade: nextGrade,
      appreciation: appreciation ?? grade.appreciation,
    })
    refreshGrades()
  }

  function handleDeleteGrade(grade) {
    if (grade.teacherId !== user.id) {
      return
    }

    deleteStudentGrade(grade.id)
    refreshGrades()
  }

  const subjects = ['Toutes', ...new Set(grades.map((grade) => grade.subject).filter(Boolean))]
  const filteredGrades = grades.filter((grade) => {
    return (
      (classFilter === 'Toutes' || grade.classId === classFilter) &&
      (!studentFilter ||
        String(grade.studentName || '').toLowerCase().includes(studentFilter.toLowerCase())) &&
      (!dateFilter || grade.date === dateFilter) &&
      (subjectFilter === 'Toutes' || grade.subject === subjectFilter)
    )
  })

  return (
    <>
      <AdminPageHeader
        title="Notes"
        description="Toutes les notes que vous avez créées pour vos classes."
      />
      <div className="admin-filters">
        <label className="form-field"><span>Classe</span><select onChange={(event) => setClassFilter(event.currentTarget.value)} value={classFilter}><option>Toutes</option>{assignedClasses.map((classItem) => <option key={classItem.id} value={classItem.id}>{classItem.name}</option>)}</select></label>
        <label className="form-field"><span>Élève</span><input onChange={(event) => setStudentFilter(event.currentTarget.value)} placeholder="Nom de l’élève" type="search" value={studentFilter} /></label>
        <label className="form-field"><span>Date</span><input onChange={(event) => setDateFilter(event.currentTarget.value)} type="date" value={dateFilter} /></label>
        <label className="form-field"><span>Matière</span><select onChange={(event) => setSubjectFilter(event.currentTarget.value)} value={subjectFilter}>{subjects.map((subject) => <option key={subject}>{subject}</option>)}</select></label>
      </div>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead><tr><th>Élève</th><th>Classe</th><th>Matière</th><th>Évaluation</th><th>Note</th><th>Date</th><th>Actions</th></tr></thead>
          <tbody>
            {filteredGrades.length === 0 ? (
              <tr><td colSpan="7">Aucune note enregistrée.</td></tr>
            ) : filteredGrades.map((grade) => (
              <tr key={grade.id}>
                <td>{grade.studentName}</td>
                <td>{grade.className}</td>
                <td>{grade.subject}</td>
                <td>{grade.evaluationTitle}</td>
                <td>{grade.grade} / {grade.maxGrade}</td>
                <td>{formatDate(grade.date)}</td>
                <td><div className="table-actions"><button onClick={() => handleEditGrade(grade)} type="button">Modifier</button><button className="danger-action" onClick={() => handleDeleteGrade(grade)} type="button">Supprimer</button></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function DashboardPage() {
  const events = getEvents()
  const galleryImages = getGalleryImages()
  const newsItems = events.filter((eventItem) => {
    return eventItem.contentType === 'Actualité'
  })
  const eventItems = events.filter((eventItem) => {
    return eventItem.contentType !== 'Actualité'
  })
  const publishedNewsCount = newsItems.filter((eventItem) => {
    return eventItem.status === 'Publiée'
  }).length
  const openEventsCount = eventItems.filter((eventItem) => {
    return eventItem.status === 'Ouvert'
  }).length
  const publishedImagesCount = galleryImages.filter((image) => image.isPublished).length
  const hiddenImagesCount = galleryImages.length - publishedImagesCount

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d’ensemble de vos contenus publiés sur le site."
      />
      <div className="admin-card-grid">
        <article className="admin-card">
          <span>Actualités publiées</span>
          <strong>{publishedNewsCount}</strong>
          <p>Articles visibles sur la page Actualités.</p>
        </article>
        <article className="admin-card">
          <span>Événements créés</span>
          <strong>{eventItems.length}</strong>
          <p>Événements enregistrés dans l’administration.</p>
        </article>
        <article className="admin-card">
          <span>Événements ouverts</span>
          <strong>{openEventsCount}</strong>
          <p>Événements acceptant les inscriptions.</p>
        </article>
        <article className="admin-card">
          <span>Images galerie</span>
          <strong>{galleryImages.length}</strong>
          <p>Total des images ajoutées à la galerie.</p>
        </article>
        <article className="admin-card">
          <span>Images publiées</span>
          <strong>{publishedImagesCount}</strong>
          <p>Images visibles sur la galerie publique.</p>
        </article>
        <article className="admin-card">
          <span>Images masquées</span>
          <strong>{hiddenImagesCount}</strong>
          <p>Images conservées en brouillon dans l’administration.</p>
        </article>
      </div>

      <section className="admin-quick-actions" aria-labelledby="quick-actions-title">
        <div>
          <p className="section-kicker">Actions rapides</p>
          <h2 id="quick-actions-title">Gestion de contenu</h2>
        </div>
        <div className="quick-action-grid">
          <Link className="quick-action-card" to="/admin/events?type=news">
            <span>Ajouter une actualité</span>
            <strong>Publier une information sur le site</strong>
          </Link>
          <Link className="quick-action-card" to="/admin/events?type=event">
            <span>Créer un événement</span>
            <strong>Ajouter une activité avec inscriptions</strong>
          </Link>
          <Link className="quick-action-card" to="/admin/gallery">
            <span>Ajouter une image à la galerie</span>
            <strong>Mettre à jour la galerie publique</strong>
          </Link>
          <Link className="quick-action-card" to="/">
            <span>Voir le site public</span>
            <strong>Contrôler les contenus visibles</strong>
          </Link>
        </div>
      </section>
    </>
  )
}

function AdminEventsPage() {
  const [searchParams] = useSearchParams()
  const requestedType = searchParams.get('type')
  const initialEventForm = {
    ...emptyEventForm,
    contentType: requestedType === 'news' ? 'Actualité' : 'Événement',
    status: requestedType === 'news' ? 'Publiée' : 'Ouvert',
  }
  const [events, setEvents] = useState(() => getEvents())
  const [eventRegistrations, setEventRegistrations] = useState(() =>
    getEventRegistrations(),
  )
  const [eventForm, setEventForm] = useState(() => initialEventForm)
  const [editingEventId, setEditingEventId] = useState(null)
  const [openRegistrantsEventId, setOpenRegistrantsEventId] = useState(null)
  const isNewsForm = eventForm.contentType === 'Actualité'

  function refreshAdminEvents() {
    setEvents(getEvents())
    setEventRegistrations(getEventRegistrations())
  }

  function handleEventFieldChange(event) {
    const { name, value } = event.currentTarget
    setEventForm((current) => {
      if (name === 'contentType') {
        return {
          ...current,
          contentType: value,
          status: value === 'Actualité' ? 'Publiée' : 'Ouvert',
        }
      }

      return { ...current, [name]: value }
    })
  }

  async function handleEventImageUpload(event) {
    const file = event.currentTarget.files?.[0]
    if (!file) {
      return
    }

    const imageUrl = await readFileAsDataUrl(file)
    setEventForm((current) => ({ ...current, imageUrl }))
  }

  function resetEventForm() {
    setEventForm(initialEventForm)
    setEditingEventId(null)
  }

  function handleEventSubmit(event) {
    event.preventDefault()
    const contentType = eventForm.contentType || 'Événement'
    const payload = {
      ...eventForm,
      contentType,
      maxParticipants:
        contentType === 'Actualité' ? 0 : Number(eventForm.maxParticipants) || 0,
      status: eventForm.status || (contentType === 'Actualité' ? 'Publiée' : 'Ouvert'),
    }

    if (editingEventId) {
      updateEvent(editingEventId, payload)
    } else {
      addEvent(payload)
    }

    refreshAdminEvents()
    resetEventForm()
  }

  function handleEditEvent(eventItem) {
    setEditingEventId(eventItem.id)
    setEventForm({
      contentType: eventItem.contentType || 'Événement',
      title: eventItem.title || '',
      description: eventItem.description || '',
      imageUrl: eventItem.imageUrl || '',
      publishedAt: eventItem.publishedAt || '',
      date: eventItem.date || '',
      startTime: eventItem.startTime || '',
      endTime: eventItem.endTime || '',
      location: eventItem.location || '',
      maxParticipants: String(eventItem.maxParticipants || ''),
      status:
        eventItem.status ||
        (eventItem.contentType === 'Actualité' ? 'Publiée' : 'Ouvert'),
    })
  }

  function handleDeleteEvent(id) {
    deleteEvent(id)
    refreshAdminEvents()
    if (editingEventId === id) {
      resetEventForm()
    }
  }

  function handleToggleEventStatus(eventItem) {
    const isNewsItem = eventItem.contentType === 'Actualité'
    updateEvent(eventItem.id, {
      status: isNewsItem
        ? eventItem.status === 'Publiée' ? 'Brouillon' : 'Publiée'
        : eventItem.status === 'Ouvert' ? 'Fermé' : 'Ouvert',
    })
    refreshAdminEvents()
  }

  function registrationsForEvent(eventId) {
    return eventRegistrations.filter((registration) => {
      return registration.eventId === eventId
    })
  }

  return (
    <>
      <AdminPageHeader
        title="Actualités / Événements"
        description="Créez et gérez les actualités et événements visibles sur le site public."
      />

      <form className="class-form admin-panel" onSubmit={handleEventSubmit}>
        <div>
          <p className="section-kicker">
            {editingEventId ? 'Modification' : 'Création'}
          </p>
          <h2>
            {editingEventId
              ? `Modifier ${isNewsForm ? 'l’actualité' : 'l’événement'}`
              : `Créer ${isNewsForm ? 'une actualité' : 'un événement'}`}
          </h2>
        </div>
        <div className="class-form-grid">
          <label className="form-field" htmlFor="event-type-admin">
            <span>Type</span>
            <select
              id="event-type-admin"
              name="contentType"
              onChange={handleEventFieldChange}
              value={eventForm.contentType}
            >
              <option>Actualité</option>
              <option>Événement</option>
            </select>
          </label>
          <label className="form-field" htmlFor="event-title-admin">
            <span>{isNewsForm ? 'Titre de l’actualité' : 'Titre de l’événement'}</span>
            <input
              id="event-title-admin"
              name="title"
              onChange={handleEventFieldChange}
              required
              type="text"
              value={eventForm.title}
            />
          </label>
          <label className="form-field field-wide" htmlFor="event-description-admin">
            <span>Description</span>
            <textarea
              id="event-description-admin"
              name="description"
              onChange={handleEventFieldChange}
              value={eventForm.description}
            />
          </label>
          {isNewsForm ? (
            <>
              <label className="form-field" htmlFor="event-publication-date-admin">
                <span>Date de publication</span>
                <input
                  id="event-publication-date-admin"
                  name="publishedAt"
                  onChange={handleEventFieldChange}
                  type="date"
                  value={eventForm.publishedAt}
                />
              </label>
              <label className="form-field" htmlFor="event-image-admin">
                <span>Image optionnelle</span>
                <input
                  accept="image/*"
                  id="event-image-admin"
                  onChange={handleEventImageUpload}
                  type="file"
                />
              </label>
            </>
          ) : null}
          {eventForm.imageUrl ? (
            <img
              alt="Aperçu actualité"
              className="gallery-admin-preview"
              src={eventForm.imageUrl}
            />
          ) : null}
          {!isNewsForm ? (
            <>
          <label className="form-field" htmlFor="event-date-admin">
            <span>Date</span>
            <input
              id="event-date-admin"
              name="date"
              onChange={handleEventFieldChange}
              type="date"
              value={eventForm.date}
            />
          </label>
          <label className="form-field" htmlFor="event-start-admin">
            <span>Heure de début</span>
            <input
              id="event-start-admin"
              name="startTime"
              onChange={handleEventFieldChange}
              type="time"
              value={eventForm.startTime}
            />
          </label>
          <label className="form-field" htmlFor="event-end-admin">
            <span>Heure de fin</span>
            <input
              id="event-end-admin"
              name="endTime"
              onChange={handleEventFieldChange}
              type="time"
              value={eventForm.endTime}
            />
          </label>
          <label className="form-field" htmlFor="event-location-admin">
            <span>Lieu</span>
            <input
              id="event-location-admin"
              name="location"
              onChange={handleEventFieldChange}
              type="text"
              value={eventForm.location}
            />
          </label>
          <label className="form-field" htmlFor="event-max-admin">
            <span>Nombre maximum de participants</span>
            <input
              id="event-max-admin"
              min="0"
              name="maxParticipants"
              onChange={handleEventFieldChange}
              type="number"
              value={eventForm.maxParticipants}
            />
          </label>
            </>
          ) : null}
          <label className="form-field" htmlFor="event-status-admin">
            <span>Statut</span>
            <select
              id="event-status-admin"
              name="status"
              onChange={handleEventFieldChange}
              value={eventForm.status}
            >
              {isNewsForm ? (
                <>
                  <option>Publiée</option>
                  <option>Brouillon</option>
                </>
              ) : (
                <>
                  <option>Ouvert</option>
                  <option>Fermé</option>
                </>
              )}
            </select>
          </label>
        </div>
        <div className="class-form-actions">
          <button className="btn btn-primary submit-btn" type="submit">
            {editingEventId
              ? 'Enregistrer les modifications'
              : `Créer ${isNewsForm ? 'l’actualité' : 'l’événement'}`}
          </button>
          {editingEventId ? (
            <button onClick={resetEventForm} type="button">
              Annuler
            </button>
          ) : null}
        </div>
      </form>

      {events.length === 0 ? (
        <div className="admin-empty-state">
          <h2>Aucun contenu créé</h2>
          <p>Les actualités et événements publiés apparaîtront sur la page Actualités.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Titre</th>
                <th>Date</th>
                <th>Heure</th>
                <th>Lieu</th>
                <th>Inscrits</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {events.map((eventItem) => {
                const isNewsItem = eventItem.contentType === 'Actualité'
                const registrations = registrationsForEvent(eventItem.id)

                return (
                  <tr key={eventItem.id}>
                    <td>{isNewsItem ? 'Actualité' : 'Événement'}</td>
                    <td>{eventItem.title}</td>
                    <td>{formatDate(isNewsItem ? eventItem.publishedAt : eventItem.date)}</td>
                    <td>
                      {isNewsItem
                        ? '-'
                        : `${eventItem.startTime || '--:--'} - ${
                            eventItem.endTime || '--:--'
                          }`}
                    </td>
                    <td>{isNewsItem ? '-' : eventItem.location || '-'}</td>
                    <td>
                      {isNewsItem
                        ? '-'
                        : `${registrations.length} / ${eventItem.maxParticipants || '∞'}`}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          eventItem.status === 'Ouvert' ||
                          eventItem.status === 'Publiée'
                            ? 'validee'
                            : 'refusee'
                        }`}
                      >
                        {eventItem.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {!isNewsItem ? (
                          <button
                            onClick={() =>
                              setOpenRegistrantsEventId((current) =>
                                current === eventItem.id ? null : eventItem.id,
                              )
                            }
                            type="button"
                          >
                            Voir les inscrits
                          </button>
                        ) : null}
                        <button onClick={() => handleEditEvent(eventItem)} type="button">
                          Modifier
                        </button>
                        <button
                          onClick={() => handleToggleEventStatus(eventItem)}
                          type="button"
                        >
                          {isNewsItem
                            ? eventItem.status === 'Publiée' ? 'Masquer' : 'Publier'
                            : eventItem.status === 'Ouvert' ? 'Fermer' : 'Ouvrir'}
                        </button>
                        <button
                          className="danger-action"
                          onClick={() => handleDeleteEvent(eventItem.id)}
                          type="button"
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {openRegistrantsEventId ? (
        <div className="event-registrants-panel admin-panel">
          <h2>Inscrits à l’événement</h2>
          {registrationsForEvent(openRegistrantsEventId).length === 0 ? (
            <p>Aucune inscription pour cet événement.</p>
          ) : (
            <div className="admin-table-wrap compact-table">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Âge</th>
                    <th>Date d’inscription</th>
                  </tr>
                </thead>
                <tbody>
                  {registrationsForEvent(openRegistrantsEventId).map(
                    (registration) => (
                      <tr key={registration.id}>
                        <td>{registration.lastName}</td>
                        <td>{registration.firstName}</td>
                        <td>{registration.age}</td>
                        <td>{formatDate(registration.createdAt)}</td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : null}
    </>
  )
}

function AdminGalleryPage() {
  const [images, setImages] = useState(() => getGalleryImages())
  const [galleryForm, setGalleryForm] = useState(emptyGalleryForm)
  const [editingImageId, setEditingImageId] = useState(null)
  const [galleryMessage, setGalleryMessage] = useState('')
  const [galleryError, setGalleryError] = useState('')

  function refreshGallery() {
    setImages(getGalleryImages())
  }

  function handleGalleryFieldChange(event) {
    const { name, value } = event.currentTarget
    setGalleryForm((current) => ({ ...current, [name]: value }))
  }

  async function handleGalleryUpload(event) {
    const file = event.currentTarget.files?.[0]
    if (!file) {
      return
    }

    const imageUrl = await readFileAsDataUrl(file)
    setGalleryForm((current) => ({ ...current, imageUrl }))
  }

  function resetGalleryForm() {
    setGalleryForm(emptyGalleryForm)
    setEditingImageId(null)
    setGalleryError('')
  }

  function handleGallerySubmit(event) {
    event.preventDefault()
    setGalleryMessage('')
    setGalleryError('')

    if (!galleryForm.imageUrl) {
      setGalleryError('Veuillez ajouter une image.')
      return
    }

    if (editingImageId) {
      updateGalleryImage(editingImageId, galleryForm)
      setGalleryMessage('L’image a bien été modifiée.')
    } else {
      addGalleryImage(galleryForm)
      setGalleryMessage('L’image a bien été ajoutée à la galerie.')
    }

    refreshGallery()
    resetGalleryForm()
  }

  function handleEditGalleryImage(image) {
    setEditingImageId(image.id)
    setGalleryForm({
      title: image.title || '',
      description: image.description || '',
      category: image.category || 'Institut',
      imageUrl: image.imageUrl || '',
      isPublished: Boolean(image.isPublished),
    })
    setGalleryMessage('')
    setGalleryError('')
  }

  function handleDeleteGalleryImage(id) {
    deleteGalleryImage(id)
    refreshGallery()
    if (editingImageId === id) {
      resetGalleryForm()
    }
  }

  function handleToggleGalleryStatus(image) {
    updateGalleryImage(image.id, { isPublished: !image.isPublished })
    refreshGallery()
  }

  return (
    <>
      <AdminPageHeader
        title="Galerie"
        description="Ajoutez et publiez les images visibles dans la galerie publique."
      />

      <form className="class-form admin-panel" onSubmit={handleGallerySubmit}>
        <div>
          <p className="section-kicker">
            {editingImageId ? 'Modification' : 'Ajout'}
          </p>
          <h2>{editingImageId ? 'Modifier une image' : 'Ajouter une image'}</h2>
        </div>
        {galleryMessage ? (
          <div className="success-message assignment-message" role="status">
            {galleryMessage}
          </div>
        ) : null}
        {galleryError ? (
          <div className="login-error" role="alert">
            {galleryError}
          </div>
        ) : null}
        <div className="class-form-grid">
          <label className="form-field" htmlFor="gallery-title">
            <span>Titre</span>
            <input
              id="gallery-title"
              name="title"
              onChange={handleGalleryFieldChange}
              required
              type="text"
              value={galleryForm.title}
            />
          </label>
          <label className="form-field" htmlFor="gallery-category">
            <span>Catégorie</span>
            <select
              id="gallery-category"
              name="category"
              onChange={handleGalleryFieldChange}
              value={galleryForm.category}
            >
              {galleryCategories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
          </label>
          <label className="form-field" htmlFor="gallery-status">
            <span>Statut</span>
            <select
              id="gallery-status"
              name="isPublished"
              onChange={(event) =>
                setGalleryForm((current) => ({
                  ...current,
                  isPublished: event.currentTarget.value === 'true',
                }))
              }
              value={String(galleryForm.isPublished)}
            >
              <option value="true">Publiée</option>
              <option value="false">Masquée</option>
            </select>
          </label>
          <label className="form-field field-wide" htmlFor="gallery-description">
            <span>Description</span>
            <textarea
              id="gallery-description"
              name="description"
              onChange={handleGalleryFieldChange}
              value={galleryForm.description}
            />
          </label>
          <label className="form-field" htmlFor="gallery-upload">
            <span>Upload image</span>
            <input
              accept="image/*"
              id="gallery-upload"
              onChange={handleGalleryUpload}
              type="file"
            />
          </label>
        </div>
        {galleryForm.imageUrl ? (
          <img
            alt="Aperçu"
            className="gallery-admin-preview"
            src={galleryForm.imageUrl}
          />
        ) : null}
        <div className="class-form-actions">
          <button className="btn btn-primary submit-btn" type="submit">
            {editingImageId ? 'Enregistrer les modifications' : 'Ajouter l’image'}
          </button>
          {editingImageId ? (
            <button onClick={resetGalleryForm} type="button">
              Annuler
            </button>
          ) : null}
        </div>
      </form>

      {images.length === 0 ? (
        <div className="admin-empty-state">
          <h2>Aucune image ajoutée</h2>
          <p>Les images publiées apparaîtront dans la galerie publique.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Aperçu</th>
                <th>Titre</th>
                <th>Catégorie</th>
                <th>Statut</th>
                <th>Date d’ajout</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {images.map((image) => (
                <tr key={image.id}>
                  <td>
                    <img
                      alt={image.title}
                      className="gallery-table-image"
                      src={image.imageUrl}
                    />
                  </td>
                  <td>{image.title}</td>
                  <td>{image.category}</td>
                  <td>
                    <span
                      className={`status-pill ${
                        image.isPublished ? 'validee' : 'refusee'
                      }`}
                    >
                      {image.isPublished ? 'Publiée' : 'Masquée'}
                    </span>
                  </td>
                  <td>{formatDate(image.createdAt)}</td>
                  <td>
                    <div className="table-actions">
                      <button onClick={() => handleEditGalleryImage(image)} type="button">
                        Modifier
                      </button>
                      <button onClick={() => handleToggleGalleryStatus(image)} type="button">
                        {image.isPublished ? 'Masquer' : 'Publier'}
                      </button>
                      <button
                        className="danger-action"
                        onClick={() => handleDeleteGalleryImage(image.id)}
                        type="button"
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage />}
      />
      <Route
        path="/formations"
        element={
          <PublicLayout>
            <FormationsPage />
          </PublicLayout>
        }
      />
      <Route
        path="/inscription"
        element={
          <PublicLayout>
            <InscriptionPage />
          </PublicLayout>
        }
      />
      <Route
        path="/contact"
        element={
          <PublicLayout>
            <ContactPage />
          </PublicLayout>
        }
      />
      <Route
        path="/faq"
        element={
          <PublicLayout>
            <FAQPage />
          </PublicLayout>
        }
      />
      <Route
        path="/a-propos"
        element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        }
      />
      <Route
        path="/actualites"
        element={
          <PublicLayout>
            <EventsPublicPage />
          </PublicLayout>
        }
      />
      <Route
        path="/galerie"
        element={
          <PublicLayout>
            <GalleryPublicPage />
          </PublicLayout>
        }
      />
      <Route path="/admin/login" element={<Login />} />
      <Route element={<ProtectedRoute allowedRole="admin" />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="inscriptions" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="classes" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="groups" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="schedule" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="grades" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="teachers/:id/schedule" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="users" element={<Navigate replace to="/admin/dashboard" />} />
          <Route path="settings" element={<Navigate replace to="/admin/dashboard" />} />
        </Route>
      </Route>
      <Route element={<ProtectedRoute allowedRole="teacher" />}>
        <Route path="/teacher" element={<TeacherLayout />}>
          <Route index element={<Navigate replace to="/teacher/dashboard" />} />
          <Route path="dashboard" element={<TeacherDashboard />} />
          <Route path="schedule" element={<TeacherSchedulePage />} />
          <Route path="grades" element={<TeacherGradesPage />} />
          <Route path="classes" element={<TeacherClasses />} />
          <Route path="classes/:id" element={<TeacherClassDetails />} />
          <Route path="students/:id" element={<TeacherStudentDetails />} />
        </Route>
      </Route>
    </Routes>
  )
}

export default App
