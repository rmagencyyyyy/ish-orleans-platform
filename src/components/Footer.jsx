import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="home-footer">
      <div>
        <Link className="home-brand footer-brand" to="/">
          <span className="home-brand-mark" aria-hidden="true">
            ✦
          </span>
          <span>
            <strong>ISH Orléans</strong>
            <small>Institut des Sciences Humaines</small>
          </span>
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
        <p>+33 X XX XX XX XX</p>
        <p>contact@ish-orleans.fr</p>
      </div>
      <div>
        <h3>Horaires</h3>
        <p>Samedi : 9h – 17h</p>
        <p>Dimanche : 9h – 13h</p>
        <p>En semaine : sur rendez-vous</p>
      </div>
    </footer>
  )
}

export default Footer
