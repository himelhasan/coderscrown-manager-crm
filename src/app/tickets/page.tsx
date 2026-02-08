'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2, MessageSquare, Plus, Tag, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function TicketsPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [projectsDropdown, setProjectsDropdown] = useState<any[]>([]); 
  const [clientsDropdown, setClientsDropdown] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // New Ticket Form
  const [formData, setFormData] = useState({
      subject: '',
      type: 'website_development',
      description: '',
      priority: 'medium',
      project: '',
      client_id: '' // For admin to select client
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
        fetchTickets();
        fetchProjects(); // Projects needed for both client and admin (admin sees all keys, client sees theirs)
        if (role === 'admin') {
            fetchClients();
        }
    } else if (!authLoading && !user) {
        router.push('/login');
    }
  }, [user, authLoading, router, role]);

  const fetchTickets = async () => {
      try {
          if (!user) return;
          const res = await fetch(`/api/v1/tickets?firebaseUid=${user.uid}`);
          if (res.ok) {
              const data = await res.json();
              setTickets(data.data);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const fetchProjects = async () => {
      try {
          const res = await fetch('/api/v1/projects');
          const json = await res.json();
          // Filter if client
          if (role === 'client') {
              setProjectsDropdown((json.data || []).filter((p: any) => p.client_id === user?.uid));
          } else {
              setProjectsDropdown(json.data || []);
          }
      } catch (e) { console.error(e); }
  };

  const fetchClients = async () => {
      try {
          const res = await fetch('/api/v1/users');
          const json = await res.json();
          setClientsDropdown((json.data || []).filter((u: any) => u.role === 'client'));
      } catch (e) { console.error(e); }
  };

  const handleCreate = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      
      // Admin matching check
      if (role === 'admin' && !formData.client_id) {
          toast.error('Please select a client');
          return;
      }

      setSubmitting(true);
      const loadingToast = toast.loading('Creating ticket...');

      try {
          const res = await fetch('/api/v1/tickets', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  firebaseUid: user.uid,
                  ...formData,
                  project: formData.project || undefined,
                  client_id: formData.client_id || undefined
              })
          });

          if (res.ok) {
              setShowModal(false);
              setFormData({ subject: '', type: 'website_development', description: '', priority: 'medium', project: '', client_id: '' });
              fetchTickets(); 
              toast.success('Ticket created', { id: loadingToast });
          } else {
              toast.error('Failed to create ticket', { id: loadingToast });
          }
      } catch (e) {
          console.error(e);
          toast.error('Error creating ticket', { id: loadingToast });
      } finally {
          setSubmitting(false);
      }
  };

  const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this ticket?')) return;
      const loadingToast = toast.loading('Deleting ticket...');
      setDeletingId(id);
      try {
          const res = await fetch(`/api/v1/tickets?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
              setTickets(tickets.filter(t => t._id !== id));
              toast.success('Ticket deleted', { id: loadingToast });
          } else {
              toast.error('Failed to delete ticket', { id: loadingToast });
          }
      } catch(e) {
          console.error(e);
          toast.error('Error deleting ticket', { id: loadingToast });
      } finally {
          setDeletingId(null);
      }
  };

  if (authLoading || loading) {
       return (
           <div className="flex h-screen items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
       );
   }

  return (
    <div className="space-y-6">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Support Tickets</h2>
                <p className="text-muted-foreground mt-1">Manage your support requests and inquiries.</p>
            </div>
            {/* Admin can also create tickets now */}
            <button 
                onClick={() => setShowModal(true)}
                className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
                <Plus className="h-4 w-4" /> New Ticket
            </button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
             {tickets.length === 0 ? (
                 <div className="p-12 text-center text-muted-foreground">
                     <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                     <p>No tickets found.</p>
                 </div>
             ) : (
                 <table className="w-full text-left text-sm">
                     <thead className="bg-muted/50 text-muted-foreground">
                         <tr>
                             <th className="px-6 py-3 font-medium">Subject</th>
                             <th className="px-6 py-3 font-medium">Type</th>
                             <th className="px-6 py-3 font-medium">Project</th>
                             <th className="px-6 py-3 font-medium">Status</th>
                             <th className="px-6 py-3 font-medium">Last Update</th>
                             <th className="px-6 py-3 font-medium text-right">Action</th>
                         </tr>
                     </thead>
                     <tbody className="divide-y divide-border">
                         {tickets.map((t) => (
                             <tr key={t._id} className="hover:bg-muted/50 transition-colors">
                                 <td className="px-6 py-4 font-medium">
                                     <Link href={`/tickets/${t._id}`} className="hover:underline text-foreground">
                                         {t.subject}
                                     </Link>
                                     {role !== 'client' && t.client && (
                                         <div className="text-xs text-muted-foreground mt-0.5">by {t.client.displayName || t.client.email}</div>
                                     )}
                                 </td>
                                 <td className="px-6 py-4 text-muted-foreground capitalize">{t.type.replace('_', ' ')}</td>
                                 <td className="px-6 py-4 text-muted-foreground">
                                     {t.project ? (
                                         <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-secondary text-secondary-foreground text-xs">
                                             <Tag className="h-3 w-3" />
                                             {t.project.name}
                                         </span>
                                     ) : '-'}
                                 </td>
                                 <td className="px-6 py-4">
                                     <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium 
                                         ${t.status === 'open' ? 'bg-green-500/10 text-green-500' : 
                                           t.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500' : 
                                           t.status === 'resolved' ? 'bg-purple-500/10 text-purple-500' :
                                           'bg-gray-500/10 text-gray-500'}`}>
                                         {t.status.replace('_', ' ')}
                                     </span>
                                 </td>
                                 <td className="px-6 py-4 text-muted-foreground">
                                     {new Date(t.updatedAt).toLocaleDateString()}
                                 </td>
                                 <td className="px-6 py-4 text-right flex justify-end gap-2">
                                     <Link href={`/tickets/${t._id}`} className="text-primary hover:underline">
                                         View
                                     </Link>
                                     {role === 'admin' && (
                                         <button 
                                            onClick={() => handleDelete(t._id)}
                                            disabled={deletingId === t._id}
                                            className="ml-2 text-muted-foreground hover:text-destructive disabled:opacity-50"
                                         >
                                             <Trash2 className="h-4 w-4" />
                                         </button>
                                     )}
                                 </td>
                             </tr>
                         ))}
                     </tbody>
                 </table>
             )}
        </div>

        {/* Create Ticket Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div className="w-full max-w-lg rounded-xl bg-card p-6 shadow-lg border border-border max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4">Create New Ticket</h3>
                    <form onSubmit={handleCreate} className="space-y-4">
                         
                        {/* Admin: Client Selection */}
                        {role === 'admin' && (
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Assign to Client</label>
                                <select 
                                    required
                                    value={formData.client_id}
                                    onChange={e => setFormData({...formData, client_id: e.target.value})}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="">-- Select Client --</option>
                                    {clientsDropdown.map(c => (
                                        <option key={c._id} value={c._id}>{c.displayName || c.email}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Subject</label>
                            <input 
                                required 
                                value={formData.subject}
                                onChange={e => setFormData({...formData, subject: e.target.value})}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" 
                                placeholder="Brief summary of issue"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Type</label>
                                <select 
                                    value={formData.type}
                                    onChange={e => setFormData({...formData, type: e.target.value})}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="website_development">Website Development</option>
                                    <option value="maintenance">Maintenance</option>
                                    <option value="update">Update</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>
                           <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <select 
                                    value={formData.priority}
                                    onChange={e => setFormData({...formData, priority: e.target.value})}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>
                        </div>

                         {/* Project Selection */}
                         <div className="space-y-2">
                             <label className="text-sm font-medium">Related Project (Optional)</label>
                             <select 
                                 value={formData.project}
                                 onChange={e => setFormData({...formData, project: e.target.value})}
                                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                             >
                                 <option value="">-- Select Project --</option>
                                 {projectsDropdown.map(p => (
                                     <option key={p._id} value={p._id}>{p.name}</option>
                                 ))}
                             </select>
                         </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <textarea 
                                required 
                                rows={4}
                                value={formData.description}
                                onChange={e => setFormData({...formData, description: e.target.value})}
                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none" 
                                placeholder="Describe your request in detail..."
                            />
                        </div>
                        <div className="flex justify-end gap-3 pt-4">
                            <button 
                                type="button"
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 rounded-lg border border-border hover:bg-muted text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit"
                                disabled={submitting}
                                className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 text-sm font-medium"
                            >
                                {submitting ? 'Creating...' : 'Create Ticket'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
