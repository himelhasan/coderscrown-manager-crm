'use client';

import { AlertTriangle, Check, Copy, Eye, EyeOff, Key, Plus, RefreshCw, Trash2, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

interface ApiKey {
  _id: string;
  name: string;
  is_active: boolean;
  createdAt: string;
  last_used_at?: string;
}

export default function ApiKeyManager() {
  const { user } = useAuth();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [generating, setGenerating] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
        const res = await fetch('/api/v1/api-keys');
        const json = await res.json();
        setKeys(json.data || []);
    } catch {
        
    } finally {
        setLoading(false);
    }
  };

  const createKey = async () => {
    if (!keyName.trim()) {
      toast.error('Please enter a key name');
      return;
    }
    setGenerating(true);
    const t = toast.loading('Generating API key...');
    try {
        const res = await fetch('/api/v1/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: keyName.trim(), user_id: user?.uid || 'admin' })
        });
        const json = await res.json();
        if (res.ok) {
            setNewKey(json.secret_key);
            setKeyName('');
            fetchKeys();
            toast.success('API key generated — copy it now!', { id: t });
        } else {
            toast.error('Failed to generate key', { id: t });
        }
    } catch {
        
        toast.error('Error generating key', { id: t });
    } finally {
      setGenerating(false);
    }
  };

  const deleteKey = async (id: string, name: string) => {
      if (!confirm(`Revoke API key "${name}"? This will break any integrations using this key.`)) return;
      const t = toast.loading('Revoking key...');
      try {
        await fetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
        toast.success('Key revoked', { id: t });
        fetchKeys();
      } catch {
        toast.error('Error revoking key', { id: t });
      }
  };

  const copyToClipboard = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          <Key className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">API Key Management</h3>
          <p className="text-xs text-muted-foreground">Generate secure API keys for N8N and external integrations</p>
        </div>
      </div>

      {/* Generate New Key */}
      <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 space-y-3">
        <h4 className="text-sm font-semibold">Generate New API Key</h4>
        <div className="flex gap-3">
          <input 
              type="text" 
              placeholder="Key label (e.g. N8N Production, N8N Staging)" 
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
              value={keyName}
              onChange={(e) => setKeyName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') createKey(); }}
          />
          <button 
              onClick={createKey}
              disabled={!keyName.trim() || generating}
              className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors whitespace-nowrap"
          >
              {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              Generate Key
          </button>
        </div>
      </div>

      {/* New Key Alert — only displayed once */}
      {newKey && (
        <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            <h4 className="font-semibold text-green-500">API Key Generated Successfully</h4>
          </div>
          <div className="flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/30 p-2.5 rounded-lg text-xs text-yellow-600 font-medium">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            This is the ONLY time this key will be shown. Copy it and store it securely.
          </div>
          <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2.5">
            <code className="text-xs font-mono flex-1 break-all text-foreground">
              {showKey ? newKey : '••••••••••••••••••••••••••••••••••••••••••••••••••'}
            </code>
            <button onClick={() => setShowKey(!showKey)} className="text-muted-foreground hover:text-foreground ml-1 shrink-0">
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
            <button onClick={() => copyToClipboard(newKey)} className="text-muted-foreground hover:text-foreground ml-1 shrink-0">
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>
          <button onClick={() => setNewKey(null)} className="text-xs text-muted-foreground hover:text-foreground underline">
            I&apos;ve saved the key, dismiss this message
          </button>
        </div>
      )}

      {/* Keys List */}
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Active Keys ({keys.filter(k => k.is_active).length})</h4>
        {loading ? (
            <p className="text-sm text-muted-foreground py-4 text-center">Loading API keys...</p>
        ) : keys.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Key className="h-8 w-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No API keys yet. Generate one above to get started.</p>
            </div>
        ) : (
            keys.map((key) => (
                <div key={key._id} className="flex items-center justify-between p-4 border border-border rounded-xl bg-card hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                            <Key className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-medium text-sm">{key.name}</p>
                            <p className="text-xs text-muted-foreground">
                                Created: {mounted ? new Date(key.createdAt).toLocaleDateString() : '...'} • 
                                Last used: {key.last_used_at ? (mounted ? new Date(key.last_used_at).toLocaleDateString() : '...') : 'Never'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${key.is_active ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}>
                            {key.is_active ? 'Active' : 'Revoked'}
                        </span>
                        <button 
                            onClick={() => deleteKey(key._id, key.name)}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            title="Revoke Key"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}

export function N8nIntegrationGuide() {
  const [copiedStep, setCopiedStep] = useState<string | null>(null);
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://your-domain.vercel.app';

  const copyCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedStep(key);
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const CodeBlock = ({ code, id }: { code: string; id: string }) => (
    <div className="flex items-start gap-2 bg-background border border-border rounded-lg p-3 mt-2 font-mono text-xs">
      <code className="flex-1 text-foreground break-all">{code}</code>
      <button onClick={() => copyCode(code, id)} className="text-muted-foreground hover:text-foreground shrink-0 mt-0.5">
        {copiedStep === id ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6 space-y-8">
      <div className="flex items-center gap-3 border-b border-border pb-4">
        <div className="h-10 w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center text-yellow-500">
          <Zap className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">N8N Integration Guide</h3>
          <p className="text-xs text-muted-foreground">Complete guide to connecting your N8N workflows to this CRM</p>
        </div>
      </div>

      {/* Step 1: Auth Setup */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">1</span>
          <h4 className="font-semibold">Authentication Setup</h4>
        </div>
        <p className="text-sm text-muted-foreground pl-8">Generate an API Key above, then in N8N add an <strong>HTTP Request</strong> node with Header Auth:</p>
        <div className="pl-8 space-y-2">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Header Name</p>
              <CodeBlock code="Authorization" id="header-name" />
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Header Value</p>
              <CodeBlock code="Bearer sk_YOUR_KEY_HERE" id="header-value" />
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground mb-1">Base URL</p>
            <CodeBlock code={`${baseUrl}/api/v1`} id="base-url" />
          </div>
        </div>
      </div>

      {/* Step 2: Key Endpoints */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">2</span>
          <h4 className="font-semibold">Key API Endpoints</h4>
        </div>
        <div className="pl-8 space-y-4 text-sm">
          
          <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
              <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">POST</span>
              <code className="text-xs font-mono">/api/v1/leads/{'{id}'}/outreach-history</code>
              <span className="text-xs text-muted-foreground ml-auto">Log email sent by N8N</span>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Call this after sending each email in N8N to log the outreach activity:</p>
              <pre className="text-xs bg-background border border-border rounded-lg p-3 overflow-x-auto text-foreground">{`{
  "outreach_type": "email",
  "status": "sent",
  "email_subject": "Your Subject Line Here",
  "email_body_preview": "First 100 chars of body...",
  "sent_at": "{{$now}}"
}`}</pre>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
              <span className="text-xs font-bold text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">PUT</span>
              <code className="text-xs font-mono">/api/v1/leads/{'{id}'}/outreach-status</code>
              <span className="text-xs text-muted-foreground ml-auto">Update lead response status</span>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground">When a lead replies or clicks, update their interest status:</p>
              <pre className="text-xs bg-background border border-border rounded-lg p-3 overflow-x-auto text-foreground">{`{
  "response_status": "interested",  // interested | not_interested | needs_info
  "campaign_name": "Cold Outreach Q3",
  "next_followup_date": "2026-09-01"
}`}</pre>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
              <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">GET</span>
              <code className="text-xs font-mono">/api/v1/leads?status=new&campaign=Campaign+Name</code>
              <span className="text-xs text-muted-foreground ml-auto">Fetch leads for campaign</span>
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">Query params: <code>status</code>, <code>campaign</code>, <code>industry</code>, <code>search</code>, <code>limit</code>, <code>offset</code>, <code>sortBy</code>, <code>sortOrder</code></p>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-muted/10 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 bg-muted/40 border-b border-border">
              <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/20">POST</span>
              <code className="text-xs font-mono">/api/v1/leads/bulk</code>
              <span className="text-xs text-muted-foreground ml-auto">Bulk update leads</span>
            </div>
            <div className="p-4 space-y-2">
              <p className="text-xs text-muted-foreground">Bulk assign a campaign to multiple leads at once:</p>
              <pre className="text-xs bg-background border border-border rounded-lg p-3 overflow-x-auto text-foreground">{`{
  "ids": ["lead_id_1", "lead_id_2"],
  "action": "update",
  "updateData": {
    "cold_outreach.campaign_name": "Campaign Name",
    "cold_outreach.campaign_status": "active"
  }
}`}</pre>
            </div>
          </div>

        </div>
      </div>

      {/* Step 3: Workflow Tips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">3</span>
          <h4 className="font-semibold">Recommended N8N Workflow Pattern</h4>
        </div>
        <div className="pl-8 space-y-3">
          <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground font-mono text-xs mt-0.5">①</span>
              <div>
                <p className="font-medium">Fetch Leads</p>
                <p className="text-xs text-muted-foreground">HTTP GET <code>/api/v1/leads?status=new&campaign=YourCampaign&limit=50</code> to get active outreach targets</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground font-mono text-xs mt-0.5">②</span>
              <div>
                <p className="font-medium">Loop through leads & send emails via SMTP/Gmail</p>
                <p className="text-xs text-muted-foreground">Use the lead&apos;s <code>email</code>, <code>name</code>, <code>company_name</code>, <code>industry</code> to personalize the email</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground font-mono text-xs mt-0.5">③</span>
              <div>
                <p className="font-medium">Log each email sent</p>
                <p className="text-xs text-muted-foreground">HTTP POST <code>/api/v1/leads/{'{id}'}/outreach-history</code> with subject + body preview</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground font-mono text-xs mt-0.5">④</span>
              <div>
                <p className="font-medium">Schedule Follow-ups</p>
                <p className="text-xs text-muted-foreground">HTTP PUT <code>/api/v1/leads/{'{id}'}/outreach-status</code> to set <code>next_followup_date</code> for follow-up automation</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-muted-foreground font-mono text-xs mt-0.5">⑤</span>
              <div>
                <p className="font-medium">Track Replies (via email webhook or polling)</p>
                <p className="text-xs text-muted-foreground">When a reply is detected, update lead: <code>response_status: &quot;interested&quot;</code> or <code>&quot;not_interested&quot;</code></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Reference */}
      <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-2">
        <h4 className="text-sm font-semibold">Quick Reference</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          {[
            ['GET leads', '/api/v1/leads'],
            ['POST create lead', '/api/v1/leads'],
            ['GET campaigns', '/api/v1/campaigns'],
            ['GET lead detail', '/api/v1/leads/{id}'],
            ['POST log outreach', '/api/v1/leads/{id}/outreach-history'],
            ['PUT update outreach', '/api/v1/leads/{id}/outreach-status'],
            ['POST bulk update leads', '/api/v1/leads/bulk'],
            ['POST bulk update campaigns', '/api/v1/campaigns/bulk'],
            ['GET dashboard stats', '/api/v1/dashboard'],
            ['GET health check', '/api/v1/health'],
          ].map(([label, path]) => (
            <div key={path} className="flex items-center justify-between bg-background border border-border rounded px-3 py-1.5 gap-2">
              <span className="text-muted-foreground">{label}</span>
              <code className="font-mono text-primary">{path}</code>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
