import mongoose from "mongoose";

const boothSchema = new mongoose.Schema({
  expo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Expo',
    required: true
  },
  boothNumber: {
    type: String,
    required: true
  },
  dimensions: {
    width: {
      type: Number,
      required: true
    },
    height: {
      type: Number,
      required: true
    },
    area: {
      type: Number // calculated field: width * height
    }
  },
  location: {
    x: {
      type: Number,
      required: true
    },
    y: {
      type: Number,
      required: true
    },
    floor: {
      type: String,
      default: 'Ground Floor'
    },
    zone: {
      type: String // e.g., 'A', 'B', 'Main Hall', etc.
    }
  },
  price: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    enum: ['premium', 'standard', 'basic', 'corner', 'island'],
    default: 'standard'
  },
  amenities: [{
    type: String // e.g., 'Power Supply', 'WiFi', 'Water', 'Storage'
  }],
  status: {
    type: String,
    enum: ['available', 'reserved', 'occupied', 'maintenance'],
    default: 'available'
  },
  exhibitor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reservedAt: {
    type: Date
  },
  maxCapacity: {
    type: Number,
    default: 4 // max number of staff
  },
  specialRequirements: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Compound index to ensure unique booth numbers per expo
boothSchema.index({ expo: 1, boothNumber: 1 }, { unique: true });

export const Booth = mongoose.model('Booth', boothSchema);
