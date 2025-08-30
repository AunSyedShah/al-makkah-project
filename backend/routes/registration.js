import express from 'express';
import { Registration, Expo, Session, User } from '../models/index.js';
import { authenticate, authorize } from '../middleware/auth.js';
import { paginate, buildSortQuery, sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();

// Register for expo
router.post('/expo', authenticate, async (req, res) => {
  try {
    const { expo, attendeeInfo } = req.body;
    validateRequiredFields(req.body, ['expo']);
    
    const expoDoc = await Expo.findById(expo);
    if (!expoDoc) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (!['published', 'active'].includes(expoDoc.status)) {
      return sendError(res, new Error('Expo is not open for registration'), 400);
    }
    
    // Check if already registered
    const existingRegistration = await Registration.findOne({
      expo,
      attendee: req.user._id,
      registrationType: 'expo'
    });
    
    if (existingRegistration) {
      return sendError(res, new Error('Already registered for this expo'), 400);
    }
    
    const registration = new Registration({
      expo,
      attendee: req.user._id,
      registrationType: 'expo',
      attendeeInfo: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phoneNumber,
        ...attendeeInfo
      },
      paymentInfo: {
        amount: expoDoc.attendeeRegistrationFee || 0,
        paid: expoDoc.attendeeRegistrationFee === 0,
        paymentMethod: expoDoc.attendeeRegistrationFee === 0 ? 'free' : undefined
      }
    });
    
    await registration.save();
    await registration.populate([
      { path: 'expo', select: 'title startDate endDate location' },
      { path: 'attendee', select: 'firstName lastName email' }
    ]);
    
    sendResponse(res, registration, 'Successfully registered for expo', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Register for session
router.post('/session', authenticate, async (req, res) => {
  try {
    const { session } = req.body;
    validateRequiredFields(req.body, ['session']);
    
    const sessionDoc = await Session.findById(session).populate('expo');
    if (!sessionDoc) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check if session requires registration
    if (!sessionDoc.registrationRequired) {
      return sendError(res, new Error('This session does not require registration'), 400);
    }
    
    // Check if already registered
    const existingRegistration = await Registration.findOne({
      session,
      attendee: req.user._id,
      registrationType: 'session'
    });
    
    if (existingRegistration) {
      return sendError(res, new Error('Already registered for this session'), 400);
    }
    
    // Check capacity
    if (sessionDoc.maxAttendees) {
      const currentRegistrations = await Registration.countDocuments({
        session,
        registrationType: 'session',
        status: { $in: ['registered', 'confirmed'] }
      });
      
      if (currentRegistrations >= sessionDoc.maxAttendees) {
        return sendError(res, new Error('Session is full'), 400);
      }
    }
    
    const registration = new Registration({
      expo: sessionDoc.expo._id,
      session,
      attendee: req.user._id,
      registrationType: 'session',
      attendeeInfo: {
        firstName: req.user.firstName,
        lastName: req.user.lastName,
        email: req.user.email,
        phone: req.user.phoneNumber
      },
      paymentInfo: {
        amount: sessionDoc.registrationFee || 0,
        paid: sessionDoc.registrationFee === 0,
        paymentMethod: sessionDoc.registrationFee === 0 ? 'free' : undefined
      }
    });
    
    await registration.save();
    await registration.populate([
      { path: 'expo', select: 'title' },
      { path: 'session', select: 'title startTime endTime location' },
      { path: 'attendee', select: 'firstName lastName email' }
    ]);
    
    sendResponse(res, registration, 'Successfully registered for session', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get my registrations
router.get('/my', authenticate, async (req, res) => {
  try {
    const { type } = req.query;
    
    let query = { attendee: req.user._id };
    if (type && ['expo', 'session'].includes(type)) {
      query.registrationType = type;
    }
    
    const registrations = await Registration.find(query)
      .populate('expo', 'title startDate endDate location status')
      .populate('session', 'title type startTime endTime location')
      .sort({ createdAt: -1 });
    
    sendResponse(res, registrations);
  } catch (error) {
    sendError(res, error);
  }
});

// Get registration by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id)
      .populate('expo', 'title startDate endDate location organizer')
      .populate('session', 'title type startTime endTime location')
      .populate('attendee', 'firstName lastName email phoneNumber');
    
    if (!registration) {
      return sendError(res, new Error('Registration not found'), 404);
    }
    
    // Check permissions
    const isOwner = registration.attendee._id.toString() === req.user._id.toString();
    const isOrganizer = registration.expo.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isOwner && !isOrganizer && !isAdmin) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    sendResponse(res, registration);
  } catch (error) {
    sendError(res, error);
  }
});

// Update registration
router.put('/:id', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return sendError(res, new Error('Registration not found'), 404);
    }
    
    // Check ownership
    if (registration.attendee.toString() !== req.user._id.toString()) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Only allow updating certain fields
    const allowedUpdates = ['attendeeInfo'];
    const updates = Object.keys(req.body)
      .filter(key => allowedUpdates.includes(key))
      .reduce((obj, key) => {
        obj[key] = req.body[key];
        return obj;
      }, {});
    
    const updatedRegistration = await Registration.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate([
      { path: 'expo', select: 'title startDate endDate location' },
      { path: 'session', select: 'title startTime endTime location' }
    ]);
    
    sendResponse(res, updatedRegistration, 'Registration updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Cancel registration
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return sendError(res, new Error('Registration not found'), 404);
    }
    
    // Check ownership
    if (registration.attendee.toString() !== req.user._id.toString()) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Check if cancellation is allowed
    if (registration.status === 'attended') {
      return sendError(res, new Error('Cannot cancel registration after attendance'), 400);
    }
    
    registration.status = 'cancelled';
    await registration.save();
    
    sendResponse(res, registration, 'Registration cancelled successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Get registrations for expo (organizer/admin)
router.get('/expo/:expoId', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { status, type } = req.query;
    
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
    if (type && ['expo', 'session'].includes(type)) query.registrationType = type;
    
    const sort = buildSortQuery(req);
    
    const registrations = await Registration.find(query)
      .populate('attendee', 'firstName lastName email phoneNumber')
      .populate('session', 'title startTime')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Registration.countDocuments(query);
    
    sendResponse(res, {
      registrations,
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

// Get registrations for session (organizer/admin)
router.get('/session/:sessionId', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { status } = req.query;
    
    const session = await Session.findById(req.params.sessionId).populate('expo');
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    let query = { session: req.params.sessionId, registrationType: 'session' };
    if (status) query.status = status;
    
    const sort = buildSortQuery(req);
    
    const registrations = await Registration.find(query)
      .populate('attendee', 'firstName lastName email phoneNumber')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Registration.countDocuments(query);
    
    sendResponse(res, {
      registrations,
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

// Check-in attendee
router.patch('/:id/checkin', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const registration = await Registration.findById(req.params.id).populate('expo');
    
    if (!registration) {
      return sendError(res, new Error('Registration not found'), 404);
    }
    
    // Check permissions
    if (registration.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    if (registration.status === 'cancelled') {
      return sendError(res, new Error('Cannot check-in cancelled registration'), 400);
    }
    
    registration.status = 'attended';
    registration.checkInTime = new Date();
    await registration.save();
    
    sendResponse(res, registration, 'Check-in successful');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Submit feedback for registration
router.post('/:id/feedback', authenticate, async (req, res) => {
  try {
    const { rating, comments } = req.body;
    validateRequiredFields(req.body, ['rating']);
    
    const registration = await Registration.findById(req.params.id);
    
    if (!registration) {
      return sendError(res, new Error('Registration not found'), 404);
    }
    
    // Check ownership
    if (registration.attendee.toString() !== req.user._id.toString()) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    if (registration.status !== 'attended') {
      return sendError(res, new Error('Can only provide feedback after attending'), 400);
    }
    
    registration.feedback = {
      rating,
      comments,
      submittedAt: new Date()
    };
    
    await registration.save();
    sendResponse(res, registration, 'Feedback submitted successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get registration statistics
router.get('/expo/:expoId/stats', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const expo = await Expo.findById(req.params.expoId);
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const stats = await Registration.aggregate([
      { $match: { expo: expo._id } },
      {
        $group: {
          _id: {
            type: '$registrationType',
            status: '$status'
          },
          count: { $sum: 1 }
        }
      }
    ]);
    
    const formattedStats = {
      expo: {
        registered: 0,
        confirmed: 0,
        attended: 0,
        cancelled: 0,
        total: 0
      },
      session: {
        registered: 0,
        confirmed: 0,
        attended: 0,
        cancelled: 0,
        total: 0
      }
    };
    
    stats.forEach(stat => {
      const type = stat._id.type;
      const status = stat._id.status;
      formattedStats[type][status] = stat.count;
      formattedStats[type].total += stat.count;
    });
    
    sendResponse(res, formattedStats);
  } catch (error) {
    sendError(res, error);
  }
});

export default router;
