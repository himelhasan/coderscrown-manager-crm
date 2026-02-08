'use client';

import { useAuth } from '@/context/AuthContext';
import { auth } from '@/lib/firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [loggingIn, setLoggingIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
        router.push('/');
    }
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setLoggingIn(true);
    setError(null);
    try {
        if (!auth) {
            throw new Error('Firebase Auth is not initialized. Please check your configuration.');
        }
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
        // On success, AuthContext will update and trigger redirect
    } catch (e: any) {
        setError(e.message);
        setLoggingIn(false);
    }
  };

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
      );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
       <div className="w-full max-w-sm space-y-8 text-center">
           <div>
               <h2 className="mt-6 text-3xl font-bold tracking-tight">Sign in to your account</h2>
               <p className="mt-2 text-sm text-muted-foreground">Or sign up for a new account</p>
           </div>

           {error && (
               <div className="bg-destructive/10 p-3 rounded text-destructive text-sm">
                   {error}
               </div>
           )}
           
           {!auth && (
               <div className="bg-yellow-500/10 p-3 rounded text-yellow-500 text-sm border border-yellow-500/20">
                   Firebase configuration is missing or invalid. Please check your .env.local file.
               </div>
           )}

           <button
             onClick={handleGoogleLogin}
             disabled={loggingIn || !auth}
             className="flex w-full items-center justify-center gap-3 rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-muted transition-colors disabled:opacity-50"
           >
               {loggingIn ? (
                   <Loader2 className="h-4 w-4 animate-spin" />
               ) : (
                   <svg className="h-4 w-4" viewBox="0 0 24 24">
                       <path
                           d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                           fill="#4285F4"
                       />
                       <path
                           d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                           fill="#34A853"
                       />
                       <path
                           d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                           fill="#FBBC05"
                       />
                       <path
                           d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                           fill="#EA4335"
                       />
                   </svg>
               )}
               Sign in with Google
           </button>
           
           <div className="relative">
               <div className="absolute inset-0 flex items-center">
                   <span className="w-full border-t border-muted"></span>
               </div>
               <div className="relative flex justify-center text-xs uppercase">
                   <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
               </div>
           </div>

           {/* Email/Password form placeholder - for brevity focusing on Google per request context imply simplicity, but adding TODO */}
           <div className="space-y-4">
               <input 
                 type="email" 
                 placeholder="name@example.com" 
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 disabled 
               />
               <input 
                 type="password" 
                 placeholder="Password" 
                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                 disabled
               />
               <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-full" disabled>
                   Sign In (Coming Soon)
               </button>
           </div>
       </div>
    </div>
  );
}
