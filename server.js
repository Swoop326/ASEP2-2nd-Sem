require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cloudinary = require('cloudinary').v2;  // Import Cloudinary v2
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Route imports
const authRoutes = require('./routes/auth');
const itemRoutes = require('./routes/item');
const foundItemRoutes = require('./routes/foundItemRoutes');
const browseItemRoutes = require('./routes/browseItemRoutes');
const claimItemRoutes = require('./routes/claimItemRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Cloudinary config - MUST be before multer-storage-cloudinary usage
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.use('/api', authRoutes);
app.use('/api', itemRoutes);
app.use('/api', foundItemRoutes);
console.log('Mounting claimItemRoutes on /api/claims');
app.use('/api/claims', claimItemRoutes);
app.use('/api/admin', adminRoutes);


app.get('/api/browse/test', (req, res) => {
  res.send('Browse route is working!');
});

app.use('/api/browse', browseItemRoutes);

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

// Optional: debug cloudinary config load status
console.log('Cloudinary config loaded:', {
  name: process.env.CLOUDINARY_CLOUD_NAME || '❌ missing',
  key: process.env.CLOUDINARY_API_KEY ? '✓' : '❌ missing',
  secret: process.env.CLOUDINARY_API_SECRET ? '✓' : '❌ missing',
});
