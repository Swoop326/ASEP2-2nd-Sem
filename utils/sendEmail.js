const nodemailer = require('nodemailer');
require('dotenv').config();
const User = require('../models/User'); // Make sure this is your User model

const sendEmailToAllUsers = async (subject, htmlContent) => {
  try {
    // Fetch all user emails from the database
    const users = await User.find({}, 'email');
    const recipientList = users.map(user => user.email);

    if (recipientList.length === 0) {
      console.log('No users to send email to.');
      return;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
      to: recipientList, // Array of all user emails
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent to all users successfully');
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
};

module.exports = sendEmailToAllUsers;