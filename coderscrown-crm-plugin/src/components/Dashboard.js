import { useEffect, useState } from '@wordpress/element';
import { fetchLeads, fetchProjects, fetchTickets } from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState({
        projects: { total: 0, active: 0 },
        tickets: { total: 0, open: 0 },
        leads: { total: 0, new: 0 }
    });
    const [loading, setLoading] = useState(true);
    
    const settings = window.codersCrownSettings || {};
    const canViewLeads = settings.currentUser?.caps?.manage_crm_leads;
    const user = settings.currentUser || {};

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            // Fetch all data to calculate stats client-side
            // In a real app, we'd want a dedicated /stats endpoint
            const projectsPromise = fetchProjects();
            const ticketsPromise = fetchTickets();
            const leadsPromise = canViewLeads ? fetchLeads() : Promise.resolve([]);

            const [projects, tickets, leads] = await Promise.all([projectsPromise, ticketsPromise, leadsPromise]);

            setStats({
                projects: {
                    total: projects.length,
                    active: projects.filter(p => p.status === 'in_progress').length
                },
                tickets: {
                    total: tickets.length,
                    open: tickets.filter(t => t.status === 'open').length
                },
                leads: {
                    total: leads.length,
                    new: leads.filter(l => l.status === 'new').length
                }
            });
        } catch (error) {
            console.error('Error loading dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Dashboard</h3>
                <p className="mt-1 text-sm text-gray-500">Welcome back, {user.display_name || 'User'}!</p>
            </div>

            {loading ? (
                <p>Loading stats...</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Projects Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Total Projects</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{stats.projects.total}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <a href="#/projects" className="font-medium text-indigo-700 hover:text-indigo-900">View all projects</a>
                            </div>
                        </div>
                    </div>

                    {/* Tickets Card */}
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="p-5">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
                                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                                    </svg>
                                </div>
                                <div className="ml-5 w-0 flex-1">
                                    <dl>
                                        <dt className="text-sm font-medium text-gray-500 truncate">Open Tickets</dt>
                                        <dd>
                                            <div className="text-lg font-medium text-gray-900">{stats.tickets.open}</div>
                                        </dd>
                                    </dl>
                                </div>
                            </div>
                        </div>
                        <div className="bg-gray-50 px-5 py-3">
                            <div className="text-sm">
                                <a href="#/tickets" className="font-medium text-indigo-700 hover:text-indigo-900">View all tickets</a>
                            </div>
                        </div>
                    </div>

                    {/* Leads Card (Conditional) */}
                    {canViewLeads && (
                        <div className="bg-white overflow-hidden shadow rounded-lg">
                            <div className="p-5">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0 bg-yellow-500 rounded-md p-3">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-5 w-0 flex-1">
                                        <dl>
                                            <dt className="text-sm font-medium text-gray-500 truncate">New Leads</dt>
                                            <dd>
                                                <div className="text-lg font-medium text-gray-900">{stats.leads.new}</div>
                                            </dd>
                                        </dl>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-gray-50 px-5 py-3">
                                <div className="text-sm">
                                    <a href="#/leads" className="font-medium text-indigo-700 hover:text-indigo-900">View all leads</a>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Dashboard;
