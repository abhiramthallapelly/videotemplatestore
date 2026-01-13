const nodemailer = require('nodemailer');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env.development') });

(async () => {
  try {
    console.log('Using EMAIL_USER=', process.env.EMAIL_USER);
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
    });
    const info = await transporter.sendMail({
      from: `"VideoStore Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: 'Direct SMTP test',
      text: 'Direct test',
      html: '<p>Direct test</p>'
    });
    console.log('Sent:', info.messageId);
  } catch (err) {
    console.error('Send error:', err && (err.message || err));
  }
})();
