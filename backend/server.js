import express from 'express';
import cors from 'cors';
import connectDB from './config/database.js';
import routes from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database
connectDB();

// Middleware - Enhanced CORS for Codespaces
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'http://localhost:5174',  // Alternative Vite port
    /https:\/\/.*-5173\.app\.github\.dev$/,  // Codespaces frontend
    /https:\/\/.*-3000\.app\.github\.dev$/,  // Codespaces backend 
    /https:\/\/.*\.github\.dev$/,            // All github.dev domains
    /https:\/\/.*\.githubpreview\.dev$/      // Github preview domains
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Request logging middleware with CORS debugging
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const origin = req.headers.origin;
  
  console.log(`${timestamp} - ${req.method} ${req.path}`);
  
  if (origin) {
    console.log(`  Origin: ${origin}`);
  }
  
  // Log CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log(`  🔍 CORS Preflight Request for: ${req.headers['access-control-request-method']} ${req.path}`);
  }
  
  next();
});

// Additional manual CORS handler as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  
  // Allow all github.dev and localhost origins
  if (origin && (
    origin.includes('github.dev') || 
    origin.includes('localhost') ||
    origin.includes('127.0.0.1')
  )) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

// Routes
app.use('/api', routes);

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map(err => err.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }
  
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }
  
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: error.message })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation available at http://localhost:${PORT}/api`);
});