import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo'
  },
  type: {
    type: String,
    enum: ['feedback', 'bug_report', 'feature_request', 'support_request', 'complaint', 'suggestion'],
    required: true
  },
  category: {
    type: String,
    enum: ['general', 'technical', 'user_experience', 'booth_related', 'session_related', 'registration', 'payment', 'other'],
    required: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'critical'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'pending_user', 'resolved', 'closed'],
    default: 'open'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
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
    }
  }],
  relatedEntity: {
    entityType: {
      type: String,
      enum: ['booth', 'session', 'exhibitor', 'expo', 'user', 'system']
    },
    entityId: {
      type: mongoose.Schema.Types.ObjectId
    }
  },
  adminNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  resolution: {
    description: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date
  },
  followUpRequired: {
    type: Boolean,
    default: false
  },
  followUpDate: {
    type: Date
  },
  userSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: Date
  }
}, {
  timestamps: true
});

export const Feedback = mongoose.model('Feedback', feedbackSchema);
