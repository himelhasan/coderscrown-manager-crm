import apiFetch from '@wordpress/api-fetch';

export const fetchDashboardStats = () => {
    return apiFetch({ path: 'dashboard/stats' }); // Need to implement this endpoint or just fetch count from separate endpoints
};

// Projects
export const fetchProjects = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch({ path: 'projects?' + query });
};

export const createProject = (data) => {
    return apiFetch({ path: 'projects', method: 'POST', data });
};

export const updateProject = (id, data) => {
    return apiFetch({ path: `projects/${id}`, method: 'POST', data }); // Update is usually POST/PUT
};

export const deleteProject = (id) => {
    return apiFetch({ path: `projects/${id}`, method: 'DELETE' });
};

export const bulkUpdateProjects = (ids, action, status = '') => {
    return apiFetch({ path: 'projects/bulk', method: 'POST', data: { ids, action, status } });
};

// Tickets
export const fetchTickets = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch({ path: 'tickets?' + query });
};

export const createTicket = (data) => {
    return apiFetch({ path: 'tickets', method: 'POST', data });
};

export const updateTicket = (id, data) => {
    return apiFetch({ path: `tickets/${id}`, method: 'POST', data });
};

export const deleteTicket = (id) => {
    return apiFetch({ path: `tickets/${id}`, method: 'DELETE' });
};

export const bulkUpdateTickets = (ids, action, status = '') => {
    return apiFetch({ path: 'tickets/bulk', method: 'POST', data: { ids, action, status } });
};

// Leads
export const fetchLeads = (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiFetch({ path: 'leads?' + query });
};

export const createLead = (data) => {
    return apiFetch({ path: 'leads', method: 'POST', data });
};

export const updateLead = (id, data) => {
    return apiFetch({ path: `leads/${id}`, method: 'POST', data });
};

export const deleteLead = (id) => {
    return apiFetch({ path: `leads/${id}`, method: 'DELETE' });
};

export const bulkUpdateLeads = (ids, action, status = '') => {
    return apiFetch({ path: 'leads/bulk', method: 'POST', data: { ids, action, status } });
};
