import { useState, useEffect } from 'react';
import { Save, Lock, Bell, Building, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { settingsService } from '../services/crmServices';

export default function SettingsPage() {
  const { user, setUser, settings, setSettings } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    jobTitle: user?.jobTitle || '',
  });

  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [prefs, setPrefs] = useState({
    companyName: settings?.companyName || 'Startup CRM',
    currency: settings?.currency || 'INR',
    timezone: settings?.timezone || 'Asia/Kolkata',
    emailNotifications: settings?.emailNotifications ?? true,
    taskReminders: settings?.taskReminders ?? true,
    leadAlerts: settings?.leadAlerts ?? true,
    weeklyDigest: settings?.weeklyDigest ?? false,
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  useEffect(() => {
    settingsService
      .getSettings()
      .then((res) => {
        if (res.success && res.data) {
          setSettings(res.data);
          setPrefs({
            companyName: res.data.companyName || 'Startup CRM',
            currency: res.data.currency || 'INR',
            timezone: res.data.timezone || 'Asia/Kolkata',
            emailNotifications: res.data.emailNotifications ?? true,
            taskReminders: res.data.taskReminders ?? true,
            leadAlerts: res.data.leadAlerts ?? true,
            weeklyDigest: res.data.weeklyDigest ?? false,
          });
        }
      })
      .catch(() => {});
  }, [setSettings]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authService.updateProfile(profile);
      if (res.success && res.data) {
        setUser(res.data);
        toast.success('Profile updated');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    setSavingPassword(true);
    try {
      await authService.updateProfile({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('Password updated successfully');
      setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSavePreferences = async (e) => {
    e.preventDefault();
    setSavingPrefs(true);
    try {
      const res = await settingsService.updateSettings(prefs);
      if (res.success && res.data) {
        setSettings(res.data);
        toast.success('Workspace preferences saved');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const inputClass =
    'mt-1.5 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="space-y-6 max-w-4xl animate-fade-in">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
          Configure your profile, security credentials, and workspace preferences.
        </p>
      </div>

      {/* Profile Form */}
      <form
        onSubmit={handleSaveProfile}
        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Profile Information</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Signed in as {user?.email} ({user?.role})
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Full Name</label>
            <input
              type="text"
              required
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Job Title</label>
            <input
              type="text"
              value={profile.jobTitle}
              onChange={(e) => setProfile({ ...profile, jobTitle: e.target.value })}
              placeholder="e.g. Sales Lead"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Phone</label>
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingProfile}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Profile
          </button>
        </div>
      </form>

      {/* Workspace & Notification Preferences */}
      <form
        onSubmit={handleSavePreferences}
        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-5 shadow-xs"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Building className="h-4.5 w-4.5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Workspace & Notifications</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Workspace Name</label>
            <input
              type="text"
              value={prefs.companyName}
              onChange={(e) => setPrefs({ ...prefs, companyName: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Display Currency</label>
            <select
              value={prefs.currency}
              onChange={(e) => setPrefs({ ...prefs, currency: e.target.value })}
              className={inputClass}
            >
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Timezone</label>
            <input
              type="text"
              value={prefs.timezone}
              onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase text-slate-500">
            <Bell className="h-3.5 w-3.5" /> Notification Toggles
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              { key: 'emailNotifications', label: 'Email Notifications' },
              { key: 'taskReminders', label: 'Task Deadline Reminders' },
              { key: 'leadAlerts', label: 'New Lead Alerts' },
              { key: 'weeklyDigest', label: 'Weekly Performance Digest' },
            ].map((item) => (
              <label
                key={item.key}
                className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 p-3 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
              >
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.label}</span>
                <input
                  type="checkbox"
                  checked={prefs[item.key]}
                  onChange={(e) => setPrefs({ ...prefs, [item.key]: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingPrefs}
            className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
          >
            {savingPrefs ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Preferences
          </button>
        </div>
      </form>

      {/* Password Form */}
      <form
        onSubmit={handleChangePassword}
        className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 space-y-4 shadow-xs"
      >
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
          <Lock className="h-4.5 w-4.5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Change Password</h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Current Password</label>
            <input
              type="password"
              required
              value={passwords.oldPassword}
              onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwords.newPassword}
              onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase text-slate-500">Confirm Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={passwords.confirmPassword}
              onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={savingPassword}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-50"
          >
            {savingPassword ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
            Update Password
          </button>
        </div>
      </form>
    </div>
  );
}
