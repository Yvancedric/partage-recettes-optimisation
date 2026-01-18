import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import {
  ArrowLeft, Plus, Check, X, ShoppingCart, Trash2, Save
} from 'lucide-react'
import { toast } from 'react-toastify'
import './ShoppingListDetail.css'

const ShoppingListDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [list, setList] = useState(null)
  const [loading, setLoading] = useState(true)
  const [newItem, setNewItem] = useState({ ingredient_name: '', quantity: '', unit: '' })

  useEffect(() => {
    fetchList()
  }, [id])

  const fetchList = async () => {
    try {
      const response = await axios.get(`/shopping-lists/${id}/`)
      setList(response.data)
    } catch (error) {
      console.error('Error fetching list:', error)
      toast.error('Erreur lors du chargement de la liste')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleItem = async (itemId) => {
    try {
      const item = list.items.find((i) => i.id === itemId)
      await axios.patch(`/shopping-list-items/${itemId}/`, {
        is_checked: !item.is_checked,
      })
      fetchList()
    } catch (error) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  const handleAddItem = async () => {
    if (!newItem.ingredient_name.trim()) {
      toast.error('Veuillez entrer un nom d\'ingrédient')
      return
    }

    try {
      await axios.post(`/shopping-lists/${id}/add_item/`, newItem)
      toast.success('Article ajouté')
      setNewItem({ ingredient_name: '', quantity: '', unit: '' })
      fetchList()
    } catch (error) {
      toast.error('Erreur lors de l\'ajout')
    }
  }

  const handleDeleteItem = async (itemId) => {
    try {
      await axios.delete(`/shopping-list-items/${itemId}/`)
      toast.success('Article supprimé')
      fetchList()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleGenerateFromRecipe = async (recipeId) => {
    try {
      await axios.post(`/shopping-lists/${id}/from_recipe/`, { recipe_id: recipeId })
      toast.success('Liste générée depuis la recette')
      fetchList()
    } catch (error) {
      toast.error('Erreur lors de la génération')
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  if (!list) {
    return (
      <div className="empty-state">
        <h2 className="empty-state-title">Liste non trouvée</h2>
      </div>
    )
  }

  const checkedCount = list.items?.filter((item) => item.is_checked).length || 0
  const totalCount = list.items?.length || 0

  return (
    <div className="shopping-list-detail-page">
      <div className="container">
        <div className="list-detail-header">
          <button onClick={() => navigate('/shopping-lists')} className="back-link">
            <ArrowLeft size={20} />
            Retour aux listes
          </button>
          <h1 className="page-title">{list.name}</h1>
          <div className="list-progress">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${totalCount > 0 ? (checkedCount / totalCount) * 100 : 0}%` }}
              />
            </div>
            <span className="progress-text">
              {checkedCount} / {totalCount} articles
            </span>
          </div>
        </div>

        <div className="list-actions">
          <div className="add-item-form">
            <input
              type="text"
              placeholder="Nom de l'ingrédient"
              value={newItem.ingredient_name}
              onChange={(e) => setNewItem({ ...newItem, ingredient_name: e.target.value })}
              className="form-input"
              onKeyPress={(e) => e.key === 'Enter' && handleAddItem()}
            />
            <input
              type="number"
              placeholder="Quantité"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
              className="form-input"
            />
            <input
              type="text"
              placeholder="Unité"
              value={newItem.unit}
              onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
              className="form-input"
            />
            <button onClick={handleAddItem} className="btn btn-primary">
              <Plus size={20} />
              Ajouter
            </button>
          </div>
        </div>

        {list.items && list.items.length > 0 ? (
          <div className="items-list">
            {list.items.map((item) => (
              <div
                key={item.id}
                className={`item-row ${item.is_checked ? 'checked' : ''}`}
              >
                <button
                  onClick={() => handleToggleItem(item.id)}
                  className="item-checkbox"
                  aria-label="Cocher/Décocher"
                >
                  {item.is_checked ? (
                    <Check size={20} className="checked-icon" />
                  ) : (
                    <div className="unchecked-icon" />
                  )}
                </button>
                <div className="item-content">
                  <span className="item-name">{item.ingredient_name}</span>
                  <span className="item-quantity">
                    {item.quantity} {item.unit}
                  </span>
                </div>
                <button
                  onClick={() => handleDeleteItem(item.id)}
                  className="btn-icon"
                  aria-label="Supprimer"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <ShoppingCart size={64} className="empty-state-icon" />
            <h2 className="empty-state-title">Liste vide</h2>
            <p className="empty-state-text">
              Ajoutez des articles à votre liste de courses
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingListDetail
