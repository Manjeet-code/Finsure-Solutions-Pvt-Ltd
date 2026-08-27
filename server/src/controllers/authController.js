import User from '../models/User.js';
import Branch from '../models/Branch.js';
import jwt from 'jsonwebtoken';

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res) => {
  const { name, email, phone, password } = req.body;
  const formattedEmail = email ? email.trim().toLowerCase() : '';

  try {
    const userExists = await User.findOne({ email: formattedEmail });

    if (userExists) {
      return res.status(400).json({ message: 'An account with this email address already exists' });
    }

    // Self-registration is strictly restricted to Citizen / USER role
    const user = await User.create({
      name,
      email: formattedEmail,
      phone,
      password,
      role: 'Citizen',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user registration data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  const formattedEmail = email ? email.trim().toLowerCase() : '';

  try {
    const user = await User.findOne({ email: formattedEmail });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'FIRED' || user.isActive === false) {
        return res.status(403).json({ message: `Account terminated/fired. Reason: ${user.firingReason || 'Administrative termination'}` });
      }

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        branchId: user.branchId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId,
        status: user.status,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.phone = req.body.phone || user.phone;
      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        branchId: updatedUser.branchId,
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create Branch Manager Account (Admin action)
// @route   POST /api/auth/create-manager
// @access  Private/Admin
export const createBranchManager = async (req, res) => {
  const { name, email, phone, password, branchId } = req.body;
  const formattedEmail = email ? email.trim().toLowerCase() : '';

  try {
    const userExists = await User.findOne({ email: formattedEmail });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const user = await User.create({
      name,
      email: formattedEmail,
      phone,
      password: password || '123456',
      role: 'Branch Manager',
      branchId: branchId || undefined,
      status: 'ACTIVE',
      isActive: true,
    });

    if (branchId) {
      await Branch.findByIdAndUpdate(branchId, { managerId: user._id });
    }

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      branchId: user.branchId,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all Branch Managers (Admin action)
// @route   GET /api/auth/managers
// @access  Private/Admin
export const getBranchManagersList = async (req, res) => {
  try {
    const managers = await User.find({
      role: { $in: ['Branch Manager', 'BRANCH_MANAGER'] },
    }).populate('branchId', 'branchName branchCode city address');

    res.json(managers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fire / Terminate Branch Manager account with mandatory reason (Admin action)
// @route   POST /api/auth/fire-manager/:id
// @access  Private/Admin
export const fireBranchManager = async (req, res) => {
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return res.status(400).json({ message: 'Mandatory reason for termination is required' });
  }

  try {
    const manager = await User.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: 'Branch Manager user not found' });
    }

    if (manager.role !== 'Branch Manager' && manager.role !== 'BRANCH_MANAGER') {
      return res.status(400).json({ message: 'Target user is not a Branch Manager' });
    }

    manager.status = 'FIRED';
    manager.isActive = false;
    manager.firingReason = reason.trim();
    manager.firedAt = new Date();

    const assignedBranchId = manager.branchId;
    manager.branchId = undefined;

    await manager.save();

    if (assignedBranchId) {
      await Branch.findByIdAndUpdate(assignedBranchId, { $unset: { managerId: 1 } });
    }

    res.json({
      success: true,
      message: `Branch Manager ${manager.name} (${manager.email}) has been terminated & unassigned from branch.`,
      manager: {
        _id: manager._id,
        name: manager.name,
        email: manager.email,
        status: manager.status,
        firingReason: manager.firingReason,
        firedAt: manager.firedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Forgot Password - Request OTP
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const formattedEmail = email ? email.trim().toLowerCase() : '';

  try {
    const user = await User.findOne({ email: formattedEmail });

    if (!user) {
      return res.status(404).json({ message: 'No user registered with this email address' });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    console.log(`[AUTH] Password Reset OTP for ${formattedEmail}: ${otp}`);

    res.json({
      success: true,
      message: 'OTP sent to registered email address',
      otp,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
export const verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const formattedEmail = email ? email.trim().toLowerCase() : '';

  try {
    const user = await User.findOne({
      email: formattedEmail,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    res.json({ success: true, message: 'OTP verified successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  const formattedEmail = email ? email.trim().toLowerCase() : '';

  try {
    const user = await User.findOne({
      email: formattedEmail,
      resetPasswordOTP: otp,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired OTP code' });
    }

    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.json({ success: true, message: 'Password updated successfully! Please log in with your new password.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


