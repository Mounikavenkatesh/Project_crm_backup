import bcrypt from 'bcryptjs';
import prisma, { disconnectDB } from '../config/database.js';

async function main() {
  console.log('Checking database seed state...');
  const existingUsers = await prisma.user.count();
  if (existingUsers > 0) {
    console.log(`Database already has ${existingUsers} user(s). Skipping destructive seed.`);
    return;
  }

  const salt = await bcrypt.genSalt(10);
  const adminPassword = await bcrypt.hash('Admin@123', salt);
  const repPassword = await bcrypt.hash('User@123', salt);

  const admin = await prisma.user.create({
    data: {
      name: 'Aarav Admin',
      email: 'admin@startupcrm.io',
      password: adminPassword,
      role: 'ADMIN',
      jobTitle: 'VP of Sales',
      phone: '+91 98765 00001',
      settings: {
        create: {
          companyName: 'Startup CRM',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
      },
    },
  });

  const rep = await prisma.user.create({
    data: {
      name: 'Sarah Patel',
      email: 'sarah@startupcrm.io',
      password: repPassword,
      role: 'USER',
      jobTitle: 'Account Executive',
      phone: '+91 98765 00002',
      settings: {
        create: {
          companyName: 'Startup CRM',
          currency: 'INR',
          timezone: 'Asia/Kolkata',
        },
      },
    },
  });

  const now = Date.now();
  const daysAgo = (d) => new Date(now - d * 86400000);
  const daysAhead = (d) => new Date(now + d * 86400000);

  const leadsData = [
    {
      name: 'Rohan Gupta',
      company: 'Stellar Corp',
      email: 'rohan.gupta@stellarcorp.com',
      phone: '+91 98111 22334',
      status: 'WON',
      source: 'REFERRAL',
      value: 240000,
      notes: 'Annual enterprise license signed.',
      ownerId: admin.id,
      assignedToId: admin.id,
      createdAt: daysAgo(42),
      contactedAt: daysAgo(40),
      meetingAt: daysAgo(36),
      proposalAt: daysAgo(30),
      wonAt: daysAgo(25),
    },
    {
      name: 'Priya Sharma',
      company: 'Nexa Innovations',
      email: 'priya.sharma@nexainnovations.co',
      phone: '+91 98222 33445',
      status: 'WON',
      source: 'WEBSITE',
      value: 165000,
      notes: 'Onboarded Q4 growth plan.',
      ownerId: rep.id,
      assignedToId: rep.id,
      createdAt: daysAgo(28),
      contactedAt: daysAgo(26),
      meetingAt: daysAgo(22),
      proposalAt: daysAgo(18),
      wonAt: daysAgo(12),
    },
    {
      name: 'Ananya Iyer',
      company: 'Zenith Retail',
      email: 'ananya.iyer@zenithretail.in',
      phone: '+91 98333 44556',
      status: 'PROPOSAL_SENT',
      source: 'LINKEDIN',
      value: 150000,
      notes: 'Reviewing SLA terms and SSO add-on.',
      ownerId: admin.id,
      assignedToId: rep.id,
      createdAt: daysAgo(14),
      contactedAt: daysAgo(12),
      meetingAt: daysAgo(9),
      proposalAt: daysAgo(4),
    },
    {
      name: 'Kabir Singh',
      company: 'BlueWater Logistics',
      email: 'kabir.singh@bluewater.com',
      phone: '+91 98444 55667',
      status: 'MEETING_SCHEDULED',
      source: 'COLD_CALL',
      value: 95000,
      notes: 'Product demo scheduled for Friday.',
      ownerId: rep.id,
      assignedToId: rep.id,
      createdAt: daysAgo(8),
      contactedAt: daysAgo(6),
      meetingAt: daysAgo(3),
    },
    {
      name: 'Meera Nair',
      company: 'FinEdge Labs',
      email: 'meera.nair@finedgelabs.io',
      phone: '+91 98555 66778',
      status: 'CONTACTED',
      source: 'EMAIL_CAMPAIGN',
      value: 72000,
      notes: 'Sent intro deck and pricing tier sheet.',
      ownerId: admin.id,
      assignedToId: admin.id,
      createdAt: daysAgo(5),
      contactedAt: daysAgo(4),
    },
    {
      name: 'Vikram Desai',
      company: 'CloudPulse AI',
      email: 'vikram@cloudpulse.ai',
      phone: '+91 98666 77889',
      status: 'NEW',
      source: 'WEBSITE',
      value: 110000,
      notes: 'Inbound signup from pricing page.',
      ownerId: admin.id,
      assignedToId: rep.id,
      createdAt: daysAgo(2),
    },
    {
      name: 'Diya Patel',
      company: 'Aura Organic Foods',
      email: 'diya.patel@auraorganics.in',
      phone: '+91 98777 88990',
      status: 'LOST',
      source: 'OTHER',
      value: 60000,
      notes: 'Deferred budget until next fiscal year.',
      ownerId: rep.id,
      assignedToId: rep.id,
      createdAt: daysAgo(55),
      contactedAt: daysAgo(52),
      meetingAt: daysAgo(48),
      lostAt: daysAgo(40),
    },
  ];

  const createdLeads = [];
  for (const item of leadsData) {
    const lead = await prisma.lead.create({ data: item });
    createdLeads.push(lead);
  }

  const customer1 = await prisma.customer.create({
    data: {
      name: 'Rohan Gupta',
      company: 'Stellar Corp',
      email: 'rohan.gupta@stellarcorp.com',
      phone: '+91 98111 22334',
      industry: 'Enterprise SaaS',
      website: 'https://stellarcorp.com',
      address: 'Bengaluru, India',
      status: 'VIP',
      totalRevenue: 240000,
      notes: 'Flagship enterprise account.',
      ownerId: admin.id,
      sourceLeadId: createdLeads[0].id,
    },
  });

  const customer2 = await prisma.customer.create({
    data: {
      name: 'Priya Sharma',
      company: 'Nexa Innovations',
      email: 'priya.sharma@nexainnovations.co',
      phone: '+91 98222 33445',
      industry: 'FinTech',
      website: 'https://nexainnovations.co',
      address: 'Mumbai, India',
      status: 'ACTIVE',
      totalRevenue: 165000,
      notes: 'Active Q4 growth subscription.',
      ownerId: rep.id,
      sourceLeadId: createdLeads[1].id,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Follow up on Zenith Retail SLA review',
        description: 'Confirm security questionnaire responses with Ananya.',
        status: 'PENDING',
        priority: 'HIGH',
        dueDate: daysAhead(2),
        assignedToId: rep.id,
        createdById: admin.id,
        leadId: createdLeads[2].id,
      },
      {
        title: 'Prepare product demo deck for BlueWater',
        description: 'Include logistics tracking workflow examples.',
        status: 'IN_PROGRESS',
        priority: 'URGENT',
        dueDate: daysAhead(1),
        assignedToId: rep.id,
        createdById: rep.id,
        leadId: createdLeads[3].id,
      },
      {
        title: 'Quarterly check-in with Stellar Corp',
        description: 'Review adoption metrics and expansion seats.',
        status: 'PENDING',
        priority: 'MEDIUM',
        dueDate: daysAhead(5),
        assignedToId: admin.id,
        createdById: admin.id,
        customerId: customer1.id,
      },
      {
        title: 'Send onboarding checklist to Nexa Innovations',
        description: 'Delivered welcome packet and API credentials.',
        status: 'COMPLETED',
        priority: 'LOW',
        dueDate: daysAgo(5),
        completedAt: daysAgo(6),
        assignedToId: rep.id,
        createdById: admin.id,
        customerId: customer2.id,
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        type: 'LEAD_CONVERTED',
        title: 'Converted Rohan Gupta to VIP customer',
        description: 'Stellar Corp • Deal Value ₹2,40,000',
        userId: admin.id,
        leadId: createdLeads[0].id,
        customerId: customer1.id,
      },
      {
        type: 'LEAD_CREATED',
        title: 'Added lead Vikram Desai',
        description: 'CloudPulse AI • Est. Value ₹1,10,000',
        userId: admin.id,
        leadId: createdLeads[5].id,
      },
      {
        type: 'TASK_CREATED',
        title: 'Assigned SLA follow-up task to Sarah Patel',
        description: 'Zenith Retail proposal review',
        userId: admin.id,
        leadId: createdLeads[2].id,
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        userId: admin.id,
        title: 'Welcome to Startup CRM',
        message: 'Sample startup CRM data has been seeded successfully.',
        type: 'SUCCESS',
        link: '/',
      },
      {
        userId: rep.id,
        title: 'New Lead Assigned',
        message: 'Vikram Desai (CloudPulse AI) was assigned to you.',
        type: 'INFO',
        link: '/leads',
      },
    ],
  });

  console.log('Seed complete! Demo accounts: admin@startupcrm.io / Admin@123 and sarah@startupcrm.io / User@123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await disconnectDB();
  });
