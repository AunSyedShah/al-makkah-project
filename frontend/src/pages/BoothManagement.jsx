import { useState, useEffect } from 'react'
import { 
  Plus, 
  Search, 
  Filter,
  Building2,
  Users,
  Edit,
  Trash2,
  MapPin,
  Maximize,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import api from '../utils/api'

export default function BoothManagement() {
  const [booths, setBooths] = useState([])
  const [expos, setExpos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterExpo, setFilterExpo] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'table'

  useEffect(() => {
    fetchBooths()
    fetchExpos()
  }, [])

  const fetchBooths = async () => {
    try {
      const response = await api.get('/booth')
      setBooths(response.data.booths || [])
    } catch (error) {
      console.error('Error fetching booths:', error)
      // Mock data for development
      setBooths([
        {
          _id: '1',
          number: 'A-15',
          size: 'large',
          area: '6x6m',
          location: 'Hall A, Section 1',
          status: 'occupied',
          exhibitor: {
            _id: 'ex1',
            companyName: 'Saudi Telecom Company',
            contactPerson: 'Ahmed Al-Rashid'
          },
          expo: {
            _id: 'exp1',
            name: 'Saudi Tech Summit 2025'
          },
          price: 15000,
          amenities: ['Power', 'Internet', 'Audio/Visual'],
          assignedDate: '2025-08-20'
        },
        {
          _id: '2',
          number: 'B-22',
          size: 'standard',
          area: '3x3m',
          location: 'Hall B, Section 2',
          status: 'occupied',
          exhibitor: {
            _id: 'ex2',
            companyName: 'NEOM Tech',
            contactPerson: 'Sara Al-Mahmoud'
          },
          expo: {
            _id: 'exp1',
            name: 'Saudi Tech Summit 2025'
          },
          price: 8000,
          amenities: ['Power', 'Internet'],
          assignedDate: '2025-08-22'
        },
        {
          _id: '3',
          number: 'C-08',
          size: 'premium',
          area: '9x6m',
          location: 'Hall C, Section 1',
          status: 'available',
          exhibitor: null,
          expo: {
            _id: 'exp1',
            name: 'Saudi Tech Summit 2025'
          },
          price: 25000,
          amenities: ['Power', 'Internet', 'Audio/Visual', 'Storage'],
          assignedDate: null
        },
        {
          _id: '4',
          number: 'D-12',
          size: 'standard',
          area: '3x3m',
          location: 'Hall D, Section 1',
          status: 'reserved',
          exhibitor: {
            _id: 'ex3',
            companyName: 'Al-Rajhi Bank',
            contactPerson: 'Mohammed Al-Otaibi'
          },
          expo: {
            _id: 'exp2',
            name: 'Healthcare Innovation Expo'
          },
          price: 8000,
          amenities: ['Power', 'Internet'],
          assignedDate: '2025-08-25'
        },
        {
          _id: '5',
          number: 'E-05',
          size: 'large',
          area: '6x6m',
          location: 'Hall E, Section 1',
          status: 'occupied',
          exhibitor: {
            _id: 'ex4',
            companyName: 'Saudi Aramco Digital',
            contactPerson: 'Fatima Al-Zahra'
          },
          expo: {
            _id: 'exp3',
            name: 'Green Energy Expo'
          },
          price: 15000,
          amenities: ['Power', 'Internet', 'Audio/Visual'],
          assignedDate: '2025-08-18'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchExpos = async () => {
    try {
      const response = await api.get('/expo')
      setExpos(response.data.expos || [])
    } catch (error) {
      console.error('Error fetching expos:', error)
      // Mock data
      setExpos([
        { _id: 'exp1', name: 'Saudi Tech Summit 2025' },
        { _id: 'exp2', name: 'Healthcare Innovation Expo' },
        { _id: 'exp3', name: 'Green Energy Expo' }
      ])
    }
  }

  const filteredBooths = booths.filter(booth => {
    const matchesSearch = 
      booth.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booth.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booth.exhibitor && booth.exhibitor.companyName.toLowerCase().includes(searchTerm.toLowerCase()))
    
    const matchesExpo = filterExpo === 'all' || booth.expo._id === filterExpo
    const matchesStatus = filterStatus === 'all' || booth.status === filterStatus
    
    return matchesSearch && matchesExpo && matchesStatus
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'occupied':
        return 'bg-red-100 text-red-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      case 'maintenance':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'available':
        return CheckCircle
      case 'occupied':
        return Users
      case 'reserved':
        return Clock
      case 'maintenance':
        return AlertCircle
      default:
        return AlertCircle
    }
  }

  const getSizeColor = (size) => {
    switch (size) {
      case 'standard':
        return 'bg-blue-100 text-blue-800'
      case 'large':
        return 'bg-purple-100 text-purple-800'
      case 'premium':
        return 'bg-gold-100 text-gold-800 bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteBooth = async (boothId) => {
    if (window.confirm('Are you sure you want to delete this booth?')) {
      try {
        await axios.delete(`/api/booth/${boothId}`)
        await fetchBooths()
      } catch (error) {
        console.error('Error deleting booth:', error)
      }
    }
  }

  const handleStatusChange = async (boothId, newStatus) => {
    try {
      await axios.put(`/api/booth/${boothId}`, { status: newStatus })
      await fetchBooths()
    } catch (error) {
      console.error('Error updating booth status:', error)
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
          <h1 className="text-2xl font-semibold text-gray-900">Booth Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage exhibition booths, assignments, and availability
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Booth
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Booths</dt>
                  <dd className="text-lg font-medium text-gray-900">{booths.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Available</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {booths.filter(b => b.status === 'available').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Occupied</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {booths.filter(b => b.status === 'occupied').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Reserved</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {booths.filter(b => b.status === 'reserved').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search booths..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterExpo}
              onChange={(e) => setFilterExpo(e.target.value)}
            >
              <option value="all">All Expos</option>
              {expos.map(expo => (
                <option key={expo._id} value={expo._id}>{expo.name}</option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="occupied">Occupied</option>
              <option value="reserved">Reserved</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Building2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded ${viewMode === 'table' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
            >
              <Filter className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center">
            {filteredBooths.length} booth{filteredBooths.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Booths Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredBooths.map((booth) => {
            const StatusIcon = getStatusIcon(booth.status)
            return (
              <div key={booth._id} className="bg-white overflow-hidden shadow rounded-lg border-2 border-gray-200 hover:border-blue-300 transition-colors">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Building2 className="h-8 w-8 text-gray-600" />
                      <h3 className="text-lg font-semibold text-gray-900">{booth.number}</h3>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booth.status)}`}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {booth.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Size:</span>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(booth.size)}`}>
                        {booth.size}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Area:</span>
                      <span className="text-sm text-gray-900">{booth.area}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Price:</span>
                      <span className="text-sm text-gray-900">SAR {booth.price.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 mb-3">
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {booth.location}
                    </div>
                    <div className="mt-1">
                      Expo: {booth.expo.name}
                    </div>
                  </div>
                  
                  {booth.exhibitor && (
                    <div className="bg-gray-50 rounded p-2 mb-3">
                      <p className="text-xs font-medium text-gray-900">{booth.exhibitor.companyName}</p>
                      <p className="text-xs text-gray-600">{booth.exhibitor.contactPerson}</p>
                    </div>
                  )}
                  
                  <div className="flex flex-wrap gap-1 mb-3">
                    {booth.amenities.map((amenity, index) => (
                      <span key={index} className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        {amenity}
                      </span>
                    ))}
                  </div>
                  
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteBooth(booth._id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <select
                      className="text-xs border border-gray-300 rounded px-2 py-1"
                      value={booth.status}
                      onChange={(e) => handleStatusChange(booth._id, e.target.value)}
                    >
                      <option value="available">Available</option>
                      <option value="occupied">Occupied</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Booth
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Size & Price
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Exhibitor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Expo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBooths.map((booth) => (
                  <tr key={booth._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Building2 className="h-6 w-6 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booth.number}</div>
                          <div className="text-sm text-gray-500">{booth.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booth.area}</div>
                      <div className="text-sm text-gray-500">SAR {booth.price.toLocaleString()}</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getSizeColor(booth.size)}`}>
                        {booth.size}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {booth.exhibitor ? (
                        <div>
                          <div className="text-sm font-medium text-gray-900">{booth.exhibitor.companyName}</div>
                          <div className="text-sm text-gray-500">{booth.exhibitor.contactPerson}</div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Not assigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booth.expo.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booth.status)}`}>
                        {booth.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteBooth(booth._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredBooths.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Building2 className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No booths found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first booth.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              Add Booth
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
