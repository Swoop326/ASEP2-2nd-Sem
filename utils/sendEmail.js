const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (subject, htmlContent, recipientList) => {
  try {
    if (!recipientList || recipientList.length === 0) {
      console.log('No recipients to send email to.');
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
      to: recipientList, // Can be a single email or array
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