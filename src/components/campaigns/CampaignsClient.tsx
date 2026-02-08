'use client';

import { Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';
import NewCampaignModal from './NewCampaignModal';

export default function CampaignsClient({ campaigns }: { campaigns: any[] }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string) => {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Campaigns</h2>
        <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
             <Plus className="h-4 w-4" /> New Campaign
        </button>
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {campaigns.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
                No campaigns found. Create one to start tracking metrics.
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-muted/50">
                        <tr>
                            <th className="px-6 py-3 font-medium">Name</th>
                            <th className="px-6 py-3 font-medium">Leads</th>
                            <th className="px-6 py-3 font-medium">Sent</th>
                            <th className="px-6 py-3 font-medium">Open Rate</th>
                            <th className="px-6 py-3 font-medium">Response Rate</th>
                            <th className="px-6 py-3 font-medium text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {campaigns.map((c: any) => (
                            <tr key={c._id} className="hover:bg-muted/50 transition-colors">
                                <td className="px-6 py-4 font-medium">
                                    <div className="flex flex-col">
                                        <span>{c.name}</span>
                                        {c.description && <span className="text-xs text-muted-foreground line-clamp-1">{c.description}</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{c.metrics?.total_leads || 0}</td>
                                <td className="px-6 py-4">{c.metrics?.emails_sent || 0}</td>
                                <td className="px-6 py-4">{c.metrics?.open_rate || 0}%</td>
                                <td className="px-6 py-4">{c.metrics?.response_rate || 0}%</td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => handleDelete(c._id)}
                                        disabled={deletingId === c._id}
                                        className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-50 p-2 rounded-md hover:bg-destructive/10"
                                        title="Delete Campaign"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}
      </div>

      <NewCampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
