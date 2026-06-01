import { Link } from 'react-router-dom'
import ishLogo from '../assets/ish-logo.png'

function Footer() {
  return (
    <footer className="home-footer">
      <div>
        <Link className="home-brand footer-brand" to="/">
          <img
            alt="ISH Orléans - Institut des Sciences Humaines d’Orléans"
            className="home-brand-logo footer-brand-logo"
            src={ishLogo}
          />
        </Link>
        <p>
          Un cadre structuré et bienveillant pour l’apprentissage de la langue
          arabe et des sciences islamiques à Orléans.
        </p>
      </div>
      <div>
        <h3>Navigation</h3>
        <Link to="/formations">Nos programmes</Link>
        <Link to="/inscription">Inscription</Link>
        <Link to="/a-propos">À propos</Link>
        <Link to="/actualites">Actualités</Link>
        <Link to="/faq">FAQ</Link>
      </div>
      <div>
        <h3>Contact</h3>
        <p>Orléans, France</p>
        <p>06 52 71 59 21</p>
        <p>ishorleans@gmail.com</p>
      </div>
      <div className="footer-admin-row">
        <Link className="footer-admin-link" to="/admin/login">
          Admin
        </Link>
      </div>
    </footer>
  )
}

export default Footer
