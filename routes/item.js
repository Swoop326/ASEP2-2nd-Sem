require('dotenv').config();
const express = require('express');
const router = express.Router();
const Item = require('../models/item');
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
    folder: 'lost_items',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ POST /lost - Submit lost item
router.post('/lost', upload.single('image'), async (req, res) => {
  try {
    console.log('Received body:', req.body);

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

    // ✅ Send email to all users
    const subject = `New Lost Item Reported: ${title}`;
    const htmlContent = `
      <h2>${title}</h2>
      <p><strong>Description:</strong> ${description}</p>
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Location:</strong> ${location}</p>
      <p><strong>Date:</strong> ${date}</p>
      ${req.file?.path ? `<img src="${req.file.path}" alt="Item Image" style="max-width:300px;" />` : ''}
      <p>Please check the platform for more details.</p>
    `;
    await sendEmailToAllUsers(subject, htmlContent);

    res.status(201).json({ message: 'Lost item reported successfully' });
  } catch (err) {
    console.error('❌ Error reporting lost item:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
