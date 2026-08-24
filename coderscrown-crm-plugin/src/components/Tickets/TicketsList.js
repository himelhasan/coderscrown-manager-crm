import { useEffect, useState } from '@wordpress/element';
import { bulkUpdateTickets, fetchTickets } from '../../api';
import Modal from '../common/Modal';
import TicketForm from './TicketForm';

const TicketsList = () => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({ status: '', priority: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentTicket, setCurrentTicket] = useState(null);

    const settings = window.codersCrownSettings || {};
    const canManageTickets = settings.currentUser?.caps?.manage_crm_tickets; // Admin/Support
    const isAdmin = settings.currentUser?.roles?.includes('administrator');

    useEffect(() => {
        loadTickets();
    }, [filters]);

    const loadTickets = async () => {
        setLoading(true);
        try {
            const data = await fetchTickets(filters);
            setTickets(data);
        } catch (error) {
            console.error('Error fetching tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters({ ...filters, [key]: value });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(tickets.map(t => t.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(sid => sid !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleBulkAction = async (action, status = '') => {
        if (!confirm('Are you sure?')) return;
        
        try {
            await bulkUpdateTickets(selectedIds, action, status);
            loadTickets();
            setSelectedIds([]);
        } catch (error) {
            alert('Error updating tickets');
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setCurrentTicket(null);
        setIsModalOpen(true);
    };

    const openEditModal = (ticket) => {
        setCurrentTicket(ticket);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentTicket(null);
    };

    const handleFormSuccess = () => {
        closeModal();
        loadTickets();
    };

    return (
        <>
            <div className="bg-white shadow rounded-lg p-6">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
                    <div className="flex space-x-2 items-center">
                        <select 
                            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={filters.status}
                            onChange={(e) => handleFilterChange('status', e.target.value)}
                        >
                            <option value="">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="closed">Closed</option>
                        </select>

                        <select 
                            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={filters.priority}
                            onChange={(e) => handleFilterChange('priority', e.target.value)}
                        >
                            <option value="">All Priorities</option>
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                        
                        {selectedIds.length > 0 && (
                            <>
                                <span className="text-gray-400">|</span>
                                {canManageTickets && (
                                    <button onClick={() => handleBulkAction('update_status', 'closed')} className="text-sm text-gray-600 hover:text-indigo-600">Close Selected</button>
                                )}
                                {isAdmin && (
                                    <button onClick={() => handleBulkAction('delete')} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                                )}
                            </>
                        )}
                    </div>
                    <div>
                        <button 
                            onClick={openCreateModal}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                        >
                            New Ticket
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input type="checkbox" onChange={handleSelectAll} checked={tickets.length > 0 && selectedIds.length === tickets.length} />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : tickets.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">No tickets found.</td></tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(ticket.id)} 
                                                onChange={() => handleSelectOne(ticket.id)} 
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{ticket.subject}</div>
                                            <div className="text-xs text-gray-500">{ticket.type}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${ticket.priority === 'urgent' ? 'bg-red-100 text-red-800' : 
                                                ticket.priority === 'high' ? 'bg-orange-100 text-orange-800' : 'bg-green-100 text-green-800'}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.status}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.updatedAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(ticket)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal 
                isOpen={isModalOpen} 
                onClose={closeModal} 
                title={currentTicket ? 'Edit Ticket' : 'New Ticket'}
            >
                <TicketForm 
                    ticket={currentTicket} 
                    onSuccess={handleFormSuccess} 
                    onCancel={closeModal} 
                />
            </Modal>
        </>
    );
};

export default TicketsList;
