import express from 'express';
import authRoutes from './auth.js';
import expoRoutes from './expo.js';
import boothRoutes from './booth.js';
import exhibitorRoutes from './exhibitor.js';
import applicationRoutes from './application.js';
import sessionRoutes from './session.js';
import registrationRoutes from './registration.js';
import communicationRoutes from './communication.js';

const router = express.Router();

// Mount all routes
router.use('/auth', authRoutes);
router.use('/expos', expoRoutes);
router.use('/booths', boothRoutes);
router.use('/exhibitors', exhibitorRoutes);
router.use('/applications', applicationRoutes);
router.use('/sessions', sessionRoutes);
router.use('/registrations', registrationRoutes);
router.use('/communications', communicationRoutes);

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Al-Makkah Expo API is running' 
  });
});

// API info endpoint
router.get('/', (req, res) => {
  res.json({
    name: 'Al-Makkah Expo Management API',
    version: '1.0.0',
    description: 'REST API for expo management system',
    endpoints: {
      auth: '/api/auth',
      expos: '/api/expos',
      booths: '/api/booths',
      exhibitors: '/api/exhibitors',
      applications: '/api/applications',
      sessions: '/api/sessions',
      registrations: '/api/registrations',
      communications: '/api/communications'
    }
  });
});

export default router;
