export const dynamic = 'force-dynamic';

import LeadFilters from '@/components/leads/LeadFilters';
import LeadsClient from '@/components/leads/LeadsClient';
import dbConnect from '@/lib/db';
import Lead from '@/lib/models/Lead';

async function getLeads(searchParams: { [key: string]: string | string[] | undefined }) {
  await dbConnect();
  
  const query: any = {};
  if (searchParams.status) query.status = searchParams.status;
  if (searchParams.search) {
     query.$or = [
        { name: { $regex: searchParams.search, $options: 'i' } },
        { email: { $regex: searchParams.search, $options: 'i' } },
        { company_name: { $regex: searchParams.search, $options: 'i' } },
      ];
  }

  const leads = await Lead.find(query).sort({ createdAt: -1 }).limit(500);
  return JSON.parse(JSON.stringify(leads));
}

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  const leads = await getLeads(resolvedSearchParams);

  return (
    <div className="space-y-6">
       <LeadFilters />
       <LeadsClient initialLeads={leads} />
    </div>
  );
}
