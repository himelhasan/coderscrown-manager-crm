export const dynamic = 'force-dynamic';

import { Building2, Facebook, Globe, Linkedin, Mail, MapPin, Phone } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import OutreachSettings from '../../../components/leads/OutreachSettings';
import dbConnect from '../../../lib/db';
import Lead from '../../../lib/models/Lead';
import OutreachLog from '../../../lib/models/OutreachLog';

async function getLead(id: string) {
  await dbConnect();
  const lead = await Lead.findById(id);
  if(!lead) return null;
  
  // Fetch logs too
  const logs = await OutreachLog.find({ lead_id: id });
  
  return { 
      lead: JSON.parse(JSON.stringify(lead)),
      logs: JSON.parse(JSON.stringify(logs))
  };
}

export default async function LeadDetailPage({
   params
}: {
   params: Promise<{ id: string }>
}) {
  const { id } = await params;
  const data = await getLead(id);
  
  if (!data) notFound();
  
  const { lead, logs } = data;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
         <div className="space-y-1">
             <div className="flex items-center gap-3">
                 <Link href="/leads" className="text-sm text-muted-foreground hover:text-foreground">← Back to Leads</Link>
             </div>
             <h2 className="text-3xl font-bold tracking-tight">{lead.name}</h2>
             <p className="text-lg text-muted-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4" /> {lead.company_name}
                <span className="mx-2 text-border">|</span>
                <span className="text-sm bg-secondary px-2 py-0.5 rounded-full text-secondary-foreground">{lead.status.replace('_', ' ')}</span>
             </p>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN: Info */}
          <div className="space-y-6">
              {/* Contact Info */}
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">Contact Information</h3>
                  <div className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>
                      </div>
                      {lead.phone && (
                          <div className="flex items-center gap-3 text-sm">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span>{lead.phone}</span>
                          </div>
                      )}
                      {lead.website && (
                          <div className="flex items-center gap-3 text-sm">
                              <Globe className="h-4 w-4 text-muted-foreground" />
                              <a href={lead.website} target="_blank" className="hover:underline">{lead.website}</a>
                          </div>
                      )}
                      {lead.address && (
                          <div className="flex items-center gap-3 text-sm">
                              <MapPin className="h-4 w-4 text-muted-foreground" />
                              <span>{lead.address}</span>
                          </div>
                      )}
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-border flex gap-3">
                      {lead.linkedin_link && (
                          <a href={lead.linkedin_link} target="_blank" className="p-2 rounded-lg bg-[#0077b5]/10 text-[#0077b5] hover:bg-[#0077b5]/20">
                              <Linkedin className="h-5 w-5" />
                          </a>
                      )}
                      {lead.facebook_link && (
                          <a href={lead.facebook_link} target="_blank" className="p-2 rounded-lg bg-[#1877F2]/10 text-[#1877F2] hover:bg-[#1877F2]/20">
                              <Facebook className="h-5 w-5" />
                          </a>
                      )}
                  </div>
              </div>

               {/* Notes */}
               <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                  <h3 className="font-semibold mb-4">Notes</h3>
                  <div className="min-h-[100px] text-sm text-muted-foreground whitespace-pre-wrap">
                      {lead.notes || 'No notes added yet.'}
                  </div>
               </div>
          </div>

          {/* RIGHT COLUMN: Outreach */}
          <div className="lg:col-span-2 space-y-6">
              <OutreachSettings lead={lead} />

              <div className="rounded-xl border border-border bg-card shadow-sm h-full">
                  <div className="p-6 border-b border-border">
                      <h3 className="font-semibold">Outreach History</h3>
                  </div>
                  <div className="p-6">
                      <div className="relative border-l border-border ml-3 space-y-8">
                          {logs.length === 0 && (
                              <p className="pl-6 text-sm text-muted-foreground">No outreach activity recorded.</p>
                          )}
                          {logs.map((log: any) => (
                              <div key={log._id} className="relative pl-6">
                                  <span className={`absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full border border-background ${
                                      log.status === 'sent' ? 'bg-blue-500' :
                                      log.status === 'opened' ? 'bg-green-500' :
                                      'bg-gray-500'
                                  }`}></span>
                                  <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium">{log.email_subject}</p>
                                      <span className="text-xs text-muted-foreground">{new Date(log.sent_at).toISOString().replace('T', ' ').slice(0, 16)}</span>
                                  </div>
                                  <p className="mt-1 text-xs text-muted-foreground uppercase">{log.status} • {log.outreach_type.replace('_', ' ')}</p>
                                  {log.email_body_preview && (
                                     <p className="mt-2 text-sm text-muted-foreground bg-muted/30 p-2 rounded-lg italic">
                                        &quot;{log.email_body_preview}...&quot;
                                     </p>
                                  )}
                              </div>
                          ))}
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
}
