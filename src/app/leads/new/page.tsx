'use client';

import { ArrowLeft, Building2, Briefcase, Facebook, Globe, Instagram, Linkedin, Mail, Phone, Save, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NewLeadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company_name: '',
    industry: '',
    phone: '',
    website: '',
    linkedin_link: '',
    facebook_link: '',
    fb_personal_link: '',
    fb_page_link: '',
    instagram_link: '',
    notes: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const ensureProtocol = (url: string) => {
      if (!url) return '';
      if (url.startsWith('http://') || url.startsWith('https://')) return url;
      return `https://${url}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const processedData = {
        ...formData,
        website: ensureProtocol(formData.website),
        linkedin_link: ensureProtocol(formData.linkedin_link),
        facebook_link: ensureProtocol(formData.facebook_link),
        fb_personal_link: ensureProtocol(formData.fb_personal_link),
        fb_page_link: ensureProtocol(formData.fb_page_link),
        instagram_link: ensureProtocol(formData.instagram_link)
    };

    try {
      const res = await fetch('/api/v1/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(processedData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create lead');
      }

      router.push('/leads');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/leads" className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background hover:bg-muted text-muted-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Add New Lead</h2>
          <p className="text-muted-foreground">Manually enter lead details to start outreach.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium">
                {error}
            </div>
        )}

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-lg border-b border-border pb-4">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" /> Full Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        name="name"
                        type="text" 
                        required
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g. John Doe"
                        value={formData.name}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" /> Company Name <span className="text-red-500">*</span>
                    </label>
                    <input 
                        name="company_name"
                        type="text"
                        required 
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g. Acme Corp"
                        value={formData.company_name}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-muted-foreground" /> Industry
                    </label>
                    <input 
                        name="industry"
                        type="text"
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="e.g. Software, E-commerce, Real Estate"
                        value={formData.industry}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4 text-muted-foreground" /> Email Address <span className="text-red-500">*</span>
                    </label>
                    <input 
                        name="email"
                        type="email" 
                        required
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4 text-muted-foreground" /> Phone Number
                    </label>
                    <input 
                        name="phone"
                        type="tel" 
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="+1 (555) 000-0000"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                </div>
            </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-6">
            <h3 className="font-semibold text-lg border-b border-border pb-4">Digital Presence & Notes</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Globe className="h-4 w-4 text-muted-foreground" /> Website URL
                    </label>
                    <input 
                        name="website"
                        type="text" 
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="example.com"
                        value={formData.website}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Linkedin className="h-4 w-4 text-muted-foreground" /> LinkedIn Profile
                    </label>
                    <input 
                        name="linkedin_link"
                        type="text" 
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="linkedin.com/in/..."
                        value={formData.linkedin_link}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-muted-foreground" /> FB Personal Profile
                    </label>
                    <input 
                        name="fb_personal_link"
                        type="text" 
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="facebook.com/username"
                        value={formData.fb_personal_link}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Facebook className="h-4 w-4 text-muted-foreground" /> FB Page Link
                    </label>
                    <input 
                        name="fb_page_link"
                        type="text" 
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="facebook.com/pages/..."
                        value={formData.fb_page_link}
                        onChange={handleChange}
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium flex items-center gap-2">
                        <Instagram className="h-4 w-4 text-muted-foreground" /> Instagram Link
                    </label>
                    <input 
                        name="instagram_link"
                        type="text" 
                        className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none"
                        placeholder="instagram.com/..."
                        value={formData.instagram_link}
                        onChange={handleChange}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <textarea 
                    name="notes"
                    rows={4}
                    className="w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none resize-none"
                    placeholder="Add any initial context about this lead..."
                    value={formData.notes}
                    onChange={handleChange}
                />
            </div>
        </div>

        <div className="flex justify-end gap-3">
            <Link 
                href="/leads"
                className="px-4 py-2 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted transition-colors"
            >
                Cancel
            </Link>
            <button 
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
                <Save className="h-4 w-4" />
                {loading ? 'Creating...' : 'Create Lead'}
            </button>
        </div>
      </form>
    </div>
  );
}
