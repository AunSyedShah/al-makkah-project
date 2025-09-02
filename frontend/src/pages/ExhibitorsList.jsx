import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { 
  Plus, 
  Search, 
  Filter,
  Mail,
  Phone,
  Building2,
  MapPin,
  Eye,
  Edit,
  Trash2,
  Users
} from 'lucide-react'
import api from '../utils/api'

export default function ExhibitorsList() {
  const [exhibitors, setExhibitors] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('all')
  const [filterExpo, setFilterExpo] = useState('all')

  useEffect(() => {
    fetchExhibitors()
  }, [])

  const fetchExhibitors = async () => {
    try {
      const response = await api.get('/exhibitor')
      setExhibitors(response.data.exhibitors || [])
    } catch (error) {
      console.error('Error fetching exhibitors:', error)
      // Mock data for development
      setExhibitors([
        {
          _id: '1',
          companyName: 'Saudi Telecom Company',
          contactPerson: 'Ahmed Al-Rashid',
          email: 'ahmed@stc.com.sa',
          phone: '+966 50 123 4567',
          address: 'King Fahad Road, Riyadh, Saudi Arabia',
          category: 'Telecommunications',
          description: 'Leading telecommunications company in Saudi Arabia',
          website: 'https://stc.com.sa',
          logo: '/api/placeholder/100/100',
          expos: ['Saudi Tech Summit 2025'],
          booths: ['A-15'],
          status: 'active'
        },
        {
          _id: '2',
          companyName: 'NEOM Tech',
          contactPerson: 'Sara Al-Mahmoud',
          email: 'sara@neom.com',
          phone: '+966 50 234 5678',
          address: 'NEOM, Tabuk Province, Saudi Arabia',
          category: 'Smart Cities',
          description: 'Building the future mega-city with cutting-edge technology',
          website: 'https://neom.com',
          logo: '/api/placeholder/100/100',
          expos: ['Saudi Tech Summit 2025', 'Green Energy Expo'],
          booths: ['B-22', 'C-08'],
          status: 'active'
        },
        {
          _id: '3',
          companyName: 'Al-Rajhi Bank',
          contactPerson: 'Mohammed Al-Otaibi',
          email: 'mohammed@alrajhibank.com.sa',
          phone: '+966 50 345 6789',
          address: 'King Abdulaziz Road, Riyadh, Saudi Arabia',
          category: 'Financial Services',
          description: 'One of the largest Islamic banks in the world',
          website: 'https://alrajhibank.com.sa',
          logo: '/api/placeholder/100/100',
          expos: ['Healthcare Innovation Expo'],
          booths: ['D-12'],
          status: 'pending'
        },
        {
          _id: '4',
          companyName: 'Saudi Aramco Digital',
          contactPerson: 'Fatima Al-Zahra',
          email: 'fatima@aramco.com',
          phone: '+966 50 456 7890',
          address: 'Dhahran, Eastern Province, Saudi Arabia',
          category: 'Energy & Technology',
          description: 'Digital transformation arm of Saudi Aramco',
          website: 'https://aramco.com',
          logo: '/api/placeholder/100/100',
          expos: ['Green Energy Expo'],
          booths: ['E-05'],
          status: 'active'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const categories = ['all', 'Technology', 'Telecommunications', 'Smart Cities', 'Financial Services', 'Energy & Technology', 'Healthcare', 'Manufacturing']
  const expos = ['all', 'Saudi Tech Summit 2025', 'Healthcare Innovation Expo', 'Green Energy Expo']

  const filteredExhibitors = exhibitors.filter(exhibitor => {
    const matchesSearch = 
      exhibitor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exhibitor.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = filterCategory === 'all' || exhibitor.category === filterCategory
    const matchesExpo = filterExpo === 'all' || exhibitor.expos.includes(filterExpo)
    
    return matchesSearch && matchesCategory && matchesExpo
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDeleteExhibitor = async (exhibitorId) => {
    if (window.confirm('Are you sure you want to delete this exhibitor?')) {
      try {
        await axios.delete(`/api/exhibitor/${exhibitorId}`)
        await fetchExhibitors()
      } catch (error) {
        console.error('Error deleting exhibitor:', error)
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
          <h1 className="text-2xl font-semibold text-gray-900">Exhibitors Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage exhibitor registrations, profiles, and applications
          </p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Plus className="h-4 w-4 mr-2" />
          Add Exhibitor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Search exhibitors..."
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
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>
          
          <div className="relative">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterExpo}
              onChange={(e) => setFilterExpo(e.target.value)}
            >
              {expos.map(expo => (
                <option key={expo} value={expo}>
                  {expo === 'all' ? 'All Expos' : expo}
                </option>
              ))}
            </select>
          </div>
          
          <div className="text-sm text-gray-500 flex items-center">
            {filteredExhibitors.length} exhibitor{filteredExhibitors.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Exhibitors List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expos
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
              {filteredExhibitors.map((exhibitor) => (
                <tr key={exhibitor._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-gray-400" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {exhibitor.companyName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Booths: {exhibitor.booths.join(', ')}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{exhibitor.contactPerson}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Mail className="h-3 w-3 mr-1" />
                      {exhibitor.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {exhibitor.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {exhibitor.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {exhibitor.expos.length} expo{exhibitor.expos.length !== 1 ? 's' : ''}
                    </div>
                    <div className="text-sm text-gray-500">
                      {exhibitor.expos.slice(0, 2).join(', ')}
                      {exhibitor.expos.length > 2 && '...'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(exhibitor.status)}`}>
                      {exhibitor.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/exhibitors/${exhibitor._id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <button className="text-green-600 hover:text-green-900">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteExhibitor(exhibitor._id)}
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

      {filteredExhibitors.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No exhibitors found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by adding your first exhibitor.
          </p>
          <div className="mt-6">
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
              <Plus className="h-4 w-4 mr-2" />
              Add Exhibitor
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
