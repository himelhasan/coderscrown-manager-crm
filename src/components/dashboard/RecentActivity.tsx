import { ArrowRight, Mail } from 'lucide-react';

const mockActivity = [
  { id: 1, type: 'sent', lead: 'John Doe', subject: 'Website Redesign', time: '2 hours ago' },
  { id: 2, type: 'opened', lead: 'Jane Smith', subject: 'Follow up #1', time: '4 hours ago' },
  { id: 3, type: 'responded', lead: 'Mike Johnson', subject: 'Partnership', time: '1 day ago' },
  { id: 4, type: 'bounced', lead: 'Sarah Connor', subject: 'Intro', time: '1 day ago' },
];

export default function RecentActivity() {
  return (
    <div className="rounded-xl border border-border bg-card shadow-sm h-full">
      <div className="border-b border-border p-6 flex flex-row items-center justify-between">
        <h3 className="font-semibold">Recent Outreach</h3>
        <button className="text-xs text-primary hover:underline">View All</button>
      </div>
      <div className="p-6 pt-0">
        <div className="space-y-6 mt-6">
            {mockActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4">
                    <div className={`mt-1 rounded-full p-2 border ${
                        activity.type === 'sent' ? 'bg-blue-500/10 border-blue-500/20 text-blue-500' :
                        activity.type === 'responded' ? 'bg-green-500/10 border-green-500/20 text-green-500' :
                        activity.type === 'bounced' ? 'bg-red-500/10 border-red-500/20 text-red-500' :
                        'bg-yellow-500/10 border-yellow-500/20 text-yellow-500'
                    }`}>
                        {activity.type === 'email' ? <Mail className="h-3 w-3" /> : <ArrowRight className="h-3 w-3" />}
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">
                            {activity.type === 'sent' && 'Email Sent to '}
                            {activity.type === 'opened' && 'Email Opened by '}
                            {activity.type === 'responded' && 'Response from '}
                            {activity.type === 'bounced' && 'Bounced Email for '}
                            <span className="text-foreground">{activity.lead}</span>
                        </p>
                        <p className="text-xs text-muted-foreground">{activity.subject}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{activity.time}</p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}
