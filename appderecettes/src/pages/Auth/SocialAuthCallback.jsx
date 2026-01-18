import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Loader, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import './Auth.css'

const SocialAuthCallback = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setTokens } = useAuth()

  useEffect(() => {
    const accessToken = searchParams.get('access')
    const refreshToken = searchParams.get('refresh')
    const error = searchParams.get('error')

    if (error) {
      toast.error('Échec de l\'authentification sociale')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
      return
    }

    if (accessToken && refreshToken) {
      // Sauvegarder les tokens
      localStorage.setItem('access_token', accessToken)
      localStorage.setItem('refresh_token', refreshToken)
      
      // Mettre à jour le contexte
      if (setTokens) {
        setTokens(accessToken, refreshToken)
      }

      toast.success('Connexion réussie !')
      setTimeout(() => {
        navigate('/dashboard')
      }, 1000)
    } else {
      toast.error('Erreur lors de l\'authentification')
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    }
  }, [searchParams, navigate, setTokens])

  const accessToken = searchParams.get('access')
  const refreshToken = searchParams.get('refresh')
  const error = searchParams.get('error')

  if (error) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <XCircle size={48} className="auth-icon" style={{ color: 'var(--accent)' }} />
              <h1 className="auth-title">Erreur d'authentification</h1>
              <p className="auth-subtitle">
                L'authentification sociale a échoué. Veuillez réessayer.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (accessToken && refreshToken) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <CheckCircle size={48} className="auth-icon" style={{ color: 'var(--primary)' }} />
              <h1 className="auth-title">Connexion réussie !</h1>
              <p className="auth-subtitle">
                Redirection en cours...
              </p>
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
            <Loader className="spinner" size={48} />
            <h1 className="auth-title">Authentification en cours...</h1>
            <p className="auth-subtitle">
              Veuillez patienter pendant que nous vous connectons.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialAuthCallback
