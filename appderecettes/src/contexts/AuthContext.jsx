import { createContext, useState, useContext, useEffect } from 'react'
import axios from 'axios'
import { toast } from 'react-toastify'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

const API_URL = import.meta.env.VITE_API_URL || '/mes-recettes'

axios.defaults.baseURL = API_URL

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [token])

  const fetchUser = async () => {
    try {
      const response = await axios.get('/users/me/')
      setUser(response.data)
    } catch (error) {
      console.error('Error fetching user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (username, password) => {
    try {
      const response = await axios.post('/auth/login/', {
        username,
        password,
      })
      const { access, refresh } = response.data
      localStorage.setItem('token', access)
      localStorage.setItem('refresh_token', refresh)
      setToken(access)
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`
      await fetchUser()
      toast.success('Connexion réussie!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur de connexion'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      await axios.post('/auth/register/', userData)
      toast.success('Inscription réussie! Veuillez vérifier votre email.')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur d\'inscription'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh_token')
    setToken(null)
    setUser(null)
    delete axios.defaults.headers.common['Authorization']
    toast.info('Déconnexion réussie')
  }

  const setTokens = (accessToken, refreshToken) => {
    localStorage.setItem('token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)
    setToken(accessToken)
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
    fetchUser()
  }

  const updateUser = async (userData) => {
    try {
      const response = await axios.put('/users/update_me/', userData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      setUser(response.data)
      toast.success('Profil mis à jour!')
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.detail || 'Erreur de mise à jour'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    setTokens,
    updateUser,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}




