import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider } from './contexts/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Layout/Navbar'
import Footer from './components/Layout/Footer'
import Home from './pages/Home'
import Login from './pages/Auth/Login'
import Register from './pages/Auth/Register'
import ForgotPassword from './pages/Auth/ForgotPassword'
import ResetPassword from './pages/Auth/ResetPassword'
import SocialAuthCallback from './pages/Auth/SocialAuthCallback'
import Profile from './pages/Profile/Profile'
import Dashboard from './pages/Dashboard/Dashboard'
import Recipes from './pages/Recipes/Recipes'
import RecipeDetail from './pages/Recipes/RecipeDetail'
import RecipeCreate from './pages/Recipes/RecipeCreate'
import RecipeEdit from './pages/Recipes/RecipeEdit'
import ShoppingLists from './pages/ShoppingLists/ShoppingLists'
import ShoppingListDetail from './pages/ShoppingLists/ShoppingListDetail'
import './App.css'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />`n              <Route path="/auth/callback" element={<SocialAuthCallback />} />
              <Route path="/recipes" element={<Recipes />} />
              <Route path="/recipes/:id" element={<RecipeDetail />} />
              <Route
                path="/recipes/create"
                element={
                  <PrivateRoute>
                    <RecipeCreate />
                  </PrivateRoute>
                }
              />
              <Route
                path="/recipes/:id/edit"
                element={
                  <PrivateRoute>
                    <RecipeEdit />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/shopping-lists"
                element={
                  <PrivateRoute>
                    <ShoppingLists />
                  </PrivateRoute>
                }
              />
              <Route
                path="/shopping-lists/:id"
                element={
                  <PrivateRoute>
                    <ShoppingListDetail />
                  </PrivateRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <Footer />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App



