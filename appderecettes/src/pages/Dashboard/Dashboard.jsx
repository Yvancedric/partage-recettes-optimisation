import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import {
  BookOpen, Heart, Eye, TrendingUp, Plus, Clock, Users, ChefHat
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recipes, setRecipes] = useState([])
  const [favorites, setFavorites] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, recipesRes, favoritesRes] = await Promise.all([
        axios.get('/statistics/'),
        axios.get('/recipes/my_recipes/'),
        axios.get('/recipes/favorites/'),
      ])
      setStats(statsRes.data)
      setRecipes(recipesRes.data.results || recipesRes.data)
      setFavorites(favoritesRes.data.results || favoritesRes.data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1 className="page-title">Tableau de bord</h1>
          <Link to="/recipes/create" className="btn btn-primary">
            <Plus size={20} />
            Créer une recette
          </Link>
        </div>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">
                <BookOpen size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.total_recipes}</h3>
                <p className="stat-label">Mes recettes</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Heart size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.total_favorites}</h3>
                <p className="stat-label">Favoris</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon">
                <Eye size={32} />
              </div>
              <div className="stat-content">
                <h3 className="stat-number">{stats.total_views}</h3>
                <p className="stat-label">Vues totales</p>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-sections">
          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Mes recettes récentes</h2>
              <Link to="/recipes" className="section-link">
                Voir tout
              </Link>
            </div>
            {recipes.length > 0 ? (
              <div className="recipes-list">
                {recipes.slice(0, 5).map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipes/${recipe.id}`}
                    className="recipe-item"
                  >
                    {recipe.main_image && (
                      <img
                        src={recipe.main_image}
                        alt={recipe.title}
                        className="recipe-item-image"
                      />
                    )}
                    <div className="recipe-item-content">
                      <h3 className="recipe-item-title">{recipe.title}</h3>
                      <div className="recipe-item-meta">
                        <span>
                          <Clock size={14} />
                          {recipe.total_time} min
                        </span>
                        <span>
                          <Users size={14} />
                          {recipe.servings} pers.
                        </span>
                        <span>
                          <Eye size={14} />
                          {recipe.views_count} vues
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucune recette créée</p>
                <Link to="/recipes/create" className="btn btn-primary">
                  Créer ma première recette
                </Link>
              </div>
            )}
          </div>

          <div className="dashboard-section">
            <div className="section-header">
              <h2 className="section-title">Mes favoris</h2>
              <Link to="/recipes?favorites=true" className="section-link">
                Voir tout
              </Link>
            </div>
            {favorites.length > 0 ? (
              <div className="recipes-list">
                {favorites.slice(0, 5).map((recipe) => (
                  <Link
                    key={recipe.id}
                    to={`/recipes/${recipe.id}`}
                    className="recipe-item"
                  >
                    {recipe.main_image && (
                      <img
                        src={recipe.main_image}
                        alt={recipe.title}
                        className="recipe-item-image"
                      />
                    )}
                    <div className="recipe-item-content">
                      <h3 className="recipe-item-title">{recipe.title}</h3>
                      <div className="recipe-item-meta">
                        <span>
                          <Clock size={14} />
                          {recipe.total_time} min
                        </span>
                        <span>
                          <ChefHat size={14} />
                          Niveau {recipe.difficulty}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucun favori pour le moment</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
