import Branch from '../models/Branch.js';
import User from '../models/User.js';

// @desc    Get all branches with optional search & filtering
// @route   GET /api/branches
// @access  Public / Private
export const getBranches = async (req, res) => {
  try {
    const { search, city, isActive } = req.query;
    let query = {};

    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    if (city) {
      query.city = { $regex: city, $options: 'i' };
    }

    if (search) {
      query.$or = [
        { branchName: { $regex: search, $options: 'i' } },
        { branchCode: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
        { pincodeRanges: { $regex: search, $options: 'i' } },
      ];
    }

    const branches = await Branch.find(query)
      .populate('managerId', 'name email phone role')
      .sort({ createdAt: -1 });

    res.json(branches);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single branch by ID
// @route   GET /api/branches/:id
// @access  Private
export const getBranchById = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id).populate('managerId', 'name email phone role');
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }
    res.json(branch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new branch (Admin)
// @route   POST /api/branches
// @access  Private/Admin
export const createBranch = async (req, res) => {
  const { branchCode, branchName, city, state, address, pincodeRanges, managerId } = req.body;

  try {
    const code = branchCode || `BR-${(city || 'GEN').substring(0, 3).toUpperCase()}-${Math.floor(10 + Math.random() * 90)}`;
    const branchExists = await Branch.findOne({ $or: [{ branchCode: code }, { branchName }] });

    if (branchExists) {
      return res.status(400).json({ message: 'Branch with this code or name already exists' });
    }

    // Process pincode ranges input
    let formattedPincodes = [];
    if (Array.isArray(pincodeRanges)) {
      formattedPincodes = pincodeRanges.map((p) => p.trim());
    } else if (typeof pincodeRanges === 'string') {
      formattedPincodes = pincodeRanges.split(',').map((p) => p.trim()).filter(Boolean);
    }

    const branch = await Branch.create({
      branchCode: code,
      branchName,
      city,
      state: state || 'Uttar Pradesh',
      address,
      pincodeRanges: formattedPincodes,
      managerId: managerId || null,
    });

    // If manager assigned, update manager's branchId
    if (managerId) {
      await User.findByIdAndUpdate(managerId, { branchId: branch._id });
    }

    const populatedBranch = await Branch.findById(branch._id).populate('managerId', 'name email phone');
    res.status(201).json(populatedBranch);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a branch (Admin)
// @route   PUT /api/branches/:id
// @access  Private/Admin
export const updateBranch = async (req, res) => {
  const { branchName, city, state, address, pincodeRanges, managerId, isActive } = req.body;

  try {
    const branch = await Branch.findById(req.params.id);

    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    branch.branchName = branchName || branch.branchName;
    branch.city = city || branch.city;
    branch.state = state || branch.state;
    branch.address = address || branch.address;

    if (isActive !== undefined) {
      branch.isActive = isActive;
    }

    if (pincodeRanges !== undefined) {
      if (Array.isArray(pincodeRanges)) {
        branch.pincodeRanges = pincodeRanges.map((p) => p.trim());
      } else if (typeof pincodeRanges === 'string') {
        branch.pincodeRanges = pincodeRanges.split(',').map((p) => p.trim()).filter(Boolean);
      }
    }

    if (managerId !== undefined && String(managerId) !== String(branch.managerId)) {
      // Unlink previous manager if replaced
      if (branch.managerId) {
        await User.findByIdAndUpdate(branch.managerId, { branchId: null });
      }
      branch.managerId = managerId || null;
      if (managerId) {
        await User.findByIdAndUpdate(managerId, { branchId: branch._id });
      }
    }

    const updatedBranch = await branch.save();
    const populated = await Branch.findById(updatedBranch._id).populate('managerId', 'name email phone');

    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Deactivate / Activate a branch (Admin)
// @route   PUT /api/branches/:id/toggle-status
// @access  Private/Admin
export const toggleBranchStatus = async (req, res) => {
  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    branch.isActive = !branch.isActive;
    await branch.save();

    res.json({
      message: `Branch successfully ${branch.isActive ? 'activated' : 'deactivated'}`,
      branch,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Assign a Branch Manager to Branch (Admin)
// @route   POST /api/branches/:id/assign-manager
// @access  Private/Admin
export const assignBranchManager = async (req, res) => {
  const { managerId } = req.body;

  try {
    const branch = await Branch.findById(req.params.id);
    if (!branch) {
      return res.status(404).json({ message: 'Branch not found' });
    }

    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Branch manager user not found' });
    }

    // Unlink old manager if exists
    if (branch.managerId) {
      await User.findByIdAndUpdate(branch.managerId, { branchId: null });
    }

    branch.managerId = manager._id;
    await branch.save();

    // Link new manager to branch
    manager.branchId = branch._id;
    await manager.save();

    const populated = await Branch.findById(branch._id).populate('managerId', 'name email phone');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
