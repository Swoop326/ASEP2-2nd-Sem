require('dotenv').config();
const express = require('express');
const router = express.Router();
const FoundItem = require('../models/founditem');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const sendEmailToAllUsers = require('../utils/sendEmail'); // <-- Updated import

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'found-items',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ POST /submit-found-item
router.post('/submit-found-item', upload.single('image'), async (req, res) => {
  try {
    const {
      name, email, contact, category,
      dateFound, timeFound, description,
      location, itemName, prn
    } = req.body;

    const imageUrl = req.file ? req.file.path : '';
    const parsedDate = dateFound ? new Date(dateFound) : new Date();

    const newItem = new FoundItem({
      name, email, contact, category,
      date: parsedDate, timeFound, description,
      location, item: itemName, prn, imageUrl
    });

    await newItem.save();

    // ✅ Send email to all users
    const subject = `New Found Item Reported: ${itemName}`;
    const htmlContent = `
      <h2>${itemName}</h2>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Date:</strong> ${dateFound || 'Today'}</p>
      ${imageUrl ? `<img src="${imageUrl}" alt="Item Image" style="max-width:300px;" />` : ''}
      <p>Please check the platform for more details.</p>
    `;
    await sendEmailToAllUsers(subject, htmlContent);

    res.status(201).json({ message: 'Found item reported successfully.' });
  } catch (err) {
    console.error('❌ Error submitting found item:', err);
    res.status(500).json({ message: 'Something went wrong while submitting the item.' });
  }
});

// ✅ GET found item by ID
router.get('/found/:id', async (req, res) => {
  try {
    const item = await FoundItem.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Found item not found.' });

    res.json({
      _id: item._id,
      itemName: item.item,
      description: item.description,
      category: item.category,
      location: item.location,
      date: item.date,
      timeFound: item.timeFound,
      type: 'found',
      imageUrl: item.imageUrl,
      ownerContact: item.contact || ''
    });
  } catch (err) {
    console.error('❌ Error fetching found item:', err);
    res.status(500).json({ message: 'Error fetching found item details.' });
  }
});

module.exports = router;