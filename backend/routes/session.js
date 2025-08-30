import express from 'express';
import { Session, Expo, Registration } from '../models/index.js';
import { authenticate, authorize, optionalAuth } from '../middleware/auth.js';
import { paginate, buildSearchQuery, buildSortQuery, sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();

// Get sessions for expo
router.get('/expo/:expoId', optionalAuth, async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { type, category, date } = req.query;
    
    let query = { expo: req.params.expoId };
    
    // Add filters
    if (type) query.type = type;
    if (category) query.category = category;
    if (date) {
      const startDate = new Date(date);
      const endDate = new Date(date);
      endDate.setDate(endDate.getDate() + 1);
      query.startTime = { $gte: startDate, $lt: endDate };
    }
    
    const sort = buildSortQuery(req) || { startTime: 1 };
    
    const sessions = await Session.find(query)
      .populate('expo', 'title')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Session.countDocuments(query);
    
    sendResponse(res, {
      sessions,
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

// Get session by ID
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const session = await Session.findById(req.params.id)
      .populate('expo', 'title startDate endDate location organizer');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check if user is registered for this session
    let isRegistered = false;
    if (req.user) {
      const registration = await Registration.findOne({
        session: session._id,
        attendee: req.user._id,
        registrationType: 'session',
        status: { $in: ['registered', 'confirmed', 'attended'] }
      });
      isRegistered = !!registration;
    }
    
    const sessionData = session.toObject();
    sessionData.isRegistered = isRegistered;
    
    sendResponse(res, sessionData);
  } catch (error) {
    sendError(res, error);
  }
});

// Create session (organizer/admin)
router.post('/', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const requiredFields = ['expo', 'title', 'type', 'startTime', 'endTime', 'location'];
    validateRequiredFields(req.body, requiredFields);
    
    // Check expo ownership
    const expo = await Expo.findById(req.body.expo);
    if (!expo) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    if (expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Validate time
    const startTime = new Date(req.body.startTime);
    const endTime = new Date(req.body.endTime);
    
    if (startTime >= endTime) {
      return sendError(res, new Error('End time must be after start time'), 400);
    }
    
    if (startTime < expo.startDate || endTime > expo.endDate) {
      return sendError(res, new Error('Session must be within expo dates'), 400);
    }
    
    const session = new Session(req.body);
    await session.save();
    await session.populate('expo', 'title');
    
    sendResponse(res, session, 'Session created successfully', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Update session
router.put('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('expo');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Validate time if provided
    if (req.body.startTime || req.body.endTime) {
      const startTime = new Date(req.body.startTime || session.startTime);
      const endTime = new Date(req.body.endTime || session.endTime);
      
      if (startTime >= endTime) {
        return sendError(res, new Error('End time must be after start time'), 400);
      }
      
      if (startTime < session.expo.startDate || endTime > session.expo.endDate) {
        return sendError(res, new Error('Session must be within expo dates'), 400);
      }
    }
    
    const updatedSession = await Session.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('expo', 'title');
    
    sendResponse(res, updatedSession, 'Session updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Delete session
router.delete('/:id', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('expo');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Check if there are registrations
    const registrationCount = await Registration.countDocuments({ 
      session: req.params.id,
      registrationType: 'session'
    });
    
    if (registrationCount > 0) {
      return sendError(res, new Error('Cannot delete session with existing registrations'), 400);
    }
    
    await Session.findByIdAndDelete(req.params.id);
    sendResponse(res, null, 'Session deleted successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Get sessions by date range
router.get('/expo/:expoId/schedule', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let query = { expo: req.params.expoId };
    
    if (startDate && endDate) {
      query.startTime = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const sessions = await Session.find(query)
      .populate('expo', 'title')
      .sort({ startTime: 1 });
    
    // Group sessions by date
    const schedule = {};
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      if (!schedule[date]) {
        schedule[date] = [];
      }
      schedule[date].push(session);
    });
    
    sendResponse(res, schedule);
  } catch (error) {
    sendError(res, error);
  }
});

// Add speaker to session
router.post('/:id/speakers', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { name, title, company, bio, image, linkedinProfile } = req.body;
    validateRequiredFields(req.body, ['name']);
    
    const session = await Session.findById(req.params.id).populate('expo');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    session.speakers.push({
      name,
      title,
      company,
      bio,
      image,
      linkedinProfile
    });
    
    await session.save();
    sendResponse(res, session, 'Speaker added successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Update speaker
router.put('/:id/speakers/:speakerId', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('expo');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const speaker = session.speakers.id(req.params.speakerId);
    if (!speaker) {
      return sendError(res, new Error('Speaker not found'), 404);
    }
    
    Object.keys(req.body).forEach(key => {
      speaker[key] = req.body[key];
    });
    
    await session.save();
    sendResponse(res, session, 'Speaker updated successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Remove speaker
router.delete('/:id/speakers/:speakerId', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const session = await Session.findById(req.params.id).populate('expo');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const speaker = session.speakers.id(req.params.speakerId);
    if (!speaker) {
      return sendError(res, new Error('Speaker not found'), 404);
    }
    
    speaker.deleteOne();
    await session.save();
    
    sendResponse(res, session, 'Speaker removed successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Add material to session
router.post('/:id/materials', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { name, url, type } = req.body;
    validateRequiredFields(req.body, ['name', 'url', 'type']);
    
    const session = await Session.findById(req.params.id).populate('expo');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    session.materials.push({ name, url, type });
    await session.save();
    
    sendResponse(res, session, 'Material added successfully');
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Search sessions
router.get('/search', async (req, res) => {
  try {
    const { query, expo, type, category } = req.query;
    
    if (!query) {
      return sendError(res, new Error('Search query is required'), 400);
    }
    
    let searchQuery = buildSearchQuery(query, ['title', 'description', 'topics', 'speakers.name']);
    
    if (expo) searchQuery.expo = expo;
    if (type) searchQuery.type = type;
    if (category) searchQuery.category = category;
    
    const sessions = await Session.find(searchQuery)
      .populate('expo', 'title startDate endDate')
      .sort({ startTime: 1 })
      .limit(20);
    
    sendResponse(res, sessions);
  } catch (error) {
    sendError(res, error);
  }
});

// Update session status
router.patch('/:id/status', authenticate, authorize('organizer', 'admin'), async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['scheduled', 'ongoing', 'completed', 'cancelled'].includes(status)) {
      return sendError(res, new Error('Invalid status'), 400);
    }
    
    const session = await Session.findById(req.params.id).populate('expo');
    
    if (!session) {
      return sendError(res, new Error('Session not found'), 404);
    }
    
    // Check permissions
    if (session.expo.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    session.status = status;
    await session.save();
    
    sendResponse(res, session, `Session status updated to ${status}`);
  } catch (error) {
    sendError(res, error, 400);
  }
});

export default router;
