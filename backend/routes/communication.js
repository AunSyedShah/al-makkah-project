import express from 'express';
import { Communication, Expo, Booth } from '../models/index.js';
import { authenticate } from '../middleware/auth.js';
import { paginate, buildSortQuery, sendResponse, sendError, validateRequiredFields } from '../utils/helpers.js';

const router = express.Router();

// Send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { to, expo, subject, message, type, appointmentDetails, relatedBooth, relatedSession } = req.body;
    validateRequiredFields(req.body, ['to', 'expo', 'message']);
    
    // Validate expo exists
    const expoDoc = await Expo.findById(expo);
    if (!expoDoc) {
      return sendError(res, new Error('Expo not found'), 404);
    }
    
    const communication = new Communication({
      from: req.user._id,
      to,
      expo,
      subject,
      message,
      type: type || 'message',
      appointmentDetails,
      relatedBooth,
      relatedSession
    });
    
    await communication.save();
    await communication.populate([
      { path: 'from', select: 'firstName lastName email' },
      { path: 'to', select: 'firstName lastName email' },
      { path: 'expo', select: 'title' }
    ]);
    
    sendResponse(res, communication, 'Message sent successfully', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get my messages (inbox and sent)
router.get('/my', authenticate, async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { type, status, expo } = req.query;
    
    let query = {
      $or: [
        { from: req.user._id },
        { to: req.user._id }
      ]
    };
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (expo) query.expo = expo;
    
    const sort = buildSortQuery(req) || { createdAt: -1 };
    
    const messages = await Communication.find(query)
      .populate('from', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .populate('expo', 'title')
      .populate('relatedBooth', 'boothNumber')
      .populate('relatedSession', 'title startTime')
      .sort(sort)
      .skip(skip)
      .limit(limit);
    
    const total = await Communication.countDocuments(query);
    
    sendResponse(res, {
      messages,
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

// Get conversation between two users for an expo
router.get('/conversation/:userId/:expoId', authenticate, async (req, res) => {
  try {
    const { userId, expoId } = req.params;
    const { page, limit, skip } = paginate(req);
    
    const query = {
      expo: expoId,
      $or: [
        { from: req.user._id, to: userId },
        { from: userId, to: req.user._id }
      ]
    };
    
    const messages = await Communication.find(query)
      .populate('from', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .populate('relatedBooth', 'boothNumber')
      .populate('relatedSession', 'title startTime')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Communication.countDocuments(query);
    
    // Mark messages as read
    await Communication.updateMany(
      { 
        to: req.user._id,
        from: userId,
        expo: expoId,
        status: 'delivered'
      },
      { 
        status: 'read',
        readAt: new Date()
      }
    );
    
    sendResponse(res, {
      messages,
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

// Get message by ID
router.get('/:id', authenticate, async (req, res) => {
  try {
    const message = await Communication.findById(req.params.id)
      .populate('from', 'firstName lastName email phoneNumber')
      .populate('to', 'firstName lastName email phoneNumber')
      .populate('expo', 'title')
      .populate('relatedBooth', 'boothNumber location')
      .populate('relatedSession', 'title startTime endTime location')
      .populate('parentMessage');
    
    if (!message) {
      return sendError(res, new Error('Message not found'), 404);
    }
    
    // Check permissions
    const isParticipant = message.from._id.toString() === req.user._id.toString() || 
                         message.to._id.toString() === req.user._id.toString();
    
    if (!isParticipant) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Mark as read if recipient is viewing
    if (message.to._id.toString() === req.user._id.toString() && message.status === 'delivered') {
      message.status = 'read';
      message.readAt = new Date();
      await message.save();
    }
    
    sendResponse(res, message);
  } catch (error) {
    sendError(res, error);
  }
});

// Reply to message
router.post('/:id/reply', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    validateRequiredFields(req.body, ['message']);
    
    const parentMessage = await Communication.findById(req.params.id);
    
    if (!parentMessage) {
      return sendError(res, new Error('Original message not found'), 404);
    }
    
    // Check if user is part of the conversation
    const isParticipant = parentMessage.from.toString() === req.user._id.toString() || 
                         parentMessage.to.toString() === req.user._id.toString();
    
    if (!isParticipant) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    // Determine recipient (opposite of current user)
    const recipient = parentMessage.from.toString() === req.user._id.toString() 
      ? parentMessage.to 
      : parentMessage.from;
    
    const reply = new Communication({
      from: req.user._id,
      to: recipient,
      expo: parentMessage.expo,
      subject: `Re: ${parentMessage.subject || 'Message'}`,
      message,
      type: parentMessage.type,
      parentMessage: parentMessage._id,
      relatedBooth: parentMessage.relatedBooth,
      relatedSession: parentMessage.relatedSession
    });
    
    await reply.save();
    await reply.populate([
      { path: 'from', select: 'firstName lastName email' },
      { path: 'to', select: 'firstName lastName email' },
      { path: 'expo', select: 'title' }
    ]);
    
    // Update parent message status
    parentMessage.status = 'replied';
    await parentMessage.save();
    
    sendResponse(res, reply, 'Reply sent successfully', 201);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Update appointment status
router.patch('/:id/appointment', authenticate, async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['pending', 'accepted', 'declined', 'rescheduled', 'completed'].includes(status)) {
      return sendError(res, new Error('Invalid appointment status'), 400);
    }
    
    const message = await Communication.findById(req.params.id);
    
    if (!message) {
      return sendError(res, new Error('Message not found'), 404);
    }
    
    if (message.type !== 'appointment_request') {
      return sendError(res, new Error('This message is not an appointment request'), 400);
    }
    
    // Only recipient can update appointment status
    if (message.to.toString() !== req.user._id.toString()) {
      return sendError(res, new Error('Only the recipient can update appointment status'), 403);
    }
    
    message.appointmentDetails.status = status;
    await message.save();
    
    await message.populate([
      { path: 'from', select: 'firstName lastName email' },
      { path: 'to', select: 'firstName lastName email' }
    ]);
    
    sendResponse(res, message, `Appointment ${status} successfully`);
  } catch (error) {
    sendError(res, error, 400);
  }
});

// Get unread message count
router.get('/unread/count', authenticate, async (req, res) => {
  try {
    const { expo } = req.query;
    
    let query = {
      to: req.user._id,
      status: 'delivered'
    };
    
    if (expo) query.expo = expo;
    
    const count = await Communication.countDocuments(query);
    sendResponse(res, { count });
  } catch (error) {
    sendError(res, error);
  }
});

// Mark messages as read
router.patch('/mark-read', authenticate, async (req, res) => {
  try {
    const { messageIds } = req.body;
    
    if (!messageIds || !Array.isArray(messageIds)) {
      return sendError(res, new Error('messageIds array is required'), 400);
    }
    
    const result = await Communication.updateMany(
      {
        _id: { $in: messageIds },
        to: req.user._id,
        status: 'delivered'
      },
      {
        status: 'read',
        readAt: new Date()
      }
    );
    
    sendResponse(res, { modifiedCount: result.modifiedCount }, 'Messages marked as read');
  } catch (error) {
    sendError(res, error);
  }
});

// Archive message
router.patch('/:id/archive', authenticate, async (req, res) => {
  try {
    const message = await Communication.findById(req.params.id);
    
    if (!message) {
      return sendError(res, new Error('Message not found'), 404);
    }
    
    // Check if user is part of the conversation
    const isParticipant = message.from.toString() === req.user._id.toString() || 
                         message.to.toString() === req.user._id.toString();
    
    if (!isParticipant) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    message.status = 'archived';
    await message.save();
    
    sendResponse(res, message, 'Message archived successfully');
  } catch (error) {
    sendError(res, error);
  }
});

// Get messages for booth (exhibitor inquiries)
router.get('/booth/:boothId', authenticate, async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    
    const booth = await Booth.findById(req.params.boothId).populate('expo');
    if (!booth) {
      return sendError(res, new Error('Booth not found'), 404);
    }
    
    // Check if user is the exhibitor or organizer
    const isExhibitor = booth.exhibitor && booth.exhibitor.toString() === req.user._id.toString();
    const isOrganizer = booth.expo.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    
    if (!isExhibitor && !isOrganizer && !isAdmin) {
      return sendError(res, new Error('Not authorized'), 403);
    }
    
    const messages = await Communication.find({ relatedBooth: req.params.boothId })
      .populate('from', 'firstName lastName email')
      .populate('to', 'firstName lastName email')
      .populate('expo', 'title')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Communication.countDocuments({ relatedBooth: req.params.boothId });
    
    sendResponse(res, {
      messages,
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

// Get appointment requests
router.get('/appointments/requests', authenticate, async (req, res) => {
  try {
    const { page, limit, skip } = paginate(req);
    const { status, expo } = req.query;
    
    let query = {
      to: req.user._id,
      type: 'appointment_request'
    };
    
    if (status) query['appointmentDetails.status'] = status;
    if (expo) query.expo = expo;
    
    const appointments = await Communication.find(query)
      .populate('from', 'firstName lastName email phoneNumber')
      .populate('expo', 'title')
      .populate('relatedBooth', 'boothNumber')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Communication.countDocuments(query);
    
    sendResponse(res, {
      appointments,
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

export default router;
