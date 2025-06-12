const express = require('express');
const router = express.Router();
const Claim = require('../models/claim');  // Adjust path if needed
const FoundItem = require('../models/founditem');
const nodemailer = require('nodemailer');
const twilio = require('twilio');

// Load from .env
require('dotenv').config();

// Email setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Twilio setup
const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

// Helper to send email
async function sendEmail(to, subject, html) {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  });
}

// Helper to send WhatsApp message
async function sendWhatsApp(toPhone, message) {
  const phone = toPhone.startsWith('+') ? toPhone : `+${toPhone}`;
  await client.messages.create({
    from: 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER,
    to: 'whatsapp:' + phone,
    body: message
  });
}

// ✅ Get all claims
router.get('/all', async (req, res) => {
  try {
    const claims = await Claim.find().sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch claims.' });
  }
});

// ✅ Approve claim
router.post('/approve/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found.' });

    await FoundItem.findByIdAndDelete(claim.itemId);
    await claim.deleteOne();

    const emailMsg = `
      Hello ${claim.fullName},<br><br>
      ✅ Your claim for the item <b>${claim.itemName}</b> has been <b>approved</b>.<br>
      Our admin will reach out to you shortly.<br><br>
      Thanks!<br>
      Lost & Found Team
    `;
    const smsMsg = `✅ Your claim for '${claim.itemName}' is approved. Admin will contact you. - Lost & Found`;

    await sendEmail(claim.email, 'Claim Approved', emailMsg);
    await sendWhatsApp(claim.phone, smsMsg);

    res.json({ message: 'Claim approved, item removed, notifications sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error approving claim.' });
  }
});

// ✅ Reject claim
router.post('/reject/:id', async (req, res) => {
  try {
    const claim = await Claim.findById(req.params.id);
    if (!claim) return res.status(404).json({ message: 'Claim not found.' });

    await claim.deleteOne();

    const emailMsg = `
      Hello ${claim.fullName},<br><br>
      ❌ Your claim for the item <b>${claim.itemName}</b> has been <b>rejected</b>.<br>
      You may try again with more details.<br><br>
      Regards,<br>
      Lost & Found Team
    `;
    const smsMsg = `❌ Your claim for '${claim.itemName}' was rejected. Please try again. - Lost & Found`;

    await sendEmail(claim.email, 'Claim Rejected', emailMsg);
    await sendWhatsApp(claim.phone, smsMsg);

    res.json({ message: 'Claim rejected and notifications sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error rejecting claim.' });
  }
});

module.exports = router;
