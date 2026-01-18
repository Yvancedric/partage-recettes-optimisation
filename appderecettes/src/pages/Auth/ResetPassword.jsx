import { useState, useEffect } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { Lock, ArrowLeft, Loader, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import './Auth.css'

const ResetPassword = () => {
  console.log('ResetPassword component rendered')
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [token, setToken] = useState('')
  const [password, setPassword] = useState('')
  const [password2, setPassword2] = useState('')
  const [loading, setLoading] = useState(false)
  const [validating, setValidating] = useState(true)
  const [isValid, setIsValid] = useState(false)

  console.log('ResetPassword state:', { validating, isValid, token })

  useEffect(() => {
    const tokenParam = searchParams.get('token')
    if (tokenParam) {
      setToken(tokenParam)
      validateToken(tokenParam)
    } else {
      setValidating(false)
      setIsValid(false)
    }
  }, [searchParams])

  const validateToken = async (tokenToValidate) => {
    try {
      await axios.post('/auth/password-reset/validate_token/', {
        token: tokenToValidate,
      })
      setIsValid(true)
    } catch (error) {
      setIsValid(false)
      toast.error('Le lien de réinitialisation est invalide ou a expiré')
    } finally {
      setValidating(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (password !== password2) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setLoading(true)

    try {
      await axios.post('/auth/password-reset/confirm/', {
        token: token,
        password: password,
      })
      toast.success('Votre mot de passe a été réinitialisé avec succès !')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      const message = error.response?.data?.token?.[0] || 
                     error.response?.data?.password?.[0] || 
                     error.response?.data?.detail || 
                     'Erreur lors de la réinitialisation'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (validating) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <Loader className="spinner" size={48} />
              <h1 className="auth-title">Vérification...</h1>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!isValid) {
    console.log('Rendering invalid token view')
    return (
      <div className="auth-page" style={{ minHeight: '100vh', padding: '40px 20px' }}>
        <div className="auth-container" style={{ maxWidth: '500px', margin: '0 auto', width: '100%' }}>
          <div className="auth-card" style={{ background: '#fff', borderRadius: '16px', padding: '40px', boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
            <div className="auth-header" style={{ textAlign: 'center', marginBottom: '32px' }}>
              <XCircle size={48} style={{ color: '#bc4749', marginBottom: '16px' }} />
              <h1 style={{ fontSize: '32px', fontWeight: '700', color: '#386641', marginBottom: '8px' }}>Lien invalide</h1>
              <p style={{ color: '#636e72', fontSize: '16px' }}>
                Le lien de réinitialisation est invalide ou a expiré.
                Veuillez demander un nouveau lien.
              </p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
              <Link 
                to="/forgot-password"
                onClick={() => console.log('Link clicked: /forgot-password')}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  padding: '12px 24px',
                  backgroundColor: '#6a994e',
                  color: '#fff',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: 'none'
                }}
              >
                Demander un nouveau lien
              </Link>
              <Link 
                to="/login"
                onClick={() => console.log('Link clicked: /login')}
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  padding: '12px 24px',
                  backgroundColor: 'transparent',
                  color: '#6a994e',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  border: '2px solid #6a994e'
                }}
              >
                <ArrowLeft size={20} />
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <Lock size={48} className="auth-icon" />
            <h1 className="auth-title">Nouveau mot de passe</h1>
            <p className="auth-subtitle">
              Entrez votre nouveau mot de passe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                <Lock size={18} />
                Nouveau mot de passe
              </label>
              <input
                type="password"
                id="password"
                name="password"
                className="form-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Au moins 8 caractères"
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
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                required
                minLength={8}
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
                  Réinitialisation...
                </>
              ) : (
                <>
                  <CheckCircle size={20} />
                  Réinitialiser le mot de passe
                </>
              )}
            </button>

            <div className="auth-options">
              <Link to="/login" className="auth-link">
                <ArrowLeft size={16} />
                Retour à la connexion
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default ResetPassword

