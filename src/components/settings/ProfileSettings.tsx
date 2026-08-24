'use client';

import { Loader2, Save, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function ProfileSettings() {
  const { user, role: _role_unused } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '', // Read only usually for Firebase unless re-auth
    photoURL: '',
    company_name: '',
    phone: '',
    website: ''
  });

  // Consolidate data loading
  useEffect(() => {
    // If we have profile in context, use it. 
    // Otherwise fallback to API fetch if context is missing it for some reason (e.g. race condition/refresh)
    if (user) {
        // Prefer context data if available (faster and already synced by AuthContext)
        // But we can also look at the API fetch to be sure we have latest DB fields if context is "stale" (unlikely)
        
        // Actually, let's fetch fresh data to be safe, but fallback to Context display name if API one is empty
        fetch('/api/v1/users/me', {
            headers: { 'X-User-UID': user.uid },
            cache: 'no-store'
        })
        .then(res => res.json())
        .then(data => {
            const userData = data.user || {};
            setFormData({
                displayName: userData.displayName || user.displayName || '',
                email: userData.email || user.email || '',
                photoURL: userData.photoURL || user.photoURL || '',
                company_name: userData.company_name || '',
                phone: userData.phone || '',
                website: userData.website || ''
            });
        })
        .catch(err => {
            console.error(err);
            // Fallback to user object if fetch fails
            setFormData(prev => ({
                ...prev,
                displayName: user.displayName || '',
                email: user.email || '',
                photoURL: user.photoURL || ''
            }));
        });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
        const res = await fetch('/api/v1/users/me', {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'X-User-UID': user?.uid || ''
            },
            body: JSON.stringify(formData)
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || 'Failed to update profile');

        setMessage({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
        setMessage({ type: 'error', text: err.message });
    } finally {
        setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm p-6">
       <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            My Profile
       </h3>
       
       <form onSubmit={handleSubmit} className="space-y-4">
            {message && (
                <div className={`p-3 rounded-md text-sm ${message.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                    {message.text}
                </div>
            )}
            
            <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <input 
                        name="displayName"
                        value={formData.displayName}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" 
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email (Read Only)</label>
                    <input 
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full rounded-md border border-input bg-muted px-3 py-2 text-sm outline-none cursor-not-allowed opacity-70" 
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Company Name</label>
                    <input 
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" 
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input 
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" 
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <input 
                        name="website"
                        value={formData.website}
                        onChange={handleChange}
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" 
                    />
                </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Profile Photo URL</label>
                    <input 
                        name="photoURL"
                        value={formData.photoURL}
                        onChange={handleChange}
                        placeholder="https://..."
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary" 
                    />
                </div>
            </div>

            <div className="pt-2 flex justify-end">
                <button 
                    type="submit" 
                    disabled={loading}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Save Changes
                </button>
            </div>
       </form>
    </div>
  );
}
