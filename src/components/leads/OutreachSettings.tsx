'use client';

import { Calendar, Save, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function OutreachSettings({ lead }: { lead: any }) {
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    const fetchCampaigns = async () => {
      try {
        const res = await fetch('/api/v1/campaigns');
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.data || []);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchCampaigns();
  }, []);

  const outreach = lead.cold_outreach || {
    status: 'not_started',
    first_email_sent_date: null,
    next_followup_date: null,
    followup_count: 0
  };

  const [formData, setFormData] = useState({
    campaign_name: outreach.campaign_name || '',
    next_followup_date: outreach.next_followup_date ? new Date(outreach.next_followup_date).toISOString().split('T')[0] : '',
    response_status: outreach.response_status || 'no_response',
    campaign_status: outreach.campaign_status || 'active'
  });

  const handleSave = async () => {
    setLoading(true);
    const loadingToast = toast.loading('Saving outreach settings...');
    try {
      const res = await fetch(`/api/v1/leads/${lead._id}/outreach-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        toast.success('Outreach settings updated', { id: loadingToast });
        router.refresh();
      } else {
        toast.error('Failed to update outreach settings', { id: loadingToast });
      }
    } catch (e) {
      console.error(e);
      toast.error('Error saving settings', { id: loadingToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Outreach & Campaign Assignment
        </h3>
        {outreach.first_email_sent_date && (
          <span className="text-xs text-muted-foreground">
            First Email: {mounted ? new Date(outreach.first_email_sent_date).toLocaleDateString() : '...'}
          </span>
        )}
      </div>

      <div className="space-y-4">
        {/* Campaign Assignment */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Assigned Campaign</label>
          <select
            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={formData.campaign_name}
            onChange={e => setFormData({ ...formData, campaign_name: e.target.value })}
          >
            <option value="">-- No Campaign Assigned --</option>
            {campaigns.map((c: any) => (
              <option key={c._id} value={c.name}>
                {c.name} ({c.status})
              </option>
            ))}
          </select>
        </div>

        {/* Response Status */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Response Interest Status</label>
          <select
            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={formData.response_status}
            onChange={e => setFormData({ ...formData, response_status: e.target.value })}
          >
            <option value="no_response">No Response / Pending</option>
            <option value="interested">Interested (Positive)</option>
            <option value="not_interested">Not Interested</option>
            <option value="needs_info">Needs More Info</option>
            <option value="schedule_call">Schedule Call</option>
          </select>
        </div>

        {/* Next Follow-up */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Next Scheduled Follow-up</label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="date"
              className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
              value={formData.next_followup_date}
              onChange={e => setFormData({ ...formData, next_followup_date: e.target.value })}
            />
          </div>
        </div>

        {/* Campaign Progress Status */}
        <div>
          <label className="text-sm font-medium mb-1.5 block">Lead Outreach Status</label>
          <select
            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
            value={formData.campaign_status}
            onChange={e => setFormData({ ...formData, campaign_status: e.target.value })}
          >
            <option value="active">Active Outreach</option>
            <option value="paused">Paused</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed / Bounced</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {loading ? 'Saving...' : 'Save Settings & Campaign'}
        </button>
      </div>
    </div>
  );
}
