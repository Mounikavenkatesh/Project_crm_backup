/**
 * Centralized enum mappings and record serializers between Prisma enums and REST API strings.
 */

export const LEAD_STATUS_TO_PRISMA = {
  New: 'NEW',
  NEW: 'NEW',
  Contacted: 'CONTACTED',
  CONTACTED: 'CONTACTED',
  'Meeting Scheduled': 'MEETING_SCHEDULED',
  MEETING_SCHEDULED: 'MEETING_SCHEDULED',
  'Proposal Sent': 'PROPOSAL_SENT',
  PROPOSAL_SENT: 'PROPOSAL_SENT',
  Won: 'WON',
  WON: 'WON',
  Lost: 'LOST',
  LOST: 'LOST',
};

export const LEAD_STATUS_FROM_PRISMA = {
  NEW: 'New',
  CONTACTED: 'Contacted',
  MEETING_SCHEDULED: 'Meeting Scheduled',
  PROPOSAL_SENT: 'Proposal Sent',
  WON: 'Won',
  LOST: 'Lost',
};

export const LEAD_SOURCE_TO_PRISMA = {
  Website: 'WEBSITE',
  WEBSITE: 'WEBSITE',
  Referral: 'REFERRAL',
  REFERRAL: 'REFERRAL',
  LinkedIn: 'LINKEDIN',
  LINKEDIN: 'LINKEDIN',
  'Cold Call': 'COLD_CALL',
  COLD_CALL: 'COLD_CALL',
  'Email Campaign': 'EMAIL_CAMPAIGN',
  EMAIL_CAMPAIGN: 'EMAIL_CAMPAIGN',
  Other: 'OTHER',
  OTHER: 'OTHER',
};

export const LEAD_SOURCE_FROM_PRISMA = {
  WEBSITE: 'Website',
  REFERRAL: 'Referral',
  LINKEDIN: 'LinkedIn',
  COLD_CALL: 'Cold Call',
  EMAIL_CAMPAIGN: 'Email Campaign',
  OTHER: 'Other',
};

export const USER_ROLE_TO_PRISMA = {
  admin: 'ADMIN',
  ADMIN: 'ADMIN',
  manager: 'MANAGER',
  MANAGER: 'MANAGER',
  user: 'USER',
  USER: 'USER',
};

export const USER_ROLE_FROM_PRISMA = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  USER: 'user',
};

export const CUSTOMER_STATUS_TO_PRISMA = {
  Active: 'ACTIVE',
  ACTIVE: 'ACTIVE',
  Inactive: 'INACTIVE',
  INACTIVE: 'INACTIVE',
  Churned: 'CHURNED',
  CHURNED: 'CHURNED',
  VIP: 'VIP',
};

export const CUSTOMER_STATUS_FROM_PRISMA = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  CHURNED: 'Churned',
  VIP: 'VIP',
};

export const TASK_STATUS_TO_PRISMA = {
  Pending: 'PENDING',
  PENDING: 'PENDING',
  'In Progress': 'IN_PROGRESS',
  IN_PROGRESS: 'IN_PROGRESS',
  Completed: 'COMPLETED',
  COMPLETED: 'COMPLETED',
  Cancelled: 'CANCELLED',
  CANCELLED: 'CANCELLED',
};

export const TASK_STATUS_FROM_PRISMA = {
  PENDING: 'Pending',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

export const TASK_PRIORITY_TO_PRISMA = {
  Low: 'LOW',
  LOW: 'LOW',
  Medium: 'MEDIUM',
  MEDIUM: 'MEDIUM',
  High: 'HIGH',
  HIGH: 'HIGH',
  Urgent: 'URGENT',
  URGENT: 'URGENT',
};

export const TASK_PRIORITY_FROM_PRISMA = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

/**
 * Strip sensitive fields from a User record and normalize role casing.
 */
export const formatUser = (user) => {
  if (!user) return null;
  const { password: _password, ...rest } = user;
  return {
    ...rest,
    role: USER_ROLE_FROM_PRISMA[user.role] || 'user',
  };
};

/**
 * Serialize a Lead record with readable status/source and owner/assignee summary.
 */
export const formatLead = (lead) => {
  if (!lead) return null;
  const assignee = lead.assignedTo || lead.owner || null;
  return {
    ...lead,
    status: LEAD_STATUS_FROM_PRISMA[lead.status] || lead.status,
    source: LEAD_SOURCE_FROM_PRISMA[lead.source] || lead.source,
    ownerName: lead.owner?.name || null,
    assignedToName: assignee?.name || null,
  };
};

/**
 * Serialize a Customer record with readable status.
 */
export const formatCustomer = (customer) => {
  if (!customer) return null;
  return {
    ...customer,
    status: CUSTOMER_STATUS_FROM_PRISMA[customer.status] || customer.status,
    ownerName: customer.owner?.name || null,
  };
};

/**
 * Serialize a Task record with readable status and priority.
 */
export const formatTask = (task) => {
  if (!task) return null;
  return {
    ...task,
    status: TASK_STATUS_FROM_PRISMA[task.status] || task.status,
    priority: TASK_PRIORITY_FROM_PRISMA[task.priority] || task.priority,
    assignedToName: task.assignedTo?.name || null,
    createdByName: task.createdBy?.name || null,
  };
};
