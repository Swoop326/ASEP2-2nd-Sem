const User = require('../models/User');
const sendEmailToAllUsers = require('./sendEmail'); // Make sure this is the updated version

// ✅ Send Email to all users
async function notifyAllUsers({ type, title, location, date, category, imageUrl }) {
  const users = await User.find({}, 'email');
  const recipientList = users.map(user => user.email);

  if (recipientList.length === 0) {
    console.log('No users to send email to.');
    return;
  }

  const subject = `New ${type === 'lost' ? 'Lost' : 'Found'} Item Reported: ${title}`;
  const htmlContent = `
    <h2>${title}</h2>
    <p><strong>Category:</strong> ${category}</p>
    <p><strong>Location:</strong> ${location}</p>
    <p><strong>Date:</strong> ${date}</p>
    ${imageUrl ? `<img src="${imageUrl}" alt="Item Image" style="max-width:300px;" />` : ''}
    <p>Please check the platform for more details.</p>
  `;

  await sendEmailToAllUsers(subject, htmlContent, recipientList);
}

module.exports = notifyAllUsers;