import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Grid,
  List,
  Plus,
  Eye,
  Edit,
  Play,
  User,
  Tag
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'

export default function SessionSchedule() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [schedule, setSchedule] = useState({})
  const [expos, setExpos] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewMode, setViewMode] = useState('calendar') // 'calendar' or 'list'

  // Filters
  const [selectedExpo, setSelectedExpo] = useState(searchParams.get('expo') || '')
  const [selectedDate, setSelectedDate] = useState(searchParams.get('date') || '')
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()))

  const sessionTypes = [
    'conference', 'workshop', 'seminar', 'panel_discussion', 
    'keynote', 'networking', 'exhibition_tour', 'product_demo'
  ]

  const statusStyles = {
    draft: 'bg-gray-100 text-gray-800 border-gray-200',
    scheduled: 'bg-blue-100 text-blue-800 border-blue-200',
    ongoing: 'bg-green-100 text-green-800 border-green-200',
    completed: 'bg-purple-100 text-purple-800 border-purple-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200'
  }

  function getWeekStart(date) {
    const d = new Date(date)
    const day = d.getDay()
    const diff = d.getDate() - day
    return new Date(d.setDate(diff))
  }

  function getWeekDays(weekStart) {
    const days = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart)
      day.setDate(weekStart.getDate() + i)
      days.push(day)
    }
    return days
  }

  useEffect(() => {
    fetchExpos()
  }, [])

  useEffect(() => {
    fetchSchedule()
  }, [selectedExpo, selectedDate, currentWeekStart])

  const fetchExpos = async () => {
    try {
      const response = await api.get('/expos')
      setExpos(response.data.data.expos || [])
    } catch (error) {
      console.error('Error fetching expos:', error)
    }
  }

  const fetchSchedule = async () => {
    try {
      setLoading(true)
      
      if (!selectedExpo) {
        setSchedule({})
        setLoading(false)
        return
      }

      let url = `/sessions/expo/${selectedExpo}/schedule`
      const params = new URLSearchParams()

      if (viewMode === 'calendar') {
        // Fetch full week
        const weekStart = new Date(currentWeekStart)
        const weekEnd = new Date(currentWeekStart)
        weekEnd.setDate(weekEnd.getDate() + 6)
        
        params.append('startDate', weekStart.toISOString().split('T')[0])
        params.append('endDate', weekEnd.toISOString().split('T')[0])
      } else if (selectedDate) {
        params.append('startDate', selectedDate)
        params.append('endDate', selectedDate)
      }

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await api.get(url)
      setSchedule(response.data.data || {})
    } catch (error) {
      setError('Failed to fetch schedule')
      console.error('Error fetching schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterSessions = (sessions) => {
    if (!sessions) return []
    
    return sessions.filter(session => {
      const matchesSearch = !searchTerm || 
        session.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.speakers?.some(speaker => 
          speaker.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      
      const matchesType = !typeFilter || session.type === typeFilter
      
      return matchesSearch && matchesType
    })
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
  }

  const formatTime = (dateTime) => {
    return new Date(dateTime).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    })
  }

  const navigateWeek = (direction) => {
    const newWeekStart = new Date(currentWeekStart)
    newWeekStart.setDate(newWeekStart.getDate() + (direction * 7))
    setCurrentWeekStart(newWeekStart)
  }

  const goToToday = () => {
    setCurrentWeekStart(getWeekStart(new Date()))
  }

  const canManageSessions = user?.role === 'admin' || user?.role === 'organizer'
  const weekDays = getWeekDays(currentWeekStart)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Session Schedule</h1>
          <p className="mt-2 text-sm text-gray-700">
            View and manage session schedules across expos
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-md shadow-sm">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 text-sm font-medium border rounded-l-md ${
                viewMode === 'calendar'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <Calendar className="h-4 w-4 mr-2 inline" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 text-sm font-medium border-t border-r border-b rounded-r-md ${
                viewMode === 'list'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <List className="h-4 w-4 mr-2 inline" />
              List
            </button>
          </div>

          {canManageSessions && (
            <Link
              to="/sessions/create"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Session
            </Link>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Expo Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Expo *
            </label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={selectedExpo}
              onChange={(e) => {
                setSelectedExpo(e.target.value)
                updateFilters({ expo: e.target.value })
              }}
            >
              <option value="">Select an expo...</option>
              {expos.map((expo) => (
                <option key={expo._id} value={expo._id}>
                  {expo.title}
                </option>
              ))}
            </select>
          </div>

          {viewMode === 'list' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={selectedDate}
                onChange={(e) => {
                  setSelectedDate(e.target.value)
                  updateFilters({ date: e.target.value })
                }}
              />
            </div>
          )}

          {/* Type Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Type
            </label>
            <select
              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Types</option>
              {sessionTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Content */}
      {!selectedExpo ? (
        <div className="bg-white shadow rounded-lg p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Select an Expo</h3>
          <p className="text-gray-500">
            Choose an expo from the filter above to view its session schedule.
          </p>
        </div>
      ) : loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      ) : viewMode === 'calendar' ? (
        /* Calendar View */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Calendar Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateWeek(-1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h2 className="text-lg font-medium text-gray-900">
                {formatDate(weekDays[0])} - {formatDate(weekDays[6])}
              </h2>
              
              <button
                onClick={() => navigateWeek(1)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
              
              <button
                onClick={goToToday}
                className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-md hover:bg-blue-100"
              >
                Today
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {/* Day Headers */}
            {weekDays.map((day, index) => (
              <div key={index} className="px-4 py-3 border-b border-r border-gray-200 bg-gray-50">
                <div className="text-center">
                  <div className="text-sm font-medium text-gray-900">
                    {day.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className={`text-xl ${
                    day.toDateString() === new Date().toDateString()
                      ? 'text-blue-600 font-bold'
                      : 'text-gray-700'
                  }`}>
                    {day.getDate()}
                  </div>
                </div>
              </div>
            ))}

            {/* Day Cells */}
            {weekDays.map((day, index) => {
              const dateKey = day.toISOString().split('T')[0]
              const daySessions = filterSessions(schedule[dateKey] || [])

              return (
                <div key={index} className="min-h-[200px] border-r border-b border-gray-200 p-2">
                  <div className="space-y-1">
                    {daySessions.map((session, sessionIndex) => (
                      <div
                        key={sessionIndex}
                        className={`p-2 rounded text-xs border cursor-pointer hover:opacity-80 ${statusStyles[session.status]}`}
                        onClick={() => window.open(`/sessions/${session._id}`, '_blank')}
                      >
                        <div className="font-medium truncate" title={session.title}>
                          {session.title}
                        </div>
                        <div className="flex items-center mt-1">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatTime(session.startTime)}
                        </div>
                        {session.location && (
                          <div className="flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            <span className="truncate" title={session.location}>
                              {session.location}
                            </span>
                          </div>
                        )}
                        {session.speakers && session.speakers.length > 0 && (
                          <div className="flex items-center mt-1">
                            <User className="h-3 w-3 mr-1" />
                            <span className="truncate">
                              {session.speakers[0].name}
                              {session.speakers.length > 1 && ` +${session.speakers.length - 1}`}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {daySessions.length === 0 && (
                      <div className="text-gray-400 text-center py-8 text-xs">
                        No sessions
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {Object.keys(schedule).length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No sessions found</h3>
              <p className="text-gray-500">
                {selectedDate ? 'No sessions scheduled for the selected date.' : 'No sessions found for the selected expo.'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Object.entries(schedule)
                .sort(([a], [b]) => new Date(a) - new Date(b))
                .map(([date, sessions]) => {
                  const filteredSessions = filterSessions(sessions)
                  
                  if (filteredSessions.length === 0) return null

                  return (
                    <div key={date} className="p-6">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {new Date(date).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredSessions
                          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                          .map((session) => (
                            <div
                              key={session._id}
                              className={`p-4 rounded-lg border cursor-pointer hover:shadow-md transition-shadow ${statusStyles[session.status]}`}
                              onClick={() => window.open(`/sessions/${session._id}`, '_blank')}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-medium text-sm truncate flex-1 mr-2">
                                  {session.title}
                                </h4>
                                <span className="text-xs px-2 py-1 bg-white rounded">
                                  {session.type.replace('_', ' ')}
                                </span>
                              </div>
                              
                              <div className="space-y-1 text-xs">
                                <div className="flex items-center">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatTime(session.startTime)} - {formatTime(session.endTime)}
                                </div>
                                
                                {session.location && (
                                  <div className="flex items-center">
                                    <MapPin className="h-3 w-3 mr-1" />
                                    <span className="truncate">{session.location}</span>
                                  </div>
                                )}
                                
                                {session.speakers && session.speakers.length > 0 && (
                                  <div className="flex items-center">
                                    <User className="h-3 w-3 mr-1" />
                                    <span className="truncate">
                                      {session.speakers[0].name}
                                      {session.speakers.length > 1 && ` +${session.speakers.length - 1}`}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {session.topics && session.topics.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {session.topics.slice(0, 2).map((topic, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-1 rounded text-xs bg-white">
                                      <Tag className="h-3 w-3 mr-1" />
                                      {topic}
                                    </span>
                                  ))}
                                  {session.topics.length > 2 && (
                                    <span className="text-xs text-gray-600">
                                      +{session.topics.length - 2}
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="mt-3 flex justify-between items-center">
                                <Link
                                  to={`/sessions/${session._id}`}
                                  className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <Eye className="h-3 w-3 mr-1" />
                                  View Details
                                </Link>
                                
                                {canManageSessions && (
                                  <Link
                                    to={`/sessions/${session._id}/edit`}
                                    className="text-xs text-gray-600 hover:text-gray-800 flex items-center"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Edit className="h-3 w-3 mr-1" />
                                    Edit
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
