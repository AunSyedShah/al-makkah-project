import { useState, useEffect, useRef } from 'react'
import { 
  Send, 
  Search, 
  Plus,
  Filter,
  Mail,
  MessageSquare,
  Phone,
  Video,
  Paperclip,
  MoreHorizontal,
  Users,
  Bell,
  Settings,
  Archive,
  Star,
  Trash2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import api from '../utils/api'

export default function Communications() {
  const [messages, setMessages] = useState([])
  const [conversations, setConversations] = useState([])
  const [activeConversation, setActiveConversation] = useState(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showNewMessage, setShowNewMessage] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    fetchConversations()
    fetchMessages()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const fetchConversations = async () => {
    try {
      const response = await api.get('/communication/conversations')
      setConversations(response.data.conversations || [])
    } catch (error) {
      console.error('Error fetching conversations:', error)
      // Mock data for development
      setConversations([
        {
          _id: '1',
          participants: [
            {
              _id: 'user1',
              name: 'Ahmed Al-Rashid',
              company: 'Saudi Telecom Company',
              avatar: null,
              role: 'exhibitor'
            }
          ],
          lastMessage: {
            content: 'Thank you for approving our application. When can we schedule the booth setup?',
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            sender: 'user1'
          },
          unreadCount: 2,
          type: 'direct',
          status: 'active'
        },
        {
          _id: '2',
          participants: [
            {
              _id: 'user2',
              name: 'Sara Al-Mahmoud',
              company: 'NEOM Tech',
              avatar: null,
              role: 'exhibitor'
            }
          ],
          lastMessage: {
            content: 'Could you please send us the floor plan for the premium booths?',
            timestamp: new Date(Date.now() - 7200000), // 2 hours ago
            sender: 'user2'
          },
          unreadCount: 0,
          type: 'direct',
          status: 'active'
        },
        {
          _id: '3',
          participants: [
            {
              _id: 'user3',
              name: 'Mohammed Al-Otaibi',
              company: 'Al-Rajhi Bank',
              avatar: null,
              role: 'exhibitor'
            }
          ],
          lastMessage: {
            content: 'Our application status shows under review. Any updates?',
            timestamp: new Date(Date.now() - 14400000), // 4 hours ago
            sender: 'user3'
          },
          unreadCount: 1,
          type: 'direct',
          status: 'active'
        },
        {
          _id: '4',
          participants: [
            {
              _id: 'group1',
              name: 'Saudi Tech Summit 2025 - Organizers',
              company: 'Group Chat',
              avatar: null,
              role: 'group'
            }
          ],
          lastMessage: {
            content: 'Meeting scheduled for tomorrow at 10 AM to discuss final arrangements',
            timestamp: new Date(Date.now() - 21600000), // 6 hours ago
            sender: 'organizer1'
          },
          unreadCount: 5,
          type: 'group',
          status: 'active'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId = activeConversation?._id) => {
    if (!conversationId) return
    
    try {
      const response = await axios.get(`/api/communication/messages/${conversationId}`)
      setMessages(response.data.messages || [])
    } catch (error) {
      console.error('Error fetching messages:', error)
      // Mock data for development
      if (conversationId === '1') {
        setMessages([
          {
            _id: 'm1',
            content: 'Hello! I submitted our application for the Saudi Tech Summit 2025. Could you please review it?',
            sender: {
              _id: 'user1',
              name: 'Ahmed Al-Rashid',
              role: 'exhibitor'
            },
            timestamp: new Date(Date.now() - 86400000), // 1 day ago
            type: 'text',
            status: 'read'
          },
          {
            _id: 'm2',
            content: 'Hi Ahmed! I have reviewed your application and it looks great. Your application has been approved!',
            sender: {
              _id: 'admin1',
              name: 'Admin',
              role: 'admin'
            },
            timestamp: new Date(Date.now() - 82800000), // 23 hours ago
            type: 'text',
            status: 'read'
          },
          {
            _id: 'm3',
            content: 'That\'s wonderful news! Thank you so much. What are the next steps?',
            sender: {
              _id: 'user1',
              name: 'Ahmed Al-Rashid',
              role: 'exhibitor'
            },
            timestamp: new Date(Date.now() - 82500000), // 22.9 hours ago
            type: 'text',
            status: 'read'
          },
          {
            _id: 'm4',
            content: 'You will receive a booth assignment shortly. Please prepare your company materials and let us know your setup requirements.',
            sender: {
              _id: 'admin1',
              name: 'Admin',
              role: 'admin'
            },
            timestamp: new Date(Date.now() - 82200000), // 22.8 hours ago
            type: 'text',
            status: 'read'
          },
          {
            _id: 'm5',
            content: 'Thank you for approving our application. When can we schedule the booth setup?',
            sender: {
              _id: 'user1',
              name: 'Ahmed Al-Rashid',
              role: 'exhibitor'
            },
            timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
            type: 'text',
            status: 'delivered'
          }
        ])
      }
    }
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return

    const messageData = {
      content: newMessage,
      conversationId: activeConversation._id,
      type: 'text'
    }

    try {
      await api.post('/communication/messages', messageData)
      // Add message to local state immediately
      const newMsg = {
        _id: Date.now().toString(),
        content: newMessage,
        sender: {
          _id: 'admin1',
          name: 'Admin',
          role: 'admin'
        },
        timestamp: new Date(),
        type: 'text',
        status: 'sent'
      }
      setMessages([...messages, newMsg])
      setNewMessage('')
      
      // Update conversation last message
      setConversations(conversations.map(conv => 
        conv._id === activeConversation._id 
          ? { ...conv, lastMessage: { content: newMessage, timestamp: new Date(), sender: 'admin1' } }
          : conv
      ))
    } catch (error) {
      console.error('Error sending message:', error)
    }
  }

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.participants.some(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.company.toLowerCase().includes(searchTerm.toLowerCase())
    )
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'unread' && conv.unreadCount > 0) ||
      (filterType === 'group' && conv.type === 'group') ||
      (filterType === 'direct' && conv.type === 'direct')
    
    return matchesSearch && matchesFilter
  })

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
          <h1 className="text-2xl font-semibold text-gray-900">Communications</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage conversations with exhibitors and team members
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </button>
          <button
            onClick={() => setShowNewMessage(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </button>
        </div>
      </div>

      {/* Main Communication Interface */}
      <div className="bg-white rounded-lg shadow overflow-hidden" style={{ height: '600px' }}>
        <div className="flex h-full">
          {/* Conversations Sidebar */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col">
            {/* Search and Filter */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex space-x-2">
                {['all', 'unread', 'direct', 'group'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterType(filter)}
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      filterType === filter
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => {
                    setActiveConversation(conversation)
                    fetchMessages(conversation._id)
                  }}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                    activeConversation?._id === conversation._id ? 'bg-blue-50 border-blue-200' : ''
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {conversation.type === 'group' ? (
                          <Users className="h-6 w-6 text-gray-600" />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {conversation.participants[0]?.name.charAt(0)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {conversation.participants[0]?.name}
                        </p>
                        <div className="flex items-center space-x-1">
                          {conversation.unreadCount > 0 && (
                            <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-blue-600 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                          <p className="text-xs text-gray-500">
                            {formatDistanceToNow(conversation.lastMessage.timestamp, { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mb-1">
                        {conversation.participants[0]?.company}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        {conversation.lastMessage.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Message Area */}
          <div className="flex-1 flex flex-col">
            {activeConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                        {activeConversation.type === 'group' ? (
                          <Users className="h-6 w-6 text-gray-600" />
                        ) : (
                          <span className="text-sm font-medium text-gray-700">
                            {activeConversation.participants[0]?.name.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">
                          {activeConversation.participants[0]?.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {activeConversation.participants[0]?.company}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Phone className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <Video className="h-5 w-5" />
                      </button>
                      <button className="p-2 text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender.role === 'admin' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.sender.role === 'admin'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-900'
                        }`}
                      >
                        <p className="text-sm">{message.content}</p>
                        <p
                          className={`text-xs mt-1 ${
                            message.sender.role === 'admin' ? 'text-blue-200' : 'text-gray-500'
                          }`}
                        >
                          {formatDistanceToNow(message.timestamp, { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex items-center space-x-3">
                    <button className="p-2 text-gray-400 hover:text-gray-600">
                      <Paperclip className="h-5 w-5" />
                    </button>
                    <div className="flex-1">
                      <input
                        type="text"
                        className="block w-full px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      />
                    </div>
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No conversation selected</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Choose a conversation from the sidebar to start messaging.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-6 w-6 text-blue-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Conversations</dt>
                  <dd className="text-lg font-medium text-gray-900">{conversations.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Unread Messages</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {conversations.reduce((sum, conv) => sum + conv.unreadCount, 0)}
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
                <Users className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Chats</dt>
                  <dd className="text-lg font-medium text-gray-900">
                    {conversations.filter(c => c.status === 'active').length}
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
                <Settings className="h-6 w-6 text-purple-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Response Time</dt>
                  <dd className="text-lg font-medium text-gray-900">~2h</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
