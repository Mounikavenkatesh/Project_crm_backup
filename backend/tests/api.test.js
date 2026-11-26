import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import jwt from 'jsonwebtoken';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test_jwt_secret_for_unit_suite';
process.env.DATABASE_URL =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/project_crm?schema=public';
process.env.FRONTEND_URL = 'https://crm-prod-preview.vercel.app/';

const { default: app } = await import('../server.js');
const { default: prisma, normalizeDatabaseUrl } = await import('../config/database.js');
const {
  formatUser,
  formatLead,
  formatCustomer,
  formatTask,
  LEAD_STATUS_TO_PRISMA,
} = await import('../utils/crmEnums.js');

const startTestServer = () =>
  new Promise((resolve) => {
    const server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, baseUrl: `http://127.0.0.1:${addr.port}` });
    });
  });

test('normalizeDatabaseUrl appends PgBouncer and timeout params for Neon pooler URLs', () => {
  const pooled = normalizeDatabaseUrl(
    'postgresql://user:pass@ep-demo-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require'
  );
  const parsed = new URL(pooled);
  assert.equal(parsed.searchParams.get('pgbouncer'), 'true');
  assert.equal(parsed.searchParams.get('connect_timeout'), '30');
  assert.equal(parsed.searchParams.get('pool_timeout'), '30');
  assert.equal(parsed.searchParams.get('connection_limit'), '5');

  const direct = normalizeDatabaseUrl(
    'postgresql://user:pass@ep-demo.us-east-2.aws.neon.tech/neondb?sslmode=require'
  );
  assert.equal(new URL(direct).searchParams.get('pgbouncer'), null);
});

test('crmEnums formatters serialize Prisma records cleanly', () => {
  const user = formatUser({
    id: 'u1',
    name: 'Alice',
    email: 'alice@example.com',
    password: 'hashed_password_should_not_leak',
    role: 'ADMIN',
    isActive: true,
  });
  assert.equal(user.password, undefined);
  assert.equal(user.role, 'admin');

  const lead = formatLead({
    id: 'l1',
    name: 'Bob',
    company: 'Acme',
    email: 'bob@acme.com',
    status: 'MEETING_SCHEDULED',
    source: 'EMAIL_CAMPAIGN',
    owner: { id: 'u1', name: 'Alice' },
    assignedTo: { id: 'u2', name: 'Sarah' },
  });
  assert.equal(lead.status, 'Meeting Scheduled');
  assert.equal(lead.source, 'Email Campaign');
  assert.equal(lead.ownerName, 'Alice');
  assert.equal(lead.assignedToName, 'Sarah');

  const customer = formatCustomer({
    id: 'c1',
    name: 'Carol',
    company: 'Beta',
    email: 'carol@beta.io',
    status: 'VIP',
    owner: { name: 'Alice' },
  });
  assert.equal(customer.status, 'VIP');
  assert.equal(customer.ownerName, 'Alice');

  const task = formatTask({
    id: 't1',
    title: 'Follow up',
    status: 'IN_PROGRESS',
    priority: 'URGENT',
    assignedTo: { name: 'Sarah' },
    createdBy: { name: 'Alice' },
  });
  assert.equal(task.status, 'In Progress');
  assert.equal(task.priority, 'Urgent');
  assert.equal(LEAD_STATUS_TO_PRISMA['Proposal Sent'], 'PROPOSAL_SENT');
});

test('Protected endpoints reject unauthenticated requests with 401', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const endpoints = [
      '/api/leads',
      '/api/customers',
      '/api/tasks',
      '/api/analytics/overview',
      '/api/activities',
      '/api/notifications',
      '/api/settings',
      '/api/users',
    ];
    for (const ep of endpoints) {
      const res = await fetch(`${baseUrl}${ep}`);
      assert.equal(res.status, 401, `Expected 401 for ${ep}, got ${res.status}`);
      const body = await res.json();
      assert.equal(body.success, false);
    }
  } finally {
    server.close();
  }
});

test('Auth validation rejects invalid register/login payloads with 400', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'A', email: 'not-an-email', password: '123' }),
    });
    assert.equal(regRes.status, 400);
    const regBody = await regRes.json();
    assert.equal(regBody.success, false);
    assert.ok(Array.isArray(regBody.errors) && regBody.errors.length >= 2);

    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bad', password: '' }),
    });
    assert.equal(loginRes.status, 400);
  } finally {
    server.close();
  }
});

