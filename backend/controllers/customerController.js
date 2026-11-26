import prisma from '../config/database.js';
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js';
import { CUSTOMER_STATUS_TO_PRISMA, formatCustomer } from '../utils/crmEnums.js';
import { logActivity } from '../utils/activityLogger.js';

const ALLOWED_SORT_FIELDS = ['createdAt', 'updatedAt', 'name', 'company', 'totalRevenue', 'status'];

const buildCustomerScope = (user) => {
  if (user.role === 'admin' || user.role === 'manager') {
    return {};
  }
  return { ownerId: user.id };
};

/**
 * List customers with search, status filter, sorting, and pagination.
 * @route GET /api/customers
 * @access Private
 */
export const getCustomers = async (req, res, next) => {
  try {
    const {
      status,
      search,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const skipNum = (pageNum - 1) * limitNum;

    const where = { ...buildCustomerScope(req.user) };

    if (status && status !== 'All' && CUSTOMER_STATUS_TO_PRISMA[status]) {
      where.status = CUSTOMER_STATUS_TO_PRISMA[status];
    }

    if (search && search.trim()) {
      const term = search.trim();
      where.OR = [
        { name: { contains: term, mode: 'insensitive' } },
        { company: { contains: term, mode: 'insensitive' } },
        { email: { contains: term, mode: 'insensitive' } },
        { industry: { contains: term, mode: 'insensitive' } },
      ];
    }

    const safeSortBy = ALLOWED_SORT_FIELDS.includes(sortBy) ? sortBy : 'createdAt';
    const safeSortOrder = sortOrder === 'asc' ? 'asc' : 'desc';

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true, email: true } },
          _count: { select: { tasks: true } },
        },
        orderBy: { [safeSortBy]: safeSortOrder },
        skip: skipNum,
        take: limitNum,
      }),
      prisma.customer.count({ where }),
    ]);

    return paginatedResponse(
      res,
      customers.map(formatCustomer),
      total,
      pageNum,
      limitNum
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new customer record.
 * @route POST /api/customers
 * @access Private
 */
export const createCustomer = async (req, res, next) => {
  try {
    const {
      name,
      company,
      email,
      phone = '',
      industry = '',
      website = '',
      address = '',
      status = 'Active',
      totalRevenue = 0,
      notes = '',
      sourceLeadId = null,
    } = req.body;

    const prismaStatus = CUSTOMER_STATUS_TO_PRISMA[status] || 'ACTIVE';

    const customer = await prisma.customer.create({
      data: {
        name: name.trim(),
        company: company.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        industry: industry.trim(),
        website: website.trim(),
        address: address.trim(),
        status: prismaStatus,
        totalRevenue: Number(totalRevenue) || 0,
        notes: notes.trim(),
        ownerId: req.user.id,
        sourceLeadId: sourceLeadId || undefined,
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity({
      userId: req.user.id,
      type: 'CUSTOMER_CREATED',
      title: `Added customer ${customer.name}`,
      description: `${customer.company} • Revenue ₹${customer.totalRevenue}`,
      customerId: customer.id,
    });

    return successResponse(res, formatCustomer(customer), 'Customer created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Retrieve a single customer with related tasks and activities.
 * @route GET /api/customers/:id
 * @access Private
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const customer = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        ...buildCustomerScope(req.user),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        tasks: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        activities: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!customer) {
      return errorResponse(res, 'Customer not found', 404);
    }

    return successResponse(res, formatCustomer(customer), 'Customer retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing customer record.
 * @route PUT /api/customers/:id
 * @access Private
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const existing = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        ...buildCustomerScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Customer not found', 404);
    }

    const {
      name,
      company,
      email,
      phone,
      industry,
      website,
      address,
      status,
      totalRevenue,
      notes,
    } = req.body;

    const data = {};
    if (name !== undefined) data.name = name.trim();
    if (company !== undefined) data.company = company.trim();
    if (email !== undefined) data.email = email.trim().toLowerCase();
    if (phone !== undefined) data.phone = phone.trim();
    if (industry !== undefined) data.industry = industry.trim();
    if (website !== undefined) data.website = website.trim();
    if (address !== undefined) data.address = address.trim();
    if (status !== undefined && CUSTOMER_STATUS_TO_PRISMA[status]) {
      data.status = CUSTOMER_STATUS_TO_PRISMA[status];
    }
    if (totalRevenue !== undefined) data.totalRevenue = Number(totalRevenue) || 0;
    if (notes !== undefined) data.notes = notes.trim();

    const updated = await prisma.customer.update({
      where: { id: existing.id },
      data,
      include: {
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    await logActivity({
      userId: req.user.id,
      type: 'CUSTOMER_UPDATED',
      title: `Updated customer ${updated.name}`,
      description: `${updated.company} • Status: ${formatCustomer(updated).status}`,
      customerId: updated.id,
    });

    return successResponse(res, formatCustomer(updated), 'Customer updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Permanently delete a customer record.
 * @route DELETE /api/customers/:id
 * @access Private
 */
export const deleteCustomer = async (req, res, next) => {
  try {
    const existing = await prisma.customer.findFirst({
      where: {
        id: req.params.id,
        ...buildCustomerScope(req.user),
      },
    });

    if (!existing) {
      return errorResponse(res, 'Customer not found', 404);
    }

    await prisma.customer.delete({ where: { id: existing.id } });
    return successResponse(res, null, 'Customer deleted successfully');
  } catch (error) {
    next(error);
  }
};
