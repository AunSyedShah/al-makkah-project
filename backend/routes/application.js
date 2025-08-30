import express from 'express';
import { ExhibitorApplication, Expo, Exhibitor, Booth } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { paginate, buildSortQuery, sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();

// Apply for expo (exhibitor only)
router.post('/', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const requiredFields = ['expo', 'staffCount'];
    validateRequiredFields(req.body, requiredFields);
    
    // Check if expo exists and is accepting applications
    const expo = await Expo.findById(req.body.expo);
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (expo.status === 'completed' || expo.status === 'cancelled') {
      return sendError(res, new Error('Expo is not accepting applications'), 400);
    }
    
    // Check if exhibitor profile exists
    const exhibitorProfile = await Exhibitor.findOne({ user: req.user._id });
    if (!exhibitorProfile) {
      return sendError(res, new Error('Please complete your exhibitor profile first'), 400);
    }
    
    // Check if application already exists
    const existingApplication = await ExhibitorApplication.findOne({
      expo: req.body.expo,
      exhibitor: req.user._id
    });
    
    if (existingApplication) {
      return sendError(res, new Error('Application already submitted for this expo'), 400);
    }
    
    const application = new ExhibitorApplication({
      ...req.body,
      exhibitor: req.user._id,
      exhibitorProfile: exhibitorProfile._id
    });
    
    await application.save();
    await application.populate([
      { path: 'expo', select: 'title startDate endDate' },
      { path: 'exhibitorProfile', select: 'companyName' }
    ]);
    
    sendResponse(res, application, 'Application submitted successfully', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get application by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const application = await ExhibitorApplication.findById(req.params.id)
      .populate('expo', 'title startDate endDate location organizer')
      .populate('exhibitor', 'firstName lastName email phoneNumber')
      .populate('exhibitorProfile', 'companyName contactPerson')
      .populate('assignedBooth', 'boothNumber location dimensions price')
      .populate('reviewedBy', 'firstName lastName');
    
    if (!application) {
      return sendError(res, new Error('Application not found'), 404);
    }
    
    // Check permissions
    const isApplicant = application.exhibitor._id.toString() === req.user._id.toString();
    const isOrganizer = application.expo.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isApplicant && !isOrganizer && !isAdmin) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    sendResponse(res, application);
  } catch (error) {
    sendError(res, error);
  }
});

