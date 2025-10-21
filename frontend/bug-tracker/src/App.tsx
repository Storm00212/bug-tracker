/**
 * MAIN APPLICATION COMPONENT
 *
 * Fully responsive layout with a fixed, opaque gradient top navbar.
 * Inline navigation for desktop, dropdown for mobile.
 * All TailwindCSS classes defined inline — no dependency on pre-defined styles.
 */

import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { useEffect, useState } from 'react'
import {
  LayoutDashboard,
  FolderKanban,
  Bug,
  Shield,
  LogOut,
  Menu,
  X
} from 'lucide-react'

// Page Components
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import BugsPage from './pages/BugsPage'
import BugDetailPage from './pages/BugDetailPage'
import BugFormPage from './pages/BugFormPage'
import AdminPage from './pages/AdminPage'

// Loading Component
import LoadingSpinner from './components/ui/LoadingSpinner'

/* ------------------------- MAIN LAYOUT COMPONENT -------------------------- */
const MainLayout: React.FC = () => {
  const { user, logout, hasRole } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Bugs', href: '/bugs', icon: Bug },
    ...(hasRole('Admin') ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]

  const handleLogout = () => logout()

  return (
    <div className="min-h-screen bg-base-200">
      {/* NAVBAR */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-accent-primary to-accent-secondary text-white shadow-lg border-b border-white/10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 lg:px-8">
          {/* LOGO / BRAND */}
          <div className="flex items-center space-x-2">
            <h1 className="text-lg md:text-xl font-bold tracking-wide drop-shadow-sm">
              Bug Tracker
            </h1>
          </div>

          {/* DESKTOP NAVIGATION */}
          <nav className="hidden lg:flex items-center space-x-4">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white/90 hover:text-white transition-all duration-200 hover:scale-105"
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* USER INFO + LOGOUT (DESKTOP) */}
          <div className="hidden lg:flex items-center space-x-4">
            <span className="text-sm font-medium text-white/90">
              {user?.username}{' '}
              <span className="text-xs text-white/70 ml-1">({user?.role})</span>
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 text-sm font-semibold text-red-100 hover:text-white transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden text-white focus:outline-none hover:scale-110 transition-transform duration-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* MOBILE MENU DROPDOWN */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-gradient-to-b from-accent-secondary to-accent-primary border-t border-white/20 shadow-inner">
            <nav className="flex flex-col p-4 space-y-3">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center space-x-2 text-sm font-medium text-white/90 hover:text-white transition-all duration-150"
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              ))}
              <hr className="border-white/20 my-2" />
              <div className="flex items-center justify-between text-sm font-medium text-white/90">
                <span>{user?.username}</span>
                <button
                  onClick={() => {
                    handleLogout()
                    setMobileMenuOpen(false)
                  }}
                  className="flex items-center space-x-1 text-red-200 hover:text-white transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="pt-20 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/projects/:id" element={<ProjectDetailPage />} />
          <Route path="/bugs" element={<BugsPage />} />
          <Route path="/bugs/new" element={<BugFormPage />} />
          <Route path="/bugs/:id" element={<BugDetailPage />} />
          <Route path="/bugs/:id/edit" element={<BugFormPage />} />
          {hasRole('Admin') && <Route path="/admin" element={<AdminPage />} />}
        </Routes>
      </main>
    </div>
  )
}

/* ---------------------------- PROTECTED ROUTES ---------------------------- */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )

  if (!isAuthenticated) return <Navigate to="/login" replace />
  return <>{children}</>
}

/* ------------------------------ ADMIN ROUTES ------------------------------ */
const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )

  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (!isAdmin()) return <Navigate to="/dashboard" replace />
  return <>{children}</>
}

/* ---------------------------- MAIN APPLICATION ---------------------------- */
function App() {
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark-tech')
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-accent-primary to-accent-secondary">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-base-200">
      <Routes>
        {/* Public Routes */}
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
        />
        <Route
          path="/register"
          element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />}
        />

        {/* Protected Routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        />

        {/* Catch-All */}
        <Route
          path="*"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />}
        />
      </Routes>
    </div>
  )
}

export default App
