import mongoose from "mongoose";

const analyticsSchema = new mongoose.Schema({
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true
  },
  eventType: {
    type: String,
    enum: [
      'page_view', 'booth_visit', 'session_view', 'exhibitor_profile_view',
      'search_query', 'registration', 'check_in', 'message_sent',
      'appointment_booked', 'feedback_submitted', 'download',
      'share', 'favorite', 'qr_scan'
    ],
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  sessionId: {
    type: String,
    required: true
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['expo', 'booth', 'session', 'exhibitor', 'user', 'communication']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  metadata: {
    page: String,
    searchQuery: String,
    deviceType: String,
    browserInfo: String,
    ipAddress: String,
    userAgent: String,
    referrer: String,
    duration: Number, // time spent in seconds
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: false // Using custom timestamp field
});

// Indexes for efficient analytics queries
analyticsSchema.index({ expo: 1, eventType: 1, timestamp: -1 });
analyticsSchema.index({ user: 1, timestamp: -1 });
analyticsSchema.index({ sessionId: 1 });
analyticsSchema.index({ 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1, timestamp: -1 });

export const Analytics = mongoose.model('Analytics', analyticsSchema);
