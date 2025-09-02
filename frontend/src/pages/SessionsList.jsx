import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Trash2,
  User,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Tag,
  Presentation,
  Download
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'

export default function SessionsList() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [sessions, setSessions] = useState([])
  const [expos, setExpos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Filters
  const [selectedExpo, setSelectedExpo] = useState(searchParams.get('expo') || '')
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || '')
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '')
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || '')
  const [dateFilter, setDateFilter] = useState(searchParams.get('date') || '')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalSessions, setTotalSessions] = useState(0)

  const sessionTypes = [
    'conference', 'workshop', 'seminar', 'panel_discussion', 
    'keynote', 'networking', 'exhibition_tour', 'product_demo'
  ]

  const sessionStatuses = [
    'draft', 'scheduled', 'ongoing', 'completed', 'cancelled'
  ]

  const statusStyles = {
    draft: 'bg-gray-100 text-gray-800',
    scheduled: 'bg-blue-100 text-blue-800',
    ongoing: 'bg-green-100 text-green-800',
    completed: 'bg-purple-100 text-purple-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  const statusIcons = {
    draft: Edit,
    scheduled: Calendar,
    ongoing: Play,
    completed: CheckCircle,
    cancelled: XCircle
  }

  useEffect(() => {
    fetchExpos()
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [selectedExpo, searchTerm, statusFilter, typeFilter, categoryFilter, dateFilter, currentPage])

  const fetchExpos = async () => {
    try {
      const response = await api.get('/expos')
      setExpos(response.data.data.expos || [])
    } catch (error) {
      console.error('Error fetching expos:', error)
    }
  }

  const fetchSessions = async () => {
    try {
      setLoading(true)
      let url = '/sessions'
      const params = new URLSearchParams()

      if (selectedExpo) {
        url = `/sessions/expo/${selectedExpo}`
      }
      
      if (searchTerm) params.append('search', searchTerm)
      if (statusFilter) params.append('status', statusFilter)
      if (typeFilter) params.append('type', typeFilter)
      if (categoryFilter) params.append('category', categoryFilter)
      if (dateFilter) params.append('date', dateFilter)
      params.append('page', currentPage.toString())
      params.append('limit', '12')

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await api.get(url)
      const data = response.data.data

      setSessions(data.sessions || [])
      setTotalPages(data.pagination?.pages || 1)
      setTotalSessions(data.pagination?.total || 0)
    } catch (error) {
      setError('Failed to fetch sessions')
      console.error('Error fetching sessions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e) => {
    e.preventDefault()
    updateFilters({ search: searchTerm, page: 1 })
  }

  const updateFilters = (newFilters) => {
    const params = new URLSearchParams(searchParams)
    
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key]) {
        params.set(key, newFilters[key])
      } else {
        params.delete(key)
      }
    })
    
    setSearchParams(params)
    if (newFilters.page) {
      setCurrentPage(newFilters.page)
    }
  }

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this session?')) return

    try {
      await api.delete(`/sessions/${sessionId}`)
      fetchSessions()
    } catch (error) {
      setError('Failed to delete session')
    }
  }

  const handleStatusChange = async (sessionId, newStatus) => {
    try {
      await api.patch(`/sessions/${sessionId}/status`, { status: newStatus })
      fetchSessions()
    } catch (error) {
      setError('Failed to update session status')
    }
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const canManageSessions = user?.role === 'admin' || user?.role === 'organizer'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sessions Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage conference sessions, workshops, and events
          </p>
        </div>

        {canManageSessions && (
          <Link
            to="/sessions/create"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Session
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Expo Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Expo
            </label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={selectedExpo}
              onChange={(e) => {
                setSelectedExpo(e.target.value)
                updateFilters({ expo: e.target.value, page: 1 })
              }}
            >
              <option value="">All Expos</option>
              {expos.map((expo) => (
                <option key={expo._id} value={expo._id}>
                  {expo.title}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value)
                updateFilters({ type: e.target.value, page: 1 })
              }}
            >
              <option value="">All Types</option>
              {sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                updateFilters({ status: e.target.value, page: 1 })
              }}
            >
              <option value="">All Statuses</option>
              {sessionStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Date Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                updateFilters({ date: e.target.value, page: 1 })
              }}
            />
          </div>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search sessions, speakers, topics..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Search className="h-4 w-4" />
          </button>
        </form>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Sessions List */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <>
          {/* Summary */}
          <div className="bg-white shadow rounded-lg p-4">
            <p className="text-sm text-gray-600">
              Showing {sessions.length} of {totalSessions} sessions
              {selectedExpo && (
                <span className="ml-2 text-blue-600">
                  • Filtered by expo
                </span>
              )}
            </p>
          </div>

          {/* Sessions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions.map((session) => {
              const StatusIcon = statusIcons[session.status] || Calendar
              
              return (
                <div key={session._id} className="bg-white shadow rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {session.title}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[session.status]}`}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {session.type.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-2" />
                        {formatDateTime(session.startTime)}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <Clock className="h-4 w-4 mr-2" />
                        {Math.round((new Date(session.endTime) - new Date(session.startTime)) / (1000 * 60))} minutes
                      </div>

                      {session.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-2" />
                          {session.location}
                        </div>
                      )}

                      {session.speakers && session.speakers.length > 0 && (
                        <div className="flex items-center text-sm text-gray-500">
                          <User className="h-4 w-4 mr-2" />
                          {session.speakers.length} speaker{session.speakers.length !== 1 ? 's' : ''}
                        </div>
                      )}

                      {session.maxAttendees && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Users className="h-4 w-4 mr-2" />
                          Max {session.maxAttendees} attendees
                        </div>
                      )}
                    </div>

                    {/* Description */}
                    {session.description && (
                      <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                        {session.description}
                      </p>
                    )}

                    {/* Tags */}
                    {session.topics && session.topics.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {session.topics.slice(0, 3).map((topic, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700">
                            <Tag className="h-3 w-3 mr-1" />
                            {topic}
                          </span>
                        ))}
                        {session.topics.length > 3 && (
                          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700">
                            +{session.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <Link
                        to={`/sessions/${session._id}`}
                        className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View Details
                      </Link>

                      {canManageSessions && (
                        <div className="flex space-x-2">
                          <Link
                            to={`/sessions/${session._id}/edit`}
                            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-800"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          
                          <button
                            onClick={() => handleDeleteSession(session._id)}
                            className="inline-flex items-center text-sm text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          {/* Quick Status Change */}
                          <select
                            value={session.status}
                            onChange={(e) => handleStatusChange(session._id, e.target.value)}
                            className="text-xs border border-gray-300 rounded px-2 py-1"
                          >
                            {sessionStatuses.map((status) => (
                              <option key={status} value={status}>
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Empty State */}
          {sessions.length === 0 && (
            <div className="text-center py-12">
              <Presentation className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No sessions found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || selectedExpo || statusFilter || typeFilter 
                  ? 'Try adjusting your filters or search terms.'
                  : 'Get started by creating your first session.'
                }
              </p>
              {canManageSessions && !searchTerm && !selectedExpo && (
                <div className="mt-6">
                  <Link
                    to="/sessions/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Session
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => updateFilters({ page: currentPage - 1 })}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => updateFilters({ page: currentPage + 1 })}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => updateFilters({ page: currentPage - 1 })}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => updateFilters({ page })}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === page
                            ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() => updateFilters({ page: currentPage + 1 })}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
