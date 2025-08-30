# Al-Makkah Expo Management System - API Documentation

## Overview

This is a RESTful API for managing expo events, exhibitors, sessions, and attendee registrations. The API supports multiple user roles and provides comprehensive functionality for expo management.

## Base URL
```
http://localhost:3000/api
```

## Authentication

Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## User Roles

- **Admin**: Full system access
- **Organizer**: Can create and manage expos
- **Exhibitor**: Can apply for expos and manage booth presence
- **Attendee**: Can register for expos and sessions

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/register` | Register a new user | No |
| POST | `/login` | Login user | No |
| GET | `/me` | Get current user profile | Yes |
| PUT | `/profile` | Update user profile | Yes |
| PUT | `/change-password` | Change password | Yes |
| POST | `/forgot-password` | Request password reset | No |
| POST | `/reset-password` | Reset password with token | No |
| POST | `/logout` | Logout user | Yes |

### Expos (`/api/expos`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/` | Get all public expos | No | All |
| GET | `/:id` | Get expo by ID | No | All |
| POST | `/` | Create new expo | Yes | Organizer, Admin |
| PUT | `/:id` | Update expo | Yes | Owner, Admin |
| DELETE | `/:id` | Delete expo | Yes | Owner, Admin |
| GET | `/my/expos` | Get my expos | Yes | Organizer, Admin |
| GET | `/:id/stats` | Get expo statistics | Yes | Owner, Admin |
| PATCH | `/:id/publish` | Publish/unpublish expo | Yes | Owner, Admin |

### Booths (`/api/booths`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/expo/:expoId` | Get booths for expo | No | All |
| GET | `/:id` | Get booth by ID | No | All |
| POST | `/` | Create booth | Yes | Organizer, Admin |
| POST | `/bulk` | Create multiple booths | Yes | Organizer, Admin |
| PUT | `/:id` | Update booth | Yes | Owner, Admin |
| DELETE | `/:id` | Delete booth | Yes | Owner, Admin |
| POST | `/:id/reserve` | Reserve booth | Yes | Exhibitor |
| POST | `/:id/release` | Release booth reservation | Yes | Exhibitor, Owner, Admin |
| GET | `/expo/:expoId/available` | Get available booths | No | All |
| GET | `/expo/:expoId/assignments` | Get booth assignments | Yes | Owner, Admin |

### Exhibitors (`/api/exhibitors`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/profile` | Get my exhibitor profile | Yes | Exhibitor |
| POST | `/profile` | Create/update exhibitor profile | Yes | Exhibitor |
| GET | `/` | Get all exhibitors | Yes | Admin, Organizer |
| GET | `/public` | Get verified exhibitors | No | All |
| GET | `/:id` | Get exhibitor by ID | Optional | All |
| POST | `/profile/products` | Add product/service | Yes | Exhibitor |
| PUT | `/profile/products/:productId` | Update product/service | Yes | Exhibitor |
| DELETE | `/profile/products/:productId` | Delete product/service | Yes | Exhibitor |
| POST | `/profile/documents` | Upload document | Yes | Exhibitor |
| DELETE | `/profile/documents/:documentId` | Delete document | Yes | Exhibitor |
| PATCH | `/:id/verify` | Verify exhibitor | Yes | Admin |
| GET | `/my/applications` | Get my applications | Yes | Exhibitor |
| GET | `/search/products` | Search by products/services | No | All |

### Applications (`/api/applications`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/` | Apply for expo | Yes | Exhibitor |
| GET | `/:id` | Get application by ID | Yes | Owner, Organizer, Admin |
| PUT | `/:id` | Update application | Yes | Exhibitor (Owner) |
| DELETE | `/:id` | Cancel application | Yes | Exhibitor (Owner) |
| GET | `/expo/:expoId` | Get expo applications | Yes | Organizer, Admin |
| PATCH | `/:id/review` | Review application | Yes | Organizer, Admin |
| PATCH | `/:id/assign-booth` | Assign booth to application | Yes | Organizer, Admin |
| GET | `/my/applications` | Get my applications | Yes | Exhibitor |
| GET | `/expo/:expoId/stats` | Get application statistics | Yes | Organizer, Admin |

