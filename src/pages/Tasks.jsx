import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertTriangle,
  Edit2,
  Trash2,
  Calendar,
  User,
  X,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { taskService, customerService } from '../services/crmServices';
import leadService from '../services/leadService';
import { useLeads } from '../context/LeadContext';
import {
  TASK_STATUSES,
  TASK_STATUS_COLORS,
  TASK_PRIORITIES,
  TASK_PRIORITY_COLORS,
} from '../constants';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';

const EMPTY_TASK = {
  title: '',
  description: '',
  status: 'Pending',
  priority: 'Medium',
  dueDate: '',
  assignedToId: '',
  leadId: '',
  customerId: '',
};

export default function Tasks() {
  const { teamMembers = [] } = useLeads();
  const location = useLocation();

  const [tasks, setTasks] = useState([]);
  const [summary, setSummary] = useState({ pending: 0, inProgress: 0, completed: 0, overdue: 0 });
  const [leadsOptions, setLeadsOptions] = useState([]);
  const [customersOptions, setCustomersOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState(EMPTY_TASK);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    try {
      const res = await taskService.getTasks({
        search,
        status: statusFilter,
        priority: priorityFilter,
        limit: 50,
      });
      if (res.success) {
        setTasks(res.data || []);
        if (res.summary) setSummary(res.summary);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    Promise.all([
      leadService.getLeads({ limit: 50 }),
      customerService.getCustomers({ limit: 50 }),
    ])
      .then(([leadRes, custRes]) => {
        if (leadRes.success) setLeadsOptions(leadRes.data || []);
        if (custRes.success) setCustomersOptions(custRes.data || []);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (location.state?.openAddModal) {
      setEditingTask(null);
      setFormData(EMPTY_TASK);
      setIsModalOpen(true);
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const openAddModal = () => {
    setEditingTask(null);
    setFormData(EMPTY_TASK);
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      description: task.description || '',
      status: task.status || 'Pending',
      priority: task.priority || 'Medium',
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
      assignedToId: task.assignedToId || '',
      leadId: task.leadId || '',
      customerId: task.customerId || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        assignedToId: formData.assignedToId || undefined,
        leadId: formData.leadId || null,
        customerId: formData.customerId || null,
      };
      if (editingTask) {
        await taskService.updateTask(editingTask.id, payload);
        toast.success('Task updated successfully');
      } else {
        await taskService.createTask(payload);
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleComplete = async (task) => {
    const nextStatus = task.status === 'Completed' ? 'Pending' : 'Completed';
    try {
      await taskService.updateTaskStatus(task.id, nextStatus);
      toast.success(`Task marked as ${nextStatus}`);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await taskService.updateTaskStatus(id, status);
      toast.success(`Task moved to ${status}`);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update task');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await taskService.deleteTask(deleteTarget.id);
      toast.success('Task deleted');
      setDeleteTarget(null);
      fetchTasks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete task');
    } finally {
      setSubmitting(false);
    }
  };

  const isOverdue = (task) =>
    task.dueDate &&
    new Date(task.dueDate) < new Date() &&
    task.status !== 'Completed' &&
    task.status !== 'Cancelled';

  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tasks & Follow-Ups
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Assign tasks, set deadlines, and track completion across your sales team.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition self-start sm:self-auto"
        >
          <Plus className="h-4.5 w-4.5" />
          New Task
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
            <span>Pending</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{summary.pending}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
            <span>In Progress</span>
            <Circle className="h-4 w-4 text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{summary.inProgress}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
            <span>Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">{summary.completed}</p>
        </div>
        <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between text-xs font-bold uppercase text-slate-500">
            <span>Overdue</span>
            <AlertTriangle className="h-4 w-4 text-rose-500" />
          </div>
          <p className="mt-2 text-2xl font-extrabold text-rose-600 dark:text-rose-400">{summary.overdue}</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <SearchBar value={search} onChange={setSearch} />

        <div className="flex flex-wrap items-center gap-2">
          {['All', ...TASK_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold transition ${
                statusFilter === st
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {st}
            </button>
          ))}

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200"
          >
            <option value="All">All Priorities</option>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <Loader />
      ) : tasks.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center">
          <p className="text-base font-bold text-slate-900 dark:text-white">No tasks found</p>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Create a task to schedule your next follow-up or deadline.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => {
            const overdue = isOverdue(task);
            const completed = task.status === 'Completed';
            return (
              <div
                key={task.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border p-4 transition-all ${
                  overdue
                    ? 'border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/10'
                    : 'border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => handleToggleComplete(task)}
                    className={`mt-0.5 flex-shrink-0 transition ${
                      completed ? 'text-emerald-600' : 'text-slate-300 hover:text-blue-600 dark:text-slate-600'
                    }`}
                    title={completed ? 'Mark as Pending' : 'Mark as Completed'}
                  >
                    {completed ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4
                        className={`text-sm font-bold ${
                          completed
                            ? 'line-through text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {task.title}
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          TASK_PRIORITY_COLORS[task.priority] || TASK_PRIORITY_COLORS.Medium
                        }`}
                      >
                        {task.priority}
                      </span>
                      {overdue && (
                        <span className="rounded-full bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 text-[10px] font-bold text-rose-700 dark:text-rose-300">
                          Overdue
                        </span>
                      )}
                    </div>

                    {task.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {task.description}
                      </p>
                    )}

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {task.assignedToName || 'Unassigned'}
                      </span>
                      {task.dueDate && (
                        <span className={`inline-flex items-center gap-1 ${overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : ''}`}>
                          <Calendar className="h-3.5 w-3.5" />
                          Due {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.lead && (
                        <span className="rounded bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 text-blue-700 dark:text-blue-300 font-medium">
                          Lead: {task.lead.name}
                        </span>
                      )}
                      {task.customer && (
                        <span className="rounded bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-medium">
                          Customer: {task.customer.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <select
                    value={task.status}
                    onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    className={`rounded-xl border px-2.5 py-1.5 text-xs font-semibold cursor-pointer focus:outline-none ${
                      TASK_STATUS_COLORS[task.status] || TASK_STATUS_COLORS.Pending
                    }`}
                  >
                    {TASK_STATUSES.map((s) => (
                      <option key={s} value={s} className="bg-white text-slate-900 dark:bg-slate-900 dark:text-white">
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={() => openEditModal(task)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
                    title="Edit task"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(task)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                    title="Delete task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h3>
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Task Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Send proposal follow-up"
              className={inputClass}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Description</label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className={inputClass}
              >
                {TASK_STATUSES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className={inputClass}
              >
                {TASK_PRIORITIES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Due Date</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Assign To</label>
              <select
                value={formData.assignedToId}
                onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                className={inputClass}
              >
                <option value="">Current User</option>
                {teamMembers.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Related Lead</label>
              <select
                value={formData.leadId}
                onChange={(e) => setFormData({ ...formData, leadId: e.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {leadsOptions.map((l) => (
                  <option key={l.id} value={l.id}>{l.name} ({l.company})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Related Customer</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                className={inputClass}
              >
                <option value="">None</option>
                {customersOptions.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.company})</option>
                ))}
              </select>
            </div>
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
              {editingTask ? 'Save Task' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Delete Task</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Delete task <span className="font-semibold">{deleteTarget?.title}</span>?
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
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500"
            >
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
