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
} from 'react-router-dom'
import {
  addRegistration,
  addClass,
  addEvent,
  addEventRegistration,
  addGalleryImage,
  addAttendance,
  addStudentGrade,
  addStudentNote,
  addUser,
  authenticateUser,
  autoCreateClassesFromPreGroups,
  deleteEvent,
  deleteGalleryImage,
  deleteAttendance,
  deleteRegistration,
  deleteClass,
  deleteStudentGrade,
  deleteStudentNote,
  deleteUser,
  getAttendanceByStudentId,
  getClasses,
  getEvents,
  getEventRegistrations,
  getEventRegistrationsByEventId,
  getGalleryImages,
  getGlobalSchedule,
  getPreGroups,
  getRegistrations,
  getSettings,
  getTeacherSchedule,
  getStudentNotesByStudentId,
  getStudentGradesByClassId,
  getStudentGradesByStudentId,
  getStudentGradesByTeacherId,
  getUsers,
  getClassesWithoutSchedule,
  isRegistrationOpen,
  moveStudentToClass,
  removeStudentFromClass,
  setRegistrationOpen,
  manualCreateClassFromStudents,
  updateClass,
  updateEvent,
  updateGalleryImage,
  updateStudentGrade,
  updateStudentNote,
  updateUser,
  updateRegistration,
  updateClassSchedule,
  updateRegistrationStatus,
} from './data/storage'
import Footer from './components/Footer'
import Header from './components/Header'
import { getSubjectColor, subjectColors } from './config/subjectColors'
import './App.css'

const formations = [
  {
    icon: 'ع',
    title: 'Langue Arabe',
    description:
      "Apprentissage progressif de la lecture, de l'écriture et de l'expression en arabe.",
  },
  {
    icon: 'ق',
    title: 'Coran : Tajwid et mémorisation',
    description:
      'Cours adaptés pour améliorer la récitation, la prononciation et la mémorisation.',
  },
  {
    icon: '۞',
    title: 'Théologie Musulmane',
    description:
      'Bases essentielles de la croyance, de la pratique religieuse et de la culture musulmane.',
  },
  {
    icon: 'Fr',
    title: 'Français',
    description:
      'Renforcement en expression orale, lecture, grammaire et compréhension écrite.',
  },
  {
    icon: 'En',
    title: 'Anglais',
    description:
      'Cours pratiques pour progresser en vocabulaire, conversation et compréhension.',
  },
  {
    icon: '+',
    title: 'Soutien scolaire',
    description:
      'Accompagnement régulier pour consolider les acquis et gagner en méthode de travail.',
  },
]

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
  {
    title: 'Coran / Tajwid',
    options: ['Adultes', 'Ados / Enfants'],
    fields: ['Niveau', 'Planning jours / heure'],
  },
  {
    title: 'Théologie musulmane',
    options: [
      'Adultes',
      'Ados',
      'Arabe',
      'Français',
      'Initiation à l’Islam pour les convertis',
    ],
    fields: ['Planning jours / heure'],
  },
  {
    title: 'Initiation à l’Islam',
    options: ['Convertis', 'Adultes', 'Ados'],
    fields: ['Planning jours / heure'],
  },
  {
    title: 'Français',
    options: ['Adultes', 'Ados / Enfants'],
    fields: ['Niveau', 'Planning jours / heure'],
  },
  {
    title: 'Anglais',
    options: ['Adultes', 'Ados / Enfants'],
    fields: ['Niveau', 'Planning jours / heure'],
  },
  {
    title: 'Soutien scolaire',
    options: ['Primaire', 'Collège', 'Lycée'],
    fields: ['Planning jours / heure'],
  },
]

const levelOptions = ['Débutant', 'Intermédiaire', 'Avancé']
const publicTypeOptions = ['Enfant', 'Ado', 'Adulte']
const availabilityOptions = ['Semaine', 'Week-end', 'Les deux']
const dayOptions = [
  'Lundi',
  'Mardi',
  'Mercredi',
  'Jeudi',
  'Vendredi',
  'Samedi',
  'Dimanche',
]
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

const CURRENT_USER_KEY = 'ish-orleans:current-user'

const emptyClassForm = {
  name: '',
  subject: 'Arabe',
  level: '',
  publicType: 'Adultes',
  availabilityType: '',
  days: [],
  day: '',
  startTime: '',
  endTime: '',
  teacher: '',
  teacherId: '',
  room: '',
  maxStudents: '',
}

const emptyUserForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'teacher',
  assignedClassIds: [],
  isActive: true,
}

const emptyNoteForm = {
  title: '',
  score: '',
  maxScore: '',
  date: '',
  appreciation: '',
}

const emptyGradeForm = {
  evaluationTitle: '',
  grade: '',
  maxGrade: '20',
  coefficient: '1',
  date: '',
  appreciation: '',
}

const emptyAttendanceForm = {
  date: '',
  status: 'Présent',
  comment: '',
}

const emptyEventForm = {
  title: '',
  description: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  maxParticipants: '',
  status: 'Ouvert',
}

const galleryCategories = ['Institut', 'Événement', 'Cours', 'Activité', 'Autre']

const emptyGalleryForm = {
  title: '',
  description: '',
  category: 'Institut',
  imageUrl: '',
  isPublished: true,
}

function inputType(label) {
  if (label === 'Date de naissance' || label === 'Date') {
    return 'date'
  }

  if (label === 'Âge') {
    return 'number'
  }

  if (label === 'Email') {
    return 'email'
  }

  if (label.toLowerCase().includes('téléphone') || label.includes('Portable')) {
    return 'tel'
  }

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

function fieldName(label, idPrefix = '') {
  return slugify(`${idPrefix} ${label}`)
}

function TextField({ label, className = '', idPrefix = '' }) {
  const id = fieldName(label, idPrefix)

  return (
    <label className={`form-field ${className}`} htmlFor={id}>
      <span>{label}</span>
      <input id={id} name={id} type={inputType(label)} />
    </label>
  )
}

function CheckboxField({ label, name }) {
  const id = `${name}-${slugify(label)}`

  return (
    <label className="checkbox-field" htmlFor={id}>
      <input id={id} name={name} type="checkbox" value={label} />
      <span>{label}</span>
    </label>
  )
}

function SelectField({ idPrefix, label, options }) {
  const id = fieldName(label, idPrefix)

  return (
    <label className="form-field" htmlFor={id}>
      <span>{label}</span>
      <select id={id} name={id}>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}

function valueFromForm(formData, label, idPrefix = '') {
  return String(formData.get(fieldName(label, idPrefix)) || '').trim()
}

function buildRegistrationFromForm(form) {
  const formData = new FormData(form)
  const photo = formData.get('photo')
  const coursesWanted = courseGroups
    .map((group) => {
      const subject = group.title
      const level = valueFromForm(formData, 'Niveau', subject) || 'Débutant'
      const publicType = valueFromForm(formData, 'Public', subject) || 'Adulte'
      const availabilityType =
        valueFromForm(formData, 'Disponibilité principale', subject) || 'Les deux'
      const preferredTime =
        valueFromForm(formData, 'Créneau souhaité', subject) || 'Peu importe'
      const availableDays = formData.getAll(fieldName('Jours disponibles', subject))
      const selectedOptions = formData.getAll(slugify(subject))
      const hasDetails =
        selectedOptions.length > 0 ||
        availableDays.length > 0 ||
        valueFromForm(formData, 'Planning jours / heure', subject)

      if (!hasDetails) {
        return null
      }

      return {
        id: `${slugify(subject)}-${Date.now()}-${Math.random()
          .toString(16)
          .slice(2)}`,
        subject,
        level,
        publicType,
        availabilityType,
        availableDays,
        preferredTime,
        groupKey: [subject, level, publicType, availabilityType, preferredTime].join(
          '|',
        ),
        options: selectedOptions,
        planning: valueFromForm(formData, 'Planning jours / heure', subject),
        assignmentStatus: 'Pré-groupé',
        assignedClassId: '',
        assignedClassName: '',
      }
    })
    .filter(Boolean)

  return {
    schoolYear: '2025 / 2026',
    registrationType: formData.getAll('inscription-type'),
    photoName: photo && photo.name ? photo.name : '',
    personalInformation: personalFields.reduce((fields, field) => {
      return {
        ...fields,
        [field]: valueFromForm(formData, field),
      }
    }, {}),
    selectedCourses: courseGroups.map((group) => {
      return {
        title: group.title,
        options: formData.getAll(slugify(group.title)),
        details: group.fields.reduce((fields, field) => {
          return {
            ...fields,
            [field]: valueFromForm(formData, field, group.title),
          }
        }, {}),
      }
    }),
    coursesWanted,
    validation: {
      certified: formData.get('certification') === 'on',
      location: valueFromForm(formData, 'Fait à'),
      date: valueFromForm(formData, 'Date'),
      signature: String(formData.get('signature') || '').trim(),
    },
  }
}

// Session locale de démonstration, à remplacer plus tard par Supabase Auth.
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
    JSON.stringify({
      currentUser: user,
      role: user.role,
      isAuthenticated: true,
    }),
  )
}

function clearUserSession() {
  localStorage.removeItem(CURRENT_USER_KEY)
}

function userIsAuthenticated(role) {
  const session = getCurrentUser()
  if (!session?.isAuthenticated) {
    return false
  }

  return role ? session.role === role : true
}

