const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const authRoutes = require('./routes/auth'); // Ensure this file exists and is properly configured
const loginRoutes = require('./routes/login');
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// CORS Configuration
const corsOptions = {
  origin: 'https://klippefort.online', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'], // Allow standard headers
  credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests for CORS

// Security Middleware
app.use(helmet());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
});
app.use(limiter);

// Body Parsing Middleware
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Cookie Parser
app.use(cookieParser());

// MongoDB Sanitize
app.use(mongoSanitize());

// Environment Variable Validation
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI not defined in environment variables');
  process.exit(1); // Exit if no MongoDB URI is provided
}

if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET not defined in environment variables');
  process.exit(1); // Exit if JWT_SECRET is missing
}

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1);
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// Routes
app.use('/api/auth', authRoutes); // Authentication routes
app.use('/api/auth', loginRoutes);
// Example Route for Setting Cookies
app.post('/set-cookie', (req, res) => {
  const jwtToken = process.env.JWT_SECRET || 'example-token';
  res.cookie('token', jwtToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Secure cookies in production
    sameSite: 'None',
  });
  res.status(200).json({ message: 'Cookie set successfully' });
});

// Health Check Route for Monitoring
app.get('/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({ serverStatus: 'Running', dbStatus });
});

// 404 Not Found Handler
app.use((req, res) => {
  res.status(404).json({ message: 'Resource not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'An error occurred on the server' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
});
