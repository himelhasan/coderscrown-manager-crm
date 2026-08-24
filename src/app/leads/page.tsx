export const dynamic = 'force-dynamic';

import LeadFilters from '../../components/leads/LeadFilters';
import LeadsClient from '../../components/leads/LeadsClient';

export default async function LeadsPage() {
  return (
    <div className="space-y-6">
       <LeadFilters />
       <LeadsClient />
    </div>
  );
}
