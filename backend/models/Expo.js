import mongoose from "mongoose";

const expoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  theme: {
    type: String,
    trim: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  location: {
    venue: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    city: {
      type: String,
      required: true
    },
    state: {
      type: String
    },
    country: {
      type: String,
      required: true
    },
    zipCode: {
      type: String
    }
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  maxExhibitors: {
    type: Number,
    default: 100
  },
  maxAttendees: {
    type: Number,
    default: 1000
  },
  registrationDeadline: {
    type: Date
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'active', 'completed', 'cancelled'],
    default: 'draft'
  },
  floorPlan: {
    type: String // URL to floor plan image
  },
  categories: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  exhibitorRegistrationFee: {
    type: Number,
    default: 0
  },
  attendeeRegistrationFee: {
    type: Number,
    default: 0
  },
  images: [{
    type: String // URLs to expo images
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const Expo = mongoose.model('Expo', expoSchema);
