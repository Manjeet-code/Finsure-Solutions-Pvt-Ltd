import User from '../models/User.js';
import Branch from '../models/Branch.js';
import LoanApplication from '../models/LoanApplication.js';
import EMISchedule from '../models/EMISchedule.js';
import Payment from '../models/Payment.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get Platform-wide Real Data Analytics Summary (Phase 11 Engine)
// @route   GET /api/analytics/platform-summary
// @access  Private/Admin
export const getPlatformAnalytics = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'Citizen' });
    const totalManagers = await User.countDocuments({ role: { $in: ['Branch Manager', 'BRANCH_MANAGER'] } });
    const totalBranches = await Branch.countDocuments();
    
    const totalApplications = await LoanApplication.countDocuments();
    const approvedCount = await LoanApplication.countDocuments({ status: { $in: ['Approved', 'SANCTIONED', 'Disbursed'] } });
    const rejectedCount = await LoanApplication.countDocuments({ status: 'Rejected' });
    const pendingCount = await LoanApplication.countDocuments({ status: { $in: ['Submitted', 'Pending', 'DOCS_REQUESTED', 'Verified'] } });

    const approvalRate = totalApplications > 0 ? ((approvedCount / totalApplications) * 100).toFixed(1) : 0;

    // Disbursed amount aggregation
    const disbursedAgg = await LoanApplication.aggregate([
      { $match: { status: 'Disbursed' } },
      { $group: { _id: null, total: { $sum: { $ifNull: ['$approvedAmount', '$amount'] } } } },
    ]);
    const totalDisbursedAmount = disbursedAgg.length > 0 ? disbursedAgg[0].total : 0;

    // Overdue EMIs aggregation
    const overdueCount = await EMISchedule.countDocuments({ status: 'OVERDUE' });
    const overdueAgg = await EMISchedule.aggregate([
      { $match: { status: 'OVERDUE' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalOverdueAmount = overdueAgg.length > 0 ? overdueAgg[0].total : 0;

    // Recent 5 applications
    const recentApplications = await LoanApplication.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('citizenId', 'name email')
      .populate('branchId', 'branchName city');

    return sendSuccess(res, {
      totalUsers,
      totalManagers,
      totalBranches,
      totalApplications,
      approvedCount,
      rejectedCount,
      pendingCount,
      approvalRate: Number(approvalRate),
      totalDisbursedAmount,
      overdueCount,
      totalOverdueAmount,
      recentApplications,
    }, 'Platform analytics summary fetched successfully');
  } catch (error) {
    console.error('Get platform analytics error:', error);
    return sendError(res, 'Failed to fetch platform analytics', 500);
  }
};

// @desc    Get Branch-wise Performance Matrix (Phase 11 Engine)
// @route   GET /api/analytics/branch-matrix
// @access  Private/Admin
export const getBranchPerformanceMatrix = async (req, res) => {
  try {
    const branches = await Branch.find().populate('managerId', 'name email phone status');

    const matrix = await Promise.all(
      branches.map(async (b) => {
        const total = await LoanApplication.countDocuments({ branchId: b._id });
        const approved = await LoanApplication.countDocuments({ branchId: b._id, status: { $in: ['Approved', 'SANCTIONED', 'Disbursed'] } });
        const rejected = await LoanApplication.countDocuments({ branchId: b._id, status: 'Rejected' });
        const pending = await LoanApplication.countDocuments({ branchId: b._id, status: { $in: ['Submitted', 'Pending', 'DOCS_REQUESTED', 'Verified'] } });
        const disbursed = await LoanApplication.countDocuments({ branchId: b._id, status: 'Disbursed' });

        const disbAgg = await LoanApplication.aggregate([
          { $match: { branchId: b._id, status: 'Disbursed' } },
          { $group: { _id: null, total: { $sum: { $ifNull: ['$approvedAmount', '$amount'] } } } },
        ]);
        const disbursedVol = disbAgg.length > 0 ? disbAgg[0].total : 0;

        const rate = total > 0 ? ((approved / total) * 100).toFixed(1) : 0;

        // Calculate Average Turnaround Time (in Days) for decided applications
        const decidedApps = await LoanApplication.find({
          branchId: b._id,
          status: { $in: ['Approved', 'SANCTIONED', 'Disbursed', 'Rejected'] }
        });

        let avgTurnaroundDays = 1.5; // default benchmark
        if (decidedApps.length > 0) {
          const totalHours = decidedApps.reduce((acc, app) => {
            const created = new Date(app.createdAt).getTime();
            const updated = new Date(app.updatedAt).getTime();
            const diffHours = Math.max(1, (updated - created) / (1000 * 60 * 60));
            return acc + diffHours;
          }, 0);
          avgTurnaroundDays = Number((totalHours / decidedApps.length / 24).toFixed(1));
          if (avgTurnaroundDays === 0) avgTurnaroundDays = 0.5;
        }

        return {
          _id: b._id,
          branchName: b.branchName,
          branchCode: b.branchCode,
          city: b.city,
          managerName: b.managerId ? b.managerId.name : 'Unassigned',
          managerEmail: b.managerId ? b.managerId.email : 'N/A',
          managerStatus: b.managerId ? b.managerId.status : 'N/A',
          totalApplications: total,
          approvedCount: approved,
          rejectedCount: rejected,
          pendingCount: pending,
          disbursedCount: disbursed,
          disbursedVolume: disbursedVol,
          approvalRate: Number(rate),
          avgTurnaroundDays,
        };
      })
    );

    return sendSuccess(res, matrix, 'Branch performance matrix fetched successfully');
  } catch (error) {
    console.error('Get branch matrix error:', error);
    return sendError(res, 'Failed to fetch branch matrix', 500);
  }
};

// @desc    Get Branch Drill-Down Applications & Document Status (Level 2 -> Level 3 -> Level 4)
// @route   GET /api/analytics/drilldown/branch/:branchId
// @access  Private/Admin
export const getBranchDrilldownDetails = async (req, res) => {
  try {
    const branchId = req.params.branchId;
    const branch = await Branch.findById(branchId).populate('managerId', 'name email phone status');

    if (!branch) {
      return sendError(res, 'Branch not found', 404);
    }

    const applications = await LoanApplication.find({ branchId })
      .populate('loanProductId', 'name productCode interestRate')
      .populate('citizenId', 'name email phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, {
      branch,
      applications,
    }, 'Branch drill-down details fetched successfully');
  } catch (error) {
    console.error('Branch drilldown error:', error);
    return sendError(res, 'Failed to fetch branch drilldown details', 500);
  }
};

// @desc    Get Admin Dashboard Stats (Legacy Compatibility)
// @route   GET /api/analytics/admin
// @access  Private/Admin
export const getAdminStats = async (req, res) => {
  return getPlatformAnalytics(req, res);
};

// @desc    Get Branch Manager Dashboard Stats
// @route   GET /api/analytics/manager
// @access  Private/Manager
export const getManagerStats = async (req, res) => {
  try {
    const branchId = req.user.branchId;

    const todaysApplications = await LoanApplication.countDocuments({
      branchId,
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const pendingVerification = await LoanApplication.countDocuments({
      branchId,
      status: { $in: ['Submitted', 'Pending', 'DOCS_REQUESTED'] },
    });

    const approvedToday = await LoanApplication.countDocuments({
      branchId,
      status: { $in: ['Approved', 'SANCTIONED', 'Disbursed'] },
      updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    const rejectedToday = await LoanApplication.countDocuments({
      branchId,
      status: 'Rejected',
      updatedAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    });

    res.json({
      todaysApplications,
      pendingVerification,
      approvedToday,
      rejectedToday,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

