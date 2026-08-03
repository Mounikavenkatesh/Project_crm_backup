import { Users, Award, XCircle, Percent } from 'lucide-react';
import { useLeads } from '../context/LeadContext';
import StatsCard from '../components/dashboard/StatsCard';
import PipelineOverview from '../components/dashboard/PipelineOverview';
import RecentLeads from '../components/dashboard/RecentLeads';
import QuickActions from '../components/dashboard/QuickActions';

/**
 * Dashboard page represents the home viewport displaying KPIs, pipeline funnel, recent leads, and quick actions.
 */
export default function Dashboard() {
  const { leads = [] } = useLeads();

  const totalLeads = leads.length;
  const wonLeads = leads.filter((lead) => lead.status === 'Won').length;
  const lostLeads = leads.filter((lead) => lead.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

  // Let's compute actual month-over-month growth trends
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  // Helper to filter leads by date range
  const filterByDate = (items, start, end) =>
    items.filter((item) => {
      const date = new Date(item.createdAt);
      return date >= start && date < end;
    });

  // Recent 30 days leads
  const currentPeriodLeads = filterByDate(leads, thirtyDaysAgo, now);
  // Previous 30 days leads (from day 30 to 60)
  const previousPeriodLeads = filterByDate(leads, sixtyDaysAgo, thirtyDaysAgo);

  const calculateGrowth = (currentCount, prevCount) => {
    if (prevCount === 0) return currentCount > 0 ? 100 : 0;
    return ((currentCount - prevCount) / prevCount) * 100;
  };

  // 1. Growth for Total Leads
  const totalLeadsChange = calculateGrowth(currentPeriodLeads.length, previousPeriodLeads.length);

  // 2. Growth for Won Leads
  const currentWon = currentPeriodLeads.filter((l) => l.status === 'Won').length;
  const prevWon = previousPeriodLeads.filter((l) => l.status === 'Won').length;
  const wonLeadsChange = calculateGrowth(currentWon, prevWon);

  // 3. Growth for Lost Leads
  const currentLost = currentPeriodLeads.filter((l) => l.status === 'Lost').length;
  const prevLost = previousPeriodLeads.filter((l) => l.status === 'Lost').length;
  const lostLeadsChange = calculateGrowth(currentLost, prevLost);

  // 4. Growth for Conversion Rate
  const currentConv = currentPeriodLeads.length > 0 ? (currentWon / currentPeriodLeads.length) * 100 : 0;
  const prevConv = previousPeriodLeads.length > 0 ? (prevWon / previousPeriodLeads.length) * 100 : 0;
  const convChange = currentConv - prevConv; // Net percentage points change

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Good morning, Partner!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm md:text-base">
          Here is the status of your sales pipeline and contact logs today.
        </p>
      </div>

      {/* KPI Stats Grid */}
      {/* Responsive: 1 column on mobile, 2 on tablet, 4 on desktop */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          change={totalLeadsChange}
          color="blue"
        />
        <StatsCard
          title="Won Leads"
          value={wonLeads}
          icon={Award}
          change={wonLeadsChange}
          color="green"
        />
        <StatsCard
          title="Lost Leads"
          value={lostLeads}
          icon={XCircle}
          change={lostLeadsChange}
          color="red"
        />
        <StatsCard
          title="Conversion Rate"
          value={`${conversionRate.toFixed(1)}%`}
          icon={Percent}
          change={convChange}
          color="amber"
        />
      </div>

      {/* Pipeline Segmented progress bar */}
      <PipelineOverview leads={leads} />

      {/* Row with Recent Leads and Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent leads table takes 2 cols on lg, 1 on mobile/md */}
        <div className="lg:col-span-2">
          <RecentLeads leads={leads} />
        </div>
        
        {/* Quick actions box takes 1 col */}
        <div className="lg:col-span-1">
          <QuickActions leads={leads} />
        </div>
      </div>
    </div>
  );
}
