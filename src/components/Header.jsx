import { Link, useLocation } from 'react-router-dom'

const publicMenuItems = [
  { label: 'Accueil', to: '/' },
  { label: 'Actualités', to: '/actualites' },
  { label: 'Programmes', to: '/formations' },
  { label: 'À propos', to: '/a-propos' },
  { label: 'Galerie', to: '/galerie' },
  { label: 'Contact', to: '/contact' },
  { label: 'FAQ', to: '/faq' },
]

function Header() {
  const location = useLocation()

  function isMenuItemActive(item) {
    if (item.label === 'Accueil') {
      return location.pathname === '/'
    }

    if (item.label === 'Programmes') {
      return location.pathname === '/formations' || location.pathname === '/programmes'
    }

    return location.pathname === item.to
  }

  return (
    <header className="home-navbar">
      <Link className="home-brand" to="/">
        <span className="home-brand-mark" aria-hidden="true">
          ✦
        </span>
        <span>
          <strong>ISH Orléans</strong>
          <small>Institut des Sciences Humaines</small>
        </span>
      </Link>

      <nav className="home-nav-menu" aria-label="Navigation principale">
        {publicMenuItems.map((item) => (
          <Link
            className={isMenuItemActive(item) ? 'active' : ''}
            key={item.label}
            to={item.to}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Link className="home-register-button" to="/inscription">
        S’inscrire
      </Link>
    </header>
  )
}

export default Header
