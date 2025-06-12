// utils/sendEmail.js
const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (subject, htmlContent) => {
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Lost & Found" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // You can customize recipient here
      subject,
      html: htmlContent,
    };

    await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully');
  } catch (err) {
    console.error('❌ Error sending email:', err);
  }
};

module.exports = sendEmail;
