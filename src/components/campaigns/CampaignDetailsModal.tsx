'use client';

import { Activity, CheckCircle, Clock, Eye, Mail, MessageSquare, Plus, Target, Users, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

interface CampaignDetailsModalProps {
  campaignId: string | null;
  onClose: () => void;
}

export default function CampaignDetailsModal({ campaignId, onClose }: CampaignDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'analytics' | 'leads' | 'logs'>('analytics');
  
  // Assign Leads Modal State
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [allLeads, setAllLeads] = useState<any[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  const fetchDetails = async () => {
    if (!campaignId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/v1/campaigns/${campaignId}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error('Failed to load campaign details');
      }
    } catch (e) {
      console.error(e);
      toast.error('Error fetching campaign details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [campaignId]);

  const openAssignModal = async () => {
    try {
      const res = await fetch('/api/v1/leads?limit=300');
      if (res.ok) {
        const json = await res.json();
        setAllLeads(json.data || []);
        setShowAssignModal(true);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error fetching leads for assignment');
    }
  };

  const handleBulkAssign = async () => {
    if (selectedLeadIds.length === 0) {
      toast.error('Select at least one lead to assign');
      return;
    }

    setAssigning(true);
    const loadingToast = toast.loading(`Assigning ${selectedLeadIds.length} leads...`);

    try {
      const res = await fetch('/api/v1/leads/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ids: selectedLeadIds,
          action: 'update',
          updateData: {
            'cold_outreach.campaign_name': campaign?.name,
            'cold_outreach.campaign_status': 'active'
          }
        })
      });

      if (res.ok) {
        toast.success(`Assigned ${selectedLeadIds.length} leads to ${campaign?.name}!`, { id: loadingToast });
        setShowAssignModal(false);
        setSelectedLeadIds([]);
        fetchDetails();
      } else {
        toast.error('Failed to assign leads', { id: loadingToast });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error assigning leads', { id: loadingToast });
    } finally {
      setAssigning(false);
    }
  };

  if (!campaignId) return null;

  const campaign = data?.data;
  const leads = data?.leads || [];
  const logs = data?.logs || [];
  const metrics = campaign?.metrics || {};

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-xs px-2.5 py-1 rounded-full font-medium">Active</span>;
      case 'paused':
        return <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 text-xs px-2.5 py-1 rounded-full font-medium">Paused</span>;
      case 'completed':
        return <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 text-xs px-2.5 py-1 rounded-full font-medium">Completed</span>;
      default:
        return <span className="bg-muted text-muted-foreground border border-border text-xs px-2.5 py-1 rounded-full font-medium">Draft</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-4xl max-h-[90vh] flex flex-col rounded-xl border border-border bg-card shadow-2xl animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/30">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold tracking-tight">{loading ? 'Loading...' : campaign?.name}</h2>
              {!loading && campaign?.status && getStatusBadge(campaign.status)}
            </div>
            {!loading && campaign?.description && (
              <p className="text-sm text-muted-foreground">{campaign.description}</p>
            )}
            {!loading && campaign?.target_audience && (
              <div className="flex items-center gap-1.5 text-xs text-primary font-medium mt-1">
                <Target className="h-3.5 w-3.5" /> Target: {campaign.target_audience}
              </div>
            )}
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between border-b border-border bg-muted/10 px-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'analytics'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Activity className="h-4 w-4" /> Performance Analytics
            </button>
            <button
              onClick={() => setActiveTab('leads')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'leads'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Users className="h-4 w-4" /> Assigned Leads ({leads.length})
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Mail className="h-4 w-4" /> Outreach Logs ({logs.length})
            </button>
          </div>

          <button
            onClick={openAssignModal}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm my-2"
          >
            <Plus className="h-3.5 w-3.5" /> Add Leads to Campaign
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {loading ? (
            <div className="py-16 text-center text-muted-foreground">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
              Loading campaign performance data...
            </div>
          ) : (
            <>
              {/* Tab 1: Analytics Overview */}
              {activeTab === 'analytics' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="rounded-xl border border-border bg-background p-4 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Total Assigned Leads</span>
                        <Users className="h-4 w-4 text-blue-500" />
                      </div>
                      <div className="text-2xl font-bold">{metrics.total_leads || 0}</div>
                      <div className="text-xs text-muted-foreground">Campaign Target</div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Emails Sent</span>
                        <Mail className="h-4 w-4 text-purple-500" />
                      </div>
                      <div className="text-2xl font-bold">{metrics.emails_sent || 0}</div>
                      <div className="text-xs text-muted-foreground">Total Outreach Attempts</div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Open Rate</span>
                        <Eye className="h-4 w-4 text-emerald-500" />
                      </div>
                      <div className="text-2xl font-bold">{metrics.open_rate || 0}%</div>
                      <div className="text-xs text-emerald-500 font-medium">Subject Line Impact</div>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-4 space-y-1 shadow-sm">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Response Rate</span>
                        <MessageSquare className="h-4 w-4 text-amber-500" />
                      </div>
                      <div className="text-2xl font-bold">{metrics.response_rate || 0}%</div>
                      <div className="text-xs text-amber-500 font-medium">Replied Leads</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-background p-5 space-y-2 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-emerald-600">
                        <CheckCircle className="h-4 w-4" /> Interested Leads (Positive)
                      </div>
                      <div className="text-3xl font-extrabold">{metrics.interested_leads || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Leads flagged with positive interest or scheduled for call.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-5 space-y-2 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
                        <CheckCircle className="h-4 w-4" /> Qualified / Converted
                      </div>
                      <div className="text-3xl font-extrabold">{metrics.qualified_leads || 0}</div>
                      <p className="text-xs text-muted-foreground">
                        Leads successfully converted from this campaign.
                      </p>
                    </div>

                    <div className="rounded-xl border border-border bg-background p-5 space-y-2 shadow-sm">
                      <div className="flex items-center gap-2 text-sm font-semibold text-purple-600">
                        <Activity className="h-4 w-4" /> Overall Conversion Rate
                      </div>
                      <div className="text-3xl font-extrabold">{metrics.conversion_rate || 0}%</div>
                      <p className="text-xs text-muted-foreground">
                        Ratio of qualified/converted leads to total assigned.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab 2: Assigned Leads */}
              {activeTab === 'leads' && (
                <div className="space-y-4">
                  {leads.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-xl space-y-3">
                      <p>No leads currently assigned to this campaign.</p>
                      <button
                        onClick={openAssignModal}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Leads Now
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-xl border border-border bg-background">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-muted/50 text-muted-foreground">
                          <tr>
                            <th className="px-4 py-3 font-medium">Lead Name</th>
                            <th className="px-4 py-3 font-medium">Company</th>
                            <th className="px-4 py-3 font-medium">Status</th>
                            <th className="px-4 py-3 font-medium">Interest Response</th>
                            <th className="px-4 py-3 font-medium text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {leads.map((lead: any) => (
                            <tr key={lead._id} className="hover:bg-muted/40 transition-colors">
                              <td className="px-4 py-3 font-medium">{lead.name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{lead.company_name || '-'}</td>
                              <td className="px-4 py-3">
                                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded border border-border bg-muted">
                                  {lead.status?.replace('_', ' ')}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {lead.cold_outreach?.response_status === 'interested' ? (
                                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                    Interested
                                  </span>
                                ) : lead.cold_outreach?.response_status === 'not_interested' ? (
                                  <span className="text-xs font-semibold text-destructive bg-destructive/10 px-2 py-0.5 rounded border border-destructive/20">
                                    Not Interested
                                  </span>
                                ) : (
                                  <span className="text-xs text-muted-foreground">Pending Response</span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Link
                                  href={`/leads/${lead._id}`}
                                  className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                                >
                                  View Lead <Eye className="h-3.5 w-3.5" />
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 3: Outreach Logs */}
              {activeTab === 'logs' && (
                <div className="space-y-4">
                  {logs.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
                      No outreach activity recorded for this campaign yet.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {logs.map((log: any) => (
                        <div key={log._id} className="rounded-xl border border-border bg-background p-4 flex items-center justify-between shadow-sm">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 font-medium text-sm">
                              <Mail className="h-4 w-4 text-primary" />
                              <span>{log.email_subject}</span>
                            </div>
                            {log.email_body_preview && (
                              <p className="text-xs text-muted-foreground line-clamp-1">{log.email_body_preview}</p>
                            )}
                            <div className="text-[11px] text-muted-foreground">
                              Sent: {new Date(log.sent_at || log.createdAt).toLocaleString()}
                            </div>
                          </div>
                          <div>
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium border capitalize ${
                              log.status === 'replied' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                              log.status === 'opened' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                              'bg-muted text-muted-foreground border-border'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Add Leads Picker Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-6 shadow-2xl flex flex-col max-h-[80vh]">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h3 className="text-lg font-bold">Add Leads to {campaign?.name}</h3>
                <p className="text-xs text-muted-foreground">Select leads to assign to this campaign.</p>
              </div>
              <button onClick={() => setShowAssignModal(false)} className="rounded-full p-1 hover:bg-muted">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto my-4 space-y-2">
              <div className="flex items-center justify-between pb-2 border-b border-border text-xs font-semibold text-muted-foreground px-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedLeadIds.length === allLeads.length && allLeads.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedLeadIds(allLeads.map(l => l._id));
                      else setSelectedLeadIds([]);
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <span>Select All ({allLeads.length})</span>
                </div>
                <span>Current Campaign</span>
              </div>

              {allLeads.map((l: any) => {
                const isChecked = selectedLeadIds.includes(l._id);
                return (
                  <div
                    key={l._id}
                    onClick={() => {
                      if (isChecked) setSelectedLeadIds(selectedLeadIds.filter(id => id !== l._id));
                      else setSelectedLeadIds([...selectedLeadIds, l._id]);
                    }}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm cursor-pointer transition-colors ${
                      isChecked ? 'bg-primary/10 border-primary/40' : 'bg-background border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div>
                        <div className="font-medium">{l.name}</div>
                        <div className="text-xs text-muted-foreground">{l.company_name || l.email}</div>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {l.cold_outreach?.campaign_name || 'Unassigned'}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center pt-4 border-t border-border">
              <span className="text-xs text-muted-foreground">
                {selectedLeadIds.length} lead(s) selected
              </span>
              <div className="flex gap-2">
                <button onClick={() => setShowAssignModal(false)} className="px-4 py-2 rounded-lg text-xs hover:bg-muted border border-border">
                  Cancel
                </button>
                <button
                  onClick={handleBulkAssign}
                  disabled={assigning || selectedLeadIds.length === 0}
                  className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : `Assign ${selectedLeadIds.length} Lead(s)`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
