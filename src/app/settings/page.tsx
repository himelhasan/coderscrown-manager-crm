
import ApiKeyManager from '@/components/settings/ApiKeyManager';
import ProfileSettings from '@/components/settings/ProfileSettings';
import { Zap } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">Configure your CRM and integrations.</p>
       </div>

       <div className="grid gap-8">
           <ProfileSettings />
           <ApiKeyManager />

           {/* Webhook Info */}
           <div className="rounded-xl border border-border bg-card shadow-sm p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-500" />
                  N8N Integration Guide
              </h3>
              <div className="prose prose-sm prose-invert text-muted-foreground">
                  <p>
                      To connect N8N to this CRM:
                  </p>
                  <ol>
                      <li>Generate an API Key above.</li>
                      <li>In N8N, use the <strong>HTTP Request</strong> node.</li>
                      <li>Set Authentication to <strong>Header Auth</strong>.</li>
                      <li>Header Name: <code>Authorization</code></li>
                      <li>Header Value: <code>Bearer sk_YOUR_KEY</code></li>
                      <li>Base URL: <code>https://your-domain.vercel.app/api/v1</code></li>
                  </ol>
                  <p className="mt-4 text-xs bg-muted p-2 rounded">
                      <strong>Tip:</strong> Use the <code>POST /leads/[id]/outreach-history</code> endpoint to log emails sent by N8N.
                  </p>
              </div>
           </div>
       </div>
    </div>
  );
}
