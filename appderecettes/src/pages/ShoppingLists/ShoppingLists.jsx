import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Plus, ShoppingCart, Calendar, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import './ShoppingLists.css'

const ShoppingLists = () => {
  const [lists, setLists] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLists()
  }, [])

  const fetchLists = async () => {
    try {
      const response = await axios.get('/shopping-lists/')
      setLists(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching lists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette liste ?')) {
      return
    }

    try {
      await axios.delete(`/shopping-lists/${id}/`)
      toast.success('Liste supprimée')
      fetchLists()
    } catch (error) {
      toast.error('Erreur lors de la suppression')
    }
  }

  const handleCreate = async () => {
    try {
      const response = await axios.post('/shopping-lists/', {
        name: 'Ma liste de courses',
      })
      toast.success('Liste créée')
      fetchLists()
    } catch (error) {
      toast.error('Erreur lors de la création')
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
    <div className="shopping-lists-page">
      <div className="container">
        <div className="lists-header">
          <h1 className="page-title">Mes listes de courses</h1>
          <button onClick={handleCreate} className="btn btn-primary">
            <Plus size={20} />
            Créer une liste
          </button>
        </div>

        {lists.length === 0 ? (
          <div className="empty-state">
            <ShoppingCart size={64} className="empty-state-icon" />
            <h2 className="empty-state-title">Aucune liste de courses</h2>
            <p className="empty-state-text">
              Créez votre première liste de courses pour commencer
            </p>
            <button onClick={handleCreate} className="btn btn-primary">
              <Plus size={20} />
              Créer ma première liste
            </button>
          </div>
        ) : (
          <div className="lists-grid">
            {lists.map((list) => (
              <div key={list.id} className="list-card">
                <div className="list-header">
                  <h3 className="list-title">{list.name}</h3>
                  <button
                    onClick={() => handleDelete(list.id)}
                    className="btn-icon"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="list-info">
                  <span className="list-item-count">
                    {list.items?.length || 0} articles
                  </span>
                  <span className="list-date">
                    <Calendar size={14} />
                    {new Date(list.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <Link to={`/shopping-lists/${list.id}`} className="btn btn-primary">
                  Ouvrir la liste
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingLists
