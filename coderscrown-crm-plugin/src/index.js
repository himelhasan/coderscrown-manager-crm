import apiFetch from '@wordpress/api-fetch';
import { createRoot, useEffect, useState } from '@wordpress/element';
import Dashboard from './components/Dashboard';
import Layout from './components/Layout';
import Leads from './components/Leads';
import Projects from './components/Projects';
import Tickets from './components/Tickets';
import './index.css';

const settings = window.codersCrownSettings || {};
const user = settings.currentUser || {};

// Configure API Fetch
apiFetch.use(apiFetch.createRootURLMiddleware(settings.root));
apiFetch.use(apiFetch.createNonceMiddleware(settings.nonce));

const App = () => {
  const [route, setRoute] = useState(window.location.hash || '#/');
  // Remove redundant settings/user consts here since we declared them above for middleware


  useEffect(() => {
    const handleHashChange = () => setRoute(window.location.hash || '#/');
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const renderContent = () => {
    switch (route) {
        case '#/projects':
            return <Projects />;
        case '#/tickets':
            return <Tickets />;
        case '#/leads':
            return user.caps?.manage_crm_leads ? <Leads /> : <div className="text-red-500">Access Denied</div>;
        case '#/':
        default:
            return <Dashboard />;
    }
  };

  return (
    <Layout user={user}>
        {renderContent()}
    </Layout>
  );
};

// Mount app on DOM load
document.addEventListener('DOMContentLoaded', () => {
  const rootElement = document.getElementById('coderscrown-crm-root');
  if (rootElement) {
    const root = createRoot(rootElement);
    root.render(<App />);
  }
});
