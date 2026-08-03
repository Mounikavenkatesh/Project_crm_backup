import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, LayoutGrid, List } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLeads } from '../context/LeadContext';
import SearchBar from '../components/common/SearchBar';
import FilterBar from '../components/common/FilterBar';
import EmptyState from '../components/common/EmptyState';
import Modal from '../components/common/Modal';
import LeadForm from '../components/leads/LeadForm';
import LeadTable from '../components/leads/LeadTable';
import LeadCard from '../components/leads/LeadCard';

/**
 * Leads page is the coordinate center for CRUD actions.
 * Manages search/filter state, view mode (cards vs table), and edit/create modals.
 */
export default function Leads() {
  const { leads = [], addLead, updateLead, deleteLead } = useLeads();
  const location = useLocation();

  // Component State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'

  // Trigger modal if navigated to from Dashboard QuickActions
  useEffect(() => {
    if (location.state && location.state.openAddModal) {
      setSelectedLead(null);
      setIsModalOpen(true);
      // Clean history state so modal doesn't re-open on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Derived state: filtered leads
  const filteredLeads = leads
    .filter((lead) => activeFilter === 'All' || lead.status === activeFilter)
    .filter((lead) => {
      const query = searchQuery.toLowerCase().trim();
      if (!query) return true;
      return (
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query) ||
        lead.email.toLowerCase().includes(query)
      );
    });

  const isFilterActive = searchQuery !== '' || activeFilter !== 'All';

  // Handlers
  const handleAddLeadClick = () => {
    setSelectedLead(null);
    setIsModalOpen(true);
  };

  const handleEditLeadClick = (lead) => {
    setSelectedLead(lead);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (formData) => {
    if (selectedLead) {
      // Edit mode
      updateLead(selectedLead.id, formData);
      toast.success('Lead updated successfully!');
    } else {
      // Create mode
      addLead(formData);
      toast.success('Lead created successfully!');
    }
    setIsModalOpen(false);
  };

  const handleDeleteLeadClick = (id) => {
    const lead = leads.find((l) => l.id === id);
    if (!lead) return;

    const confirmDelete = window.confirm(`Are you sure you want to delete lead: "${lead.name}"?`);
    if (confirmDelete) {
      deleteLead(id);
      // Requirement: red for delete notifications
      toast.error('Lead deleted successfully!');
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setActiveFilter('All');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
            Leads Directory
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1.5 text-sm">
            {leads.length} total contacts • {filteredLeads.length} matching active search
          </p>
        </div>

        <button
          onClick={handleAddLeadClick}
          type="button"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm shadow-blue-500/10 hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 transition-all duration-150 active:scale-[0.98] self-start sm:self-auto"
        >
          <Plus className="h-5 w-5" />
          Add Lead
        </button>
      </div>

      {/* Filter and Search Layout Controls */}
      <div className="flex flex-col gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />

          {/* Toggle view mode controls shown on MD screens and above */}
          <div className="hidden md:flex items-center border border-gray-200 dark:border-gray-700/80 rounded-xl p-1 bg-white dark:bg-gray-800 shadow-sm self-start">
            <button
              onClick={() => setViewMode('table')}
              type="button"
              className={`rounded-lg p-2 transition duration-200 focus:outline-none ${
                viewMode === 'table'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
              }`}
              title="Table view"
              aria-label="Table view"
            >
              <List className="h-4.5 w-4.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              type="button"
              className={`rounded-lg p-2 transition duration-200 focus:outline-none ${
                viewMode === 'cards'
                  ? 'bg-blue-50 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-500 dark:hover:text-gray-300'
              }`}
              title="Grid card view"
              aria-label="Grid card view"
            >
              <LayoutGrid className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>

        <FilterBar
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          leads={leads}
        />
      </div>

      {/* Leads Content Listing */}
      <div>
        {filteredLeads.length === 0 ? (
          <EmptyState isFilterActive={isFilterActive} onClear={handleClearFilters} />
        ) : (
          <>
            {/* Mobile View: Cards Grid ONLY (hides table layout) */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {filteredLeads.map((lead) => (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={handleEditLeadClick}
                  onDelete={handleDeleteLeadClick}
                />
              ))}
            </div>

            {/* Desktop/Tablet View: Conditional table vs card grid */}
            <div className="hidden md:block">
              {viewMode === 'table' ? (
                <LeadTable
                  leads={filteredLeads}
                  onEdit={handleEditLeadClick}
                  onDelete={handleDeleteLeadClick}
                />
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onEdit={handleEditLeadClick}
                      onDelete={handleDeleteLeadClick}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Overlay modal wrapping the creation / edit form */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <LeadForm
          initialData={selectedLead}
          onSubmit={handleFormSubmit}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>
    </div>
  );
}
