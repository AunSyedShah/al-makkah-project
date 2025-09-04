import { createContext, useContext, useReducer, useEffect } from 'react'
import api, { logApiConfig } from '../utils/api'

const AuthContext = createContext()

const initialState = {
  user: null,
  loading: true,
  error: null
}

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null }
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, loading: false, error: null }
    case 'AUTH_ERROR':
      return { ...state, user: null, loading: false, error: action.payload }
    case 'LOGOUT':
      return { ...state, user: null, loading: false, error: null }
    default:
      return state
  }
}

const API_BASE_URL = 'http://localhost:3000'

// Configure axios defaults
api.defaults.headers.common['Content-Type'] = 'application/json'

// Add request interceptor to include token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Add response interceptor to handle auth errors  
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    checkAuthStatus()
    // Log API configuration for debugging
    logApiConfig()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        dispatch({ type: 'AUTH_ERROR', payload: 'No token found' })
        return
      }

      const response = await api.get('/auth/me')
      dispatch({ type: 'AUTH_SUCCESS', payload: response.data.user })
    } catch (error) {
      console.error('Auth check failed:', error)
      localStorage.removeItem('token')
      dispatch({ type: 'AUTH_ERROR', payload: error.response?.data?.error || 'Authentication failed' })
    }
  }

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await api.post('/auth/login', credentials)
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Login failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await api.post('/auth/register', userData)
      
      const { token, user } = response.data
      localStorage.setItem('token', token)
      
      dispatch({ type: 'AUTH_SUCCESS', payload: user })
      return { success: true }
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Registration failed'
      dispatch({ type: 'AUTH_ERROR', payload: errorMessage })
      return { success: false, error: errorMessage }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      localStorage.removeItem('token')
      dispatch({ type: 'LOGOUT' })
    }
  }

  const value = {
    ...state,
    login,
    register,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
