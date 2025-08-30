import mongoose from "mongoose";

const communicationSchema = new mongoose.Schema({
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['message', 'inquiry', 'appointment_request', 'notification', 'feedback'],
    required: true,
    default: 'message'
  },
  subject: {
    type: String,
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
  status: {
    type: String,
    enum: ['sent', 'delivered', 'read', 'replied', 'archived'],
    default: 'sent'
  },
  readAt: {
    type: Date
  },
  parentMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Communication'
  },
  attachments: [{
    name: {
      type: String
    },
    url: {
      type: String
    },
    type: {
      type: String
    },
    size: {
      type: Number
    }
  }],
  appointmentDetails: {
    proposedDate: Date,
    proposedTime: String,
    duration: Number, // in minutes
    location: String,
    purpose: String,
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'rescheduled', 'completed'],
      default: 'pending'
    }
  },
  relatedBooth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth'
  },
  relatedSession: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  isSystemGenerated: {
    type: Boolean,
    default: false
  },
  metadata: {
    deviceInfo: String,
    ipAddress: String,
    userAgent: String
  }
}, {
  timestamps: true
});

// Index for efficient queries
communicationSchema.index({ expo: 1, from: 1, to: 1, createdAt: -1 });
communicationSchema.index({ to: 1, status: 1, createdAt: -1 });

export const Communication = mongoose.model('Communication', communicationSchema);
