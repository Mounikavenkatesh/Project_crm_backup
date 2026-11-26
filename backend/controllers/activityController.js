import prisma from '../config/database.js';
import { paginatedResponse } from '../utils/apiResponse.js';

/**
 * Retrieve recent CRM activities scoped by user role.
 * @route GET /api/activities
 * @access Private
 */
export const getActivities = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, type } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skipNum = (pageNum - 1) * limitNum;

    const where = {};
    if (req.user.role !== 'admin' && req.user.role !== 'manager') {
      where.userId = req.user.id;
    }
    if (type && type !== 'All') {
      where.type = type;
    }

    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: skipNum,
        take: limitNum,
      }),
      prisma.activity.count({ where }),
    ]);

    return paginatedResponse(res, activities, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};
