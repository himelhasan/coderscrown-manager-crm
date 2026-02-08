import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
}

export default function StatsCard({ title, value, change, icon: Icon, trend }: StatsCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold">{value}</h3>
        {change && (
          <p className={cn(
            "mt-1 text-xs",
            trend === 'up' ? "text-green-500" : trend === 'down' ? "text-red-500" : "text-muted-foreground"
          )}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
