
import ApiKeyManager, { N8nIntegrationGuide } from '../../components/settings/ApiKeyManager';
import ProfileSettings from '../../components/settings/ProfileSettings';

export default function SettingsPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div>
          <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
          <p className="text-muted-foreground mt-1">Configure your CRM, manage API keys, and set up integrations.</p>
       </div>

       <div className="grid gap-8">
           <ProfileSettings />
           <ApiKeyManager />
           <N8nIntegrationGuide />
       </div>
    </div>
  );
}
