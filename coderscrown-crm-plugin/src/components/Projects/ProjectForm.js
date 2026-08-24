import { useState } from '@wordpress/element';
import { createProject, updateProject } from '../../api';

const ProjectForm = ({ project, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'planning',
        client_id: project?.client_id || '',
        deadline: project?.deadline || ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (project?.id) {
                await updateProject(project.id, formData);
            } else {
                await createProject(formData);
            }
            onSuccess();
        } catch (error) {
            console.error('Error saving project:', error);
            alert('Failed to save project');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-700">Project Name</label>
                <input 
                    type="text" 
                    name="name" 
                    required
                    value={formData.name} 
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>
            
            <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select 
                    name="status" 
                    value={formData.status} 
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                >
                    <option value="planning">Planning</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="completed">Completed</option>
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700">Deadline</label>
                <input 
                    type="date" 
                    name="deadline" 
                    value={formData.deadline} 
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
            </div>

             <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea 
                    name="description" 
                    rows="3"
                    value={formData.description} 
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                ></textarea>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button 
                    type="button" 
                    onClick={onCancel}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Cancel
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    {loading ? 'Saving...' : 'Save'}
                </button>
            </div>
        </form>
    );
};

export default ProjectForm;
