import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  Building2,
  Mail,
  Phone,
  Globe,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { customerService } from '../services/crmServices';
import { CUSTOMER_STATUSES, CUSTOMER_STATUS_COLORS, formatCurrency } from '../constants';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';

const EMPTY_FORM = {
  name: '',
  company: '',
  email: '',
  phone: '',
  industry: '',
  website: '',
  address: '',
  status: 'Active',
  totalRevenue: 0,
  notes: '',
};

export default function Customers() {
  const { settings } = useAuth();
  const currency = settings?.currency || 'INR';
  const location = useLocation();

  const [customers, setCustomers] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 1, hasNext: false, hasPrev: false });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');
  const [page, setPage] = useState(1);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await customerService.getCustomers({
        search,
        status: statusFilter,
        sortBy,
        sortOrder: sortBy === 'name' || sortBy === 'company' ? 'asc' : 'desc',
        page,
        limit: 10,
      });
      if (res.success) {
        setCustomers(res.data || []);
        if (res.pagination) setPagination(res.pagination);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, sortBy, page]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setEditingCustomer(null);
      setFormData(EMPTY_FORM);
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const openAddModal = () => {
    setEditingCustomer(null);
    setFormData(EMPTY_FORM);
    setIsModalOpen(true);
  };

  const openEditModal = (customer) => {
    setEditingCustomer(customer);
    setFormData({
      name: customer.name || '',
      company: customer.company || '',
      email: customer.email || '',
      phone: customer.phone || '',
      industry: customer.industry || '',
      website: customer.website || '',
      address: customer.address || '',
      status: customer.status || 'Active',
      totalRevenue: customer.totalRevenue ?? 0,
      notes: customer.notes || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        totalRevenue: Number(formData.totalRevenue) || 0,
      };
      if (editingCustomer) {
        await customerService.updateCustomer(editingCustomer.id, payload);
        toast.success('Customer updated successfully');
      } else {
        await customerService.createCustomer(payload);
        toast.success('Customer created successfully');
      }
      setIsModalOpen(false);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save customer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await customerService.deleteCustomer(deleteTarget.id);
      toast.success('Customer deleted successfully');
      setDeleteTarget(null);
      fetchCustomers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete customer');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Customers
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            {pagination.total} customer accounts • Track revenue and relationships
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          Add Customer
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <SearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
        />

        <div className="flex flex-wrap items-center gap-2">
          {['All', ...CUSTOMER_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => {
                setStatusFilter(st);
                setPage(1);
              }}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
            >
              {st}
            </button>
          ))}

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="createdAt">Sort: Newest</option>
            <option value="totalRevenue">Sort: Revenue</option>
            <option value="name">Sort: Name</option>
            <option value="company">Sort: Company</option>
          </select>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <Loader />
      ) : customers.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <Building2 className="h-10 w-10 text-slate-300 dark:text-slate-600 mb-3" />
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No customers found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            Add a customer directly or convert a Won lead from the Leads page.
          </p>
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    <th className="py-3.5 px-5">Customer</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4">Industry</th>
                    <th className="py-3.5 px-4">Total Revenue</th>
                    <th className="py-3.5 px-4">Contact</th>
                    <th className="py-3.5 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {customers.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{c.company}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                            CUSTOMER_STATUS_COLORS[c.status] || CUSTOMER_STATUS_COLORS.Active
                          }`}
                        >
                          {c.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs font-medium text-slate-600 dark:text-slate-300">
                        {c.industry || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.totalRevenue, currency)}
                      </td>
                      <td className="py-3.5 px-4 text-xs space-y-1 text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-slate-400" />
                          <span>{c.email}</span>
                        </div>
                        {c.phone && (
                          <div className="flex items-center gap-1.5">
                            <Phone className="h-3.5 w-3.5 text-slate-400" />
                            <span>{c.phone}</span>
                          </div>
                        )}
                        {c.website && (
                          <div className="flex items-center gap-1.5">
                            <Globe className="h-3.5 w-3.5 text-slate-400" />
                            <span className="truncate max-w-[160px]">{c.website}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openEditModal(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800 dark:hover:text-blue-400 transition"
                          title="Edit customer"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(c)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition ml-1"
                          title="Delete customer"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.pages > 1 && (
            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-500">
                Page {pagination.page} of {pagination.pages}
              </p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={!pagination.hasPrev}
                  onClick={() => setPage((p) => p - 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </button>
                <button
                  type="button"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  className="inline-flex items-center gap-1 rounded-xl border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Add / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingCustomer ? 'Edit Customer' : 'Add Customer'}
            </h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Contact Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Company *</label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={inputClass}
              >
                {CUSTOMER_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Industry</label>
              <input
                type="text"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g. SaaS"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Total Revenue</label>
              <input
                type="number"
                min="0"
                value={formData.totalRevenue}
                onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Website</label>
              <input
                type="text"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="City, Country"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Notes</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {editingCustomer ? 'Save Changes' : 'Create Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Customer</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Are you sure you want to delete <span className="font-semibold">{deleteTarget?.name}</span> ({deleteTarget?.company})?
          </p>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={handleDelete}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
