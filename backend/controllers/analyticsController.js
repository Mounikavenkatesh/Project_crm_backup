import prisma from '../config/database.js';
import { successResponse } from '../utils/apiResponse.js';
import {
  LEAD_STATUS_FROM_PRISMA,
  LEAD_SOURCE_FROM_PRISMA,
  formatLead,
} from '../utils/crmEnums.js';

const buildRoleScope = (user, ownerField = 'ownerId', assigneeField = null) => {
  if (user.role === 'admin' || user.role === 'manager') {
    return {};
  }
  if (assigneeField) {
    return { OR: [{ [ownerField]: user.id }, { [assigneeField]: user.id }] };
  }
  return { [ownerField]: user.id };
};

const resolveDateBounds = (range = '30d', startDate, endDate) => {
  const now = new Date();
  let start = null;
  let end = new Date(now);
  let prevStart = null;
  let prevEnd = null;

  if (range === 'all') {
    return { start: null, end: null, prevStart: null, prevEnd: null };
  }

  if (range === '7d') {
    start = new Date(now.getTime() - 7 * 86400000);
    prevStart = new Date(now.getTime() - 14 * 86400000);
    prevEnd = new Date(start.getTime());
  } else if (range === '90d') {
    start = new Date(now.getTime() - 90 * 86400000);
    prevStart = new Date(now.getTime() - 180 * 86400000);
    prevEnd = new Date(start.getTime());
  } else if (range === 'ytd') {
    start = new Date(now.getFullYear(), 0, 1);
    prevStart = new Date(now.getFullYear() - 1, 0, 1);
    prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
  } else if (range === 'custom' && startDate && endDate) {
    start = new Date(startDate);
    end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    const duration = Math.max(86400000, end.getTime() - start.getTime());
    prevEnd = new Date(start.getTime() - 1);
    prevStart = new Date(start.getTime() - duration);
  } else {
    // Default 30d
    start = new Date(now.getTime() - 30 * 86400000);
    prevStart = new Date(now.getTime() - 60 * 86400000);
    prevEnd = new Date(start.getTime());
  }

  return { start, end, prevStart, prevEnd };
};

const computePeriodStats = (leads) => {
  const totalLeads = leads.length;
  const wonLeadsList = leads.filter((l) => l.status === 'WON');
  const wonCount = wonLeadsList.length;
  const lostCount = leads.filter((l) => l.status === 'LOST').length;
  const activeCount = leads.filter((l) => l.status !== 'WON' && l.status !== 'LOST').length;

  const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 1000) / 10 : 0;
  const lostRate = totalLeads > 0 ? Math.round((lostCount / totalLeads) * 1000) / 10 : 0;

  const pipelineValue = leads
    .filter((l) => l.status !== 'WON' && l.status !== 'LOST')
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0);

  const wonRevenue = wonLeadsList.reduce((sum, l) => sum + (Number(l.value) || 0), 0);

  let totalCycleDays = 0;
  let cycleCount = 0;
  wonLeadsList.forEach((l) => {
    if (l.createdAt && l.wonAt) {
      const diffMs = Math.abs(new Date(l.wonAt).getTime() - new Date(l.createdAt).getTime());
      totalCycleDays += Math.max(1, Math.ceil(diffMs / 86400000));
      cycleCount += 1;
    }
  });
  const salesCycle = cycleCount > 0 ? Math.round(totalCycleDays / cycleCount) : 0;

  const totalClosed = wonCount + lostCount;
  const winRate = totalClosed > 0 ? wonCount / totalClosed : totalLeads > 0 ? wonCount / totalLeads : 0;
  const avgDealSize = wonCount > 0 ? wonRevenue / wonCount : 0;
  const opportunities = activeCount || totalLeads;
  const effectiveCycle = salesCycle || 10;
  const salesVelocity = Math.round((opportunities * winRate * avgDealSize) / effectiveCycle);

  return {
    totalLeads,
    activeLeads: activeCount,
    wonCount,
    lostCount,
    conversionRate,
    lostRate,
    pipelineValue,
    wonRevenue,
    salesCycle,
    salesVelocity,
  };
};

const getGrowthPercent = (current, prev) => {
  if (prev === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - prev) / prev) * 1000) / 10;
};

