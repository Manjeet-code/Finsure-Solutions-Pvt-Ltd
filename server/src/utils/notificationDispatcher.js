import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const dispatchNotification = async ({
  recipientId,
  recipientRole = 'Citizen',
  title,
  message,
  type = 'INFO',
  category = 'APPLICATION',
  link = '',
}) => {
  try {
    if (!recipientId || !title || !message) return null;

    // 1. Save In-App Notification to MongoDB
    const notification = await Notification.create({
      recipientId,
      recipientRole,
      title,
      message,
      type,
      category,
      link,
      read: false,
    });

    // 2. Fetch Recipient Details for Email/SMS Dispatch
    const recipient = await User.findById(recipientId).select('name email phone');

    if (recipient) {
      // 3. Simulated Email Dispatch Log
      console.log(`\n==================================================`);
      console.log(`[EMAIL DISPATCH] 📧 FinSure Automated Mailer System`);
      console.log(`To: ${recipient.name} <${recipient.email}>`);
      console.log(`Subject: FinSure Alert - ${title}`);
      console.log(`Body: Dear ${recipient.name},\n${message}\nLog in to portal: http://localhost:5173${link}`);
      console.log(`==================================================\n`);

      // 4. Simulated SMS Dispatch Log
      if (recipient.phone) {
        console.log(`[SMS DISPATCH] 📱 FinSure Gateway`);
        console.log(`To: ${recipient.phone} | ${title}: ${message.slice(0, 100)}...\n`);
      }
    }

    return notification;
  } catch (error) {
    console.error('[NOTIFICATION DISPATCHER ERROR]:', error);
    return null;
  }
};
