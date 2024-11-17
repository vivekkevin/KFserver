const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth'); // Ensure this file exists and is properly configured
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Middleware
// CORS Configuration
const corsOptions = {
  origin: 'https://klippefort.online', // Replace with your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow required headers
  credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(bodyParser.json({ limit: '10mb' })); // Parse JSON requests
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded requests
app.use(cookieParser()); // Parse cookies

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('Error: MONGODB_URI not defined in environment variables');
  process.exit(1); // Exit if MongoDB URI is missing
}

mongoose
  .connect(mongoURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit if MongoDB connection fails
  });

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// JWT Secret Validation
if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET not defined in environment variables');
  process.exit(1); // Exit if JWT_SECRET is missing
}

// Routes
app.use('/api/auth', authRoutes); // Route for authentication

// Health Check Route
app.get('/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.status(200).json({ serverStatus: 'Running', dbStatus });
});

// Example Cookie Route
app.post('/set-cookie', (req, res) => {
  const jwtToken = process.env.JWT_SECRET || 'example-token'; // Replace with JWT logic
  res.cookie('token', jwtToken, {
    httpOnly: true,
    secure: true, // Only sent over HTTPS
    sameSite: 'None', // Required for cross-site cookies
  });
  res.status(200).json({ message: 'Cookie set successfully' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'An error occurred on the server' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
