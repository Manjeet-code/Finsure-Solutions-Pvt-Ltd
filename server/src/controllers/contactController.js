import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Submit a contact inquiry
// @route   POST /api/contact
// @access  Public
export const submitContactInquiry = async (req, res) => {
  try {
    const { name, email, phone, inquiryType, message } = req.body;

    if (!name || !email || !message) {
      return sendError(res, 'Name, email, and message are required fields', 400);
    }

    const inquiryId = `FS-INQ-${Math.floor(100000 + Math.random() * 900000)}`;

    console.log(`[Contact Inquiry Received] ID: ${inquiryId} | From: ${name} (${email}) | Type: ${inquiryType || 'General'}`);

    return sendSuccess(
      res,
      {
        inquiryId,
        receivedAt: new Date().toISOString(),
        status: 'RECEIVED',
      },
      'Thank you for contacting FinSure! Your message has been submitted successfully.'
    );
  } catch (error) {
    console.error('Contact inquiry error:', error);
    return sendError(res, 'Failed to submit inquiry. Please try again.', 500);
  }
};
