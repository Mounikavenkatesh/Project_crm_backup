import { useNavigate } from 'react-router-dom';
import { PlusCircle, ListFilter, Download } from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * QuickActions displays button shortcuts for common activities.
 *
 * @param {object} props The component props.
 * @param {Array} props.leads The array of all leads (for exporting).
 * @returns {React.ReactNode} The rendered quick actions box.
 */
export default function QuickActions({ leads = [] }) {
  const navigate = useNavigate();

  /**
   * Triggers lead creation flow by routing to Leads page and opening modal.
   */
  const handleAddNewLead = () => {
    navigate('/leads', { state: { openAddModal: true } });
  };

  /**
   * Triggers navigation to Leads page.
   */
  const handleViewAllLeads = () => {
    navigate('/leads');
  };

  /**
   * Generates a CSV string and downloads it.
   */
  const handleExportData = () => {
    if (leads.length === 0) {
      toast.error('No leads available to export!');
      return;
    }

    try {
      // Define CSV headers
      const headers = ['ID', 'Name', 'Company', 'Email', 'Phone', 'Status', 'Source', 'Created At'];
      
      // Map leads to CSV rows
      const rows = leads.map((lead) => [
        lead.id,
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.company.replace(/"/g, '""')}"`,
        lead.email,
        lead.phone || '',
        lead.status,
        lead.source,
        lead.createdAt,
      ]);

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows.map((row) => row.join(',')),
      ].join('\n');

      // Create a blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `startup_crm_leads_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Leads exported successfully as CSV!');
    } catch (error) {
      console.error(error);
      toast.error('Failed to export leads.');
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-6 shadow-sm flex flex-col h-full">
      <div className="border-b border-gray-100 dark:border-gray-700/50 pb-4">
        <h3 className="text-base font-bold text-gray-900 dark:text-white">
          Quick Actions
        </h3>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Fast shortcuts
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-3.5 mt-6 justify-center">
        <button
          onClick={handleAddNewLead}
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/10 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-150 active:scale-[0.98]"
        >
          <PlusCircle className="h-5 w-5" />
          Add New Lead
        </button>

        <button
          onClick={handleViewAllLeads}
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-150 active:scale-[0.98]"
        >
          <ListFilter className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          View All Leads
        </button>

        <button
          onClick={handleExportData}
          type="button"
          className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white px-4 py-3.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-850 dark:text-gray-200 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-150 active:scale-[0.98]"
        >
          <Download className="h-5 w-5 text-gray-400 dark:text-gray-500" />
          Export Leads CSV
        </button>
      </div>
    </div>
  );
}
