# Al-Makkah Expo Management System - Database Models

## Model Overview

This document outlines the database models and their relationships for the expo management system.

## Models and Relationships

### 1. User (Auth.js)
**Purpose:** Base user model for all user types
**Fields:**
- email, password, firstName, lastName
- role: 'admin', 'organizer', 'exhibitor', 'attendee'
- profileImage, phoneNumber, isActive, emailVerified
- resetPasswordToken, resetPasswordExpires

### 2. Expo
**Purpose:** Main expo/event entity
**Fields:**
- title, description, theme, startDate, endDate
- location (venue, address, city, country)
- organizer (ref: User)
- maxExhibitors, maxAttendees, registrationDeadline
- status: 'draft', 'published', 'active', 'completed', 'cancelled'
- floorPlan, categories, tags, fees

### 3. Booth
**Purpose:** Individual booth spaces within expos
**Fields:**
- expo (ref: Expo)
- boothNumber, dimensions, location coordinates
- price, category, amenities
- status: 'available', 'reserved', 'occupied', 'maintenance'
- exhibitor (ref: User), maxCapacity

### 4. Exhibitor
**Purpose:** Extended profile for exhibitors
**Fields:**
- user (ref: User)
- companyName, companyDescription, industry, website, logo
- contactPerson, address, socialMedia
- productsServices[], documents[], companySize
- isVerified, verificationDocuments

### 5. ExhibitorApplication
**Purpose:** Manages exhibitor applications to expos
**Fields:**
- expo (ref: Expo), exhibitor (ref: User), exhibitorProfile (ref: Exhibitor)
- requestedBooths[], preferredBoothType, specialRequirements
- status: 'pending', 'under_review', 'approved', 'rejected', 'cancelled'
- applicationFee, reviewNotes, assignedBooth (ref: Booth)

### 6. Session
**Purpose:** Scheduled events/sessions within expos
**Fields:**
- expo (ref: Expo)
- title, description, type, startTime, endTime
- location (room, capacity, equipment)
- speakers[], topics[], category, maxAttendees
- registrationRequired, materials[], status

### 7. Registration
**Purpose:** Attendee registrations for expos and sessions
**Fields:**
- expo (ref: Expo), attendee (ref: User)
- registrationType: 'expo', 'session'
- session (ref: Session), paymentInfo, attendeeInfo
- status: 'registered', 'confirmed', 'cancelled', 'attended', 'no_show'
- qrCode, checkInTime, feedback

### 8. Communication
**Purpose:** Messages between users
**Fields:**
- expo (ref: Expo), from (ref: User), to (ref: User)
- type: 'message', 'inquiry', 'appointment_request', 'notification', 'feedback'
- subject, message, priority, status
- appointmentDetails, attachments[], relatedBooth, relatedSession

### 9. Feedback
**Purpose:** User feedback and support requests
**Fields:**
- user (ref: User), expo (ref: Expo)
- type: 'feedback', 'bug_report', 'feature_request', 'support_request'
- category, subject, description, priority, status
- rating, attachments[], adminNotes[], resolution

### 10. Analytics
**Purpose:** Track user interactions and system events
**Fields:**
- expo (ref: Expo), user (ref: User), eventType, sessionId
- relatedEntity (polymorphic reference), metadata
- timestamp, deviceInfo, location data

### 11. Notification
**Purpose:** System notifications to users
**Fields:**
- recipient (ref: User), sender (ref: User), expo (ref: Expo)
- type, title, message, priority, channels[]
- status, readAt, scheduledFor, actionRequired

## Key Relationships

### User Relationships
- **User → Expo** (1:N) - A user can organize multiple expos
- **User → ExhibitorApplication** (1:N) - A user can apply to multiple expos
- **User → Registration** (1:N) - A user can register for multiple expos/sessions
- **User → Communication** (1:N) - Users can send/receive multiple messages
- **User → Feedback** (1:N) - Users can submit multiple feedback items

### Expo Relationships  
- **Expo → Booth** (1:N) - An expo has multiple booths
- **Expo → Session** (1:N) - An expo has multiple sessions
- **Expo → ExhibitorApplication** (1:N) - An expo receives multiple applications
- **Expo → Registration** (1:N) - An expo has multiple registrations

### Booth Relationships
- **Booth → ExhibitorApplication** (N:N) - Exhibitors can request multiple booths
- **Booth → User** (N:1) - A booth is assigned to one exhibitor

### Application Flow
1. **User** creates **Exhibitor** profile
2. **User** submits **ExhibitorApplication** for an **Expo**
3. **Admin/Organizer** reviews and approves application
4. **Booth** is assigned to the exhibitor
5. **Analytics** tracks all interactions

### Registration Flow
1. **User** registers for an **Expo** (creates Registration)
2. **User** can additionally register for specific **Sessions**
3. **Notifications** are sent for confirmations and reminders
4. **Analytics** tracks registration patterns

## Indexes for Performance

### Compound Indexes
- `Expo + BoothNumber` (unique per expo)
- `Expo + Exhibitor` (unique application per expo)
- `Session + Attendee` (unique session registration)
- `Expo + EventType + Timestamp` (analytics queries)

### Single Field Indexes
- `User.email` (unique)
- `Registration.qrCode` (unique)
- `Notification.recipient + status + createdAt`
- `Communication.to + status + createdAt`

## Environment Setup

1. Install dependencies: `npm install mongoose bcryptjs jsonwebtoken`
2. Set MongoDB connection string in environment variable
3. Import models in your main application file
4. Use the `connectDB()` function to establish database connection

## Usage Example

```javascript
import connectDB from './config/database.js';
import { User, Expo, Booth, ExhibitorApplication } from './models/index.js';

// Connect to database
await connectDB();

// Create an expo
const expo = new Expo({
  title: "Tech Expo 2025",
  organizer: organizerUserId,
  startDate: new Date("2025-06-01"),
  endDate: new Date("2025-06-03")
});

await expo.save();
```

This model structure supports all the functional requirements mentioned in your specification while maintaining flexibility for future enhancements.
