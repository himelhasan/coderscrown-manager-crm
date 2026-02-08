
import CampaignsClient from '@/components/campaigns/CampaignsClient';
export const dynamic = 'force-dynamic';

import dbConnect from '@/lib/db';
import Campaign from '@/lib/models/Campaign';

export default async function CampaignsPage() {
  await dbConnect();
  const campaigns = await Campaign.find().sort({ createdAt: -1 });

  return (
    <CampaignsClient campaigns={JSON.parse(JSON.stringify(campaigns))} />
  );
}
