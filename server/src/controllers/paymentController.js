import Payment from '../models/Payment.js';
import LoanApplication from '../models/LoanApplication.js';

// @desc    Process EMI Payment (Mock)
// @route   POST /api/payments
// @access  Private (Citizen)
export const processPayment = async (req, res) => {
  const { loanId, amount, paymentMethod } = req.body;

  try {
    const loan = await LoanApplication.findById(loanId);
    
    if (!loan) {
      return res.status(404).json({ message: 'Loan application not found' });
    }

    // Mock payment gateway delay
    // In a real scenario, this would call Razorpay, Stripe, etc.
    const transactionId = `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = await Payment.create({
      loanId,
      amount,
      paymentMethod,
      transactionId,
      status: 'Success',
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user's payment history
// @route   GET /api/payments/myhistory
// @access  Private (Citizen)
export const getMyPayments = async (req, res) => {
  try {
    // Find loans belonging to user
    const loans = await LoanApplication.find({ citizenId: req.user._id });
    const loanIds = loans.map(loan => loan._id);

    // Find payments for those loans
    const payments = await Payment.find({ loanId: { $in: loanIds } }).populate('loanId');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
