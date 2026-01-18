import { Link } from 'react-router-dom'
import { ChefHat, Github, Facebook, Twitter } from 'lucide-react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <div className="footer-logo">
            <ChefHat size={28} />
            <span>Recettes</span>
          </div>
          <p className="footer-description">
            Partagez vos meilleures recettes et organisez vos courses facilement.
          </p>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Navigation</h3>
          <ul className="footer-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/recipes">Recettes</Link></li>
            <li><Link to="/dashboard">Tableau de bord</Link></li>
            <li><Link to="/shopping-lists">Listes de courses</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Compte</h3>
          <ul className="footer-links">
            <li><Link to="/login">Connexion</Link></li>
            <li><Link to="/register">Inscription</Link></li>
            <li><Link to="/profile">Profil</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h3 className="footer-title">Suivez-nous</h3>
          <div className="footer-social">
            <a href="#" aria-label="Facebook">
              <Facebook size={24} />
            </a>
            <a href="#" aria-label="Twitter">
              <Twitter size={24} />
            </a>
            <a href="#" aria-label="Github">
              <Github size={24} />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Plateforme de Recettes Ivoirienne. Tous droits réservés.</p>
      </div>
    </footer>
  )
}

export default Footer
