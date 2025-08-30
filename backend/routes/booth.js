import express from 'express';
import { Booth, Expo, ExhibitorApplication } from '../models/index.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { paginate, buildSearchQuery, buildSortQuery, sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();

// Get booths for an expo
router.get('/expo/:expoId', optionalAuth, async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { status, category, minPrice, maxPrice } = req.query;
    
    let query = { expo: req.params.expoId };
    
    // Add filters
    if (status) query.status = status;
    if (category) query.category = category;
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    
    const sort = buildSortQuery(req);
    
    const booths = await Booth.find(query)
      .populate('expo', 'title startDate endDate')
      .populate('exhibitor', 'firstName lastName email')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Booth.countDocuments(query);
    
    sendResponse(res, {
      booths,
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

// Get booth by ID
router.get('/:id', async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id)
      .populate('expo', 'title startDate endDate organizer')
      .populate('exhibitor', 'firstName lastName email phoneNumber');
    
    if (!booth) {
      return sendError(res, new Error('Booth not found'), 404);
    }
    
    sendResponse(res, booth);
  } catch (error) {
    sendError(res, error);
  }
});

// Create booth (organizer/admin only)
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const requiredFields = ['expo', 'boothNumber', 'dimensions', 'location', 'price'];
    validateRequiredFields(req.body, requiredFields);
    
    // Check if expo exists and user has permission
    const expo = await Expo.findById(req.body.expo);
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Calculate area if not provided
    if (req.body.dimensions && !req.body.dimensions.area) {
      req.body.dimensions.area = req.body.dimensions.width * req.body.dimensions.height;
    }
    
    const booth = new Booth(req.body);
    await booth.save();
    await booth.populate('expo', 'title');
    
    sendResponse(res, booth, 'Booth created successfully', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Create multiple booths
router.post('/bulk', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { expo, booths } = req.body;
    
    validateRequiredFields(req.body, ['expo', 'booths']);
    
    // Check expo permission
    const expoDoc = await Expo.findById(expo);
    if (!expoDoc) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (expoDoc.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Process booths
    const boothsToCreate = booths.map(booth => ({
      ...booth,
      expo,
      dimensions: {
        ...booth.dimensions,
        area: booth.dimensions.area || (booth.dimensions.width * booth.dimensions.height)
      }
    }));
    
    const createdBooths = await Booth.insertMany(boothsToCreate);
    
    sendResponse(res, createdBooths, `${createdBooths.length} booths created successfully`, 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Update booth
router.put('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate('expo');
    
    if (!booth) {
      return sendError(res, new Error('Booth not found'), 404);
    }
    
    // Check permissions
    if (booth.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Calculate area if dimensions are updated
    if (req.body.dimensions) {
      req.body.dimensions.area = req.body.dimensions.width * req.body.dimensions.height;
    }
    
    const updatedBooth = await Booth.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('expo', 'title').populate('exhibitor', 'firstName lastName email');
    
    sendResponse(res, updatedBooth, 'Booth updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Delete booth
router.delete('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate('expo');
    
    if (!booth) {
      return sendError(res, new Error('Booth not found'), 404);
    }
    
    // Check permissions
    if (booth.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Check if booth is reserved/occupied
    if (booth.status === 'occupied' || booth.status === 'reserved') {
      return sendError(res, new Error('Cannot delete occupied or reserved booth'), 400);
    }
    
    await Booth.findByIdAndDelete(req.params.id);
    sendResponse(res, null, 'Booth deleted successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Reserve booth (for exhibitors)
router.post('/:id/reserve', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate('expo');
    
    if (!booth) {
      return sendError(res, new Error('Booth not found'), 404);
    }
    
    if (booth.status !== 'available') {
      return sendError(res, new Error('Booth is not available'), 400);
    }
    
    // Check if user has an approved application for this expo
    const application = await ExhibitorApplication.findOne({
      expo: booth.expo._id,
      exhibitor: req.user._id,
      status: 'approved'
    });
    
    if (!application) {
      return sendError(res, new Error('You must have an approved application for this expo'), 403);
    }
    
    // Update booth
    booth.status = 'reserved';
    booth.exhibitor = req.user._id;
    booth.reservedAt = new Date();
    await booth.save();
    
    // Update application with assigned booth
    application.assignedBooth = booth._id;
    await application.save();
    
    await booth.populate('exhibitor', 'firstName lastName email');
    
    sendResponse(res, booth, 'Booth reserved successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Release booth reservation
router.post('/:id/release', authenticate, async (req, res) => {
  try {
    const booth = await Booth.findById(req.params.id).populate('expo');
    
    if (!booth) {
      return sendError(res, new Error('Booth not found'), 404);
    }
    
    // Check permissions (exhibitor who reserved it, or organizer/admin)
    const isExhibitor = booth.exhibitor && booth.exhibitor.toString() === req.user._id.toString();
    const isOrganizer = booth.expo.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isExhibitor && !isOrganizer && !isAdmin) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Update booth
    booth.status = 'available';
    booth.exhibitor = undefined;
    booth.reservedAt = undefined;
    await booth.save();
    
    // Update application
    await ExhibitorApplication.updateOne(
      { assignedBooth: booth._id },
      { $unset: { assignedBooth: 1 } }
    );
    
    sendResponse(res, booth, 'Booth reservation released');
  } catch (error) {
    sendError(res, error);
  }
});

// Get available booths for an expo
router.get('/expo/:expoId/available', async (req, res) => {
  try {
    const { category, minPrice, maxPrice } = req.query;
    
    let query = { 
      expo: req.params.expoId, 
      status: 'available',
      isActive: true
    };
    
    if (category) query.category = category;
    if (minPrice) query.price = { ...query.price, $gte: parseFloat(minPrice) };
    if (maxPrice) query.price = { ...query.price, $lte: parseFloat(maxPrice) };
    
    const booths = await Booth.find(query)
      .populate('expo', 'title')
      .sort({ price: 1 });
    
    sendResponse(res, booths);
  } catch (error) {
    sendError(res, error);
  }
});

// Get booth assignments for expo (organizer view)
router.get('/expo/:expoId/assignments', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.expoId);
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    // Check permissions
    if (expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const booths = await Booth.find({ expo: req.params.expoId })
      .populate('exhibitor', 'firstName lastName email phoneNumber')
      .sort({ boothNumber: 1 });
    
    sendResponse(res, booths);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
