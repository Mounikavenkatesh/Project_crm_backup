import { useMemo } from 'react';
import * as helpers from '../utils/analyticsHelpers';

/**
 * Custom hook useAnalytics filters lead data by date range
 * and computes all dashboard stats and Recharts datasets.
 *
 * @param {Array} leads Raw lead data array.
 * @param {string} filterType Filter selection: '7d' | '30d' | '90d' | 'ytd' | 'custom'
 * @param {object} [customRange] Optional custom range { startDate: string, endDate: string }
 * @returns {object} Calculated stats, datasets, and filtered leads.
 */
export default function useAnalytics(leads = [], filterType = '30d', customRange = null) {
  const filteredData = useMemo(() => {
    if (!leads || leads.length === 0) {
      return {
        filteredLeads: [],
        prevLeads: [],
      };
    }

    const now = new Date();
    let start = new Date();
    let end = new Date();
    let prevStart = new Date();
    let prevEnd = new Date();

    switch (filterType) {
      case '7d':
        start.setDate(now.getDate() - 7);
        end.setTime(now.getTime());
        prevStart.setDate(now.getDate() - 14);
        prevEnd.setDate(now.getDate() - 7);
        break;
      case '30d':
        start.setDate(now.getDate() - 30);
        end.setTime(now.getTime());
        prevStart.setDate(now.getDate() - 60);
        prevEnd.setDate(now.getDate() - 30);
        break;
      case '90d':
        start.setDate(now.getDate() - 90);
        end.setTime(now.getTime());
        prevStart.setDate(now.getDate() - 180);
        prevEnd.setDate(now.getDate() - 90);
        break;
      case 'ytd':
        start = new Date(now.getFullYear(), 0, 1);
        end.setTime(now.getTime());
        prevStart = new Date(now.getFullYear() - 1, 0, 1);
        prevEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59);
        break;
      case 'custom':
        if (customRange && customRange.startDate && customRange.endDate) {
          start = new Date(customRange.startDate);
          end = new Date(customRange.endDate);
          end.setHours(23, 59, 59, 999); // include full day

          const durationMs = end.getTime() - start.getTime();
          prevEnd = new Date(start.getTime() - 1);
          prevStart = new Date(start.getTime() - durationMs);
        } else {
          // Fallback to 30d if range missing
          start.setDate(now.getDate() - 30);
          end.setTime(now.getTime());
          prevStart.setDate(now.getDate() - 60);
          prevEnd.setDate(now.getDate() - 30);
        }
        break;
      default:
        start.setDate(now.getDate() - 30);
        end.setTime(now.getTime());
        prevStart.setDate(now.getDate() - 60);
        prevEnd.setDate(now.getDate() - 30);
    }

    const startMs = start.getTime();
    const endMs = end.getTime();
    const prevStartMs = prevStart.getTime();
    const prevEndMs = prevEnd.getTime();

    // Filter leads into current and previous cohorts
    const filteredLeads = [];
    const prevLeads = [];

    leads.forEach((lead) => {
      const createdDate = lead.createdAt ? new Date(lead.createdAt).getTime() : 0;
      if (createdDate >= startMs && createdDate <= endMs) {
        filteredLeads.push(lead);
      } else if (createdDate >= prevStartMs && createdDate <= prevEndMs) {
        prevLeads.push(lead);
      }
    });

    return { filteredLeads, prevLeads };
  }, [leads, filterType, customRange]);

  const { filteredLeads, prevLeads } = filteredData;

  // Memoized Selector Computations for Charts & Cards
  const stats = useMemo(() => {
    // Current period calculations
    const totalLeads = filteredLeads.length;
    const wonCount = filteredLeads.filter((l) => l.status === 'Won').length;
    const lostCount = filteredLeads.filter((l) => l.status === 'Lost').length;
    const conversionRate = totalLeads > 0 ? Math.round((wonCount / totalLeads) * 100) : 0;
    const pipelineValue = helpers.getPipelineValue(filteredLeads);
    const wonRevenue = helpers.getWonRevenue(filteredLeads);
    const salesCycle = helpers.getAverageSalesCycle(filteredLeads);
    const lostRate = helpers.getLostRate(filteredLeads);

    // Previous period calculations for MoM comparison
    const prevTotalLeads = prevLeads.length;
    const prevWon = prevLeads.filter((l) => l.status === 'Won').length;
    const prevConversionRate = prevTotalLeads > 0 ? Math.round((prevWon / prevTotalLeads) * 100) : 0;
    const prevPipelineValue = helpers.getPipelineValue(prevLeads);
    const prevWonRevenue = helpers.getWonRevenue(prevLeads);
    const prevSalesCycle = helpers.getAverageSalesCycle(prevLeads);
    const prevLostRate = helpers.getLostRate(prevLeads);

    // Compute trend differentials
    const getGrowth = (current, prev) => {
      if (prev === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - prev) / prev) * 100);
    };

    return {
      totalLeads,
      totalLeadsGrowth: getGrowth(totalLeads, prevTotalLeads),
      
      conversionRate,
      conversionRateGrowth: conversionRate - prevConversionRate, // Net percentage points change
      
      pipelineValue,
      pipelineValueGrowth: getGrowth(pipelineValue, prevPipelineValue),
      
      wonRevenue,
      wonRevenueGrowth: getGrowth(wonRevenue, prevWonRevenue),
      
      salesCycle,
      salesCycleGrowth: prevSalesCycle > 0 ? salesCycle - prevSalesCycle : 0, // Days change
      
      lostRate,
      lostRateGrowth: lostRate - prevLostRate, // Net percentage points change
    };
  }, [filteredLeads, prevLeads]);

  // Chart datasets
  const statusDistribution = useMemo(() => helpers.getStatusDistribution(filteredLeads), [filteredLeads]);
  const monthlyLeads = useMemo(() => helpers.getMonthlyLeads(filteredLeads), [filteredLeads]);
  const conversionByMonth = useMemo(() => helpers.getConversionByMonth(filteredLeads), [filteredLeads]);
  const revenueByMonth = useMemo(() => helpers.getRevenueByMonth(filteredLeads), [filteredLeads]);
  const leadSourceStats = useMemo(() => helpers.getLeadSourceStats(filteredLeads), [filteredLeads]);
  const funnelData = useMemo(() => helpers.getFunnelData(filteredLeads), [filteredLeads]);
  const salesVelocity = useMemo(() => helpers.getSalesVelocity(filteredLeads), [filteredLeads]);
  
  // Previous velocity for trend
  const prevSalesVelocity = useMemo(() => helpers.getSalesVelocity(prevLeads), [prevLeads]);
  const salesVelocityGrowth = useMemo(() => {
    if (prevSalesVelocity === 0) return salesVelocity > 0 ? 100 : 0;
    return Math.round(((salesVelocity - prevSalesVelocity) / prevSalesVelocity) * 100);
  }, [salesVelocity, prevSalesVelocity]);

  // Forecasting and performers
  const forecast = useMemo(() => helpers.getForecastRevenue(filteredLeads), [filteredLeads]);
  const topPerformers = useMemo(() => helpers.getTopPerformers(filteredLeads), [filteredLeads]);
  const heatmapData = useMemo(() => helpers.getActivityHeatmapData(filteredLeads), [filteredLeads]);

  return {
    filteredLeads,
    stats,
    statusDistribution,
    monthlyLeads,
    conversionByMonth,
    revenueByMonth,
    leadSourceStats,
    funnelData,
    salesVelocity,
    salesVelocityGrowth,
    forecast,
    topPerformers,
    heatmapData,
  };
}
