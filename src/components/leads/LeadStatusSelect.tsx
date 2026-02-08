'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

const STATUS_COLORS: any = {
    new: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    in_progress: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    contacted: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    waiting_response: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    qualified: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    converted: 'bg-green-500/10 text-green-500 border-green-500/20',
    not_interested: 'bg-red-500/10 text-red-500 border-red-500/20',
};

export default function LeadStatusSelect({ leadId, currentStatus }: { leadId: string, currentStatus: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const handleChange = async (newStatus: string) => {
      if (newStatus === currentStatus) return;
      setLoading(true);
      try {
          // We can use the PUT /leads/[id] endpoint we verified earlier
          await fetch(`/api/v1/leads/${leadId}`, {
             method: 'PUT',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ status: newStatus }) 
          });
          router.refresh();
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <select 
        value={currentStatus}
        onChange={(e) => handleChange(e.target.value)}
        disabled={loading}
        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border outline-none cursor-pointer appearance-none ${STATUS_COLORS[currentStatus] || 'bg-secondary text-secondary-foreground'} ${loading ? 'opacity-50' : ''}`}
        style={{ textAlignLast: 'center' }}
    >
        <option value="new">New</option>
        <option value="in_progress">In Progress</option>
        <option value="contacted">Contacted</option>
        <option value="waiting_response">Waiting Response</option>
        <option value="qualified">Qualified</option>
        <option value="converted">Converted</option>
        <option value="not_interested">Not Interested</option>
    </select>
  );
}
