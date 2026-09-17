const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER || 'kknvidyavardhana@gmail.com';
const EMAIL_PASS = process.env.EMAIL_PASS;

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  requireTLS: true,
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
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 3px solid #0f172a; box-shadow: 8px 8px 0px #0f172a; padding: 30px;">
          <h2 style="color: #0f172a; text-align: center; text-transform: uppercase; font-weight: 900; margin-top: 0; border-bottom: 3px solid #0f172a; padding-bottom: 15px;">Halo ${username}! 🎉</h2>
          <p style="color: #333; font-size: 16px; font-weight: 600; line-height: 1.6;">
            Kabar gembira! Akun Anda untuk platform <strong>Web KKN Vidya Vardhana</strong> telah disetujui (Di-ACC) oleh Administrator.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Anda sekarang memiliki akses penuh untuk masuk ke dalam sistem dan berpartisipasi dalam publikasi artikel maupun modul program kerja kita.
          </p>
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://vidyavardhana.my.id/login" style="background-color: #eab308; color: #0f172a; padding: 14px 28px; text-decoration: none; border: 3px solid #0f172a; box-shadow: 4px 4px 0px #0f172a; font-weight: 800; font-size: 16px; text-transform: uppercase; display: inline-block;">Login ke Dashboard</a>
          </div>
          <hr style="border: 0; border-top: 3px solid #0f172a; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 12px; text-align: center; font-weight: 600;">
            Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
          </p>
        </div>
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
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 3px solid #0f172a; box-shadow: 8px 8px 0px #ef4444; padding: 30px;">
          <h2 style="color: #ef4444; text-align: center; text-transform: uppercase; font-weight: 900; margin-top: 0; border-bottom: 3px solid #0f172a; padding-bottom: 15px;">Halo ${username} ✕</h2>
          <p style="color: #333; font-size: 16px; font-weight: 600; line-height: 1.6;">
            Mohon maaf, pendaftaran akun Anda untuk platform <strong style="color: #0f172a;">Web KKN Vidya Vardhana</strong> saat ini ditolak oleh Administrator.
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Hal ini mungkin dikarenakan data yang Anda masukkan tidak sesuai, atau Anda bukan merupakan anggota yang terdaftar pada Kelompok 7 KKN Vidya Vardhana.
          </p>
          <div style="background-color: #fee2e2; border: 3px solid #ef4444; padding: 15px; margin: 25px 0;">
            <p style="color: #b91c1c; font-size: 15px; margin: 0; font-weight: 700; text-align: center;">
              Jika Anda merasa ini adalah sebuah kesalahan, silakan hubungi Administrator secara langsung.
            </p>
          </div>
          <hr style="border: 0; border-top: 3px solid #0f172a; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 12px; text-align: center; font-weight: 600;">
            Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
          </p>
        </div>
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
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 3px solid #0f172a; box-shadow: 8px 8px 0px #3b82f6; padding: 30px;">
          <h2 style="color: #0f172a; text-align: center; text-transform: uppercase; font-weight: 900; margin-top: 0; border-bottom: 3px solid #0f172a; padding-bottom: 15px;">Pendaftar Baru! 👤</h2>
          <p style="color: #333; font-size: 16px; font-weight: 600; line-height: 1.6;">
            Halo Admin! Ada pengguna baru yang mendaftar di Web KKN Vidya Vardhana dan sedang <span style="background-color: #fef08a; padding: 2px 6px; border: 2px solid #0f172a;">menunggu persetujuan (ACC)</span> Anda.
          </p>
          <div style="background-color: #f8fafc; border: 3px solid #0f172a; padding: 20px; margin: 25px 0;">
            <p style="margin: 5px 0; font-size: 15px; color: #0f172a;"><strong>Username:</strong> ${newUsername}</p>
            <p style="margin: 5px 0; font-size: 15px; color: #0f172a;"><strong>Email:</strong> ${newUserEmail}</p>
            <p style="margin: 5px 0; font-size: 15px; color: #0f172a;"><strong>Waktu Daftar:</strong> ${new Date().toLocaleString('id-ID')}</p>
          </div>
          <div style="text-align: center; margin: 35px 0;">
            <a href="https://vidyavardhana.my.id/login" style="background-color: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border: 3px solid #0f172a; box-shadow: 4px 4px 0px #0f172a; font-weight: 800; font-size: 16px; text-transform: uppercase; display: inline-block;">Buka Dashboard Admin</a>
          </div>
          <hr style="border: 0; border-top: 3px solid #0f172a; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 12px; text-align: center; font-weight: 600;">
            Sistem Notifikasi Web KKN Vidya Vardhana
          </p>
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
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 3px solid #0f172a; box-shadow: 8px 8px 0px #ea580c; padding: 30px;">
          <h2 style="color: #ea580c; text-align: center; text-transform: uppercase; font-weight: 900; margin-top: 0; border-bottom: 3px solid #0f172a; padding-bottom: 15px;">Akun Dibekukan ⚠️</h2>
          <p style="color: #333; font-size: 16px; font-weight: 600; line-height: 1.6;">
            Halo ${username},
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Kami menginformasikan bahwa akun Anda pada platform <strong style="color: #0f172a;">Web KKN Vidya Vardhana</strong> saat ini <span style="background-color: #ffedd5; padding: 2px 6px; border: 2px solid #ea580c; color: #ea580c; font-weight: 700;">DIBEKUKAN / DINONAKTIFKAN</span> oleh Administrator.
          </p>
          <div style="background-color: #fff7ed; border: 3px solid #ea580c; padding: 15px; margin: 25px 0;">
            <p style="color: #9a3412; font-size: 15px; margin: 0; font-weight: 700; text-align: center;">
              Anda tidak akan dapat melakukan login atau aktivitas apapun di dalam web hingga status Anda diaktifkan kembali.
            </p>
          </div>
          <p style="color: #0f172a; font-size: 15px; font-weight: 700; text-align: center;">
            Silakan hubungi Administrator untuk meminta penjelasan atau memulihkan akun Anda.
          </p>
          <hr style="border: 0; border-top: 3px solid #0f172a; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 12px; text-align: center; font-weight: 600;">
            Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
          </p>
        </div>
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
      <div style="font-family: 'Outfit', 'Inter', Arial, sans-serif; background-color: #f8fafc; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 3px solid #0f172a; box-shadow: 8px 8px 0px #0f172a; padding: 30px;">
          <h2 style="background-color: #ef4444; color: #ffffff; padding: 10px; border: 3px solid #0f172a; text-align: center; text-transform: uppercase; font-weight: 900; margin-top: 0; margin-bottom: 25px;">Akun Dihapus 🗑️</h2>
          <p style="color: #333; font-size: 16px; font-weight: 600; line-height: 1.6;">
            Halo ${username},
          </p>
          <p style="color: #333; font-size: 16px; line-height: 1.6;">
            Sistem kami mencatat bahwa akun Anda pada platform <strong style="color: #0f172a;">Web KKN Vidya Vardhana</strong> telah dihapus secara permanen oleh Administrator.
          </p>
          <div style="background-color: #f1f5f9; border: 3px dashed #0f172a; padding: 15px; margin: 25px 0;">
            <p style="color: #334155; font-size: 15px; margin: 0; font-weight: 700; text-align: center;">
              Semua data yang terkait dengan akun Anda kemungkinan telah dihapus dari sistem atau di-nonaktifkan. Anda tidak dapat lagi menggunakan email atau username tersebut untuk masuk.
            </p>
          </div>
          <p style="color: #0f172a; font-size: 15px; font-weight: 700; text-align: center;">
            Jika Anda merasa ini adalah kesalahan, silakan segera hubungi Administrator.
          </p>
          <hr style="border: 0; border-top: 3px solid #0f172a; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 12px; text-align: center; font-weight: 600;">
            Email ini dikirim otomatis oleh sistem. Mohon jangan membalas pesan ini.
          </p>
        </div>
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
