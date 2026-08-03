import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLeads } from '../context/LeadContext';
import useAnalytics from '../hooks/useAnalytics';

// Component imports
import AnalyticsFilters from '../components/analytics/AnalyticsFilters';
import StatsCards from '../components/analytics/StatsCards';
import PieChartCard from '../components/analytics/PieChartCard';
import FunnelChartCard from '../components/analytics/FunnelChartCard';
import BarChartCard from '../components/analytics/BarChartCard';
import LineChartCard from '../components/analytics/LineChartCard';
import RevenueChartCard from '../components/analytics/RevenueChartCard';
import LeadSourceChart from '../components/analytics/LeadSourceChart';
import SalesVelocityCard from '../components/analytics/SalesVelocityCard';
import ForecastCard from '../components/analytics/ForecastCard';
import ActivityHeatmap from '../components/analytics/ActivityHeatmap';
import TopPerformersCard from '../components/analytics/TopPerformersCard';
import EmptyAnalyticsState from '../components/analytics/EmptyAnalyticsState';
import LoadingSkeleton from '../components/analytics/LoadingSkeleton';

/**
 * Analytics page component assembles date filters, KPI highlights,
 * Recharts charts, revenue projections, leaderboard, and contribution logs.
 */
export default function Analytics() {
  const { leads = [] } = useLeads();
  const navigate = useNavigate();

  // Filter States
  const [filterType, setFilterType] = useState('30d');
  const [customRange, setCustomRange] = useState({
    startDate: '',
    endDate: '',
  });

  // Simulated initial load for polished skeleton rendering
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 400); // 400ms transition
    return () => clearTimeout(timer);
  }, [filterType, customRange]);

  // Invoke analytics calculation hook
  const {
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
  } = useAnalytics(leads, filterType, customRange);

  // Redirect callback for empty state CTA
  const handleAddNewLead = () => {
    navigate('/leads', { state: { openAddModal: true } });
  };

  // If there are zero leads in the entire app, show Empty State
  if (leads.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm">
            Track sales performance and growth trends.
          </p>
        </div>
        <EmptyAnalyticsState onAddLead={handleAddNewLead} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Section 1: Header */}
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Analytics Dashboard
          </h1>
          <p className="text-slate-500 dark:text-gray-400 mt-1 text-sm md:text-base">
            Track sales performance and growth trends.
          </p>
        </div>

        {/* Filter controls */}
        <AnalyticsFilters
          filterType={filterType}
          onFilterChange={(type) => {
            setIsLoading(true);
            setFilterType(type);
          }}
          customRange={customRange}
          onCustomRangeChange={(updater) => {
            setIsLoading(true);
            setCustomRange(updater);
          }}
        />
      </div>

      {isLoading ? (
        <LoadingSkeleton />
      ) : (
        <>
          {/* Section 2: KPI Metrics summary bar */}
          <StatsCards stats={stats} />

          {/* Section 3: Visual charts layout grid */}
          {/* Responsive: 1 column on mobile, 2 columns on tablet & desktop */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Row 1: Pie Chart & Funnel Chart */}
            <PieChartCard data={statusDistribution} />
            <FunnelChartCard data={funnelData} />

            {/* Row 2: Bar Chart & Line Chart */}
            <BarChartCard data={monthlyLeads} />
            <LineChartCard data={conversionByMonth} />

            {/* Row 3: Revenue Area Chart & Lead Sources */}
            <RevenueChartCard data={revenueByMonth} />
            <LeadSourceChart data={leadSourceStats} />

            {/* Row 4: Heatmap & Top Performers leaderboard */}
            <ActivityHeatmap data={heatmapData} />
            <TopPerformersCard performers={topPerformers} />

            {/* Row 5: Forecast widget & Sales Velocity */}
            <ForecastCard forecast={forecast} />
            <SalesVelocityCard velocity={salesVelocity} growth={salesVelocityGrowth} />
          </div>
        </>
      )}
    </div>
  );
}
