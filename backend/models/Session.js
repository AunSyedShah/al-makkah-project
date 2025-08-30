import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String
  },
  type: {
    type: String,
    enum: ['keynote', 'workshop', 'seminar', 'panel', 'networking', 'exhibition_tour', 'break'],
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  location: {
    room: {
      type: String,
      required: true
    },
    floor: {
      type: String
    },
    capacity: {
      type: Number,
      required: true
    },
    equipment: [{
      type: String // e.g., 'Projector', 'Microphone', 'Sound System'
    }]
  },
  speakers: [{
    name: {
      type: String,
      required: true
    },
    title: {
      type: String
    },
    company: {
      type: String
    },
    bio: {
      type: String
    },
    image: {
      type: String
    },
    linkedinProfile: {
      type: String
    }
  }],
  topics: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    trim: true
  },
  targetAudience: {
    type: String
  },
  maxAttendees: {
    type: Number
  },
  registrationRequired: {
    type: Boolean,
    default: false
  },
  registrationFee: {
    type: Number,
    default: 0
  },
  materials: [{
    name: {
      type: String
    },
    url: {
      type: String
    },
    type: {
      type: String,
      enum: ['presentation', 'handout', 'resource', 'recording']
    }
  }],
  tags: [{
    type: String,
    trim: true
  }],
  status: {
    type: String,
    enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  isRecorded: {
    type: Boolean,
    default: false
  },
  recordingUrl: {
    type: String
  },
  feedback: {
    allowFeedback: {
      type: Boolean,
      default: true
    },
    averageRating: {
      type: Number,
      min: 1,
      max: 5
    },
    totalRatings: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

export const Session = mongoose.model('Session', sessionSchema);
