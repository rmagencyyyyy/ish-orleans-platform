import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  addEventRegistration,
  getEvents,
  getEventRegistrationsByEventId,
  getGalleryImages,
} from '../data/storage'
import { addRegistration, isRegistrationOpen } from '../services/dataProvider'
import Footer from '../components/Footer'
import Header from '../components/Header'

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
const requiredDocuments = [
  'Fiche d’inscription ISH complétée, datée et signée + 1 photo à coller',
  'Règlement intérieur signé',
  'Copie de certificat d’assurance scolaire',
  'Frais d’inscription par chèque à l’ordre de “ISH Orléans” ou par virement',
]

const galleryCategories = ['Institut', 'Événement', 'Cours', 'Activité', 'Autre']

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
  const [registrationOpen, setRegistrationOpenState] = useState(true)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [isCertified, setIsCertified] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    let isMounted = true
    isRegistrationOpen()
      .then((isOpen) => {
        if (isMounted) {
          setRegistrationOpenState(isOpen)
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage('Impossible de vérifier le statut des inscriptions.')
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoadingSettings(false)
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()

    if (!registrationOpen) {
      return
    }

    setErrorMessage('')

    try {
      const registration = await addRegistration(buildRegistrationFromForm(event.currentTarget))
      event.currentTarget.reset()
      setIsCertified(false)
      setSuccessMessage(
        `Votre inscription a bien été enregistrée avec le numéro ${registration.id}.`,
      )
    } catch {
      setErrorMessage('Une erreur est survenue pendant l’enregistrement de votre inscription.')
    }
  }

  if (isLoadingSettings) {
    return (
      <section className="section inscription-section" id="inscription">
        <div className="registration-closed-message">Chargement du formulaire...</div>
      </section>
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
      {errorMessage ? (
        <div className="login-error" role="alert">
          {errorMessage}
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

function formatDate(date) {
  if (!date) {
    return '-'
  }

  return new Date(date).toLocaleDateString('fr-FR')
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

export {
  AboutPage,
  ContactPage,
  EventsPublicPage,
  FAQPage,
  FormationsPage,
  GalleryPublicPage,
  HomePage,
  InscriptionPage,
  PublicLayout,
}
