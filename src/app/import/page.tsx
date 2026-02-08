'use client';

import { ArrowRight, CheckCircle, Loader2, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Papa from 'papaparse';
import { useState } from 'react';

const REQUIRED_FIELDS = ['email', 'name'];
const SYSTEM_FIELDS = [
  { label: 'Name', key: 'name', required: true },
  { label: 'Email', key: 'email', required: true },
  { label: 'Company Name', key: 'company_name' },
  { label: 'Website', key: 'website' },
  { label: 'Phone', key: 'phone' },
  { label: 'Address', key: 'address' },
  { label: 'LinkedIn Profile', key: 'linkedin_link' },
  { label: 'LinkedIn Company', key: 'linkedin_company' },
  { label: 'Facebook', key: 'facebook_link' },
  { label: 'Industry', key: 'industry' },
];

export default function ImportPage() {
  const [step, setStep] = useState(1); // 1: Upload, 2: Map, 3: Importing, 4: Done
  const [file, setFile] = useState<File | null>(null);
  const [headers, setHeaders] = useState<string[]>([]);
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [mapping, setMapping] = useState<{ [key: string]: string }>({});
  const [stats, setStats] = useState({ total: 0, success: 0, failed: 0 });
  const router = useRouter();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFile(file);
    Papa.parse(file, {
        header: true,
        preview: 5,
        skipEmptyLines: true,
        complete: (results) => {
            setHeaders(results.meta.fields || []);
            setPreviewData(results.data);
            
            // Auto-map logic
            const newMapping: any = {};
            SYSTEM_FIELDS.forEach(field => {
                const match = results.meta.fields?.find(h => 
                    h.toLowerCase().includes(field.key.toLowerCase()) || 
                    h.toLowerCase().includes(field.label.toLowerCase())
                );
                if (match) newMapping[field.key] = match;
            });
            setMapping(newMapping);
            setStep(2);
        }
    });
  };

  const handleImport = async () => {
      if (!file) return;
      setStep(3);
      
      Papa.parse(file, {
          header: true,
          skipEmptyLines: true,
          complete: async (results) => {
             const mappedData = results.data.map((row: any) => {
                 const newRow: any = { status: 'new', source: 'import' };
                 Object.entries(mapping).forEach(([sysKey, csvHeader]) => {
                     if (csvHeader) newRow[sysKey] = row[csvHeader];
                 });
                 return newRow;
             }).filter(r => r.email && r.name); // Basic validation

             setStats({ total: mappedData.length, success: 0, failed: 0 });

             try {
                // Batch import or single? Let's do batch for speed if API supports it (Implemented bulk in POST)
                const res = await fetch('/api/v1/leads', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(mappedData)
                });
                
                if (res.ok) {
                    const json = await res.json();
                    setStats({ 
                        total: mappedData.length, 
                        success: Array.isArray(json.data) ? json.data.length : mappedData.length,
                        failed: 0 
                    });
                } else {
                    setStats({ total: mappedData.length, success: 0, failed: mappedData.length });
                }
             } catch (e) {
                 console.error(e);
                 setStats({ total: mappedData.length, success: 0, failed: mappedData.length });
             }
             setStep(4);
          }
      });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
       <div>
          <h2 className="text-3xl font-bold tracking-tight">Import Leads</h2>
          <p className="text-muted-foreground mt-1">Upload a CSV file to bulk import leads.</p>
       </div>

       {/* Steps */}
       <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <span className={step >= 1 ? "text-primary" : ""}>1. Upload</span>
          <ArrowRight className="h-4 w-4" />
          <span className={step >= 2 ? "text-primary" : ""}>2. Map Columns</span>
          <ArrowRight className="h-4 w-4" />
          <span className={step >= 3 ? "text-primary" : ""}>3. Import</span>
       </div>

       <div className="rounded-xl border border-border bg-card shadow-sm p-8">
          {step === 1 && (
             <div className="flex flex-col items-center justify-center p-12 border-2 border-dashed border-border rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
                <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg">Upload CSV File</h3>
                <p className="text-muted-foreground text-sm mb-6">Drag and drop or click to browse</p>
                <input 
                    type="file" 
                    accept=".csv"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    onChange={handleFileUpload}
                />
                <button className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground pointer-events-none">
                    Select File
                </button>
             </div>
          )}

          {step === 2 && (
              <div className="space-y-6">
                 <div>
                    <h3 className="font-semibold mb-4">Map Columns</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {SYSTEM_FIELDS.map((field) => (
                            <div key={field.key} className="space-y-1">
                                <label className="text-sm font-medium flex items-center gap-1">
                                    {field.label}
                                    {field.required && <span className="text-destructive">*</span>}
                                </label>
                                <select 
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                                    value={mapping[field.key] || ''}
                                    onChange={(e) => setMapping({...mapping, [field.key]: e.target.value})}
                                >
                                    <option value="">Do not import</option>
                                    {headers.map(h => (
                                        <option key={h} value={h}>{h}</option>
                                    ))}
                                </select>
                            </div>
                        ))}
                    </div>
                 </div>

                 {/* Preview */}
                 <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted px-4 py-2 text-xs font-semibold uppercase text-muted-foreground">Preview (First 5 Rows)</div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left">
                            <thead className="bg-muted/50">
                                <tr>
                                    {Object.keys(mapping).map(k => (
                                        <th key={k} className="px-4 py-2 font-medium whitespace-nowrap">{SYSTEM_FIELDS.find(f => f.key === k)?.label}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {previewData.map((row, i) => (
                                    <tr key={i}>
                                        {Object.keys(mapping).map(k => (
                                            <td key={k} className="px-4 py-2 whitespace-nowrap truncate max-w-[150px]">
                                                {row[mapping[k]] || '-'}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                 </div>

                 <div className="flex justify-end gap-3">
                     <button onClick={() => setStep(1)} className="px-4 py-2 text-sm font-medium hover:underline">Back</button>
                     <button 
                        onClick={handleImport}
                        className="rounded-lg bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
                     >
                        Run Import
                     </button>
                 </div>
              </div>
          )}

          {step === 3 && (
              <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                  <h3 className="font-semibold text-lg">Importing Leads...</h3>
                  <p className="text-muted-foreground text-sm">Please wait while we process your file.</p>
              </div>
          )}

          {step === 4 && (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center text-green-500 mb-4">
                      <CheckCircle className="h-6 w-6" />
                  </div>
                  <h3 className="font-semibold text-lg">Import Complete</h3>
                  <div className="flex gap-8 mt-6">
                      <div className="text-center">
                          <p className="text-2xl font-bold">{stats.success}</p>
                          <p className="text-xs text-muted-foreground uppercase">Imported</p>
                      </div>
                      <div className="text-center">
                          <p className="text-2xl font-bold text-destructive">{stats.failed}</p>
                          <p className="text-xs text-muted-foreground uppercase">Failed</p>
                      </div>
                  </div>
                  <div className="mt-8 flex gap-3">
                     <button onClick={() => setStep(1)} className="rounded-lg border border-input px-4 py-2 text-sm font-medium hover:bg-secondary">
                        Import Another
                     </button>
                     <button onClick={() => router.push('/leads')} className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                        View Leads
                     </button>
                  </div>
              </div>
          )}
       </div>
    </div>
  );
}
