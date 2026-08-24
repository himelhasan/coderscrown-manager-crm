'use client';

import { BarChart3, FolderKanban, Inbox, MessageSquare, Send, Users } from 'lucide-react';
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import NewTickets from './NewTickets';
import OngoingProjects from './OngoingProjects';
import StatsCard from './StatsCard';

export default function DashboardClient() {
  const { user, role, loading: authLoading } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
        const res = await fetch('/api/v1/dashboard', {
            headers: {
                'X-User-UID': user?.uid || ''
            }
        });
        const json = await res.json();
        setData(json);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    setMounted(true);
    if (user) {
        fetchDashboardData();
    } else if (!authLoading) {
        setLoading(false); // No user, stop loading (will redirect or show empty)
    }
  }, [user, authLoading, fetchDashboardData]);

  if (authLoading || loading) {
      return <div className="p-8 text-center text-muted-foreground">Loading dashboard...</div>;
  }

  if (!user) {
      return <div className="p-8 text-center">Please log in to view the dashboard.</div>;
  }

  const isClient = role === 'client';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">
            {isClient ? 'Overview of your projects and tickets.' : 'Overview of outreach performance and leads.'}
          </p>
        </div>
        {!isClient && (
            <div className="flex gap-3">
                <Link href="/leads" className="inline-flex items-center justify-center rounded-lg bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground shadow-sm hover:bg-secondary/80">
                    View Leads
                </Link>
                <Link href="/import" className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow shadow-primary/20 hover:bg-primary/90">
                    Import CSV
                </Link>
            </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {isClient ? (
            <>
                <StatsCard 
                    title="Active Tickets" 
                    value={data?.stats?.activeTickets || 0} 
                    change="Current Issues" 
                    trend="neutral"
                    icon={MessageSquare} 
                />
                <StatsCard 
                    title="Solved Tickets" 
                    value={data?.stats?.solvedTickets || 0} 
                    change="Total Resolved" 
                    trend="up"
                    icon={MessageSquare} 
                />
                {/* Placeholder for more client stats if needed */}
                <StatsCard 
                    title="My Projects" 
                    value={data?.projects?.length || 0} 
                    change="Active Projects" 
                    trend="neutral"
                    icon={FolderKanban} 
                />
            </>
        ) : (
            <>
                <StatsCard 
                    title="Total Leads" 
                    value={mounted ? (data?.stats?.totalLeads?.toLocaleString() || '0') : '...'} 
                    change="All time" 
                    trend="neutral"
                    icon={Users} 
                />
                <StatsCard 
                    title="Emails Sent" 
                    value={mounted ? (data?.stats?.totalSent?.toLocaleString() || '0') : '...'} 
                    change={`${(data?.stats?.totalSent > 0 ? (data?.stats?.totalReplies / data?.stats?.totalSent * 100).toFixed(1) : 0)}% Reply Rate`}
                    trend="up"
                    icon={Send} 
                />
                <StatsCard 
                    title="Active Campaigns" 
                    value={data?.stats?.activeCampaigns || 0} 
                    change={`${data?.stats?.leadsInProgress || 0} Leads Processed`} 
                    trend="up"
                    icon={Inbox} 
                />
                <StatsCard 
                    title="Conversion Rate" 
                    value={`${(data?.stats?.totalLeads > 0 ? (data?.stats?.convertedLeads / data?.stats?.totalLeads * 100).toFixed(1) : 0)}%`} 
                    change={`${data?.stats?.convertedLeads || 0} Converted`} 
                    trend="up"
                    icon={BarChart3} 
                />
            </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        
        {isClient ? (
             <div className="col-span-full space-y-6">
                
                {/* Client Projects List */}
                <div className="rounded-xl border border-border bg-card shadow-sm p-6">
                    <h3 className="font-semibold mb-4">My Projects</h3>
                    {data?.projects?.length > 0 ? (
                        <div className="grid gap-4 md:grid-cols-2">
                             {data.projects.map((project: any) => (
                                <div key={project._id} className="p-4 rounded-lg bg-secondary/10 border border-border flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium">{project.name}</h4>
                                        <span className="text-xs text-muted-foreground capitalize">{project.status}</span>
                                    </div>
                                    {project.link && (
                                        <a href={project.link} target="_blank" className="text-primary text-sm hover:underline">View</a>
                                    )}
                                </div>
                             ))}
                        </div>
                    ) : (
                        <p className="text-muted-foreground text-sm">No active projects found.</p>
                    )}
                </div>

                {/* Recent Tickets List - Client View */}
                 <div className="rounded-xl border border-border bg-card shadow-sm p-6">
                    <h3 className="font-semibold mb-4">Recent Tickets</h3>
                     {data?.recentTickets?.length > 0 ? (
                        <div className="space-y-4">
                             {data.recentTickets.map((ticket: any) => (
                                <div key={ticket._id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-2 w-2 rounded-full ${ticket.status === 'open' ? 'bg-green-500' : 'bg-gray-300'}`} />
                                        <div>
                                            <p className="font-medium text-sm">{ticket.subject}</p>
                                            <p className="text-xs text-muted-foreground capitalize">
                                                {ticket.status} • {mounted ? new Date(ticket.createdAt).toLocaleDateString() : '...'}
                                            </p>
                                        </div>
                                    </div>
                                    <Link href={`/tickets/${ticket._id}`} className="text-xs bg-secondary px-2 py-1 rounded hover:bg-secondary/80">
                                        View
                                    </Link>
                                </div>
                             ))}
                        </div>
                    ) : (
                         <p className="text-muted-foreground text-sm">No recent tickets.</p>
                    )}
                     <div className="mt-4 pt-4 border-t border-border">
                        <Link href="/tickets" className="text-sm text-primary hover:underline">View all tickets</Link>
                     </div>
                </div>

             </div>
        ) : (
            <>
                {/* New Tickets Section */}
                <div className="col-span-4 h-full">
                    <NewTickets tickets={data?.newTickets || []} />
                </div>

                {/* Ongoing Projects Section */}
                <div className="col-span-3 h-full">
                    <OngoingProjects projects={data?.ongoingProjects || []} />
                </div>
            </>
        )}
      </div>
    </div>
  );
}
