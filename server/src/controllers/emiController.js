import EMISchedule from '../models/EMISchedule.js';
import LoanApplication from '../models/LoanApplication.js';
import AuditLog from '../models/AuditLog.js';
import { dispatchNotification } from '../utils/notificationDispatcher.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// Helper function to auto-generate EMI schedule installments upon loan disbursal
export const generateEmiScheduleForLoan = async (loanApplicationId) => {
  try {
    const loan = await LoanApplication.findById(loanApplicationId).populate('loanProductId');
    if (!loan) return false;

    // Check if schedule already generated
    const existingCount = await EMISchedule.countDocuments({ loanApplicationId: loan._id });
    if (existingCount > 0) return true;

    const principal = loan.approvedAmount || loan.amount || 250000;
    const tenureMonths = loan.approvedTenureMonths || loan.tenureMonths || 24;
    const annualRate = loan.loanProductId?.interestRate || 10.5;

    const monthlyRate = annualRate / (12 * 100);
    const emiAmount = Math.round(
      (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
        (Math.pow(1 + monthlyRate, tenureMonths) - 1)
    );

    let remaining = principal;
    const installments = [];
    const startDate = new Date();

    for (let i = 1; i <= tenureMonths; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDate.setDate(5); // Due on 5th of each month

      const interestComp = Math.round(remaining * monthlyRate);
      const principalComp = Math.min(remaining, emiAmount - interestComp);
      remaining = Math.max(0, remaining - principalComp);

      // Determine initial status based on due date
      const isPast = dueDate < new Date();
      const initialStatus = isPast ? 'OVERDUE' : 'PENDING';

      installments.push({
        loanApplicationId: loan._id,
        citizenId: loan.citizenId,
        branchId: loan.branchId,
        installmentNumber: i,
        dueDate,
        amount: emiAmount,
        principalComponent: principalComp,
        interestComponent: interestComp,
        remainingBalance: remaining,
        status: initialStatus,
      });
    }

    await EMISchedule.insertMany(installments);
    console.log(`[EMI ENGINE] Auto-generated ${installments.length} installments for Loan ${loan.applicationId}`);
    return true;
  } catch (err) {
    console.error('Error generating EMI schedule:', err);
    return false;
  }
};

// @desc    Get logged-in user's EMI schedules and repayment stats
// @route   GET /api/emi/my-schedule
// @access  Private (USER)
export const getMyEmiSchedule = async (req, res) => {
  try {
    // Auto-update overdue statuses for past due dates
    await EMISchedule.updateMany(
      { citizenId: req.user._id, status: 'PENDING', dueDate: { $lt: new Date() } },
      { $set: { status: 'OVERDUE' } }
    );

    const userLoans = await LoanApplication.find({
      citizenId: req.user._id,
      status: { $in: ['Disbursed', 'SANCTIONED', 'Approved'] },
    }).populate('loanProductId', 'name productCode interestRate');

    const allSchedules = await EMISchedule.find({ citizenId: req.user._id })
      .populate('loanApplicationId')
      .sort({ dueDate: 1 });

    const totalDisbursed = userLoans.reduce((sum, l) => sum + (l.approvedAmount || l.amount || 0), 0);
    const paidInstallments = allSchedules.filter((s) => s.status === 'PAID');
    const totalPaid = paidInstallments.reduce((sum, s) => sum + s.amount, 0);
    const overdueInstallments = allSchedules.filter((s) => s.status === 'OVERDUE');
    const pendingInstallments = allSchedules.filter((s) => s.status === 'PENDING');

    const nextUpcoming = pendingInstallments[0] || overdueInstallments[0] || null;

    return sendSuccess(res, {
      summary: {
        totalDisbursed,
        totalPaid,
        remainingBalance: Math.max(0, totalDisbursed - totalPaid),
        totalInstallments: allSchedules.length,
        paidCount: paidInstallments.length,
        overdueCount: overdueInstallments.length,
        pendingCount: pendingInstallments.length,
        nextDueDate: nextUpcoming ? nextUpcoming.dueDate : null,
        nextEmiAmount: nextUpcoming ? nextUpcoming.amount : 0,
      },
      loans: userLoans,
      schedules: allSchedules,
    }, 'My EMI schedule fetched successfully');
  } catch (error) {
    console.error('Get my EMI schedule error:', error);
    return sendError(res, 'Failed to fetch EMI schedule', 500);
  }
};

// @desc    Get EMI schedule breakdown by Loan ID
// @route   GET /api/emi/loan/:loanId
// @access  Private
export const getEmiScheduleByLoanId = async (req, res) => {
  try {
    const loanId = req.params.loanId;
    let schedules = await EMISchedule.find({ loanApplicationId: loanId }).sort({ installmentNumber: 1 });

    // If no schedule generated yet, generate now
    if (schedules.length === 0) {
      await generateEmiScheduleForLoan(loanId);
      schedules = await EMISchedule.find({ loanApplicationId: loanId }).sort({ installmentNumber: 1 });
    }

    return sendSuccess(res, schedules, 'Loan EMI schedule breakdown fetched successfully');
  } catch (error) {
    console.error('Get EMI schedule by loan error:', error);
    return sendError(res, 'Failed to fetch loan EMI schedule', 500);
  }
};

// @desc    Pay single EMI installment
// @route   POST /api/emi/pay/:emiId
// @access  Private (USER)
export const payEmiInstallment = async (req, res) => {
  try {
    const { paymentMethod, transactionRef } = req.body;
    const emi = await EMISchedule.findById(req.params.emiId);

    if (!emi) {
      return sendError(res, 'EMI installment record not found', 404);
    }

    if (emi.citizenId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return sendError(res, 'Not authorized to pay this installment', 403);
    }

    if (emi.status === 'PAID') {
      return sendError(res, 'This installment has already been paid', 400);
    }

    const txRef = transactionRef || `PAY-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    emi.status = 'PAID';
    emi.paidAt = new Date();
    emi.paymentTransactionRef = txRef;
    emi.paymentMethod = paymentMethod || 'Net Banking';
    await emi.save();

    // Log Audit Event
    await AuditLog.create({
      applicationId: emi.loanApplicationId,
      action: 'EMI_PAID',
      performedBy: req.user._id,
      performedByName: req.user.name || req.user.email,
      performedByRole: req.user.role,
      previousStatus: 'PENDING',
      newStatus: 'PAID',
      remarks: `Installment #${emi.installmentNumber} of ₹${emi.amount} paid via ${emi.paymentMethod} (Ref: ${txRef})`,
    });

    await dispatchNotification({
      recipientId: emi.citizenId,
      recipientRole: 'Citizen',
      title: 'EMI Payment Confirmed',
      message: `Installment #${emi.installmentNumber} payment of ₹${Number(emi.amount).toLocaleString('en-IN')} confirmed. Ref: ${txRef}.`,
      type: 'SUCCESS',
      category: 'EMI',
      link: '/repayment',
    });

    return sendSuccess(res, emi, `Installment #${emi.installmentNumber} paid successfully! Ref: ${txRef}`);
  } catch (error) {
    console.error('Pay EMI error:', error);
    return sendError(res, 'Failed to process EMI payment', 500);
  }
};

