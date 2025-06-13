const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const Claim = require('../models/claim');
const FoundItem = require('../models/founditem');
const twilio = require('twilio');
const sendEmail = require('../utils/sendEmail'); // <-- Import your email utility
require('dotenv').config();

// ✅ Twilio setup
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioWhatsAppNumber = 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER;

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
    folder: 'claims',
    allowed_formats: ['jpg', 'jpeg', 'png'],
  },
});
const upload = multer({ storage });

// ✅ POST /api/claims
router.post('/', upload.single('proofImage'), async (req, res) => {
  try {
    const {
      itemId,
      fullName,
      email,
      phone,
      lostPlace,
      lostDate,
      proofText,
      uniqueInfo,
    } = req.body;

    // 🔍 Validate inputs
    if (
      !itemId || !fullName || !email || !phone ||
      !lostPlace || !lostDate || !proofText || !uniqueInfo || !req.file
    ) {
      return res.status(400).json({ message: 'All fields and an image are required.' });
    }

    // ✅ Get proof image URL
    const proofImage = req.file.path;

    // ✅ Get item from DB
    const item = await FoundItem.findById(itemId);
    if (!item) {
      return res.status(404).json({ message: 'Found item not found.' });
    }

    // ✅ Create claim with itemName
    const newClaim = new Claim({
      itemId,
      itemName: item.item || 'Unnamed Item',
      fullName,
      email,
      phone,
      lostPlace,
      lostDate,
      proofText,
      uniqueInfo,
      proofImage,
    });

    await newClaim.save();

    // ✅ Send email to only the claimant
    const subject = `Claim Received for ${item.item || 'an item'}`;
    const htmlContent = `
      <h2>Hi ${fullName},</h2>
      <p>Your claim for the item <strong>${item.item}</strong> has been received.</p>
      <p>We will review your claim and contact you soon.</p>
    `;
    await sendEmail(subject, htmlContent, [email]);

    // ✅ Try to send WhatsApp message to user, but don't fail if Twilio fails
    const messageBody = `
Hello ${fullName}, your claim for the item "${item.item}" was received.
📍 Lost at: ${lostPlace}
📅 Date: ${new Date(lostDate).toLocaleDateString()}
📌 Description: ${proofText}
🔍 Unique Info: ${uniqueInfo}

Please verify this info at the Student Section (Ground Floor, Building 1).
- Lost & Found Team`;

    try {
      await client.messages.create({
        from: twilioWhatsAppNumber,
        to: phone.startsWith('whatsapp:') ? phone : `whatsapp:${phone.startsWith('+') ? phone : '+91' + phone}`,
        body: messageBody,
        mediaUrl: [proofImage],
      });
      // WhatsApp sent successfully
      return res.status(200).json({ message: 'Claim submitted. WhatsApp and email sent.' });
    } catch (twilioErr) {
      // WhatsApp failed, but claim and email succeeded
      console.error('❌ Twilio error:', twilioErr);
      return res.status(200).json({ message: 'Claim submitted. Email sent, but WhatsApp message could not be sent.' });
    }

  } catch (err) {
    console.error('❌ Error submitting claim:', err);
    return res.status(500).json({ message: 'Server error while submitting claim.' });
  }
});

module.exports = router;