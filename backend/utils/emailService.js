const nodemailer = require('nodemailer');

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  return transporter;
}

async function sendEmail({ email, subject, message }) {
  const mailOptions = {
    from: `Marwadi Connect Pro <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; color: #111; line-height: 1.5;">
        ${message}
        <hr style="margin:16px 0;border:none;border-top:1px solid #eee;" />
        <p style="font-size:12px;color:#666;">This is an automated message from Marwadi Connect Pro.</p>
      </div>
    `
  };

  try {
    await getTransporter().sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Email send error:', error.message);
    throw error;
  }
}

module.exports = { sendEmail };



