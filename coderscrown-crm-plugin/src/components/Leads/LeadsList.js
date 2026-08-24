import { useEffect, useState } from '@wordpress/element';
import { bulkUpdateLeads, fetchLeads } from '../../api';
import Modal from '../common/Modal';
import LeadForm from './LeadForm';

const LeadsList = () => {
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({ status: '', s: '' });

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentLead, setCurrentLead] = useState(null);

    useEffect(() => {
        loadLeads();
    }, [filters]);

    const loadLeads = async () => {
        setLoading(true);
        try {
            const data = await fetchLeads(filters);
            setLeads(data);
        } catch (error) {
            console.error('Error fetching leads:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setFilters({ ...filters, s: e.target.value });
    };

    const handleStatusFilterChange = (e) => {
        setFilters({ ...filters, status: e.target.value });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(leads.map(lead => lead.id));
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

    const handleBulkDelete = async () => {
        if (!confirm('Are you sure you want to delete selected leads?')) return;
        
        try {
            await bulkUpdateLeads(selectedIds, 'delete');
            loadLeads();
            setSelectedIds([]);
        } catch (error) {
            alert('Error deleting leads');
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setCurrentLead(null);
        setIsModalOpen(true);
    };

    const openEditModal = (lead) => {
        setCurrentLead(lead);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentLead(null);
    };

    const handleFormSuccess = () => {
        closeModal();
        loadLeads();
    };

    return (
        <>
            <div className="bg-white shadow rounded-lg p-6">
                {/* Toolbar */}
                <div className="flex flex-col md:flex-row justify-between mb-4 space-y-2 md:space-y-0">
                    <div className="flex space-x-2">
                        <select 
                            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={filters.status}
                            onChange={handleStatusFilterChange}
                        >
                            <option value="">All Statuses</option>
                            <option value="new">New</option>
                            <option value="contacted">Contacted</option>
                            <option value="qualified">Qualified</option>
                            <option value="customer">Customer</option>
                        </select>
                        {selectedIds.length > 0 && (
                            <button 
                                onClick={handleBulkDelete}
                                className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                            >
                                Delete ({selectedIds.length})
                            </button>
                        )}
                    </div>
                     <div className="flex space-x-2">
                        <input 
                            type="text" 
                            placeholder="Search leads..." 
                            className="border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                            value={filters.s}
                            onChange={handleSearchChange}
                        />
                        <button 
                            onClick={openCreateModal}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                        >
                            New Lead
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input type="checkbox" onChange={handleSelectAll} checked={leads.length > 0 && selectedIds.length === leads.length} />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="7" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : leads.length === 0 ? (
                                <tr><td colSpan="7" className="px-6 py-4 text-center">No leads found.</td></tr>
                            ) : (
                                leads.map((lead) => (
                                    <tr key={lead.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(lead.id)} 
                                                onChange={() => handleSelectOne(lead.id)} 
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                                            <div className="text-sm text-gray-500">{lead.company_name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.email}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lead.source}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(lead.createdAt).toLocaleDateString()}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(lead)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
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
                title={currentLead ? 'Edit Lead' : 'New Lead'}
            >
                <LeadForm 
                    lead={currentLead} 
                    onSuccess={handleFormSuccess} 
                    onCancel={closeModal} 
                />
            </Modal>
        </>
    );
};

export default LeadsList;
