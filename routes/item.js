require('dotenv').config();
const express = require('express');
const router = express.Router();
const Item = require('../models/item');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const notifyAllUsers = require('../utils/notifyUsers'); // New import

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
    folder: 'lost_items',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ POST /lost - Submit lost item
router.post('/lost', upload.single('image'), async (req, res) => {
  try {
    const {
      title, description, category,
      location, date, time,
      type, contact, reward, name, prn
    } = req.body;

    if (!title || !description || !category || !location || !date || !contact) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const dateTime = new Date(`${date}T${time || '00:00'}`);

    const newItem = new Item({
      title,
      description,
      category,
      location,
      date: dateTime,
      type: type || 'lost',
      imageUrl: req.file?.path || '',
      reporter: {
        name,
        prn,
        contact,
      },
      reward
    });

    await newItem.save();

    // ✅ Broadcast WhatsApp to all users
    await notifyAllUsers({
      type: 'lost',
      title,
      location,
      date,
      category,
      imageUrl: req.file?.path || ''
    });

    res.status(201).json({ message: 'Lost item reported successfully' });
  } catch (err) {
    console.error('❌ Error reporting lost item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ✅ GET /lost/:id - Get details of a lost item
router.get('/lost/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item || item.type !== 'lost') {
      return res.status(404).json({ error: 'Lost item not found' });
    }
    res.json(item);
  } catch (error) {
    console.error('❌ Error fetching lost item:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
