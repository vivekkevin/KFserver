const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth');
require('dotenv').config();


const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://vivekkevin1995:dev@techklippe.359is.mongodb.net/klippe')
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('Error connecting to MongoDB:', err));

// API Routes
app.use('/api/auth', authRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
