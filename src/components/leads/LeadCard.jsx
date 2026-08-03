import { Mail, Phone, Edit2, Trash2, Building } from 'lucide-react';
import StatusBadge from './StatusBadge';

/**
 * LeadCard shows a compact card representation of a single lead.
 * Primarily designed for mobile screens.
 *
 * @param {object} props The component props.
 * @param {object} props.lead The lead object.
 * @param {Function} props.onEdit Callback when edit button is clicked.
 * @param {Function} props.onDelete Callback when delete button is clicked.
 * @returns {React.ReactNode} The rendered lead card.
 */
export default function LeadCard({ lead, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200/80 dark:border-gray-700/60 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="text-base font-bold text-gray-900 dark:text-white leading-tight">
            {lead.name}
          </h4>
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 mt-1">
            <Building className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="text-xs font-medium">{lead.company}</span>
          </div>
        </div>
        <StatusBadge status={lead.status} />
      </div>

      {/* Contact Details */}
      <div className="mt-4 space-y-2 border-t border-b border-gray-50 dark:border-gray-700/40 py-3 text-xs text-gray-600 dark:text-gray-400">
        <a
          href={`mailto:${lead.email}`}
          className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <Mail className="h-4 w-4 text-gray-400" />
          <span className="truncate">{lead.email}</span>
        </a>
        
        {lead.phone ? (
          <a
            href={`tel:${lead.phone}`}
            className="flex items-center gap-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            <Phone className="h-4 w-4 text-gray-400" />
            <span>{lead.phone}</span>
          </a>
        ) : (
          <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 italic">
            <Phone className="h-4 w-4" />
            <span>No phone number</span>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Source
            </span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {lead.source}
            </span>
          </div>
          
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Value
            </span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-450">
              ₹{Number(lead.value || 0).toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Owner
            </span>
            <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
              {lead.owner || 'Unassigned'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => onEdit(lead)}
            type="button"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-blue-600 dark:hover:bg-gray-700/50 dark:hover:text-blue-400 transition duration-150 focus:outline-none"
            aria-label={`Edit ${lead.name}`}
          >
            <Edit2 className="h-4 w-4" />
          </button>
          
          <button
            onClick={() => onDelete(lead.id)}
            type="button"
            className="rounded-lg p-2 text-gray-400 hover:bg-gray-50 hover:text-rose-600 dark:hover:bg-gray-700/50 dark:hover:text-rose-450 transition duration-150 focus:outline-none"
            aria-label={`Delete ${lead.name}`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
