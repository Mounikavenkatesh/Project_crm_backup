import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import {
  LEAD_STATUS_TO_PRISMA,
  LEAD_STATUS_FROM_PRISMA,
  LEAD_SOURCE_TO_PRISMA,
  LEAD_SOURCE_FROM_PRISMA,
  formatLead,
} from '../utils/crmEnums.js';
import { logActivity } from '../utils/activityLogger.js';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'company', 'value', 'status'];

const leadInclude = {
  owner: { select: { id: true, name: true, email: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
};

const devLog = (operation, details) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[LeadController] ${operation} - ${JSON.stringify(details)}`);
  }
};

/**
 * Scope leads by role while preserving strict ownership isolation for standard users.
 */
const buildLeadScope = (user) => {
  if (user.role === 'admin' || user.role === 'manager') {
    return {};
  }
  return {
    OR: [{ ownerId: user.id }, { assignedToId: user.id }],
  };
};

/**
 * Compute status progression timestamps without overwriting earlier stage timestamps.
 */
const buildStatusTimestamps = (existingLead, nextPrismaStatus) => {
  const now = new Date();
  const timestamps = {};

  const currentContacted = existingLead?.contactedAt || null;
  const currentMeeting = existingLead?.meetingAt || null;
  const currentProposal = existingLead?.proposalAt || null;
  const currentWon = existingLead?.wonAt || null;
  const currentLost = existingLead?.lostAt || null;

  if (nextPrismaStatus === 'CONTACTED') {
    timestamps.contactedAt = currentContacted || now;
  } else if (nextPrismaStatus === 'MEETING_SCHEDULED') {
    timestamps.contactedAt = currentContacted || now;
    timestamps.meetingAt = currentMeeting || now;
  } else if (nextPrismaStatus === 'PROPOSAL_SENT') {
    timestamps.contactedAt = currentContacted || now;
    timestamps.meetingAt = currentMeeting || now;
    timestamps.proposalAt = currentProposal || now;
  } else if (nextPrismaStatus === 'WON') {
    timestamps.contactedAt = currentContacted || now;
    timestamps.meetingAt = currentMeeting || now;
    timestamps.proposalAt = currentProposal || now;
    timestamps.wonAt = currentWon || now;
  } else if (nextPrismaStatus === 'LOST') {
    timestamps.lostAt = currentLost || now;
  }

  return timestamps;
};

/**
 * Get all leads for the logged-in user with filtering, search, sorting, and pagination.
 * @route GET /api/leads
 * @access Private
 */
export const getLeads = async (req, res, next) => {
  try {
    const {
      status,
      search,
      source,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      dateFrom,
      dateTo,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skipNum = (pageNum - 1) * limitNum;

    const andConditions = [];
    const scope = buildLeadScope(req.user);
    if (Object.keys(scope).length > 0) {
      andConditions.push(scope);
    }

    if (status && status !== 'All' && LEAD_STATUS_TO_PRISMA[status]) {
      andConditions.push({ status: LEAD_STATUS_TO_PRISMA[status] });
    }

    if (source && source !== 'All' && LEAD_SOURCE_TO_PRISMA[source]) {
      andConditions.push({ source: LEAD_SOURCE_TO_PRISMA[source] });
    }

    if (search && search.trim()) {
      const term = search.trim();
      andConditions.push({
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { company: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      });
    }

    if (dateFrom || dateTo) {
      const createdAt = {};
      if (dateFrom) {
        createdAt.gte = new Date(dateFrom);
      }
      if (dateTo) {
        const dateToObj = new Date(dateTo);
        dateToObj.setHours(23, 59, 59, 999);
        createdAt.lte = dateToObj;
      }
      andConditions.push({ createdAt });
    }

    const where = andConditions.length > 0 ? { AND: andConditions } : {};
    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    devLog('getLeads Filter', where);

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: leadInclude,
        orderBy: { [safeSortBy]: safeSortOrder },
        skip: skipNum,
        take: limitNum,
      }),
      prisma.lead.count({ where }),
    ]);

    return paginatedResponse(
      res,
      leads.map(formatLead),
      total,
      pageNum,
      limitNum
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lead.
 * @route POST /api/leads
 * @access Private
 */
export const createLead = async (req, res, next) => {
  try {
    devLog('createLead Body', req.body);

    const {
      name,
      company,
      email,
      phone = '',
      status = 'New',
      source = 'Website',
      value = 0,
      notes = '',
      assignedToId = null,
    } = req.body;

    const prismaStatus = LEAD_STATUS_TO_PRISMA[status] || 'NEW';
    const prismaSource = LEAD_SOURCE_TO_PRISMA[source] || 'WEBSITE';
    const targetAssigneeId = assignedToId || req.user.id;

    const lead = await prisma.lead.create({
      data: {
        name: String(name).trim(),
        company: String(company).trim(),
        email: String(email).trim(),
        phone: String(phone || '').trim(),
        status: prismaStatus,
        source: prismaSource,
        value: Number(value) || 0,
        notes: String(notes || ''),
        ownerId: req.user.id,
        assignedToId: targetAssigneeId,
        ...buildStatusTimestamps(null, prismaStatus),
      },
      include: leadInclude,
    });

    await logActivity({
      userId: req.user.id,
      type: 'LEAD_CREATED',
      title: `${req.user.name} created lead "${lead.name}" (${lead.company})`,
      leadId: lead.id,
    });

    devLog('createLead Success', { id: lead.id });
    return successResponse(res, formatLead(lead), 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific lead by ID with owner isolation.
 * @route GET /api/leads/:id
 * @access Private
 */
export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    devLog('getLeadById', { id });

    const lead = await prisma.lead.findFirst({
      where: {
        id,
        ...buildLeadScope(req.user),
      },
      include: leadInclude,
    });

    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, formatLead(lead), 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a lead completely with owner isolation.
 * @route PUT /api/leads/:id
 * @access Private
 */
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    devLog('updateLead', { id, body: req.body });

    const existing = await prisma.lead.findFirst({
      where: {
        id,
        ...buildLeadScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Lead not found', 404);
    }

    const {
      name,
      company,
      email,
      phone,
      status,
      source,
      value,
      notes,
      assignedToId,
    } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (company !== undefined) updateData.company = String(company).trim();
    if (email !== undefined) updateData.email = String(email).trim();
    if (phone !== undefined) updateData.phone = String(phone || '').trim();
    if (notes !== undefined) updateData.notes = String(notes || '');
    if (value !== undefined) updateData.value = Number(value) || 0;
    if (assignedToId !== undefined) updateData.assignedToId = assignedToId || existing.ownerId;

    if (source !== undefined && LEAD_SOURCE_TO_PRISMA[source]) {
      updateData.source = LEAD_SOURCE_TO_PRISMA[source];
    }

    if (status !== undefined && LEAD_STATUS_TO_PRISMA[status]) {
      const nextStatus = LEAD_STATUS_TO_PRISMA[status];
      updateData.status = nextStatus;
      if (nextStatus !== existing.status) {
        Object.assign(updateData, buildStatusTimestamps(existing, nextStatus));
      }
    }

    const updated = await prisma.lead.update({
      where: { id: existing.id },
      data: updateData,
      include: leadInclude,
    });

    await logActivity({
      userId: req.user.id,
      type:
        updateData.status && updateData.status !== existing.status
          ? 'LEAD_STATUS_CHANGED'
          : 'LEAD_UPDATED',
      title: `${req.user.name} updated lead "${updated.name}"`,
      leadId: updated.id,
    });

    devLog('updateLead Success', { id: updated.id });
    return successResponse(res, formatLead(updated), 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update only the status field of a lead with owner isolation.
 * @route PATCH /api/leads/:id/status
 * @access Private
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    devLog('updateLeadStatus', { id, status });

    const existing = await prisma.lead.findFirst({
      where: {
        id,
        ...buildLeadScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Lead not found', 404);
    }

    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    const nextPrismaStatus = LEAD_STATUS_TO_PRISMA[status];
    if (!nextPrismaStatus) {
      return errorResponse(res, 'Invalid status value', 400);
    }

    const updateData = {
      status: nextPrismaStatus,
      ...(nextPrismaStatus !== existing.status
        ? buildStatusTimestamps(existing, nextPrismaStatus)
        : {}),
    };

    const updated = await prisma.lead.update({
      where: { id: existing.id },
      data: updateData,
      include: leadInclude,
    });

    await logActivity({
      userId: req.user.id,
      type: 'LEAD_STATUS_CHANGED',
      title: `${req.user.name} moved "${updated.name}" to ${LEAD_STATUS_FROM_PRISMA[nextPrismaStatus] || nextPrismaStatus}`,
      leadId: updated.id,
    });

    devLog('updateLeadStatus Success', { id: updated.id, status: updated.status });
    return successResponse(res, formatLead(updated), 'Lead status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a lead permanently with owner isolation.
 * @route DELETE /api/leads/:id
 * @access Private
 */
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    devLog('deleteLead', { id });

    const existing = await prisma.lead.findFirst({
      where: {
        id,
        ...buildLeadScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await prisma.lead.delete({ where: { id: existing.id } });

    devLog('deleteLead Success', { id });
    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get leads analytics statistics for dashboard widgets.
 * @route GET /api/leads/stats/summary
 * @access Private
 */
export const getLeadStats = async (req, res, next) => {
  try {
    devLog('getLeadStats', { userId: req.user.id });

    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const scope = buildLeadScope(req.user);

    const [totalLeads, statusGroups, sourceGroups, thisMonthLeads, lastMonthLeads] =
      await Promise.all([
        prisma.lead.count({ where: scope }),
        prisma.lead.groupBy({
          by: ['status'],
          where: scope,
          _count: { _all: true },
        }),
        prisma.lead.groupBy({
          by: ['source'],
          where: scope,
          _count: { _all: true },
        }),
        prisma.lead.count({
          where: {
            ...scope,
            createdAt: { gte: startOfCurrentMonth },
          },
        }),
        prisma.lead.count({
          where: {
            ...scope,
            createdAt: {
              gte: startOfLastMonth,
              lt: startOfCurrentMonth,
            },
          },
        }),
      ]);

    const statusBreakdown = {
      New: 0,
      Contacted: 0,
      'Meeting Scheduled': 0,
      'Proposal Sent': 0,
      Won: 0,
      Lost: 0,
    };
    statusGroups.forEach((group) => {
      const label = LEAD_STATUS_FROM_PRISMA[group.status];
      if (label && statusBreakdown[label] !== undefined) {
        statusBreakdown[label] = group._count._all;
      }
    });

    const sourceBreakdown = {
      Website: 0,
      Referral: 0,
      LinkedIn: 0,
      'Cold Call': 0,
      'Email Campaign': 0,
      Other: 0,
    };
    sourceGroups.forEach((group) => {
      const label = LEAD_SOURCE_FROM_PRISMA[group.source];
      if (label && sourceBreakdown[label] !== undefined) {
        sourceBreakdown[label] = group._count._all;
      }
    });

    const conversionRate =
      totalLeads > 0
        ? Math.round(((statusBreakdown.Won || 0) / totalLeads) * 100 * 10) / 10
        : 0;

    const growthRate =
      lastMonthLeads === 0
        ? thisMonthLeads * 100
        : Math.round(((thisMonthLeads - lastMonthLeads) / lastMonthLeads) * 100 * 10) / 10;

    const analyticsStats = {
      totalLeads,
      wonLeads: statusBreakdown.Won,
      lostLeads: statusBreakdown.Lost,
      conversionRate,
      thisMonthLeads,
      lastMonthLeads,
      growthRate,
      statusBreakdown,
      sourceBreakdown,
    };

    devLog('getLeadStats Success', analyticsStats);
    return successResponse(res, analyticsStats, 'Analytics summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get monthly lead and conversion rates for the past 6 calendar months.
 * @route GET /api/leads/stats/monthly
 * @access Private
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    devLog('getMonthlyStats', { userId: req.user.id });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsList = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      const year = d.getFullYear();
      monthsList.push({
        month: `${mName} ${year}`,
        year,
        monthNum: d.getMonth(),
        total: 0,
        won: 0,
        lost: 0,
        conversionRate: 0,
      });
    }

    const startOf6MonthsAgo = new Date();
    startOf6MonthsAgo.setMonth(startOf6MonthsAgo.getMonth() - 5);
    startOf6MonthsAgo.setDate(1);
    startOf6MonthsAgo.setHours(0, 0, 0, 0);

    const leads = await prisma.lead.findMany({
      where: {
        ...buildLeadScope(req.user),
        createdAt: { gte: startOf6MonthsAgo },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    leads.forEach((lead) => {
      const created = new Date(lead.createdAt);
      const target = monthsList.find(
        (m) => m.year === created.getFullYear() && m.monthNum === created.getMonth()
      );
      if (target) {
        target.total += 1;
        if (lead.status === 'WON') target.won += 1;
        if (lead.status === 'LOST') target.lost += 1;
      }
    });

    const finalStats = monthsList.map(({ month, total, won, lost }) => ({
      month,
      total,
      won,
      lost,
      conversionRate: total > 0 ? Math.round((won / total) * 100 * 10) / 10 : 0,
    }));

    devLog('getMonthlyStats Success', finalStats);
    return successResponse(res, finalStats, 'Monthly analytics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Autocomplete search endpoint returning up to 5 leads matching query string.
 * @route GET /api/leads/search
 * @access Private
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    devLog('searchLeads', { q, limit });

    if (!q || !String(q).trim()) {
      return successResponse(res, [], 'Search query empty');
    }

    const limitNum = Math.min(20, Math.max(1, parseInt(limit, 10) || 5));
    const term = String(q).trim();

    const results = await prisma.lead.findMany({
      where: {
        ...buildLeadScope(req.user),
        OR: [
          { name: { contains: term, mode: 'insensitive' } },
          { company: { contains: term, mode: 'insensitive' } },
          { email: { contains: term, mode: 'insensitive' } },
        ],
      },
      select: {
        id: true,
        name: true,
        company: true,
        email: true,
        status: true,
      },
      take: limitNum,
      orderBy: { createdAt: 'desc' },
    });

    const formatted = results.map((lead) => ({
      ...lead,
      status: LEAD_STATUS_FROM_PRISMA[lead.status] || lead.status,
    }));

    return successResponse(res, formatted, 'Quick search autocomplete results');
  } catch (error) {
    next(error);
  }
};
