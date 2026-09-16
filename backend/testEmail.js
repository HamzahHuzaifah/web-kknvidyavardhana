const { sendWelcomeEmail } = require('./utils/email'); sendWelcomeEmail('kikikoko0154@gmail.com', 'kikikoko0154').then(() => console.log('Success')).catch(err => console.error('Error:', err));
