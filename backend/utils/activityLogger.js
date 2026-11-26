import prisma from '../config/database.js';

/**
 * Record an activity entry in the database without failing the primary request if logging fails.
 */
export const logActivity = async ({
  userId,
  type,
  title,
  description = '',
  metadata = null,
  leadId = null,
  customerId = null,
  taskId = null,
}) => {
  try {
    return await prisma.activity.create({
      data: {
        userId,
        type,
        title,
        description,
        metadata: metadata || undefined,
        leadId: leadId || undefined,
        customerId: customerId || undefined,
        taskId: taskId || undefined,
      },
    });
  } catch (error) {
    console.error('Activity logging error:', error.message);
    return null;
  }
};

/**
 * Create an in-app notification for a user without failing the primary request.
 */
export const createNotification = async ({
  userId,
  title,
  message,
  type = 'INFO',
  link = null,
}) => {
  try {
    return await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link: link || undefined,
      },
    });
  } catch (error) {
    console.error('Notification creation error:', error.message);
    return null;
  }
};
