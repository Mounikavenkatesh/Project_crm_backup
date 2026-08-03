import { Mail, Phone, Edit2, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * LeadTable displays a dense tabular view of all lead rows.
 * Primarily designed for tablet and desktop screens.
 *
 * @param {object} props The component props.
 * @param {Array} props.leads The filtered array of leads to show.
 * @param {Function} props.onEdit Callback when edit row is clicked.
 * @param {Function} props.onDelete Callback when delete row is clicked.
 * @returns {React.ReactNode} The rendered lead table.
 */
export default function LeadTable({ leads = [], onEdit, onDelete }) {
  /**
   * Helper to format ISO dates.
   *
   * @param {string} dateString The ISO date.
   * @returns {string} The formatted date.
   */
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/80 dark:border-gray-700/60 bg-white dark:bg-gray-800 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700/60 bg-gray-50/75 dark:bg-gray-850/40 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              <th className="py-4 px-6 font-semibold">Name</th>
              <th className="py-4 px-6 font-semibold">Company</th>
              <th className="py-4 px-6 font-semibold">Status</th>
              <th className="py-4 px-6 font-semibold">Value</th>
              <th className="py-4 px-6 font-semibold">Owner</th>
              <th className="py-4 px-6 font-semibold">Email & Phone</th>
              <th className="py-4 px-6 font-semibold">Source</th>
              <th className="py-4 px-6 font-semibold">Date Added</th>
              <th className="py-4 px-6 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-150 dark:divide-gray-700/50">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="text-gray-700 dark:text-gray-300 transition-colors hover:bg-gray-50/40 dark:hover:bg-gray-800/15"
              >
                {/* Name */}
                <td className="py-4 px-6 font-semibold text-gray-900 dark:text-white">
                  {lead.name}
                </td>
                
                {/* Company */}
                <td className="py-4 px-6 text-gray-550 dark:text-gray-400 font-medium">
                  {lead.company}
                </td>
                
                {/* Status */}
                <td className="py-4 px-6">
                  <StatusBadge status={lead.status} />
                </td>
                
                {/* Value */}
                <td className="py-4 px-6 font-bold text-slate-800 dark:text-gray-250">
                  ₹{Number(lead.value || 0).toLocaleString('en-IN')}
                </td>

                {/* Owner */}
                <td className="py-4 px-6 text-sm font-semibold text-slate-700 dark:text-gray-300">
                  {lead.owner || 'Unassigned'}
                </td>
                
                {/* Email & Phone */}
                <td className="py-4 px-6 text-xs space-y-1">
                  <a
                    href={`mailto:${lead.email}`}
                    className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 font-medium tracking-tight"
                  >
                    <Mail className="h-3.5 w-3.5 text-gray-400" />
                    <span>{lead.email}</span>
                  </a>
                  {lead.phone && (
                    <a
                      href={`tel:${lead.phone}`}
                      className="flex items-center gap-1.5 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      <span>{lead.phone}</span>
                    </a>
                  )}
                </td>
                
                {/* Source */}
                <td className="py-4 px-6 text-sm font-semibold text-gray-600 dark:text-gray-450">
                  {lead.source}
                </td>
                
                {/* Date Added */}
                <td className="py-4 px-6 text-xs text-gray-500 dark:text-gray-450 font-medium">
                  {formatDate(lead.createdAt)}
                </td>
                
                {/* Actions */}
                <td className="py-4 px-6 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(lead)}
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-blue-600 dark:hover:bg-gray-700/50 dark:hover:text-blue-400 transition duration-150 focus:outline-none"
                      title={`Edit ${lead.name}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    
                    <button
                      onClick={() => onDelete(lead.id)}
                      type="button"
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-rose-600 dark:hover:bg-gray-700/50 dark:hover:text-rose-455 transition duration-150 focus:outline-none"
                      title={`Delete ${lead.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
