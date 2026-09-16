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
  if (!toEmail) return { success: false, error: 'Email kosong' };
  
  const mailOptions = {
    from: `"Admin KKN Vidya Vardhana" <${EMAIL_USER}>`,
    to: toEmail,
    subject: 'Selamat! Akun Anda Telah Disetujui (ACC) 🎉',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #0f172a; text-align: center;">Halo ${username}!</h2>
        <p style="color: #333; font-size: 16px;">
          Kabar gembira! Akun Anda untuk platform <strong>Web KKN Vidya Vardhana</strong> telah disetujui (Di-ACC) oleh Administrator.
        </p>
        <p style="color: #333; font-size: 16px;">
          Anda sekarang memiliki akses penuh untuk masuk ke dalam sistem dan berpartisipasi dalam publikasi artikel maupun modul program kerja kita.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://vidyavardhana.my.id/login" style="background-color: #0f172a; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login ke Dashboard</a>
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
    return { success: true };
  } catch (error) {
    console.error('Gagal mengirim email:', error);
    return { success: false, error: error.message || error.toString() };
  }
};

const sendRejectionEmail = async (toEmail, username) => {
  if (!toEmail) return { success: false, error: 'Email kosong' };
  
  const mailOptions = {
    from: `"Admin KKN Vidya Vardhana" <${EMAIL_USER}>`,
    to: toEmail,
    subject: 'Pemberitahuan Status Akun KKN Vidya Vardhana',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #b91c1c; text-align: center;">Halo ${username}</h2>
        <p style="color: #333; font-size: 16px;">
          Mohon maaf, pendaftaran akun Anda untuk platform <strong>Web KKN Vidya Vardhana</strong> saat ini <strong style="color:#b91c1c;">ditolak</strong> oleh Administrator.
        </p>
        <p style="color: #333; font-size: 16px;">
          Hal ini mungkin dikarenakan data yang Anda masukkan tidak sesuai, atau Anda bukan merupakan anggota yang terdaftar pada Kelompok 7 KKN Vidya Vardhana.
        </p>
        <p style="color: #333; font-size: 16px;">
          Jika Anda merasa ini adalah sebuah kesalahan, silakan hubungi Administrator secara langsung.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #777; font-size: 12px; text-align: center;">
          Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Gagal mengirim email penolakan:', error);
    return { success: false, error: error.message || error.toString() };
  }
};

const sendAdminNotificationEmail = async (newUsername, newUserEmail) => {
  const mailOptions = {
    from: `"Sistem Web KKN" <${EMAIL_USER}>`,
    to: EMAIL_USER, // Send to the admin's email itself
    subject: `Notifikasi: Ada Pendaftar Baru (${newUsername})!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px; background-color: #f9fafb;">
        <h2 style="color: #0b2e59; text-align: center;">Notifikasi Pendaftar Baru</h2>
        <p style="color: #333; font-size: 16px;">
          Halo Admin! Ada pengguna baru yang baru saja mendaftar di Web KKN Vidya Vardhana dan sedang <strong>menunggu persetujuan (ACC)</strong> Anda.
        </p>
        <div style="background-color: #fff; padding: 15px; border: 1px solid #e5e7eb; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 5px 0;"><strong>Username:</strong> ${newUsername}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${newUserEmail}</p>
          <p style="margin: 5px 0;"><strong>Waktu Daftar:</strong> ${new Date().toLocaleString('id-ID')}</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="https://vidyavardhana.my.id/login" style="background-color: #eab308; color: #0b2e59; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Buka Dashboard Admin</a>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Gagal mengirim email notifikasi ke admin:', error);
    return { success: false, error: error.message || error.toString() };
  }
};

const sendSuspendedEmail = async (toEmail, username) => {
  if (!toEmail) return { success: false, error: 'Email kosong' };
  
  const mailOptions = {
    from: `"Admin KKN Vidya Vardhana" <${EMAIL_USER}>`,
    to: toEmail,
    subject: 'Peringatan: Akun KKN Vidya Vardhana Anda Telah Dibekukan',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #ea580c; text-align: center;">Halo ${username}</h2>
        <p style="color: #333; font-size: 16px;">
          Kami menginformasikan bahwa akun Anda pada platform <strong>Web KKN Vidya Vardhana</strong> saat ini <strong style="color:#ea580c;">DIBEKUKAN / DINONAKTIFKAN</strong> oleh Administrator.
        </p>
        <p style="color: #333; font-size: 16px;">
          Anda tidak akan dapat melakukan login atau aktivitas apapun di dalam web hingga status Anda diaktifkan kembali.
        </p>
        <p style="color: #333; font-size: 16px; font-weight: bold;">
          Silakan hubungi Administrator (atau hubungi nomor admin KKN) untuk meminta penjelasan atau memulihkan akun Anda.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #777; font-size: 12px; text-align: center;">
          Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Gagal mengirim email pembekuan:', error);
    return { success: false, error: error.message || error.toString() };
  }
};

const sendDeletedEmail = async (toEmail, username) => {
  if (!toEmail) return { success: false, error: 'Email kosong' };
  
  const mailOptions = {
    from: `"Admin KKN Vidya Vardhana" <${EMAIL_USER}>`,
    to: toEmail,
    subject: 'Pemberitahuan: Akun KKN Vidya Vardhana Anda Telah Dihapus',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 10px;">
        <h2 style="color: #b91c1c; text-align: center;">Halo ${username}</h2>
        <p style="color: #333; font-size: 16px;">
          Sistem kami mencatat bahwa akun Anda pada platform <strong>Web KKN Vidya Vardhana</strong> telah <strong style="color:#b91c1c;">DIHAPUS SECARA PERMANEN</strong> oleh Administrator.
        </p>
        <p style="color: #333; font-size: 16px;">
          Semua data yang terkait dengan akun Anda kemungkinan telah dihapus dari sistem atau di-nonaktifkan. Anda tidak dapat lagi menggunakan email atau username tersebut untuk masuk.
        </p>
        <p style="color: #333; font-size: 16px; font-weight: bold;">
          Jika Anda merasa ini adalah kesalahan, silakan segera hubungi nomor Administrator.
        </p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="color: #777; font-size: 12px; text-align: center;">
          Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
        </p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error('Gagal mengirim email penghapusan:', error);
    return { success: false, error: error.message || error.toString() };
  }
};

module.exports = { 
  sendWelcomeEmail, 
  sendRejectionEmail, 
  sendAdminNotificationEmail,
  sendSuspendedEmail,
  sendDeletedEmail
};
