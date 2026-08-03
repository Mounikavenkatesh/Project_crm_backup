import { LEAD_STATUSES } from '../constants';

export const sampleLeads = [
  {
    id: 'lead-1',
    name: 'Aarav Mehta',
    company: 'Apex Tech Solutions',
    email: 'aarav.mehta@apextech.in',
    phone: '+91 98765 43210',
    status: LEAD_STATUSES.NEW,
    source: 'LinkedIn',
    value: 45000,
    owner: 'Sarah',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: 'lead-2',
    name: 'Priya Sharma',
    company: 'Nexa Innovations',
    email: 'priya.sharma@nexainnovations.co',
    phone: '+91 87654 32109',
    status: LEAD_STATUSES.CONTACTED,
    source: 'Website',
    value: 80000,
    owner: 'Sarah',
    createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(), // 12 days ago
    contactedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-3',
    name: 'Rohan Gupta',
    company: 'Stellar Corp',
    email: 'rohan.gupta@stellarcorp.com',
    phone: '+91 76543 21098',
    status: LEAD_STATUSES.MEETING_SCHEDULED,
    source: 'Referral',
    value: 120000,
    owner: 'Alex',
    createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(), // 20 days ago
    contactedAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
    meetingAt: new Date(Date.now() - 17 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-4',
    name: 'Ananya Iyer',
    company: 'Zenith Retail',
    email: 'ananya.iyer@zenithretail.in',
    phone: '+91 65432 10987',
    status: LEAD_STATUSES.PROPOSAL_SENT,
    source: 'Cold Call',
    value: 150000,
    owner: 'Alex',
    createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(), // 35 days ago
    contactedAt: new Date(Date.now() - 33 * 24 * 60 * 60 * 1000).toISOString(),
    meetingAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    proposalAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-5',
    name: 'Kabir Singh',
    company: 'BlueWater Logistics',
    email: 'kabir.singh@bluewater.com',
    phone: '+91 95432 18765',
    status: LEAD_STATUSES.WON,
    source: 'Email Campaign',
    value: 250000,
    owner: 'Sarah',
    createdAt: new Date(Date.now() - 48 * 24 * 60 * 60 * 1000).toISOString(), // 48 days ago
    contactedAt: new Date(Date.now() - 46 * 24 * 60 * 60 * 1000).toISOString(),
    meetingAt: new Date(Date.now() - 44 * 24 * 60 * 60 * 1000).toISOString(),
    proposalAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
    wonAt: new Date(Date.now() - 38 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'lead-6',
    name: 'Diya Patel',
    company: 'Aura Organic Foods',
    email: 'diya.patel@auraorganics.in',
    phone: '+91 94321 09876',
    status: LEAD_STATUSES.LOST,
    source: 'Other',
    value: 60000,
    owner: 'David',
    createdAt: new Date(Date.now() - 65 * 24 * 60 * 60 * 1000).toISOString(), // 65 days ago
    contactedAt: new Date(Date.now() - 63 * 24 * 60 * 60 * 1000).toISOString(),
    meetingAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
  }
];
