import { STATUS_COLORS } from '../constants/analyticsColors';

/**
 * Generates metadata for the last 6 calendar months in chronological order.
 * E.g. [{ year: 2026, month: 1, name: 'Feb' }, ...]
 */
const getLast6Months = () => {
  const months = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      name: d.toLocaleDateString('en-US', { month: 'short' }),
      fullName: d.toLocaleDateString('en-US', { month: 'long' }),
    });
  }
  return months;
};

/**
 * Safe date parsing to avoid crashes.
 */
const safeParseDate = (dateStr) => {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return isNaN(d.getTime()) ? null : d;
};

/**
 * 1. getStatusDistribution(leads)
 * Counts leads in each status and returns ratios.
 */
export function getStatusDistribution(leads = []) {
  const total = leads.length;
  return Object.keys(STATUS_COLORS).map((status) => {
    const value = leads.filter((lead) => lead.status === status).length;
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
    return { name: status, value, percentage };
  });
}

/**
 * 2. getMonthlyLeads(leads)
 * Gets lead signup counts over the last 6 months.
 */
export function getMonthlyLeads(leads = []) {
  const months = getLast6Months();
  return months.map(({ year, month, name }) => {
    const count = leads.filter((lead) => {
      const date = safeParseDate(lead.createdAt);
      return date && date.getFullYear() === year && date.getMonth() === month;
    }).length;
    return { name, count };
  });
}

/**
 * 3. getConversionByMonth(leads)
 * Calculates conversion rates (Won / Total) for leads created in each of the last 6 months.
 */
export function getConversionByMonth(leads = []) {
  const months = getLast6Months();
  return months.map(({ year, month, name }) => {
    const monthlyLeads = leads.filter((lead) => {
      const date = safeParseDate(lead.createdAt);
      return date && date.getFullYear() === year && date.getMonth() === month;
    });
    const total = monthlyLeads.length;
    const won = monthlyLeads.filter((lead) => lead.status === 'Won').length;
    const rate = total > 0 ? Math.round((won / total) * 100) : 0;
    return { name, rate };
  });
}

/**
 * 4. getRevenueByMonth(leads)
 * Won deals revenue grouped by month (using wonAt if available, fallback to createdAt).
 */
export function getRevenueByMonth(leads = []) {
  const months = getLast6Months();
  return months.map(({ year, month, name }) => {
    const revenue = leads
      .filter((lead) => {
        if (lead.status !== 'Won') return false;
        const date = safeParseDate(lead.wonAt || lead.createdAt);
        return date && date.getFullYear() === year && date.getMonth() === month;
      })
      .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
    return { name, revenue };
  });
}

/**
 * 5. getPipelineValue(leads)
 * Sum of value for active deals (not Won, not Lost).
 */
export function getPipelineValue(leads = []) {
  return leads
    .filter((lead) => lead.status !== 'Won' && lead.status !== 'Lost')
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
}

/**
 * 6. getWonRevenue(leads)
 * Sum of value for Won leads.
 */
export function getWonRevenue(leads = []) {
  return leads
    .filter((lead) => lead.status === 'Won')
    .reduce((sum, lead) => sum + (Number(lead.value) || 0), 0);
}

/**
 * 7. getAverageSalesCycle(leads)
 * Average days from createdAt to wonAt for Won leads.
 */
export function getAverageSalesCycle(leads = []) {
  const wonLeads = leads.filter((lead) => lead.status === 'Won');
  let totalDays = 0;
  let count = 0;

  wonLeads.forEach((lead) => {
    const start = safeParseDate(lead.createdAt);
    const end = safeParseDate(lead.wonAt);
    if (start && end) {
      const diffTime = Math.abs(end - start);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      totalDays += diffDays;
      count++;
    }
  });

  return count > 0 ? Math.round(totalDays / count) : 0;
}

/**
 * 8. getLostRate(leads)
 * Lost Leads / Total Leads.
 */
export function getLostRate(leads = []) {
  const total = leads.length;
  if (total === 0) return 0;
  const lost = leads.filter((lead) => lead.status === 'Lost').length;
  return Math.round((lost / total) * 100);
}

/**
 * 9. getLeadSourceStats(leads)
 * Counts by source, sorted descending.
 */
