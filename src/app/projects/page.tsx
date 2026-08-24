'use client';

import { Check, Edit, ExternalLink, FolderPlus, Loader2, Plus, Terminal, Trash2 } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function ProjectsPage() {
  const { user, role } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);

  const initialFormState: any = { 
    name: '', 
    description: '', 
    link: '', 
    status: 'development', 
    image_link: '', 
    budget: '',
    tech_stack: [], 
    deadline: '',
    approved: false 
  };
  const [formData, setFormData] = useState<any>(initialFormState);

  const fetchProjects = useCallback(async () => {
    try {
        const res = await fetch('/api/v1/projects');
        const json = await res.json();
        setProjects(json.data || []);
    } catch {
        
    } finally {
        setLoading(false);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    fetchProjects();
  }, [fetchProjects]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(filteredProjects.map((p: any) => p._id));
    else setSelectedIds([]);
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter(i => i !== id));
    else setSelectedIds([...selectedIds, id]);
  };

  const handleBulkStatusChange = async (status: string) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    const t = toast.loading(`Updating ${selectedIds.length} projects...`);
    try {
      const res = await fetch('/api/v1/projects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'update', updateData: { status } })
      });
      if (res.ok) {
        toast.success(`Updated ${selectedIds.length} projects to ${status}`, { id: t });
        setSelectedIds([]);
        fetchProjects();
      } else {
        toast.error('Failed to update projects', { id: t });
      }
    } catch {
      toast.error('Error updating projects', { id: t });
    } finally { setBulkProcessing(false); }
  };

  const handleBulkApproval = async (approved: boolean) => {
    if (selectedIds.length === 0) return;
    setBulkProcessing(true);
    const t = toast.loading(`${approved ? 'Approving' : 'Unapproving'} ${selectedIds.length} projects...`);
    try {
      const res = await fetch('/api/v1/projects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'update', updateData: { approved } })
      });
      if (res.ok) {
        toast.success(`${approved ? 'Approved' : 'Unapproved'} ${selectedIds.length} projects`, { id: t });
        setSelectedIds([]);
        fetchProjects();
      } else {
        toast.error('Failed to update projects', { id: t });
      }
    } catch {
      toast.error('Error updating projects', { id: t });
    } finally { setBulkProcessing(false); }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`Delete ${selectedIds.length} projects? This cannot be undone.`)) return;
    setBulkProcessing(true);
    const t = toast.loading(`Deleting ${selectedIds.length} projects...`);
    try {
      const res = await fetch('/api/v1/projects/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds, action: 'delete' })
      });
      if (res.ok) {
        toast.success(`Deleted ${selectedIds.length} projects`, { id: t });
        setSelectedIds([]);
        fetchProjects();
      } else {
        toast.error('Failed to delete projects', { id: t });
      }
    } catch {
      toast.error('Error deleting projects', { id: t });
    } finally { setBulkProcessing(false); }
  };

  const handleCreate = async () => {
     const loadingToast = toast.loading('Creating project...');
     try {
    const payload = {
            ...formData,
            budget: formData.budget === '' ? undefined : formData.budget,
            deadline: formData.deadline === '' ? undefined : formData.deadline,
            image_link: formData.image_link === '' ? undefined : formData.image_link,
            link: formData.link === '' ? undefined : formData.link,
            tech_stack: Array.isArray(formData.tech_stack) && formData.tech_stack.length === 1 && formData.tech_stack[0] === '' ? [] : formData.tech_stack 
        };

        const res = await fetch('/api/v1/projects', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-UID': user?.uid || ''
            },
            body: JSON.stringify(payload)
        });
        if (res.ok) {
            setShowModal(false);
            setFormData(initialFormState);
            fetchProjects();
            toast.success('Project created successfully', { id: loadingToast });
        } else {
            toast.error('Failed to create project', { id: loadingToast });
        }
    } catch {
        
        toast.error('Error creating project', { id: loadingToast });
    }
  };

  const handleUpdate = async () => {
    const loadingToast = toast.loading('Updating project...');
    try {
       const res = await fetch('/api/v1/projects', {
           method: 'PUT',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ ...formData, _id: editingId })
       });
       if (res.ok) {
           setShowModal(false);
           setFormData(initialFormState);
           setEditingId(null);
           fetchProjects();
           toast.success('Project updated successfully', { id: loadingToast });
       } else {
           toast.error('Failed to update project', { id: loadingToast });
       }
   } catch {
       
       toast.error('Error updating project', { id: loadingToast });
   }
 };

  const handleDelete = async (id: string) => {
      if (!confirm('Are you sure you want to delete this project?')) return;
      const loadingToast = toast.loading('Deleting project...');
      try {
          const res = await fetch(`/api/v1/projects?id=${id}`, { method: 'DELETE' });
          if (res.ok) {
            fetchProjects();
            toast.success('Project deleted', { id: loadingToast });
          } else {
            toast.error('Failed to delete project', { id: loadingToast });
          }
      } catch { 
           
          toast.error('Error deleting project', { id: loadingToast });
      }
  };

  const openCreateModal = () => {
      setModalMode('create');
      setFormData(initialFormState);
      setShowModal(true);
  };

  const openEditModal = (project: any) => {
      setModalMode('edit');
      setEditingId(project._id);
      setFormData({
          name: project.name,
          description: project.description,
          link: project.link,
          status: project.status,
          image_link: project.image_link,
          budget: project.budget,
          tech_stack: project.tech_stack || [],
          deadline: project.deadline,
          approved: !!project.approved
      });
      setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (modalMode === 'create') handleCreate();
      else handleUpdate();
  };

  const filteredProjects = role === 'admin' 
    ? projects 
    : projects.filter(p => p.client_id === user?.uid || p.approved);

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Projects</h2>
                <p className="text-muted-foreground mt-1">Manage your ongoing development projects.</p>
            </div>
            {(role === 'client' || role === 'admin') && (
                <button 
                    onClick={openCreateModal}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                >
                    <Plus className="h-4 w-4" /> Add Project
                </button>
            )}
        </div>

        {/* Bulk Action Toolbar */}
        {selectedIds.length > 0 && role === 'admin' && (
          <div className="sticky top-4 z-20 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-primary/40 bg-card p-4 shadow-xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                {selectedIds.length}
              </span>
              <span>Project(s) Selected</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                onChange={(e) => { if (e.target.value) handleBulkStatusChange(e.target.value); }}
                disabled={bulkProcessing}
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-background px-3 text-xs font-medium outline-none focus:ring-2 focus:ring-primary cursor-pointer"
              >
                <option value="" disabled>-- Bulk Status --</option>
                <option value="development">Set Development</option>
                <option value="live">Set Live</option>
                <option value="archived">Set Archived</option>
              </select>

              <button
                onClick={() => handleBulkApproval(true)}
                disabled={bulkProcessing}
                className="flex items-center gap-1.5 h-9 rounded-lg bg-green-500/10 text-green-600 border border-green-500/20 px-3 text-xs font-semibold hover:bg-green-500/20 disabled:opacity-50"
              >
                <Check className="h-3.5 w-3.5" /> Approve All
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={bulkProcessing}
                className="flex items-center gap-1.5 h-9 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 px-3 text-xs font-semibold hover:bg-destructive/20 disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" /> Bulk Delete
              </button>

              <button onClick={() => setSelectedIds([])} className="h-9 rounded-lg border border-border px-3 text-xs font-medium hover:bg-muted">
                Clear
              </button>
            </div>
          </div>
        )}

        {loading ? (
             <div className="flex justify-center p-12">
                 <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
             </div>
        ) : filteredProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-muted/20 p-12 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <FolderPlus className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">No Projects Yet</h3>
                <p className="mt-2 text-sm text-muted-foreground">Start by adding a new project.</p>
            </div>
        ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProjects.map((project) => {
                  const isSelected = selectedIds.includes(project._id);
                  return (
                    <div key={project._id} className={`relative group rounded-xl border bg-card shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col ${isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'}`}>
                         {/* Selection Checkbox (Admin only) */}
                         {role === 'admin' && (
                           <div className="absolute top-3 left-3 z-10">
                             <input
                               type="checkbox"
                               checked={isSelected}
                               onChange={() => handleSelectOne(project._id)}
                               className="h-4 w-4 rounded border-gray-300 cursor-pointer shadow-sm"
                               onClick={(e) => e.stopPropagation()}
                             />
                           </div>
                         )}

                         {/* Image Cover */}
                         {project.image_link && (
                            <div className="h-32 w-full bg-muted overflow-hidden relative">
                                <img src={project.image_link} alt={project.name} className="h-full w-full object-cover" />
                                {!project.approved && (
                                    <div className="absolute top-2 right-2 bg-yellow-500/90 text-white text-xs font-bold px-2 py-1 rounded">
                                        Pending Approval
                                    </div>
                                )}
                                {project.approved && (
                                     <div className="absolute top-2 right-2 bg-green-500/90 text-white text-xs font-bold px-2 py-1 rounded">
                                        Approved
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="p-6 flex-1 flex flex-col">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    {!project.image_link && (
                                         <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                            <Terminal className="h-5 w-5" />
                                        </div>
                                    )}
                                    <div>
                                        <h3 className="font-semibold line-clamp-1" title={project.name}>{project.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] uppercase font-bold tracking-wider 
                                                ${project.status === 'live' ? 'bg-green-500/10 text-green-500' : 
                                                project.status === 'development' ? 'bg-blue-500/10 text-blue-500' : 
                                                'bg-gray-500/10 text-gray-500'}`}>
                                                {project.status}
                                            </span>
                                            {!project.image_link && !project.approved && (
                                                 <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">Pending</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {project.link && (
                                    <a href={project.link} target="_blank" className="text-muted-foreground hover:text-foreground">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2 mb-4 flex-1">
                                {project.description || 'No description provided.'}
                            </p>

                            <div className="w-full h-px bg-border my-4"></div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Budget:</span>
                                    <span className="font-medium">{project.budget ? `$${project.budget}` : 'N/A'}</span>
                                </div>
                                  <div className="flex justify-between">
                                    <span className="text-muted-foreground">Deadline:</span>
                                    <span className="font-medium">
                                        {project.deadline ? (mounted ? new Date(project.deadline).toLocaleDateString() : '...') : 'N/A'}
                                    </span>
                                </div>
                                {project.tech_stack && project.tech_stack.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-1">
                                        {project.tech_stack.map((stack: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{stack}</span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                         {/* Actions Footer */}
                         {(role === 'admin' || user?.uid === project.client_id) && (
                            <div className="bg-muted/50 p-3 flex justify-end gap-2 border-t border-border">
                                {role === 'admin' && !project.approved && (
                                    <button 
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if(!confirm('Approve this project?')) return;
                                            const loadingToast = toast.loading('Approving...');
                                            try {
                                                const res = await fetch('/api/v1/projects', {
                                                    method: 'PUT',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ _id: project._id, approved: true })
                                                });
                                                if(res.ok) {
                                                    fetchProjects();
                                                    toast.success('Project approved', { id: loadingToast });
                                                } else {
                                                    toast.error('Failed to approve', { id: loadingToast });
                                                }
                                            } catch(err) { 
                                                console.error(err); 
                                                toast.error('Error approving', { id: loadingToast });
                                            }
                                        }}
                                        className="flex items-center gap-1 px-2 py-1.5 rounded bg-green-500/10 text-green-600 text-xs font-medium hover:bg-green-500/20 transition-colors mr-auto"
                                    >
                                        <Check className="h-3.5 w-3.5" /> Approve
                                    </button>
                                )}
                                <button onClick={() => openEditModal(project)} className="p-1.5 hover:bg-background rounded text-muted-foreground hover:text-primary transition-colors">
                                    <Edit className="h-4 w-4" />
                                </button>
                                <button onClick={() => handleDelete(project._id)} className="p-1.5 hover:bg-background rounded text-muted-foreground hover:text-destructive transition-colors">
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                         )}
                    </div>
                  );
                })}
            </div>
        )}

        {/* Bulk Select All Bar */}
        {role === 'admin' && filteredProjects.length > 0 && (
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={selectedIds.length === filteredProjects.length && filteredProjects.length > 0}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 cursor-pointer"
            />
            <span>
              {selectedIds.length === 0 ? 'Select all projects for bulk actions' : `${selectedIds.length} of ${filteredProjects.length} selected`}
            </span>
          </div>
        )}

        {/* Modal */}
        {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
                <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6 shadow-lg max-h-[90vh] overflow-y-auto">
                    <h3 className="text-lg font-semibold mb-4">{modalMode === 'create' ? 'Add New Project' : 'Edit Project'}</h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input 
                            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Project Name"
                            required
                            value={formData.name}
                            onChange={e => setFormData({...formData, name: e.target.value})}
                        />
                         <textarea 
                            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary resize-none"
                            placeholder="Description"
                            rows={3}
                            value={formData.description}
                            onChange={e => setFormData({...formData, description: e.target.value})}
                        />
                        <div className="grid grid-cols-2 gap-4">
                             <select
                                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                value={formData.status}
                                onChange={e => setFormData({...formData, status: e.target.value})}
                             >
                                 <option value="development">Development</option>
                                 <option value="live">Live</option>
                                 <option value="archived">Archived</option>
                             </select>
                             <input 
                                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Project Link (URL)"
                                type="url"
                                value={formData.link || ''}
                                onChange={e => setFormData({...formData, link: e.target.value})}
                            />
                        </div>
                        <div>
                            <input 
                                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Image Link (URL)"
                                type="url"
                                value={formData.image_link || ''}
                                onChange={e => setFormData({...formData, image_link: e.target.value})}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <input 
                                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Budget (e.g. 500)"
                                type="number"
                                value={formData.budget === undefined || formData.budget === null ? '' : formData.budget}
                                onChange={e => {
                                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                                    setFormData({...formData, budget: val});
                                }}
                            />
                             <input 
                                className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Deadline (YYYY-MM-DD)"
                                type="date"
                                value={formData.deadline ? new Date(formData.deadline).toISOString().split('T')[0] : ''}
                                onChange={e => setFormData({...formData, deadline: e.target.value ? new Date(e.target.value) : undefined})}
                            />
                        </div>
                         <input 
                            className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                            placeholder="Tech Stack (comma separated)"
                            value={formData.tech_stack ? formData.tech_stack.join(', ') : ''}
                            onChange={e => {
                                const val = e.target.value;
                                setFormData({
                                    ...formData, 
                                    tech_stack: val ? val.split(',').map((s: string) => s.trim()) : []
                                });
                            }}
                        />
                        
                        {role === 'admin' && (
                            <div className="flex items-center gap-2 pt-2">
                                <input 
                                    type="checkbox"
                                    id="approved"
                                    checked={formData.approved}
                                    onChange={e => setFormData({...formData, approved: e.target.checked})}
                                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <label htmlFor="approved" className="text-sm font-medium">Approved</label>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 pt-4 border-t border-border">
                             <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 rounded-lg text-sm hover:bg-muted">Cancel</button>
                             <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                                 {modalMode === 'create' ? 'Create Project' : 'Save Changes'}
                             </button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}
