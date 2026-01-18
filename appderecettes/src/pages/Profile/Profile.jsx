import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import axios from 'axios'
import { User, Mail, Save, Upload, ChefHat } from 'lucide-react'
import { toast } from 'react-toastify'
import './Profile.css'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState(null)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    bio: '',
    culinary_level: 1,
    profile_picture: null,
  })
  const [profileData, setProfileData] = useState({
    dietary_restrictions: [],
    allergies: [],
    food_preferences: {},
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const [profileRes, userRes] = await Promise.all([
        axios.get('/profiles/me/'),
        axios.get('/users/me/'),
      ])
      setProfile(profileRes.data)
      setFormData({
        first_name: userRes.data.first_name || '',
        last_name: userRes.data.last_name || '',
        bio: userRes.data.bio || '',
        culinary_level: userRes.data.culinary_level || 1,
        profile_picture: null,
      })
      setProfileData({
        dietary_restrictions: profileRes.data.dietary_restrictions || [],
        allergies: profileRes.data.allergies || [],
        food_preferences: profileRes.data.food_preferences || {},
      })
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, files } = e.target
    if (files) {
      setFormData({ ...formData, [name]: files[0] })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = new FormData()
      data.append('first_name', formData.first_name)
      data.append('last_name', formData.last_name)
      data.append('bio', formData.bio)
      data.append('culinary_level', formData.culinary_level)
      if (formData.profile_picture) {
        data.append('profile_picture', formData.profile_picture)
      }

      await updateUser(data)
      await fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
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
    <div className="profile-page">
      <div className="container">
        <h1 className="page-title">Mon Profil</h1>

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar">
                {user?.profile_picture ? (
                  <img src={user.profile_picture} alt={user.username} />
                ) : (
                  <User size={64} />
                )}
              </div>
              <h2 className="profile-username">{user?.username}</h2>
              <p className="profile-email">{user?.email}</p>
            </div>

            <form onSubmit={handleSubmit} className="profile-form">
              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Prénom
                </label>
                <input
                  type="text"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <User size={18} />
                  Nom
                </label>
                <input
                  type="text"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <ChefHat size={18} />
                  Niveau culinaire (1-5)
                </label>
                <input
                  type="number"
                  name="culinary_level"
                  className="form-input"
                  value={formData.culinary_level}
                  onChange={handleChange}
                  min="1"
                  max="5"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Biographie</label>
                <textarea
                  name="bio"
                  className="form-textarea"
                  value={formData.bio}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Parlez-nous de vous..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Upload size={18} />
                  Photo de profil
                </label>
                <input
                  type="file"
                  name="profile_picture"
                  accept="image/*"
                  onChange={handleChange}
                  className="form-input"
                />
              </div>

              <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
                <Save size={20} />
                {saving ? 'Sauvegarde...' : 'Enregistrer les modifications'}
              </button>
            </form>
          </div>

          <div className="profile-preferences">
            <div className="preference-section">
              <h3 className="preference-title">Régimes alimentaires</h3>
              <div className="preference-list">
                {profileData.dietary_restrictions.length > 0 ? (
                  profileData.dietary_restrictions.map((restriction) => (
                    <span key={restriction.id} className="badge">
                      {restriction.name}
                    </span>
                  ))
                ) : (
                  <p className="empty-text">Aucun régime alimentaire sélectionné</p>
                )}
              </div>
            </div>

            <div className="preference-section">
              <h3 className="preference-title">Allergies</h3>
              <div className="preference-list">
                {profileData.allergies.length > 0 ? (
                  profileData.allergies.map((allergy) => (
                    <span key={allergy.id} className="badge badge-danger">
                      {allergy.name}
                    </span>
                  ))
                ) : (
                  <p className="empty-text">Aucune allergie déclarée</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
