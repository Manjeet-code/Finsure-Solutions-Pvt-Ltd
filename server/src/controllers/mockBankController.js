import LoanApplication from '../models/LoanApplication.js';
import Payment from '../models/Payment.js';
import EMISchedule from '../models/EMISchedule.js';
import AuditLog from '../models/AuditLog.js';
import { generateEmiScheduleForLoan } from './emiController.js';
import { dispatchNotification } from '../utils/notificationDispatcher.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

/**
 * @desc    Simulated Core Banking Disbursal Gateway (Phase 13 Engine)
 * @route   POST /api/payments/mock-bank-disburse
 * @access  Private (BRANCH_MANAGER, ADMIN)
 */
export const mockBankDisburse = async (req, res) => {
  try {
    const { applicationId, bankName, accountNumber, ifscCode, accountHolderName, disburseAmount } = req.body;

    if (!applicationId || !accountNumber || !ifscCode || !accountHolderName) {
      return sendError(res, 'Missing required beneficiary account details or IFSC code', 400);
    }

    const application = await LoanApplication.findById(applicationId)
      .populate('loanProductId')
      .populate('citizenId');

    if (!application) {
      return sendError(res, 'Loan application not found', 404);
    }

    if (application.status === 'Disbursed') {
      return sendError(res, 'Loan application is already disbursed', 400);
    }

    // 1. Simulate Core Banking Gateway Processing Latency & Verification
    const transactionId = `TXN_BANK_${Date.now().toString().slice(-8)}${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentRefNumber = `BANK-REF-${Math.floor(100000 + Math.random() * 900000)}`;
    const amountToDisburse = Number(disburseAmount || application.approvedAmount || application.amount);

    const gatewayResponse = {
      gateway: 'MOCK FINTECH BANK GATEWAY SERVICE (NEFT/RTGS)',
      transactionId,
      paymentRefNumber,
      status: 'SUCCESS',
      bankResponseCode: '200_SETTLED',
      settledAt: new Date().toISOString(),
      amountDisbursed: amountToDisburse,
      beneficiary: {
        accountHolderName,
        accountNumber,
        ifscCode,
        bankName: bankName || 'State Bank of India',
      },
    };

    // 2. Database Synchronization
    application.status = 'Disbursed';
    application.disbursementRefNumber = transactionId;
    application.disbursementAccountDetails = gatewayResponse.beneficiary;
    await application.save();

    // 3. Create Payment Record
    const paymentRecord = await Payment.create({
      loanId: application._id,
      amount: amountToDisburse,
      paymentMethod: 'Net Banking',
      transactionId,
      status: 'Success',
    });

    // 4. Auto-generate EMI Schedule Engine
    await generateEmiScheduleForLoan(application);

    // 5. Audit Log Event
    await AuditLog.create({
      applicationId: application._id,
      action: 'MOCK_BANK_DISBURSEMENT_SUCCESS',
      performedBy: req.user._id,
      performedByName: req.user.name || req.user.email,
      performedByRole: req.user.role,
      previousStatus: 'SANCTIONED',
      newStatus: 'Disbursed',
      remarks: `Mock Bank Disbursal executed successfully via NEFT. Transaction ID: ${transactionId}`,
      details: gatewayResponse,
    });

    // 6. Dispatch Notification
    await dispatchNotification({
      recipientId: application.citizenId._id || application.citizenId,
      type: 'LOAN_DISBURSED',
      title: '💰 Loan Amount Disbursed to Your Bank Account',
      message: `Your sanctioned loan amount of ₹${amountToDisburse.toLocaleString('en-IN')} has been transferred to account ${accountNumber.slice(-4)}. Transaction ID: ${transactionId}`,
      relatedApplicationId: application._id,
    });

    return sendSuccess(res, {
      application,
      payment: paymentRecord,
      gatewayResponse,
    }, 'Mock bank disbursal executed & database synchronized successfully');
  } catch (error) {
    console.error('Mock bank disburse error:', error);
    return sendError(res, 'Mock bank disbursal execution failed', 500);
  }
};

/**
 * @desc    Simulated EMI Repayment Payment Gateway (Phase 13 Engine)
 * @route   POST /api/payments/mock-repayment
 * @access  Private (USER, BRANCH_MANAGER, ADMIN)
 */
export const mockRepayment = async (req, res) => {
  try {
    const { emiScheduleId, paymentMethod, upiId, cardNumber, netBankingBank, amount } = req.body;

    if (!emiScheduleId) {
      return sendError(res, 'EMI installment ID is required', 400);
    }

    const emi = await EMISchedule.findById(emiScheduleId).populate('applicationId');
    if (!emi) {
      return sendError(res, 'EMI schedule record not found', 404);
    }

    if (emi.status === 'PAID') {
      return sendError(res, 'This EMI installment is already paid', 400);
    }

    // 1. Simulate Gateway Response
    const txnId = `UPI_PAY_${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
    const gatewayRes = {
      gateway: 'MOCK FINSURE PAYMENT GATEWAY (UPI/CARDS/NETBANKING)',
      paymentMethod: paymentMethod || 'UPI',
      upiId: upiId || 'citizen@upi',
      transactionId: txnId,
      status: 'SUCCESS',
      gatewayResponseCode: 'PAYMENT_SUCCESS_200',
      paidAt: new Date().toISOString(),
      amountPaid: Number(amount || emi.totalInstallmentAmount),
    };

    // 2. Synchronize EMI Schedule
    emi.status = 'PAID';
    emi.paidAt = new Date();
    emi.paymentRefNumber = txnId;
    await emi.save();

    // 3. Create Payment Record
    const payment = await Payment.create({
      loanId: emi.applicationId._id || emi.applicationId,
      amount: emi.totalInstallmentAmount,
      paymentMethod: paymentMethod === 'CARD' ? 'Card' : paymentMethod === 'NET_BANKING' ? 'Net Banking' : 'UPI',
      transactionId: txnId,
      status: 'Success',
    });

    // 4. Audit Log & Notification
    await AuditLog.create({
      applicationId: emi.applicationId._id || emi.applicationId,
      action: 'EMI_PAYMENT_SUCCESS',
      performedBy: req.user._id,
      performedByName: req.user.name || req.user.email,
      performedByRole: req.user.role,
      previousStatus: 'OVERDUE',
      newStatus: 'PAID',
      remarks: `EMI Installment #${emi.installmentNumber} paid via Mock ${paymentMethod}. Transaction ID: ${txnId}`,
      details: gatewayRes,
    });

    await dispatchNotification({
      recipientId: req.user._id,
      type: 'EMI_PAID',
      title: '✅ EMI Repayment Confirmed',
      message: `Your payment of ₹${emi.totalInstallmentAmount.toLocaleString('en-IN')} for Installment #${emi.installmentNumber} was successful. Transaction ID: ${txnId}`,
      relatedApplicationId: emi.applicationId._id,
    });

    return sendSuccess(res, {
      emi,
      payment,
      gatewayRes,
    }, 'EMI payment processed and ledger updated');
  } catch (error) {
    console.error('Mock repayment error:', error);
    return sendError(res, 'Mock repayment processing failed', 500);
  }
};
