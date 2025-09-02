import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Calendar,
  Clock,
  MapPin,
  Users,
  User,
  Edit,
  Trash2,
  ArrowLeft,
  Tag,
  Download,
  ExternalLink,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Building,
  Presentation,
  FileText,
  Video,
  Image,
  BookOpen,
  UserCheck,
  UserPlus,
  Settings
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import api from '../utils/api'

export default function SessionDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [session, setSession] = useState(null)
  const [registrations, setRegistrations] = useState([])
  const [isRegistered, setIsRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [registrationLoading, setRegistrationLoading] = useState(false)

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

  const materialIcons = {
    presentation: Presentation,
    handout: FileText,
    resource: BookOpen,
    recording: Video
  }

  useEffect(() => {
    fetchSessionDetails()
  }, [id])

  const fetchSessionDetails = async () => {
    try {
      setLoading(true)
      const [sessionResponse, registrationsResponse] = await Promise.all([
        api.get(`/sessions/${id}`),
        api.get(`/registrations/session/${id}`)
      ])

      setSession(sessionResponse.data.data)
      setRegistrations(registrationsResponse.data.data.registrations || [])
      setIsRegistered(sessionResponse.data.data.isRegistered || false)
    } catch (error) {
      setError('Failed to fetch session details')
      console.error('Error fetching session details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async () => {
    try {
      setRegistrationLoading(true)
      await api.post('/registrations/session', {
        session: id
      })
      setIsRegistered(true)
      fetchSessionDetails() // Refresh to get updated registration count
    } catch (error) {
      setError('Failed to register for session')
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleUnregister = async () => {
    try {
      setRegistrationLoading(true)
      // Find user's registration
      const userRegistration = registrations.find(reg => reg.user._id === user._id)
      if (userRegistration) {
        await api.delete(`/registrations/${userRegistration._id}`)
        setIsRegistered(false)
        fetchSessionDetails()
      }
    } catch (error) {
      setError('Failed to unregister from session')
    } finally {
      setRegistrationLoading(false)
    }
  }

  const handleDeleteSession = async () => {
    if (!window.confirm('Are you sure you want to delete this session?')) return

    try {
      await api.delete(`/sessions/${id}`)
      navigate('/sessions')
    } catch (error) {
      setError('Failed to delete session')
    }
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await api.patch(`/sessions/${id}/status`, { status: newStatus })
      setSession({ ...session, status: newStatus })
    } catch (error) {
      setError('Failed to update session status')
    }
  }

  const formatDateTime = (dateTime) => {
    return new Date(dateTime).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatDuration = (startTime, endTime) => {
    const duration = new Date(endTime) - new Date(startTime)
    const minutes = Math.round(duration / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`
    }
    return `${minutes}m`
  }

  const canManageSession = user?.role === 'admin' || user?.role === 'organizer' || 
    (session && session.expo && session.expo.organizer === user?._id)

  const canRegister = user && !isRegistered && session?.status === 'scheduled' && 
    (!session.maxAttendees || registrations.length < session.maxAttendees)

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="text-center py-12">
        <h3 className="mt-2 text-sm font-medium text-gray-900">Session not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The session you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/sessions"
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Sessions
          </Link>
        </div>
      </div>
    )
  }

  const StatusIcon = statusIcons[session.status] || Calendar

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/sessions"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Sessions
          </Link>
        </div>

        {canManageSession && (
          <div className="flex space-x-3">
            <Link
              to={`/sessions/${id}/edit`}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit Session
            </Link>
            <button
              onClick={handleDeleteSession}
              className="inline-flex items-center px-3 py-2 border border-red-300 shadow-sm text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Session Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {session.title}
                </h1>
                <div className="flex items-center gap-3 mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[session.status]}`}>
                    <StatusIcon className="h-4 w-4 mr-1" />
                    {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    {session.type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </span>
                  {session.category && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      {session.category}
                    </span>
                  )}
                </div>
              </div>

              {canManageSession && (
                <div className="ml-4">
                  <select
                    value={session.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="block w-full text-sm border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="scheduled">Scheduled</option>
                    <option value="ongoing">Ongoing</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>

            {/* Schedule & Location */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Start Time</div>
                  <div>{formatDateTime(session.startTime)}</div>
                </div>
              </div>
              
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Duration</div>
                  <div>{formatDuration(session.startTime, session.endTime)}</div>
                </div>
              </div>

              {session.location && (
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <div className="font-medium">Location</div>
                    <div>{session.location}</div>
                  </div>
                </div>
              )}

              <div className="flex items-center text-sm text-gray-600">
                <Users className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <div className="font-medium">Capacity</div>
                  <div>
                    {registrations.length}
                    {session.maxAttendees ? ` / ${session.maxAttendees}` : ''} attendees
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {session.description && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                <div className="prose prose-sm max-w-none text-gray-600">
                  {session.description.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-3">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Speakers */}
          {session.speakers && session.speakers.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Speakers ({session.speakers.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {session.speakers.map((speaker, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    {speaker.image ? (
                      <img
                        src={speaker.image}
                        alt={speaker.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">
                        {speaker.name}
                        {speaker.title && (
                          <span className="text-gray-500 font-normal">
                            , {speaker.title}
                          </span>
                        )}
                      </h4>
                      {speaker.company && (
                        <p className="text-sm text-gray-600 flex items-center mt-1">
                          <Building className="h-4 w-4 mr-1" />
                          {speaker.company}
                        </p>
                      )}
                      {speaker.bio && (
                        <p className="text-sm text-gray-600 mt-2">
                          {speaker.bio}
                        </p>
                      )}
                      {speaker.linkedinProfile && (
                        <a
                          href={speaker.linkedinProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center mt-2"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          LinkedIn Profile
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Materials */}
          {session.materials && session.materials.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Session Materials ({session.materials.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {session.materials.map((material, index) => {
                  const MaterialIcon = materialIcons[material.type] || FileText
                  
                  return (
                    <div key={index} className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                      <MaterialIcon className="h-8 w-8 text-blue-500 mr-3" />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {material.name}
                        </h4>
                        <p className="text-sm text-gray-500 capitalize">
                          {material.type.replace('_', ' ')}
                        </p>
                      </div>
                      {material.url && (
                        <a
                          href={material.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Topics/Tags */}
          {session.topics && session.topics.length > 0 && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Topics</h3>
              <div className="flex flex-wrap gap-2">
                {session.topics.map((topic, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                    <Tag className="h-4 w-4 mr-1" />
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Registration */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Registration</h3>
            
            {user ? (
              <div className="space-y-4">
                {isRegistered ? (
                  <div className="text-center">
                    <div className="text-green-600 mb-2">
                      <UserCheck className="h-8 w-8 mx-auto" />
                    </div>
                    <p className="text-sm font-medium text-green-800 mb-3">
                      You're registered for this session
                    </p>
                    <button
                      onClick={handleUnregister}
                      disabled={registrationLoading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                    >
                      {registrationLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-600 mr-2"></div>
                      ) : (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      Unregister
                    </button>
                  </div>
                ) : canRegister ? (
                  <div className="text-center">
                    <button
                      onClick={handleRegister}
                      disabled={registrationLoading}
                      className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      {registrationLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <UserPlus className="h-4 w-4 mr-2" />
                      )}
                      Register for Session
                    </button>
                    {session.registrationFee > 0 && (
                      <p className="text-sm text-gray-500 mt-2">
                        Registration fee: ${session.registrationFee}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500">
                    <p className="text-sm">
                      {session.status !== 'scheduled' ? 'Registration not available' : 
                       session.maxAttendees && registrations.length >= session.maxAttendees ? 'Session is full' :
                       'Registration closed'}
                    </p>
                  </div>
                )}

                {/* Capacity indicator */}
                {session.maxAttendees && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Capacity</span>
                      <span>{registrations.length} / {session.maxAttendees}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${(registrations.length / session.maxAttendees) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Please log in to register for this session
                </p>
                <Link
                  to="/login"
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>

          {/* Expo Info */}
          {session.expo && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Expo Details</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    {session.expo.title}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {new Date(session.expo.startDate).toLocaleDateString()} - {' '}
                    {new Date(session.expo.endDate).toLocaleDateString()}
                  </p>
                </div>
                <Link
                  to={`/expos/${session.expo._id}`}
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  View Expo Details
                </Link>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {canManageSession && (
            <div className="bg-white shadow rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to={`/sessions/${id}/registrations`}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <Users className="h-4 w-4 mr-2" />
                  View Registrations ({registrations.length})
                </Link>
                <Link
                  to={`/sessions/${id}/edit`}
                  className="flex items-center text-sm text-gray-700 hover:text-gray-900"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Session
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
