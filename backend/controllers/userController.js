import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { USER_ROLE_TO_PRISMA, formatUser } from '../utils/crmEnums.js';
import { createNotification, logActivity } from '../utils/activityLogger.js';

/**
 * Lightweight list of active team members for lead/task assignment dropdowns.
 * @route GET /api/users/team
 * @access Private
 */
export const getTeamMembers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        jobTitle: true,
      },
      orderBy: { name: 'asc' },
    });

    return successResponse(
      res,
      users.map(formatUser),
      'Team members retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: List all users with search, role/status filtering, and pagination.
 * @route GET /api/users
 * @access Private (Admin / Manager)
 */
export const getUsers = async (req, res, next) => {
  try {
    const { search, role, isActive, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skipNum = (pageNum - 1) * limitNum;

    const where = {};
    if (role && role !== 'All' && USER_ROLE_TO_PRISMA[role]) {
      where.role = USER_ROLE_TO_PRISMA[role];
    }
    if (isActive === 'true' || isActive === 'false') {
      where.isActive = isActive === 'true';
    }
    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { jobTitle: { contains: term, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: {
          _count: {
            select: {
              ownedLeads: true,
              assignedLeads: true,
              assignedTasks: true,
              customers: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: skipNum,
        take: limitNum,
      }),
      prisma.user.count({ where }),
    ]);

    return paginatedResponse(
      res,
      users.map(formatUser),
      total,
      pageNum,
      limitNum
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Create a new team member account.
 * @route POST /api/users
 * @access Private (Admin)
 */
export const createUser = async (req, res, next) => {
  try {
    const name = req.body.name?.trim();
    const email = req.body.email?.trim().toLowerCase();
    const password = req.body.password;
    const role = USER_ROLE_TO_PRISMA[req.body.role] || 'USER';
    const jobTitle = req.body.jobTitle?.trim() || '';
    const phone = req.body.phone?.trim() || '';

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse(res, 'Email is already registered', 409);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        jobTitle,
        phone,
        settings: { create: {} },
      },
    });

    await Promise.all([
      logActivity({
        userId: req.user.id,
        type: 'USER_UPDATED',
        title: `Invited user ${user.name} (${role.toLowerCase()})`,
      }),
      createNotification({
        userId: user.id,
        title: 'Account Created',
        message: `${req.user.name} created your Startup CRM account.`,
        type: 'INFO',
      }),
    ]);

    return successResponse(res, formatUser(user), 'User created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Update a user's role, active status, or profile metadata.
 * @route PUT /api/users/:id
 * @access Private (Admin)
 */
export const updateUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, role, isActive, jobTitle, phone } = req.body;

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'User not found', 404);
    }

    if (id === req.user.id && isActive === false) {
      return errorResponse(res, 'You cannot deactivate your own account', 400);
    }

    const data = {};
    if (name !== undefined && name.trim()) data.name = name.trim();
    if (role !== undefined && USER_ROLE_TO_PRISMA[role]) {
      data.role = USER_ROLE_TO_PRISMA[role];
    }
    if (typeof isActive === 'boolean') data.isActive = isActive;
    if (jobTitle !== undefined) data.jobTitle = jobTitle.trim();
    if (phone !== undefined) data.phone = phone.trim();

    const updated = await prisma.user.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            ownedLeads: true,
            assignedLeads: true,
            assignedTasks: true,
            customers: true,
          },
        },
      },
    });

    await logActivity({
      userId: req.user.id,
      type: 'USER_UPDATED',
      title: `Updated user ${updated.name}`,
      description: `Role: ${formatUser(updated).role} • Active: ${updated.isActive}`,
    });

    return successResponse(res, formatUser(updated), 'User updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Delete a user account (cannot delete self).
 * @route DELETE /api/users/:id
 * @access Private (Admin)
 */
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id) {
      return errorResponse(res, 'You cannot delete your own account', 400);
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return errorResponse(res, 'User not found', 404);
    }

    await prisma.user.delete({ where: { id } });
    return successResponse(res, null, 'User deleted successfully');
  } catch (error) {
    next(error);
  }
};
