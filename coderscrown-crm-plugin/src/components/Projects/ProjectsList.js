import { useEffect, useState } from '@wordpress/element';
import { bulkUpdateProjects, fetchProjects } from '../../api';
import Modal from '../common/Modal';
import ProjectForm from './ProjectForm';

const ProjectsList = () => {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedIds, setSelectedIds] = useState([]);
    const [filters, setFilters] = useState({ status: '' });
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentProject, setCurrentProject] = useState(null);
    
    // Check user caps for showing delete button
    const settings = window.codersCrownSettings || {};
    const canManageProjects = settings.currentUser?.caps?.manage_crm_projects;

    useEffect(() => {
        loadProjects();
    }, [filters]);

    const loadProjects = async () => {
        setLoading(true);
        try {
            const data = await fetchProjects(filters);
            setProjects(data);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusFilterChange = (e) => {
        setFilters({ ...filters, status: e.target.value });
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(projects.map(p => p.id));
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
            await bulkUpdateProjects(selectedIds, action, status);
            loadProjects();
            setSelectedIds([]);
        } catch (error) {
            alert('Error updating projects');
            console.error(error);
        }
    };

    const openCreateModal = () => {
        setCurrentProject(null);
        setIsModalOpen(true);
    };

    const openEditModal = (project) => {
        setCurrentProject(project);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setCurrentProject(null);
    };

    const handleFormSuccess = () => {
        closeModal();
        loadProjects();
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
                            onChange={handleStatusFilterChange}
                        >
                            <option value="">All Statuses</option>
                            <option value="planning">Planning</option>
                            <option value="in_progress">In Progress</option>
                            <option value="review">Review</option>
                            <option value="completed">Completed</option>
                        </select>
                        
                        {selectedIds.length > 0 && canManageProjects && (
                            <>
                                <span className="text-gray-400">|</span>
                                <button onClick={() => handleBulkAction('update_status', 'completed')} className="text-sm text-gray-600 hover:text-indigo-600">Mark Completed</button>
                                <button onClick={() => handleBulkAction('delete')} className="text-sm text-red-600 hover:text-red-800">Delete</button>
                            </>
                        )}
                    </div>
                     <div>
                        <button 
                            onClick={openCreateModal}
                            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 text-sm"
                        >
                            New Project
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <input type="checkbox" onChange={handleSelectAll} checked={projects.length > 0 && selectedIds.length === projects.length} />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">Loading...</td></tr>
                            ) : projects.length === 0 ? (
                                <tr><td colSpan="6" className="px-6 py-4 text-center">No projects found.</td></tr>
                            ) : (
                                projects.map((project) => (
                                    <tr key={project.id}>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedIds.includes(project.id)} 
                                                onChange={() => handleSelectOne(project.id)} 
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{project.name}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {project.client_name || `Client #${project.client_id}`}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.deadline}</td>
                                         <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => openEditModal(project)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
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
                title={currentProject ? 'Edit Project' : 'New Project'}
            >
                <ProjectForm 
                    project={currentProject} 
                    onSuccess={handleFormSuccess} 
                    onCancel={closeModal} 
                />
            </Modal>
        </>
    );
};

export default ProjectsList;
