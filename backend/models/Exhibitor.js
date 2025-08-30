import mongoose from "mongoose";

const exhibitorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  companyDescription: {
    type: String
  },
  industry: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  logo: {
    type: String // URL to company logo
  },
  socialMedia: {
    linkedin: String,
    twitter: String,
    facebook: String,
    instagram: String
  },
  contactPerson: {
    name: {
      type: String,
      required: true
    },
    position: {
      type: String
    },
    email: {
      type: String,
      required: true
    },
    phone: {
      type: String
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String
  },
  productsServices: [{
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    category: {
      type: String
    },
    images: [{
      type: String // URLs to product images
    }]
  }],
  documents: [{
    name: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['business_license', 'tax_certificate', 'product_catalog', 'insurance', 'other'],
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  companySize: {
    type: String,
    enum: ['startup', 'small', 'medium', 'large', 'enterprise']
  },
  yearsInBusiness: {
    type: Number
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationDocuments: {
    submitted: {
      type: Boolean,
      default: false
    },
    approved: {
      type: Boolean,
      default: false
    },
    rejectionReason: {
      type: String
    }
  }
}, {
  timestamps: true
});

export const Exhibitor = mongoose.model('Exhibitor', exhibitorSchema);