export function getLeadSourceStats(leads = []) {
  const sourceCounts = {};
  leads.forEach((lead) => {
    const source = lead.source || 'Other';
    sourceCounts[source] = (sourceCounts[source] || 0) + 1;
  });

  const total = leads.length;

  return Object.entries(sourceCounts)
    .map(([name, count]) => ({
      name,
      count,
      percentage: total > 0 ? Math.round((count / total) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * 10. getFunnelData(leads)
 * Computes sales funnel stages cumulatively.
 * A lead counts for a stage if that stage date is present, or if it is won.
 */
export function getFunnelData(leads = []) {
  const total = leads.length;

  // Cumulative funnel calculation
  const newCount = leads.length;
  
  const contactedCount = leads.filter(
    (l) => l.contactedAt || l.meetingAt || l.proposalAt || l.wonAt
  ).length;

  const meetingCount = leads.filter(
    (l) => l.meetingAt || l.proposalAt || l.wonAt
  ).length;

  const proposalCount = leads.filter(
    (l) => l.proposalAt || l.wonAt
  ).length;

  const wonCount = leads.filter((l) => l.status === 'Won' || l.wonAt).length;

  const rawStages = [
    { name: 'New', count: newCount },
    { name: 'Contacted', count: contactedCount },
    { name: 'Meeting', count: meetingCount },
    { name: 'Proposal', count: proposalCount },
    { name: 'Won', count: wonCount },
  ];

  return rawStages.map((stage) => {
    const conversionRate = newCount > 0 ? Math.round((stage.count / newCount) * 100) : 0;
    const dropoffRate = 100 - conversionRate;
    return {
      ...stage,
      conversionRate,
      dropoffRate,
    };
  });
}

/**
 * 11. getSalesVelocity(leads)
 * Formula: (Opportunities * Win Rate * Avg Deal Size) / Sales Cycle Length
 */
export function getSalesVelocity(leads = []) {
  const activeLeads = leads.filter((l) => l.status !== 'Won' && l.status !== 'Lost').length;
  const totalClosed = leads.filter((l) => l.status === 'Won' || l.status === 'Lost').length;
  const wonCount = leads.filter((l) => l.status === 'Won').length;

  // Opportunities count (we can use active leads or total opportunities)
  const opportunities = activeLeads || leads.length || 0;
  
  // Win rate (Won / Total closed, fallback to Won / Total)
  const winRate = totalClosed > 0 ? wonCount / totalClosed : leads.length > 0 ? wonCount / leads.length : 0;

  // Avg Deal Size of won deals
  const wonRevenue = getWonRevenue(leads);
  const avgDealSize = wonCount > 0 ? wonRevenue / wonCount : 0;

  // Sales cycle in days
  const salesCycle = getAverageSalesCycle(leads) || 10; // Default fallback to 10 days to avoid division by zero

  const dailyVelocity = (opportunities * winRate * avgDealSize) / salesCycle;
  return Math.round(dailyVelocity);
}

/**
 * 12. getForecastRevenue(leads)
 * Forecast using: Average Revenue of Last 6 Months
 */
export function getForecastRevenue(leads = []) {
  const monthlyRev = getRevenueByMonth(leads);
  const sum = monthlyRev.reduce((acc, curr) => acc + curr.revenue, 0);
  const averageRevenue = monthlyRev.length > 0 ? sum / monthlyRev.length : 0;

  // Growth Trend: Compare latest month vs average
  const latestMonthRevenue = monthlyRev[monthlyRev.length - 1]?.revenue || 0;
  const growthTrend = averageRevenue > 0 ? ((latestMonthRevenue - averageRevenue) / averageRevenue) * 100 : 0;

  // Confidence Score: Higher data volume and steady revenue yields higher confidence (0-100)
  const dataPoints = monthlyRev.filter((r) => r.revenue > 0).length;
  const confidenceScore = Math.min(Math.round((dataPoints / 6) * 70 + (leads.length > 10 ? 30 : 0)), 98);

  return {
    forecastedRevenue: Math.round(averageRevenue),
    confidenceScore: totalLeadsCount(leads) > 0 ? confidenceScore : 0,
    growthTrend: parseFloat(growthTrend.toFixed(1)),
  };
}

// Internal helper for forecast empty checks
const totalLeadsCount = (leads) => leads.length;

/**
 * 13. getTopPerformers(leads)
 * Group won deal value by owner.
 */
export function getTopPerformers(leads = []) {
  const performers = {};
  leads
    .filter((lead) => lead.status === 'Won')
    .forEach((lead) => {
      const rep = lead.owner || 'Unassigned';
      performers[rep] = (performers[rep] || 0) + (Number(lead.value) || 0);
    });

  return Object.entries(performers)
    .map(([name, revenue]) => ({ name, revenue }))
    .sort((a, b) => b.revenue - a.revenue);
}

/**
 * 14. getActivityHeatmapData(leads)
 * Generates Github contribution style heatmap logs for the last 30 days.
 */
export function getActivityHeatmapData(leads = []) {
  const dataMap = {};
  
  // Initialize last 30 days
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    dataMap[dateString] = {
      date: dateString,
      count: 0,
      created: 0,
      meetings: 0,
      contacts: 0,
    };
  }

  // Count leads created, contacted, or meeting set
  leads.forEach((lead) => {
    // 1. Created
    const createdDate = safeParseDate(lead.createdAt);
    if (createdDate) {
      const key = createdDate.toISOString().split('T')[0];
      if (dataMap[key]) {
        dataMap[key].created++;
        dataMap[key].count++;
      }
    }
    // 2. Meeting
    const meetingDate = safeParseDate(lead.meetingAt);
    if (meetingDate) {
      const key = meetingDate.toISOString().split('T')[0];
      if (dataMap[key]) {
        dataMap[key].meetings++;
        dataMap[key].count++;
      }
    }
    // 3. Contacted
    const contactedDate = safeParseDate(lead.contactedAt);
    if (contactedDate) {
      const key = contactedDate.toISOString().split('T')[0];
      if (dataMap[key]) {
        dataMap[key].contacts++;
        dataMap[key].count++;
      }
    }
  });

  return Object.values(dataMap);
}