// @desc    Get Overdue EMIs Report (Branch Manager / Admin view)
// @route   GET /api/emi/overdue-report
// @access  Private (BRANCH_MANAGER, ADMIN)
export const getOverdueEmiReport = async (req, res) => {
  try {
    // Auto update overdue status
    await EMISchedule.updateMany(
      { status: 'PENDING', dueDate: { $lt: new Date() } },
      { $set: { status: 'OVERDUE' } }
    );

    let query = { status: 'OVERDUE' };

    if (req.user.role === 'Branch Manager') {
      if (req.user.branchId) {
        query.branchId = req.user.branchId;
      }
    }

    const overdueList = await EMISchedule.find(query)
      .populate('citizenId', 'name email phone')
      .populate('loanApplicationId', 'applicationId amount approvedAmount status')
      .populate('branchId', 'branchName branchCode city')
      .sort({ dueDate: 1 });

    const totalOverdueAmount = overdueList.reduce((sum, item) => sum + item.amount, 0);

    return sendSuccess(res, {
      count: overdueList.length,
      totalOverdueAmount,
      overdueInstallments: overdueList,
    }, 'Overdue EMI report fetched successfully');
  } catch (error) {
    console.error('Get overdue report error:', error);
    return sendError(res, 'Failed to fetch overdue EMI report', 500);
  }
};
