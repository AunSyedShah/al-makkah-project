import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo'
  },
  type: {
    type: String,
    enum: [
      'application_approved', 'application_rejected', 'booth_assigned',
      'session_reminder', 'session_cancelled', 'session_updated',
      'expo_reminder', 'payment_due', 'payment_received',
      'message_received', 'appointment_request', 'appointment_confirmed',
      'feedback_request', 'system_maintenance', 'general_announcement'
    ],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  channels: [{
    type: String,
    enum: ['in_app', 'email', 'sms', 'push'],
    default: 'in_app'
  }],
  status: {
    type: String,
    enum: ['pending', 'sent', 'delivered', 'read', 'failed'],
    default: 'pending'
  },
  readAt: {
    type: Date
  },
  deliveredAt: {
    type: Date
  },
  scheduledFor: {
    type: Date
  },
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['expo', 'booth', 'session', 'application', 'registration', 'communication', 'feedback']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String
  },
  expiresAt: {
    type: Date
  },
  metadata: {
    templateId: String,
    variables: mongoose.Schema.Types.Mixed,
    deliveryAttempts: {
      type: Number,
      default: 0
    },
    lastAttemptAt: Date,
    errorMessage: String
  },
  isSystemGenerated: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ recipient: 1, status: 1, createdAt: -1 });
notificationSchema.index({ expo: 1, type: 1, createdAt: -1 });
notificationSchema.index({ scheduledFor: 1, status: 1 });

export const Notification = mongoose.model('Notification', notificationSchema);