// Update application (before approval)
router.put('/:id', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const application = await ExhibitorApplication.findById(req.params.id);
    
    if (!application) {
      return sendError(res, new Error('Application not found'), 404);
    }
    
    // Check ownership
    if (application.exhibitor.toString() !== req.user._id.toString()) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Can only update pending applications
    if (application.status !== 'pending') {
      return sendError(res, new Error('Cannot update application that has been reviewed'), 400);
    }
    
    const updatedApplication = await ExhibitorApplication.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate([
      { path: 'expo', select: 'title startDate endDate' },
      { path: 'exhibitorProfile', select: 'companyName' }
    ]);
    
    sendResponse(res, updatedApplication, 'Application updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Cancel application
router.delete('/:id', authenticate, authorize('exhibitor'), async (req, res) => {
  try {
    const application = await ExhibitorApplication.findById(req.params.id);
    
    if (!application) {
      return sendError(res, new Error('Application not found'), 404);
    }
    
    // Check ownership
    if (application.exhibitor.toString() !== req.user._id.toString()) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Can only cancel pending applications
    if (application.status !== 'pending') {
      return sendError(res, new Error('Cannot cancel application that has been reviewed'), 400);
    }
    
    application.status = 'cancelled';
    await application.save();
    
    sendResponse(res, application, 'Application cancelled successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Get applications for expo (organizer/admin)
router.get('/expo/:expoId', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { status } = req.query;
    
    // Check expo ownership
    const expo = await Expo.findById(req.params.expoId);
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    let query = { expo: req.params.expoId };
    if (status) query.status = status;
    
    const sort = buildSortQuery(req);
    
    const applications = await ExhibitorApplication.find(query)
      .populate('exhibitor', 'firstName lastName email phoneNumber')
      .populate('exhibitorProfile', 'companyName contactPerson industry')
      .populate('assignedBooth', 'boothNumber location')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await ExhibitorApplication.countDocuments(query);
    
    sendResponse(res, {
      applications,
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

// Review application (approve/reject)
router.patch('/:id/review', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { status, reviewNotes, assignedBoothId } = req.body;
    
    if (!['approved', 'rejected'].includes(status)) {
      return sendError(res, new Error('Invalid status. Must be approved or rejected'), 400);
    }
    
    const application = await ExhibitorApplication.findById(req.params.id).populate('expo');
    
    if (!application) {
      return sendError(res, new Error('Application not found'), 404);
    }
    
    // Check permissions
    if (application.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Check if application can be reviewed
    if (!['pending', 'under_review'].includes(application.status)) {
      return sendError(res, new Error('Application cannot be reviewed'), 400);
    }
    
    let assignedBooth = null;
    
    if (status === 'approved') {
      if (assignedBoothId) {
        // Assign specific booth
        assignedBooth = await Booth.findOne({
          _id: assignedBoothId,
          expo: application.expo._id,
          status: 'available'
        });
        
        if (!assignedBooth) {
          return sendError(res, new Error('Booth not available'), 400);
        }
        
        // Update booth status
        assignedBooth.status = 'reserved';
        assignedBooth.exhibitor = application.exhibitor;
        assignedBooth.reservedAt = new Date();
        await assignedBooth.save();
        
        application.assignedBooth = assignedBooth._id;
      }
    }
    
    // Update application
    application.status = status;
    application.reviewNotes = reviewNotes;
    application.reviewedBy = req.user._id;
    application.reviewedAt = new Date();
    
    await application.save();
    
    await application.populate([
      { path: 'exhibitor', select: 'firstName lastName email' },
      { path: 'exhibitorProfile', select: 'companyName' },
      { path: 'assignedBooth', select: 'boothNumber location dimensions price' },
      { path: 'reviewedBy', select: 'firstName lastName' }
    ]);
    
    const message = status === 'approved' ? 'Application approved successfully' : 'Application rejected';
    sendResponse(res, application, message);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Assign booth to approved application
router.patch('/:id/assign-booth', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { boothId } = req.body;
    validateRequiredFields(req.body, ['boothId']);
    
    const application = await ExhibitorApplication.findById(req.params.id).populate('expo');
    
    if (!application) {
      return sendError(res, new Error('Application not found'), 404);
    }
    
    // Check permissions
    if (application.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    if (application.status !== 'approved') {
      return sendError(res, new Error('Application must be approved first'), 400);
    }
    
    // Check booth availability
    const booth = await Booth.findOne({
      _id: boothId,
      expo: application.expo._id,
      status: 'available'
    });
    
    if (!booth) {
      return sendError(res, new Error('Booth not available'), 400);
    }
    
    // Release previous booth if any
    if (application.assignedBooth) {
      await Booth.findByIdAndUpdate(application.assignedBooth, {
        status: 'available',
        $unset: { exhibitor: 1, reservedAt: 1 }
      });
    }
    
    // Assign new booth
    booth.status = 'reserved';
    booth.exhibitor = application.exhibitor;
    booth.reservedAt = new Date();
    await booth.save();
    
    // Update application
    application.assignedBooth = booth._id;
    await application.save();
    
    await application.populate('assignedBooth', 'boothNumber location dimensions price');
    
    sendResponse(res, application, 'Booth assigned successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get my applications (exhibitor)
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

// Get application statistics for expo
router.get('/expo/:expoId/stats', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.expoId);
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const stats = await ExhibitorApplication.aggregate([
      { $match: { expo: expo._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const formattedStats = {
      total: 0,
      pending: 0,
      under_review: 0,
      approved: 0,
      rejected: 0,
      cancelled: 0
    };
    
    stats.forEach(stat => {
      formattedStats[stat._id] = stat.count;
      formattedStats.total += stat.count;
    });
    
    sendResponse(res, formattedStats);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
