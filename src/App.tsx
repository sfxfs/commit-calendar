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

// Wrapper to check for OAuth code
function OAuthWrapper() {
  const [searchParams] = useSearchParams()
  const code = searchParams.get('code')

  if (code) {
    return <OAuthCallback />
  }

  return (
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
  )
}

function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <OAuthWrapper />
      </HashRouter>
    </AuthProvider>
  )
}

export default App
