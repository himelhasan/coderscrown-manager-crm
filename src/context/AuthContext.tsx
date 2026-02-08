'use client';

import { auth } from '@/lib/firebase';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: FirebaseUser | null;
  role: 'admin' | 'moderator' | 'client' | null;
  loading: boolean;
  userProfile: any | null; // MongoDB user doc
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  userProfile: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [role, setRole] = useState<'admin' | 'moderator' | 'client' | null>(null);
  const [userProfile, setUserProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // 1. Safety Timeout: If Firebase doesn't respond in 2s, stop loading.
    const timer = setTimeout(() => {
        setLoading((current) => {
            if (current) {
                console.warn('Auth check timed out. Defaulting to logged out.');
                return false;
            }
            return current;
        });
    }, 2000);

    // 2. Check if auth is initialized
    if (!auth) {
        setLoading(false);
        return () => clearTimeout(timer);
    }

    // 3. Auth State Observer
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timer); // Clear timeout if we get a response
      setUser(firebaseUser);
      if (firebaseUser) {
        // Fetch role from MongoDB
        try {
            // We can fetch user using ID to avoid verifying token if we want to be faster, 
            // but relying on token is better.
            // For now, let's just use the ID from firebaseUser.
            const res = await fetch('/api/v1/users/me', {
                headers: { 
                    'Authorization': `Bearer ${await firebaseUser.getIdToken()}`,
                    'X-User-UID': firebaseUser.uid
                }
            });
            if (res.ok) {
                const data = await res.json();
                setRole(data.user.role || 'client');
                setUserProfile(data.user);
            } else if (res.status === 404) {
                 setUserProfile(null); 
            }
        } catch (e) {
            console.error('Failed to fetch user profile', e);
        }
      } else {
        setRole(null);
        setUserProfile(null);
      }
      setLoading(false);
    });
    return () => {
        unsubscribe();
        clearTimeout(timer);
    };
  }, []);

  // Protection & Redirection Effect
  useEffect(() => {
     if (loading) return;

     const isPublic = pathname === '/login' || pathname === '/signup';
     const isOnboarding = pathname === '/onboarding';

     if (!user && !isPublic) {
         router.push('/login');
     } else if (user) {
         if (!userProfile && !isOnboarding) {
             // User logged in but no mongo profile -> Onboarding
             // Check if we already tried fetching (role === null)
             // We need to be careful not to redirect before the fetch completes
             // The 'loading' state handles the initial load. 
             // If loading is false, user is true, and userProfile is null => Onboarding needed.
             router.push('/onboarding');
         } else if (userProfile && (isPublic || isOnboarding)) {
             // User has profile but is on public/onboarding pages -> Dashboard
             router.push('/');
         }
     }
  }, [user, userProfile, loading, pathname, router]);


  return (
    <AuthContext.Provider value={{ user, role, loading, userProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
