import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { useAuth } from '../../contexts/AuthContext'
import {
  Clock, Users, ChefHat, Heart, Share2, Printer, Edit, Trash2,
  ArrowLeft, DollarSign, Tag
} from 'lucide-react'
import { toast } from 'react-toastify'
import './RecipeDetail.css'

const RecipeDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuth()
  const [recipe, setRecipe] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isFavorited, setIsFavorited] = useState(false)

  useEffect(() => {
    fetchRecipe()
  }, [id])

  const fetchRecipe = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/recipes/${id}/`)
      console.log('Recipe data:', response.data)
      console.log('Ingredients:', response.data.ingredients)
      console.log('Ingredients count:', response.data.ingredients?.length || 0)
      
      // Vérifier si les ingrédients sont présents
      if (!response.data.ingredients || response.data.ingredients.length === 0) {
        console.warn('⚠️ Aucun ingrédient trouvé pour cette recette. Vérifiez les logs du serveur Django.')
      } else {
        console.log('✅ Ingrédients trouvés:', response.data.ingredients)
      }
      
      setRecipe(response.data)
      setIsFavorited(response.data.is_favorited)
    } catch (error) {
      console.error('Error fetching recipe:', error)
      if (error.response) {
        console.error('Error response status:', error.response.status)
        console.error('Error response data:', error.response.data)
      }
      toast.error('Erreur lors du chargement de la recette')
    } finally {
      setLoading(false)
    }
  }

  const handleFavorite = async () => {
    if (!isAuthenticated) {
      toast.info('Connectez-vous pour ajouter aux favoris')
      return
    }

    try {
      if (isFavorited) {
        await axios.delete(`/recipes/${id}/favorite/`)
        setIsFavorited(false)
        toast.success('Retiré des favoris')
      } else {
        await axios.post(`/recipes/${id}/favorite/`)
        setIsFavorited(true)
        toast.success('Ajouté aux favoris')
      }
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: recipe.title,
        text: recipe.description,
        url: window.location.href,
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      toast.success('Lien copié dans le presse-papier')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDelete = async () => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette recette ?')) {
      return
    }

    try {
      await axios.delete(`/recipes/${id}/`)
      toast.success('Recette supprimée')
      navigate('/recipes')
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!recipe) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Recette non trouvée</h2>
      </div>
    )
  }

  const isOwner = isAuthenticated && user?.id === recipe.author?.id

  return (
    <div className="recipe-detail-page">
      <div className="container">
        <Link to="/recipes" className="back-link">
          <ArrowLeft size={20} />
          Retour aux recettes
        </Link>

        <div className="recipe-detail">
          <div className="recipe-detail-header">
            <div className="recipe-detail-info">
              <h1 className="recipe-detail-title">{recipe.title}</h1>
              <p className="recipe-detail-description">{recipe.description}</p>

              <div className="recipe-detail-meta">
                <span className="meta-item">
                  <Clock size={20} />
                  <div>
                    <strong>{recipe.prep_time} min</strong>
                    <span>Préparation</span>
                  </div>
                </span>
                <span className="meta-item">
                  <Clock size={20} />
                  <div>
                    <strong>{recipe.cook_time} min</strong>
                    <span>Cuisson</span>
                  </div>
                </span>
                <span className="meta-item">
                  <Users size={20} />
                  <div>
                    <strong>{recipe.servings}</strong>
                    <span>Personnes</span>
                  </div>
                </span>
                <span className="meta-item">
                  <ChefHat size={20} />
                  <div>
                    <strong>Niveau {recipe.difficulty}</strong>
                    <span>Difficulté</span>
                  </div>
                </span>
                <span className="meta-item">
                  <DollarSign size={20} />
                  <div>
                    <strong>
                      {recipe.estimated_cost === 1 ? 'FCFA (Économique)' : 
                       recipe.estimated_cost === 2 ? 'FCFA (Modéré)' : 
                       'FCFA (Coûteux)'}
                    </strong>
                    <span>Coût</span>
                  </div>
                </span>
              </div>

              {recipe.tags && recipe.tags.length > 0 && (
                <div className="recipe-tags">
                  {recipe.tags.map((tag, index) => (
                    <span key={index} className="badge">
                      <Tag size={14} />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="recipe-actions">
                {isAuthenticated && (
                  <button
                    onClick={handleFavorite}
                    className={`btn ${isFavorited ? 'btn-danger' : 'btn-outline'}`}
                  >
                    <Heart size={20} fill={isFavorited ? 'currentColor' : 'none'} />
                    {isFavorited ? 'Retirer' : 'Ajouter'} aux favoris
                  </button>
                )}
                <button onClick={handleShare} className="btn btn-outline">
                  <Share2 size={20} />
                  Partager
                </button>
                <button onClick={handlePrint} className="btn btn-outline">
                  <Printer size={20} />
                  Imprimer
                </button>
                {isOwner && (
                  <>
                    <Link to={`/recipes/${id}/edit`} className="btn btn-secondary">
                      <Edit size={20} />
                      Modifier
                    </Link>
                    <button onClick={handleDelete} className="btn btn-danger">
                      <Trash2 size={20} />
                      Supprimer
                    </button>
                  </>
                )}
              </div>
            </div>

            {recipe.main_image && (
              <div className="recipe-detail-image">
                <img src={recipe.main_image} alt={recipe.title} />
              </div>
            )}
          </div>

          <div className="recipe-detail-content">
            <div className="recipe-ingredients">
              <h2 className="section-title">Ingrédients</h2>
              {recipe.ingredients && recipe.ingredients.length > 0 ? (
                <ul className="ingredients-list">
                  {recipe.ingredients.map((ingredient, index) => (
                    <li key={ingredient.id || index} className="ingredient-item">
                      <span className="ingredient-name">{ingredient.name}</span>
                      <span className="ingredient-quantity">
                        {ingredient.quantity} {ingredient.unit || ''}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="empty-message">Aucun ingrédient disponible</p>
              )}
            </div>

            <div className="recipe-instructions">
              <h2 className="section-title">Instructions</h2>
              <div
                className="instructions-content"
                dangerouslySetInnerHTML={{ __html: recipe.instructions }}
              />
            </div>

            {recipe.images && recipe.images.length > 0 && (
              <div className="recipe-gallery">
                <h2 className="section-title">Galerie</h2>
                <div className="gallery-grid">
                  {recipe.images.map((image, index) => (
                    <img
                      key={index}
                      src={image.image}
                      alt={`${recipe.title} - ${index + 1}`}
                      className="gallery-image"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecipeDetail



