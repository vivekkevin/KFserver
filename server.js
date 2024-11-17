const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth'); // Ensure this file exists and is properly configured
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// CORS Configuration
const corsOptions = {
  origin: 'https://klippefort.online', // Allow requests from your frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allow necessary HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests for CORS

// Middleware
app.use(bodyParser.json({ limit: '10mb' })); // Parse incoming JSON requests
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser()); // Parse cookies in requests

// MongoDB Connection
const mongoURI = process.env.MONGODB_URI;
if (!mongoURI) {
  console.error('Error: MONGODB_URI not defined in environment variables');
  process.exit(1); // Exit if no MongoDB URI is provided
}

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err);
    process.exit(1); // Exit if MongoDB connection fails
  });

// Handle MongoDB errors
mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err);
});

// API Routes
app.use('/api/auth', authRoutes); // All authentication-related routes

if (!process.env.JWT_SECRET) {
  console.error('Error: JWT_SECRET not defined in environment variables');
  process.exit(1); // Exit if JWT_SECRET is missing
}

// Example route for setting cookies (move this logic to a route that handles authentication)
app.post('/set-cookie', (req, res) => {
  const jwtToken = process.env.JWT_SECRET || 'example-token'; // Replace with your actual JWT logic
  res.cookie('token', jwtToken, {
    httpOnly: true,
    secure: true, // Ensures cookies are only sent over HTTPS
    sameSite: 'None', // Required for cross-site cookies
  });
  res.status(200).json({ message: 'Cookie set successfully' });
});



// Health Check Route for Monitoring
app.get('/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.render('status', { serverStatus: 'Running', dbStatus });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(500).json({ message: 'An error occurred on the server' });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
