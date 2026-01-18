import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, X, Search, User, LogOut, ChefHat, BookOpen, ShoppingCart } from 'lucide-react'
import { useState } from 'react'
import './Navbar.css'

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsMenuOpen(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/recipes?search=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
    }
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <ChefHat size={32} />
          <span>Recettes</span>
        </Link>

        <form onSubmit={handleSearch} className="navbar-search">
          <input
            type="text"
            placeholder="Rechercher une recette..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="navbar-search-input"
          />
          <button type="submit" className="navbar-search-btn">
            <Search size={20} />
          </button>
        </form>

        <div className={`navbar-menu ${isMenuOpen ? 'active' : ''}`}>
          <Link to="/recipes" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
            <BookOpen size={20} />
            <span>Recettes</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                <span>Tableau de bord</span>
              </Link>
              <Link
                to="/shopping-lists"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <ShoppingCart size={20} />
                <span>Courses</span>
              </Link>
              <Link
                to="/profile"
                className="navbar-link"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                <span>{user?.username || 'Profil'}</span>
              </Link>
              <button onClick={handleLogout} className="navbar-link navbar-logout">
                <LogOut size={20} />
                <span>Déconnexion</span>
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-link" onClick={() => setIsMenuOpen(false)}>
                Connexion
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setIsMenuOpen(false)}>
                Inscription
              </Link>
            </>
          )}
        </div>

        <button
          className="navbar-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
