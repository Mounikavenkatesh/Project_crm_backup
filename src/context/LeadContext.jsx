import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import leadService from '../services/leadService';
import toast from 'react-hot-toast';

export const LeadContext = createContext(null);

/**
 * Provider component for LeadContext.
 * Coordinates fetching, adding, updating, and deleting leads from backend services.
 */
export function LeadProvider({ children }) {
  const { token } = useAuth();
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    pages: 1,
    hasNext: false,
    hasPrev: false,
  });

  /**
   * Fetch leads list with query filters.
   */
  const fetchLeads = useCallback(async (params = {}) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const response = await leadService.getLeads(params);
      if (response.success && response.data) {
        // Ensure every lead has an 'id' attribute matching its '_id'
        const normalizedLeads = response.data.map((lead) => ({
          ...lead,
          id: lead._id || lead.id,
        }));
        setLeads(normalizedLeads);
        if (response.pagination) {
          setPagination(response.pagination);
        }
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to fetch leads';
      toast.error(errMsg);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Automatically fetch leads when the user logs in
  useEffect(() => {
    if (token) {
      fetchLeads();
    } else {
      setLeads([]);
    }
  }, [token, fetchLeads]);

  /**
   * Adds a new lead.
   */
  const addLead = useCallback(async (leadDetails) => {
    setIsLoading(true);
    try {
      const response = await leadService.createLead(leadDetails);
      if (response.success && response.data) {
        const newLead = {
          ...response.data,
          id: response.data._id || response.data.id,
        };
        // Insert new lead at start of list
        setLeads((prev) => [newLead, ...prev]);
        toast.success(response.message || 'Lead added successfully!');
        // Refresh to get correct pagination stats
        fetchLeads();
        return newLead;
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to add lead';
      toast.error(errMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeads]);

  /**
   * Updates an existing lead.
   */
  const updateLead = useCallback(async (id, updatedFields) => {
    setIsLoading(true);
    try {
      const response = await leadService.updateLead(id, updatedFields);
      if (response.success && response.data) {
        const updatedLead = {
          ...response.data,
          id: response.data._id || response.data.id,
        };
        setLeads((prev) =>
          prev.map((lead) => (lead.id === id ? updatedLead : lead))
        );
        toast.success(response.message || 'Lead updated successfully!');
        return updatedLead;
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to update lead';
      toast.error(errMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Deletes a lead.
   */
  const deleteLead = useCallback(async (id) => {
    setIsLoading(true);
    try {
      const response = await leadService.deleteLead(id);
      if (response.success) {
        setLeads((prev) => prev.filter((lead) => lead.id !== id));
        toast.error(response.message || 'Lead deleted successfully');
        // Refresh list
        fetchLeads();
      }
    } catch (error) {
      const errMsg = error.response?.data?.message || 'Failed to delete lead';
      toast.error(errMsg);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [fetchLeads]);

  /**
   * Retrieves a specific lead by ID.
   */
  const getLeadById = useCallback((id) => {
    return leads.find((lead) => lead.id === id);
  }, [leads]);

  return (
    <LeadContext.Provider
      value={{
        leads,
        isLoading,
        pagination,
        fetchLeads,
        addLead,
        updateLead,
        deleteLead,
        getLeadById,
      }}
    >
      {children}
    </LeadContext.Provider>
  );
}

/**
 * Custom hook to consume LeadContext.
 */
export function useLeads() {
  const context = useContext(LeadContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadProvider');
  }
  return context;
}
