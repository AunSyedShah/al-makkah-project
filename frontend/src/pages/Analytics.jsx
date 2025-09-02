import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Building2, 
  Calendar, 
  DollarSign,
  Download,
  Filter,
  Eye,
  BarChart3
} from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import api from '../utils/api'

export default function Analytics() {
  const [analytics, setAnalytics] = useState({})
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState('7d') // 7d, 30d, 90d, 1y
  const [selectedMetric, setSelectedMetric] = useState('registrations')

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`/api/analytics?range=${dateRange}`)
      setAnalytics(response.data.analytics || {})
    } catch (error) {
      console.error('Error fetching analytics:', error)
      // Mock data for development
      setAnalytics({
        overview: {
          totalExpos: 15,
          totalExhibitors: 487,
          totalBooths: 156,
          totalRevenue: 2450000,
          registrationsThisMonth: 89,
          registrationsTrend: 12.5, // percentage
          revenueThisMonth: 245000,
          revenueTrend: -3.2,
          averageBoothOccupancy: 78.3,
          occupancyTrend: 5.8,
          averageResponseTime: 2.4 // hours
        },
        registrationTrends: [
          { date: '2025-08-01', registrations: 12, revenue: 18000 },
          { date: '2025-08-02', registrations: 8, revenue: 12000 },
          { date: '2025-08-03', registrations: 15, revenue: 25000 },
          { date: '2025-08-04', registrations: 22, revenue: 35000 },
          { date: '2025-08-05', registrations: 18, revenue: 28000 },
          { date: '2025-08-06', registrations: 25, revenue: 42000 },
          { date: '2025-08-07', registrations: 19, revenue: 31000 }
        ],
        expoPerformance: [
          { name: 'Saudi Tech Summit 2025', exhibitors: 145, booths: 89, revenue: 1450000, status: 'active' },
          { name: 'Healthcare Innovation Expo', exhibitors: 98, booths: 45, revenue: 680000, status: 'planning' },
          { name: 'Green Energy Expo', exhibitors: 112, booths: 67, revenue: 890000, status: 'planning' },
          { name: 'Digital Finance Summit', exhibitors: 76, booths: 34, revenue: 520000, status: 'completed' },
          { name: 'Manufacturing Expo', exhibitors: 134, booths: 78, revenue: 1120000, status: 'completed' }
        ],
        categoryDistribution: [
          { name: 'Technology', value: 35, count: 142 },
          { name: 'Healthcare', value: 20, count: 78 },
          { name: 'Finance', value: 15, count: 58 },
          { name: 'Manufacturing', value: 12, count: 47 },
          { name: 'Energy', value: 10, count: 39 },
          { name: 'Other', value: 8, count: 31 }
        ],
        geographicDistribution: [
          { region: 'Riyadh', exhibitors: 187, percentage: 38.4 },
          { region: 'Jeddah', exhibitors: 124, percentage: 25.5 },
          { region: 'Dammam', exhibitors: 89, percentage: 18.3 },
          { region: 'Makkah', exhibitors: 56, percentage: 11.5 },
          { region: 'Other', exhibitors: 31, percentage: 6.3 }
        ],
        applicationStatus: [
          { status: 'Approved', count: 298, percentage: 61.2 },
          { status: 'Pending', count: 124, percentage: 25.5 },
          { status: 'Under Review', count: 45, percentage: 9.2 },
          { status: 'Rejected', count: 20, percentage: 4.1 }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 0
    }).format(value)
  }

  const formatTrend = (trend) => {
    const isPositive = trend > 0
    return (
      <div className={`flex items-center ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 mr-1" />
        ) : (
          <TrendingDown className="h-4 w-4 mr-1" />
        )}
        <span className="text-sm font-medium">
          {Math.abs(trend)}%
        </span>
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
          <h1 className="text-2xl font-semibold text-gray-900">Analytics Dashboard</h1>
          <p className="mt-2 text-sm text-gray-700">
            Comprehensive analytics and insights for expo management
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Exhibitors</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analytics.overview?.totalExhibitors?.toLocaleString()}
                    </div>
                    <div className="ml-2">
                      {formatTrend(analytics.overview?.registrationsTrend)}
                    </div>
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
                <Building2 className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Booth Occupancy</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analytics.overview?.averageBoothOccupancy}%
                    </div>
                    <div className="ml-2">
                      {formatTrend(analytics.overview?.occupancyTrend)}
                    </div>
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
                <DollarSign className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {formatCurrency(analytics.overview?.totalRevenue)}
                    </div>
                    <div className="ml-2">
                      {formatTrend(analytics.overview?.revenueTrend)}
                    </div>
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
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Expos</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-gray-900">
                      {analytics.expoPerformance?.filter(expo => expo.status === 'active').length}
                    </div>
                    <div className="ml-2 text-sm text-gray-500">
                      of {analytics.overview?.totalExpos}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration Trends */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Registration Trends</h3>
            <select
              className="border border-gray-300 rounded px-2 py-1 text-sm"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="registrations">Registrations</option>
              <option value="revenue">Revenue</option>
            </select>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics.registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => format(new Date(date), 'MMM dd')}
                />
                <YAxis />
                <Tooltip 
                  labelFormatter={(date) => format(new Date(date), 'MMM dd, yyyy')}
                  formatter={(value, name) => [
                    name === 'revenue' ? formatCurrency(value) : value,
                    name === 'revenue' ? 'Revenue' : 'Registrations'
                  ]}
                />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  fill="#3B82F6" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Category Distribution</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Eye className="h-5 w-5" />
            </button>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics.categoryDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.categoryDistribution?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value}%`, props.payload.name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {analytics.categoryDistribution?.map((item, index) => (
              <div key={item.name} className="flex items-center">
                <div 
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-xs text-gray-600">{item.name} ({item.count})</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Expo Performance Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Expo Performance</h3>
            <button className="text-gray-400 hover:text-gray-600">
              <Filter className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expo Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exhibitors
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booths
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Performance
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analytics.expoPerformance?.map((expo, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{expo.name}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{expo.exhibitors}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{expo.booths}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatCurrency(expo.revenue)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      expo.status === 'active' ? 'bg-green-100 text-green-800' :
                      expo.status === 'planning' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {expo.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((expo.exhibitors / 200) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {Math.round((expo.exhibitors / 200) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Geographic & Application Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Geographic Distribution */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Geographic Distribution</h3>
          <div className="space-y-3">
            {analytics.geographicDistribution?.map((region, index) => (
              <div key={region.region} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="text-sm font-medium text-gray-900 w-16">{region.region}</div>
                  <div className="flex-1 mx-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full" 
                        style={{ width: `${region.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {region.exhibitors} ({region.percentage}%)
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Application Status */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Application Status</h3>
          <div className="space-y-3">
            {analytics.applicationStatus?.map((status, index) => (
              <div key={status.status} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-3"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  ></div>
                  <div className="text-sm font-medium text-gray-900">{status.status}</div>
                </div>
                <div className="text-sm text-gray-600">
                  {status.count} ({status.percentage}%)
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.applicationStatus} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="status" type="category" />
                  <Tooltip formatter={(value, name) => [value, 'Count']} />
                  <Bar dataKey="count" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
