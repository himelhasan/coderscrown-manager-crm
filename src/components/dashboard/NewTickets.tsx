import { MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function NewTickets({ tickets }: { tickets: any[] }) {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm h-full flex flex-col">
      <div className="border-b border-border p-6 flex flex-row items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            New Tickets
        </h3>
        <Link href="/tickets" className="text-xs text-primary hover:underline">View All</Link>
      </div>
      <div className="p-6 flex-1 overflow-auto">
         {tickets?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                <MessageSquare className="h-8 w-8 mb-2 opacity-20" />
                <p>No new tickets.</p>
            </div>
        ) : (
            <div className="space-y-4">
                {tickets.map((ticket) => (
                    <div key={ticket._id} className="group flex items-start justify-between gap-4 p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors">
                        <div className="space-y-1">
                            <Link href={`/tickets/${ticket._id}`} className="font-medium text-sm hover:text-primary hover:underline line-clamp-1">
                                {ticket.subject}
                            </Link>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span className={`capitalize ${
                                    ticket.status === 'open' ? 'text-green-500 font-medium' :
                                    ticket.status === 'in_progress' ? 'text-blue-500' : 'text-gray-500'
                                }`}>
                                    {ticket.status.replace('_', ' ')}
                                </span>
                                <span>•</span>
                                <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                                {ticket.client && (
                                    <>
                                        <span>•</span>
                                        <span className="font-medium text-foreground">{ticket.client.displayName || 'Client'}</span>
                                    </>
                                )}
                            </div>
                        </div>
                        <Link href={`/tickets/${ticket._id}`} className="opacity-0 group-hover:opacity-100 transition-opacity text-xs bg-primary/10 text-primary px-2 py-1 rounded">
                            View
                        </Link>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
