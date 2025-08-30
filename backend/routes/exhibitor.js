import express from 'express';
import { Exhibitor, User, ExhibitorApplication } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { paginate, buildSearchQuery, buildSortQuery, sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();

// Get exhibitor profile
router.get('/profile', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findOne({ user: req.user._id })
      .populate('user', 'firstName lastName email phoneNumber');
    
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor profile not found'), 404);
    }
    
    sendResponse(res, exhibitor);
  } catch (error) {
    sendError(res, error);
  }
});

// Create/Update exhibitor profile
router.post('/profile', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const requiredFields = ['companyName', 'contactPerson'];
    validateRequiredFields(req.body, requiredFields);
    
    let exhibitor = await Exhibitor.findOne({ user: req.user._id });
    
    if (exhibitor) {
      // Update existing profile
      exhibitor = await Exhibitor.findOneAndUpdate(
        { user: req.user._id },
        req.body,
        { new: true, runValidators: true }
      ).populate('user', 'firstName lastName email phoneNumber');
      
      sendResponse(res, exhibitor, 'Profile updated successfully');
    } else {
      // Create new profile
      exhibitor = new Exhibitor({
        ...req.body,
        user: req.user._id
      });
      
      await exhibitor.save();
      await exhibitor.populate('user', 'firstName lastName email phoneNumber');
      
      sendResponse(res, exhibitor, 'Profile created successfully', 201);
    }
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get all exhibitors (for admin/organizer)
router.get('/', authenticate, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { search, industry, isVerified } = req.query;
    
    let query = {};
    
    // Add search
    if (search) {
      query = { ...query, ...buildSearchQuery(search, ['companyName', 'industry', 'contactPerson.name']) };
    }
    
    // Add filters
    if (industry) query.industry = industry;
    if (isVerified !== undefined) query.isVerified = isVerified === 'true';
    
    const sort = buildSortQuery(req);
    
    const exhibitors = await Exhibitor.find(query)
      .populate('user', 'firstName lastName email phoneNumber')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Exhibitor.countDocuments(query);
    
    sendResponse(res, {
      exhibitors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, error);
  }
});

// Get public exhibitor profiles (for attendees)
router.get('/public', async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { search, industry } = req.query;
    
    let query = { isVerified: true };
    
    // Add search
    if (search) {
      query = { ...query, ...buildSearchQuery(search, ['companyName', 'industry']) };
    }
    
    // Add filters
    if (industry) query.industry = industry;
    
    const sort = buildSortQuery(req);
    
    const exhibitors = await Exhibitor.find(query)
      .populate('user', 'firstName lastName')
      .select('companyName companyDescription industry website logo productsServices contactPerson.name contactPerson.position')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Exhibitor.countDocuments(query);
    
    sendResponse(res, {
      exhibitors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    sendError(res, error);
  }
});

// Get exhibitor by ID
router.get('/:id', async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findById(req.params.id)
      .populate('user', 'firstName lastName email phoneNumber');
    
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor not found'), 404);
    }
    
    // If not admin/organizer, only return public info for verified exhibitors
    if (!req.user || !['admin', 'organizer'].includes(req.user.role)) {
      if (!exhibitor.isVerified) {
        return sendError(res, new Error('Exhibitor not found'), 404);
      }
      
      // Return limited public information
      const publicInfo = {
        _id: exhibitor._id,
        companyName: exhibitor.companyName,
        companyDescription: exhibitor.companyDescription,
        industry: exhibitor.industry,
        website: exhibitor.website,
        logo: exhibitor.logo,
        productsServices: exhibitor.productsServices,
        contactPerson: {
          name: exhibitor.contactPerson.name,
          position: exhibitor.contactPerson.position
        }
      };
      
      return sendResponse(res, publicInfo);
    }
    
    sendResponse(res, exhibitor);
  } catch (error) {
    sendError(res, error);
  }
});