/**
 * Full CRM Analytics and Dashboard metrics computed directly from PostgreSQL records.
 * @route GET /api/analytics/overview
 * @access Private
 */
export const getAnalyticsOverview = async (req, res, next) => {
  try {
    const { range = '30d', startDate, endDate } = req.query;
    const { start, end, prevStart, prevEnd } = resolveDateBounds(range, startDate, endDate);

    const leadScope = buildRoleScope(req.user, 'ownerId', 'assignedToId');
    const customerScope = buildRoleScope(req.user, 'ownerId');
    const taskScope = buildRoleScope(req.user, 'createdById', 'assignedToId');
    const activityScope =
      req.user.role === 'admin' || req.user.role === 'manager'
        ? {}
        : { userId: req.user.id };

    const [
      allLeads,
      totalCustomers,
      customerRevenueAgg,
      pendingTasks,
      inProgressTasks,
      completedTasks,
      overdueTasks,
      recentActivities,
    ] = await Promise.all([
      prisma.lead.findMany({
        where: leadScope,
        include: {
          owner: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where: customerScope }),
      prisma.customer.aggregate({
        where: customerScope,
        _sum: { totalRevenue: true },
      }),
      prisma.task.count({ where: { ...taskScope, status: 'PENDING' } }),
      prisma.task.count({ where: { ...taskScope, status: 'IN_PROGRESS' } }),
      prisma.task.count({ where: { ...taskScope, status: 'COMPLETED' } }),
      prisma.task.count({
        where: {
          ...taskScope,
          dueDate: { lt: new Date() },
          status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
      }),
      prisma.activity.findMany({
        where: activityScope,
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    // Filter leads by selected range for Analytics view
    const filteredLeads = start && end
      ? allLeads.filter((l) => {
          const ts = new Date(l.createdAt).getTime();
          return ts >= start.getTime() && ts <= end.getTime();
        })
      : allLeads;

    const prevLeads = prevStart && prevEnd
      ? allLeads.filter((l) => {
          const ts = new Date(l.createdAt).getTime();
          return ts >= prevStart.getTime() && ts <= prevEnd.getTime();
        })
      : [];

    const allTimeSummary = computePeriodStats(allLeads);
    const currentStats = computePeriodStats(filteredLeads);
    const prevStats = computePeriodStats(prevLeads);

    // Status distribution
    const statusOrder = ['NEW', 'CONTACTED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'WON', 'LOST'];
    const statusDistribution = statusOrder.map((key) => {
      const value = filteredLeads.filter((l) => l.status === key).length;
      const percentage =
        filteredLeads.length > 0 ? Math.round((value / filteredLeads.length) * 100) : 0;
      return {
        name: LEAD_STATUS_FROM_PRISMA[key],
        value,
        percentage,
      };
    });

    // Cumulative sales funnel
    const newCount = filteredLeads.length;
    const contactedCount = filteredLeads.filter(
      (l) => l.contactedAt || l.meetingAt || l.proposalAt || l.wonAt
    ).length;
    const meetingCount = filteredLeads.filter(
      (l) => l.meetingAt || l.proposalAt || l.wonAt
    ).length;
    const proposalCount = filteredLeads.filter((l) => l.proposalAt || l.wonAt).length;
    const wonCount = filteredLeads.filter((l) => l.status === 'WON' || l.wonAt).length;

    const funnelData = [
      { name: 'New', count: newCount },
      { name: 'Contacted', count: contactedCount },
      { name: 'Meeting', count: meetingCount },
      { name: 'Proposal', count: proposalCount },
      { name: 'Won', count: wonCount },
    ].map((stage) => {
      const conversionRate = newCount > 0 ? Math.round((stage.count / newCount) * 100) : 0;
      return {
        ...stage,
        conversionRate,
        dropoffRate: 100 - conversionRate,
      };
    });

    // Source distribution
    const sourceMap = {};
    filteredLeads.forEach((l) => {
      const label = LEAD_SOURCE_FROM_PRISMA[l.source] || 'Other';
      sourceMap[label] = (sourceMap[label] || 0) + 1;
    });
    const leadSourceStats = Object.entries(sourceMap)
      .map(([name, count]) => ({
        name,
        count,
        percentage:
          filteredLeads.length > 0 ? Math.round((count / filteredLeads.length) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count);

    // Last 6 months trends (computed from all leads in DB so monthly charts stay rich)
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        name: d.toLocaleDateString('en-US', { month: 'short' }),
        fullName: d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
      });
    }

    const monthlyPerformance = months.map(({ year, month, name, fullName }) => {
      const createdInMonth = allLeads.filter((l) => {
        const d = new Date(l.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const wonInMonth = allLeads.filter((l) => {
        if (l.status !== 'WON') return false;
        const d = new Date(l.wonAt || l.createdAt);
        return d.getFullYear() === year && d.getMonth() === month;
      });
      const total = createdInMonth.length;
      const won = createdInMonth.filter((l) => l.status === 'WON').length;
      const lost = createdInMonth.filter((l) => l.status === 'LOST').length;
      const rate = total > 0 ? Math.round((won / total) * 100) : 0;
      const revenue = wonInMonth.reduce((sum, l) => sum + (Number(l.value) || 0), 0);

      return { name, fullName, count: total, won, lost, rate, revenue };
    });

    // Forecast (average revenue of last 6 months)
    const total6MonthRev = monthlyPerformance.reduce((sum, m) => sum + m.revenue, 0);
    const avgMonthlyRev = monthlyPerformance.length > 0 ? total6MonthRev / monthlyPerformance.length : 0;
    const latestMonthRev = monthlyPerformance[monthlyPerformance.length - 1]?.revenue || 0;
    const forecastGrowth =
      avgMonthlyRev > 0
        ? Math.round(((latestMonthRev - avgMonthlyRev) / avgMonthlyRev) * 1000) / 10
        : 0;
    const revPoints = monthlyPerformance.filter((m) => m.revenue > 0).length;
    const confidenceScore =
      allLeads.length > 0
        ? Math.min(Math.round((revPoints / 6) * 70 + (allLeads.length > 10 ? 30 : 10)), 98)
        : 0;

    // Top performers by assignedTo / owner name
    const performersMap = {};
    filteredLeads
      .filter((l) => l.status === 'WON')
      .forEach((l) => {
        const repName = l.assignedTo?.name || l.owner?.name || 'Unassigned';
        performersMap[repName] = (performersMap[repName] || 0) + (Number(l.value) || 0);
      });
    const topPerformers = Object.entries(performersMap)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue);

    // 30-day activity heatmap from leads
    const heatmapMap = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split('T')[0];
      heatmapMap[key] = { date: key, count: 0, created: 0, meetings: 0, contacts: 0 };
    }
    allLeads.forEach((l) => {
      if (l.createdAt) {
        const key = new Date(l.createdAt).toISOString().split('T')[0];
        if (heatmapMap[key]) {
          heatmapMap[key].created += 1;
          heatmapMap[key].count += 1;
        }
      }
      if (l.meetingAt) {
        const key = new Date(l.meetingAt).toISOString().split('T')[0];
        if (heatmapMap[key]) {
          heatmapMap[key].meetings += 1;
          heatmapMap[key].count += 1;
        }
      }
      if (l.contactedAt) {
        const key = new Date(l.contactedAt).toISOString().split('T')[0];
        if (heatmapMap[key]) {
          heatmapMap[key].contacts += 1;
          heatmapMap[key].count += 1;
        }
      }
    });

    const totalRevenue =
      Number(customerRevenueAgg._sum.totalRevenue || 0) || allTimeSummary.wonRevenue;

    return successResponse(
      res,
      {
        dashboard: {
          totalLeads: allTimeSummary.totalLeads,
          activeLeads: allTimeSummary.activeLeads,
          convertedLeads: allTimeSummary.wonCount,
          lostLeads: allTimeSummary.lostCount,
          totalCustomers,
          revenue: totalRevenue,
          wonRevenue: allTimeSummary.wonRevenue,
          pipelineValue: allTimeSummary.pipelineValue,
          conversionRate: allTimeSummary.conversionRate,
          pendingTasks: pendingTasks + inProgressTasks,
          completedTasks,
          overdueTasks,
          recentLeads: allLeads.slice(0, 5).map(formatLead),
          recentActivities,
          statusDistribution: ['NEW', 'CONTACTED', 'MEETING_SCHEDULED', 'PROPOSAL_SENT', 'WON', 'LOST'].map(
            (key) => {
              const count = allLeads.filter((l) => l.status === key).length;
              return {
                name: LEAD_STATUS_FROM_PRISMA[key],
                count,
                percentage:
                  allLeads.length > 0 ? Math.round((count / allLeads.length) * 100) : 0,
              };
            }
          ),
          monthlyPerformance,
        },
        analytics: {
          totalAvailableLeads: allLeads.length,
          stats: {
            totalLeads: currentStats.totalLeads,
            totalLeadsGrowth: getGrowthPercent(currentStats.totalLeads, prevStats.totalLeads),
            conversionRate: currentStats.conversionRate,
            conversionRateGrowth:
              Math.round((currentStats.conversionRate - prevStats.conversionRate) * 10) / 10,
            pipelineValue: currentStats.pipelineValue,
            pipelineValueGrowth: getGrowthPercent(
              currentStats.pipelineValue,
              prevStats.pipelineValue
            ),
            wonRevenue: currentStats.wonRevenue,
            wonRevenueGrowth: getGrowthPercent(currentStats.wonRevenue, prevStats.wonRevenue),
            salesCycle: currentStats.salesCycle,
            salesCycleGrowth:
              prevStats.salesCycle > 0 ? currentStats.salesCycle - prevStats.salesCycle : 0,
            lostRate: currentStats.lostRate,
            lostRateGrowth: Math.round((currentStats.lostRate - prevStats.lostRate) * 10) / 10,
          },
          statusDistribution,
          funnelData,
          leadSourceStats,
          monthlyLeads: monthlyPerformance.map(({ name, fullName, count }) => ({
            name,
            fullName,
            count,
          })),
          conversionByMonth: monthlyPerformance.map(({ name, fullName, rate }) => ({
            name,
            fullName,
            rate,
          })),
          revenueByMonth: monthlyPerformance.map(({ name, fullName, revenue }) => ({
            name,
            fullName,
            revenue,
          })),
          salesVelocity: currentStats.salesVelocity,
          salesVelocityGrowth: getGrowthPercent(
            currentStats.salesVelocity,
            prevStats.salesVelocity
          ),
          forecast: {
            forecastedRevenue: Math.round(avgMonthlyRev),
            confidenceScore,
            growthTrend: forecastGrowth,
          },
          topPerformers,
          heatmapData: Object.values(heatmapMap),
        },
      },
      'Analytics overview retrieved successfully'
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy-compatible summary endpoint backed by PostgreSQL.
 * @route GET /api/leads/stats/summary
 * @access Private
 */
export const getLeadStats = async (req, res, next) => {
  try {
    const scope = buildRoleScope(req.user, 'ownerId', 'assignedToId');
    const leads = await prisma.lead.findMany({ where: scope });
    const summary = computePeriodStats(leads);
    return successResponse(res, summary, 'Analytics summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Legacy-compatible monthly endpoint backed by PostgreSQL.
 * @route GET /api/leads/stats/monthly
 * @access Private
 */
export const getMonthlyStats = async (req, res, next) => {
  try {
    const scope = buildRoleScope(req.user, 'ownerId', 'assignedToId');
    const leads = await prisma.lead.findMany({ where: scope });
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const year = d.getFullYear();
      const month = d.getMonth();
      const mName = d.toLocaleDateString('en-US', { month: 'short' });
      const matching = leads.filter((l) => {
        const ld = new Date(l.createdAt);
        return ld.getFullYear() === year && ld.getMonth() === month;
      });
      const won = matching.filter((l) => l.status === 'WON').length;
      const lost = matching.filter((l) => l.status === 'LOST').length;
      months.push({
        month: `${mName} ${year}`,
        total: matching.length,
        won,
        lost,
        conversionRate:
          matching.length > 0 ? Math.round((won / matching.length) * 1000) / 10 : 0,
      });
    }

    return successResponse(res, months, 'Monthly analytics retrieved');
  } catch (error) {
    next(error);
  }
};
