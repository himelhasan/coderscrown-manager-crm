'use client';

import { AlertCircle, Calendar, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function OutreachSettings({ lead }: { lead: any }) { // Using any for ILead to simplify client props
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const outreach = lead.cold_outreach || {};
  
  const isLocked = !outreach.first_email_sent_date;

  const [formData, setFormData] = useState({
     next_followup_date: outreach.next_followup_date ? new Date(outreach.next_followup_date).toISOString().split('T')[0] : '',
     response_status: outreach.response_status || 'no_response',
     campaign_status: outreach.campaign_status || 'active'
  });

  const handleSave = async () => {
     setLoading(true);
     try {
        const res = await fetch(`/api/v1/leads/${lead._id}/outreach-status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        if(res.ok) {
            router.refresh();
        }
     } catch(e) {
        console.error(e);
     } finally {
        setLoading(false);
     }
  };

  if (isLocked) {
    return (
        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <AlertCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">Outreach Not Started</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                Send the first email using your N8N workflow to unlock outreach tracking and scheduling for this lead.
            </p>
        </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6">
       <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold flex items-center gap-2">
             <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
             Active Campaign
          </h3>
          <span className="text-xs text-muted-foreground">
             Started: {new Date(outreach.first_email_sent_date).toLocaleDateString()}
          </span>
       </div>

       <div className="space-y-4">
           {/* Response Status */}
           <div>
              <label className="text-sm font-medium mb-1.5 block">Response Status</label>
              <select 
                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.response_status}
                onChange={e => setFormData({...formData, response_status: e.target.value})}
              >
                  <option value="no_response">No Response</option>
                  <option value="interested">Interested</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="needs_info">Needs Info</option>
                  <option value="schedule_call">Schedule Call</option>
              </select>
           </div>

           {/* Next Follow-up */}
           <div>
              <label className="text-sm font-medium mb-1.5 block">Next Follow-up</label>
              <div className="relative">
                 <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                 <input 
                    type="date"
                    className="w-full rounded-md border border-input bg-background/50 pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                    value={formData.next_followup_date}
                    onChange={e => setFormData({...formData, next_followup_date: e.target.value})}
                 />
              </div>
           </div>

           {/* Campaign Status */}
           <div>
              <label className="text-sm font-medium mb-1.5 block">Campaign Status</label>
              <select 
                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                value={formData.campaign_status}
                onChange={e => setFormData({...formData, campaign_status: e.target.value})}
              >
                  <option value="active">Active</option>
                  <option value="paused">Paused</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
              </select>
           </div>

           <button 
             onClick={handleSave}
             disabled={loading}
             className="w-full mt-2 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
           >
              <Save className="h-4 w-4" />
              {loading ? 'Saving...' : 'Update Status'}
           </button>
       </div>
    </div>
  );
}
