const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth'); // Ensure this file exists and is configured correctly
require('dotenv').config(); // Load environment variables from .env file

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');

// CORS Configuration
app.use(cors({
  origin: [
    'http://api.klippefort.online',   // Allow HTTP access for the API
    'https://api.klippefort.online',  // Allow HTTPS access for the API
    'http://klippefort.online',       // Allow HTTP frontend
    'https://klippefort.online'       // Allow HTTPS frontend
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Specify allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Specify allowed headers
  credentials: true // Enable credentials if cookies or authentication tokens are used
}));

// Handle Preflight Requests
app.options('*', cors());

// Middleware
app.use(bodyParser.json()); // Parse incoming JSON requests

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

// Health Check Route for Monitoring
app.get('/', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';
  res.render('status', { serverStatus: 'Running', dbStatus });
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
