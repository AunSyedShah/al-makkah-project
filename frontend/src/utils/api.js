import axios from 'axios'

// Detect if we're in GitHub Codespaces
const isCodespaces = () => {
  return typeof window !== 'undefined' && 
         (window.location.hostname.includes('github.dev') || 
          window.location.hostname.includes('preview.app.github.dev'))
}

// Get the base API URL
const getApiBaseUrl = () => {
  if (isCodespaces()) {
    // In Codespaces, replace the port from 5173 to 3000
    const currentUrl = window.location.origin
    return currentUrl.replace('-5173', '-3000')
  }
  
  // Use environment variable or fallback to localhost
  return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
}

// Create axios instance with dynamic base URL
const api = axios.create({
  baseURL: getApiBaseUrl() + '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
})

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Export both the configured instance and the base URL function
export default api
export { getApiBaseUrl }

// Helper function to log current API configuration
export const logApiConfig = () => {
  const baseUrl = getApiBaseUrl()
  console.log('🔧 API Configuration:', {
    baseURL: baseUrl + '/api',
    isCodespaces: isCodespaces(),
    currentOrigin: typeof window !== 'undefined' ? window.location.origin : 'N/A'
  })
}
