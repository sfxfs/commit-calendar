import { HashRouter, Routes, Route, Navigate, useSearchParams } from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import PatternDesigner from './components/PatternDesigner'
import Layout from './components/Layout'
import OAuthCallback from './components/OAuthCallback'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Loading...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

// Wrapper component to handle OAuth callback at root level
function AppContent() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')

  // If we have a code parameter, show the OAuth callback component
  if (code) {
    return <OAuthCallback />
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="generate" element={<PatternDesigner />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
