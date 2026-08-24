'use client';

import { ArrowDown, ArrowUp, Briefcase, Eye, Facebook, Instagram, Mail, MessageCircle, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import LeadStatusSelect from './LeadStatusSelect';

export default function LeadsClient() {
  const { role } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [leads, setLeads] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const queryString = searchParams.toString();
      const res = await fetch(`/api/v1/leads${queryString ? `?${queryString}` : ''}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.data || []);
      } else {
        toast.error('Failed to fetch leads');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error fetching leads');
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  useEffect(() => {
    setMounted(true);
    fetchLeads();

    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/v1/campaigns');
        if (res.ok) {
          const json = await res.json();
          setCampaigns(json.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCampaigns();
  }, [fetchLeads]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(leads.map(l => l._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    const loadingToast = toast.loading(`Updating status for ${selectedIds.length} leads...`);

    try {
      const res = await fetch('/api/v1/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action: 'update',
          updateData: { status }
        })
      });

      if (res.ok) {
        toast.success(`Updated ${selectedIds.length} leads to ${status.replace('_', ' ')}!`, { id: loadingToast });
        setSelectedIds([]);
        fetchLeads();
      } else {
        toast.error('Failed to update leads', { id: loadingToast });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error updating leads', { id: loadingToast });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkAssignCampaign = async (campaignName: string) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    const loadingToast = toast.loading(`Assigning ${selectedIds.length} leads to ${campaignName}...`);

    try {
      const res = await fetch('/api/v1/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action: 'update',
          updateData: {
            'cold_outreach.campaign_name': campaignName,
            'cold_outreach.campaign_status': 'active'
          }
        })
      });

      if (res.ok) {
        toast.success(`Assigned ${selectedIds.length} leads to campaign "${campaignName}"!`, { id: loadingToast });
        setSelectedIds([]);
        fetchLeads();
      } else {
        toast.error('Failed to assign campaign to leads', { id: loadingToast });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error assigning campaign', { id: loadingToast });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} leads?`)) return;

    setBulkProcessing(true);
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} leads...`);

    try {
      const res = await fetch('/api/v1/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action: 'delete'
        })
      });

      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} leads!`, { id: loadingToast });
        setSelectedIds([]);
        fetchLeads();
      } else {
        toast.error('Failed to delete leads', { id: loadingToast });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting leads', { id: loadingToast });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this lead?')) return;
      const loadingToast = toast.loading('Deleting lead...');
      setDeletingId(id);

      try {
          const res = await fetch(`/api/v1/leads?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
              setLeads(leads.filter(l => l._id !== id));
              toast.success('Lead deleted', { id: loadingToast });
              router.refresh();
          } else {
              toast.error('Failed to delete lead', { id: loadingToast });
          }
      } catch (e) {
          console.error(e);
          toast.error('Error deleting lead', { id: loadingToast });
      } finally {
          setDeletingId(null);
      }
  };

  const handleHeaderSort = (field: string) => {
    const currentSort = searchParams.get('sortBy');
    const currentOrder = searchParams.get('sortOrder') || 'desc';
    const params = new URLSearchParams(searchParams.toString());
    
    if (currentSort === field) {
      params.set('sortOrder', currentOrder === 'asc' ? 'desc' : 'asc');
    } else {
      params.set('sortBy', field);
      params.set('sortOrder', 'asc');
    }
    router.push(`/leads?${params.toString()}`);
  };

  const currentSortBy = searchParams.get('sortBy') || 'updatedAt';
  const currentSortOrder = searchParams.get('sortOrder') || 'desc';

  const renderSortIndicator = (field: string) => {
    if (currentSortBy !== field) return null;
    return currentSortOrder === 'asc' ? (
      <ArrowUp className="inline h-3.5 w-3.5 ml-1 text-primary" />
    ) : (
      <ArrowDown className="inline h-3.5 w-3.5 ml-1 text-primary" />
    );
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads Management</h2>
        <Link href="/leads/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 flex items-center gap-2 shadow-sm">
             <Plus className="h-4 w-4" /> Add New Lead
        </Link>
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/40 bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {selectedIds.length}
            </span>
            <span>Lead(s) Selected</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Bulk Assign Campaign */}
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkAssignCampaign(e.target.value);
              }}
              disabled={bulkProcessing}
              defaultValue=""
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="" disabled>-- Assign to Campaign --</option>
              {campaigns.map((c) => (
                <option key={c._id} value={c.name}>
                  Assign: {c.name}
                </option>
              ))}
            </select>

            {/* Bulk Change Status */}
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatusChange(e.target.value);
              }}
              disabled={bulkProcessing}
              defaultValue=""
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="" disabled>-- Change Status --</option>
              <option value="new">Status: New</option>
              <option value="in_progress">Status: In Progress</option>
              <option value="contacted">Status: Contacted</option>
              <option value="waiting_response">Status: Waiting Response</option>
              <option value="qualified">Status: Qualified</option>
              <option value="not_interested">Status: Not Interested</option>
              <option value="converted">Status: Converted</option>
            </select>

            {/* Bulk Delete */}
            <button
              onClick={handleBulkDelete}
              disabled={bulkProcessing}
              className="flex items-center gap-1.5 h-9 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 px-3 text-xs font-semibold hover:bg-destructive/20 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-3.5 w-3.5" /> Bulk Delete
            </button>

            <button
              onClick={() => setSelectedIds([])}
              className="h-9 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Leads Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col h-[calc(100vh-220px)]">
        <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm relative">
            <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10">
                <tr>
                    <th className="px-4 py-3 w-10">
                      <input
                        type="checkbox"
                        checked={selectedIds.length === leads.length && leads.length > 0}
                        onChange={(e) => handleSelectAll(e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                      />
                    </th>
                    <th 
                      onClick={() => handleHeaderSort('name')}
                      className="px-6 py-3 font-medium cursor-pointer select-none hover:text-foreground"
                    >
                      Name {renderSortIndicator('name')}
                    </th>
                    <th 
                      onClick={() => handleHeaderSort('company_name')}
                      className="px-6 py-3 font-medium cursor-pointer select-none hover:text-foreground"
                    >
                      Company {renderSortIndicator('company_name')}
                    </th>
                    <th 
                      onClick={() => handleHeaderSort('industry')}
                      className="px-6 py-3 font-medium cursor-pointer select-none hover:text-foreground"
                    >
                      Industry {renderSortIndicator('industry')}
                    </th>
                    <th className="px-6 py-3 font-medium">Campaign</th>
                    <th className="px-6 py-3 font-medium">Contact</th>
                    <th 
                      onClick={() => handleHeaderSort('status')}
                      className="px-6 py-3 font-medium cursor-pointer select-none hover:text-foreground"
                    >
                      Status {renderSortIndicator('status')}
                    </th>
                    <th className="px-6 py-3 font-medium">Follow-up</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {loading ? (
                    <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                            Loading leads...
                        </td>
                    </tr>
                ) : (leads?.length === 0 || !leads) ? (
                    <tr>
                        <td colSpan={9} className="px-6 py-12 text-center text-muted-foreground">
                            No leads found matching current filters.
                        </td>
                    </tr>
                ) : (
                    leads.map((lead: any) => {
                      const isSelected = selectedIds.includes(lead._id);
                      return (
                        <tr key={lead._id} className={`hover:bg-muted/50 transition-colors border-b last:border-0 border-border ${isSelected ? 'bg-primary/5' : ''}`}>
                            <td className="px-4 py-4">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(lead._id)}
                                className="h-4 w-4 rounded border-gray-300 cursor-pointer"
                              />
                            </td>
                            <td className="px-6 py-4 font-medium">
                                <Link href={`/leads/${lead._id}`} className="hover:underline text-primary">
                                    {lead.name}
                                </Link>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{lead.company_name || '-'}</td>
                            <td className="px-6 py-4">
                              {lead.industry ? (
                                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded border border-border bg-muted">
                                  <Briefcase className="h-3 w-3 text-muted-foreground" /> {lead.industry}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4">
                              {lead.cold_outreach?.campaign_name ? (
                                <span className="text-xs px-2 py-0.5 rounded border border-primary/20 bg-primary/10 text-primary font-medium">
                                  {lead.cold_outreach.campaign_name}
                                </span>
                              ) : (
                                <span className="text-xs text-muted-foreground">Unassigned</span>
                              )}
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                <div className="flex items-center gap-2">
                                     <a href={`mailto:${lead.email}`} className="hover:text-foreground" title="Email">
                                        <Mail className="h-4 w-4" />
                                     </a>
                                     {lead.phone && (
                                         <a href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`} target="_blank" className="hover:text-green-500" title="WhatsApp">
                                            <MessageCircle className="h-4 w-4" />
                                         </a>
                                     )}
                                     {lead.facebook_link && (
                                         <a href={lead.facebook_link} target="_blank" className="hover:text-blue-600" title="Facebook">
                                            <Facebook className="h-4 w-4" />
                                         </a>
                                     )}
                                     {lead.instagram_link && ( 
                                         <a href={lead.instagram_link} target="_blank" className="hover:text-pink-600" title="Instagram">
                                            <Instagram className="h-4 w-4" />
                                         </a>
                                     )}
                                     {lead.linkedin_link && (
                                         <a href={lead.linkedin_link} target="_blank" className="hover:text-blue-700" title="LinkedIn">
                                            <span className="text-xs font-bold border rounded px-1">in</span>
                                         </a>
                                     )}
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <LeadStatusSelect 
                                    leadId={lead._id} 
                                    currentStatus={lead.status} 
                                />
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">
                                    {lead.cold_outreach?.next_followup_date ? 
                                    (mounted ? new Date(lead.cold_outreach.next_followup_date).toLocaleDateString() : '...') : 
                                    'Not set'
                                    }
                            </td>
                            <td className="px-6 py-4 text-right flex justify-end gap-2">
                                <Link href={`/leads/${lead._id}`} className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground">
                                    <Eye className="h-4 w-4" />
                                </Link>
                                {role === 'admin' && (
                                    <button 
                                        onClick={() => handleDelete(lead._id)}
                                        disabled={deletingId === lead._id}
                                        className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}
                            </td>
                        </tr>
                      );
                    })
                )}
            </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
