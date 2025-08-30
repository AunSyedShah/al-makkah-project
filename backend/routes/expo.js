import express from 'express';
import { Expo, Booth, ExhibitorApplication, Session, Registration } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { paginate, buildSearchQuery, buildSortQuery, sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();

// Get all expos (public)
router.get('/', async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { search, status, category } = req.query;
    
    let query = { isPublic: true };
    
    // Add search
    if (search) {
      query = { ...query, ...buildSearchQuery(search, ['title', 'description', 'theme', 'location.city']) };
    }
    
    // Add filters
    if (status) query.status = status;
    if (category) query.categories = { $in: [category] };
    
    const sort = buildSortQuery(req);
    
    const expos = await Expo.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Expo.countDocuments(query);
    
    sendResponse(res, {
      expos,
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

// Get expo by ID
router.get('/:id', async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id)
      .populate('organizer', 'firstName lastName email phoneNumber');
    
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    sendResponse(res, expo);
  } catch (error) {
    sendError(res, error);
  }
});

// Create expo (admin/organizer only)
router.post('/', authenticate, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const requiredFields = ['title', 'description', 'startDate', 'endDate', 'location'];
    validateRequiredFields(req.body, requiredFields);
    
    const expo = new Expo({
      ...req.body,
      organizer: req.user._id
    });
    
    await expo.save();
    await expo.populate('organizer', 'firstName lastName email');
    
    sendResponse(res, expo, 'Expo created successfully', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Update expo
router.put('/:id', authenticate, async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    // Check permissions
    if (expo.organizer.toString() !== req.user._id.toString() && !['admin'].includes(req.user.role)) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const updatedExpo = await Expo.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('organizer', 'firstName lastName email');
    
    sendResponse(res, updatedExpo, 'Expo updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Delete expo
router.delete('/:id', authenticate, authorize('admin', 'organizer'), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    // Check permissions
    if (expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    await Expo.findByIdAndDelete(req.params.id);
    sendResponse(res, null, 'Expo deleted successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Get my expos (for organizers)
router.get('/my/expos', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const sort = buildSortQuery(req);
    
    const query = req.user.role === 'admin' ? {} : { organizer: req.user._id };
    
    const expos = await Expo.find(query)
      .populate('organizer', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Expo.countDocuments(query);
    
    sendResponse(res, {
      expos,
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

// Get expo statistics
router.get('/:id/stats', authenticate, async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    // Check permissions
    if (expo.organizer.toString() !== req.user._id.toString() && !['admin'].includes(req.user.role)) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Get statistics
    const totalBooths = await Booth.countDocuments({ expo: req.params.id });
    const occupiedBooths = await Booth.countDocuments({ expo: req.params.id, status: 'occupied' });
    const applications = await ExhibitorApplication.countDocuments({ expo: req.params.id });
    const approvedApplications = await ExhibitorApplication.countDocuments({ expo: req.params.id, status: 'approved' });
    const registrations = await Registration.countDocuments({ expo: req.params.id, registrationType: 'expo' });
    const sessions = await Session.countDocuments({ expo: req.params.id });
    
    const stats = {
      booths: {
        total: totalBooths,
        occupied: occupiedBooths,
        available: totalBooths - occupiedBooths,
        occupancyRate: totalBooths > 0 ? (occupiedBooths / totalBooths * 100).toFixed(2) : 0
      },
      applications: {
        total: applications,
        approved: approvedApplications,
        pending: applications - approvedApplications,
        approvalRate: applications > 0 ? (approvedApplications / applications * 100).toFixed(2) : 0
      },
      registrations: {
        total: registrations
      },
      sessions: {
        total: sessions
      }
    };
    
    sendResponse(res, stats);
  } catch (error) {
    sendError(res, error);
  }
});

// Publish/unpublish expo
router.patch('/:id/publish', authenticate, async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.id);
    
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    // Check permissions
    if (expo.organizer.toString() !== req.user._id.toString() && !['admin'].includes(req.user.role)) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const newStatus = expo.status === 'published' ? 'draft' : 'published';
    
    const updatedExpo = await Expo.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    ).populate('organizer', 'firstName lastName email');
    
    sendResponse(res, updatedExpo, `Expo ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
