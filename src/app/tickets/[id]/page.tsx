'use client';

import { useAuth } from '@/context/AuthContext';
import { ArrowLeft, ExternalLink, Loader2, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function TicketDetailPage() {
  const { id } = useParams();
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
      if (!authLoading && user) {
          fetchTicket();
      }
  }, [user, authLoading, id]);

  const fetchTicket = async () => {
      try {
          const res = await fetch(`/api/v1/tickets/${id}`);
          if (res.ok) {
              const data = await res.json();
              setTicket(data.data);
              scrollToBottom();
          } else {
              toast.error('Ticket not found');
              router.push('/tickets');
          }
      } catch (e) {
          console.error(e);
          toast.error('Failed to load ticket');
      } finally {
          setLoading(false);
      }
  };

  const scrollToBottom = () => {
      setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
  };

  const handleReply = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!reply.trim() || !user) return;
      setSending(true);

      try {
          const res = await fetch(`/api/v1/tickets/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  firebaseUid: user.uid,
                  content: reply
              })
          });

          if (res.ok) {
              setReply('');
              fetchTicket(); // Refresh messages
              toast.success('Reply sent');
          } else {
              toast.error('Failed to send reply');
          }
      } catch (e) {
          console.error(e);
          toast.error('Error sending reply');
      } finally {
          setSending(false);
      }
  };
  
  const updateStatus = async (newStatus: string) => {
      if (!user) return;
      const loadingToast = toast.loading('Updating status...');
      try {
            const res = await fetch(`/api/v1/tickets/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  firebaseUid: user.uid,
                  status: newStatus
              })
          });
          if (res.ok) {
              await fetchTicket();
              toast.success('Status updated', { id: loadingToast });
          } else {
              toast.error('Failed to update status', { id: loadingToast });
          }
      } catch(e) { 
          console.error(e); 
          toast.error('Error updating status', { id: loadingToast });
      }
  };

  if (loading || authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!ticket) return null;

  return (
    <div className="flex flex-col h-[calc(100vh-theme(spacing.20))]">
         {/* Header */}
        <div className="flex items-center justify-between border-b pb-4 mb-4">
             <div className="flex items-center gap-4">
                <Link href="/tickets" className="p-2 hover:bg-muted rounded-full">
                    <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                </Link>
                <div>
                    <h2 className="text-xl font-bold">{ticket.subject}</h2>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span className="capitalize px-2 py-0.5 rounded bg-secondary text-secondary-foreground text-xs">{ticket.type.replace('_', ' ')}</span>
                        <span>•</span>
                        <span>Ticket #{ticket._id.slice(-6)}</span>
                    </div>
                </div>
            </div>
            
            <div className="flex items-center gap-3">
                 {role !== 'client' && (
                     <select 
                        value={ticket.status}
                        onChange={(e) => updateStatus(e.target.value)}
                        className="text-sm bg-background border border-input rounded px-2 py-1 outline-none focus:ring-2 ring-primary"
                     >
                         <option value="open">Open</option>
                         <option value="in_progress">In Progress</option>
                         <option value="resolved">Resolved</option>
                         <option value="closed">Closed</option>
                     </select>
                 )}
                 <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize border 
                     ${ticket.status === 'open' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 
                       ticket.status === 'in_progress' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' : 
                       'bg-gray-500/10 text-gray-500 border-gray-500/20'}`}>
                     {ticket.status.replace('_', ' ')}
                 </div>
            </div>
        </div>

        {/* Client & Project Info Section */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6 shadow-sm">
            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Ticket Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Client Name</p>
                    <p className="text-sm font-medium">{ticket.client?.displayName || 'N/A'}</p>
                </div>
                <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Client Email</p>
                    <p className="text-sm font-medium">{ticket.client?.email || 'N/A'}</p>
                </div>
                {/* Project Info */}
                <div className="space-y-1">
                     <p className="text-xs text-muted-foreground">Related Project</p>
                     {ticket.project ? (
                         <div className="flex items-center gap-2">
                             <p className="text-sm font-medium">{ticket.project.name}</p>
                             {/* Only link if user has access presumably, but let's allow viewing project link */}
                             <Link href="/projects" className="text-primary hover:text-primary/80">
                                 <ExternalLink className="h-3 w-3" />
                             </Link>
                         </div>
                     ) : (
                         <p className="text-sm font-medium text-muted-foreground">None</p>
                     )}
                </div>
                 <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Priority</p>
                    <p className={`text-sm font-medium capitalize ${
                        ticket.priority === 'high' ? 'text-destructive' : 
                        ticket.priority === 'medium' ? 'text-yellow-500' : 'text-muted-foreground'
                    }`}>
                        {ticket.priority}
                    </p>
                </div>
            </div>
        </div>

        {/* Messages Information */}
        <div className="flex-1 overflow-y-auto space-y-6 p-4 bg-muted/30 rounded-xl mb-4">
             {ticket.messages.length === 0 && (
                 <div className="text-center text-muted-foreground text-sm py-10">No messages yet.</div>
             )}
             {ticket.messages.map((msg: any, i: number) => {
                 const isCurrentUser = user && msg.sender?.email === user.email;
                 
                 return (
                     <div key={i} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                         <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold
                             ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'}`}>
                             {msg.sender?.displayName?.[0] || 'U'}
                         </div>
                         <div className={`max-w-[80%] rounded-lg p-3 text-sm space-y-1
                             ${isCurrentUser ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
                             <div className="flex items-center justify-between gap-4 text-xs opacity-70 mb-1">
                                 <span className="font-semibold">{msg.sender?.displayName || 'User'}</span>
                                 <span>{new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                             </div>
                             <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                         </div>
                     </div>
                 );
             })}
             <div ref={messagesEndRef} />
        </div>

        {/* Reply Input */}
        <form onSubmit={handleReply} className="relative mt-auto">
            <textarea 
                value={reply}
                onChange={e => setReply(e.target.value)}
                placeholder="Type your reply..."
                className="w-full rounded-xl border border-input bg-background pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-primary outline-none resize-none shadow-sm"
                rows={1}
                onKeyDown={e => {
                    if(e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply(e);
                    }
                }}
            />
            <button 
                type="submit" 
                disabled={!reply.trim() || sending}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
        </form>
    </div>
  );
}
