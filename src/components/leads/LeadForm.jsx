import { useState, useEffect } from 'react';
import { LEAD_STATUSES, LEAD_SOURCES } from '../../constants';
import { X } from 'lucide-react';

/**
 * LeadForm handles creating or updating a lead's record.
 *
 * @param {object} props The component props.
 * @param {object} [props.initialData] Optional initial data if editing.
 * @param {Function} props.onSubmit Callback upon form submit.
 * @param {Function} props.onCancel Callback upon cancel or close.
 * @returns {React.ReactNode} The rendered lead form.
 */
export default function LeadForm({ initialData, onSubmit, onCancel }) {
  const isEditMode = !!initialData;

  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    status: LEAD_STATUSES.NEW,
    source: LEAD_SOURCES[0],
    value: 0,
    owner: '',
  });

  const [errors, setErrors] = useState({});

  // Fill form if initialData is provided (edit mode)
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        company: initialData.company || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        status: initialData.status || LEAD_STATUSES.NEW,
        source: initialData.source || LEAD_SOURCES[0],
        value: initialData.value || 0,
        owner: initialData.owner || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.company.trim()) newErrors.company = 'Company is required';
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
          {isEditMode ? 'Edit Lead Details' : 'Add New Lead'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-500 dark:hover:bg-gray-850 dark:hover:text-gray-300 focus:outline-none"
          aria-label="Close form"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label
            htmlFor="name"
            className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
          >
            Full Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Rohan Gupta"
            className={`mt-1.5 block w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.name
                ? 'border-rose-300 dark:border-rose-900 ring-rose-500'
                : 'border-gray-200 dark:border-gray-700/80'
            }`}
            required
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
          />
          {errors.name && (
            <p id="name-error" className="mt-1 text-xs text-rose-500 font-medium">
              {errors.name}
            </p>
          )}
        </div>

        {/* Company Name */}
        <div>
          <label
            htmlFor="company"
            className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
          >
            Company Name <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="e.g. Apex Tech Solutions"
            className={`mt-1.5 block w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.company
                ? 'border-rose-300 dark:border-rose-900 ring-rose-500'
                : 'border-gray-200 dark:border-gray-700/80'
            }`}
            required
            aria-invalid={!!errors.company}
            aria-describedby={errors.company ? 'company-error' : undefined}
          />
          {errors.company && (
            <p id="company-error" className="mt-1 text-xs text-rose-500 font-medium">
              {errors.company}
            </p>
          )}
        </div>

        {/* Email Address */}
        <div>
          <label
            htmlFor="email"
            className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
          >
            Email Address <span className="text-rose-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="name@company.com"
            className={`mt-1.5 block w-full rounded-xl border px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              errors.email
                ? 'border-rose-300 dark:border-rose-900 ring-rose-500'
                : 'border-gray-200 dark:border-gray-700/80'
            }`}
            required
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-xs text-rose-500 font-medium">
              {errors.email}
            </p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label
            htmlFor="phone"
            className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
          >
            Phone Number
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="e.g. +91 98765 43210"
            className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700/80 px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Row for Deal Value and Lead Owner */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Deal Value */}
          <div>
            <label
              htmlFor="value"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
            >
              Deal Value (₹)
            </label>
            <input
              type="number"
              id="value"
              name="value"
              value={formData.value}
              onChange={handleChange}
              placeholder="e.g. 50000"
              min="0"
              className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700/80 px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Lead Owner */}
          <div>
            <label
              htmlFor="owner"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
            >
              Lead Owner
            </label>
            <input
              type="text"
              id="owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              placeholder="e.g. Sarah"
              className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700/80 px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Row for Status & Source */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Status Dropdown */}
          <div>
            <label
              htmlFor="status"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700/80 px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              {Object.values(LEAD_STATUSES).map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>

          {/* Source Dropdown */}
          <div>
            <label
              htmlFor="source"
              className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-450"
            >
              Source
            </label>
            <select
              id="source"
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="mt-1.5 block w-full rounded-xl border border-gray-200 dark:border-gray-700/80 px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
            >
              {LEAD_SOURCES.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div className="mt-8 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 bg-white hover:bg-gray-50 dark:border-gray-750 dark:bg-gray-850 dark:text-gray-200 dark:hover:bg-gray-800 transition duration-150"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm shadow-blue-500/10 hover:bg-blue-500 transition duration-150"
        >
          {isEditMode ? 'Save Changes' : 'Create Lead'}
        </button>
      </div>
    </form>
  );
}