### Sessions (`/api/sessions`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| GET | `/expo/:expoId` | Get sessions for expo | Optional | All |
| GET | `/:id` | Get session by ID | Optional | All |
| POST | `/` | Create session | Yes | Organizer, Admin |
| PUT | `/:id` | Update session | Yes | Owner, Admin |
| DELETE | `/:id` | Delete session | Yes | Owner, Admin |
| GET | `/expo/:expoId/schedule` | Get expo schedule | No | All |
| POST | `/:id/speakers` | Add speaker | Yes | Owner, Admin |
| PUT | `/:id/speakers/:speakerId` | Update speaker | Yes | Owner, Admin |
| DELETE | `/:id/speakers/:speakerId` | Remove speaker | Yes | Owner, Admin |
| POST | `/:id/materials` | Add material | Yes | Owner, Admin |
| GET | `/search` | Search sessions | No | All |
| PATCH | `/:id/status` | Update session status | Yes | Owner, Admin |

### Registrations (`/api/registrations`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/expo` | Register for expo | Yes | All |
| POST | `/session` | Register for session | Yes | All |
| GET | `/my` | Get my registrations | Yes | All |
| GET | `/:id` | Get registration by ID | Yes | Owner, Organizer, Admin |
| PUT | `/:id` | Update registration | Yes | Owner |
| DELETE | `/:id` | Cancel registration | Yes | Owner |
| GET | `/expo/:expoId` | Get expo registrations | Yes | Organizer, Admin |
| GET | `/session/:sessionId` | Get session registrations | Yes | Organizer, Admin |
| PATCH | `/:id/checkin` | Check-in attendee | Yes | Organizer, Admin |
| POST | `/:id/feedback` | Submit feedback | Yes | Owner |
| GET | `/expo/:expoId/stats` | Get registration statistics | Yes | Organizer, Admin |

### Communications (`/api/communications`)

| Method | Endpoint | Description | Auth Required | Roles |
|--------|----------|-------------|---------------|-------|
| POST | `/` | Send message | Yes | All |
| GET | `/my` | Get my messages | Yes | All |
| GET | `/conversation/:userId/:expoId` | Get conversation | Yes | All |
| GET | `/:id` | Get message by ID | Yes | Participants |
| POST | `/:id/reply` | Reply to message | Yes | Participants |
| PATCH | `/:id/appointment` | Update appointment status | Yes | Recipient |
| GET | `/unread/count` | Get unread message count | Yes | All |
| PATCH | `/mark-read` | Mark messages as read | Yes | All |
| PATCH | `/:id/archive` | Archive message | Yes | Participants |
| GET | `/booth/:boothId` | Get booth messages | Yes | Exhibitor, Organizer, Admin |
| GET | `/appointments/requests` | Get appointment requests | Yes | All |

## Request/Response Examples

### Register User
```bash
POST /api/auth/register
{
  "email": "john@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "attendee",
  "phoneNumber": "+1234567890"
}
```

### Create Expo
```bash
POST /api/expos
Authorization: Bearer <token>
{
  "title": "Tech Expo 2025",
  "description": "Annual technology exhibition",
  "startDate": "2025-06-01T09:00:00Z",
  "endDate": "2025-06-03T18:00:00Z",
  "location": {
    "venue": "Convention Center",
    "address": "123 Main St",
    "city": "Riyadh",
    "country": "Saudi Arabia"
  },
  "theme": "Innovation in Technology",
  "maxExhibitors": 200,
  "maxAttendees": 5000
}
```

### Apply for Expo
```bash
POST /api/applications
Authorization: Bearer <token>
{
  "expo": "expo_id_here",
  "staffCount": 3,
  "preferredBoothType": "standard",
  "specialRequirements": "Power supply needed",
  "expectedVisitors": 100
}
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Additional error details if applicable"]
}
```

Common HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

## Query Parameters

Many GET endpoints support query parameters for filtering and pagination:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `sortBy`: Field to sort by
- `sortOrder`: 'asc' or 'desc'
- `status`: Filter by status
- `category`: Filter by category

Example:
```
GET /api/expos?page=2&limit=5&search=tech&sortBy=startDate&sortOrder=desc
```

## Environment Variables

Required environment variables:
- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 3000)

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables
3. Start MongoDB
4. Run the server: `npm start` or `bun run server.js`
5. API will be available at `http://localhost:3000/api`

## Postman Collection

A Postman collection with all endpoints and sample requests is recommended for testing. Import the collection and set up environment variables for `baseUrl` and `token`.

This API provides a complete foundation for building expo management applications with web or mobile frontends.
