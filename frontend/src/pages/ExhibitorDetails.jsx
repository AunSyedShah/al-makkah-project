import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  Calendar,
  Edit,
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Image
} from 'lucide-react'
import api from '../utils/api'

export default function ExhibitorDetails() {
  const { id } = useParams()
  const [exhibitor, setExhibitor] = useState(null)
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    fetchExhibitorDetails()
  }, [id])

  const fetchExhibitorDetails = async () => {
    try {
      const [exhibitorResponse, applicationsResponse] = await Promise.all([
        axios.get(`/api/exhibitor/${id}`),
        axios.get(`/api/application?exhibitorId=${id}`)
      ])
      
      setExhibitor(exhibitorResponse.data.exhibitor)
      setApplications(applicationsResponse.data.applications || [])
    } catch (error) {
      console.error('Error fetching exhibitor details:', error)
      // Mock data for development
      setExhibitor({
        _id: id,
        companyName: 'Saudi Telecom Company',
        contactPerson: 'Ahmed Al-Rashid',
        email: 'ahmed@stc.com.sa',
        phone: '+966 50 123 4567',
        address: 'King Fahad Road, Riyadh, Saudi Arabia',
        category: 'Telecommunications',
        description: 'Saudi Telecom Company (STC) is the leading telecommunications company in Saudi Arabia, providing innovative digital solutions and services to millions of customers across the Kingdom.',
        website: 'https://stc.com.sa',
        logo: '/api/placeholder/200/200',
        foundedYear: 1998,
        employeeCount: '15,000+',
        services: [
          'Mobile telecommunications',
          '5G network infrastructure',
          'Internet services',
          'Digital transformation solutions',
          'IoT solutions',
          'Cloud services'
        ],
        expos: [
          {
            expoId: '1',
            expoName: 'Saudi Tech Summit 2025',
            participationDate: '2025-09-15',
            boothNumbers: ['A-15'],
            status: 'confirmed'
          },
          {
            expoId: '2',
            expoName: 'Digital Transformation Expo',
            participationDate: '2025-11-20',
            boothNumbers: ['C-22'],
            status: 'pending'
          }
        ],
        documents: [
          {
            name: 'Business Registration',
            type: 'PDF',
            uploadDate: '2025-08-15',
            status: 'verified'
          },
          {
            name: 'Company Profile',
            type: 'PDF',
            uploadDate: '2025-08-16',
            status: 'verified'
          },
          {
            name: 'Product Catalog',
            type: 'PDF',
            uploadDate: '2025-08-17',
            status: 'pending'
          }
        ],
        status: 'active',
        registrationDate: '2025-08-15',
        lastUpdated: '2025-08-25'
      })
      
      setApplications([
        {
          _id: '1',
          expoName: 'Saudi Tech Summit 2025',
          submissionDate: '2025-08-15',
          status: 'approved',
          boothPreference: 'large',
          requirements: 'Power, internet, audio/visual equipment'
        },
        {
          _id: '2',
          expoName: 'Digital Transformation Expo',
          submissionDate: '2025-08-20',
          status: 'pending',
          boothPreference: 'standard',
          requirements: 'Basic power and internet'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'confirmed':
      case 'verified':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'rejected':
      case 'inactive':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'confirmed':
      case 'verified':
        return CheckCircle
      case 'pending':
        return Clock
      case 'rejected':
      case 'inactive':
        return AlertCircle
      default:
        return AlertCircle
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!exhibitor) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">Exhibitor not found</h3>
        <Link
          to="/exhibitors"
          className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-500"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Exhibitors
        </Link>
      </div>
    )
  }

  const tabs = [
    { id: 'profile', name: 'Profile' },
    { id: 'applications', name: `Applications (${applications.length})` },
    { id: 'documents', name: `Documents (${exhibitor.documents?.length || 0})` },
    { id: 'history', name: 'Activity History' }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/exhibitors"
            className="inline-flex items-center text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Exhibitors
          </Link>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
          <Edit className="h-4 w-4 mr-2" />
          Edit Exhibitor
        </button>
      </div>

      {/* Exhibitor Info Card */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4">
          <div className="flex items-start space-x-6">
            <div className="flex-shrink-0">
              <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                <Building2 className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{exhibitor.companyName}</h1>
                <span className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(exhibitor.status)}`}>
                  {exhibitor.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{exhibitor.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{exhibitor.email}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  <span>{exhibitor.phone}</span>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <Globe className="h-4 w-4 mr-2 text-gray-400" />
                  <a href={exhibitor.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                    Website
                  </a>
                </div>
                
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  <span>Riyadh, Saudi Arabia</span>
                </div>
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
        {activeTab === 'profile' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Company Information</h3>
                <dl className="space-y-4">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Contact Person</dt>
                    <dd className="mt-1 text-sm text-gray-900">{exhibitor.contactPerson}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="mt-1 text-sm text-gray-900">{exhibitor.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Founded Year</dt>
                    <dd className="mt-1 text-sm text-gray-900">{exhibitor.foundedYear}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Employee Count</dt>
                    <dd className="mt-1 text-sm text-gray-900">{exhibitor.employeeCount}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Registration Date</dt>
                    <dd className="mt-1 text-sm text-gray-900">
                      {new Date(exhibitor.registrationDate).toLocaleDateString()}
                    </dd>
                  </div>
                </dl>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Services & Products</h3>
                <ul className="space-y-2">
                  {exhibitor.services?.map((service, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-gray-600">{service}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-lg font-medium text-gray-900 mt-8 mb-4">Current Participations</h3>
                <div className="space-y-3">
                  {exhibitor.expos?.map((expo, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-gray-900">{expo.expoName}</h4>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expo.status)}`}>
                          {expo.status}
                        </span>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(expo.participationDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center">
                          <Building2 className="h-3 w-3 mr-1" />
                          Booths: {expo.boothNumbers.join(', ')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'applications' && (
          <div className="p-6">
            <div className="space-y-4">
              {applications.map((application) => {
                const StatusIcon = getStatusIcon(application.status)
                return (
                  <div key={application._id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-lg font-medium text-gray-900">{application.expoName}</h4>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {application.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Submission Date</span>
                        <p className="text-sm text-gray-900">{new Date(application.submissionDate).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Booth Preference</span>
                        <p className="text-sm text-gray-900">{application.boothPreference}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Requirements</span>
                        <p className="text-sm text-gray-900">{application.requirements}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {exhibitor.documents?.map((doc, index) => {
                const StatusIcon = getStatusIcon(doc.status)
                return (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        <FileText className="h-6 w-6 text-gray-400 mr-2" />
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{doc.name}</h4>
                          <p className="text-xs text-gray-500">{doc.type}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {doc.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500">
                      Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                <li className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                        <CheckCircle className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Application Approved</p>
                        <p className="text-sm text-gray-500">Saudi Tech Summit 2025 application approved</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Aug 20, 2025</time>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li className="relative pb-8">
                  <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"></span>
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                        <FileText className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Documents Verified</p>
                        <p className="text-sm text-gray-500">Business registration and company profile verified</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Aug 18, 2025</time>
                      </div>
                    </div>
                  </div>
                </li>
                
                <li className="relative">
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                        <Building2 className="h-5 w-5 text-white" />
                      </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Account Created</p>
                        <p className="text-sm text-gray-500">Exhibitor account registered in system</p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time>Aug 15, 2025</time>
                      </div>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
