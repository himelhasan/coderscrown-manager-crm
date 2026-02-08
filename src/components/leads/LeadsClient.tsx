'use client';

import LeadStatusSelect from '@/components/leads/LeadStatusSelect';
import { useAuth } from '@/context/AuthContext';
import { Eye, Facebook, Instagram, Mail, MessageCircle, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function LeadsClient({ initialLeads }: { initialLeads: any[] }) {
  const { role } = useAuth();
  const router = useRouter();
  const [leads, setLeads] = useState(initialLeads);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Leads</h2>
        <Link href="/leads/new" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 flex items-center gap-2">
             <Plus className="h-4 w-4" /> Add New Lead
        </Link>
      </div>

      {/* Filters could go here, passing state up or using URL params via router */}

      <div className="rounded-xl border border-border bg-card shadow-sm flex flex-col h-[calc(100vh-220px)]">
        <div className="flex-1 overflow-auto">
        <table className="w-full text-left text-sm relative">
            <thead className="bg-muted/50 text-muted-foreground sticky top-0 z-10">
                <tr>
                    <th className="px-6 py-3 font-medium">Name</th>
                    <th className="px-6 py-3 font-medium">Company</th>
                    <th className="px-6 py-3 font-medium">Email</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Follow-up</th>
                    <th className="px-6 py-3 font-medium text-right">Actions</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-border">
                {leads.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                            No leads found.
                        </td>
                    </tr>
                ) : (
                    leads.map((lead: any) => (
                        <tr key={lead._id} className="hover:bg-muted/50 transition-colors border-b last:border-0 border-border">
                            <td className="px-6 py-4 font-medium">
                                <Link href={`/leads/${lead._id}`} className="hover:underline text-primary">
                                    {lead.name}
                                </Link>
                            </td>
                            <td className="px-6 py-4 text-muted-foreground">{lead.company_name || '-'}</td>
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
                                            {/* Using generic icon or Lucide's Linkedin if available */}
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
                                    new Date(lead.cold_outreach.next_followup_date).toLocaleDateString() : 
                                    '-'}
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
                    ))
                )}
            </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
