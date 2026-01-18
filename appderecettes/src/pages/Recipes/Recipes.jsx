import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { Search, Filter, Clock, Users, ChefHat, Heart } from 'lucide-react'
import './Recipes.css'

const Recipes = () => {
  const [recipes, setRecipes] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchParams, setSearchParams] = useSearchParams()
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    difficulty: searchParams.get('difficulty') || '',
    max_time: searchParams.get('max_time') || '',
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    fetchRecipes()
  }, [searchParams])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/recipe-categories/')
      // S'assurer que categories est toujours un tableau
      const categoriesData = response.data.results || response.data
      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      setCategories([]) // S'assurer que categories est un tableau même en cas d'erreur
    }
  }

  const fetchRecipes = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      
      const searchParam = searchParams.get('search')
      const categoryParam = searchParams.get('category')
      const difficultyParam = searchParams.get('difficulty')
      const maxTimeParam = searchParams.get('max_time')
      
      if (searchParam) params.append('search', searchParam)
      if (categoryParam) params.append('category', categoryParam)
      if (difficultyParam) params.append('difficulty', difficultyParam)
      if (maxTimeParam) params.append('max_time', maxTimeParam)

      const response = await axios.get(`/recipes/?${params.toString()}`)
      // Gérer la pagination si présente
      if (response.data.results) {
        setRecipes(response.data.results)
      } else if (Array.isArray(response.data)) {
        setRecipes(response.data)
      } else {
        setRecipes([])
      }
    } catch (error) {
      console.error('Error fetching recipes:', error)
      setRecipes([])
      // Afficher un message d'erreur si nécessaire
      if (error.response?.status === 401) {
        console.error('Authentification requise')
      }
    } finally {
      setLoading(false)
    }
  }

  // Debounce pour la recherche en temps réel
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams(searchParams)
      
      if (filters.search) {
        params.set('search', filters.search)
      } else {
        params.delete('search')
      }
      
      // Garder les autres filtres
      if (filters.category) {
        params.set('category', filters.category)
      } else {
        params.delete('category')
      }
      
      if (filters.difficulty) {
        params.set('difficulty', filters.difficulty)
      } else {
        params.delete('difficulty')
      }
      
      if (filters.max_time) {
        params.set('max_time', filters.max_time)
      } else {
        params.delete('max_time')
      }
      
      setSearchParams(params)
    }, 500) // Délai de 500ms pour éviter trop de requêtes

    return () => clearTimeout(timeoutId)
  }, [filters.search])

  const handleFilterChange = (e) => {
    const newFilters = {
      ...filters,
      [e.target.name]: e.target.value,
    }
    setFilters(newFilters)
    
    // Pour les autres filtres (catégorie, difficulté, temps), mettre à jour immédiatement
    if (e.target.name !== 'search') {
      const params = new URLSearchParams(searchParams)
      
      if (newFilters.search) params.set('search', newFilters.search)
      if (newFilters.category) params.set('category', newFilters.category)
      else params.delete('category')
      if (newFilters.difficulty) params.set('difficulty', newFilters.difficulty)
      else params.delete('difficulty')
      if (newFilters.max_time) params.set('max_time', newFilters.max_time)
      else params.delete('max_time')
      
      setSearchParams(params)
    }
  }

  const applyFilters = () => {
    const params = new URLSearchParams()
    if (filters.search) params.append('search', filters.search)
    if (filters.category) params.append('category', filters.category)
    if (filters.difficulty) params.append('difficulty', filters.difficulty)
    if (filters.max_time) params.append('max_time', filters.max_time)
    setSearchParams(params)
  }

  if (loading && (!Array.isArray(recipes) || recipes.length === 0)) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="recipes-page">
      <div className="container">
        <div className="recipes-header">
          <h1 className="page-title">Recettes</h1>
          <p className="page-subtitle">Découvrez nos meilleures recettes</p>
        </div>

        <div className="recipes-filters">
          <div className="filter-group">
            <Search size={20} />
            <input
              type="text"
              name="search"
              placeholder="Rechercher une recette..."
              value={filters.search}
              onChange={handleFilterChange}
              className="filter-input"
            />
          </div>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Toutes les catégories</option>
            {Array.isArray(categories) && categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="difficulty"
            value={filters.difficulty}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Tous les niveaux</option>
            <option value="1">Très facile</option>
            <option value="2">Facile</option>
            <option value="3">Moyen</option>
            <option value="4">Difficile</option>
            <option value="5">Très difficile</option>
          </select>

          <select
            name="max_time"
            value={filters.max_time}
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="">Temps max</option>
            <option value="30">30 min</option>
            <option value="60">1h</option>
            <option value="120">2h</option>
          </select>

          <button onClick={applyFilters} className="btn btn-primary">
            <Filter size={20} />
            Filtrer
          </button>
        </div>

        {loading && Array.isArray(recipes) && recipes.length > 0 && (
          <div className="loading-overlay">
            <div className="spinner"></div>
          </div>
        )}

        {!loading && (!Array.isArray(recipes) || recipes.length === 0) && (
          <div className="empty-state">
            <ChefHat size={64} className="empty-state-icon" />
            <h2 className="empty-state-title">Aucune recette trouvée</h2>
            <p className="empty-state-text">
              {filters.search || filters.category || filters.difficulty || filters.max_time
                ? "Essayez de modifier vos critères de recherche"
                : "Il n'y a pas encore de recettes disponibles. Soyez le premier à en créer une !"}
            </p>
          </div>
        )}
        {!loading && Array.isArray(recipes) && recipes.length > 0 && (
          <div className="recipes-grid">
            {recipes.map((recipe) => (
              <Link
                key={recipe.id}
                to={`/recipes/${recipe.id}`}
                className="recipe-card"
              >
                {recipe.main_image && (
                  <div className="recipe-image">
                    <img src={recipe.main_image} alt={recipe.title} />
                  </div>
                )}
                <div className="recipe-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <p className="recipe-description">
                    {recipe.description?.substring(0, 100)}...
                  </p>
                  <div className="recipe-meta">
                    <span className="recipe-meta-item">
                      <Clock size={16} />
                      {recipe.total_time || (recipe.prep_time + recipe.cook_time)} min
                    </span>
                    <span className="recipe-meta-item">
                      <Users size={16} />
                      {recipe.servings} pers.
                    </span>
                    <span className="recipe-meta-item">
                      <ChefHat size={16} />
                      Niveau {recipe.difficulty}
                    </span>
                  </div>
                  <div className="recipe-footer">
                    <span className="recipe-author">Par {recipe.author?.username || 'Anonyme'}</span>
                    {recipe.is_favorited && (
                      <Heart size={18} className="favorited" fill="currentColor" />
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Recipes

