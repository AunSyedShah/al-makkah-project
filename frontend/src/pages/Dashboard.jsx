import { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import { 
  Calendar, 
  Users, 
  Building, 
  TrendingUp, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin
} from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalExpos: 12,
    activeExpos: 3,
    totalExhibitors: 450,
    totalBooths: 89,
    messages: 15,
    pendingApplications: 8
  })

  const [recentActivities] = useState([
    {
      id: 1,
      type: 'expo_created',
      title: 'New Expo Created',
      description: 'Tech Innovation Summit 2025 has been created',
      time: '2 hours ago',
      icon: Calendar,
      color: 'green'
    },
    {
      id: 2,
      type: 'application_submitted',
      title: 'New Exhibitor Application',
      description: 'Saudi Tech Company submitted an application',
      time: '4 hours ago',
      icon: Users,
      color: 'blue'
    },
    {
      id: 3,
      type: 'booth_assigned',
      title: 'Booth Assigned',
      description: 'Booth A-15 assigned to Al-Rajhi Bank',
      time: '6 hours ago',
      icon: Building,
      color: 'purple'
    },
    {
      id: 4,
      type: 'message_received',
      title: 'New Message',
      description: 'Message from Healthcare Expo organizer',
      time: '1 day ago',
      icon: MessageSquare,
      color: 'yellow'
    }
  ])

  const [upcomingExpos] = useState([
    {
      id: 1,
      name: 'Saudi Tech Summit 2025',
      date: '2025-09-15',
      location: 'Riyadh International Convention Center',
      exhibitors: 120,
      status: 'active'
    },
    {
      id: 2,
      name: 'Healthcare Innovation Expo',
      date: '2025-10-20',
      location: 'Jeddah Convention Center',
      exhibitors: 85,
      status: 'planning'
    },
    {
      id: 3,
      name: 'Green Energy Expo',
      date: '2025-11-12',
      location: 'KAUST Convention Center',
      exhibitors: 95,
      status: 'planning'
    }
  ])

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold">Welcome back, {user?.name}!</h1>
        <p className="mt-2 text-blue-100">
          Here's what's happening with your expo management today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Expos</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalExpos}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Expos</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.activeExpos}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Exhibitors</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalExhibitors}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Booths</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.totalBooths}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Messages</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.messages}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pending</dt>
                  <dd className="text-lg font-medium text-gray-900">{stats.pendingApplications}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Recent Activities</h2>
          </div>
          <div className="p-6">
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivities.map((activity, activityIdx) => (
                  <li key={activity.id}>
                    <div className="relative pb-8">
                      {activityIdx !== recentActivities.length - 1 ? (
                        <span
                          className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                          aria-hidden="true"
                        />
                      ) : null}
                      <div className="relative flex space-x-3">
                        <div>
                          <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                              activity.color === 'green'
                                ? 'bg-green-500'
                                : activity.color === 'blue'
                                ? 'bg-blue-500'
                                : activity.color === 'purple'
                                ? 'bg-purple-500'
                                : 'bg-yellow-500'
                            }`}
                          >
                            <activity.icon className="h-5 w-5 text-white" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                            <p className="text-sm text-gray-500">{activity.description}</p>
                          </div>
                          <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            <time>{activity.time}</time>
                          </div>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Upcoming Expos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Upcoming Expos</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingExpos.map((expo) => (
                <div
                  key={expo.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{expo.name}</h3>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="h-4 w-4 mr-1" />
                        {new Date(expo.date).toLocaleDateString()}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {expo.location}
                      </div>
                      <div className="mt-1 flex items-center text-sm text-gray-500">
                        <Users className="h-4 w-4 mr-1" />
                        {expo.exhibitors} exhibitors
                      </div>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expo.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {expo.status === 'active' ? (
                          <CheckCircle className="h-3 w-3 mr-1" />
                        ) : (
                          <Clock className="h-3 w-3 mr-1" />
                        )}
                        {expo.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">
                View All Expos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
