import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogIn, Mail, Lock, Loader } from 'lucide-react'
import { toast } from 'react-toastify'
import './Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const result = await login(formData.username, formData.password)
    setLoading(false)

    if (result.success) {
      navigate('/dashboard')
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
            <LogIn size={48} className="auth-icon" />
            <h1 className="auth-title">Connexion</h1>
            <p className="auth-subtitle">Connectez-vous à votre compte</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                <Mail size={18} />
                Nom d'utilisateur ou Email
              </label>
              <input
                type="text"
                id="username"
                name="username"
                className="form-input"
                value={formData.username}
                onChange={handleChange}
                required
                placeholder="Entrez votre nom d'utilisateur ou email"
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
                placeholder="Entrez votre mot de passe"
              />
            </div>

            <div className="auth-options">
              <Link to="/forgot-password" className="auth-link">
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="spinner" size={20} />
                  Connexion...
                </>
              ) : (
                <>
                  <LogIn size={20} />
                  Se connecter
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
              Pas encore de compte ?{' '}
              <Link to="/register" className="auth-link">
                Inscrivez-vous
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Login
