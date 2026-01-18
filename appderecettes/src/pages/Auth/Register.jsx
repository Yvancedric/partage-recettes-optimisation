import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { UserPlus, Mail, Lock, User, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    first_name: '',
    last_name: '',
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (formData.password !== formData.password2) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    setLoading(true)
    const result = await register(formData)
    setLoading(false)

    if (result.success) {
      navigate('/login')
    }
  }

  const handleGoogleLogin = () => {
    toast.error('L\'authentification Google n\'est pas encore configurée. Veuillez utiliser l\'inscription classique.')
  }

  const handleFacebookLogin = () => {
    toast.error('L\'authentification Facebook n\'est pas encore configurée. Veuillez utiliser l\'inscription classique.')
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <UserPlus size={48} className="auth-icon" />
            <h1 className="auth-title">Inscription</h1>
            <p className="auth-subtitle">Créez votre compte gratuitement</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name" className="form-label">
                  <User size={18} />
                  Prénom
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  className="form-input"
                  value={formData.first_name}
                  onChange={handleChange}
                  placeholder="Votre prénom"
                />
              </div>

              <div className="form-group">
                <label htmlFor="last_name" className="form-label">
                  <User size={18} />
                  Nom
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  className="form-input"
                  value={formData.last_name}
                  onChange={handleChange}
                  placeholder="Votre nom"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <User size={18} />
                Nom d'utilisateur
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Choisissez un nom d'utilisateur"
              />
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre@email.com"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={18} />
                Mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder="Au moins 8 caractères"
                minLength={8}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password2" className="form-label">
                <Lock size={18} />
                Confirmer le mot de passe
              </label>
              <input
                type="password"
                id="password2"
                name="password2"
                className="form-input"
                value={formData.password2}
                onChange={handleChange}
                required
                placeholder="Répétez votre mot de passe"
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={20} />
                  Inscription...
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  S'inscrire
                </>
              )}
            </button>

            <div className="auth-divider">
              <span>ou</span>
            </div>

            <div className="auth-social">
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={handleGoogleLogin}
              >
                Continuer avec Google
              </button>
              <button 
                type="button" 
                className="btn btn-outline"
                onClick={handleFacebookLogin}
              >
                Continuer avec Facebook
              </button>
            </div>

            <p className="auth-footer">
              Déjà un compte ?{' '}
              <Link to="/login" className="auth-link">
                Connectez-vous
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Register
