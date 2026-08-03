export const LEAD_STATUSES = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  MEETING_SCHEDULED: 'Meeting Scheduled',
  PROPOSAL_SENT: 'Proposal Sent',
  WON: 'Won',
  LOST: 'Lost',
};

export const LEAD_STATUS_COLORS = {
  [LEAD_STATUSES.NEW]: {
    bg: 'bg-slate-100 dark:bg-slate-900/40',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-800',
    hex: '#94A3B8',
  },
  [LEAD_STATUSES.CONTACTED]: {
    bg: 'bg-blue-50 dark:bg-blue-950/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-900',
    hex: '#2563EB',
  },
  [LEAD_STATUSES.MEETING_SCHEDULED]: {
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    text: 'text-amber-700 dark:text-amber-300',
    border: 'border-amber-200 dark:border-amber-900',
    hex: '#F59E0B',
  },
  [LEAD_STATUSES.PROPOSAL_SENT]: {
    bg: 'bg-purple-50 dark:bg-purple-950/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-900',
    hex: '#7C3AED',
  },
  [LEAD_STATUSES.WON]: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-900',
    hex: '#22C55E',
  },
  [LEAD_STATUSES.LOST]: {
    bg: 'bg-rose-50 dark:bg-rose-950/30',
    text: 'text-rose-700 dark:text-rose-300',
    border: 'border-rose-200 dark:border-rose-900',
    hex: '#EF4444',
  },
};

export const LEAD_SOURCES = [
  'Website',
  'Referral',
  'LinkedIn',
  'Cold Call',
  'Email Campaign',
  'Other'
];