// Add product/service
router.post('/profile/products', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const { name, description, category, images } = req.body;
    validateRequiredFields(req.body, ['name']);
    
    const exhibitor = await Exhibitor.findOne({ user: req.user._id });
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor profile not found'), 404);
    }
    
    exhibitor.productsServices.push({
      name,
      description,
      category,
      images: images || []
    });
    
    await exhibitor.save();
    sendResponse(res, exhibitor, 'Product/service added successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Update product/service
router.put('/profile/products/:productId', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findOne({ user: req.user._id });
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor profile not found'), 404);
    }
    
    const product = exhibitor.productsServices.id(req.params.productId);
    if (!product) {
      return sendError(res, new Error('Product/service not found'), 404);
    }
    
    Object.keys(req.body).forEach(key => {
      product[key] = req.body[key];
    });
    
    await exhibitor.save();
    sendResponse(res, exhibitor, 'Product/service updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Delete product/service
router.delete('/profile/products/:productId', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findOne({ user: req.user._id });
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor profile not found'), 404);
    }
    
    const product = exhibitor.productsServices.id(req.params.productId);
    if (!product) {
      return sendError(res, new Error('Product/service not found'), 404);
    }
    
    product.deleteOne();
    await exhibitor.save();
    
    sendResponse(res, exhibitor, 'Product/service deleted successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Upload document
router.post('/profile/documents', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const { name, url, type } = req.body;
    validateRequiredFields(req.body, ['name', 'url', 'type']);
    
    const exhibitor = await Exhibitor.findOne({ user: req.user._id });
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor profile not found'), 404);
    }
    
    exhibitor.documents.push({
      name,
      url,
      type
    });
    
    await exhibitor.save();
    sendResponse(res, exhibitor, 'Document uploaded successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Delete document
router.delete('/profile/documents/:documentId', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const exhibitor = await Exhibitor.findOne({ user: req.user._id });
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor profile not found'), 404);
    }
    
    const document = exhibitor.documents.id(req.params.documentId);
    if (!document) {
      return sendError(res, new Error('Document not found'), 404);
    }
    
    document.deleteOne();
    await exhibitor.save();
    
    sendResponse(res, exhibitor, 'Document deleted successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Verify exhibitor (admin only)
router.patch('/:id/verify', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { isVerified, rejectionReason } = req.body;
    
    const exhibitor = await Exhibitor.findByIdAndUpdate(
      req.params.id,
      {
        isVerified,
        'verificationDocuments.approved': isVerified,
        'verificationDocuments.rejectionReason': rejectionReason
      },
      { new: true }
    ).populate('user', 'firstName lastName email');
    
    if (!exhibitor) {
      return sendError(res, new Error('Exhibitor not found'), 404);
    }
    
    const message = isVerified ? 'Exhibitor verified successfully' : 'Exhibitor verification rejected';
    sendResponse(res, exhibitor, message);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get my applications
router.get('/my/applications', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const applications = await ExhibitorApplication.find({ exhibitor: req.user._id })
      .populate('expo', 'title startDate endDate location status')
      .populate('assignedBooth', 'boothNumber location dimensions price')
      .sort({ createdAt: -1 });
    
    sendResponse(res, applications);
  } catch (error) {
    sendError(res, error);
  }
});

// Search exhibitors by products/services
router.get('/search/products', async (req, res) => {
  try {
    const { query, category } = req.query;
    
    if (!query) {
      return sendError(res, new Error('Search query is required'), 400);
    }
    
    let searchQuery = {
      isVerified: true,
      'productsServices.name': new RegExp(query, 'i')
    };
    
    if (category) {
      searchQuery['productsServices.category'] = new RegExp(category, 'i');
    }
    
    const exhibitors = await Exhibitor.find(searchQuery)
      .populate('user', 'firstName lastName')
      .select('companyName companyDescription industry website logo productsServices contactPerson.name contactPerson.position');
    
    sendResponse(res, exhibitors);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
