import mongoose from "mongoose";

const exhibitorApplicationSchema = new mongoose.Schema({
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true
  },
  exhibitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  exhibitorProfile: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Exhibitor',
    required: true
  },
  requestedBooths: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth'
  }],
  preferredBoothType: {
    type: String,
    enum: ['premium', 'standard', 'basic', 'corner', 'island']
  },
  boothSizePreference: {
    minArea: Number,
    maxArea: Number
  },
  specialRequirements: {
    type: String
  },
  expectedVisitors: {
    type: Number
  },
  staffCount: {
    type: Number,
    required: true
  },
  equipmentNeeds: [{
    type: String
  }],
  promotionalMaterials: [{
    name: String,
    description: String,
    type: {
      type: String,
      enum: ['brochure', 'banner', 'flyer', 'promotional_item', 'other']
    }
  }],
  applicationFee: {
    amount: {
      type: Number,
      default: 0
    },
    paid: {
      type: Boolean,
      default: false
    },
    paymentDate: Date,
    transactionId: String
  },
  status: {
    type: String,
    enum: ['pending', 'under_review', 'approved', 'rejected', 'cancelled'],
    default: 'pending'
  },
  reviewNotes: {
    type: String
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  assignedBooth: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booth'
  },
  submissionDeadline: {
    type: Date
  }
}, {
  timestamps: true
});

// Compound index to ensure one application per exhibitor per expo
exhibitorApplicationSchema.index({ expo: 1, exhibitor: 1 }, { unique: true });

export const ExhibitorApplication = mongoose.model('ExhibitorApplication', exhibitorApplicationSchema);
