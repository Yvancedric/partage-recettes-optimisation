import { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { Mail, ArrowLeft, Loader, CheckCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import './Auth.css'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('/auth/password-reset/', {
        email: email,
      })
      setSent(true)
      toast.success('Un email de réinitialisation a été envoyé !')
    } catch (error) {
      const message = error.response?.data?.email?.[0] || error.response?.data?.detail || 'Erreur lors de l\'envoi de l\'email'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <CheckCircle size={48} className="auth-icon" style={{ color: 'var(--primary)' }} />
              <h1 className="auth-title">Email envoyé !</h1>
              <p className="auth-subtitle">
                Nous avons envoyé un lien de réinitialisation à votre adresse email.
                Veuillez vérifier votre boîte de réception.
              </p>
            </div>
            <div className="auth-form">
              <Link to="/login" className="btn btn-primary btn-lg">
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
            <Mail size={48} className="auth-icon" />
            <h1 className="auth-title">Mot de passe oublié</h1>
            <p className="auth-subtitle">
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                <Mail size={18} />
                Adresse email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
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
                  Envoi...
                </>
              ) : (
                <>
                  <Mail size={20} />
                  Envoyer le lien
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

export default ForgotPassword

