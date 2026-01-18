import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Save, Plus, X } from 'lucide-react'
import { toast } from 'react-toastify'
import './RecipeForm.css'

const RecipeEdit = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prep_time: '',
    cook_time: '',
    servings: '',
    difficulty: '2',
    estimated_cost: '2',
    instructions: '',
    tags: [],
    main_image: null,
    category_id: '',
    ingredients: [],
    images: [],
  })
  const [tagInput, setTagInput] = useState('')

  useEffect(() => {
    fetchCategories()
    fetchRecipe()
  }, [id])

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/recipe-categories/')
      setCategories(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchRecipe = async () => {
    try {
      const response = await axios.get(`/recipes/${id}/`)
      const recipe = response.data
      setFormData({
        title: recipe.title,
        description: recipe.description,
        prep_time: recipe.prep_time,
        cook_time: recipe.cook_time,
        servings: recipe.servings,
        difficulty: recipe.difficulty.toString(),
        estimated_cost: recipe.estimated_cost.toString(),
        instructions: recipe.instructions,
        tags: recipe.tags || [],
        category_id: recipe.category?.id || '',
        ingredients: recipe.ingredients || [],
        images: [],
      })
    } catch (error) {
      toast.error('Erreur lors du chargement de la recette')
      navigate('/recipes')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      if (name === 'main_image') {
        setFormData({ ...formData, [name]: files[0] })
      } else if (name === 'images') {
        setFormData({ ...formData, images: Array.from(files).slice(0, 5) })
      }
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()],
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((t) => t !== tag),
    })
  }

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        { name: '', quantity: '', unit: '', category_id: '', estimated_price: '' },
      ],
    })
  }

  const handleIngredientChange = (index, field, value) => {
    const newIngredients = [...formData.ingredients]
    newIngredients[index][field] = value
    setFormData({ ...formData, ingredients: newIngredients })
  }

  const handleRemoveIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index),
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      // Filtrer les ingrédients vides avant l'envoi
      const validIngredients = formData.ingredients.filter(
        ing => ing.name && ing.name.trim() !== '' && ing.quantity && ing.quantity.toString().trim() !== ''
      )
      
      console.log('Ingredients avant filtrage:', formData.ingredients)
      console.log('Ingredients valides après filtrage:', validIngredients)
      
      const data = new FormData()
      data.append('title', formData.title)
      data.append('description', formData.description)
      data.append('prep_time', formData.prep_time)
      data.append('cook_time', formData.cook_time)
      data.append('servings', formData.servings)
      data.append('difficulty', formData.difficulty)
      data.append('estimated_cost', formData.estimated_cost)
      data.append('instructions', formData.instructions)
      data.append('tags', JSON.stringify(formData.tags))
      if (formData.category_id) data.append('category_id', formData.category_id)
      if (formData.main_image) data.append('main_image', formData.main_image)
      formData.images.forEach((img) => data.append('images', img))
      data.append('ingredients', JSON.stringify(validIngredients))
      
      console.log('Données envoyées - ingredients:', JSON.stringify(validIngredients))

      await axios.put(`/recipes/${id}/`, data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      toast.success('Recette mise à jour avec succès!')
      navigate(`/recipes/${id}`)
    } catch (error) {
      toast.error('Erreur lors de la mise à jour de la recette')
      console.error(error)
    } finally {
      setSaving(false)
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
    <div className="recipe-form-page">
      <div className="container">
        <h1 className="page-title">Modifier la recette</h1>

        <form onSubmit={handleSubmit} className="recipe-form">
          <div className="form-section">
            <h2 className="section-title">Informations générales</h2>
            <div className="form-group">
              <label className="form-label">Titre *</label>
              <input
                type="text"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea
                name="description"
                className="form-textarea"
                value={formData.description}
                onChange={handleChange}
                required
                rows="4"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Catégorie</label>
              <select
                name="category_id"
                className="form-select"
                value={formData.category_id}
                onChange={handleChange}
              >
                <option value="">Sélectionner une catégorie</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Temps de préparation (min) *</label>
                <input
                  type="number"
                  name="prep_time"
                  className="form-input"
                  value={formData.prep_time}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Temps de cuisson (min) *</label>
                <input
                  type="number"
                  name="cook_time"
                  className="form-input"
                  value={formData.cook_time}
                  onChange={handleChange}
                  required
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Nombre de personnes *</label>
                <input
                  type="number"
                  name="servings"
                  className="form-input"
                  value={formData.servings}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Difficulté *</label>
                <select
                  name="difficulty"
                  className="form-select"
                  value={formData.difficulty}
                  onChange={handleChange}
                  required
                >
                  <option value="1">Très facile</option>
                  <option value="2">Facile</option>
                  <option value="3">Moyen</option>
                  <option value="4">Difficile</option>
                  <option value="5">Très difficile</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Coût estimé *</label>
                <select
                  name="estimated_cost"
                  className="form-select"
                  value={formData.estimated_cost}
                  onChange={handleChange}
                  required
                >
                  <option value="1">FCFA - Économique</option>
                  <option value="2">FCFA - Modéré</option>
                  <option value="3">FCFA - Coûteux</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Ingrédients</h2>
            {formData.ingredients.map((ingredient, index) => (
              <div key={index} className="ingredient-row">
                <input
                  type="text"
                  placeholder="Nom de l'ingrédient"
                  className="form-input"
                  value={ingredient.name}
                  onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                  required
                />
                <input
                  type="number"
                  placeholder="Quantité"
                  className="form-input"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                  required
                  step="0.01"
                />
                <input
                  type="text"
                  placeholder="Unité"
                  className="form-input"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveIngredient(index)}
                  className="btn btn-danger btn-sm"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddIngredient}
              className="btn btn-outline"
            >
              <Plus size={20} />
              Ajouter un ingrédient
            </button>
          </div>

          <div className="form-section">
            <h2 className="section-title">Instructions</h2>
            <div className="form-group">
              <label className="form-label">Étapes de préparation *</label>
              <textarea
                name="instructions"
                className="form-textarea"
                value={formData.instructions}
                onChange={handleChange}
                required
                rows="10"
                placeholder="Décrivez les étapes de préparation..."
              />
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Tags</h2>
            <div className="tags-input">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Ajouter un tag"
                className="form-input"
              />
              <button type="button" onClick={handleAddTag} className="btn btn-primary">
                <Plus size={20} />
              </button>
            </div>
            <div className="tags-list">
              {formData.tags.map((tag, index) => (
                <span key={index} className="badge">
                  {tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="tag-remove"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          </div>

          <div className="form-section">
            <h2 className="section-title">Images</h2>
            <div className="form-group">
              <label className="form-label">Image principale</label>
              <input
                type="file"
                name="main_image"
                accept="image/*"
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Images supplémentaires (max 5)</label>
              <input
                type="file"
                name="images"
                accept="image/*"
                multiple
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <Save size={20} />
              {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RecipeEdit



