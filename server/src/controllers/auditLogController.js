import AuditLog from '../models/AuditLog.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get master system audit logs (Phase 12 Engine)
// @route   GET /api/audit-logs
// @access  Private (ADMIN, BRANCH_MANAGER)
export const getAuditLogs = async (req, res) => {
  try {
    const { action, role, search, page = 1, limit = 50 } = req.query;

    let query = {};

    if (action && action !== 'ALL') {
      query.action = action;
    }

    if (role && role !== 'ALL') {
      query.performedByRole = new RegExp(`^${role}$`, 'i');
    }

    if (search) {
      query.$or = [
        { performedByName: new RegExp(search, 'i') },
        { remarks: new RegExp(search, 'i') },
        { action: new RegExp(search, 'i') },
      ];
    }

    // Role-based security scoping: Branch Manager only sees logs for their branch or actions
    if (req.user.role === 'Branch Manager' || req.user.role === 'BRANCH_MANAGER') {
      query.performedBy = req.user._id;
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const totalLogs = await AuditLog.countDocuments(query);

    const logs = await AuditLog.find(query)
      .populate('applicationId', 'applicationId status amount applicantDetails')
      .populate('performedBy', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    return sendSuccess(res, {
      logs,
      pagination: {
        total: totalLogs,
        page: pageNum,
        pages: Math.ceil(totalLogs / limitNum) || 1,
      },
    }, 'Audit logs fetched successfully');
  } catch (error) {
    console.error('Get audit logs error:', error);
    return sendError(res, 'Failed to fetch system audit logs', 500);
  }
};
