import prisma from '../config/database.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';
import {
  TASK_STATUS_TO_PRISMA,
  TASK_PRIORITY_TO_PRISMA,
  formatTask,
} from '../utils/crmEnums.js';
import { createNotification, logActivity } from '../utils/activityLogger.js';

const ALLOWED_SORT_FIELDS = ['dueDate', 'createdAt', 'priority', 'status', 'title'];

const buildTaskScope = (user) => {
  if (user.role === 'admin' || user.role === 'manager') {
    return {};
  }
  return {
    OR: [{ assignedToId: user.id }, { createdById: user.id }],
  };
};

/**
 * List tasks with filtering, search, sorting, and pagination.
 * @route GET /api/tasks
 * @access Private
 */
export const getTasks = async (req, res, next) => {
  try {
    const {
      status,
      priority,
      assignedToId,
      leadId,
      customerId,
      overdue,
      search,
      page = 1,
      limit = 20,
      sortBy = 'dueDate',
      sortOrder = 'asc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skipNum = (pageNum - 1) * limitNum;

    const andConditions = [];
    const scope = buildTaskScope(req.user);
    if (Object.keys(scope).length > 0) {
      andConditions.push(scope);
    }

    if (status && status !== 'All' && TASK_STATUS_TO_PRISMA[status]) {
      andConditions.push({ status: TASK_STATUS_TO_PRISMA[status] });
    }

    if (priority && priority !== 'All' && TASK_PRIORITY_TO_PRISMA[priority]) {
      andConditions.push({ priority: TASK_PRIORITY_TO_PRISMA[priority] });
    }

    if (assignedToId && assignedToId !== 'All') {
      andConditions.push({ assignedToId });
    }

    if (leadId) {
      andConditions.push({ leadId });
    }

    if (customerId) {
      andConditions.push({ customerId });
    }

    if (overdue === 'true') {
      andConditions.push({
        dueDate: { lt: new Date() },
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      });
    }

    if (search && search.trim()) {
      const term = search.trim();
      andConditions.push({
        OR: [
          { title: { contains: term, mode: 'insensitive' } },
          { description: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'dueDate';
    const safeSortOrder = sortOrder === 'desc' ? 'desc' : 'asc';

    const [tasks, total, pendingCount, inProgressCount, completedCount, overdueCount] =
      await Promise.all([
        prisma.task.findMany({
          where,
          include: {
            assignedTo: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true, email: true } },
            lead: { select: { id: true, name: true, company: true } },
            customer: { select: { id: true, name: true, company: true } },
          },
          orderBy: [{ [safeSortBy]: safeSortOrder }, { createdAt: 'desc' }],
          skip: skipNum,
          take: limitNum,
        }),
        prisma.task.count({ where }),
        prisma.task.count({
          where: { ...buildTaskScope(req.user), status: 'PENDING' },
        }),
        prisma.task.count({
          where: { ...buildTaskScope(req.user), status: 'IN_PROGRESS' },
        }),
        prisma.task.count({
          where: { ...buildTaskScope(req.user), status: 'COMPLETED' },
        }),
        prisma.task.count({
          where: {
            ...buildTaskScope(req.user),
            dueDate: { lt: new Date() },
            status: { in: ['PENDING', 'IN_PROGRESS'] },
          },
        }),
      ]);

    const pages = Math.ceil(total / limitNum) || 1;
    return res.status(200).json({
      success: true,
      data: tasks.map(formatTask),
      summary: {
        pending: pendingCount,
        inProgress: inProgressCount,
        completed: completedCount,
        overdue: overdueCount,
      },
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages,
        hasNext: pageNum < pages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new task and optionally notify the assigned user.
 * @route POST /api/tasks
 * @access Private
 */
export const createTask = async (req, res, next) => {
  try {
    const {
      title,
      description = '',
      status = 'Pending',
      priority = 'Medium',
      dueDate = null,
      assignedToId,
      leadId = null,
      customerId = null,
    } = req.body;

    const prismaStatus = TASK_STATUS_TO_PRISMA[status] || 'PENDING';
    const prismaPriority = TASK_PRIORITY_TO_PRISMA[priority] || 'MEDIUM';
    const targetAssigneeId = assignedToId || req.user.id;

    const task = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description.trim(),
        status: prismaStatus,
        priority: prismaPriority,
        dueDate: dueDate ? new Date(dueDate) : null,
        completedAt: prismaStatus === 'COMPLETED' ? new Date() : null,
        assignedToId: targetAssigneeId,
        createdById: req.user.id,
        leadId: leadId || undefined,
        customerId: customerId || undefined,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, company: true } },
        customer: { select: { id: true, name: true, company: true } },
      },
    });

    await logActivity({
      userId: req.user.id,
      type: 'TASK_CREATED',
      title: `Created task "${task.title}"`,
      description: `Priority: ${formatTask(task).priority} • Assigned to ${task.assignedTo?.name}`,
      taskId: task.id,
      leadId: task.leadId,
      customerId: task.customerId,
    });

    if (targetAssigneeId !== req.user.id) {
      await createNotification({
        userId: targetAssigneeId,
        title: 'New Task Assigned',
        message: `${req.user.name} assigned you "${task.title}"`,
        type: 'INFO',
        link: '/tasks',
      });
    }

    return successResponse(res, formatTask(task), 'Task created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing task.
 * @route PUT /api/tasks/:id
 * @access Private
 */
export const updateTask = async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        ...buildTaskScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Task not found', 404);
    }

    const {
      title,
      description,
      status,
      priority,
      dueDate,
      assignedToId,
      leadId,
      customerId,
    } = req.body;

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (description !== undefined) data.description = description.trim();
    if (priority !== undefined && TASK_PRIORITY_TO_PRISMA[priority]) {
      data.priority = TASK_PRIORITY_TO_PRISMA[priority];
    }
    if (dueDate !== undefined) {
      data.dueDate = dueDate ? new Date(dueDate) : null;
    }
    if (assignedToId !== undefined && assignedToId) {
      data.assignedToId = assignedToId;
    }
    if (leadId !== undefined) {
      data.leadId = leadId || null;
    }
    if (customerId !== undefined) {
      data.customerId = customerId || null;
    }

    if (status !== undefined && TASK_STATUS_TO_PRISMA[status]) {
      const nextStatus = TASK_STATUS_TO_PRISMA[status];
      data.status = nextStatus;
      data.completedAt = nextStatus === 'COMPLETED' ? existing.completedAt || new Date() : null;
    }

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data,
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, company: true } },
        customer: { select: { id: true, name: true, company: true } },
      },
    });

    const isCompletedNow = updated.status === 'COMPLETED' && existing.status !== 'COMPLETED';
    await logActivity({
      userId: req.user.id,
      type: isCompletedNow ? 'TASK_COMPLETED' : 'TASK_UPDATED',
      title: isCompletedNow
        ? `Completed task "${updated.title}"`
        : `Updated task "${updated.title}"`,
      taskId: updated.id,
      leadId: updated.leadId,
      customerId: updated.customerId,
    });

    if (
      assignedToId &&
      assignedToId !== existing.assignedToId &&
      assignedToId !== req.user.id
    ) {
      await createNotification({
        userId: assignedToId,
        title: 'Task Reassigned to You',
        message: `${req.user.name} assigned you "${updated.title}"`,
        type: 'INFO',
        link: '/tasks',
      });
    }

    return successResponse(res, formatTask(updated), 'Task updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update only a task's status.
 * @route PATCH /api/tasks/:id/status
 * @access Private
 */
export const updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const nextStatus = TASK_STATUS_TO_PRISMA[status];
    if (!nextStatus) {
      return errorResponse(res, 'Invalid task status', 400);
    }

    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        ...buildTaskScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Task not found', 404);
    }

    const updated = await prisma.task.update({
      where: { id: existing.id },
      data: {
        status: nextStatus,
        completedAt: nextStatus === 'COMPLETED' ? existing.completedAt || new Date() : null,
      },
      include: {
        assignedTo: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true, email: true } },
        lead: { select: { id: true, name: true, company: true } },
        customer: { select: { id: true, name: true, company: true } },
      },
    });

    await logActivity({
      userId: req.user.id,
      type: nextStatus === 'COMPLETED' ? 'TASK_COMPLETED' : 'TASK_UPDATED',
      title:
        nextStatus === 'COMPLETED'
          ? `Completed task "${updated.title}"`
          : `Moved task "${updated.title}" to ${formatTask(updated).status}`,
      taskId: updated.id,
    });

    return successResponse(res, formatTask(updated), 'Task status updated');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a task permanently.
 * @route DELETE /api/tasks/:id
 * @access Private
 */
export const deleteTask = async (req, res, next) => {
  try {
    const existing = await prisma.task.findFirst({
      where: {
        id: req.params.id,
        ...buildTaskScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Task not found', 404);
    }

    await prisma.task.delete({ where: { id: existing.id } });
    return successResponse(res, null, 'Task deleted successfully');
  } catch (error) {
    next(error);
  }
};
