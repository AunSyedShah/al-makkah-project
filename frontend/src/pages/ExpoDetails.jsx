import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Edit,
  Building2,
  Phone,
  Mail,
  Globe,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import api from '../utils/api'

export default function ExpoDetails() {
  const { id } = useParams()
  const [expo, setExpo] = useState(null)
  const [exhibitors, setExhibitors] = useState([])
  const [booths, setBooths] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchExpoDetails()
  }, [id])

  const fetchExpoDetails = async () => {
    try {
      const [expoResponse, exhibitorsResponse, boothsResponse] = await Promise.all([
        axios.get(`/api/expo/${id}`),
        axios.get(`/api/exhibitor?expoId=${id}`),
        axios.get(`/api/booth?expoId=${id}`)
      ])
      
      setExpo(expoResponse.data.expo)
      setExhibitors(exhibitorsResponse.data.exhibitors || [])
      setBooths(boothsResponse.data.booths || [])
    } catch (error) {
      console.error('Error fetching expo details:', error)
      // Mock data for development
      setExpo({
        _id: id,
        name: 'Saudi Tech Summit 2025',
        description: 'The largest technology expo in the Middle East, featuring cutting-edge innovations, startup showcases, and networking opportunities.',
        startDate: '2025-09-15',
        endDate: '2025-09-17',
        venue: 'Riyadh International Convention Center',
        address: 'King Khalid International Airport Road, Riyadh 13455, Saudi Arabia',
        status: 'active',
        maxExhibitors: 200,
        currentExhibitors: 145,
        registrationDeadline: '2025-08-15',
        contactEmail: 'info@sauditechsummit.com',
        contactPhone: '+966 11 234 5678',
        website: 'https://sauditechsummit.com',
        categories: ['Technology', 'Innovation', 'Startups', 'AI', 'Blockchain'],
        requirements: [
          'Valid business registration',
          'Company profile and portfolio',
          'Product demonstration capability',
          'Insurance coverage'
        ]
      })
      
      setExhibitors([
        {
          _id: '1',
          companyName: 'Saudi Telecom Company',
          contactPerson: 'Ahmed Al-Rashid',
          email: 'ahmed@stc.com.sa',
          phone: '+966 50 123 4567',
          category: 'Telecommunications',
          boothNumber: 'A-15'
        },
        {
          _id: '2',
          companyName: 'NEOM Tech',
          contactPerson: 'Sara Al-Mahmoud',
          email: 'sara@neom.com',
          phone: '+966 50 234 5678',
          category: 'Smart Cities',
          boothNumber: 'B-22'
        }
      ])
      
      setBooths([
        { _id: '1', number: 'A-15', size: 'large', status: 'occupied', exhibitor: 'Saudi Telecom Company' },
        { _id: '2', number: 'B-22', size: 'standard', status: 'occupied', exhibitor: 'NEOM Tech' },
        { _id: '3', number: 'C-08', size: 'premium', status: 'available', exhibitor: null },
        { _id: '4', number: 'D-12', size: 'standard', status: 'reserved', exhibitor: 'Pending Confirmation' }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'planning':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getBoothStatusColor = (status) => {
    switch (status) {
      case 'occupied':
        return 'bg-red-100 text-red-800'
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!expo) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Expo not found</h3>
        <Link
          to="/expos"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Expos
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', name: 'Overview' },
    { id: 'exhibitors', name: `Exhibitors (${exhibitors.length})` },
    { id: 'booths', name: `Booths (${booths.length})` },
    { id: 'analytics', name: 'Analytics' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/expos"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Expos
          </Link>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Edit className="h-4 w-4 mr-2" />
          Edit Expo
        </button>
      </div>

      {/* Expo Info Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{expo.name}</h1>
            <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(expo.status)}`}>
              {expo.status}
            </span>
          </div>
          
          <p className="text-gray-600 mb-6">{expo.description}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="font-medium">Event Dates</p>
                <p>{new Date(expo.startDate).toLocaleDateString()} - {new Date(expo.endDate).toLocaleDateString()}</p>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="font-medium">Venue</p>
                <p>{expo.venue}</p>
              </div>
            </div>
            
            <div className="flex items-center text-sm text-gray-600">
              <Users className="h-5 w-5 mr-3 text-gray-400" />
              <div>
                <p className="font-medium">Capacity</p>
                <p>{expo.currentExhibitors || 0} / {expo.maxExhibitors} exhibitors</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white shadow rounded-lg">
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Event Details</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration Deadline</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(expo.registrationDeadline).toLocaleDateString()}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Email</dt>
                    <dd className="mt-1 text-sm text-gray-900">{expo.contactEmail}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{expo.contactPhone}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Website</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      <a href={expo.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                        {expo.website}
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Categories</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {expo.categories?.map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {category}
                    </span>
                  ))}
                </div>
                
                <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
                <ul className="space-y-2">
                  {expo.requirements?.map((requirement, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{requirement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'exhibitors' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exhibitors.map((exhibitor) => (
                <div key={exhibitor._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-gray-900">{exhibitor.companyName}</h4>
                      <p className="text-sm text-gray-600">{exhibitor.contactPerson}</p>
                      <p className="text-xs text-gray-500">{exhibitor.category}</p>
                    </div>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {exhibitor.boothNumber}
                    </span>
                  </div>
                  <div className="mt-4 flex items-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {exhibitor.email}
                    </div>
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {exhibitor.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'booths' && (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {booths.map((booth) => (
                <div key={booth._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-lg font-medium text-gray-900">{booth.number}</h4>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getBoothStatusColor(booth.status)}`}>
                      {booth.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Size: {booth.size}</p>
                  {booth.exhibitor && (
                    <p className="text-sm text-gray-900 font-medium">{booth.exhibitor}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-blue-900">Total Exhibitors</p>
                    <p className="text-2xl font-bold text-blue-600">{exhibitors.length}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-green-900">Occupied Booths</p>
                    <p className="text-2xl font-bold text-green-600">
                      {booths.filter(b => b.status === 'occupied').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Clock className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-yellow-900">Reserved Booths</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {booths.filter(b => b.status === 'reserved').length}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-purple-900">Available Booths</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {booths.filter(b => b.status === 'available').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
