import mongoose from "mongoose";

const registrationSchema = new mongoose.Schema({
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true
  },
  attendee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  registrationType: {
    type: String,
    enum: ['expo', 'session'],
    required: true
  },
  session: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  },
  registrationDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['registered', 'confirmed', 'cancelled', 'attended', 'no_show'],
    default: 'registered'
  },
  paymentInfo: {
    amount: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date,
    transactionId: String,
    paymentMethod: {
      type: String,
      enum: ['credit_card', 'paypal', 'bank_transfer', 'cash', 'free']
    }
  },
  attendeeInfo: {
    firstName: String,
    lastName: String,
    email: String,
    phone: String,
    company: String,
    jobTitle: String,
    dietary: String,
    specialRequirements: String
  },
  qrCode: {
    type: String // QR code for check-in
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: Date
  },
  notifications: {
    emailSent: {
      type: Boolean,
      default: false
    },
    reminderSent: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

// Compound indexes
registrationSchema.index({ expo: 1, attendee: 1 }, { unique: true, partialFilterExpression: { registrationType: 'expo' } });
registrationSchema.index({ session: 1, attendee: 1 }, { unique: true, partialFilterExpression: { registrationType: 'session' } });

export const Registration = mongoose.model('Registration', registrationSchema);
