import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import ExposList from './pages/ExposList'
import ExpoDetails from './pages/ExpoDetails'
import ExhibitorsList from './pages/ExhibitorsList'
import ExhibitorDetails from './pages/ExhibitorDetails'
import BoothManagement from './pages/BoothManagement'
import Applications from './pages/Applications'
import Communications from './pages/Communications'
import Analytics from './pages/Analytics'
import Settings from './pages/Settings'
import SessionsList from './pages/SessionsList'
import SessionDetails from './pages/SessionDetails'
import SessionSchedule from './pages/SessionSchedule'
import Layout from './components/Layout'
import './App.css'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return user ? children : <Navigate to="/login" />
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth()
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  return user ? <Navigate to="/dashboard" /> : children
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            } />
            <Route path="/register" element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            } />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/expos" element={
              <ProtectedRoute>
                <Layout>
                  <ExposList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/expos/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ExpoDetails />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/exhibitors" element={
              <ProtectedRoute>
                <Layout>
                  <ExhibitorsList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/exhibitors/:id" element={
              <ProtectedRoute>
                <Layout>
                  <ExhibitorDetails />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/booths" element={
              <ProtectedRoute>
                <Layout>
                  <BoothManagement />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/applications" element={
              <ProtectedRoute>
                <Layout>
                  <Applications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/communications" element={
              <ProtectedRoute>
                <Layout>
                  <Communications />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/analytics" element={
              <ProtectedRoute>
                <Layout>
                  <Analytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <Layout>
                  <Settings />
                </Layout>
              </ProtectedRoute>
            } />
            
            {/* Sessions Routes */}
            <Route path="/sessions" element={
              <ProtectedRoute>
                <Layout>
                  <SessionsList />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/sessions/schedule" element={
              <ProtectedRoute>
                <Layout>
                  <SessionSchedule />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/sessions/:id" element={
              <ProtectedRoute>
                <Layout>
                  <SessionDetails />
                </Layout>
              </ProtectedRoute>
            } />
            
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
