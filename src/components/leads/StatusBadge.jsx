import { LEAD_STATUS_COLORS } from '../../constants';

/**
 * StatusBadge displays a pill-shaped colored badge for a lead's status.
 *
 * @param {object} props The component props.
 * @param {string} props.status The lead status value.
 * @returns {React.ReactNode} The rendered status badge.
 */
export default function StatusBadge({ status }) {
  const colorInfo = LEAD_STATUS_COLORS[status] || {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-800 dark:text-gray-200',
    border: 'border-gray-200 dark:border-gray-700',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold border ${colorInfo.bg} ${colorInfo.text} ${colorInfo.border}`}
    >
      {status}
    </span>
  );
}
