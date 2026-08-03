import Lead from '../models/Lead.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';

/**
 * Helper to log operations in development mode.
 * @param {string} operation Name of the operation.
 * @param {object} details Log details.
 */
const devLog = (operation, details) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[LeadController] ${operation} - ${JSON.stringify(details)}`);
  }
};

/**
 * Helper to update status-related timestamps.
 * @param {object} lead The lead document.
 * @param {string} status The new status.
 */
const updateStatusTimestamps = (lead, status) => {
  const now = new Date();
  if (status === 'Contacted') {
    lead.contactedAt = lead.contactedAt || now;
  } else if (status === 'Meeting Scheduled') {
    lead.contactedAt = lead.contactedAt || now;
    lead.meetingAt = lead.meetingAt || now;
  } else if (status === 'Proposal Sent') {
    lead.contactedAt = lead.contactedAt || now;
    lead.meetingAt = lead.meetingAt || now;
    lead.proposalAt = lead.proposalAt || now;
  } else if (status === 'Won') {
    lead.contactedAt = lead.contactedAt || now;
    lead.meetingAt = lead.meetingAt || now;
    lead.proposalAt = lead.proposalAt || now;
    lead.wonAt = lead.wonAt || now;
  }
};

/**
 * Get all leads for the logged-in user with filtering, search, sorting, and pagination.
 * 
 * @route GET /api/leads
 * @access Private
 * @param {object} req Express request object.
 * @param {object} req.query Query parameters: { status, search, source, page, limit, sortBy, sortOrder, dateFrom, dateTo }
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
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

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skipNum = (pageNum - 1) * limitNum;

    // Build filter with owner isolation
    const filter = { owner: req.user._id };

    // Status filter
    if (status && status !== 'All') {
      filter.status = status;
    }

    // Source filter
    if (source && source !== 'All') {
      filter.source = source;
    }

    // Search filter (name, company, email)
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    // Date filters (createdAt)
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) {
        filter.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // Set dateTo to the end of the day (23:59:59.999)
        const dateToObj = new Date(dateTo);
        dateToObj.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = dateToObj;
      }
    }

    devLog('getLeads Filter', filter);

    // Run query with sorting, pagination
    const sortField = sortBy;
    const sortDir = sortOrder === 'desc' ? -1 : 1;

    const [leads, total] = await Promise.all([
      Lead.find(filter)
        .sort({ [sortField]: sortDir })
        .skip(skipNum)
        .limit(limitNum),
      Lead.countDocuments(filter),
    ]);

    return paginatedResponse(res, leads, total, pageNum, limitNum);
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new lead.
 * 
 * @route POST /api/leads
 * @access Private
 * @param {object} req Express request object with lead fields in body.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const createLead = async (req, res, next) => {
  try {
    devLog('createLead Body', req.body);

    const leadData = {
      ...req.body,
      owner: req.user._id,
    };

    const lead = new Lead(leadData);

    // Automatically set timestamps if status is already set to something other than 'New'
    if (lead.status && lead.status !== 'New') {
      updateStatusTimestamps(lead, lead.status);
    }

    await lead.save();

    devLog('createLead Success', { id: lead._id });
    return successResponse(res, lead, 'Lead created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get a specific lead by ID.
 * Checks for owner isolation.
 * 
 * @route GET /api/leads/:id
 * @access Private
 * @param {object} req Express request object with ID parameter.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const getLeadById = async (req, res, next) => {
  try {
    const { id } = req.params;
    devLog('getLeadById', { id });

    const lead = await Lead.findOne({ _id: id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    return successResponse(res, lead, 'Lead retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a lead completely.
 * Checks for owner isolation.
 * 
 * @route PUT /api/leads/:id
 * @access Private
 * @param {object} req Express request object with ID parameter and update fields.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const updateLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    devLog('updateLead', { id, body: req.body });

    const lead = await Lead.findOne({ _id: id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    // Do NOT allow changing the owner
    const updateData = { ...req.body };
    delete updateData.owner;

    // Update fields manually to allow validators to run and apply status timestamps
    Object.keys(updateData).forEach((key) => {
      // If status changed, apply timestamps
      if (key === 'status' && updateData.status !== lead.status) {
        updateStatusTimestamps(lead, updateData.status);
      }
      lead[key] = updateData[key];
    });

    await lead.save({ runValidators: true });

    devLog('updateLead Success', { id: lead._id });
    return successResponse(res, lead, 'Lead updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update only the status field of a lead.
 * Checks for owner isolation.
 * 
 * @route PATCH /api/leads/:id/status
 * @access Private
 * @param {object} req Express request object with ID parameter and status in body.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const updateLeadStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    devLog('updateLeadStatus', { id, status });

    const lead = await Lead.findOne({ _id: id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    if (!status) {
      return errorResponse(res, 'Status is required', 400);
    }

    // Apply timestamps if status is changing
    if (status !== lead.status) {
      updateStatusTimestamps(lead, status);
      lead.status = status;
    }

    await lead.save({ runValidators: true });

    devLog('updateLeadStatus Success', { id: lead._id, status: lead.status });
    return successResponse(res, lead, 'Lead status updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a lead permanently.
 * Checks for owner isolation.
 * 
 * @route DELETE /api/leads/:id
 * @access Private
 * @param {object} req Express request object with ID parameter.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const deleteLead = async (req, res, next) => {
  try {
    const { id } = req.params;
    devLog('deleteLead', { id });

    const lead = await Lead.findOne({ _id: id, owner: req.user._id });
    if (!lead) {
      return errorResponse(res, 'Lead not found', 404);
    }

    await lead.deleteOne();

    devLog('deleteLead Success', { id });
    return successResponse(res, null, 'Lead deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get leads analytics statistics for the dashboard dashboard widgets.
 * Computes status breakdowns, sources breakdowns, monthly comparisons in a single database query.
 * 
 * @route GET /api/leads/stats/summary
 * @access Private
 * @param {object} req Express request object.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const getLeadStats = async (req, res, next) => {
  try {
    devLog('getLeadStats', { userId: req.user._id });

    // Calculate dates for current month and last month
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    const stats = await Lead.aggregate([
      // Match by owner
      { $match: { owner: req.user._id } },
      // Multi-facet aggregation to get breakdowns in one single database call
      {
        $facet: {
          totalCount: [{ $count: 'count' }],
          statusGroups: [
            { $group: { _id: '$status', count: { $sum: 1 } } },
          ],
          sourceGroups: [
            { $group: { _id: '$source', count: { $sum: 1 } } },
          ],
          thisMonthCount: [
            { $match: { createdAt: { $gte: startOfCurrentMonth } } },
            { $count: 'count' },
          ],
          lastMonthCount: [
            {
              $match: {
                createdAt: {
                  $gte: startOfLastMonth,
                  $lt: startOfCurrentMonth,
                },
              },
            },
            { $count: 'count' },
          ],
        },
      },
    ]);

    const result = stats[0] || {};
    const totalLeads = result.totalCount?.[0]?.count || 0;

    // Status breakdown formatting
    const statusBreakdown = {
      New: 0,
      Contacted: 0,
      'Meeting Scheduled': 0,
      'Proposal Sent': 0,
      Won: 0,
      Lost: 0,
    };
    if (result.statusGroups) {
      result.statusGroups.forEach((group) => {
        if (statusBreakdown[group._id] !== undefined) {
          statusBreakdown[group._id] = group.count;
        }
      });
    }

    // Source breakdown formatting
    const sourceBreakdown = {
      Website: 0,
      Referral: 0,
      LinkedIn: 0,
      'Cold Call': 0,
      'Email Campaign': 0,
      Other: 0,
    };
    if (result.sourceGroups) {
      result.sourceGroups.forEach((group) => {
        if (sourceBreakdown[group._id] !== undefined) {
          sourceBreakdown[group._id] = group.count;
        }
      });
    }

    const thisMonthLeads = result.thisMonthCount?.[0]?.count || 0;
    const lastMonthLeads = result.lastMonthCount?.[0]?.count || 0;

    // Division by zero safe calculations
    const conversionRate = totalLeads > 0
      ? Math.round(((statusBreakdown.Won || 0) / totalLeads) * 100 * 10) / 10
      : 0;

    const growthRate = lastMonthLeads === 0
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
 * Handled chronologically and handles zero-leads months gracefully.
 * 
 * @route GET /api/leads/stats/monthly
 * @access Private
 * @param {object} req Express request object.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    devLog('getMonthlyStats', { userId: req.user._id });

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthsList = [];

    // Pre-calculate last 6 months label array chronologically
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const mName = monthNames[d.getMonth()];
      const year = d.getFullYear();
      monthsList.push({
        month: `${mName} ${year}`,
        year,
        monthNum: d.getMonth() + 1, // 1-indexed for MongoDB
        total: 0,
        won: 0,
        lost: 0,
        conversionRate: 0,
      });
    }

    // Fetch matching data from MongoDB aggregation
    const startOf6MonthsAgo = new Date();
    startOf6MonthsAgo.setMonth(startOf6MonthsAgo.getMonth() - 5);
    startOf6MonthsAgo.setDate(1);
    startOf6MonthsAgo.setHours(0, 0, 0, 0);

    const results = await Lead.aggregate([
      {
        $match: {
          owner: req.user._id,
          createdAt: { $gte: startOf6MonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: 1 },
          won: { $sum: { $cond: [{ $eq: ['$status', 'Won'] }, 1, 0] } },
          lost: { $sum: { $cond: [{ $eq: ['$status', 'Lost'] }, 1, 0] } },
        },
      },
    ]);

    // Map DB results to correct pre-generated slots
    results.forEach((dbRow) => {
      const target = monthsList.find(
        (m) => m.year === dbRow._id.year && m.monthNum === dbRow._id.month
      );
      if (target) {
        target.total = dbRow.total;
        target.won = dbRow.won;
        target.lost = dbRow.lost;
        target.conversionRate = dbRow.total > 0
          ? Math.round((dbRow.won / dbRow.total) * 100 * 10) / 10
          : 0;
      }
    });

    // Clean structure to match frontend expectations (remove year and monthNum helper keys)
    const finalStats = monthsList.map(({ month, total, won, lost, conversionRate }) => ({
      month,
      total,
      won,
      lost,
      conversionRate,
    }));

    devLog('getMonthlyStats Success', finalStats);
    return successResponse(res, finalStats, 'Monthly analytics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Autocomplete/Autocomplete Search endpoint.
 * Returns a maximum of 5 leads matching the search query with select properties.
 * 
 * @route GET /api/leads/search
 * @access Private
 * @param {object} req Express request object with 'q' in query.
 * @param {object} res Express response object.
 * @param {function} next Express next middleware callback.
 */
export const searchLeads = async (req, res, next) => {
  try {
    const { q, limit = 5 } = req.query;
    devLog('searchLeads', { q, limit });

    if (!q) {
      return successResponse(res, [], 'Search query empty');
    }

    const limitNum = parseInt(limit, 10) || 5;

    // Search inside name, company, email with case-insensitivity
    const filter = {
      owner: req.user._id,
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { company: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } },
      ],
    };

    const results = await Lead.find(filter)
      .select('_id name company email status')
      .limit(limitNum);

    return successResponse(res, results, 'Quick search autocomplete results');
  } catch (error) {
    next(error);
  }
};
