import Notification from '../models/Notification.js';
import { sendSuccess, sendError } from '../utils/apiResponse.js';

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipientId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(30);

    const unreadCount = await Notification.countDocuments({
      recipientId: req.user._id,
      read: false,
    });

    return sendSuccess(res, {
      unreadCount,
      notifications,
    }, 'Notifications fetched successfully');
  } catch (error) {
    console.error('Get notifications error:', error);
    return sendError(res, 'Failed to fetch notifications', 500);
  }
};

// @desc    Mark single notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    return sendSuccess(res, notification, 'Notification marked as read');
  } catch (error) {
    console.error('Mark read error:', error);
    return sendError(res, 'Failed to mark notification as read', 500);
  }
};

// @desc    Mark all user notifications as read
// @route   PUT /api/notifications/read-all
// @access  Private
export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipientId: req.user._id, read: false },
      { $set: { read: true, readAt: new Date() } }
    );

    return sendSuccess(res, null, 'All notifications marked as read');
  } catch (error) {
    console.error('Mark all read error:', error);
    return sendError(res, 'Failed to mark all notifications as read', 500);
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipientId: req.user._id,
    });

    if (!notification) {
      return sendError(res, 'Notification not found', 404);
    }

    return sendSuccess(res, null, 'Notification deleted successfully');
  } catch (error) {
    console.error('Delete notification error:', error);
    return sendError(res, 'Failed to delete notification', 500);
  }
};
