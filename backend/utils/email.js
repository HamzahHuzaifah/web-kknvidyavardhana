const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'kknvidyavardhana@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS || 'nyvffscwlmhqzhgj';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS, 
  },
});

const sendWelcomeEmail = async (toEmail, username) => {
  if (!toEmail) return false;
  
  const mailOptions = {
    from: `"Admin KKN Vidya Vardhana" <${EMAIL_USER}>`,
    to: toEmail,
    subject: 'Selamat! Akun Anda Telah Disetujui (ACC) 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #0b2e59; text-align: center;">Halo ${username}!</h2>
        <p style="color: #333; font-size: 16px;">
          Kabar gembira! Akun Anda untuk platform <strong>Web KKN Vidya Vardhana</strong> telah disetujui (Di-ACC) oleh Administrator.
        </p>
        <p style="color: #333; font-size: 16px;">
          Anda sekarang memiliki akses penuh untuk masuk ke dalam sistem dan berpartisipasi dalam publikasi artikel maupun modul program kerja kita.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://vidyavardhana.my.id/login" style="background-color: #0b2e59; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Login ke Dashboard</a>
        </div>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #777; font-size: 12px; text-align: center;">
          Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
        </p>
      </div>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email terkirim:', info.response);
    return true;
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return false;
  }
};

module.exports = { sendWelcomeEmail };