test('Role-based authorization blocks standard user from admin /api/users routes', async () => {
  const originalFindUnique = prisma.user.findUnique;
  prisma.user.findUnique = async ({ where }) => {
    if (where.id === 'user-standard') {
      return {
        id: 'user-standard',
        name: 'Standard Rep',
        email: 'rep@example.com',
        password: 'hash',
        role: 'USER',
        isActive: true,
      };
    }
    return null;
  };

  const { server, baseUrl } = await startTestServer();
  try {
    const token = jwt.sign({ id: 'user-standard' }, process.env.JWT_SECRET);
    const res = await fetch(`${baseUrl}/api/users`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
  } finally {
    prisma.user.findUnique = originalFindUnique;
    server.close();
  }
});

test('Admin user can access analytics overview and user list with mocked Prisma queries', async () => {
  const origFindUnique = prisma.user.findUnique;
  const origFindManyUser = prisma.user.findMany;
  const origCountUser = prisma.user.count;
  const origLeadFindMany = prisma.lead.findMany;
  const origCustCount = prisma.customer.count;
  const origCustAgg = prisma.customer.aggregate;
  const origTaskCount = prisma.task.count;
  const origActivityFindMany = prisma.activity.findMany;

  prisma.user.findUnique = async ({ where }) =>
    where.id === 'admin-1'
      ? { id: 'admin-1', name: 'Admin', email: 'admin@test.io', password: 'h', role: 'ADMIN', isActive: true }
      : null;
  prisma.user.findMany = async () => [
    { id: 'admin-1', name: 'Admin', email: 'admin@test.io', role: 'ADMIN', isActive: true, _count: { ownedLeads: 1, assignedLeads: 1, assignedTasks: 0, customers: 1 } },
  ];
  prisma.user.count = async () => 1;
  prisma.lead.findMany = async () => [
    {
      id: 'l1',
      name: 'Test Lead',
      company: 'TestCo',
      email: 'lead@test.io',
      status: 'WON',
      source: 'WEBSITE',
      value: 50000,
      createdAt: new Date(),
      wonAt: new Date(),
      owner: { id: 'admin-1', name: 'Admin' },
      assignedTo: { id: 'admin-1', name: 'Admin' },
    },
  ];
  prisma.customer.count = async () => 1;
  prisma.customer.aggregate = async () => ({ _sum: { totalRevenue: 50000 } });
  prisma.task.count = async () => 2;
  prisma.activity.findMany = async () => [];

  const { server, baseUrl } = await startTestServer();
  try {
    const token = jwt.sign({ id: 'admin-1' }, process.env.JWT_SECRET);
    const [usersRes, analyticsRes] = await Promise.all([
      fetch(`${baseUrl}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
      fetch(`${baseUrl}/api/analytics/overview?range=all`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    assert.equal(usersRes.status, 200);
    const usersJson = await usersRes.json();
    assert.equal(usersJson.success, true);
    assert.equal(usersJson.data.length, 1);

    assert.equal(analyticsRes.status, 200);
    const analyticsJson = await analyticsRes.json();
    assert.equal(analyticsJson.success, true);
    assert.equal(analyticsJson.data.dashboard.totalLeads, 1);
    assert.equal(analyticsJson.data.dashboard.convertedLeads, 1);
    assert.equal(analyticsJson.data.dashboard.totalCustomers, 1);
    assert.equal(analyticsJson.data.dashboard.revenue, 50000);
    assert.equal(analyticsJson.data.analytics.stats.conversionRate, 100);
  } finally {
    prisma.user.findUnique = origFindUnique;
    prisma.user.findMany = origFindManyUser;
    prisma.user.count = origCountUser;
    prisma.lead.findMany = origLeadFindMany;
    prisma.customer.count = origCustCount;
    prisma.customer.aggregate = origCustAgg;
    prisma.task.count = origTaskCount;
    prisma.activity.findMany = origActivityFindMany;
    server.close();
  }
});

test('CORS allows configured FRONTEND_URL with trailing slash normalized', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/nonexistent-endpoint`, {
      headers: { Origin: 'https://crm-prod-preview.vercel.app' },
    });
    assert.equal(res.status, 404);
    assert.equal(
      res.headers.get('access-control-allow-origin'),
      'https://crm-prod-preview.vercel.app'
    );
  } finally {
    server.close();
  }
});

test('Unknown API route returns 404 JSON response', async () => {
  const { server, baseUrl } = await startTestServer();
  try {
    const res = await fetch(`${baseUrl}/api/nonexistent-endpoint`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.success, false);
  } finally {
    server.close();
  }
});
