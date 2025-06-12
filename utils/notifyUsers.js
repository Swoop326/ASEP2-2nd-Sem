// utils/notifyUsers.js
const twilio = require('twilio');
const User = require('../models/User');

const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioWhatsAppNumber = 'whatsapp:' + process.env.TWILIO_WHATSAPP_NUMBER;

// ✅ Format number to WhatsApp format
function formatPhoneNumber(phone) {
  // Assume Indian numbers if not starting with '+'
  if (!phone.startsWith('+')) {
    return '+91' + phone;
  }
  return phone;
}

// ✅ Send WhatsApp to all users
async function notifyAllUsers({ type, title, location, date, category, imageUrl }) {
  const users = await User.find({});
  const messageType = type === 'lost' ? '🛑 LOST Item Reported!' : '📢 FOUND Item Reported!';
  const messageBody = `${messageType}
🧾 Item: ${title}
📍 Location: ${location}
📅 Date: ${date}
🔎 Category: ${category}`;

  for (const user of users) {
    const formattedNumber = formatPhoneNumber(user.phone);
    try {
      await client.messages.create({
        from: twilioWhatsAppNumber,
        to: `whatsapp:${formattedNumber}`,
        body: messageBody,
        ...(imageUrl ? { mediaUrl: [imageUrl] } : {})
      });
      console.log(`✅ Notification sent to ${formattedNumber}`);
    } catch (err) {
      console.error(`❌ Failed to send to ${formattedNumber}:`, err.message);
    }
  }
}

module.exports = notifyAllUsers;
