import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { ChefHat, BookOpen, ShoppingCart, TrendingUp, Clock, Users } from 'lucide-react'
import './Home.css'

const Home = () => {
  const { isAuthenticated } = useAuth()

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              Partagez vos meilleures <span className="highlight">recettes</span>
            </h1>
            <p className="hero-subtitle">
              Découvrez des milliers de recettes, organisez vos courses et créez des menus personnalisés
            </p>
            <div className="hero-actions">
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Commencer gratuitement
                  </Link>
                  <Link to="/recipes" className="btn btn-outline btn-lg">
                    Explorer les recettes
                  </Link>
                </>
              ) : (
                <Link to="/recipes/create" className="btn btn-primary btn-lg">
                  Créer une recette
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <h2 className="section-title">Pourquoi nous choisir ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <BookOpen size={48} />
              </div>
              <h3 className="feature-title">Recettes variées</h3>
              <p className="feature-text">
                Accédez à des milliers de recettes pour tous les goûts et régimes alimentaires
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <ShoppingCart size={48} />
              </div>
              <h3 className="feature-title">Listes de courses</h3>
              <p className="feature-text">
                Générez automatiquement vos listes de courses à partir de vos recettes favorites
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <ChefHat size={48} />
              </div>
              <h3 className="feature-title">Partage facile</h3>
              <p className="feature-text">
                Partagez vos créations culinaires avec la communauté et recevez des retours
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <TrendingUp size={48} />
              </div>
              <h3 className="feature-title">Statistiques</h3>
              <p className="feature-text">
                Suivez vos recettes les plus populaires et vos statistiques personnelles
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <Clock size={32} />
              <div className="stat-content">
                <h3 className="stat-number">1000+</h3>
                <p className="stat-label">Recettes disponibles</p>
              </div>
            </div>
            <div className="stat-item">
              <Users size={32} />
              <div className="stat-content">
                <h3 className="stat-number">500+</h3>
                <p className="stat-label">Utilisateurs actifs</p>
              </div>
            </div>
            <div className="stat-item">
              <ChefHat size={32} />
              <div className="stat-content">
                <h3 className="stat-number">50+</h3>
                <p className="stat-label">Catégories</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
