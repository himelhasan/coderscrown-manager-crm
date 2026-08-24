'use client';

import { BarChart3, CheckCircle, Eye, MessageSquare, Plus, Target, Trash2, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import CampaignDetailsModal from './CampaignDetailsModal';
import NewCampaignModal from './NewCampaignModal';

export default function CampaignsClient({ campaigns }: { campaigns: any[] }) {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  
  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  
  const router = useRouter();

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(campaigns.map(c => c._id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    const loadingToast = toast.loading(`Updating ${selectedIds.length} campaigns...`);

    try {
      const res = await fetch('/api/v1/campaigns/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action: 'update',
          updateData: { status }
        })
      });

      if (res.ok) {
        toast.success(`Updated ${selectedIds.length} campaigns to ${status}!`, { id: loadingToast });
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error('Failed to update campaigns', { id: loadingToast });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error updating campaigns', { id: loadingToast });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Are you sure you want to delete ${selectedIds.length} campaigns?`)) return;

    setBulkProcessing(true);
    const loadingToast = toast.loading(`Deleting ${selectedIds.length} campaigns...`);

    try {
      const res = await fetch('/api/v1/campaigns/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedIds,
          action: 'delete'
        })
      });

      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} campaigns!`, { id: loadingToast });
        setSelectedIds([]);
        router.refresh();
      } else {
        toast.error('Failed to delete campaigns', { id: loadingToast });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error deleting campaigns', { id: loadingToast });
    } finally {
      setBulkProcessing(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this campaign?')) return;
    
    setDeletingId(id);
    const loadingToast = toast.loading('Deleting campaign...');
    try {
        const res = await fetch(`/api/v1/campaigns/${id}`, {
            method: 'DELETE',
        });
        if (res.ok) {
            router.refresh();
            toast.success('Campaign deleted', { id: loadingToast });
        } else {
            toast.error('Failed to delete campaign', { id: loadingToast });
        }
    } catch (e) {
        console.error(e);
        toast.error('Error deleting campaign', { id: loadingToast });
    } finally {
        setDeletingId(null);
    }
  };

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, campaign: any) => {
    e.stopPropagation();
    const newStatus = e.target.value;
    setUpdatingId(campaign._id);
    const loadingToast = toast.loading(`Updating status to ${newStatus}...`);

    try {
      const res = await fetch(`/api/v1/campaigns/${campaign._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: campaign.name,
          description: campaign.description,
          target_audience: campaign.target_audience,
          status: newStatus
        })
      });

      if (res.ok) {
        toast.success('Campaign status updated', { id: loadingToast });
        router.refresh();
      } else {
        toast.error('Failed to update campaign status', { id: loadingToast });
      }
    } catch (err) {
      console.error(err);
      toast.error('Error updating status', { id: loadingToast });
    } finally {
      setUpdatingId(null);
    }
  };

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const totalAssignedLeads = campaigns.reduce((acc, c) => acc + (c.metrics?.total_leads || 0), 0);
  const totalInterested = campaigns.reduce((acc, c) => acc + (c.metrics?.interested_leads || 0), 0);
  const avgResponseRate = campaigns.length > 0
    ? Math.round(campaigns.reduce((acc, c) => acc + (c.metrics?.response_rate || 0), 0) / campaigns.length)
    : 0;

  return (
    <div className="space-y-6 relative">
      {/* Header Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Outreach Campaigns</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track campaign performance, email response rates, and interested leads to see what&apos;s working.
          </p>
        </div>
        <button 
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
             <Plus className="h-4 w-4" /> Create Campaign
        </button>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Active Campaigns</span>
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-bold">{activeCampaigns}</div>
          <div className="text-xs text-muted-foreground">Out of {campaigns.length} total campaigns</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Total Assigned Leads</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold">{totalAssignedLeads}</div>
          <div className="text-xs text-muted-foreground">Across all campaigns</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Avg Response Rate</span>
            <MessageSquare className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold">{avgResponseRate}%</div>
          <div className="text-xs text-amber-500 font-medium">Replied leads ratio</div>
        </div>

        <div className="rounded-xl border border-border bg-card p-5 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Positive Interested Leads</span>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold">{totalInterested}</div>
          <div className="text-xs text-emerald-500 font-medium">High conversion potential</div>
        </div>
      </div>

      {/* Sticky Bulk Action Toolbar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-20 flex items-center justify-between gap-4 rounded-xl border border-primary/40 bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
              {selectedIds.length}
            </span>
            <span>Campaign(s) Selected</span>
          </div>

          <div className="flex items-center gap-3">
            <select
              onChange={(e) => {
                if (e.target.value) handleBulkStatusChange(e.target.value);
              }}
              disabled={bulkProcessing}
              defaultValue=""
              className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="" disabled>-- Bulk Status --</option>
              <option value="active">Set Active</option>
              <option value="paused">Set Paused</option>
              <option value="completed">Set Completed</option>
              <option value="draft">Set Draft</option>
            </select>

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

      {/* Campaigns Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {campaigns.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
                No campaigns found. Create one to start tracking outreach performance.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50 text-muted-foreground">
                        <tr>
                            <th className="px-4 py-3 w-10">
                              <input
                                type="checkbox"
                                checked={selectedIds.length === campaigns.length && campaigns.length > 0}
                                onChange={(e) => handleSelectAll(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                              />
                            </th>
                            <th className="px-6 py-3 font-medium">Campaign Name</th>
                            <th className="px-6 py-3 font-medium">Status</th>
                            <th className="px-6 py-3 font-medium">Leads</th>
                            <th className="px-6 py-3 font-medium">Sent</th>
                            <th className="px-6 py-3 font-medium">Open Rate</th>
                            <th className="px-6 py-3 font-medium">Response Rate</th>
                            <th className="px-6 py-3 font-medium">Interested</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {campaigns.map((c: any) => {
                          const isSelected = selectedIds.includes(c._id);
                          return (
                            <tr 
                              key={c._id} 
                              onClick={() => setSelectedCampaignId(c._id)}
                              className={`hover:bg-muted/50 cursor-pointer transition-colors ${isSelected ? 'bg-primary/5' : ''}`}
                            >
                                <td className="px-4 py-4" onClick={(e) => handleSelectOne(e, c._id)}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}}
                                    className="h-4 w-4 rounded border-gray-300"
                                  />
                                </td>
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex flex-col">
                                        <span className="text-primary font-semibold hover:underline flex items-center gap-1.5">
                                          {c.name} <Eye className="h-3.5 w-3.5 opacity-60" />
                                        </span>
                                        {c.description && <span className="text-xs text-muted-foreground line-clamp-1">{c.description}</span>}
                                        {c.target_audience && (
                                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                                            <Target className="h-3 w-3 text-primary" /> {c.target_audience}
                                          </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                  <select
                                    value={c.status || 'active'}
                                    onChange={(e) => handleStatusChange(e, c)}
                                    disabled={updatingId === c._id}
                                    className={`text-xs font-semibold px-2 py-1 rounded border outline-none cursor-pointer ${
                                      c.status === 'active' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                      c.status === 'paused' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                                      c.status === 'completed' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                      'bg-muted text-muted-foreground border-border'
                                    }`}
                                  >
                                    <option value="active">Active</option>
                                    <option value="paused">Paused</option>
                                    <option value="completed">Completed</option>
                                    <option value="draft">Draft</option>
                                  </select>
                                </td>
                                <td className="px-6 py-4 font-medium">{c.metrics?.total_leads || 0}</td>
                                <td className="px-6 py-4">{c.metrics?.emails_sent || 0}</td>
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-emerald-600">{c.metrics?.open_rate || 0}%</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-amber-600">{c.metrics?.response_rate || 0}%</span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className="font-semibold text-primary">{c.metrics?.interested_leads || 0}</span>
                                </td>
                                <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                    <button 
                                        onClick={(e) => handleDelete(e, c._id)}
                                        disabled={deletingId === c._id}
                                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 p-2 rounded-md hover:bg-destructive/10"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                          );
                        })}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      {/* New Campaign Modal */}
      <NewCampaignModal 
        isOpen={isNewModalOpen} 
        onClose={() => setIsNewModalOpen(false)} 
      />

      {/* Campaign Details & Performance Modal */}
      <CampaignDetailsModal
        campaignId={selectedCampaignId}
        onClose={() => setSelectedCampaignId(null)}
      />
    </div>
  );
}
