const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env.development') });
const { sendEmail } = require('./utils/email');

(async () => {
  try {
    const to = process.env.EMAIL_USER;
    console.log('Sending test email to', to);
    const ok = await sendEmail(to, 'VideoStore Backend Test Email', '<p>This is a test email from VideoStore backend.</p>');
    console.log('sendEmail returned', ok);
  } catch (err) {
    console.error('Test send error:', err);
  }
})();
