'use client';

import { useAuth } from '@/context/AuthContext';
import { Loader2, Shield, ShieldAlert, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function UsersPage() {
  const { user, role, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      if (!authLoading) {
          if (role !== 'admin') {
              router.push('/');
              return;
          }
          fetchUsers();
      }
  }, [role, authLoading, router]);

  const fetchUsers = async () => {
      try {
          // We need to pass auth token
          if (!user) return;
          const token = await user.getIdToken();
          const res = await fetch('/api/v1/users', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.ok) {
              const data = await res.json();
              setUsers(data.data);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const updateUserRole = async (userId: string, newRole: string) => {
      try {
          if (!user) return;
          const token = await user.getIdToken();
          await fetch('/api/v1/users', {
              method: 'PUT',
              headers: { 
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json' 
              },
              body: JSON.stringify({ userId, role: newRole })
          });
          // Optimistic update or refetch
          setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
      } catch (e) {
          console.error(e);
      }
  };

  if (authLoading || loading) {
       return (
           <div className="flex h-screen items-center justify-center">
               <Loader2 className="h-8 w-8 animate-spin text-primary" />
           </div>
       );
   }

  return (
    <div className="space-y-6">
        <div>
            <h2 className="text-3xl font-bold tracking-tight">User Management</h2>
            <p className="text-muted-foreground mt-1">Manage system access and user roles.</p>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
             <table className="w-full text-left text-sm">
                 <thead className="bg-muted/50 text-muted-foreground">
                     <tr>
                         <th className="px-6 py-3 font-medium">User</th>
                         <th className="px-6 py-3 font-medium">Email</th>
                         <th className="px-6 py-3 font-medium">Company</th>
                         <th className="px-6 py-3 font-medium">Role</th>
                         <th className="px-6 py-3 font-medium text-right">Actions</th>
                     </tr>
                 </thead>
                 <tbody className="divide-y divide-border">
                     {users.map((u) => (
                         <tr key={u._id} className="hover:bg-muted/50 transition-colors">
                             <td className="px-6 py-4 font-medium flex items-center gap-3">
                                 {u.photoURL ? (
                                     <img src={u.photoURL} alt="" className="h-8 w-8 rounded-full" />
                                 ) : (
                                     <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                         {(u.displayName || u.email || 'U')[0].toUpperCase()}
                                     </div>
                                 )}
                                 {u.displayName || 'No Name'}
                             </td>
                             <td className="px-6 py-4 text-muted-foreground">{u.email}</td>
                             <td className="px-6 py-4 text-muted-foreground">{u.company_name || '-'}</td>
                             <td className="px-6 py-4">
                                 <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium 
                                     ${u.role === 'admin' ? 'bg-red-500/10 text-red-500' : 
                                       u.role === 'moderator' ? 'bg-blue-500/10 text-blue-500' : 
                                       'bg-green-500/10 text-green-500'}`}>
                                     {u.role === 'admin' && <ShieldAlert className="h-3 w-3" />}
                                     {u.role === 'moderator' && <ShieldCheck className="h-3 w-3" />}
                                     {u.role === 'client' && <Shield className="h-3 w-3" />}
                                     {u.role.toUpperCase()}
                                 </span>
                             </td>
                             <td className="px-6 py-4 text-right">
                                 <select 
                                     value={u.role}
                                     onChange={(e) => updateUserRole(u._id, e.target.value)}
                                     className="text-xs border rounded px-2 py-1 bg-background"
                                 >
                                     <option value="client">Client</option>
                                     <option value="moderator">Moderator</option>
                                     <option value="admin">Admin</option>
                                 </select>
                             </td>
                         </tr>
                     ))}
                 </tbody>
             </table>
        </div>
    </div>
  );
}
