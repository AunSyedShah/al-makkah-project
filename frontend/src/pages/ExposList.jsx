import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Calendar, 
  MapPin, 
  Users, 
  Filter,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal
} from 'lucide-react'
import api from '../utils/api'

export default function ExposList() {
  const [expos, setExpos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    fetchExpos()
  }, [])

  const fetchExpos = async () => {
    try {
      const response = await api.get('/expo')
      setExpos(response.data.expos || [])
    } catch (error) {
      console.error('Error fetching expos:', error)
      // Mock data for development
      setExpos([
        {
          _id: '1',
          name: 'Saudi Tech Summit 2025',
          description: 'The largest technology expo in the Middle East',
          startDate: '2025-09-15',
          endDate: '2025-09-17',
          venue: 'Riyadh International Convention Center',
          status: 'active',
          maxExhibitors: 200,
          currentExhibitors: 145,
          registrationDeadline: '2025-08-15'
        },
        {
          _id: '2',
          name: 'Healthcare Innovation Expo',
          description: 'Showcasing the future of healthcare technology',
          startDate: '2025-10-20',
          endDate: '2025-10-22',
          venue: 'Jeddah Convention Center',
          status: 'planning',
          maxExhibitors: 150,
          currentExhibitors: 89,
          registrationDeadline: '2025-09-20'
        },
        {
          _id: '3',
          name: 'Green Energy Expo',
          description: 'Renewable energy and sustainability solutions',
          startDate: '2025-11-12',
          endDate: '2025-11-14',
          venue: 'KAUST Convention Center',
          status: 'planning',
          maxExhibitors: 120,
          currentExhibitors: 67,
          registrationDeadline: '2025-10-12'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const filteredExpos = expos.filter(expo => {
    const matchesSearch = expo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         expo.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || expo.status === filterStatus
    return matchesSearch && matchesStatus
  })

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

  const handleDeleteExpo = async (expoId) => {
    if (window.confirm('Are you sure you want to delete this expo?')) {
      try {
        await axios.delete(`/api/expo/${expoId}`)
        await fetchExpos()
      } catch (error) {
        console.error('Error deleting expo:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Expos Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage all expo events, exhibitors, and bookings
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Expo
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search expos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="block w-full pl-10 pr-8 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="planning">Planning</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="text-sm text-gray-500 flex items-center">
            {filteredExpos.length} expo{filteredExpos.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Expos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpos.map((expo) => (
          <div key={expo._id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(expo.status)}`}>
                  {expo.status}
                </span>
                <div className="flex items-center space-x-2">
                  <Link
                    to={`/expos/${expo._id}`}
                    className="text-gray-400 hover:text-blue-600"
                  >
                    <Eye className="h-4 w-4" />
                  </Link>
                  <button className="text-gray-400 hover:text-green-600">
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteExpo(expo._id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-medium text-gray-900 mb-2">{expo.name}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{expo.description}</p>

              <div className="space-y-2">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-2" />
                  {new Date(expo.startDate).toLocaleDateString()} - {new Date(expo.endDate).toLocaleDateString()}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-2" />
                  {expo.venue}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <Users className="h-4 w-4 mr-2" />
                  {expo.currentExhibitors || 0} / {expo.maxExhibitors} exhibitors
                </div>
              </div>

              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${((expo.currentExhibitors || 0) / expo.maxExhibitors) * 100}%`
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {Math.round(((expo.currentExhibitors || 0) / expo.maxExhibitors) * 100)}% capacity
                </p>
              </div>
            </div>

            <div className="bg-gray-50 px-6 py-4">
              <Link
                to={`/expos/${expo._id}`}
                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View Details
              </Link>
            </div>
          </div>
        ))}
      </div>

      {filteredExpos.length === 0 && (
        <div className="text-center py-12">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No expos found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating your first expo.
          </p>
          <div className="mt-6">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Expo
            </button>
          </div>
        </div>
      )}

      {/* Create Expo Modal will be added in next iteration */}
    </div>
  )
}
