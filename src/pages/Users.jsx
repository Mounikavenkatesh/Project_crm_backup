import { useState, useEffect, useCallback } from 'react';
import { UserPlus, Shield, Trash2, X, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/crmServices';
import { useAuth } from '../context/AuthContext';
import SearchBar from '../components/common/SearchBar';
import Modal from '../components/common/Modal';
import Loader from '../components/common/Loader';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user',
    jobTitle: '',
    phone: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await userService.getUsers({ search, role: roleFilter, limit: 50 });
      if (res.success) {
        setUsers(res.data || []);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await userService.createUser(formData);
      toast.success('Team member created successfully');
      setIsModalOpen(false);
      setFormData({ name: '', email: '', password: '', role: 'user', jobTitle: '', phone: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id, role) => {
    try {
      await userService.updateUser(id, { role });
      toast.success('Role updated');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleToggleActive = async (targetUser) => {
    try {
      await userService.updateUser(targetUser.id, { isActive: !targetUser.isActive });
      toast.success(`User ${targetUser.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    try {
      await userService.deleteUser(targetUser.id);
      toast.success('User removed');
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Team & User Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Manage workspace roles, account status, and team permissions.
          </p>
        </div>

        {isAdmin && (
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition self-start sm:self-auto"
          >
            <UserPlus className="h-4.5 w-4.5" />
            Invite Member
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between border-b border-slate-200/80 dark:border-slate-800 pb-5">
        <SearchBar value={search} onChange={setSearch} />
        <div className="flex items-center gap-2">
          {['All', 'admin', 'manager', 'user'].map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`rounded-xl px-3.5 py-2 text-xs font-bold capitalize transition ${
                roleFilter === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">User</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Workload</th>
                  <th className="py-3.5 px-4">Last Login</th>
                  {isAdmin && <th className="py-3.5 px-5 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => {
                  const isSelf = u.id === currentUser?.id;
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-5">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                          {u.name} {isSelf && <span className="text-xs text-blue-600">(You)</span>}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {u.email} {u.jobTitle ? `• ${u.jobTitle}` : ''}
                        </p>
                      </td>

                      <td className="py-3.5 px-4">
                        {isAdmin && !isSelf ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value)}
                            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold capitalize"
                          >
                            <option value="user">user</option>
                            <option value="manager">manager</option>
                            <option value="admin">admin</option>
                          </select>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold capitalize">
                            <Shield className="h-3 w-3 text-blue-500" />
                            {u.role}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          disabled={!isAdmin || isSelf}
                          onClick={() => handleToggleActive(u)}
                          className={`rounded-full px-2.5 py-0.5 text-xs font-bold transition ${
                            u.isActive
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
                          } disabled:cursor-default`}
                        >
                          {u.isActive ? 'Active' : 'Deactivated'}
                        </button>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-400">
                        {u._count?.assignedLeads || 0} leads • {u._count?.assignedTasks || 0} tasks
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>

                      {isAdmin && (
                        <td className="py-3.5 px-5 text-right">
                          {!isSelf && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(u)}
                              className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                              title="Delete user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Invite Team Member</h3>
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 text-slate-400">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={inputClass}
              />
            </div>
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
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Temporary Password *</label>
              <input
                type="password"
                required
                minLength={6}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={inputClass}
              >
                <option value="user">User</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-500">Job Title</label>
              <input
                type="text"
                value={formData.jobTitle}
                onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                placeholder="e.g. Account Executive"
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

          <div className="flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 pt-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-semibold">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Create Account
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
