'use client';

import { Check, Copy, Key, Plus, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ApiKeyManager() {
  const [keys, setKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKey, setNewKey] = useState<string | null>(null);
  const [keyName, setKeyName] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    try {
        const res = await fetch('/api/v1/api-keys');
        const json = await res.json();
        setKeys(json.data || []);
    } catch (e) {
        console.error(e);
    } finally {
        setLoading(false);
    }
  };

  const createKey = async () => {
    if (!keyName) return;
    try {
        const res = await fetch('/api/v1/api-keys', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: keyName, user_id: 'admin' }) // Mock user_id
        });
        const json = await res.json();
        if (res.ok) {
            setNewKey(json.secret_key); // ONLY displayed once
            setKeyName('');
            fetchKeys();
        }
    } catch (e) {
        console.error(e);
    }
  };

  const deleteKey = async (id: string) => {
      if (!confirm('Are you sure you want to revoke this key? Integration will stop working immediately.')) return;
      await fetch(`/api/v1/api-keys/${id}`, { method: 'DELETE' });
      fetchKeys();
  };

  const copyToClipboard = () => {
      if (newKey) {
          navigator.clipboard.writeText(newKey);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
      }
  };

  return (
    <div className="space-y-6">
        <div className="rounded-xl border border-border bg-card shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">API Keys</h3>
            <p className="text-sm text-muted-foreground mb-6">
                Manage API keys to authenticate your N8N workflows. 
                Use these keys in the <code>Authorization</code> header as <code>Bearer sk_...</code>
            </p>

            {/* Create New */}
            <div className="flex gap-4 mb-8 p-4 bg-muted/20 rounded-lg border border-dashed border-border">
                <input 
                    type="text" 
                    placeholder="Key Name (e.g. N8N Production)" 
                    className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={keyName}
                    onChange={(e) => setKeyName(e.target.value)}
                />
                <button 
                    onClick={createKey}
                    disabled={!keyName}
                    className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    <Plus className="h-4 w-4" /> Generate Key
                </button>
            </div>

            {/* New Key Display */}
            {newKey && (
                <div className="mb-8 p-4 border border-green-500/20 bg-green-500/10 rounded-lg">
                    <h4 className="font-semibold text-green-500 mb-2 flex items-center gap-2">
                        <Check className="h-4 w-4" /> Key Generated Successfully
                    </h4>
                    <p className="text-sm text-foreground mb-3">
                        Copy this key now. You won't be able to see it again!
                    </p>
                    <div className="flex items-center gap-2 bg-background p-2 rounded border border-border">
                        <code className="text-xs font-mono flex-1 break-all">{newKey}</code>
                        <button onClick={copyToClipboard} className="text-muted-foreground hover:text-foreground">
                            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </button>
                    </div>
                </div>
            )}

            {/* List */}
            <div className="space-y-4">
                {loading ? (
                    <p className="text-sm text-muted-foreground">Loading keys...</p>
                ) : keys.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">No API keys generated yet.</p>
                ) : (
                    keys.map((key) => (
                        <div key={key._id} className="flex items-center justify-between p-4 border border-border rounded-lg bg-card hover:bg-muted/10 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Key className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="font-medium">{key.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        Created: {new Date(key.createdAt).toLocaleDateString()} • 
                                        Last used: {key.last_used_at ? new Date(key.last_used_at).toLocaleDateString() : 'Never'}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className={`text-xs px-2 py-1 rounded-full ${key.is_active ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {key.is_active ? 'Active' : 'Revoked'}
                                </span>
                                <button 
                                    onClick={() => deleteKey(key._id)}
                                    className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
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
    </div>
  );
}
