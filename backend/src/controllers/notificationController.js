import Notification from '../models/Notification.js';

// @desc    Get notifications for user / role
// @route   GET /api/notifications
export const getNotifications = async (req, res, next) => {
  try {
    const { role, hospitalId, ambulanceId, unreadOnly } = req.query;
    const filter = {};

    if (role) {
      filter.$or = [{ recipientRole: 'all' }, { recipientRole: role }];
    }
    if (hospitalId) filter.recipientHospitalId = hospitalId;
    if (ambulanceId) filter.recipientAmbulanceId = ambulanceId;
    if (unreadOnly === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      ...filter,
      isRead: false,
    });

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    res.json({
      success: true,
      data: notification,
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/read-all
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ isRead: false }, { isRead: true });
    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (err) {
    next(err);
  }
};
