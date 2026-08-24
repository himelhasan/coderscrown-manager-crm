'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export default function OnboardingPage() {
  const { user, userProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [formData, setFormData] = useState({
      displayName: user?.displayName || '',
      company_name: '',
      phone: '',
      website: '',
      address: '',
      facebook_link: '',
      linkedin_link: '',
      instagram_link: '',
      twitter_link: ''
  });

  useEffect(() => {
      if (userProfile && userProfile.company_name) {
          // If already onboarded, redirect to home
          router.push('/');
      }
  }, [userProfile, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Helper to ensure URL protocol
  const ensureProtocol = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `https://${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!user) return;
      setLoading(true);

      const processedData = {
          ...formData,
          website: ensureProtocol(formData.website),
          linkedin_link: ensureProtocol(formData.linkedin_link),
          facebook_link: ensureProtocol(formData.facebook_link),
          instagram_link: ensureProtocol(formData.instagram_link),
          twitter_link: ensureProtocol(formData.twitter_link)
      };

      try {
          const res = await fetch('/api/v1/users/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  firebaseUid: user.uid,
                  email: user.email,
                  // displayName included in processedData
                  photoURL: user.photoURL,
                  ...processedData
              })
          });

          if (res.ok) {
               // Update context or just reload/redirect
               window.location.href = '/'; 
          } else {
              const data = await res.json();
              console.error('Failed to sync user:', data.error || res.statusText);
              alert('Failed to save profile: ' + (data.error || 'Unknown error'));
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <div className="w-full max-w-2xl space-y-8 rounded-xl border border-border bg-card p-8 shadow-lg">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Welcome! Let&apos;s get you set up.</h2>
                <p className="mt-2 text-muted-foreground">Please complete your profile to continue.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Full Name *</label>
                        <input name="displayName" required value={formData.displayName} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="John Doe" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Company Name *</label>
                        <input name="company_name" required value={formData.company_name} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Acme Corp" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Phone Number *</label>
                        <input name="phone" required type="tel" value={formData.phone} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="+1 234 567 8900" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Website</label>
                        <input name="website" type="text" value={formData.website} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="example.com" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Address</label>
                        <input name="address" value={formData.address} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="123 Main St" />
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-border">
                    <h3 className="text-lg font-semibold">Social Links</h3>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">LinkedIn</label>
                            <input name="linkedin_link" value={formData.linkedin_link} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="LinkedIn Profile URL" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Facebook</label>
                            <input name="facebook_link" value={formData.facebook_link} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Facebook Profile URL" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Instagram</label>
                            <input name="instagram_link" value={formData.instagram_link} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Instagram Profile URL" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Twitter</label>
                            <input name="twitter_link" value={formData.twitter_link} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none" placeholder="Twitter Profile URL" />
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end pt-6">
                    <button type="submit" disabled={loading} className="rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Complete Profile'}
                    </button>
                </div>
            </form>
        </div>
    </div>
  );
}
