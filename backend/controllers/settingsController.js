import prisma from '../config/database.js';
import { successResponse } from '../utils/apiResponse.js';
import { logActivity } from '../utils/activityLogger.js';

/**
 * Retrieve or initialize settings for the current user.
 * @route GET /api/settings
 * @access Private
 */
export const getSettings = async (req, res, next) => {
  try {
    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: {},
      create: { userId: req.user.id },
    });

    return successResponse(res, settings, 'Settings retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update workspace and notification settings for the current user.
 * @route PUT /api/settings
 * @access Private
 */
export const updateSettings = async (req, res, next) => {
  try {
    const {
      companyName,
      currency,
      timezone,
      theme,
      emailNotifications,
      taskReminders,
      leadAlerts,
      weeklyDigest,
    } = req.body;

    const updateData = {};
    if (companyName !== undefined) updateData.companyName = companyName.trim();
    if (currency !== undefined) updateData.currency = currency.trim().toUpperCase();
    if (timezone !== undefined) updateData.timezone = timezone.trim();
    if (theme !== undefined) updateData.theme = theme.trim();
    if (typeof emailNotifications === 'boolean') {
      updateData.emailNotifications = emailNotifications;
    }
    if (typeof taskReminders === 'boolean') updateData.taskReminders = taskReminders;
    if (typeof leadAlerts === 'boolean') updateData.leadAlerts = leadAlerts;
    if (typeof weeklyDigest === 'boolean') updateData.weeklyDigest = weeklyDigest;

    const settings = await prisma.settings.upsert({
      where: { userId: req.user.id },
      update: updateData,
      create: {
        userId: req.user.id,
        ...updateData,
      },
    });

    await logActivity({
      userId: req.user.id,
      type: 'SETTINGS_UPDATED',
      title: `${req.user.name} updated workspace preferences`,
    });

    return successResponse(res, settings, 'Settings saved successfully');
  } catch (error) {
    next(error);
  }
};
