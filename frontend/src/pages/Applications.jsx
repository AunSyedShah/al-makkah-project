import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Calendar,
  User
} from 'lucide-react'
import api from '../utils/api'

export default function Applications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterExpo, setFilterExpo] = useState('all')
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchApplications()
  }, [])

  const fetchApplications = async () => {
    try {
      const response = await api.get('/application')
      setApplications(response.data.applications || [])
    } catch (error) {
      console.error('Error fetching applications:', error)
      // Mock data for development
      setApplications([
        {
          _id: '1',
          exhibitor: {
            _id: 'ex1',
            companyName: 'Saudi Telecom Company',
            contactPerson: 'Ahmed Al-Rashid',
            email: 'ahmed@stc.com.sa',
            phone: '+966 50 123 4567'
          },
          expo: {
            _id: 'exp1',
            name: 'Saudi Tech Summit 2025',
            startDate: '2025-09-15'
          },
          submissionDate: '2025-08-15',
          status: 'approved',
          boothPreference: 'large',
          boothSize: '6x6m',
          requirements: 'Power, internet, audio/visual equipment, storage space',
          budget: 15000,
          products: ['5G Infrastructure', 'IoT Solutions', 'Cloud Services'],
          expectedVisitors: 500,
          previousExperience: true,
          documents: [
            { name: 'Business Registration', status: 'verified' },
            { name: 'Company Profile', status: 'verified' },
            { name: 'Product Catalog', status: 'verified' }
          ],
          notes: 'Excellent application with strong product portfolio'
        },
        {
          _id: '2',
          exhibitor: {
            _id: 'ex2',
            companyName: 'NEOM Tech',
            contactPerson: 'Sara Al-Mahmoud',
            email: 'sara@neom.com',
            phone: '+966 50 234 5678'
          },
          expo: {
            _id: 'exp1',
            name: 'Saudi Tech Summit 2025',
            startDate: '2025-09-15'
          },
          submissionDate: '2025-08-20',
          status: 'pending',
          boothPreference: 'premium',
          boothSize: '9x6m',
          requirements: 'Power, internet, audio/visual equipment, storage space, special lighting',
          budget: 25000,
          products: ['Smart City Solutions', 'AI Technology', 'Sustainable Tech'],
          expectedVisitors: 800,
          previousExperience: false,
          documents: [
            { name: 'Business Registration', status: 'verified' },
            { name: 'Company Profile', status: 'pending' },
            { name: 'Product Catalog', status: 'pending' }
          ],
          notes: ''
        },
        {
          _id: '3',
          exhibitor: {
            _id: 'ex3',
            companyName: 'Al-Rajhi Bank',
            contactPerson: 'Mohammed Al-Otaibi',
            email: 'mohammed@alrajhibank.com.sa',
            phone: '+966 50 345 6789'
          },
          expo: {
            _id: 'exp2',
            name: 'Healthcare Innovation Expo',
            startDate: '2025-10-20'
          },
          submissionDate: '2025-08-25',
          status: 'under_review',
          boothPreference: 'standard',
          boothSize: '3x3m',
          requirements: 'Power, internet, basic furniture',
          budget: 8000,
          products: ['Digital Banking', 'Health Insurance', 'Fintech Solutions'],
          expectedVisitors: 300,
          previousExperience: true,
          documents: [
            { name: 'Business Registration', status: 'verified' },
            { name: 'Company Profile', status: 'verified' },
            { name: 'Product Catalog', status: 'under_review' }
          ],
          notes: 'Strong financial background, first time in healthcare expo'
        },
        {
          _id: '4',
          exhibitor: {
            _id: 'ex4',
            companyName: 'Green Energy Solutions',
            contactPerson: 'Layla Al-Faisal',
            email: 'layla@greenenergy.sa',
            phone: '+966 50 456 7890'
          },
          expo: {
            _id: 'exp3',
            name: 'Green Energy Expo',
            startDate: '2025-11-12'
          },
          submissionDate: '2025-08-28',
          status: 'rejected',
          boothPreference: 'large',
          boothSize: '6x6m',
          requirements: 'Power, internet, outdoor display area',
          budget: 12000,
          products: ['Solar Panels', 'Wind Turbines', 'Energy Storage'],
          expectedVisitors: 400,
          previousExperience: false,
          documents: [
            { name: 'Business Registration', status: 'pending' },
            { name: 'Company Profile', status: 'rejected' },
            { name: 'Product Catalog', status: 'pending' }
          ],
          notes: 'Insufficient documentation, needs to resubmit with proper certifications'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const expos = [
    { _id: 'exp1', name: 'Saudi Tech Summit 2025' },
    { _id: 'exp2', name: 'Healthcare Innovation Expo' },
    { _id: 'exp3', name: 'Green Energy Expo' }
  ]

  const filteredApplications = applications.filter(application => {
    const matchesSearch = 
      application.exhibitor.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.exhibitor.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      application.expo.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = filterStatus === 'all' || application.status === filterStatus
    const matchesExpo = filterExpo === 'all' || application.expo._id === filterExpo
    
    return matchesSearch && matchesStatus && matchesExpo
  })

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'under_review':
        return 'bg-blue-100 text-blue-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return CheckCircle
      case 'pending':
        return Clock
      case 'under_review':
        return AlertCircle
      case 'rejected':
        return XCircle
      default:
        return Clock
    }
  }

  const handleStatusChange = async (applicationId, newStatus) => {
    try {
      await axios.put(`/api/application/${applicationId}`, { status: newStatus })
      await fetchApplications()
    } catch (error) {
      console.error('Error updating application status:', error)
    }
  }

  const handleViewApplication = (application) => {
    setSelectedApplication(application)
    setShowModal(true)
  }

  const ApplicationModal = ({ application, onClose }) => {
    if (!application) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Application Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="h-6 w-6" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Company Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.exhibitor.companyName}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.exhibitor.contactPerson}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.exhibitor.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Phone</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.exhibitor.phone}</dd>
                </div>
              </dl>

              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Products & Services</h3>
              <div className="flex flex-wrap gap-2">
                {application.products.map((product, index) => (
                  <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {product}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Application Details</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expo</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.expo.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Submission Date</dt>
                  <dd className="mt-1 text-sm text-gray-900">{new Date(application.submissionDate).toLocaleDateString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Booth Preference</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.boothPreference} ({application.boothSize})</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Budget</dt>
                  <dd className="mt-1 text-sm text-gray-900">SAR {application.budget.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Expected Visitors</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.expectedVisitors}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Previous Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900">{application.previousExperience ? 'Yes' : 'No'}</dd>
                </div>
              </dl>

              <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Documents</h3>
              <div className="space-y-2">
                {application.documents.map((doc, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border border-gray-200 rounded">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{doc.name}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Requirements</h3>
            <p className="text-sm text-gray-600">{application.requirements}</p>
          </div>

          {application.notes && (
            <div className="mt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <p className="text-sm text-gray-600">{application.notes}</p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">Change Status:</span>
              <select
                className="border border-gray-300 rounded px-3 py-2 text-sm"
                value={application.status}
                onChange={(e) => handleStatusChange(application._id, e.target.value)}
              >
                <option value="pending">Pending</option>
                <option value="under_review">Under Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
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
          <h1 className="text-2xl font-semibold text-gray-900">Applications Management</h1>
          <p className="mt-2 text-sm text-gray-700">
            Review and manage exhibitor applications for all expos
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Applications</dt>
                  <dd className="text-lg font-medium text-gray-900">{applications.length}</dd>
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
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applications.filter(a => a.status === 'pending' || a.status === 'under_review').length}
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
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Approved</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applications.filter(a => a.status === 'approved').length}
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
                <XCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Rejected</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {applications.filter(a => a.status === 'rejected').length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
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
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="relative">
            <select
              className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="under_review">Under Review</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
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
          
          <div className="text-sm text-gray-500 flex items-center">
            {filteredApplications.length} application{filteredApplications.length !== 1 ? 's' : ''} found
          </div>
        </div>
      </div>

      {/* Applications List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Company
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booth Preference
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
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
              {filteredApplications.map((application) => {
                const StatusIcon = getStatusIcon(application.status)
                return (
                  <tr key={application._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-gray-400" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {application.exhibitor.companyName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {application.exhibitor.contactPerson}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.expo.name}</div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(application.expo.startDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{application.boothPreference}</div>
                      <div className="text-sm text-gray-500">{application.boothSize}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">SAR {application.budget.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(application.submissionDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {application.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewApplication(application)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <select
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                          value={application.status}
                          onChange={(e) => handleStatusChange(application._id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="under_review">Under Review</option>
                          <option value="approved">Approved</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {filteredApplications.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <FileText className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No applications found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Applications will appear here once exhibitors start submitting them.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <ApplicationModal 
          application={selectedApplication} 
          onClose={() => {
            setShowModal(false)
            setSelectedApplication(null)
          }} 
        />
      )}
    </div>
  )
}
