
const Layout = ({ children, user }) => {
    return (
        <div className="flex min-h-screen bg-gray-100 font-sans">
            {/* Sidebar */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:block">
                <div className="p-6">
                    <h1 className="text-2xl font-bold text-indigo-600">CodersCrown</h1>
                </div>
                <nav className="mt-6 px-4 space-y-2">
                    {/* Navigation items will go here */}
                    <a href="#/" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">Dashboard</a>
                    <a href="#/projects" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">Projects</a>
                    <a href="#/tickets" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">Tickets</a>
                    {/* Conditional rendering for Leads based on role */}
                    {user?.caps?.manage_crm_leads && (
                        <a href="#/leads" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 hover:text-indigo-600 rounded-md">Leads</a>
                    )}
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1">
                <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-800">Dashboard</h2>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-gray-500">Welcome, {user?.displayName || 'User'}</span>
                    </div>
                </header>
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default Layout;
