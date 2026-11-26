import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

/**
 * List notifications for the logged-in user along with unread count.
 * @route GET /api/notifications
 * @access Private
 */
export const getNotifications = async (req, res, next) => {
  try {
    const limitNum = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));

    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
        take: limitNum,
      }),
      prisma.notification.count({
        where: { userId: req.user.id, isRead: false },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mark a single notification as read.
 * @route PATCH /api/notifications/:id/read
 * @access Private
 */
export const markNotificationRead = async (req, res, next) => {
  try {
    const existing = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return errorResponse(res, 'Notification not found', 404);
    }

    const updated = await prisma.notification.update({
      where: { id: existing.id },
      data: { isRead: true },
    });

    return successResponse(res, updated, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications for the current user as read.
 * @route PATCH /api/notifications/read-all
 * @access Private
 */
export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user.id, isRead: false },
      data: { isRead: true },
    });

    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a notification.
 * @route DELETE /api/notifications/:id
 * @access Private
 */
export const deleteNotification = async (req, res, next) => {
  try {
    const existing = await prisma.notification.findFirst({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!existing) {
      return errorResponse(res, 'Notification not found', 404);
    }

    await prisma.notification.delete({ where: { id: existing.id } });
    return successResponse(res, null, 'Notification removed');
  } catch (error) {
    next(error);
  }
};