function Formations() {
  return (
    <section className="section formations-section" id="formations">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Formations</div>
          <h2>Nos enseignements</h2>
        </div>
        <p>
          Des parcours pour apprendre, consolider ses bases et avancer à son
          rythme.
        </p>
      </div>

      <div className="formation-grid">
        {formations.map((formation) => (
          <article className="formation-card" key={formation.title}>
            <div className="formation-icon" aria-hidden="true">
              {formation.icon}
            </div>
            <h3>{formation.title}</h3>
            <p>{formation.description}</p>
            <Link to="/contact">En savoir plus</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function Inscription() {
  const [registrationOpen] = useState(() => isRegistrationOpen())
  const [isCertified, setIsCertified] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  function handleSubmit(event) {
    event.preventDefault()

    if (!registrationOpen) {
      return
    }

    const registration = addRegistration(buildRegistrationFromForm(event.currentTarget))
    event.currentTarget.reset()
    setIsCertified(false)
    setSuccessMessage(
      `Votre inscription a bien été enregistrée avec le numéro ${registration.id}.`,
    )
  }

  if (!registrationOpen) {
    return (
      <section className="section inscription-section" id="inscription">
        <div className="inscription-heading">
          <div>
            <div className="section-kicker">Inscription</div>
            <h2>Fiche d’inscription</h2>
            <p>Année scolaire 2025 / 2026</p>
          </div>
        </div>
        <div className="registration-closed-message">
          Les inscriptions sont actuellement fermées. Merci de revenir plus tard
          ou de contacter l’administration.
        </div>
      </section>
    )
  }

  return (
    <section className="section inscription-section" id="inscription">
      <div className="inscription-heading">
        <div>
          <div className="section-kicker">Inscription</div>
          <h2>Fiche d’inscription</h2>
          <p>Année scolaire 2025 / 2026</p>
        </div>
        <p>
          Remplissez les informations ci-dessous pour préparer votre dossier
          d’inscription auprès de l’ISH Orléans.
        </p>
      </div>

      {successMessage ? (
        <div className="success-message" role="status">
          {successMessage}
        </div>
      ) : null}

      <form className="registration-form" onSubmit={handleSubmit}>
        <div className="paper-header">
          <div className="status-options">
            <CheckboxField label="Première inscription" name="inscription-type" />
            <CheckboxField label="Ré-inscription" name="inscription-type" />
          </div>

          <label className="photo-upload" htmlFor="photo">
            <span>Téléversement d’une photo</span>
            <input id="photo" name="photo" type="file" accept="image/*" />
          </label>
        </div>

        <fieldset className="form-block">
          <legend>1. Informations personnelles</legend>
          <div className="field-grid">
            {personalFields.map((field) => (
              <TextField
                className={field === 'Adresse' ? 'field-wide' : ''}
                key={field}
                label={field}
              />
            ))}
          </div>
          <p className="form-note">
            Numéro à renseigner en priorité pour la gestion des groupes de
            communication en cas de poursuite des cours à distance.
          </p>
        </fieldset>

        <fieldset className="form-block">
          <legend>2. Formation : Matière / Cours</legend>
          <div className="course-grid">
            {courseGroups.map((group) => (
              <section className="course-card" key={group.title}>
                <h3>{group.title}</h3>
                <div className="checkbox-list">
                  {group.options.map((option) => (
                    <CheckboxField
                      key={option}
                      label={option}
                      name={slugify(group.title)}
                    />
                  ))}
                </div>
                <div className="course-fields">
                  <SelectField
                    idPrefix={group.title}
                    label="Niveau"
                    options={levelOptions}
                  />
                  <SelectField
                    idPrefix={group.title}
                    label="Public"
                    options={publicTypeOptions}
                  />
                  <SelectField
                    idPrefix={group.title}
                    label="Disponibilité principale"
                    options={availabilityOptions}
                  />
                  <SelectField
                    idPrefix={group.title}
                    label="Créneau souhaité"
                    options={preferredTimeOptions}
                  />
                  <div className="course-day-options">
                    <span>Jours disponibles</span>
                    <div>
                      {dayOptions.map((day) => (
                        <CheckboxField
                          key={day}
                          label={day}
                          name={fieldName('Jours disponibles', group.title)}
                        />
                      ))}
                    </div>
                  </div>
                  {group.fields.map((field) => (
                    field === 'Niveau' ? null : (
                      <TextField key={field} idPrefix={group.title} label={field} />
                    )
                  ))}
                </div>
              </section>
            ))}
          </div>
          <p className="form-note">
            Niveau sous réserve de validation et après test oral par l’équipe
            pédagogique pour toute nouvelle inscription.
          </p>
        </fieldset>

        <fieldset className="form-block">
          <legend>3. Pièces à fournir</legend>
          <ul className="document-list">
            {requiredDocuments.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>
          <p className="warning-note">
            NB : Aucun remboursement possible en cas de désistement ou abandon.
          </p>
        </fieldset>

        <fieldset className="form-block validation-block">
          <legend>4. Validation</legend>
          <label className="checkbox-field required-check" htmlFor="certification">
            <input
              checked={isCertified}
              id="certification"
              name="certification"
              onChange={(event) => setIsCertified(event.currentTarget.checked)}
              required
              type="checkbox"
            />
            <span>
              Je certifie que tous les renseignements sont exacts et porte
              l’entière responsabilité en cas de falsification.
            </span>
          </label>

          <div className="validation-grid">
            <TextField label="Fait à" />
            <TextField label="Date" />
            <label className="form-field signature-field" htmlFor="signature">
              <span>Signature numérique</span>
              <textarea id="signature" name="signature" rows="4" />
            </label>
          </div>

          <button
            className="btn btn-primary submit-btn"
            disabled={!isCertified}
            type="submit"
          >
            Envoyer mon inscription
          </button>
        </fieldset>
      </form>
    </section>
  )
}

function Contact() {
  return (
    <section className="section contact-section" id="contact">
      <div className="section-heading">
        <div>
          <div className="section-kicker">Contact</div>
          <h2>Nous contacter</h2>
        </div>
        <p>Une question sur les cours, les horaires ou les inscriptions ?</p>
      </div>

      <div className="contact-list">
        <a href="tel:+33652715921">
          <span>Téléphone</span>
          <strong>06 52 71 59 21</strong>
        </a>
        <a href="mailto:ishorleans@gmail.com">
          <span>Email</span>
          <strong>ishorleans@gmail.com</strong>
        </a>
        <a href="https://www.ishorleans.fr">
          <span>Site</span>
          <strong>www.ishorleans.fr</strong>
        </a>
      </div>
    </section>
  )
}

const homePrograms = [
  {
    badge: '6–12 ans',
    title: 'Programme Enfants',
    text: 'Initiation ludique à la langue arabe et aux bases des sciences islamiques.',
  },
  {
    badge: '13–17 ans',
    title: 'Programme Adolescents',
    text: 'Approfondissement de la langue arabe, lecture et compréhension des textes.',
  },
  {
    badge: '18+ ans',
    title: 'Programme Adultes',
    text: 'Cours intensifs de langue arabe et d’études islamiques pour adultes.',
  },
]

const homeAdvantages = [
  {
    icon: '01',
    title: 'Pédagogie structurée',
    text: 'Un programme progressif adapté à chaque niveau, du débutant au confirmé.',
  },
  {
    icon: '02',
    title: 'Enseignants qualifiés',
    text: 'Une équipe pédagogique expérimentée et passionnée.',
  },
  {
    icon: '03',
    title: 'Cadre bienveillant',
    text: 'Un environnement d’apprentissage respectueux et encourageant.',
  },
  {
    icon: '04',
    title: 'Programmes variés',
    text: 'Des cours pour enfants, adolescents et adultes.',
  },
  {
    icon: '05',
    title: 'Résultats prouvés',
    text: 'Des élèves qui progressent et s’épanouissent chaque année.',
  },
]

const inscriptionSteps = [
  {
    number: '1',
    title: 'Choisissez un programme',
    text: 'Consultez nos programmes et trouvez celui qui correspond à votre niveau.',
  },
  {
    number: '2',
    title: 'Remplissez le formulaire',
    text: 'Complétez le formulaire de pré-inscription en ligne en quelques minutes.',
  },
  {
    number: '3',
    title: 'Confirmation',
    text: 'Recevez une confirmation par email et les prochaines étapes à suivre.',
  },
]

const faqItems = [
  {
    question: 'Comment s’inscrire à l’ISH Orléans ?',
    answer:
      'Vous pouvez vous inscrire directement en ligne depuis la page “Inscription”. Il suffit de remplir la fiche d’inscription, de choisir le programme souhaité et de valider votre demande.',
  },
  {
    question: 'Quels programmes sont proposés ?',
    answer:
      'L’ISH Orléans propose des programmes pour enfants, adolescents et adultes, notamment en langue arabe, Coran, sciences islamiques, théologie musulmane, français, anglais et soutien scolaire.',
  },
  {
    question: 'Les cours sont-ils ouverts aux adultes ?',
    answer:
      'Oui, certains programmes sont spécialement destinés aux adultes, avec des cours adaptés au niveau et aux objectifs de chacun.',
  },
  {
    question: 'Les enfants peuvent-ils s’inscrire ?',
    answer:
      'Oui, l’institut propose des programmes pour les enfants à partir de 6 ans, avec une approche progressive, ludique et adaptée à leur âge.',
  },
  {
    question: 'Comment connaître mon niveau ?',
    answer:
      'Le niveau peut être évalué par l’équipe pédagogique, notamment lors d’un test ou d’un échange avant l’intégration dans un groupe.',
  },
  {
    question: 'Quels documents faut-il fournir pour l’inscription ?',
    answer:
      'Les pièces à fournir sont : la fiche d’inscription complétée, une photo, le règlement intérieur signé, une copie du certificat d’assurance scolaire et le règlement des frais d’inscription.',
  },
  {
    question: 'Peut-on annuler une inscription ?',
    answer:
      'En cas de désistement ou d’abandon, aucun remboursement n’est possible, conformément aux conditions indiquées dans la fiche d’inscription.',
  },
  {
    question: 'Comment savoir si mon inscription est validée ?',
    answer:
      'Après l’envoi de votre fiche d’inscription, l’administration étudie votre demande. Une confirmation vous sera ensuite envoyée avec les prochaines étapes.',
  },
  {
    question: 'Où se trouve l’ISH Orléans ?',
    answer:
      'L’institut est situé à Orléans. Les informations de contact sont disponibles dans la section Contact du site.',
  },
  {
    question: 'Comment contacter l’administration ?',
    answer:
      'Vous pouvez contacter l’ISH Orléans par téléphone au 06 52 71 59 21 ou par email à ishorleans@gmail.com.',
  },
]

const aboutValues = [
  {
    icon: '📖',
    title: 'Excellence pédagogique',
    text: 'Des programmes rigoureux et des méthodes éprouvées pour une progression constante.',
  },
  {
    icon: '♡',
    title: 'Bienveillance',
    text: 'Un environnement d’apprentissage chaleureux où chaque élève est accompagné.',
  },
  {
    icon: '👥',
    title: 'Communauté',
    text: 'Un lieu de rencontre et de partage pour toute la communauté orléanaise.',
  },
  {
    icon: '◈',
    title: 'Engagement',
    text: 'Des enseignants passionnés, formés et dévoués à la réussite de chaque élève.',
  },
]

function HomeHero() {
  return (
    <section className="home-hero" id="accueil">
      <div className="home-pattern" aria-hidden="true" />
      <div className="home-hero-content">
        <h1>
          Apprendre avec <span>excellence</span> et bienveillance
        </h1>
        <p>
          L’Institut des Sciences Humaines d’Orléans vous accompagne dans
          l’apprentissage de la langue arabe et des sciences islamiques, dans un
          cadre structuré et adapté à tous les niveaux.
        </p>
        <div className="home-hero-actions">
          <Link className="gold-button" to="/inscription">
            S’inscrire →
          </Link>
          <a className="white-button" href="#programmes">
            Découvrir nos programmes
          </a>
        </div>
      </div>
    </section>
  )
}

function HomePrograms() {
  return (
    <section className="home-section home-programs" id="programmes">
      <div className="home-section-heading">
        <h2>Nos programmes</h2>
        <p>
          Des formations adaptées à chaque âge et chaque niveau, pour une
          progression continue.
        </p>
      </div>
      <div className="home-program-grid">
        {homePrograms.map((program) => (
          <article className="home-program-card" key={program.title}>
            <span>{program.badge}</span>
            <h3>{program.title}</h3>
            <p>{program.text}</p>
            <Link to="/formations">En savoir plus →</Link>
          </article>
        ))}
      </div>
    </section>
  )
}

function HomeAdvantages() {
  return (
    <section className="home-section home-advantages" id="apropos">
      <div className="home-section-heading">
        <h2>Pourquoi choisir ISH Orléans ?</h2>
        <p>
          Un institut dédié à l’excellence pédagogique et au bien-être de chaque
          élève.
        </p>
      </div>
      <div className="home-advantage-grid">
        {homeAdvantages.map((advantage) => (
          <article className="home-advantage-card" key={advantage.title}>
            <span aria-hidden="true">{advantage.icon}</span>
            <h3>{advantage.title}</h3>
            <p>{advantage.text}</p>
          </article>
        ))}
      </div>
    </section>
  )
}

function HomeInscriptionSteps() {
  return (
    <section className="home-section home-steps">
      <div className="home-section-heading">
        <h2>Comment s’inscrire ?</h2>
        <p>Un processus simple et rapide en trois étapes.</p>
      </div>
      <div className="home-step-grid">
        {inscriptionSteps.map((step) => (
          <article className="home-step-card" key={step.number}>
            <span>{step.number}</span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>
      <Link className="gold-button centered-button" to="/inscription">
        Commencer l’inscription →
      </Link>
    </section>
  )
}

function HomeFinalCta() {
  return (
    <section className="home-final-cta">
      <h2>
        Prêt à rejoindre <span>ISH Orléans</span> ?
      </h2>
      <p>
        Inscrivez-vous dès maintenant et donnez à votre enfant les clés d’un
        apprentissage réussi.
      </p>
      <div className="home-hero-actions centered-actions">
        <Link className="gold-button" to="/inscription">
          S’inscrire maintenant
        </Link>
        <Link className="white-button" to="/contact">
          Nous contacter
        </Link>
      </div>
    </section>
  )
}

function WhatsAppButton() {
  return (
    <a className="whatsapp-button" href="https://wa.me/" aria-label="WhatsApp">
      💬
    </a>
  )
}

function HomePage() {
  return (
    <div className="home-page">
      <Header />
      <main>
        <HomeHero />
        <HomePrograms />
        <HomeAdvantages />
        <HomeInscriptionSteps />
        <HomeFinalCta />
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  )
}

function FormationsPage() {
  return <Formations />
}

function InscriptionPage() {
  return <Inscription />
}

function ContactPage() {
  return <Contact />
}

function FAQPage() {
  return (
    <section className="faq-page">
      <div className="faq-heading">
        <p className="section-kicker">FAQ</p>
        <h1>Questions fréquentes</h1>
        <p>
          Retrouvez les réponses aux questions les plus courantes sur l’ISH
          Orléans.
        </p>
      </div>

      <div className="faq-list">
        {faqItems.map((item, index) => (
          <details className="faq-item" key={item.question} open={index === 0}>
            <summary>
              <span>{String(index + 1).padStart(2, '0')}</span>
              {item.question}
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>

      <div className="faq-cta">
        <h2>Vous avez encore une question ?</h2>
        <p>
          Notre équipe reste disponible pour vous accompagner dans votre
          inscription.
        </p>
        <div className="faq-actions">
          <Link className="white-button" to="/contact">
            Nous contacter
          </Link>
          <Link className="gold-button" to="/inscription">
            S’inscrire
          </Link>
        </div>
      </div>
    </section>
  )
}

function AboutPage() {
  return (
    <section className="about-page">
      <div className="about-shell">
        <section className="about-section about-mission">
          <p className="section-kicker">À propos</p>
          <h1>Notre mission</h1>
          <p>
            L’Institut des Sciences Humaines d’Orléans (ISH) est un
            établissement dédié à l’enseignement de la langue arabe et des
            sciences islamiques. Notre mission est d’offrir un cadre structuré,
            bienveillant et professionnel pour permettre à chacun – enfant,
            adolescent ou adulte – de progresser à son rythme dans
            l’apprentissage de la langue arabe et la compréhension des textes
            islamiques.
          </p>
        </section>

        <section className="about-section">
          <div className="about-heading">
            <h2>Nos valeurs</h2>
          </div>
          <div className="about-values-grid">
            {aboutValues.map((value) => (
              <article className="about-value-card" key={value.title}>
                <span aria-hidden="true">{value.icon}</span>
                <h3>{value.title}</h3>
                <p>{value.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="about-section about-approach">
          <h2>Notre approche</h2>
          <p>
            Nous proposons une pédagogie progressive et structurée, adaptée aux
            besoins de chaque tranche d’âge. Nos cours sont organisés par
            niveaux afin de garantir un apprentissage efficace. Le suivi de
            chaque élève est au cœur de notre démarche, permettant d’ajuster
            l’enseignement en fonction des progrès et des besoins individuels.
          </p>
        </section>
      </div>
    </section>
  )
}

function eventRegistrationsCount(eventId) {
  return getEventRegistrationsByEventId(eventId).length
}

function eventRemainingPlaces(eventItem) {
  const maxParticipants = Number(eventItem.maxParticipants) || 0

  if (maxParticipants <= 0) {
    return null
  }

  return Math.max(maxParticipants - eventRegistrationsCount(eventItem.id), 0)
}

function eventIsFull(eventItem) {
  const remaining = eventRemainingPlaces(eventItem)
  return remaining !== null && remaining <= 0
}

function EventsPublicPage() {
  const [events, setEvents] = useState(() => getEvents())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [eventForm, setEventForm] = useState({
    firstName: '',
    lastName: '',
    age: '',
  })
  const [eventMessage, setEventMessage] = useState('')
  const [eventError, setEventError] = useState('')

  function refreshEvents() {
    setEvents(getEvents())
  }

  function handleEventRegistrationSubmit(event) {
    event.preventDefault()
    setEventMessage('')
    setEventError('')

    if (!selectedEvent || selectedEvent.status !== 'Ouvert') {
      setEventError('Les inscriptions sont fermées pour cet événement.')
      return
    }

    if (eventIsFull(selectedEvent)) {
      setEventError('Événement complet')
      return
    }

    if (!eventForm.firstName || !eventForm.lastName || !eventForm.age) {
      setEventError('Veuillez renseigner le nom, le prénom et l’âge.')
      return
    }

    addEventRegistration({
      eventId: selectedEvent.id,
      firstName: eventForm.firstName,
      lastName: eventForm.lastName,
      age: eventForm.age,
    })
    setEventForm({ firstName: '', lastName: '', age: '' })
    setSelectedEvent(null)
    setEventMessage('Votre inscription à l’événement a bien été enregistrée.')
    refreshEvents()
  }

  return (
    <section className="events-page">
      <div className="faq-heading">
        <p className="section-kicker">Actualités</p>
        <h1>Actualités & événements</h1>
        <p>Découvrez les prochains événements organisés par l’ISH Orléans.</p>
      </div>

      {eventMessage ? (
        <div className="success-message public-event-message" role="status">
          {eventMessage}
        </div>
      ) : null}

      {events.length === 0 ? (
        <div className="events-empty">
          Aucun événement n’est publié pour le moment.
        </div>
      ) : (
        <div className="event-card-grid">
          {events.map((eventItem) => {
            const remaining = eventRemainingPlaces(eventItem)
            const isClosed = eventItem.status !== 'Ouvert'
            const isFull = eventIsFull(eventItem)

            return (
              <article className="event-card" key={eventItem.id}>
                <span className={`status-pill ${isClosed ? 'refusee' : 'validee'}`}>
                  {eventItem.status}
                </span>
                <h2>{eventItem.title}</h2>
                <p>{eventItem.description}</p>
                <dl>
                  <div>
                    <dt>Date</dt>
                    <dd>{formatDate(eventItem.date)}</dd>
                  </div>
                  <div>
                    <dt>Heure</dt>
                    <dd>
                      {eventItem.startTime || '--:--'} -{' '}
                      {eventItem.endTime || '--:--'}
                    </dd>
                  </div>
                  <div>
                    <dt>Lieu</dt>
                    <dd>{eventItem.location || '-'}</dd>
                  </div>
                  <div>
                    <dt>Places</dt>
                    <dd>
                      {remaining === null
                        ? 'Places disponibles'
                        : `${remaining} place(s) restante(s)`}
                    </dd>
                  </div>
                </dl>
                <button
                  className={isClosed || isFull ? 'disabled-event-button' : 'gold-button'}
                  disabled={isClosed || isFull}
                  onClick={() => {
                    setEventError('')
                    setSelectedEvent(eventItem)
                  }}
                  type="button"
                >
                  {isClosed
                    ? 'Inscriptions fermées'
                    : isFull
                      ? 'Événement complet'
                      : 'S’inscrire'}
                </button>
              </article>
            )
          })}
        </div>
      )}

      {selectedEvent ? (
        <div className="modal-backdrop" role="presentation">
          <form className="event-registration-modal" onSubmit={handleEventRegistrationSubmit}>
            <div className="modal-header">
              <div>
                <p className="section-kicker">Inscription événement</p>
                <h2>{selectedEvent.title}</h2>
              </div>
              <button onClick={() => setSelectedEvent(null)} type="button">
                Fermer
              </button>
            </div>
            {eventError ? (
              <div className="login-error" role="alert">
                {eventError}
              </div>
            ) : null}
            <label className="form-field" htmlFor="event-last-name">
              <span>Nom</span>
              <input
                id="event-last-name"
                onChange={(event) => {
                  const { value } = event.currentTarget
                  setEventForm((current) => ({
                    ...current,
                    lastName: value,
                  }))
                }}
                type="text"
                value={eventForm.lastName}
              />
            </label>
            <label className="form-field" htmlFor="event-first-name">
              <span>Prénom</span>
              <input
                id="event-first-name"
                onChange={(event) => {
                  const { value } = event.currentTarget
                  setEventForm((current) => ({
                    ...current,
                    firstName: value,
                  }))
                }}
                type="text"
                value={eventForm.firstName}
              />
            </label>
            <label className="form-field" htmlFor="event-age">
              <span>Âge</span>
              <input
                id="event-age"
                min="0"
                onChange={(event) => {
                  const { value } = event.currentTarget
                  setEventForm((current) => ({
                    ...current,
                    age: value,
                  }))
                }}
                type="number"
                value={eventForm.age}
              />
            </label>
            <button className="btn btn-primary submit-btn" type="submit">
              Valider mon inscription
            </button>
          </form>
        </div>
      ) : null}
    </section>
  )
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

function GalleryPublicPage() {
  const [categoryFilter, setCategoryFilter] = useState('Toutes')
  const [selectedImage, setSelectedImage] = useState(null)
  const publishedImages = getGalleryImages().filter((image) => image.isPublished)
  const filteredImages =
    categoryFilter === 'Toutes'
      ? publishedImages
      : publishedImages.filter((image) => image.category === categoryFilter)

  return (
    <section className="gallery-page">
      <div className="faq-heading">
        <p className="section-kicker">Galerie</p>
        <h1>Galerie</h1>
        <p>
          Découvrez quelques moments de vie de l’ISH Orléans : cours, événements
          et activités de l’institut.
        </p>
      </div>

      <div className="gallery-filters" aria-label="Filtres galerie">
        {['Toutes', ...galleryCategories].map((category) => (
          <button
            className={categoryFilter === category ? 'active' : ''}
            key={category}
            onClick={() => setCategoryFilter(category)}
            type="button"
          >
            {category}
          </button>
        ))}
      </div>

      {filteredImages.length === 0 ? (
        <div className="events-empty">Aucune image publiée pour le moment.</div>
      ) : (
        <div className="gallery-grid">
          {filteredImages.map((image) => (
            <button
              className="gallery-card"
              key={image.id}
              onClick={() => setSelectedImage(image)}
              type="button"
            >
              <img alt={image.title} src={image.imageUrl} />
              <span>{image.category}</span>
              <h2>{image.title}</h2>
              {image.description ? <p>{image.description}</p> : null}
            </button>
          ))}
        </div>
      )}

      {selectedImage ? (
        <div className="modal-backdrop" role="presentation">
          <section className="gallery-modal" role="dialog" aria-modal="true">
            <div className="modal-header">
              <div>
                <p className="section-kicker">{selectedImage.category}</p>
                <h2>{selectedImage.title}</h2>
              </div>
              <button onClick={() => setSelectedImage(null)} type="button">
                Fermer
              </button>
            </div>
            <img alt={selectedImage.title} src={selectedImage.imageUrl} />
            {selectedImage.description ? <p>{selectedImage.description}</p> : null}
          </section>
        </div>
      ) : null}
    </section>
  )
}

function PublicLayout({ children }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  )
}

const adminNavItems = [
  { label: 'Tableau de bord', path: '/admin/dashboard' },
  { label: 'Inscriptions', path: '/admin/inscriptions' },
  { label: 'Classes', path: '/admin/classes' },
  { label: 'Groupes d’inscription', path: '/admin/groups' },
  { label: 'Emploi du temps', path: '/admin/schedule' },
  { label: 'Actualités / Événements', path: '/admin/events' },
  { label: 'Galerie', path: '/admin/gallery' },
  { label: 'Paramètres', path: '/admin/settings' },
  { label: 'Utilisateurs', path: '/admin/users' },
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

function getRequestedCourses(registration) {
  if (registration.coursesWanted?.length > 0) {
    return registration.coursesWanted.map((course) => ({
      ...course,
      title: course.subject,
      details: {
        Niveau: course.level,
        Public: course.publicType,
        Disponibilité: course.availabilityType,
        'Jours disponibles': course.availableDays?.join(', '),
        'Créneau souhaité': course.preferredTime,
        'Groupe provisoire': course.groupKey,
        'Statut d’affectation': course.assignmentStatus || 'Pré-groupé',
        'Classe affectée': course.assignedClassName || '-',
      },
    }))
  }

  return (registration.selectedCourses || []).filter(
    (course) =>
      course.options?.length > 0 ||
      Object.values(course.details || {}).some((value) => value),
  )
}

function getAssignmentStatus(registration) {
  const courses = registration.coursesWanted || []

  if (courses.length === 0) {
    return { label: 'Non affecté', className: 'non-affecte' }
  }

  const assignedCount = courses.filter((course) => {
    return course.assignmentStatus === 'Affecté à une classe' || course.assignedClassId
  }).length

  if (assignedCount === 0) {
    return { label: 'Non affecté', className: 'non-affecte' }
  }

  if (assignedCount === courses.length) {
    return { label: 'Affecté', className: 'affecte' }
  }

  return { label: 'Partiellement affecté', className: 'partiellement-affecte' }
}

function normalizeAssignmentValue(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/langue|musulmane|tajwid|memorisation|sciences|cours/g, '')
    .replace(/adultes/g, 'adulte')
    .replace(/enfants/g, 'enfant')
    .replace(/ados/g, 'ado')
    .replace(/[^a-z0-9]+/g, '')
}

function normalizeSubject(value) {
  const normalized = normalizeAssignmentValue(value)

  if (normalized.includes('arabe')) return 'arabe'
  if (normalized.includes('coran')) return 'coran'
  if (normalized.includes('theologie')) return 'theologie'
  if (normalized.includes('initiationislam') || normalized.includes('islam')) return 'islam'
  if (normalized.includes('francais')) return 'francais'
  if (normalized.includes('anglais')) return 'anglais'
  if (normalized.includes('soutienscolaire')) return 'soutienscolaire'

  return normalized
}

function classHasAvailablePlace(classItem) {
  const maxStudents = Number(classItem.maxStudents) || 0
  return maxStudents === 0 || (classItem.students || []).length < maxStudents
}

function isCompatibleClass(course, classItem) {
  const subjectMatches = normalizeSubject(classItem.subject) === normalizeSubject(course.subject)
  const levelMatches =
    !course.level ||
    !classItem.level ||
    normalizeAssignmentValue(classItem.level) === normalizeAssignmentValue(course.level)
  const publicMatches =
    !course.publicType ||
    !classItem.publicType ||
    normalizeAssignmentValue(classItem.publicType) === normalizeAssignmentValue(course.publicType)
  const availabilityMatches =
    !course.availabilityType ||
    !classItem.availabilityType ||
    normalizeAssignmentValue(classItem.availabilityType) ===
      normalizeAssignmentValue(course.availabilityType)

  return subjectMatches && levelMatches && publicMatches && availabilityMatches
}

function formatClassOption(classItem) {
  const count = (classItem.students || []).length
  const max = Number(classItem.maxStudents) || 0
  const capacity = max > 0 ? `${count}/${max}` : `${count}/∞`
  const period = [classItem.availabilityType, classItem.preferredTime].filter(Boolean).join(' ')

  return `${classItem.name || classItem.subject} — ${period || 'Créneau libre'} — ${capacity} élèves`
}

function buildCourseGroupKey(course) {
  return [
    course.subject,
    course.level,
    course.publicType,
    course.availabilityType,
    course.preferredTime,
  ].join('|')
}

function formatRequestedCourses(registration) {
  const requestedCourses = getRequestedCourses(registration)

  if (requestedCourses.length === 0) {
    return '-'
  }

  return requestedCourses.map((course) => course.title).join(', ')
}

function formatRequestedLevels(registration) {
  const levels = getRequestedCourses(registration)
    .map((course) => course.details?.Niveau)
    .filter(Boolean)

  return levels.length > 0 ? levels.join(', ') : '-'
}

function formatDate(date) {
  if (!date) {
    return '-'
  }

  return new Date(date).toLocaleDateString('fr-FR')
}

function RegistrationDetailsModal({
  onClose,
  onDelete,
  onEdit,
  onStatusChange,
  registration,
}) {
  const personalInformation = registration.personalInformation || {}
  const requestedCourses = getRequestedCourses(registration)

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="registration-details-title"
        aria-modal="true"
        className="registration-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="section-kicker">Détail inscription</p>
            <h2 id="registration-details-title">
              {personalInformation.Prénom || 'Prénom'}{' '}
              {personalInformation.Nom || 'Nom'}
            </h2>
            <span className={`status-pill ${slugify(registration.status)}`}>
              {registration.status}
            </span>
          </div>
          <button onClick={onClose} type="button">
            Fermer
          </button>
        </div>

        <div className="modal-section-grid">
          <section className="detail-block">
            <h3>Informations personnelles</h3>
            <dl>
              {personalFields.map((field) => (
                <div key={field}>
                  <dt>{field}</dt>
                  <dd>{personalInformation[field] || '-'}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="detail-block">
            <h3>Validation</h3>
            <dl>
              <div>
                <dt>Date d’inscription</dt>
                <dd>{formatDate(registration.createdAt)}</dd>
              </div>
              <div>
                <dt>Type</dt>
                <dd>{registration.registrationType?.join(', ') || '-'}</dd>
              </div>
              <div>
                <dt>Fait à</dt>
                <dd>{registration.validation?.location || '-'}</dd>
              </div>
              <div>
                <dt>Date</dt>
                <dd>{registration.validation?.date || '-'}</dd>
              </div>
              <div>
                <dt>Signature numérique</dt>
                <dd>{registration.validation?.signature || '-'}</dd>
              </div>
              <div>
                <dt>Statut</dt>
                <dd>{registration.status}</dd>
              </div>
              <div>
                <dt>Classe affectée</dt>
                <dd>{registration.assignedClassName || '-'}</dd>
              </div>
            </dl>
          </section>
        </div>

        <section className="detail-block">
          <h3>Formation choisie et planning demandé</h3>
          {requestedCourses.length === 0 ? (
            <p>Aucune formation renseignée.</p>
          ) : (
            <div className="course-detail-list">
              {requestedCourses.map((course) => (
                <article key={course.id || course.title}>
                  <h4>{course.title}</h4>
                  <p>{course.options?.join(', ') || 'Aucune option cochée'}</p>
                  <dl>
                    {Object.entries(course.details || {}).map(([key, value]) => (
                      <div key={key}>
                        <dt>{key}</dt>
                        <dd>{value || '-'}</dd>
                      </div>
                    ))}
                  </dl>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="detail-block">
          <h3>Pièces à fournir</h3>
          <ul className="document-list">
            {requiredDocuments.map((document) => (
              <li key={document}>{document}</li>
            ))}
          </ul>
          <p className="warning-note">
            NB : Aucun remboursement possible en cas de désistement ou abandon.
          </p>
        </section>

        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onEdit} type="button">
            Modifier l’inscription
          </button>
          <button
            onClick={() => onStatusChange(registration.id, 'Refusée')}
            type="button"
          >
            Refuser l’inscription
          </button>
          <button
            className="danger-action"
            onClick={() => onDelete(registration.id)}
            type="button"
          >
            Supprimer
          </button>
        </div>
      </section>
    </div>
  )
}

function RegistrationEditModal({ onClose, onSave, registration }) {
  const editableCourses =
    registration.coursesWanted?.length > 0
      ? registration.coursesWanted
      : getRequestedCourses(registration).map((course) => ({
          id: `${slugify(course.title)}-${registration.id}`,
          subject: course.title,
          level: course.details?.Niveau || 'Débutant',
          publicType: course.details?.Public || 'Adulte',
          availabilityType: course.details?.['Disponibilité principale'] || 'Les deux',
          availableDays: [],
          preferredTime: course.details?.['Créneau souhaité'] || 'Peu importe',
          planning: course.details?.['Planning jours / heure'] || '',
          options: course.options || [],
          assignmentStatus: 'Non affecté',
          assignedClassId: '',
          assignedClassName: '',
        }))
  const [personalInformation, setPersonalInformation] = useState(() => ({
    ...personalFields.reduce((fields, field) => ({ ...fields, [field]: '' }), {}),
    ...(registration.personalInformation || {}),
  }))
  const [courses, setCourses] = useState(() =>
    editableCourses.map((course) => ({
      ...course,
      groupKey: course.groupKey || buildCourseGroupKey(course),
      assignmentAction: 'keep',
    })),
  )
  const [validation, setValidation] = useState(() => ({
    certified: Boolean(registration.validation?.certified),
    location: registration.validation?.location || '',
    date: registration.validation?.date || '',
    signature: registration.validation?.signature || '',
  }))
  const [status, setStatus] = useState(registration.status || 'En attente')
  const [isDirty, setIsDirty] = useState(false)

  function markDirty() {
    setIsDirty(true)
  }

  function updatePersonalField(field, value) {
    markDirty()
    setPersonalInformation((current) => ({ ...current, [field]: value }))
  }

  function updateCourseField(courseId, field, value) {
    markDirty()
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course
        }

        return {
          ...course,
          [field]: value,
        }
      }),
    )
  }

  function toggleCourseDay(courseId, day) {
    markDirty()
    setCourses((current) =>
      current.map((course) => {
        if (course.id !== courseId) {
          return course
        }

        const days = course.availableDays || []
        return {
          ...course,
          availableDays: days.includes(day)
            ? days.filter((currentDay) => currentDay !== day)
            : [...days, day],
        }
      }),
    )
  }

  function updateValidationField(field, value) {
    markDirty()
    setValidation((current) => ({ ...current, [field]: value }))
  }

  function handleClose() {
    if (
      isDirty &&
      !confirm('Des modifications n’ont pas été enregistrées. Voulez-vous vraiment quitter ?')
    ) {
      return
    }

    onClose()
  }

  function handleSubmit(event) {
    event.preventDefault()
    const normalizedCourses = courses.map((course) => {
      const shouldRemoveAssignment = course.assignmentAction === 'remove'
      const nextCourse = {
        ...course,
        groupKey: buildCourseGroupKey(course),
        assignmentStatus: shouldRemoveAssignment
          ? 'Non affecté'
          : course.assignmentStatus || 'Pré-groupé',
        assignedClassId: shouldRemoveAssignment ? '' : course.assignedClassId || '',
        assignedClassName: shouldRemoveAssignment ? '' : course.assignedClassName || '',
      }

      delete nextCourse.assignmentAction
      return nextCourse
    })
    const selectedCourses = normalizedCourses.map((course) => ({
      title: course.subject,
      options: course.options || [],
      details: {
        Niveau: course.level || '',
        Public: course.publicType || '',
        'Disponibilité principale': course.availabilityType || '',
        'Jours disponibles': course.availableDays?.join(', ') || '',
        'Créneau souhaité': course.preferredTime || '',
        'Planning jours / heure': course.planning || '',
      },
    }))
    const payload = {
      ...registration,
      personalInformation,
      coursesWanted: normalizedCourses,
      selectedCourses,
      validation,
      status,
    }
    const coursesToUnassign = courses.filter((course) => {
      return course.assignmentAction === 'remove' && course.assignedClassId
    })

    onSave(registration.id, payload, coursesToUnassign)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="registration-edit-title"
        aria-modal="true"
        className="registration-modal registration-edit-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="section-kicker">Modification inscription</p>
            <h2 id="registration-edit-title">
              {personalInformation.Prénom || 'Prénom'} {personalInformation.Nom || 'Nom'}
            </h2>
          </div>
          <button onClick={handleClose} type="button">Fermer</button>
        </div>

        <form className="registration-edit-form" onSubmit={handleSubmit}>
          <section className="detail-block">
            <h3>Informations personnelles</h3>
            <div className="class-form-grid">
              {personalFields.map((field) => (
                <label className="form-field" key={field}>
                  <span>{field}</span>
                  <input
                    onChange={(event) =>
                      updatePersonalField(field, event.currentTarget.value)
                    }
                    type={inputType(field)}
                    value={personalInformation[field] || ''}
                  />
                </label>
              ))}
            </div>
          </section>

          <section className="detail-block">
            <h3>Cours demandés</h3>
            {courses.length === 0 ? (
              <p>Aucun cours demandé dans cette inscription.</p>
            ) : (
              <div className="assignment-course-list">
                {courses.map((course) => {
                  const originalCourse = (registration.coursesWanted || []).find(
                    (item) => item.id === course.id,
                  )
                  const sensitiveChanged =
                    course.assignedClassId &&
                    originalCourse &&
                    (originalCourse.subject !== course.subject ||
                      originalCourse.level !== course.level)

                  return (
                    <article className="assignment-course-card" key={course.id}>
                      <div className="assignment-course-header">
                        <h3>{course.subject || 'Cours'}</h3>
                        <span className={`assignment-status ${course.assignedClassId ? 'affecte' : 'non-affecte'}`}>
                          {course.assignedClassName || course.assignmentStatus || 'Non affecté'}
                        </span>
                      </div>
                      {sensitiveChanged ? (
                        <div className="login-error assignment-message" role="alert">
                          Attention : ce cours est déjà affecté à une classe. Modifier la matière ou le niveau peut rendre l’affectation incohérente.
                        </div>
                      ) : null}
                      <div className="class-form-grid">
                        <label className="form-field">
                          <span>Matière</span>
                          <select
                            onChange={(event) =>
                              updateCourseField(course.id, 'subject', event.currentTarget.value)
                            }
                            value={course.subject || ''}
                          >
                            {courseGroups.map((group) => (
                              <option key={group.title}>{group.title}</option>
                            ))}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Niveau</span>
                          <select
                            onChange={(event) =>
                              updateCourseField(course.id, 'level', event.currentTarget.value)
                            }
                            value={course.level || ''}
                          >
                            {levelOptions.map((level) => <option key={level}>{level}</option>)}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Public</span>
                          <select
                            onChange={(event) =>
                              updateCourseField(course.id, 'publicType', event.currentTarget.value)
                            }
                            value={course.publicType || ''}
                          >
                            {publicTypeOptions.map((publicType) => <option key={publicType}>{publicType}</option>)}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Disponibilité</span>
                          <select
                            onChange={(event) =>
                              updateCourseField(course.id, 'availabilityType', event.currentTarget.value)
                            }
                            value={course.availabilityType || ''}
                          >
                            {availabilityOptions.map((availability) => <option key={availability}>{availability}</option>)}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Créneau souhaité</span>
                          <select
                            onChange={(event) =>
                              updateCourseField(course.id, 'preferredTime', event.currentTarget.value)
                            }
                            value={course.preferredTime || ''}
                          >
                            {preferredTimeOptions.map((time) => <option key={time}>{time}</option>)}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Planning demandé</span>
                          <input
                            onChange={(event) =>
                              updateCourseField(course.id, 'planning', event.currentTarget.value)
                            }
                            type="text"
                            value={course.planning || ''}
                          />
                        </label>
                      </div>
                      <fieldset className="checkbox-panel">
                        <legend>Jours disponibles</legend>
                        <div className="checkbox-grid compact-checkboxes">
                          {dayOptions.map((day) => (
                            <label key={day}>
                              <input
                                checked={(course.availableDays || []).includes(day)}
                                onChange={() => toggleCourseDay(course.id, day)}
                                type="checkbox"
                              />
                              <span>{day}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      {course.assignedClassId ? (
                        <fieldset className="checkbox-panel">
                          <legend>Affectation existante</legend>
                          <div className="status-options">
                            <label>
                              <input
                                checked={course.assignmentAction !== 'remove'}
                                name={`assignment-action-${course.id}`}
                                onChange={() => updateCourseField(course.id, 'assignmentAction', 'keep')}
                                type="radio"
                              />
                              <span>Conserver l’affectation actuelle</span>
                            </label>
                            <label>
                              <input
                                checked={course.assignmentAction === 'remove'}
                                name={`assignment-action-${course.id}`}
                                onChange={() => updateCourseField(course.id, 'assignmentAction', 'remove')}
                                type="radio"
                              />
                              <span>Retirer l’affectation de ce cours</span>
                            </label>
                          </div>
                        </fieldset>
                      ) : null}
                      <p className="schedule-empty">
                        Groupe recalculé : {buildCourseGroupKey(course)}
                      </p>
                    </article>
                  )
                })}
              </div>
            )}
          </section>

          <section className="detail-block">
            <h3>Validation</h3>
            <div className="class-form-grid">
              <label className="form-field">
                <span>Fait à</span>
                <input
                  onChange={(event) => updateValidationField('location', event.currentTarget.value)}
                  type="text"
                  value={validation.location}
                />
              </label>
              <label className="form-field">
                <span>Date</span>
                <input
                  onChange={(event) => updateValidationField('date', event.currentTarget.value)}
                  type="date"
                  value={validation.date}
                />
              </label>
              <label className="form-field">
                <span>Signature numérique</span>
                <input
                  onChange={(event) => updateValidationField('signature', event.currentTarget.value)}
                  type="text"
                  value={validation.signature}
                />
              </label>
              <label className="form-field">
                <span>Statut de l’inscription</span>
                <select
                  onChange={(event) => {
                    markDirty()
                    setStatus(event.currentTarget.value)
                  }}
                  value={status}
                >
                  <option>En attente</option>
                  <option>Validée</option>
                  <option>Refusée</option>
                </select>
              </label>
            </div>
          </section>

          <div className="modal-actions">
            <button className="btn btn-primary" type="submit">
              Enregistrer les modifications
            </button>
            <button onClick={handleClose} type="button">Annuler</button>
          </div>
        </form>
      </section>
    </div>
  )
}

function AssignmentModal({
  classes,
  onAssign,
  onClose,
  onCreateClass,
  registration,
  teachers,
}) {
  const personalInformation = registration.personalInformation || {}
  const courses = registration.coursesWanted || []
  const [showAllClasses, setShowAllClasses] = useState(false)
  const [selectedClasses, setSelectedClasses] = useState({})
  const [creatingCourseId, setCreatingCourseId] = useState('')
  const [quickClassForm, setQuickClassForm] = useState({})
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  function classesForCourse(course) {
    return classes.filter((classItem) => {
      return showAllClasses || isCompatibleClass(course, classItem)
    })
  }

  function handleAssign(course) {
    setMessage('')
    setError('')
    const classId = selectedClasses[course.id]

    if (!classId) {
      setError('Veuillez sélectionner une classe.')
      return
    }

    const targetClass = classes.find((classItem) => classItem.id === classId)
    if (targetClass && !classHasAvailablePlace(targetClass)) {
      setError('Cette classe est complète.')
      return
    }

    const result = onAssign(registration.id, course.id, classId)

    if (result?.error === 'CLASS_FULL') {
      setError('Cette classe est complète.')
      return
    }

    if (result?.error === 'DUPLICATE_COURSE') {
      setError('Cet élève est déjà affecté à une classe pour ce cours.')
      return
    }

    if (result?.error) {
      setError('Affectation impossible pour ce cours.')
      return
    }

    setMessage('Élève affecté avec succès.')
  }

  function startQuickClass(course) {
    const generatedName = [
      course.subject,
      course.level,
      course.publicType,
      course.availabilityType,
      course.preferredTime,
    ]
      .filter(Boolean)
      .join(' ')

    setCreatingCourseId(course.id)
    setQuickClassForm({
      name: generatedName ? `${generatedName} - Classe 1` : 'Nouvelle classe',
      subject: course.subject || '',
      level: course.level || '',
      publicType: course.publicType || '',
      availabilityType: course.availabilityType || '',
      preferredTime: course.preferredTime || '',
      days: course.availableDays || [],
      teacherId: '',
      startTime: '',
      endTime: '',
      maxStudents: '15',
    })
  }

  function updateQuickClassField(event) {
    const { name, value } = event.currentTarget
    setQuickClassForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function toggleQuickClassDay(day) {
    setQuickClassForm((current) => {
      const days = current.days || []
      return {
        ...current,
        days: days.includes(day)
          ? days.filter((currentDay) => currentDay !== day)
          : [...days, day],
      }
    })
  }

  function handleQuickClassSubmit(event, course) {
    event.preventDefault()
    setMessage('')
    setError('')

    const teacher = teachers.find((user) => user.id === quickClassForm.teacherId)
    const payload = {
      ...quickClassForm,
      day: (quickClassForm.days || []).join(', '),
      teacher: teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() : '',
      maxStudents: Number(quickClassForm.maxStudents) || 15,
      students: [],
      sourcePreGroupKey: course.groupKey || '',
      creationMode: 'Manuel',
    }

    const result = onCreateClass(registration, course, payload)

    if (result?.error === 'CLASS_FULL') {
      setError('Cette classe est complète.')
      return
    }

    if (result?.error) {
      setError('La classe a été créée, mais l’affectation a échoué.')
      return
    }

    setCreatingCourseId('')
    setMessage('Élève affecté avec succès.')
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="assignment-modal-title"
        aria-modal="true"
        className="registration-modal assignment-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="section-kicker">Affectation rapide</p>
            <h2 id="assignment-modal-title">
              {personalInformation.Prénom || 'Prénom'} {personalInformation.Nom || 'Nom'}
            </h2>
            <span className={`assignment-status ${getAssignmentStatus(registration).className}`}>
              {getAssignmentStatus(registration).label}
            </span>
          </div>
          <button onClick={onClose} type="button">
            Fermer
          </button>
        </div>

        <label className="inline-check assignment-toggle">
          <input
            checked={showAllClasses}
            onChange={(event) => setShowAllClasses(event.currentTarget.checked)}
            type="checkbox"
          />
          <span>Afficher toutes les classes</span>
        </label>

        {message ? (
          <div className="success-message assignment-message" role="status">
            {message}
          </div>
        ) : null}
        {error ? (
          <div className="login-error assignment-message" role="alert">
            {error}
          </div>
        ) : null}

        {courses.length === 0 ? (
          <div className="admin-empty-state">
            <h2>Aucun cours demandé</h2>
            <p>Cette inscription ne contient pas encore de cours exploitable.</p>
          </div>
        ) : (
          <div className="assignment-course-list">
            {courses.map((course) => {
              const availableClasses = classesForCourse(course)

              return (
                <article className="assignment-course-card" key={course.id}>
                  <div className="assignment-course-header">
                    <div>
                      <h3>{course.subject}</h3>
                      <div className="group-badges">
                        <span>{course.level || 'Niveau non renseigné'}</span>
                        <span>{course.publicType || 'Public non renseigné'}</span>
                        <span>{course.availabilityType || 'Disponibilité non renseignée'}</span>
                        <span>{course.preferredTime || 'Créneau non renseigné'}</span>
                      </div>
                    </div>
                    <span className={`assignment-status ${course.assignedClassId ? 'affecte' : 'non-affecte'}`}>
                      {course.assignmentStatus || 'Pré-groupé'}
                    </span>
                  </div>

                  <dl className="assignment-course-meta">
                    <div>
                      <dt>Jours disponibles</dt>
                      <dd>{course.availableDays?.join(', ') || '-'}</dd>
                    </div>
                    <div>
                      <dt>Classe actuelle</dt>
                      <dd>{course.assignedClassName || '-'}</dd>
                    </div>
                  </dl>

                  <div className="assignment-panel">
                    <label className="form-field" htmlFor={`assign-${course.id}`}>
                      <span>Classe compatible</span>
                      <select
                        id={`assign-${course.id}`}
                        onChange={(event) =>
                          setSelectedClasses((current) => ({
                            ...current,
                            [course.id]: event.currentTarget.value,
                          }))
                        }
                        value={selectedClasses[course.id] || ''}
                      >
                        <option value="">Sélectionner une classe</option>
                        {availableClasses.map((classItem) => {
                          const isFull = !classHasAvailablePlace(classItem)

                          return (
                            <option
                              disabled={isFull}
                              key={classItem.id}
                              value={classItem.id}
                            >
                              {formatClassOption(classItem)}
                              {isFull ? ' — Complet' : ''}
                            </option>
                          )
                        })}
                      </select>
                    </label>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleAssign(course)}
                      type="button"
                    >
                      Affecter
                    </button>
                  </div>

                  <button
                    className="btn btn-secondary"
                    onClick={() => startQuickClass(course)}
                    type="button"
                  >
                    Créer une nouvelle classe pour ce cours
                  </button>

                  {creatingCourseId === course.id ? (
                    <form
                      className="quick-class-form"
                      onSubmit={(event) => handleQuickClassSubmit(event, course)}
                    >
                      <div className="class-form-grid">
                        <label className="form-field">
                          <span>Nom de classe</span>
                          <input
                            name="name"
                            onChange={updateQuickClassField}
                            required
                            type="text"
                            value={quickClassForm.name || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Matière</span>
                          <input
                            name="subject"
                            onChange={updateQuickClassField}
                            type="text"
                            value={quickClassForm.subject || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Niveau</span>
                          <input
                            name="level"
                            onChange={updateQuickClassField}
                            type="text"
                            value={quickClassForm.level || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Public</span>
                          <input
                            name="publicType"
                            onChange={updateQuickClassField}
                            type="text"
                            value={quickClassForm.publicType || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Disponibilité</span>
                          <input
                            name="availabilityType"
                            onChange={updateQuickClassField}
                            type="text"
                            value={quickClassForm.availabilityType || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Créneau</span>
                          <input
                            name="preferredTime"
                            onChange={updateQuickClassField}
                            type="text"
                            value={quickClassForm.preferredTime || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Professeur</span>
                          <select
                            name="teacherId"
                            onChange={updateQuickClassField}
                            value={quickClassForm.teacherId || ''}
                          >
                            <option value="">Aucun professeur</option>
                            {teachers.map((teacher) => (
                              <option key={teacher.id} value={teacher.id}>
                                {teacher.firstName} {teacher.lastName}
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="form-field">
                          <span>Heure début</span>
                          <input
                            name="startTime"
                            onChange={updateQuickClassField}
                            type="time"
                            value={quickClassForm.startTime || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Heure fin</span>
                          <input
                            name="endTime"
                            onChange={updateQuickClassField}
                            type="time"
                            value={quickClassForm.endTime || ''}
                          />
                        </label>
                        <label className="form-field">
                          <span>Maximum élèves</span>
                          <input
                            min="1"
                            name="maxStudents"
                            onChange={updateQuickClassField}
                            type="number"
                            value={quickClassForm.maxStudents || '15'}
                          />
                        </label>
                      </div>
                      <fieldset className="checkbox-panel">
                        <legend>Jours</legend>
                        <div className="checkbox-grid compact-checkboxes">
                          {dayOptions.map((day) => (
                            <label key={day}>
                              <input
                                checked={(quickClassForm.days || []).includes(day)}
                                onChange={() => toggleQuickClassDay(day)}
                                type="checkbox"
                              />
                              <span>{day}</span>
                            </label>
                          ))}
                        </div>
                      </fieldset>
                      <div className="modal-actions">
                        <button className="btn btn-primary" type="submit">
                          Créer et affecter
                        </button>
                        <button onClick={() => setCreatingCourseId('')} type="button">
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
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
      getRegistrations().find((registration) => registration.id === studentId),
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

function ScheduleEditModal({ classItem, onClose, onSave, teachers }) {
  const [form, setForm] = useState(() => ({
    days: classDays(classItem),
    startTime: classItem.startTime || '',
    endTime: classItem.endTime || '',
    room: classItem.room || '',
    teacherId: classItem.teacherId || '',
  }))

  function updateField(event) {
    const { name, value } = event.currentTarget
    setForm((current) => ({ ...current, [name]: value }))
  }

  function toggleDay(day) {
    setForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((currentDay) => currentDay !== day)
        : [...current.days, day],
    }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    onSave(classItem.id, form)
  }

  return (
    <div className="modal-backdrop" role="presentation">
      <section
        aria-labelledby="schedule-edit-title"
        aria-modal="true"
        className="registration-modal schedule-edit-modal"
        role="dialog"
      >
        <div className="modal-header">
          <div>
            <p className="section-kicker">Modification horaire</p>
            <h2 id="schedule-edit-title">{classItem.name}</h2>
          </div>
          <button onClick={onClose} type="button">Fermer</button>
        </div>
        <form className="quick-class-form" onSubmit={handleSubmit}>
          <fieldset className="checkbox-panel">
            <legend>Jours de cours</legend>
            <div className="checkbox-grid compact-checkboxes">
              {dayOptions.map((day) => (
                <label key={day}>
                  <input
                    checked={form.days.includes(day)}
                    onChange={() => toggleDay(day)}
                    type="checkbox"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <div className="class-form-grid">
            <label className="form-field">
              <span>Heure de début</span>
              <input name="startTime" onChange={updateField} type="time" value={form.startTime} />
            </label>
            <label className="form-field">
              <span>Heure de fin</span>
              <input name="endTime" onChange={updateField} type="time" value={form.endTime} />
            </label>
            <label className="form-field">
              <span>Salle</span>
              <input name="room" onChange={updateField} type="text" value={form.room} />
            </label>
            <label className="form-field">
              <span>Professeur assigné</span>
              <select name="teacherId" onChange={updateField} value={form.teacherId}>
                <option value="">Aucun professeur</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.firstName} {teacher.lastName}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="modal-actions">
            <button className="btn btn-primary" type="submit">Enregistrer l’horaire</button>
            <button onClick={onClose} type="button">Annuler</button>
          </div>
        </form>
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
  const student = getRegistrations().find((registration) => registration.id === id)
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
  const [registrations] = useState(() => getRegistrations())
  const [classes] = useState(() => getClasses())
  const [settings, setSettings] = useState(() => getSettings())
  const pendingRegistrations = registrations.filter(
    (registration) => registration.status === 'En attente',
  ).length
  const approvedRegistrations = registrations.filter(
    (registration) => registration.status === 'Validée',
  ).length
  const refusedRegistrations = registrations.filter(
    (registration) => registration.status === 'Refusée',
  ).length

  function handleRegistrationToggle() {
    setSettings(setRegistrationOpen(!settings.registrationOpen))
  }

  return (
    <>
      <AdminPageHeader
        title="Tableau de bord"
        description="Vue d’ensemble des inscriptions, classes et paramètres de l’institut."
      />
      <div className="admin-card-grid">
        <article className="admin-card">
          <span>Total inscriptions</span>
          <strong>{registrations.length}</strong>
          <p>Dossiers enregistrés dans le stockage local.</p>
        </article>
        <article className="admin-card">
          <span>En attente</span>
          <strong>{pendingRegistrations}</strong>
          <p>Inscriptions à traiter.</p>
        </article>
        <article className="admin-card">
          <span>Validées</span>
          <strong>{approvedRegistrations}</strong>
          <p>Dossiers acceptés.</p>
        </article>
        <article className="admin-card">
          <span>Refusées</span>
          <strong>{refusedRegistrations}</strong>
          <p>Dossiers non retenus.</p>
        </article>
        <article className="admin-card">
          <span>Classes créées</span>
          <strong>{classes.length}</strong>
          <p>Groupes pédagogiques configurés.</p>
        </article>
        <article className="admin-card">
          <span>Statut inscriptions</span>
          <strong>{settings.registrationOpen ? 'Ouvertes' : 'Fermées'}</strong>
          <p>
            Année scolaire {settings.schoolYear}.
          </p>
        </article>
      </div>

      <section className="admin-quick-actions" aria-labelledby="quick-actions-title">
        <div>
          <p className="section-kicker">Actions rapides</p>
          <h2 id="quick-actions-title">Pilotage courant</h2>
        </div>
        <div className="quick-action-grid">
          <Link className="quick-action-card" to="/admin/inscriptions">
            <span>Voir les inscriptions</span>
            <strong>Consulter les dossiers reçus</strong>
          </Link>
          <Link className="quick-action-card" to="/admin/classes">
            <span>Gérer les classes</span>
            <strong>Organiser les groupes</strong>
          </Link>
          <button
            className="quick-action-card quick-action-button"
            onClick={handleRegistrationToggle}
            type="button"
          >
            <span>Ouvrir / fermer les inscriptions</span>
            <strong>
              Passer en statut {settings.registrationOpen ? 'fermé' : 'ouvert'}
            </strong>
          </button>
        </div>
      </section>
    </>
  )
}

function updateTeacherAssignmentsForSchedule(classId, teacherId) {
  getUsers()
    .filter((user) => user.role === 'teacher')
    .forEach((teacher) => {
      const assignedClassIds = teacher.assignedClassIds || []
      const nextAssignedClassIds =
        teacher.id === teacherId
          ? [...new Set([...assignedClassIds, classId])]
          : assignedClassIds.filter((assignedClassId) => assignedClassId !== classId)

      if (nextAssignedClassIds.join('|') !== assignedClassIds.join('|')) {
        updateUser(teacher.id, { assignedClassIds: nextAssignedClassIds })
      }
    })
}

function AdminSchedulePage() {
  const [entries, setEntries] = useState(() => getGlobalSchedule())
  const [classes, setClasses] = useState(() => getClasses())
  const [editingClass, setEditingClass] = useState(null)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const [scheduleView, setScheduleView] = useState('grid')
  const [teacherFilter, setTeacherFilter] = useState('Tous')
  const [subjectFilter, setSubjectFilter] = useState('Toutes')
  const [levelFilter, setLevelFilter] = useState('Tous')
  const [publicFilter, setPublicFilter] = useState('Tous')
  const [dayFilter, setDayFilter] = useState('Tous')
  const [searchQuery, setSearchQuery] = useState('')
  const teachers = getUsers().filter((user) => user.role === 'teacher')
  const subjects = ['Toutes', ...new Set(classes.map((classItem) => classItem.subject).filter(Boolean))]
  const levels = ['Tous', ...new Set(classes.map((classItem) => classItem.level).filter(Boolean))]
  const unscheduledClasses = getClassesWithoutSchedule()

  function refreshSchedule() {
    setClasses(getClasses())
    setEntries(getGlobalSchedule())
  }

  function handleSaveSchedule(classId, form) {
    updateClassSchedule(classId, form)
    updateTeacherAssignmentsForSchedule(classId, form.teacherId)
    refreshSchedule()
    setEditingClass(null)
  }

  const filteredEntries = entries.filter((entry) => {
    const matchesTeacher = teacherFilter === 'Tous' || entry.teacherId === teacherFilter
    const matchesSubject = subjectFilter === 'Toutes' || entry.subject === subjectFilter
    const matchesLevel = levelFilter === 'Tous' || entry.level === levelFilter
    const matchesPublic = publicFilter === 'Tous' || entry.publicType === publicFilter
    const matchesDay = dayFilter === 'Tous' || entry.day === dayFilter
    const matchesSearch = (entry.name || '').toLowerCase().includes(searchQuery.toLowerCase().trim())

    return matchesTeacher && matchesSubject && matchesLevel && matchesPublic && matchesDay && matchesSearch
  })

  return (
    <>
      <AdminPageHeader
        title="Emploi du temps général"
        description="Vue globale des cours, classes et professeurs assignés."
      />

      <div className="admin-filters schedule-filters">
        <label className="form-field">
          <span>Professeur</span>
          <select onChange={(event) => setTeacherFilter(event.currentTarget.value)} value={teacherFilter}>
            <option>Tous</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Matière</span>
          <select onChange={(event) => setSubjectFilter(event.currentTarget.value)} value={subjectFilter}>
            {subjects.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Niveau</span>
          <select onChange={(event) => setLevelFilter(event.currentTarget.value)} value={levelFilter}>
            {levels.map((level) => <option key={level}>{level}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Public</span>
          <select onChange={(event) => setPublicFilter(event.currentTarget.value)} value={publicFilter}>
            <option>Tous</option><option>Enfants</option><option>Enfant</option><option>Adolescents</option><option>Ado</option><option>Adultes</option><option>Adulte</option>
          </select>
        </label>
        <label className="form-field">
          <span>Jour</span>
          <select onChange={(event) => setDayFilter(event.currentTarget.value)} value={dayFilter}>
            <option>Tous</option>
            {dayOptions.map((day) => <option key={day}>{day}</option>)}
          </select>
        </label>
        <label className="form-field">
          <span>Recherche</span>
          <input onChange={(event) => setSearchQuery(event.currentTarget.value)} placeholder="Nom de classe" type="search" value={searchQuery} />
        </label>
      </div>

      <div className="schedule-view-toggle">
        <button
          className={scheduleView === 'grid' ? 'active' : ''}
          onClick={() => setScheduleView('grid')}
          type="button"
        >
          Vue grille hebdomadaire
        </button>
        <button
          className={scheduleView === 'table' ? 'active' : ''}
          onClick={() => setScheduleView('table')}
          type="button"
        >
          Vue tableau liste
        </button>
      </div>

      <SubjectLegend />

      {scheduleView === 'grid' ? (
        <ScheduleGrid entries={filteredEntries} onSelect={setSelectedEntry} />
      ) : null}

      <section className="admin-quick-actions">
        <div>
          <p className="section-kicker">À compléter</p>
          <h2>Classes sans horaire</h2>
        </div>
        {unscheduledClasses.length === 0 ? (
          <p>Toutes les classes ont un horaire défini.</p>
        ) : (
          <div className="schedule-unscheduled-list">
            {unscheduledClasses.map((classItem) => (
              <button key={classItem.id} onClick={() => setEditingClass(classItem)} type="button">
                {classItem.name} · <span>Horaire non défini</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {scheduleView === 'table' ? (
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr><th>Jour</th><th>Heure</th><th>Classe</th><th>Matière</th><th>Niveau</th><th>Public</th><th>Professeur</th><th>Élèves</th><th>Salle</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {filteredEntries.map((entry) => (
              <tr key={`${entry.id}-${entry.day}`}>
                <td>{entry.day}</td>
                <td>{entry.startTime || '--:--'} - {entry.endTime || '--:--'}</td>
                <td>{entry.name}</td>
                <td>{entry.subject || '-'}</td>
                <td>{entry.level || '-'}</td>
                <td>{entry.publicType || '-'}</td>
                <td>{teacherNameForClass(entry)}</td>
                <td>{(entry.students || []).length} / {entry.maxStudents || '∞'}</td>
                <td>{entry.room || '-'}</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => setEditingClass(classes.find((item) => item.id === entry.id))} type="button">Modifier l’horaire</button>
                    <Link to="/admin/classes">Voir la classe</Link>
                    {entry.teacherId ? <Link to={`/admin/teachers/${entry.teacherId}/schedule`}>Voir l’emploi du temps du professeur</Link> : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      ) : null}

      <ScheduleDetailsModal
        canEdit
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
        onEdit={(entry) => {
          setSelectedEntry(null)
          setEditingClass(classes.find((item) => item.id === entry.id))
        }}
      />
      {editingClass ? (
        <ScheduleEditModal
          classItem={editingClass}
          onClose={() => setEditingClass(null)}
          onSave={handleSaveSchedule}
          teachers={teachers}
        />
      ) : null}
    </>
  )
}

function AdminTeacherSchedulePage() {
  const { id } = useParams()
  const teacher = getUsers().find((user) => user.id === id && user.role === 'teacher')
  const entries = getTeacherSchedule(id)
  const assignedClasses = classesForTeacher(id)
  const [selectedEntry, setSelectedEntry] = useState(null)
  const studentCount = assignedClasses.reduce(
    (total, classItem) => total + (classItem.students?.length || 0),
    0,
  )

  if (!teacher) {
    return <div className="admin-empty-state"><h2>Professeur introuvable</h2><p>Ce compte professeur n’existe pas.</p></div>
  }

  return (
    <>
      <AdminPageHeader
        title={`Emploi du temps de ${teacher.firstName} ${teacher.lastName}`}
        description={teacher.email}
      />
      <div className="admin-card-grid">
        <article className="admin-card"><span>Classes assignées</span><strong>{assignedClasses.length}</strong><p>Groupes liés au professeur.</p></article>
        <article className="admin-card"><span>Élèves</span><strong>{studentCount}</strong><p>Total des élèves dans ses classes.</p></article>
      </div>
      <Link className="btn btn-primary submit-btn schedule-back-link" to="/admin/schedule">
        Retour à l’emploi du temps général
      </Link>
      <SubjectLegend />
      <ScheduleGrid entries={entries} onSelect={setSelectedEntry} />
      <ScheduleDetailsModal
        entry={selectedEntry}
        onClose={() => setSelectedEntry(null)}
      />
    </>
  )
}

function AdminInscriptionsPage() {
  const [registrations, setRegistrations] = useState(() => getRegistrations())
  const [classes, setClasses] = useState(() => getClasses())
  const [searchQuery, setSearchQuery] = useState('')
  const [formationFilter, setFormationFilter] = useState('Toutes')
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [assignmentFilter, setAssignmentFilter] = useState('Toutes')
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [assignmentRegistration, setAssignmentRegistration] = useState(null)
  const [editingRegistration, setEditingRegistration] = useState(null)
  const [quickAssignRegistrationId, setQuickAssignRegistrationId] = useState('')
  const [pageMessage, setPageMessage] = useState('')
  const teachers = getUsers().filter((user) => user.role === 'teacher' && user.isActive)
  const formationOptions = [
    'Toutes',
    ...new Set(
      registrations.flatMap((registration) =>
        getRequestedCourses(registration).map((course) => course.title),
      ),
    ),
  ]
  const filteredRegistrations = registrations.filter((registration) => {
    const personalInformation = registration.personalInformation || {}
    const fullName = `${personalInformation.Nom || ''} ${
      personalInformation.Prénom || ''
    }`.toLowerCase()
    const matchesSearch = fullName.includes(searchQuery.toLowerCase().trim())
    const requestedCourses = getRequestedCourses(registration)
    const matchesFormation =
      formationFilter === 'Toutes' ||
      requestedCourses.some((course) => course.title === formationFilter)
    const matchesStatus =
      statusFilter === 'Tous' || registration.status === statusFilter
    const assignmentStatus = getAssignmentStatus(registration).label
    const matchesAssignment =
      assignmentFilter === 'Toutes' || assignmentFilter === assignmentStatus

    return matchesSearch && matchesFormation && matchesStatus && matchesAssignment
  })

  function refreshRegistrations() {
    setRegistrations(getRegistrations())
    setClasses(getClasses())
  }

  function handleStatusChange(id, status) {
    updateRegistrationStatus(id, status)
    refreshRegistrations()
    setPageMessage(status === 'Validée' ? 'Inscription validée.' : '')
    setQuickAssignRegistrationId(status === 'Validée' ? id : '')
    setSelectedRegistration((current) =>
      current?.id === id ? { ...current, status } : current,
    )
  }

  function handleDetailStatusChange(id, status) {
    handleStatusChange(id, status)
    if (status === 'Refusée') {
      setSelectedRegistration(null)
    }
  }

  function handleDelete(id) {
    if (!confirm('Voulez-vous vraiment supprimer cette inscription ?')) {
      return
    }

    deleteRegistration(id)
    refreshRegistrations()
    setSelectedRegistration(null)
  }

  function openAssignment(registration) {
    if (registration.status !== 'Validée') {
      alert('Vous devez d’abord valider l’inscription avant de l’affecter à une classe.')
      return
    }

    setAssignmentRegistration(registration)
  }

  function handleCourseAssignment(registrationId, courseId, classId) {
    const result = moveStudentToClass(registrationId, classId, courseId)

    refreshRegistrations()
    if (!result?.error) {
      setPageMessage('Élève affecté avec succès.')
      setAssignmentRegistration(result.registration)
      setSelectedRegistration((current) =>
        current?.id === registrationId ? result.registration : current,
      )
    }

    return result
  }

  function handleQuickClassCreate(registration, course, classPayload) {
    const newClass = addClass(classPayload)

    if (classPayload.teacherId) {
      const teacher = teachers.find((user) => user.id === classPayload.teacherId)
      if (teacher) {
        updateUser(teacher.id, {
          assignedClassIds: [
            ...new Set([...(teacher.assignedClassIds || []), newClass.id]),
          ],
        })
      }
    }

    return handleCourseAssignment(registration.id, course.id, newClass.id)
  }

  function handleRegistrationUpdate(registrationId, payload, coursesToUnassign = []) {
    coursesToUnassign.forEach((course) => {
      if (course.assignedClassId) {
        removeStudentFromClass(registrationId, course.assignedClassId)
      }
    })

    const updated = updateRegistration(registrationId, payload)
    refreshRegistrations()
    setSelectedRegistration((current) =>
      current?.id === registrationId ? updated : current,
    )
    setAssignmentRegistration((current) =>
      current?.id === registrationId ? updated : current,
    )
    setEditingRegistration(null)
    setPageMessage('L’inscription a bien été modifiée.')
  }

  return (
    <>
      <AdminPageHeader
        title="Gestion des inscriptions"
        description="Suivez les fiches reçues, leur statut et les pièces à fournir."
      />
      {registrations.length === 0 ? (
        <div className="admin-empty-state">
          <h2>Aucune inscription enregistrée</h2>
          <p>Les futures demandes apparaîtront ici après l’envoi du formulaire public.</p>
        </div>
      ) : (
        <div className="inscriptions-admin">
          <div className="admin-filters">
            <label className="form-field" htmlFor="registration-search">
              <span>Recherche</span>
              <input
                id="registration-search"
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                placeholder="Nom ou prénom"
                type="search"
                value={searchQuery}
              />
            </label>
            <label className="form-field" htmlFor="formation-filter">
              <span>Formation</span>
              <select
                id="formation-filter"
                onChange={(event) => setFormationFilter(event.currentTarget.value)}
                value={formationFilter}
              >
                {formationOptions.map((formation) => (
                  <option key={formation} value={formation}>
                    {formation}
                  </option>
                ))}
              </select>
            </label>
            <label className="form-field" htmlFor="status-filter">
              <span>Statut</span>
              <select
                id="status-filter"
                onChange={(event) => setStatusFilter(event.currentTarget.value)}
                value={statusFilter}
              >
                <option>Tous</option>
                <option>En attente</option>
                <option>Validée</option>
                <option>Refusée</option>
              </select>
            </label>
            <label className="form-field" htmlFor="assignment-filter">
              <span>Affectation</span>
              <select
                id="assignment-filter"
                onChange={(event) => setAssignmentFilter(event.currentTarget.value)}
                value={assignmentFilter}
              >
                <option>Toutes</option>
                <option>Non affecté</option>
                <option>Partiellement affecté</option>
                <option>Affecté</option>
              </select>
            </label>
          </div>

          {pageMessage ? (
            <div className="success-message assignment-message" role="status">
              {pageMessage}
            </div>
          ) : null}

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Âge</th>
                  <th>Téléphone</th>
                  <th>Email</th>
                  <th>Formation demandée</th>
                  <th>Niveau</th>
                  <th>Affectation</th>
                  <th>Groupe / affectation</th>
                  <th>Statut</th>
                  <th>Date d’inscription</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRegistrations.map((registration) => {
                  const personalInformation = registration.personalInformation || {}
                  const assignmentStatus = getAssignmentStatus(registration)

                  return (
                    <tr key={registration.id}>
                      <td>{personalInformation.Nom || '-'}</td>
                      <td>{personalInformation.Prénom || '-'}</td>
                      <td>{personalInformation.Âge || '-'}</td>
                      <td>{personalInformation['Téléphone portable 1'] || '-'}</td>
                      <td>{personalInformation.Email || '-'}</td>
                      <td>{formatRequestedCourses(registration)}</td>
                      <td>{formatRequestedLevels(registration)}</td>
                      <td>
                        <span
                          className={`assignment-status ${assignmentStatus.className}`}
                        >
                          {assignmentStatus.label}
                        </span>
                      </td>
                      <td>
                        {(registration.coursesWanted || []).map((course) => (
                          <p key={course.id}>
                            {course.subject} · {course.groupKey || '-'} ·{' '}
                            {course.assignedClassName ||
                              course.assignmentStatus ||
                              'Pré-groupé'}
                          </p>
                        ))}
                      </td>
                      <td>
                        <span className={`status-pill ${slugify(registration.status)}`}>
                          {registration.status}
                        </span>
                      </td>
                      <td>{formatDate(registration.createdAt)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            onClick={() => setSelectedRegistration(registration)}
                            type="button"
                          >
                            Voir
                          </button>
                          {registration.status === 'Validée' ? (
                            <button disabled type="button">
                              Validée
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleStatusChange(registration.id, 'Validée')
                              }
                              type="button"
                            >
                              Valider
                            </button>
                          )}
                          {quickAssignRegistrationId === registration.id &&
                          registration.status === 'Validée' ? (
                            <button
                              className="btn btn-primary"
                              onClick={() => openAssignment(registration)}
                              type="button"
                            >
                              Affecter maintenant
                            </button>
                          ) : null}
                          <button
                            className="btn btn-primary"
                            onClick={() => openAssignment(registration)}
                            type="button"
                          >
                            Affecter à une classe
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {filteredRegistrations.length === 0 ? (
            <div className="admin-empty-state">
              <h2>Aucun résultat</h2>
              <p>Aucune inscription ne correspond aux filtres sélectionnés.</p>
            </div>
          ) : null}
        </div>
      )}

      {selectedRegistration ? (
        <RegistrationDetailsModal
          onClose={() => setSelectedRegistration(null)}
          onDelete={handleDelete}
          onEdit={() => setEditingRegistration(selectedRegistration)}
          onStatusChange={handleDetailStatusChange}
          registration={selectedRegistration}
        />
      ) : null}
      {editingRegistration ? (
        <RegistrationEditModal
          onClose={() => setEditingRegistration(null)}
          onSave={handleRegistrationUpdate}
          registration={editingRegistration}
        />
      ) : null}
      {assignmentRegistration ? (
        <AssignmentModal
          classes={classes}
          onAssign={handleCourseAssignment}
          onClose={() => setAssignmentRegistration(null)}
          onCreateClass={handleQuickClassCreate}
          registration={assignmentRegistration}
          teachers={teachers}
        />
      ) : null}
    </>
  )
}

function AdminClassesPage() {
  const [classes, setClasses] = useState(() => getClasses())
  const [registrations] = useState(() => getRegistrations())
  const teachers = getUsers().filter((user) => user.role === 'teacher')
  const [classForm, setClassForm] = useState(emptyClassForm)
  const [editingClassId, setEditingClassId] = useState(null)
  const [editingScheduleClass, setEditingScheduleClass] = useState(null)

  function refreshClasses() {
    setClasses(getClasses())
  }

  function handleClassFieldChange(event) {
    const { name, value } = event.currentTarget
    setClassForm((current) => ({
      ...current,
      [name]: value,
    }))
  }

  function toggleClassFormDay(day) {
    setClassForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((currentDay) => currentDay !== day)
        : [...current.days, day],
    }))
  }

  function resetClassForm() {
    setClassForm(emptyClassForm)
    setEditingClassId(null)
  }

  function handleClassSubmit(event) {
    event.preventDefault()
    const payload = {
      ...classForm,
      day: classForm.days.length > 0 ? classForm.days.join(', ') : classForm.day,
      teacher:
        teachers.find((teacher) => teacher.id === classForm.teacherId)
          ? `${teachers.find((teacher) => teacher.id === classForm.teacherId).firstName} ${
              teachers.find((teacher) => teacher.id === classForm.teacherId).lastName
            }`.trim()
          : classForm.teacher,
      teacherName:
        teachers.find((teacher) => teacher.id === classForm.teacherId)
          ? `${teachers.find((teacher) => teacher.id === classForm.teacherId).firstName} ${
              teachers.find((teacher) => teacher.id === classForm.teacherId).lastName
            }`.trim()
          : classForm.teacher,
      maxStudents: Number(classForm.maxStudents) || 0,
    }

    const savedClass = editingClassId
      ? updateClass(editingClassId, payload)
      : addClass(payload)

    teachers.forEach((teacher) => {
      const assignedClassIds = teacher.assignedClassIds || []
      const shouldHaveClass = teacher.id === payload.teacherId
      const nextAssignedClassIds = shouldHaveClass
        ? [...new Set([...assignedClassIds, savedClass.id])]
        : assignedClassIds.filter((classId) => classId !== savedClass.id)

      if (nextAssignedClassIds.join('|') !== assignedClassIds.join('|')) {
        updateUser(teacher.id, { assignedClassIds: nextAssignedClassIds })
      }
    })

    refreshClasses()
    resetClassForm()
  }

  function handleEditClass(classItem) {
    setEditingClassId(classItem.id)
    setClassForm({
      name: classItem.name || '',
      subject: classItem.subject || 'Arabe',
      level: classItem.level || '',
      publicType: classItem.publicType || 'Adultes',
      availabilityType: classItem.availabilityType || '',
      days: classDays(classItem),
      day: classItem.day || '',
      startTime: classItem.startTime || '',
      endTime: classItem.endTime || '',
      teacher: classItem.teacher || '',
      teacherId: classItem.teacherId || '',
      room: classItem.room || '',
      maxStudents: String(classItem.maxStudents || ''),
    })
  }

  function handleScheduleSave(classId, form) {
    updateClassSchedule(classId, form)
    updateTeacherAssignmentsForSchedule(classId, form.teacherId)
    refreshClasses()
    setEditingScheduleClass(null)
  }

  function handleDeleteClass(id) {
    deleteClass(id)
    refreshClasses()

    if (editingClassId === id) {
      resetClassForm()
    }
  }

  function studentsForClass(classItem) {
    return (classItem.students || [])
      .map((studentId) =>
        registrations.find((registration) => registration.id === studentId),
      )
      .filter(Boolean)
  }

  return (
    <>
      <AdminPageHeader
        title="Gestion des classes"
        description="Organisez les groupes, niveaux, matières et créneaux horaires."
      />

      <form className="class-form admin-panel" onSubmit={handleClassSubmit}>
        <div>
          <p className="section-kicker">
            {editingClassId ? 'Modification' : 'Création'}
          </p>
          <h2>{editingClassId ? 'Modifier la classe' : 'Créer une classe'}</h2>
        </div>
        <div className="class-form-grid">
          <label className="form-field" htmlFor="class-name">
            <span>Nom de la classe</span>
            <input
              id="class-name"
              name="name"
              onChange={handleClassFieldChange}
              required
              type="text"
              value={classForm.name}
            />
          </label>
          <label className="form-field" htmlFor="class-subject">
            <span>Matière</span>
            <select
              id="class-subject"
              name="subject"
              onChange={handleClassFieldChange}
              value={classForm.subject}
            >
              <option>Arabe</option>
              <option>Coran</option>
              <option>Théologie</option>
              <option>Français</option>
              <option>Anglais</option>
              <option>Soutien scolaire</option>
            </select>
          </label>
          <label className="form-field" htmlFor="class-level">
            <span>Niveau</span>
            <input
              id="class-level"
              name="level"
              onChange={handleClassFieldChange}
              type="text"
              value={classForm.level}
            />
          </label>
          <label className="form-field" htmlFor="class-public">
            <span>Public</span>
            <select
              id="class-public"
              name="publicType"
              onChange={handleClassFieldChange}
              value={classForm.publicType}
            >
              <option>Adultes</option>
              <option>Enfants</option>
              <option>Ados</option>
            </select>
          </label>
          <label className="form-field" htmlFor="class-availability">
            <span>Disponibilité</span>
            <select
              id="class-availability"
              name="availabilityType"
              onChange={handleClassFieldChange}
              value={classForm.availabilityType}
            >
              <option value="">Non renseignée</option>
              {availabilityOptions.map((availability) => (
                <option key={availability}>{availability}</option>
              ))}
            </select>
          </label>
          <label className="form-field" htmlFor="class-day">
            <span>Jour</span>
            <input
              id="class-day"
              name="day"
              onChange={handleClassFieldChange}
              type="text"
              value={classForm.day}
            />
          </label>
          <fieldset className="checkbox-panel field-wide">
            <legend>Jours de cours</legend>
            <div className="checkbox-grid compact-checkboxes">
              {dayOptions.map((day) => (
                <label key={day}>
                  <input
                    checked={classForm.days.includes(day)}
                    onChange={() => toggleClassFormDay(day)}
                    type="checkbox"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <label className="form-field" htmlFor="class-start">
            <span>Heure de début</span>
            <input
              id="class-start"
              name="startTime"
              onChange={handleClassFieldChange}
              type="time"
              value={classForm.startTime}
            />
          </label>
          <label className="form-field" htmlFor="class-end">
            <span>Heure de fin</span>
            <input
              id="class-end"
              name="endTime"
              onChange={handleClassFieldChange}
              type="time"
              value={classForm.endTime}
            />
          </label>
          <label className="form-field" htmlFor="class-room">
            <span>Salle</span>
            <input
              id="class-room"
              name="room"
              onChange={handleClassFieldChange}
              type="text"
              value={classForm.room}
            />
          </label>
          <label className="form-field" htmlFor="class-teacher">
            <span>Professeur assigné</span>
            <select
              id="class-teacher"
              name="teacherId"
              onChange={handleClassFieldChange}
              value={classForm.teacherId}
            >
              <option value="">Aucun professeur assigné</option>
              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.firstName} {teacher.lastName}
                </option>
              ))}
            </select>
          </label>
          <label className="form-field" htmlFor="class-max">
            <span>Nombre maximum d’élèves</span>
            <input
              id="class-max"
              min="0"
              name="maxStudents"
              onChange={handleClassFieldChange}
              type="number"
              value={classForm.maxStudents}
            />
          </label>
        </div>
        <div className="class-form-actions">
          <button className="btn btn-primary submit-btn" type="submit">
            {editingClassId ? 'Enregistrer les modifications' : 'Créer la classe'}
          </button>
          {editingClassId ? (
            <button onClick={resetClassForm} type="button">
              Annuler
            </button>
          ) : null}
        </div>
      </form>

      {classes.length === 0 ? (
        <div className="admin-empty-state">
          <h2>Aucune classe créée</h2>
          <p>Utilisez le formulaire ci-dessus pour créer votre première classe.</p>
        </div>
      ) : (
        <div className="classes-grid">
          {classes.map((classItem) => {
            const assignedStudents = studentsForClass(classItem)

            return (
              <article className="class-card" key={classItem.id}>
                <div className="class-card-header">
                  <div>
                    <span>{classItem.subject}</span>
                    <h2>{classItem.name}</h2>
                    <p>
                      {classItem.publicType} · Niveau {classItem.level || '-'}
                    </p>
                  </div>
                  <strong>
                    {assignedStudents.length} / {classItem.maxStudents || 0}
                  </strong>
                </div>
                <dl className="class-meta">
                  <div>
                    <dt>Jour</dt>
                    <dd>
                      {classDays(classItem).join(', ') || (
                        <span className="assignment-status non-affecte">
                          Horaire non défini
                        </span>
                      )}
                    </dd>
                  </div>
                  <div>
                    <dt>Horaires</dt>
                    <dd>
                      {classItem.startTime || '--:--'} -{' '}
                      {classItem.endTime || '--:--'}
                    </dd>
                  </div>
                  <div>
                    <dt>Professeur</dt>
                    <dd>{classItem.teacher || '-'}</dd>
                  </div>
                  <div>
                    <dt>Salle</dt>
                    <dd>{classItem.room || '-'}</dd>
                  </div>
                  <div>
                    <dt>Élèves inscrits</dt>
                    <dd>{assignedStudents.length}</dd>
                  </div>
                  <div>
                    <dt>Disponibilité</dt>
                    <dd>{classItem.availabilityType || '-'}</dd>
                  </div>
                  <div>
                    <dt>Jours</dt>
                    <dd>{classItem.days?.join(', ') || classItem.day || '-'}</dd>
                  </div>
                  <div>
                    <dt>Mode</dt>
                    <dd>{classItem.creationMode || 'Manuel'}</dd>
                  </div>
                  <div>
                    <dt>Créneau</dt>
                    <dd>{classItem.preferredTime || '-'}</dd>
                  </div>
                </dl>
                <div className="table-actions">
                  <button onClick={() => handleEditClass(classItem)} type="button">
                    Modifier
                  </button>
                  <button onClick={() => setEditingScheduleClass(classItem)} type="button">
                    Modifier horaire
                  </button>
                  <button
                    className="danger-action"
                    onClick={() => handleDeleteClass(classItem.id)}
                    type="button"
                  >
                    Supprimer
                  </button>
                </div>
                <div className="class-students">
                  <h3>Élèves affectés</h3>
                  {assignedStudents.length === 0 ? (
                    <p>Aucun élève affecté à cette classe.</p>
                  ) : (
                    <div className="admin-table-wrap compact-table">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Nom</th>
                            <th>Prénom</th>
                            <th>Téléphone</th>
                            <th>Email</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assignedStudents.map((student) => {
                            const info = student.personalInformation || {}

                            return (
                              <tr key={student.id}>
                                <td>{info.Nom || '-'}</td>
                                <td>{info.Prénom || '-'}</td>
                                <td>{info['Téléphone portable 1'] || '-'}</td>
                                <td>{info.Email || '-'}</td>
                                <td>
                                  <span
                                    className={`status-pill ${slugify(
                                      student.status,
                                    )}`}
                                  >
                                    {student.status}
                                  </span>
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      )}
      {editingScheduleClass ? (
        <ScheduleEditModal
          classItem={editingScheduleClass}
          onClose={() => setEditingScheduleClass(null)}
          onSave={handleScheduleSave}
          teachers={teachers}
        />
      ) : null}
    </>
  )
}

function AdminGroupsPage() {
  const [groups, setGroups] = useState(() => getPreGroups())
  const [maxStudents, setMaxStudents] = useState('15')
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const [selectedStudents, setSelectedStudents] = useState({})
  const [manualClassName, setManualClassName] = useState('')
  const [manualTeacherId, setManualTeacherId] = useState('')
  const teachers = getUsers().filter((user) => user.role === 'teacher')

  function refreshGroups() {
    setGroups(getPreGroups())
  }

  function handleAutoCreate() {
    const createdClasses = autoCreateClassesFromPreGroups(Number(maxStudents) || 15)
    setMessage(`${createdClasses.length} classe(s) créée(s) automatiquement.`)
    refreshGroups()
  }

  function toggleStudent(groupKey, registrationId, courseId) {
    const key = `${registrationId}|${courseId}`
    setSelectedStudents((current) => {
      const selected = current[groupKey] || []
      return {
        ...current,
        [groupKey]: selected.includes(key)
          ? selected.filter((item) => item !== key)
          : [...selected, key],
      }
    })
  }

  function handleManualCreate(group) {
    const selected = (selectedStudents[group.key] || []).map((item) => {
      const [registrationId, courseId] = item.split('|')
      return { registrationId, courseId }
    })
    const teacher = teachers.find((item) => item.id === manualTeacherId)

    if (selected.length === 0) {
      setMessage('Sélectionnez au moins un élève.')
      return
    }

    manualCreateClassFromStudents(
      {
        name:
          manualClassName ||
          `${group.subject} ${group.level} ${group.publicType} - Classe manuelle`,
        subject: group.subject,
        level: group.level,
        publicType: group.publicType,
        availabilityType: group.availabilityType,
        preferredTime: group.preferredTime,
        teacherId: manualTeacherId,
        teacher: teacher ? `${teacher.firstName} ${teacher.lastName}`.trim() : '',
        maxStudents: Number(maxStudents) || 15,
        sourcePreGroupKey: group.key,
      },
      selected,
    )
    setMessage('Classe créée avec la sélection.')
    refreshGroups()
  }

  const visibleGroups = groups
    .map((group) => ({
      ...group,
      students: group.students.filter(({ registration }) => {
        const info = registration.personalInformation || {}
        return `${info.Nom || ''} ${info.Prénom || ''}`
          .toLowerCase()
          .includes(search.toLowerCase())
      }),
    }))
    .filter((group) => group.students.length > 0)

  return (
    <>
      <AdminPageHeader
        title="Groupes d’inscription"
        description="Pré-groupement automatique selon matière, niveau, public, disponibilité et créneau."
      />
      <section className="admin-panel groups-toolbar">
        <label className="form-field" htmlFor="group-max">
          <span>Maximum par classe</span>
          <input id="group-max" min="1" onChange={(event) => setMaxStudents(event.currentTarget.value)} type="number" value={maxStudents} />
        </label>
        <label className="form-field" htmlFor="group-search">
          <span>Recherche nom/prénom</span>
          <input id="group-search" onChange={(event) => setSearch(event.currentTarget.value)} value={search} />
        </label>
        <button className="btn btn-primary submit-btn" onClick={handleAutoCreate} type="button">
          Créer les classes automatiquement
        </button>
        {message ? <div className="success-message assignment-message">{message}</div> : null}
      </section>
      <div className="groups-list">
        {visibleGroups.map((group) => (
          <article className="group-card admin-panel" key={group.key}>
            <div className="group-card-header">
              <div>
                <h2>Groupe : {group.subject} — {group.level} — {group.publicType} — {group.availabilityType} — {group.preferredTime}</h2>
                <p>Nombre d’élèves : {group.students.length}</p>
              </div>
              <div className="group-badges">
                <span>{group.subject}</span><span>{group.level}</span><span>{group.availabilityType}</span>
              </div>
            </div>
            <div className="admin-table-wrap compact-table">
              <table className="admin-table">
                <thead><tr><th>Sélection</th><th>Nom</th><th>Prénom</th><th>Âge</th><th>Téléphone</th><th>Email</th><th>Date</th><th>Statut</th><th>Affectation</th></tr></thead>
                <tbody>
                  {group.students.map(({ registration, course }) => {
                    const info = registration.personalInformation || {}
                    const selectedKey = `${registration.id}|${course.id}`
                    return (
                      <tr key={selectedKey}>
                        <td><input checked={(selectedStudents[group.key] || []).includes(selectedKey)} onChange={() => toggleStudent(group.key, registration.id, course.id)} type="checkbox" /></td>
                        <td>{info.Nom || '-'}</td><td>{info.Prénom || '-'}</td><td>{info.Âge || '-'}</td><td>{info['Téléphone portable 1'] || '-'}</td><td>{info.Email || '-'}</td><td>{formatDate(registration.createdAt)}</td><td>{registration.status}</td><td>{course.assignmentStatus || 'Pré-groupé'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <div className="manual-class-panel">
              <input placeholder="Nom de la classe" value={manualClassName} onChange={(event) => setManualClassName(event.currentTarget.value)} />
              <select value={manualTeacherId} onChange={(event) => setManualTeacherId(event.currentTarget.value)}>
                <option value="">Professeur</option>
                {teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.firstName} {teacher.lastName}</option>)}
              </select>
              <button onClick={() => handleManualCreate(group)} type="button">Créer une classe avec la sélection</button>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}

function AdminEventsPage() {
  const [events, setEvents] = useState(() => getEvents())
  const [eventRegistrations, setEventRegistrations] = useState(() =>
    getEventRegistrations(),
  )
  const [eventForm, setEventForm] = useState(emptyEventForm)
  const [editingEventId, setEditingEventId] = useState(null)
  const [openRegistrantsEventId, setOpenRegistrantsEventId] = useState(null)

  function refreshAdminEvents() {
    setEvents(getEvents())
    setEventRegistrations(getEventRegistrations())
  }

  function handleEventFieldChange(event) {
    const { name, value } = event.currentTarget
    setEventForm((current) => ({ ...current, [name]: value }))
  }

  function resetEventForm() {
    setEventForm(emptyEventForm)
    setEditingEventId(null)
  }

  function handleEventSubmit(event) {
    event.preventDefault()
    const payload = {
      ...eventForm,
      maxParticipants: Number(eventForm.maxParticipants) || 0,
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
      title: eventItem.title || '',
      description: eventItem.description || '',
      date: eventItem.date || '',
      startTime: eventItem.startTime || '',
      endTime: eventItem.endTime || '',
      location: eventItem.location || '',
      maxParticipants: String(eventItem.maxParticipants || ''),
      status: eventItem.status || 'Ouvert',
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
    updateEvent(eventItem.id, {
      status: eventItem.status === 'Ouvert' ? 'Fermé' : 'Ouvert',
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
        description="Créez et gérez les événements visibles sur le site public."
      />

      <form className="class-form admin-panel" onSubmit={handleEventSubmit}>
        <div>
          <p className="section-kicker">
            {editingEventId ? 'Modification' : 'Création'}
          </p>
          <h2>{editingEventId ? 'Modifier l’événement' : 'Créer un événement'}</h2>
        </div>
        <div className="class-form-grid">
          <label className="form-field" htmlFor="event-title-admin">
            <span>Titre de l’événement</span>
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
          <label className="form-field" htmlFor="event-status-admin">
            <span>Statut</span>
            <select
              id="event-status-admin"
              name="status"
              onChange={handleEventFieldChange}
              value={eventForm.status}
            >
              <option>Ouvert</option>
              <option>Fermé</option>
            </select>
          </label>
        </div>
        <div className="class-form-actions">
          <button className="btn btn-primary submit-btn" type="submit">
            {editingEventId ? 'Enregistrer les modifications' : 'Créer l’événement'}
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
          <h2>Aucun événement créé</h2>
          <p>Les événements créés ici seront visibles sur la page Actualités.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
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
                const registrations = registrationsForEvent(eventItem.id)

                return (
                  <tr key={eventItem.id}>
                    <td>{eventItem.title}</td>
                    <td>{formatDate(eventItem.date)}</td>
                    <td>
                      {eventItem.startTime || '--:--'} -{' '}
                      {eventItem.endTime || '--:--'}
                    </td>
                    <td>{eventItem.location || '-'}</td>
                    <td>
                      {registrations.length} / {eventItem.maxParticipants || '∞'}
                    </td>
                    <td>
                      <span
                        className={`status-pill ${
                          eventItem.status === 'Ouvert' ? 'validee' : 'refusee'
                        }`}
                      >
                        {eventItem.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
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
                        <button onClick={() => handleEditEvent(eventItem)} type="button">
                          Modifier
                        </button>
                        <button
                          onClick={() => handleToggleEventStatus(eventItem)}
                          type="button"
                        >
                          {eventItem.status === 'Ouvert' ? 'Fermer' : 'Ouvrir'}
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

function AdminUsersPage() {
  const [users, setUsers] = useState(() => getUsers())
  const [userForm, setUserForm] = useState(emptyUserForm)
  const [editingUserId, setEditingUserId] = useState(null)
  const classes = getClasses()

  function refreshUsers() {
    setUsers(getUsers())
  }

  function handleUserFieldChange(event) {
    const { name, value } = event.currentTarget
    setUserForm((current) => ({ ...current, [name]: value }))
  }

  function handleAssignedClassChange(event) {
    const selectedClassIds = Array.from(event.currentTarget.selectedOptions).map(
      (option) => option.value,
    )
    setUserForm((current) => ({ ...current, assignedClassIds: selectedClassIds }))
  }

  function resetUserForm() {
    setUserForm(emptyUserForm)
    setEditingUserId(null)
  }

  function handleUserSubmit(event) {
    event.preventDefault()
    const payload = {
      ...userForm,
      assignedClassIds: userForm.role === 'teacher' ? userForm.assignedClassIds : [],
    }

    if (editingUserId) {
      if (!payload.password) {
        delete payload.password
      }
      updateUser(editingUserId, payload)
    } else {
      addUser(payload)
    }

    refreshUsers()
    resetUserForm()
  }

  function handleEditUser(user) {
    setEditingUserId(user.id)
    setUserForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      password: '',
      role: user.role || 'teacher',
      assignedClassIds: user.assignedClassIds || [],
      isActive: Boolean(user.isActive),
    })
  }

  function handleDeleteUser(id) {
    deleteUser(id)
    refreshUsers()
    if (editingUserId === id) {
      resetUserForm()
    }
  }

  function handleToggleUser(user) {
    updateUser(user.id, { isActive: !user.isActive })
    refreshUsers()
  }

  function classNamesForUser(user) {
    return (user.assignedClassIds || [])
      .map((classId) => classes.find((classItem) => classItem.id === classId)?.name)
      .filter(Boolean)
      .join(', ')
  }

  return (
    <>
      <AdminPageHeader
        title="Gestion des utilisateurs"
        description="Créez les comptes administrateurs et professeurs. Simulation locale remplaçable par Supabase Auth."
      />
      <form className="class-form admin-panel" onSubmit={handleUserSubmit}>
        <div>
          <p className="section-kicker">
            {editingUserId ? 'Modification' : 'Création'}
          </p>
          <h2>{editingUserId ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h2>
        </div>
        <div className="class-form-grid">
          <label className="form-field" htmlFor="user-first-name">
            <span>Prénom</span>
            <input id="user-first-name" name="firstName" onChange={handleUserFieldChange} required type="text" value={userForm.firstName} />
          </label>
          <label className="form-field" htmlFor="user-last-name">
            <span>Nom</span>
            <input id="user-last-name" name="lastName" onChange={handleUserFieldChange} required type="text" value={userForm.lastName} />
          </label>
          <label className="form-field" htmlFor="user-email">
            <span>Email</span>
            <input id="user-email" name="email" onChange={handleUserFieldChange} required type="email" value={userForm.email} />
          </label>
          <label className="form-field" htmlFor="user-password">
            <span>Mot de passe</span>
            <input id="user-password" name="password" onChange={handleUserFieldChange} placeholder={editingUserId ? 'Laisser vide pour ne pas changer' : ''} required={!editingUserId} type="password" value={userForm.password} />
          </label>
          <label className="form-field" htmlFor="user-role">
            <span>Rôle</span>
            <select id="user-role" name="role" onChange={handleUserFieldChange} value={userForm.role}>
              <option value="admin">Admin</option>
              <option value="teacher">Professeur</option>
            </select>
          </label>
          <label className="form-field" htmlFor="user-status">
            <span>Statut</span>
            <select
              id="user-status"
              onChange={(event) => {
                const { value } = event.currentTarget
                setUserForm((current) => ({ ...current, isActive: value === 'true' }))
              }}
              value={String(userForm.isActive)}
            >
              <option value="true">Actif</option>
              <option value="false">Inactif</option>
            </select>
          </label>
          {userForm.role === 'teacher' ? (
            <label className="form-field field-wide" htmlFor="user-classes">
              <span>Classes assignées</span>
              <select id="user-classes" multiple onChange={handleAssignedClassChange} value={userForm.assignedClassIds}>
                {classes.map((classItem) => (
                  <option key={classItem.id} value={classItem.id}>
                    {classItem.name} · {classItem.subject}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
        <div className="class-form-actions">
          <button className="btn btn-primary submit-btn" type="submit">
            {editingUserId ? 'Enregistrer' : 'Créer l’utilisateur'}
          </button>
          {editingUserId ? <button onClick={resetUserForm} type="button">Annuler</button> : null}
        </div>
      </form>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Prénom</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Classes assignées</th>
              <th>Statut</th>
              <th>Date de création</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>
                  {user.role === 'teacher' ? (
                    <Link to={`/admin/teachers/${user.id}/schedule`}>{user.lastName}</Link>
                  ) : (
                    user.lastName
                  )}
                </td>
                <td>{user.firstName}</td>
                <td>{user.email}</td>
                <td>{user.role === 'admin' ? 'Admin' : 'Professeur'}</td>
                <td>{classNamesForUser(user) || '-'}</td>
                <td><span className={`status-pill ${user.isActive ? 'validee' : 'refusee'}`}>{user.isActive ? 'Actif' : 'Inactif'}</span></td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="table-actions">
                    <button onClick={() => handleEditUser(user)} type="button">Modifier</button>
                    {user.role === 'teacher' ? (
                      <Link to={`/admin/teachers/${user.id}/schedule`}>
                        Voir emploi du temps
                      </Link>
                    ) : null}
                    <button onClick={() => handleToggleUser(user)} type="button">{user.isActive ? 'Désactiver' : 'Activer'}</button>
                    <button className="danger-action" disabled={user.id === 'default_admin'} onClick={() => handleDeleteUser(user.id)} type="button">Supprimer</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

function AdminSettingsPage() {
  const [settings, setSettings] = useState(() => getSettings())
  const [saveMessage, setSaveMessage] = useState('')

  function handleRegistrationToggle(isOpen) {
    const nextSettings = setRegistrationOpen(isOpen)
    setSettings(nextSettings)
    setSaveMessage(
      isOpen
        ? 'Les inscriptions sont maintenant ouvertes.'
        : 'Les inscriptions sont maintenant fermées.',
    )
  }

  return (
    <>
      <AdminPageHeader
        title="Paramètres"
        description="Configurez les informations générales, l’année scolaire et les options du site."
      />
      <section className="settings-panel admin-panel">
        <div className="settings-panel-header">
          <div>
            <p className="section-kicker">Gestion des inscriptions</p>
            <h2>Ouverture du formulaire public</h2>
            <p>
              Ce statut contrôle directement l’affichage du formulaire sur la
              page publique d’inscription.
            </p>
          </div>
          <span
            className={`settings-status ${
              settings.registrationOpen ? 'is-open' : 'is-closed'
            }`}
          >
            {settings.registrationOpen
              ? 'Inscriptions ouvertes'
              : 'Inscriptions fermées'}
          </span>
        </div>

        <div className="settings-toggle-group" role="group" aria-label="Statut des inscriptions">
          <button
            className={settings.registrationOpen ? 'active' : ''}
            onClick={() => handleRegistrationToggle(true)}
            type="button"
          >
            Inscriptions ouvertes
          </button>
          <button
            className={!settings.registrationOpen ? 'active' : ''}
            onClick={() => handleRegistrationToggle(false)}
            type="button"
          >
            Inscriptions fermées
          </button>
        </div>

        <div className="settings-public-preview">
          <strong>Effet sur /inscription</strong>
          <p>
            {settings.registrationOpen
              ? 'Le formulaire public /inscription est accessible.'
              : 'Le formulaire public /inscription n’est pas affiché. Le message de fermeture est présenté aux visiteurs.'}
          </p>
        </div>

        {saveMessage ? (
          <div className="success-message assignment-message" role="status">
            {saveMessage}
          </div>
        ) : null}
      </section>
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
          <Route path="inscriptions" element={<AdminInscriptionsPage />} />
          <Route path="classes" element={<AdminClassesPage />} />
          <Route path="groups" element={<AdminGroupsPage />} />
          <Route path="schedule" element={<AdminSchedulePage />} />
          <Route path="teachers/:id/schedule" element={<AdminTeacherSchedulePage />} />
          <Route path="events" element={<AdminEventsPage />} />
          <Route path="gallery" element={<AdminGalleryPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
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
